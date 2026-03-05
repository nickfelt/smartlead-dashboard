"""
Settings routes — AI key management (save, mask, test), subscription info.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from api.middleware.auth import get_current_user, log_action
from api.models import UserContext, AIProvider
from api.config import get_settings
from api.encryption import encrypt_value, decrypt_value, mask_key

router = APIRouter(prefix="/settings", tags=["settings"])

# Simple in-memory store for mock mode (per-process; resets on cold start)
_mock_keys: dict[str, dict[str, str]] = {}


class SaveKeysRequest(BaseModel):
    provider: AIProvider
    key: str


class TestKeyRequest(BaseModel):
    provider: AIProvider


# ─── GET /api/settings/ai-keys ───────────────────────────────────────────────

@router.get("/ai-keys")
async def get_ai_keys(user: UserContext = Depends(get_current_user)):
    """Return which AI keys are configured (masked). Never returns full key."""
    settings = get_settings()

    if settings.use_mock:
        stored = _mock_keys.get(user.user_id, {})
        return {
            "anthropic": {
                "configured": "anthropic" in stored,
                "masked": mask_key(stored["anthropic"]) if "anthropic" in stored else None,
            },
            "openai": {
                "configured": "openai" in stored,
                "masked": mask_key(stored["openai"]) if "openai" in stored else None,
            },
        }

    try:
        from api.supabase_client import get_supabase
        sb = get_supabase()
        resp = sb.table("users").select("anthropic_api_key, openai_api_key").eq("id", user.user_id).single().execute()
        p = resp.data

        anthropic_enc = p.get("anthropic_api_key")
        openai_enc    = p.get("openai_api_key")

        def _masked(enc: Optional[str]):
            if not enc:
                return {"configured": False, "masked": None}
            try:
                plain = decrypt_value(enc)
                return {"configured": True, "masked": mask_key(plain)}
            except Exception:
                return {"configured": True, "masked": "sk-...????"}

        return {"anthropic": _masked(anthropic_enc), "openai": _masked(openai_enc)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── POST /api/settings/ai-keys ──────────────────────────────────────────────

@router.post("/ai-keys")
async def save_ai_key(
    body: SaveKeysRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
):
    """Save/replace an AI API key (encrypted at rest). Key is never logged."""
    settings = get_settings()

    # Basic format validation
    key = body.key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="Key cannot be empty")
    if body.provider == AIProvider.claude and not key.startswith("sk-ant-"):
        raise HTTPException(status_code=400, detail="Anthropic keys must start with sk-ant-")
    if body.provider == AIProvider.openai and not key.startswith("sk-"):
        raise HTTPException(status_code=400, detail="OpenAI keys must start with sk-")

    if settings.use_mock:
        if user.user_id not in _mock_keys:
            _mock_keys[user.user_id] = {}
        _mock_keys[user.user_id][body.provider.value] = key
        await log_action(request, user, f"settings.ai_key_saved", "settings", body.provider.value)
        return {"ok": True, "provider": body.provider.value, "masked": mask_key(key)}

    try:
        from api.supabase_client import get_supabase
        sb = get_supabase()
        field = "anthropic_api_key" if body.provider == AIProvider.claude else "openai_api_key"
        encrypted = encrypt_value(key)
        sb.table("users").update({field: encrypted}).eq("id", user.user_id).execute()
        await log_action(request, user, "settings.ai_key_saved", "settings", body.provider.value)
        return {"ok": True, "provider": body.provider.value, "masked": mask_key(key)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── POST /api/settings/ai-keys/test ─────────────────────────────────────────

@router.post("/ai-keys/test")
async def test_ai_key(
    body: TestKeyRequest,
    user: UserContext = Depends(get_current_user),
):
    """Test an AI key by making a minimal API call. Returns ok/error."""
    settings = get_settings()

    # Retrieve the key
    if settings.use_mock:
        stored = _mock_keys.get(user.user_id, {})
        if body.provider.value not in stored:
            raise HTTPException(status_code=400, detail=f"No {body.provider.value} key configured. Save one first.")
        return {"ok": True, "provider": body.provider.value, "message": "Key is valid (mock)", "mock": True}

    # Real: decrypt stored key then make a minimal API call
    try:
        from api.supabase_client import get_supabase
        sb = get_supabase()
        resp = sb.table("users").select("anthropic_api_key, openai_api_key").eq("id", user.user_id).single().execute()
        p = resp.data

        if body.provider == AIProvider.claude:
            enc = p.get("anthropic_api_key")
            if not enc:
                raise HTTPException(status_code=400, detail="No Anthropic key configured")
            plain = decrypt_value(enc)

            import anthropic
            client = anthropic.Anthropic(api_key=plain)
            client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=5,
                messages=[{"role": "user", "content": "Hi"}],
            )
            return {"ok": True, "provider": "anthropic", "message": "Anthropic key is valid"}

        else:
            enc = p.get("openai_api_key")
            if not enc:
                raise HTTPException(status_code=400, detail="No OpenAI key configured")
            plain = decrypt_value(enc)

            import openai
            client = openai.OpenAI(api_key=plain)
            client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=5,
                messages=[{"role": "user", "content": "Hi"}],
            )
            return {"ok": True, "provider": "openai", "message": "OpenAI key is valid"}

    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        # Surface auth errors clearly
        if "invalid_api_key" in msg or "Authentication" in msg or "Unauthorized" in msg:
            return {"ok": False, "provider": body.provider.value, "message": "Invalid API key — check the key and try again"}
        if "rate_limit" in msg.lower():
            return {"ok": False, "provider": body.provider.value, "message": "Rate limited — key works but you've hit your limit"}
        raise HTTPException(status_code=500, detail=f"Key test failed: {msg}")
