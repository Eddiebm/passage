import { NextResponse } from 'next/server'
import {
  listDueReminderJobs,
  markReminderJobFailed,
  markReminderJobSent,
  reminderJobsAvailable,
} from '@/lib/reminder-jobs'
import { sendReminderEmailForJob } from '@/lib/reminder-dispatch'
import { resendConfigured } from '@/lib/resend-email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const header = request.headers.get('authorization')?.trim()
  if (header === `Bearer ${secret}`) return true
  const cronHeader = request.headers.get('x-cron-secret')?.trim()
  return cronHeader === secret
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!reminderJobsAvailable()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no_database' })
  }

  if (!resendConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'email_not_configured', detail: 'RESEND_API_KEY required' },
      { status: 503 },
    )
  }

  const jobs = await listDueReminderJobs(40)
  let sent = 0
  let failed = 0

  for (const job of jobs) {
    const to = job.to_email?.trim()
    if (!to) {
      await markReminderJobFailed(job.id, 'missing_to_email')
      failed += 1
      continue
    }

    const result = await sendReminderEmailForJob({
      slug: job.memorial_slug,
      kind: job.kind,
      target_id: job.target_id,
      template: job.template,
      to_email: to,
    })

    if (result.ok) {
      await markReminderJobSent(job.id)
      sent += 1
    } else {
      await markReminderJobFailed(job.id, result.error)
      failed += 1
    }
  }

  return NextResponse.json({ ok: true, processed: jobs.length, sent, failed })
}
