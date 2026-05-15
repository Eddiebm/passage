-- Scheduled coordinator email reminders (processed by Vercel Cron → GET /api/cron/reminders).

CREATE TABLE IF NOT EXISTS reminder_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_slug TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('task', 'event', 'pledge')),
  target_id TEXT NOT NULL,
  template TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp_copy')),
  to_email TEXT,
  send_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reminder_jobs_due_idx
  ON reminder_jobs (status, send_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS reminder_jobs_slug_idx ON reminder_jobs (memorial_slug);
