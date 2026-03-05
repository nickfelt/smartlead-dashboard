"""
Inbox routes — proxy to Smartlead Master Inbox.
Full implementation in Phase 3.
"""

from fastapi import APIRouter, Depends, Request
from api.middleware.auth import get_current_user, require_active_subscription, log_action
from api.models import UserContext, ReplyRequest, MarkReadRequest
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/inbox", tags=["inbox"])


def get_smartlead(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


@router.post("/replies")
async def fetch_replies(
    request: Request,
    offset: int = 0,
    limit: int = 50,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    return await sl.fetch_inbox_replies(offset=offset, limit=limit, client_id=user.client_id)


@router.post("/unread")
async def fetch_unread(
    offset: int = 0,
    limit: int = 50,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    return await sl.fetch_unread_replies(offset=offset, limit=limit, client_id=user.client_id)


@router.get("/lead/{lead_id}")
async def get_lead(lead_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.fetch_master_inbox_lead_by_id(lead_id)


@router.post("/reply")
async def reply_to_lead(
    body: ReplyRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    result = await sl.reply_to_lead(
        lead_id=body.lead_id,
        campaign_id=body.campaign_id,
        email_body=body.email_body,
        email_account_id=body.email_account_id,
    )
    await log_action(request, user, "inbox.reply", "lead", str(body.lead_id), {"campaign_id": body.campaign_id})
    return result


@router.patch("/read-status")
async def update_read_status(
    body: MarkReadRequest,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    return await sl.mark_read(email_id=body.email_id, is_read=body.is_read)
