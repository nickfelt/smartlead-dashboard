-- ============================================================
-- Migration 001: Initial Schema
-- Run this against your Supabase project via:
--   supabase db push   (if using supabase CLI)
--   or paste into the Supabase SQL editor
-- ============================================================

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE ai_provider AS ENUM ('claude', 'openai');

-- ─── Subscription Tiers (lookup table) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id                      TEXT PRIMARY KEY,
  name                    subscription_tier NOT NULL UNIQUE,
  stripe_price_id         TEXT NOT NULL DEFAULT '',
  max_campaigns           INTEGER NOT NULL DEFAULT 3,
  max_email_accounts      INTEGER NOT NULL DEFAULT 5,
  max_leads_per_campaign  INTEGER NOT NULL DEFAULT 1000,
  max_emails_per_day      INTEGER NOT NULL DEFAULT 500,
  ai_writer_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  can_purchase_mailboxes  BOOLEAN NOT NULL DEFAULT FALSE,
  price_monthly           INTEGER NOT NULL DEFAULT 0  -- cents
);

-- Seed tier configs
INSERT INTO subscription_tiers VALUES
  ('tier_free',       'free',       '',  3,   5,   1000,  500,   FALSE, FALSE, 0),
  ('tier_starter',    'starter',    '',  3,   5,   1000,  500,   FALSE, FALSE, 9700),
  ('tier_pro',        'pro',        '', 15,  25,   5000, 2000,   TRUE,  FALSE, 19700),
  ('tier_enterprise', 'enterprise', '', -1, 100,  25000, 10000,  TRUE,  TRUE,  49700)
ON CONFLICT (id) DO NOTHING;

-- ─── Users (extends auth.users) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT NOT NULL DEFAULT '',
  company_name          TEXT NOT NULL DEFAULT '',
  smartlead_client_id   INTEGER,
  smartlead_api_key     TEXT,              -- encrypted via AES-256 Fernet
  anthropic_api_key     TEXT,              -- encrypted; client's own Claude key
  openai_api_key        TEXT,              -- encrypted; client's own OpenAI key
  stripe_customer_id    TEXT,
  subscription_tier     subscription_tier NOT NULL DEFAULT 'free',
  subscription_status   subscription_status NOT NULL DEFAULT 'trialing',
  is_admin              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Audit Logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,           -- e.g. 'campaign.create'
  resource_type   TEXT NOT NULL DEFAULT '',
  resource_id     TEXT NOT NULL DEFAULT '',
  details         JSONB DEFAULT '{}',      -- full request/response metadata (no secrets)
  ip_address      TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- ─── AI Usage ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_usage (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  provider    ai_provider NOT NULL,
  model       TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  feature     TEXT NOT NULL,  -- e.g. 'sequence_generation', 'rewrite', 'subject_line'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_usage_user_id_idx ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_created_at_idx ON ai_usage(created_at DESC);

-- ─── Pending Orders (Smart Senders — admin approval required) ────────────────

CREATE TABLE IF NOT EXISTS pending_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL,
  mailbox_count   INTEGER NOT NULL DEFAULT 1,
  vendor_id       INTEGER NOT NULL,
  order_details   JSONB DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  admin_note      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

-- subscription_tiers: anyone can read (it's public config)
CREATE POLICY "tiers_select_all" ON subscription_tiers
  FOR SELECT USING (TRUE);

-- users: read/update own row; admins read all
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    auth.uid() = id
    OR (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert new users (called from backend after Stripe webhook)
CREATE POLICY "users_insert_service" ON users
  FOR INSERT WITH CHECK (TRUE);  -- restricted by service role key

-- audit_logs: users see own; admins see all
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- Backend service role inserts audit logs
CREATE POLICY "audit_logs_insert_service" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ai_usage: users see own; admins see all
CREATE POLICY "ai_usage_select" ON ai_usage
  FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "ai_usage_insert_service" ON ai_usage
  FOR INSERT WITH CHECK (TRUE);

-- pending_orders: users see own; admins see all
CREATE POLICY "pending_orders_select" ON pending_orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "pending_orders_insert_service" ON pending_orders
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "pending_orders_update_admin" ON pending_orders
  FOR UPDATE USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
