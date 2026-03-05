"""
Settings routes — AI key management, subscription info. Full implementation in Phase 2.
"""

from fastapi import APIRouter, Depends, Request
from api.middleware.auth import get_current_user, log_action
from api.models import UserContext
from api.config import get_settings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/ai-keys")
async def get_ai_keys(user: UserContext = Depends(get_current_user)):
    """Return which AI keys are configured (masked, never full)."""
    return {
        "anthropic": {"configured": True, "masked": "sk-ant-...7xB2"} if user.user_id == "mock-user-001" else {"configured": False},
        "openai": {"configured": False},
    }


@router.post("/ai-keys")
async def save_ai_keys(
    request: Request,
    user: UserContext = Depends(get_current_user),
):
    """Save/update AI API keys (encrypted at rest). Phase 2 implementation."""
    body = await request.json()
    settings = get_settings()

    if settings.use_mock:
        return {"ok": True, "message": "AI key saved (mock — no real encryption in Phase 1)"}

    # Phase 2: encrypt and store in Supabase users table
    raise NotImplementedError("Real AI key storage requires Phase 2")


@router.post("/ai-keys/test")
async def test_ai_key(
    request: Request,
    user: UserContext = Depends(get_current_user),
):
    """Test an AI API key by making a minimal completion call."""
    body = await request.json()
    settings = get_settings()

    if settings.use_mock:
        provider = body.get("provider", "claude")
        return {"ok": True, "provider": provider, "message": "Key is valid (mock)", "mock": True}

    # Phase 2: make real minimal API call to validate the key
    raise NotImplementedError("Real key testing requires Phase 2")
