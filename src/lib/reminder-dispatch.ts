import { getMemorialBlob } from '@/lib/memorial-store'
import { memorialAbsoluteUrl } from '@/lib/memorial-share'
import {
  buildEventReminderEmailCopy,
  buildPledgeReminderCopyPack,
  buildReminderCopyPack,
  coordinatorPublicContactLine,
  pickTaskReminderBody,
  type ReminderEmailTemplate,
} from '@/lib/reminder-copy'
import type { ReminderJobKind } from '@/lib/reminder-jobs'
import { sendPlainEmail } from '@/lib/resend-email'

function formatAccra(iso?: string) {
  if (!iso) return 'date to be confirmed'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export async function buildReminderEmailForJob(input: {
  slug: string
  kind: ReminderJobKind
  target_id: string
  template: string
}): Promise<{ subject: string; text: string } | { error: string }> {
  const blob = await getMemorialBlob(input.slug)
  if (!blob) return { error: 'memorial_not_found' }

  const memorialUrl = memorialAbsoluteUrl(input.slug)
  const coordinatorLine = coordinatorPublicContactLine(blob.memorial)
  const deceasedName = blob.memorial.deceased_name

  if (input.kind === 'task') {
    const task = blob.memorial.tasks?.find((t) => t.id === input.target_id)
    if (!task) return { error: 'task_not_found' }
    const pack = buildReminderCopyPack({
      task,
      deceasedName,
      memorialUrl,
      coordinatorLine,
    })
    const template = input.template as ReminderEmailTemplate
    const bodyText = pickTaskReminderBody(template, pack)
    if (!bodyText) return { error: 'invalid_template_for_task' }
    const subject =
      template === 'overdue'
        ? `Follow-up: ${task.title} — ${deceasedName}`
        : `Reminder: ${task.title} — ${deceasedName}`
    return { subject, text: bodyText }
  }

  if (input.kind === 'event') {
    if (input.template !== 'event_upcoming') return { error: 'invalid_template_for_event' }
    const event = blob.events.find((e) => e.id === input.target_id)
    if (!event) return { error: 'event_not_found' }
    return {
      subject: `Upcoming: ${event.title} — ${deceasedName}`,
      text: buildEventReminderEmailCopy({
        event,
        deceasedName,
        memorialUrl,
        coordinatorLine,
        formatDate: formatAccra,
      }),
    }
  }

  if (input.kind === 'pledge') {
    const pledge = blob.memorial.pledges?.find((p) => p.id === input.target_id)
    if (!pledge) return { error: 'pledge_not_found' }
    const pack = buildPledgeReminderCopyPack({
      pledge,
      deceasedName,
      memorialUrl,
      coordinatorLine,
      defaultCurrency: blob.memorial.fundraising_currency,
    })
    const key = input.template as keyof typeof pack
    const bodyText = pack[key]
    if (!bodyText) return { error: 'invalid_template_for_pledge' }
    return {
      subject: `Pledge reminder — ${deceasedName}`,
      text: bodyText,
    }
  }

  return { error: 'invalid_kind' }
}

export async function sendReminderEmailForJob(input: {
  slug: string
  kind: ReminderJobKind
  target_id: string
  template: string
  to_email: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const built = await buildReminderEmailForJob(input)
  if ('error' in built) return { ok: false, error: built.error }
  return sendPlainEmail({
    to: input.to_email,
    subject: built.subject,
    text: built.text,
  })
}
