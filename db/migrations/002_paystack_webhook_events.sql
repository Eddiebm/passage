-- Idempotent Paystack webhook processing (Neon / Postgres).
-- Apply after 001_init.sql. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS paystack_webhook_events (
  idempotency_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS paystack_webhook_events_processed_at_idx
  ON paystack_webhook_events (processed_at);
