"""
Campaign routes — CRUD, sequences, leads, schedule, analytics, email accounts.
"""

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import Any

from api.middleware.auth import require_active_subscription, log_action
from api.models import UserContext, CreateCampaignRequest, UpdateCampaignStatusRequest
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def get_sl(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


class SaveSequenceRequest(BaseModel):
    sequences: list[dict[str, Any]]


class UpdateScheduleRequest(BaseModel):
    timezone: str = "America/New_York"
    days_of_the_week: list[int] = [1, 2, 3, 4, 5]
    start_hour: str = "09:00"
    end_hour: str = "17:00"
    min_time_btw_emails: int = 10
    max_new_leads_per_day: int = 50


class UpdateSettingsRequest(BaseModel):
    track_opens: bool = True
    track_clicks: bool = True
    stop_on_reply: bool = True
    stop_on_auto_reply: bool = False
    send_as_plain_text: bool = False
    unsubscribe_text: str = ""


class BulkLeadActionRequest(BaseModel):
    lead_ids: list[int]
    action: str  # pause | resume | delete | categorize


# ─── Campaign CRUD ────────────────────────────────────────────────────────────

@router.get("")
async def list_campaigns(user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.list_campaigns(client_id=user.client_id)


@router.post("")
async def create_campaign(
    body: CreateCampaignRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.create_campaign(name=body.name, client_id=user.client_id)
    await log_action(request, user, "campaign.create", "campaign", str(result.get("id", "")), {"name": body.name})
    return result


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.get_campaign_by_id(campaign_id)


@router.post("/{campaign_id}/status")
async def update_campaign_status(
    campaign_id: int,
    body: UpdateCampaignStatusRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.patch_campaign_status(campaign_id, body.status.value)
    await log_action(request, user, "campaign.status_change", "campaign", str(campaign_id), {"status": body.status.value})
    return result


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.delete_campaign(campaign_id)
    await log_action(request, user, "campaign.delete", "campaign", str(campaign_id))
    return result


# ─── Sequences ────────────────────────────────────────────────────────────────

@router.get("/{campaign_id}/sequences")
async def get_sequences(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.get_campaign_sequences(campaign_id)


@router.post("/{campaign_id}/sequences")
async def save_sequences(
    campaign_id: int,
    body: SaveSequenceRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.save_campaign_sequence(campaign_id, body.sequences)
    await log_action(request, user, "campaign.sequence_save", "campaign", str(campaign_id), {"steps": len(body.sequences)})
    return result


# ─── Schedule & Settings ──────────────────────────────────────────────────────

@router.post("/{campaign_id}/schedule")
async def update_schedule(
    campaign_id: int,
    body: UpdateScheduleRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.update_campaign_schedule(campaign_id, body.model_dump())
    await log_action(request, user, "campaign.schedule_update", "campaign", str(campaign_id))
    return result


@router.post("/{campaign_id}/settings")
async def update_settings(
    campaign_id: int,
    body: UpdateSettingsRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.update_campaign_settings(campaign_id, body.model_dump())
    await log_action(request, user, "campaign.settings_update", "campaign", str(campaign_id))
    return result


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/{campaign_id}/analytics")
async def get_campaign_analytics(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.get_campaign_analytics(campaign_id)


# ─── Leads ───────────────────────────────────────────────────────────────────

@router.get("/{campaign_id}/leads")
async def list_campaign_leads(
    campaign_id: int,
    offset: int = 0,
    limit: int = 50,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.list_leads_by_campaign(campaign_id, offset=offset, limit=limit)


@router.post("/{campaign_id}/leads")
async def add_leads_to_campaign(
    campaign_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    body = await request.json()
    sl = get_sl(user)
    result = await sl.add_leads_to_campaign(campaign_id, body.get("leads", []))
    await log_action(request, user, "campaign.leads_add", "campaign", str(campaign_id), {"count": len(body.get("leads", []))})
    return result


@router.post("/{campaign_id}/leads/bulk-action")
async def bulk_lead_action(
    campaign_id: int,
    body: BulkLeadActionRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.bulk_action_leads(campaign_id, body.lead_ids, body.action)
    await log_action(request, user, f"campaign.leads_{body.action}", "campaign", str(campaign_id), {"count": len(body.lead_ids)})
    return result


# ─── Email Accounts ───────────────────────────────────────────────────────────

@router.get("/{campaign_id}/email-accounts")
async def list_campaign_email_accounts(campaign_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.list_email_accounts_by_campaign(campaign_id)


@router.post("/{campaign_id}/email-accounts")
async def add_email_account_to_campaign(
    campaign_id: int,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    body = await request.json()
    sl = get_sl(user)
    return await sl.add_email_account_to_campaign(campaign_id, body["email_account_id"])


@router.delete("/{campaign_id}/email-accounts/{account_id}")
async def remove_email_account_from_campaign(
    campaign_id: int,
    account_id: int,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.remove_email_account_from_campaign(campaign_id, account_id)
