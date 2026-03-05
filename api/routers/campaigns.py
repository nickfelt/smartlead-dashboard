"""
Campaign routes — CRUD for campaigns, sequences, leads, analytics.
Full implementation in Phase 4.
"""

from fastapi import APIRouter, Depends, Request
from api.middleware.auth import get_current_user, require_active_subscription, log_action
from api.models import UserContext, CreateCampaignRequest, UpdateCampaignStatusRequest
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def get_smartlead(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


@router.get("")
async def list_campaigns(user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.list_campaigns(client_id=user.client_id)


@router.post("")
async def create_campaign(
    body: CreateCampaignRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    result = await sl.create_campaign(name=body.name, client_id=user.client_id)
    await log_action(request, user, "campaign.create", "campaign", str(result.get("id", "")), {"name": body.name})
    return result


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.get_campaign_by_id(campaign_id)


@router.post("/{campaign_id}/status")
async def update_campaign_status(
    campaign_id: int,
    body: UpdateCampaignStatusRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    result = await sl.patch_campaign_status(campaign_id, body.status.value)
    await log_action(request, user, "campaign.status_change", "campaign", str(campaign_id), {"status": body.status.value})
    return result


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    result = await sl.delete_campaign(campaign_id)
    await log_action(request, user, "campaign.delete", "campaign", str(campaign_id))
    return result


@router.get("/{campaign_id}/analytics")
async def get_campaign_analytics(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.get_campaign_analytics(campaign_id)


@router.get("/{campaign_id}/leads")
async def list_campaign_leads(
    campaign_id: int,
    offset: int = 0,
    limit: int = 100,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    return await sl.list_leads_by_campaign(campaign_id, offset=offset, limit=limit)


@router.post("/{campaign_id}/leads")
async def add_leads_to_campaign(
    campaign_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    body = await request.json()
    sl = get_smartlead(user)
    result = await sl.add_leads_to_campaign(campaign_id, body.get("leads", []))
    await log_action(request, user, "campaign.leads_add", "campaign", str(campaign_id), {"count": len(body.get("leads", []))})
    return result


@router.get("/{campaign_id}/email-accounts")
async def list_campaign_email_accounts(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_smartlead(user)
    return await sl.list_email_accounts_by_campaign(campaign_id)


@router.post("/{campaign_id}/email-accounts")
async def add_email_account_to_campaign(
    campaign_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    body = await request.json()
    sl = get_smartlead(user)
    return await sl.add_email_account_to_campaign(campaign_id, body["email_account_id"])


@router.delete("/{campaign_id}/email-accounts/{account_id}")
async def remove_email_account_from_campaign(
    campaign_id: int,
    account_id: int,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_smartlead(user)
    return await sl.remove_email_account_from_campaign(campaign_id, account_id)
