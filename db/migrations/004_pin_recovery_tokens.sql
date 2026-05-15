-- PIN recovery tokens for coordinator handoff (Neon / Postgres).
-- Apply after 001_init.sql. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS pin_recovery_tokens (
  token_hash TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pin_recovery_tokens_slug_idx ON pin_recovery_tokens (slug);
CREATE INDEX IF NOT EXISTS pin_recovery_tokens_expires_at_idx ON pin_recovery_tokens (expires_at);
