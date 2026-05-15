import type { MemorialEvent, MemorialPledge, MemorialTask } from '@/lib/types'
import { formatPledgeAmountMinor } from '@/lib/memorial-pledges'

function contactLineFromMemorial(input: {
  coordinator_whatsapp?: string
  coordinator_email?: string
  public_contact_whatsapp?: string
  public_contact_phone?: string
  public_contact_email?: string
}): string {
  const wa = input.public_contact_whatsapp?.trim() || input.coordinator_whatsapp?.trim()
  const ph = input.public_contact_phone?.trim()
  const em = input.public_contact_email?.trim() || input.coordinator_email?.trim()
  const parts: string[] = []
  if (wa) parts.push(`WhatsApp: ${wa}`)
  else if (ph) parts.push(`Phone: ${ph}`)
  if (em) parts.push(`Email: ${em}`)
  return parts.join(' · ') || 'Please reply to the family coordinator.'
}

/** Plain-text reminder blocks for WhatsApp / SMS-style paste (no SMS send). */
export function buildReminderCopyPack(input: {
  task: MemorialTask
  deceasedName: string
  memorialUrl: string
  coordinatorLine: string
}): { dueTomorrow: string; dueToday: string; overdue: string; noDueDate: string } {
  const { task, deceasedName, memorialUrl, coordinatorLine } = input
  const title = task.title.trim()
  const owner = task.owner_name?.trim()
  const ownerBit = owner ? ` (${owner})` : ''

  const baseFooter = `\n\nMemorial: ${memorialUrl}\n${coordinatorLine}`

  const noDueDate =
    `Regarding preparations for ${deceasedName}: "${title}"${ownerBit}.` +
    ` When you have a moment, could you confirm status or share an update?` +
    baseFooter

  const dueTomorrow =
    `Gentle reminder — task for ${deceasedName}'s arrangements: "${title}"${ownerBit} is due tomorrow (Accra calendar).` +
    ` Any blockers?` +
    baseFooter

  const dueToday =
    `Reminder — "${title}"${ownerBit} for ${deceasedName}'s arrangements is due today. Please confirm completion or flag delays.` +
    baseFooter

  const overdue =
    `Following up — "${title}"${ownerBit} for ${deceasedName}'s arrangements is now overdue. Please send a brief update when you can.` +
    baseFooter

  return { dueTomorrow, dueToday, overdue, noDueDate }
}

export function buildPledgeReminderCopy(input: {
  pledge: MemorialPledge
  deceasedName: string
  memorialUrl: string
  coordinatorLine: string
  defaultCurrency: string
}): string {
  return buildPledgeReminderCopyPack(input).standard
}

/** WhatsApp-style pledge reminder variants (copy only — no WABA send in MVP). */
export function buildPledgeReminderCopyPack(input: {
  pledge: MemorialPledge
  deceasedName: string
  memorialUrl: string
  coordinatorLine: string
  defaultCurrency: string
}): {
  standard: string
  dueTomorrow: string
  dueToday: string
  overdue: string
} {
  const { pledge, deceasedName, memorialUrl, coordinatorLine, defaultCurrency } = input
  const amountBit =
    pledge.amount_minor != null
      ? ` (${formatPledgeAmountMinor(pledge.amount_minor, pledge.currency || defaultCurrency)})`
      : ''
  const purposeBit = pledge.purpose?.trim() ? ` for ${pledge.purpose.trim()}` : ''
  const expectedBit = pledge.expected_by?.trim()
    ? ` Expected by ${pledge.expected_by.trim()}.`
    : ''
  const baseFooter = `\n\nMemorial: ${memorialUrl}\n${coordinatorLine}`
  const who = pledge.pledger_name.trim()

  const standard =
    `Gentle reminder — ${who} pledged support${amountBit}${purposeBit} ` +
    `toward ${deceasedName}'s arrangements.${expectedBit} ` +
    `When you are able, please confirm payment or share an update with the coordinator.` +
    baseFooter

  const dueTomorrow =
    `Reminder — pledge from ${who}${amountBit}${purposeBit} for ${deceasedName}'s arrangements ` +
    `is expected tomorrow.${expectedBit} Please confirm payment or flag any delay.` +
    baseFooter

  const dueToday =
    `Reminder — pledge from ${who}${amountBit}${purposeBit} for ${deceasedName}'s arrangements ` +
    `is expected today. Please confirm when paid.` +
    baseFooter

  const overdue =
    `Following up — pledge from ${who}${amountBit}${purposeBit} for ${deceasedName}'s arrangements ` +
    `is now overdue.${expectedBit} A brief update to the coordinator would be appreciated.` +
    baseFooter

  return { standard, dueTomorrow, dueToday, overdue }
}

export type PledgeReminderEmailTemplate = 'standard' | 'due_tomorrow' | 'due_today' | 'overdue'

export function buildEventReminderEmailCopy(input: {
  event: MemorialEvent
  deceasedName: string
  memorialUrl: string
  coordinatorLine: string
  formatDate: (iso?: string) => string
}): string {
  const { event, deceasedName, memorialUrl, coordinatorLine, formatDate } = input
  const when = event.event_date ? formatDate(event.event_date) : 'date to be confirmed'
  const where = event.location?.trim() ? ` at ${event.location.trim()}` : ''
  return (
    `Regarding arrangements for ${deceasedName}: "${event.title.trim()}" is scheduled for ${when}${where}.` +
    `\n\nPlease review details on the memorial page and reach out if anything has changed.` +
    `\n\nMemorial: ${memorialUrl}\n${coordinatorLine}`
  )
}

export type ReminderEmailTemplate =
  | 'due_tomorrow'
  | 'due_today'
  | 'overdue'
  | 'event_upcoming'

export function pickTaskReminderBody(
  template: ReminderEmailTemplate,
  pack: ReturnType<typeof buildReminderCopyPack>,
): string | null {
  switch (template) {
    case 'due_tomorrow':
      return pack.dueTomorrow
    case 'due_today':
      return pack.dueToday
    case 'overdue':
      return pack.overdue
    default:
      return null
  }
}

export function coordinatorPublicContactLine(memorial: {
  coordinator_whatsapp?: string
  coordinator_email?: string
  public_contacts?: { whatsapp?: string; phone?: string; email?: string }[]
}): string {
  const first = memorial.public_contacts?.[0]
  return contactLineFromMemorial({
    coordinator_whatsapp: memorial.coordinator_whatsapp,
    coordinator_email: memorial.coordinator_email,
    public_contact_whatsapp: first?.whatsapp,
    public_contact_phone: first?.phone,
    public_contact_email: first?.email,
  })
}
