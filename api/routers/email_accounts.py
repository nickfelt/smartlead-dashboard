"""
Email account routes. Full implementation in Phase 5.
"""

from fastapi import APIRouter, Depends, Request
from api.middleware.auth import get_current_user, require_active_subscription, log_action
from api.models import UserContext, CreateEmailAccountRequest
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/email-accounts", tags=["email-accounts"])


def get_smartlead(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


@router.get("")
async def list_email_accounts(user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.list_all_email_accounts()


@router.post("")
async def create_email_account(
    body: CreateEmailAccountRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    account_data = body.model_dump()
    result = await sl.create_email_account(account_data)
    await log_action(request, user, "email_account.create", "email_account", str(result.get("id", "")), {"email": body.email})
    return result


@router.get("/{account_id}/warmup-stats")
async def get_warmup_stats(account_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.get_email_account_warmup_stats(account_id)


@router.post("/{account_id}/warmup")
async def update_warmup(
    account_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    body = await request.json()
    sl = get_smartlead(user)
    result = await sl.update_email_account_warmup(account_id, body)
    await log_action(request, user, "email_account.warmup_update", "email_account", str(account_id))
    return result
