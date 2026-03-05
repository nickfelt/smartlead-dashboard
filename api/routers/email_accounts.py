"""
Email account routes — CRUD, warmup management, Smart Senders mailbox purchasing.
"""

from fastapi import APIRouter, Depends, Request, HTTPException
from api.middleware.auth import require_active_subscription, log_action
from api.models import (
    UserContext, CreateEmailAccountRequest, UpdateEmailAccountRequest,
    UpdateWarmupRequest, SmartSenderOrderRequest,
)
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/email-accounts", tags=["email-accounts"])


def get_sl(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


# ─── Account CRUD ─────────────────────────────────────────────────────────────

@router.get("")
async def list_email_accounts(user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.list_all_email_accounts()


@router.post("")
async def create_email_account(
    body: CreateEmailAccountRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.create_email_account(body.model_dump())
    await log_action(request, user, "email_account.create", "email_account", str(result.get("id", "")), {"email": body.email})
    return result


@router.get("/{account_id}")
async def get_email_account(account_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.get_email_account_by_id(account_id)


@router.patch("/{account_id}")
async def update_email_account(
    account_id: int,
    body: UpdateEmailAccountRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await sl.update_email_account(account_id, updates)
    await log_action(request, user, "email_account.update", "email_account", str(account_id), updates)
    return result


@router.delete("/{account_id}")
async def delete_email_account(
    account_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.delete_email_account(account_id)
    await log_action(request, user, "email_account.delete", "email_account", str(account_id))
    return result


# ─── Warmup ───────────────────────────────────────────────────────────────────

@router.get("/{account_id}/warmup-stats")
async def get_warmup_stats(account_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.get_email_account_warmup_stats(account_id)


@router.post("/{account_id}/warmup")
async def update_warmup(
    account_id: int,
    body: UpdateWarmupRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.update_email_account_warmup(account_id, body.model_dump())
    await log_action(request, user, "email_account.warmup_update", "email_account", str(account_id),
                     {"enabled": body.warmup_enabled})
    return result


# ─── Smart Senders ────────────────────────────────────────────────────────────

def _require_mailbox_tier(user: UserContext) -> None:
    """Enforce can_purchase_mailboxes tier gate (pro/enterprise only in prod)."""
    # In mock mode this is always allowed; real check would query subscription tier config
    settings = get_settings()
    if not settings.use_mock and user.subscription_tier.value not in ("pro", "enterprise"):
        raise HTTPException(status_code=403, detail="Mailbox purchasing requires Pro or Enterprise plan")


@router.get("/smart-senders/domains")
async def list_smart_sender_domains(user: UserContext = Depends(require_active_subscription)):
    _require_mailbox_tier(user)
    sl = get_sl(user)
    return await sl.get_domain_list()


@router.post("/smart-senders/search")
async def search_domain(
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    _require_mailbox_tier(user)
    body = await request.json()
    domain = body.get("domain", "").strip()
    if not domain:
        raise HTTPException(status_code=400, detail="domain is required")
    sl = get_sl(user)
    return await sl.search_domain(domain)


@router.get("/smart-senders/vendors")
async def get_vendors(user: UserContext = Depends(require_active_subscription)):
    _require_mailbox_tier(user)
    sl = get_sl(user)
    return await sl.get_vendors()


@router.post("/smart-senders/order")
async def place_order(
    body: SmartSenderOrderRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    _require_mailbox_tier(user)
    sl = get_sl(user)
    result = await sl.place_order(body.model_dump())
    await log_action(request, user, "smart_senders.order", "domain", body.domain,
                     {"vendor_id": body.vendor_id, "count": body.mailbox_count})
    return result
