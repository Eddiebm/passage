import { NextResponse } from 'next/server'
import { verifyCoordinatorPin } from '@/lib/memorial-store'
import { sendReminderEmailForJob } from '@/lib/reminder-dispatch'
import { resendConfigured } from '@/lib/resend-email'
import type { ReminderEmailTemplate } from '@/lib/reminder-copy'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getPin(request: Request, body: { pin?: string }): string | undefined {
  return request.headers.get('x-passage-pin')?.trim() || body.pin?.trim()
}

export async function GET() {
  return NextResponse.json({ configured: resendConfigured() })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  if (!resendConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'email_not_configured',
        detail: 'Set RESEND_API_KEY (and optionally RESEND_FROM_EMAIL) to send email reminders.',
      },
      { status: 503 },
    )
  }

  const { slug } = await context.params
  const body = (await request.json()) as {
    pin?: string
    type?: 'task' | 'event' | 'pledge'
    target_id?: string
    template?: ReminderEmailTemplate | string
    to_email?: string
  }

  const pin = getPin(request, body)
  if (!pin) {
    return NextResponse.json({ ok: false, error: 'PIN required' }, { status: 401 })
  }
  if (!(await verifyCoordinatorPin(slug, pin))) {
    return NextResponse.json({ ok: false, error: 'Invalid PIN' }, { status: 403 })
  }

  const to = body.to_email?.trim()
  if (!to || !to.includes('@')) {
    return NextResponse.json({ ok: false, error: 'to_email is required' }, { status: 400 })
  }

  const type = body.type
  const targetId = body.target_id?.trim()
  const template = body.template
  if (!type || !targetId || !template) {
    return NextResponse.json(
      { ok: false, error: 'type, target_id, and template are required' },
      { status: 400 },
    )
  }

  const kind = type === 'pledge' ? 'pledge' : type === 'event' ? 'event' : 'task'
  const sent = await sendReminderEmailForJob({
    slug,
    kind,
    target_id: targetId,
    template,
    to_email: to,
  })
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
