"""
Master Inbox routes — all endpoints proxy to Smartlead, scoped to the client.
"""

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import Optional

from api.middleware.auth import require_active_subscription, log_action
from api.models import UserContext, LeadCategory
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/inbox", tags=["inbox"])


def get_sl(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


# ─── Request models ───────────────────────────────────────────────────────────

class ReplyRequest(BaseModel):
    lead_id: int
    campaign_id: int
    email_body: str
    email_account_id: int


class ReadStatusRequest(BaseModel):
    email_id: int
    is_read: bool


class ImportantRequest(BaseModel):
    email_id: int
    is_important: bool


class ArchiveRequest(BaseModel):
    email_id: int
    is_archived: bool


class CategoryRequest(BaseModel):
    lead_id: int
    campaign_id: int
    category: LeadCategory


class ReminderRequest(BaseModel):
    lead_id: int
    remind_at: str  # ISO datetime string


class NoteRequest(BaseModel):
    lead_id: int
    note: str


class TaskRequest(BaseModel):
    lead_id: int
    task: str
    due_date: Optional[str] = None


class BlockRequest(BaseModel):
    domains: list[str]


class ForwardRequest(BaseModel):
    email_id: int
    forward_to: str


# ─── List endpoints ───────────────────────────────────────────────────────────

@router.post("/replies")
async def fetch_replies(
    offset: int = 0,
    limit: int = 20,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.fetch_inbox_replies(offset=offset, limit=limit, client_id=user.client_id)


@router.post("/unread")
async def fetch_unread(
    offset: int = 0,
    limit: int = 20,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.fetch_unread_replies(offset=offset, limit=limit, client_id=user.client_id)


@router.post("/snoozed")
async def fetch_snoozed(
    offset: int = 0,
    limit: int = 20,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.fetch_snoozed_messages(offset=offset, limit=limit, client_id=user.client_id)


@router.post("/important")
async def fetch_important(
    offset: int = 0,
    limit: int = 20,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.fetch_important_marked_messages(offset=offset, limit=limit, client_id=user.client_id)


@router.post("/archived")
async def fetch_archived(
    offset: int = 0,
    limit: int = 20,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.fetch_archived_messages(offset=offset, limit=limit, client_id=user.client_id)


# ─── Thread ───────────────────────────────────────────────────────────────────

@router.get("/lead/{lead_id}/thread")
async def get_lead_thread(
    lead_id: int,
    campaign_id: int,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.get_lead_thread(lead_id, campaign_id)


@router.get("/lead/{lead_id}")
async def get_lead(lead_id: int, user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)
    return await sl.fetch_master_inbox_lead_by_id(lead_id)


# ─── Actions ─────────────────────────────────────────────────────────────────

@router.post("/reply")
async def reply_to_lead(
    body: ReplyRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
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
    body: ReadStatusRequest,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.mark_read(email_id=body.email_id, is_read=body.is_read)


@router.patch("/important")
async def update_important(
    body: ImportantRequest,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    return await sl.mark_important(email_id=body.email_id, is_important=body.is_important)


@router.patch("/archive")
async def update_archive(
    body: ArchiveRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.mark_archived(email_id=body.email_id, is_archived=body.is_archived)
    await log_action(request, user, "inbox.archive", "email", str(body.email_id))
    return result


@router.patch("/category")
async def update_category(
    body: CategoryRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.update_lead_category(
        lead_id=body.lead_id,
        campaign_id=body.campaign_id,
        category=body.category.value,
    )
    await log_action(request, user, "inbox.category_change", "lead", str(body.lead_id), {"category": body.category.value})
    return result


@router.post("/reminder")
async def set_reminder(
    body: ReminderRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.set_reminder(lead_id=body.lead_id, remind_at=body.remind_at)
    await log_action(request, user, "inbox.reminder_set", "lead", str(body.lead_id), {"remind_at": body.remind_at})
    return result


@router.post("/note")
async def create_note(
    body: NoteRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.create_lead_note(lead_id=body.lead_id, note=body.note)
    await log_action(request, user, "inbox.note_created", "lead", str(body.lead_id))
    return result


@router.post("/task")
async def create_task(
    body: TaskRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.create_lead_task(lead_id=body.lead_id, task=body.task, due_date=body.due_date)
    await log_action(request, user, "inbox.task_created", "lead", str(body.lead_id))
    return result


@router.post("/block")
async def block_domain(
    body: BlockRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.block_domains(domains=body.domains)
    await log_action(request, user, "inbox.domain_blocked", "domain", ",".join(body.domains))
    return result


@router.post("/forward")
async def forward_reply(
    body: ForwardRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    sl = get_sl(user)
    result = await sl.forward_reply(email_id=body.email_id, forward_to=body.forward_to)
    await log_action(request, user, "inbox.forwarded", "email", str(body.email_id), {"to": body.forward_to})
    return result
