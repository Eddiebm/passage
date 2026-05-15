-- Passage memorial persistence (Neon / Postgres).
-- Full document shape matches `StoredMemorialBlob` in src/lib/types.ts:
-- { memorial, events, tributes, contributions, coordinator_pin_hash }

CREATE TABLE IF NOT EXISTS memorials (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blob JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS memorials_status_idx ON memorials (status);
