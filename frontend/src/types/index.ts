// ─── Subscription ───────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'

export interface SubscriptionTierConfig {
  id: string
  name: SubscriptionTier
  stripe_price_id: string
  max_campaigns: number
  max_email_accounts: number
  max_leads_per_campaign: number
  max_emails_per_day: number
  ai_writer_enabled: boolean
  can_purchase_mailboxes: boolean
  price_monthly: number // cents
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  company_name: string
  smartlead_client_id: number | null
  stripe_customer_id: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  is_admin: boolean
  has_anthropic_key: boolean
  has_openai_key: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

// ─── Campaign ────────────────────────────────────────────────────────────────

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'STOPPED'

export interface CampaignStats {
  total_sent: number
  total_opened: number
  total_replied: number
  total_bounced: number
  total_unsubscribed: number
  open_rate: number
  reply_rate: number
  bounce_rate: number
}

export interface Campaign {
  id: number
  name: string
  status: CampaignStatus
  leads_count: number
  created_at: string
  updated_at: string
  stats: CampaignStats
}

// ─── Lead ────────────────────────────────────────────────────────────────────

export type LeadStatus = 'NOT_CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'
export type LeadCategory =
  | 'Interested'
  | 'Not Interested'
  | 'Meeting Booked'
  | 'Out of Office'
  | 'Wrong Person'
  | 'Do Not Contact'
  | 'Uncategorized'

export interface Lead {
  id: number
  email: string
  first_name: string
  last_name: string
  company_name: string
  title: string
  phone: string
  city: string
  state: string
  country: string
  website: string
  status: LeadStatus
  category: LeadCategory
  last_activity: string | null
  created_at: string
}

// ─── Email Account ────────────────────────────────────────────────────────────

export type EmailProvider = 'Gmail' | 'Outlook' | 'SMTP' | 'Other'
export type EmailAccountStatus = 'active' | 'warmup' | 'failed' | 'disconnected'

export interface WarmupStats {
  warmup_enabled: boolean
  warmup_limit: number
  inbox_rate: number
  spam_rate: number
  sent_today: number
}

export interface EmailAccount {
  id: number
  email: string
  from_name: string
  provider: EmailProvider
  status: EmailAccountStatus
  messages_per_day: number
  warmup: WarmupStats
  tags: string[]
  campaigns_attached: number
  created_at: string
}

// ─── Inbox ───────────────────────────────────────────────────────────────────

export type InboxFilter = 'all' | 'unread' | 'snoozed' | 'important' | 'archived'

export interface InboxMessage {
  id: number
  lead_id: number
  lead_email: string
  lead_name: string
  lead_company: string
  campaign_id: number
  campaign_name: string
  subject: string
  body: string
  is_read: boolean
  is_important: boolean
  is_snoozed: boolean
  is_archived: boolean
  category: LeadCategory
  timestamp: string
  message_type: 'sent' | 'received'
}

export interface ConversationThread {
  lead: Lead
  messages: InboxMessage[]
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, unknown>
  ip_address: string
  created_at: string
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiError {
  error: true
  message: string
  code: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  offset: number
  limit: number
}
