import { randomUUID } from 'node:crypto'
import { getDb, hasDatabaseEnv } from '@/lib/db'

export type ReminderJobKind = 'task' | 'event' | 'pledge'
export type ReminderJobChannel = 'email' | 'whatsapp_copy'
export type ReminderJobStatus = 'pending' | 'sent' | 'failed'

export interface ReminderJob {
  id: string
  memorial_slug: string
  kind: ReminderJobKind
  target_id: string
  template: string
  channel: ReminderJobChannel
  to_email: string | null
  send_at: string
  sent_at: string | null
  status: ReminderJobStatus
  error: string | null
  created_at: string
}

export function reminderJobsAvailable(): boolean {
  return hasDatabaseEnv()
}

export async function insertReminderJob(input: {
  memorial_slug: string
  kind: ReminderJobKind
  target_id: string
  template: string
  channel: ReminderJobChannel
  to_email?: string
  send_at: string
}): Promise<ReminderJob | null> {
  if (!reminderJobsAvailable()) return null
  const sql = getDb()
  const id = randomUUID()
  const channel = input.channel
  const toEmail = channel === 'email' ? input.to_email?.trim() || null : null
  if (channel === 'email' && !toEmail) {
    throw new Error('to_email required for email channel')
  }
  const rows = (await sql`
    INSERT INTO reminder_jobs (
      id, memorial_slug, kind, target_id, template, channel, to_email, send_at, status
    ) VALUES (
      ${id}::uuid,
      ${input.memorial_slug},
      ${input.kind},
      ${input.target_id},
      ${input.template},
      ${channel},
      ${toEmail},
      ${input.send_at}::timestamptz,
      'pending'
    )
    RETURNING
      id::text,
      memorial_slug,
      kind,
      target_id,
      template,
      channel,
      to_email,
      send_at,
      sent_at,
      status,
      error,
      created_at
  `) as ReminderJob[]
  return rows[0] ?? null
}

export async function listDueReminderJobs(limit = 50): Promise<ReminderJob[]> {
  if (!reminderJobsAvailable()) return []
  const sql = getDb()
  const rows = (await sql`
    SELECT
      id::text,
      memorial_slug,
      kind,
      target_id,
      template,
      channel,
      to_email,
      send_at,
      sent_at,
      status,
      error,
      created_at
    FROM reminder_jobs
    WHERE status = 'pending'
      AND channel = 'email'
      AND send_at <= NOW()
    ORDER BY send_at ASC
    LIMIT ${limit}
  `) as ReminderJob[]
  return rows
}

export async function markReminderJobSent(id: string): Promise<void> {
  if (!reminderJobsAvailable()) return
  const sql = getDb()
  await sql`
    UPDATE reminder_jobs
    SET status = 'sent', sent_at = NOW(), error = NULL
    WHERE id = ${id}::uuid
  `
}

export async function markReminderJobFailed(id: string, error: string): Promise<void> {
  if (!reminderJobsAvailable()) return
  const sql = getDb()
  await sql`
    UPDATE reminder_jobs
    SET status = 'failed', error = ${error.slice(0, 2000)}
    WHERE id = ${id}::uuid
  `
}

export async function listPendingReminderJobsForSlug(slug: string): Promise<ReminderJob[]> {
  if (!reminderJobsAvailable()) return []
  const sql = getDb()
  const rows = (await sql`
    SELECT
      id::text,
      memorial_slug,
      kind,
      target_id,
      template,
      channel,
      to_email,
      send_at,
      sent_at,
      status,
      error,
      created_at
    FROM reminder_jobs
    WHERE memorial_slug = ${slug}
      AND status = 'pending'
    ORDER BY send_at ASC
    LIMIT 100
  `) as ReminderJob[]
  return rows
}
