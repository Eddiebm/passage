import { randomUUID } from 'node:crypto'
import type { MemorialPinUpdate } from '@/lib/memorial-store'
import { isStakeholderCategory } from '@/lib/memorial-hydrate'
import { VISUAL_THEMES } from '@/lib/visual-themes'
import type {
  BankReconciliationTransaction,
  ContactCard,
  LastBankReconciliation,
  MemorialClosureStatus,
  MemorialEvent,
  MemorialPledge,
  MemorialPledgeStatus,
  MemorialTask,
  OutputTemplate,
  VisualTheme,
  ProgrammeReading,
  ProgrammeReadingType,
  Remembrance,
  Stakeholder,
} from '@/lib/types'

const PROGRAMME_READING_TYPES: ProgrammeReadingType[] = ['scripture', 'hymn', 'quran', 'upload']

const MEMORIAL_MODES = ['notice', 'programme', 'full'] as const
const OUTPUT_TEMPLATES = ['notice', 'programme', 'banner_classic'] as const

/** Validates PATCH `memorial_mode` (invalid values rejected; omit field to leave unchanged). */
function parseMemorialModePatch(raw: unknown): { ok: true; value: (typeof MEMORIAL_MODES)[number] } | { ok: false; error: string } {
  if (typeof raw !== 'string') return { ok: false, error: 'memorial_mode must be a string' }
  if (!MEMORIAL_MODES.includes(raw as (typeof MEMORIAL_MODES)[number])) {
    return { ok: false, error: 'memorial_mode must be notice, programme, or full' }
  }
  return { ok: true, value: raw as (typeof MEMORIAL_MODES)[number] }
}

function trimStr(s: unknown): string | undefined {
  if (typeof s !== 'string') return undefined
  const t = s.trim()
  return t || undefined
}

function parseContactCard(raw: unknown): ContactCard | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const name = trimStr(o.name)
  if (!name) return null
  return {
    name,
    role_label: trimStr(o.role_label),
    phone: trimStr(o.phone),
    email: trimStr(o.email),
    whatsapp: trimStr(o.whatsapp),
  }
}

function parseStakeholder(raw: unknown): Stakeholder | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const cat = o.category
  if (!isStakeholderCategory(cat)) return null
  const name = trimStr(o.name)
  if (!name) return null
  let id = trimStr(o.id)
  if (!id) id = randomUUID()
  const vis = o.visibility === 'coordinator_only' ? 'coordinator_only' : 'public'
  return {
    id,
    category: cat,
    name,
    role_label: trimStr(o.role_label),
    phone: trimStr(o.phone),
    email: trimStr(o.email),
    notes: trimStr(o.notes),
    visibility: vis,
  }
}

function parseRemembrance(raw: unknown): Remembrance | null | undefined {
  if (raw === null) return null
  if (raw === undefined) return undefined
  if (typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  let scripture: Remembrance['scripture']
  const sRaw = r.scripture
  if (sRaw && typeof sRaw === 'object') {
    const s = sRaw as Record<string, unknown>
    const reference = trimStr(s.reference) ?? ''
    const text = trimStr(s.text) ?? ''
    if (reference || text) {
      scripture = { reference, text }
    }
  }
  let quotes: Remembrance['quotes']
  if (Array.isArray(r.quotes)) {
    const qlist: NonNullable<Remembrance['quotes']> = []
    for (const q of r.quotes) {
      if (!q || typeof q !== 'object') continue
      const qo = q as Record<string, unknown>
      const text = trimStr(qo.text)
      if (!text) continue
      qlist.push({
        text,
        attribution: trimStr(qo.attribution),
      })
    }
    quotes = qlist.length ? qlist : undefined
  }
  if (!scripture && !quotes) return {}
  return { ...(scripture ? { scripture } : {}), ...(quotes ? { quotes } : {}) }
}

const PLEDGE_STATUSES: MemorialPledgeStatus[] = ['pledged', 'partial', 'fulfilled', 'cancelled']

function parseMemorialPledge(raw: unknown): MemorialPledge | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const pledger_name = trimStr(o.pledger_name)
  if (!pledger_name) return null
  let id = trimStr(o.id)
  if (!id) id = randomUUID()
  const statusRaw = o.status
  const status = PLEDGE_STATUSES.includes(statusRaw as MemorialPledgeStatus)
    ? (statusRaw as MemorialPledgeStatus)
    : 'pledged'
  const vis = o.visibility === 'coordinator_only' ? 'coordinator_only' : 'public'
  let amount_minor: number | undefined
  if (typeof o.amount_minor === 'number' && Number.isFinite(o.amount_minor)) {
    amount_minor = Math.round(o.amount_minor)
  } else if (typeof o.amount_minor === 'string' && o.amount_minor.trim()) {
    const n = Number.parseInt(o.amount_minor, 10)
    if (Number.isFinite(n)) amount_minor = n
  }
  return {
    id,
    pledger_name,
    amount_minor,
    currency: trimStr(o.currency),
    purpose: trimStr(o.purpose),
    status,
    expected_by: trimStr(o.expected_by),
    channel_note: trimStr(o.channel_note),
    contribution_id: trimStr(o.contribution_id),
    paystack_reference: trimStr(o.paystack_reference),
    visibility: vis,
  }
}

function parseMemorialTask(raw: unknown): MemorialTask | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const title = trimStr(o.title)
  if (!title) return null
  let id = trimStr(o.id)
  if (!id) id = randomUUID()
  const status = o.status === 'done' ? 'done' : 'open'
  return {
    id,
    title,
    owner_name: trimStr(o.owner_name),
    due_at: trimStr(o.due_at),
    status,
    notes: trimStr(o.notes),
  }
}

function parseOutputTemplatePatch(raw: unknown): { ok: true; value: OutputTemplate } | { ok: false; error: string } {
  if (typeof raw !== 'string') return { ok: false, error: 'output_template must be a string' }
  if (!OUTPUT_TEMPLATES.includes(raw as OutputTemplate)) {
    return { ok: false, error: 'output_template must be notice, programme, or banner_classic' }
  }
  return { ok: true, value: raw as OutputTemplate }
}

function parseVisualThemePatch(raw: unknown): { ok: true; value: VisualTheme } | { ok: false; error: string } {
  if (typeof raw !== 'string') return { ok: false, error: 'visual_theme must be a string' }
  if (!VISUAL_THEMES.includes(raw as VisualTheme)) {
    return {
      ok: false,
      error: `visual_theme must be a known theme id (received "${raw}")`,
    }
  }
  return { ok: true, value: raw as VisualTheme }
}

function parseIsoDateField(raw: unknown): string | undefined | null {
  if (raw === null || raw === '') return null
  const t = trimStr(raw)
  return t || undefined
}

function parseAgeField(raw: unknown): number | undefined | null {
  if (raw === null || raw === '') return null
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.round(raw)
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function parseBankReconciliationTxn(raw: unknown): BankReconciliationTransaction | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const date = trimStr(o.date)
  const amount = typeof o.amount === 'number' ? o.amount : Number.parseFloat(String(o.amount ?? ''))
  if (!date || !Number.isFinite(amount)) return null
  const currency = trimStr(o.currency) || 'GHS'
  const typeRaw = o.type
  const type =
    typeRaw === 'credit' || typeRaw === 'debit' || typeRaw === 'unknown' ? typeRaw : 'unknown'
  const statusRaw = o.reconciliation_status
  const reconciliation_status =
    statusRaw === 'reconciled' || statusRaw === 'unmatched' || statusRaw === 'pending'
      ? statusRaw
      : undefined
  return {
    date,
    amount,
    currency,
    sender: trimStr(o.sender) ?? null,
    reference: trimStr(o.reference) ?? null,
    type,
    reconciliation_status,
    contribution_id: trimStr(o.contribution_id),
  }
}

function parseLastBankReconciliation(raw: unknown): LastBankReconciliation | null | undefined {
  if (raw === null) return null
  if (raw === undefined) return undefined
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const scanned_at = trimStr(o.scanned_at)
  const file_hash = trimStr(o.file_hash)
  if (!scanned_at || !file_hash || !Array.isArray(o.transactions)) return undefined
  const transactions: BankReconciliationTransaction[] = []
  for (const item of o.transactions) {
    const t = parseBankReconciliationTxn(item)
    if (!t) return undefined
    transactions.push(t)
  }
  return { scanned_at, file_hash, transactions }
}

function parseProgrammeReading(raw: unknown): ProgrammeReading | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const typeRaw = o.type
  if (!PROGRAMME_READING_TYPES.includes(typeRaw as ProgrammeReadingType)) return null
  const title = trimStr(o.title)
  if (!title) return null
  let id = trimStr(o.id)
  if (!id) id = randomUUID()
  const vis = o.visibility === 'coordinator_only' ? 'coordinator_only' : 'public'
  const sortRaw = o.sort_order
  const sort_order =
    typeof sortRaw === 'number' && Number.isFinite(sortRaw)
      ? sortRaw
      : typeof sortRaw === 'string' && sortRaw.trim()
        ? Number.parseInt(sortRaw, 10)
        : undefined
  return {
    id,
    type: typeRaw as ProgrammeReadingType,
    title,
    sort_order: sort_order !== undefined && Number.isFinite(sort_order) ? sort_order : undefined,
    visibility: vis,
    scripture_reference: trimStr(o.scripture_reference),
    scripture_text: trimStr(o.scripture_text),
    bible_translation: trimStr(o.bible_translation),
    hymn_book: trimStr(o.hymn_book),
    hymn_number: trimStr(o.hymn_number),
    hymn_title: trimStr(o.hymn_title),
    hymn_lyrics: trimStr(o.hymn_lyrics),
    quran_reference: trimStr(o.quran_reference),
    quran_arabic: trimStr(o.quran_arabic),
    quran_translation: trimStr(o.quran_translation),
    document_url: trimStr(o.document_url),
    document_caption: trimStr(o.document_caption),
  }
}

function parseMemorialEventForPatch(raw: unknown): Omit<MemorialEvent, 'memorial_id'> | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const title = trimStr(o.title)
  if (!title) return null
  let id = trimStr(o.id)
  if (!id) id = randomUUID()
  const vis = o.visibility === 'coordinator_only' ? 'coordinator_only' : 'public'
  const sortRaw = o.sort_order
  const sort_order =
    typeof sortRaw === 'number' && Number.isFinite(sortRaw)
      ? sortRaw
      : typeof sortRaw === 'string' && sortRaw.trim()
        ? Number.parseInt(sortRaw, 10)
        : 0
  return {
    id,
    title,
    event_date: trimStr(o.event_date) ?? trimStr(o.starts_at),
    location: trimStr(o.location),
    online_link: trimStr(o.online_link),
    notes: trimStr(o.notes),
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    visibility: vis,
  }
}

/** Validates and normalizes coordinator PATCH fields (PIN handled separately). */
export function parseStructuredMemorialPatch(
  raw: unknown,
): { ok: true; patch: MemorialPinUpdate } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid JSON' }
  const b = raw as Record<string, unknown>
  const patch: MemorialPinUpdate = {}

  if (b.memorial_mode !== undefined) {
    const parsed = parseMemorialModePatch(b.memorial_mode)
    if (!parsed.ok) return parsed
    patch.memorial_mode = parsed.value
  }

  if (b.output_template !== undefined) {
    const parsed = parseOutputTemplatePatch(b.output_template)
    if (!parsed.ok) return parsed
    patch.output_template = parsed.value
  }

  if (b.visual_theme !== undefined) {
    const parsed = parseVisualThemePatch(b.visual_theme)
    if (!parsed.ok) return parsed
    patch.visual_theme = parsed.value
  }

  if (b.deceased_name !== undefined) {
    const name = trimStr(b.deceased_name)
    if (!name) return { ok: false, error: 'deceased_name cannot be empty' }
    patch.deceased_name = name
  }

  if (b.deceased_title !== undefined) {
    const t = trimStr(b.deceased_title)
    if (t) patch.deceased_title = t
    else if (b.deceased_title === null || b.deceased_title === '') patch.deceased_title = undefined
  }

  if (b.deceased_family_house !== undefined) {
    const v = trimStr(b.deceased_family_house)
    if (v) patch.deceased_family_house = v
    else if (b.deceased_family_house === null || b.deceased_family_house === '') {
      patch.deceased_family_house = undefined
    }
  }

  if (b.deceased_community !== undefined) {
    const v = trimStr(b.deceased_community)
    if (v) patch.deceased_community = v
    else if (b.deceased_community === null || b.deceased_community === '') {
      patch.deceased_community = undefined
    }
  }

  if (b.date_of_birth !== undefined) {
    const v = parseIsoDateField(b.date_of_birth)
    if (v === null) patch.date_of_birth = undefined
    else if (v) patch.date_of_birth = v
  }

  if (b.date_of_passing !== undefined) {
    const v = parseIsoDateField(b.date_of_passing)
    if (!v) return { ok: false, error: 'date_of_passing is required' }
    patch.date_of_passing = v
  }

  if (b.place_of_passing !== undefined) {
    const v = trimStr(b.place_of_passing)
    if (v) patch.place_of_passing = v
    else if (b.place_of_passing === null || b.place_of_passing === '') {
      patch.place_of_passing = undefined
    }
  }

  if (b.age !== undefined) {
    const age = parseAgeField(b.age)
    if (age === null) patch.age = undefined
    else if (age !== undefined) patch.age = age
  }

  if (b.coordinator_recovery_email !== undefined) {
    const email = trimStr(b.coordinator_recovery_email)?.toLowerCase()
    if (email) patch.coordinator_recovery_email = email
    else if (b.coordinator_recovery_email === null || b.coordinator_recovery_email === '') {
      patch.coordinator_recovery_email = undefined
    }
  }

  if (b.last_bank_reconciliation !== undefined) {
    const rec = parseLastBankReconciliation(b.last_bank_reconciliation)
    if (rec === undefined && b.last_bank_reconciliation !== null) {
      return { ok: false, error: 'Invalid last_bank_reconciliation' }
    }
    if (rec === null) patch.last_bank_reconciliation = undefined
    else if (rec) patch.last_bank_reconciliation = rec
  }

  if (b.closure_status !== undefined) {
    const v = b.closure_status
    if (v !== 'active' && v !== 'closed') {
      return { ok: false, error: 'closure_status must be active or closed' }
    }
    patch.closure_status = v as MemorialClosureStatus
  }

  if (b.closed_at !== undefined) {
    const t = trimStr(b.closed_at)
    if (t) patch.closed_at = t
    else if (b.closed_at === null) patch.closed_at = undefined
  }

  if (b.closure_notes !== undefined) {
    const n = typeof b.closure_notes === 'string' ? b.closure_notes.trim() : ''
    if (n) patch.closure_notes = n
    else if (b.closure_notes === null || b.closure_notes === '') {
      patch.closure_notes = undefined
    }
  }

  if (b.stakeholders !== undefined) {
    if (!Array.isArray(b.stakeholders)) return { ok: false, error: 'stakeholders must be an array' }
    const list: Stakeholder[] = []
    for (const item of b.stakeholders) {
      const s = parseStakeholder(item)
      if (!s) return { ok: false, error: 'Invalid stakeholder entry' }
      list.push(s)
    }
    patch.stakeholders = list
  }

  if (b.remembrance !== undefined) {
    const r = parseRemembrance(b.remembrance)
    if (r === undefined) {
      /* omit */
    } else if (r === null) {
      patch.remembrance = null
    } else if (Object.keys(r).length === 0) {
      patch.remembrance = null
    } else {
      patch.remembrance = r
    }
  }

  if (b.public_contacts !== undefined) {
    if (!Array.isArray(b.public_contacts)) return { ok: false, error: 'public_contacts must be an array' }
    if (b.public_contacts.length > 2) return { ok: false, error: 'At most two public contacts are allowed' }
    const cards: ContactCard[] = []
    for (const item of b.public_contacts) {
      const c = parseContactCard(item)
      if (!c) return { ok: false, error: 'Invalid public contact entry' }
      cards.push(c)
    }
    patch.public_contacts = cards
  }

  if (b.internal_contacts !== undefined) {
    if (!Array.isArray(b.internal_contacts)) return { ok: false, error: 'internal_contacts must be an array' }
    const cards: ContactCard[] = []
    for (const item of b.internal_contacts) {
      const c = parseContactCard(item)
      if (!c) return { ok: false, error: 'Invalid internal contact entry' }
      cards.push(c)
    }
    patch.internal_contacts = cards
  }

  if (b.tasks !== undefined) {
    if (!Array.isArray(b.tasks)) return { ok: false, error: 'tasks must be an array' }
    const list: MemorialTask[] = []
    for (const item of b.tasks) {
      const t = parseMemorialTask(item)
      if (!t) return { ok: false, error: 'Invalid task entry' }
      list.push(t)
    }
    patch.tasks = list
  }

  if (b.pledges !== undefined) {
    if (!Array.isArray(b.pledges)) return { ok: false, error: 'pledges must be an array' }
    const list: MemorialPledge[] = []
    for (const item of b.pledges) {
      const p = parseMemorialPledge(item)
      if (!p) return { ok: false, error: 'Invalid pledge entry' }
      list.push(p)
    }
    patch.pledges = list
  }

  if (b.events !== undefined) {
    if (!Array.isArray(b.events)) return { ok: false, error: 'events must be an array' }
    const list: Omit<MemorialEvent, 'memorial_id'>[] = []
    for (const item of b.events) {
      const e = parseMemorialEventForPatch(item)
      if (!e) return { ok: false, error: 'Invalid programme event entry' }
      list.push(e)
    }
    patch.events = list.map((e) => ({
      ...e,
      memorial_id: '',
    })) as MemorialEvent[]
  }

  if (b.programme_readings !== undefined) {
    if (!Array.isArray(b.programme_readings)) {
      return { ok: false, error: 'programme_readings must be an array' }
    }
    const list: ProgrammeReading[] = []
    for (const item of b.programme_readings) {
      const r = parseProgrammeReading(item)
      if (!r) return { ok: false, error: 'Invalid programme reading entry' }
      list.push(r)
    }
    patch.programme_readings = list
  }

  return { ok: true, patch }
}
