"""
Shared Pydantic models for API request/response validation.
"""

from datetime import datetime
from typing import Any, Optional
from enum import Enum
from pydantic import BaseModel, EmailStr


# ─── Enums ───────────────────────────────────────────────────────────────────

class SubscriptionTier(str, Enum):
    free = "free"
    starter = "starter"
    pro = "pro"
    enterprise = "enterprise"


class SubscriptionStatus(str, Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    trialing = "trialing"


class CampaignStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    STOPPED = "STOPPED"


class LeadCategory(str, Enum):
    Interested = "Interested"
    Not_Interested = "Not Interested"
    Meeting_Booked = "Meeting Booked"
    Out_of_Office = "Out of Office"
    Wrong_Person = "Wrong Person"
    Do_Not_Contact = "Do Not Contact"
    Uncategorized = "Uncategorized"


class AIProvider(str, Enum):
    claude = "claude"
    openai = "openai"


# ─── User ────────────────────────────────────────────────────────────────────

class UserContext(BaseModel):
    """Attached to every request by the auth middleware."""
    user_id: str
    email: str
    client_id: Optional[int] = None
    smartlead_api_key: Optional[str] = None  # decrypted, ephemeral
    subscription_tier: SubscriptionTier = SubscriptionTier.free
    subscription_status: SubscriptionStatus = SubscriptionStatus.active
    is_admin: bool = False


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: str
    smartlead_client_id: Optional[int] = None
    stripe_customer_id: Optional[str] = None
    subscription_tier: SubscriptionTier
    subscription_status: SubscriptionStatus
    is_admin: bool
    has_anthropic_key: bool
    has_openai_key: bool
    created_at: datetime
    updated_at: datetime


# ─── Subscription Tier Config ────────────────────────────────────────────────

class SubscriptionTierConfig(BaseModel):
    id: str
    name: SubscriptionTier
    stripe_price_id: str
    max_campaigns: int
    max_email_accounts: int
    max_leads_per_campaign: int
    max_emails_per_day: int
    ai_writer_enabled: bool
    can_purchase_mailboxes: bool
    price_monthly: int  # cents


# ─── Campaign ────────────────────────────────────────────────────────────────

class CampaignStats(BaseModel):
    total_sent: int
    total_opened: int
    total_replied: int
    total_bounced: int
    total_unsubscribed: int
    open_rate: float
    reply_rate: float
    bounce_rate: float


class Campaign(BaseModel):
    id: int
    name: str
    status: CampaignStatus
    leads_count: int
    created_at: str
    updated_at: str
    stats: CampaignStats


class CreateCampaignRequest(BaseModel):
    name: str


class UpdateCampaignStatusRequest(BaseModel):
    status: CampaignStatus


# ─── Sequences ───────────────────────────────────────────────────────────────

class SequenceVariant(BaseModel):
    subject: str
    body: str


class SequenceStep(BaseModel):
    seq_number: int
    seq_delay_details: dict[str, Any]
    variants: list[SequenceVariant]


# ─── Leads ───────────────────────────────────────────────────────────────────

class Lead(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    company_name: str
    title: str
    phone: str
    city: str
    state: str
    country: str
    website: str
    status: str
    category: LeadCategory
    last_activity: Optional[str] = None
    created_at: str


class AddLeadsRequest(BaseModel):
    leads: list[dict[str, Any]]


class UpdateLeadCategoryRequest(BaseModel):
    lead_id: int
    campaign_id: int
    category: LeadCategory


# ─── Email Accounts ───────────────────────────────────────────────────────────

class EmailAccount(BaseModel):
    id: int
    email: str
    from_name: str
    provider: str
    status: str
    messages_per_day: int
    warmup: dict[str, Any]
    tags: list[str]
    campaigns_attached: int
    created_at: str


class CreateEmailAccountRequest(BaseModel):
    email: str
    password: str
    smtp_host: str
    smtp_port: int
    smtp_encryption: str
    imap_host: str
    imap_port: int
    imap_encryption: str
    from_name: str
    messages_per_day: int = 50


class UpdateEmailAccountRequest(BaseModel):
    from_name: Optional[str] = None
    messages_per_day: Optional[int] = None
    tags: Optional[list[str]] = None


class UpdateWarmupRequest(BaseModel):
    warmup_enabled: bool
    warmup_limit: int = 30
    reply_rate_percent: int = 30
    warmup_increment: int = 3


class SmartSenderOrderRequest(BaseModel):
    domain: str
    vendor_id: int
    mailbox_count: int
    first_name: str
    last_name: str
    pattern: str = "first.last"


# ─── Inbox ───────────────────────────────────────────────────────────────────

class InboxMessage(BaseModel):
    id: int
    lead_id: int
    lead_email: str
    lead_name: str
    lead_company: str
    campaign_id: int
    campaign_name: str
    subject: str
    body: str
    is_read: bool
    is_important: bool
    is_snoozed: bool
    is_archived: bool
    category: str
    timestamp: str
    message_type: str


class ReplyRequest(BaseModel):
    lead_id: int
    campaign_id: int
    email_body: str
    email_account_id: int


class MarkReadRequest(BaseModel):
    email_id: int
    is_read: bool


# ─── AI ──────────────────────────────────────────────────────────────────────

class GenerateSequenceRequest(BaseModel):
    provider: AIProvider
    audience: str
    product: str
    tone: str
    steps: int
    goal: str


class GenerateVariantsRequest(BaseModel):
    provider: AIProvider
    existing_subject: str
    existing_body: str
    num_variants: int = 3


class RewriteRequest(BaseModel):
    provider: AIProvider
    text: str
    style: str  # "More concise" | "More casual" | "More formal" | "More urgent" | "Add social proof"


class SubjectLineRequest(BaseModel):
    provider: AIProvider
    email_body: str
    num_suggestions: int = 7


# ─── API Response Envelope ────────────────────────────────────────────────────

class ApiError(BaseModel):
    error: bool = True
    message: str
    code: str


class PaginatedResponse(BaseModel):
    data: list[Any]
    total: int
    offset: int
    limit: int
