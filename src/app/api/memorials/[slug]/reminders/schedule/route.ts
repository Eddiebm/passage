import { NextResponse } from 'next/server'
import { verifyCoordinatorPin } from '@/lib/memorial-store'
import {
  insertReminderJob,
  reminderJobsAvailable,
  type ReminderJobChannel,
  type ReminderJobKind,
} from '@/lib/reminder-jobs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getPin(request: Request, body: { pin?: string }): string | undefined {
  return request.headers.get('x-passage-pin')?.trim() || body.pin?.trim()
}

const TASK_TEMPLATES = new Set(['due_tomorrow', 'due_today', 'overdue'])
const PLEDGE_TEMPLATES = new Set(['standard', 'due_tomorrow', 'due_today', 'overdue'])

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  if (!reminderJobsAvailable()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'scheduler_not_configured',
        detail: 'Set DATABASE_URL and run db/migrations/003_reminder_jobs.sql to schedule reminders.',
      },
      { status: 503 },
    )
  }

  const { slug } = await context.params
  const body = (await request.json()) as {
    pin?: string
    kind?: ReminderJobKind
    target_id?: string
    template?: string
    to_email?: string
    send_at?: string
    channel?: ReminderJobChannel
  }

  const pin = getPin(request, body)
  if (!pin) {
    return NextResponse.json({ ok: false, error: 'PIN required' }, { status: 401 })
  }
  if (!(await verifyCoordinatorPin(slug, pin))) {
    return NextResponse.json({ ok: false, error: 'Invalid PIN' }, { status: 403 })
  }

  const channel: ReminderJobChannel = body.channel === 'whatsapp_copy' ? 'whatsapp_copy' : 'email'
  if (channel === 'whatsapp_copy') {
    return NextResponse.json(
      {
        ok: false,
        error: 'whatsapp_scheduling_not_supported',
        detail: 'Use copy buttons for WhatsApp in this MVP. Only email can be scheduled.',
      },
      { status: 400 },
    )
  }

  const kind = body.kind
  const targetId = body.target_id?.trim()
  const template = body.template?.trim()
  const sendAt = body.send_at?.trim()
  const toEmail = body.to_email?.trim()

  if (!kind || !targetId || !template || !sendAt) {
    return NextResponse.json(
      { ok: false, error: 'kind, target_id, template, and send_at are required' },
      { status: 400 },
    )
  }
  if (!toEmail || !toEmail.includes('@')) {
    return NextResponse.json({ ok: false, error: 'to_email is required' }, { status: 400 })
  }

  const sendDate = new Date(sendAt)
  if (Number.isNaN(sendDate.getTime())) {
    return NextResponse.json({ ok: false, error: 'invalid_send_at' }, { status: 400 })
  }
  if (sendDate.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ ok: false, error: 'send_at must be in the future' }, { status: 400 })
  }

  if (kind === 'task' && !TASK_TEMPLATES.has(template)) {
    return NextResponse.json({ ok: false, error: 'invalid_template_for_task' }, { status: 400 })
  }
  if (kind === 'event' && template !== 'event_upcoming') {
    return NextResponse.json({ ok: false, error: 'invalid_template_for_event' }, { status: 400 })
  }
  if (kind === 'pledge' && !PLEDGE_TEMPLATES.has(template)) {
    return NextResponse.json({ ok: false, error: 'invalid_template_for_pledge' }, { status: 400 })
  }

  try {
    const job = await insertReminderJob({
      memorial_slug: slug,
      kind,
      target_id: targetId,
      template,
      channel: 'email',
      to_email: toEmail,
      send_at: sendDate.toISOString(),
    })
    if (!job) {
      return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, job })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'schedule_failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
