import path from 'node:path'
import type {
  Contribution,
  Memorial,
  MemorialEvent,
  MemorialMode,
  MemorialStatus,
  MemorialWithDetails,
  ProgrammeReading,
  Remembrance,
  StoredMemorialBlob,
  SurvivingFamilyMember,
  Tribute,
  Tradition,
} from '@/lib/types'
import { verifyPin } from '@/lib/crypto-pin'
import { getDb, hasDatabaseEnv } from '@/lib/db'
import { hydrateMemorial, memorialForPublicAudience } from '@/lib/memorial-hydrate'
import { applyPledgeFulfillment, resolvePledgeIdForPayment } from '@/lib/memorial-pledge-match'
import {
  EXAMPLE_MEMORIAL_SLUGS,
  getExampleMemorialBlob,
  getGhanaMuslimExampleMemorialBlob,
} from '@/lib/seed-memorial'

function sumRaised(contributions: Contribution[]): number {
  return contributions
    .filter((c) => c.payout_status !== 'failed' && c.paid_at)
    .reduce((acc, c) => acc + c.amount, 0)
}

function toPublicMemorial(m: Memorial): Memorial {
  return { ...m }
}

function publicProgrammeEvents(events: MemorialEvent[]): MemorialEvent[] {
  return events.filter((e) => e.visibility !== 'coordinator_only')
}

function toDetails(
  blob: StoredMemorialBlob,
  opts?: { includeAllTributes?: boolean; includeCoordinatorFields?: boolean },
): MemorialWithDetails {
  const tributes = opts?.includeAllTributes
    ? blob.tributes
    : blob.tributes.filter((t) => t.approved)
  const hydrated = hydrateMemorial(blob.memorial)
  const memorial =
    opts?.includeCoordinatorFields === true
      ? toPublicMemorial(hydrated)
      : memorialForPublicAudience(toPublicMemorial(hydrated))
  const sorted = [...blob.events].sort((a, b) => a.sort_order - b.sort_order)
  const events = opts?.includeCoordinatorFields ? sorted : publicProgrammeEvents(sorted)
  return {
    ...memorial,
    events,
    tributes,
    total_raised: sumRaised(blob.contributions),
    tribute_count: tributes.length,
  }
}

function memorialFileStoreRoot(): string {
  // Vercel serverless has a read-only project filesystem; use /tmp for JSON blobs.
  if (process.env.VERCEL) {
    return path.join('/tmp', 'passage-dev', 'memorials')
  }
  return path.join(process.cwd(), '.passage-dev', 'memorials')
}


async function getFileStore(): Promise<{
  read: (slug: string) => Promise<StoredMemorialBlob | null>
  write: (slug: string, blob: StoredMemorialBlob) => Promise<void>
  listSlugs: () => Promise<string[]>
}> {
  const { mkdir, readFile, writeFile, readdir } = await import('node:fs/promises')
  const root = memorialFileStoreRoot()

  async function ensureDir() {
    await mkdir(root, { recursive: true })
  }

  return {
    async read(slug) {
      await ensureDir()
      try {
        const raw = await readFile(path.join(root, `${slug}.json`), 'utf8')
        return JSON.parse(raw) as StoredMemorialBlob
      } catch {
        return null
      }
    },
    async write(slug, blob) {
      await ensureDir()
      await writeFile(
        path.join(root, `${slug}.json`),
        JSON.stringify(blob, null, 2),
        'utf8',
      )
    },
    async listSlugs() {
      await ensureDir()
      const names = await readdir(root)
      return names.filter((n) => n.endsWith('.json')).map((n) => n.replace(/\.json$/, ''))
    },
  }
}

function parseStoredBlob(raw: unknown): StoredMemorialBlob | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (!o.memorial || typeof o.memorial !== 'object') return null
  const m = o.memorial as Record<string, unknown>
  if (typeof m.slug !== 'string' || typeof m.id !== 'string') return null
  return raw as StoredMemorialBlob
}

async function readFromPostgres(slug: string): Promise<StoredMemorialBlob | null> {
  const sql = getDb()
  const rows = (await sql`
    SELECT blob FROM memorials WHERE slug = ${slug} LIMIT 1
  `) as { blob: unknown }[]
  const row = rows[0]
  if (!row) return null
  return parseStoredBlob(row.blob)
}

/** Built-in demo memorials — served when Postgres is missing or unreachable. */
export function getBuiltInSeedBlob(slug: string): StoredMemorialBlob | null {
  if (slug === 'bannerman-samuel-2026') return getExampleMemorialBlob()
  if (slug === 'ghana-muslim-example-2026') return getGhanaMuslimExampleMemorialBlob()
  return null
}

async function readFromFileStore(slug: string): Promise<StoredMemorialBlob | null> {
  const fs = await getFileStore()
  return fs.read(slug)
}

async function writeToPostgres(blob: StoredMemorialBlob): Promise<void> {
  const sql = getDb()
  const m = blob.memorial
  const payload = JSON.stringify(blob)
  await sql`
    INSERT INTO memorials (id, slug, status, created_at, updated_at, blob)
    VALUES (
      ${m.id}::uuid,
      ${m.slug},
      ${m.status},
      ${m.created_at}::timestamptz,
      NOW(),
      ${payload}::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = NOW(),
      blob = EXCLUDED.blob
  `
}

async function readBlob(slug: string): Promise<StoredMemorialBlob | null> {
  if (hasDatabaseEnv()) {
    try {
      const fromDb = await readFromPostgres(slug)
      if (fromDb) return fromDb
    } catch (err) {
      console.error('[passage] Postgres read failed; trying fallbacks', { slug, err })
    }
  }

  try {
    const fromFile = await readFromFileStore(slug)
    if (fromFile) return fromFile
  } catch (err) {
    console.error('[passage] File store read failed; trying built-in seeds', { slug, err })
  }

  return getBuiltInSeedBlob(slug)
}

async function writeBlob(blob: StoredMemorialBlob): Promise<void> {
  if (hasDatabaseEnv()) {
    await writeToPostgres(blob)
    return
  }
  const fs = await getFileStore()
  await fs.write(blob.memorial.slug, blob)
}

/** Persist full memorial document (internal / recovery flows). */
export async function writeMemorialBlob(blob: StoredMemorialBlob): Promise<void> {
  await writeBlob(blob)
}

export async function setCoordinatorPinHash(slug: string, pinHash: string): Promise<boolean> {
  const blob = await readBlob(slug)
  if (!blob) return false
  await writeBlob({ ...blob, coordinator_pin_hash: pinHash })
  return true
}

export async function updatePinRecoveryRateWindow(
  slug: string,
  window: import('@/lib/types').PinRecoveryRateWindow,
): Promise<void> {
  const blob = await readBlob(slug)
  if (!blob) return
  await writeBlob({
    ...blob,
    memorial: { ...blob.memorial, pin_recovery_rate: window },
  })
}

export async function ensureExampleMemorialSeeded(): Promise<void> {
  const seeds: { slug: (typeof EXAMPLE_MEMORIAL_SLUGS)[number]; blob: () => StoredMemorialBlob }[] = [
    { slug: 'bannerman-samuel-2026', blob: getExampleMemorialBlob },
    { slug: 'ghana-muslim-example-2026', blob: getGhanaMuslimExampleMemorialBlob },
  ]
  for (const { slug, blob } of seeds) {
    try {
      const existing = await readBlob(slug)
      if (existing) continue
      if (!hasDatabaseEnv()) {
        await writeBlob(blob())
        continue
      }
      try {
        await writeBlob(blob())
      } catch (err) {
        console.error('[passage] Example memorial seed write failed (Postgres)', { slug, err })
      }
    } catch (err) {
      console.error('[passage] Example memorial seed check failed', { slug, err })
    }
  }
}

export async function getMemorialBlob(slug: string): Promise<StoredMemorialBlob | null> {
  await ensureExampleMemorialSeeded()
  return readBlob(slug)
}

/** Read persisted memorial JSON without seeding the example memorial (webhooks, idempotency). */
export async function readMemorialBlobWithoutSeeding(slug: string): Promise<StoredMemorialBlob | null> {
  return readBlob(slug)
}

/**
 * Idempotently records a successful Paystack payment against a memorial blob
 * (same rules as POST …/paystack/verify after API verification).
 */
export async function completeContributionPayment(
  slug: string,
  input: {
    reference: string
    amountMajor: number
    currency: string
    contributor_name?: string
    contributor_whatsapp?: string
    message?: string
    pledge_id?: string
  },
): Promise<Contribution | null> {
  const blob = await readBlob(slug)
  if (!blob) return null

  const existing = blob.contributions.find((c) => c.paystack_reference === input.reference)
  if (existing?.paid_at) {
    await linkPledgeAfterPayment(slug, input.reference, existing.id, input.pledge_id, {
      amountMajor: input.amountMajor,
      currency: input.currency,
    })
    return existing
  }

  if (!existing) {
    await addContributionRecord(slug, {
      contributor_name: input.contributor_name,
      contributor_whatsapp: input.contributor_whatsapp,
      amount: Number.isFinite(input.amountMajor) ? input.amountMajor : 0,
      currency: input.currency,
      message: input.message,
      paystack_reference: input.reference,
      paid_at: undefined,
      payout_status: 'pending',
    })
  }
  const paid = await markContributionPaid(slug, input.reference)
  if (paid) {
    await linkPledgeAfterPayment(slug, input.reference, paid.id, input.pledge_id, {
      amountMajor: input.amountMajor,
      currency: input.currency,
    })
  }
  return paid
}

async function linkPledgeAfterPayment(
  slug: string,
  reference: string,
  contributionId: string,
  pledgeId: string | undefined,
  payment?: { amountMajor: number; currency: string },
): Promise<void> {
  const blob = await readBlob(slug)
  if (!blob) return
  const resolved = resolvePledgeIdForPayment(blob, {
    pledgeId,
    paystackReference: reference,
    amountMajor: payment?.amountMajor,
    currency: payment?.currency,
  })
  const contributions = [...blob.contributions]
  const cIdx = contributions.findIndex((c) => c.id === contributionId)
  if (cIdx !== -1 && resolved) {
    contributions[cIdx] = { ...contributions[cIdx], matched_pledge_id: resolved }
  }
  let memorial = blob.memorial
  if (resolved && memorial.pledges?.length) {
    memorial = {
      ...memorial,
      pledges: applyPledgeFulfillment(memorial.pledges, resolved, contributionId, reference),
    }
  }
  await writeBlob({ ...blob, memorial, contributions })
}

export async function getMemorialWithDetails(
  slug: string,
  opts?: { includeAllTributes?: boolean; includeCoordinatorFields?: boolean },
): Promise<MemorialWithDetails | null> {
  const blob = await getMemorialBlob(slug)
  if (!blob) return null
  return toDetails(blob, opts)
}

export async function listMemorialsByStatus(status: MemorialStatus): Promise<Memorial[]> {
  await ensureExampleMemorialSeeded()
  if (hasDatabaseEnv()) {
    try {
      const sql = getDb()
      const rows = await sql`
        SELECT blob FROM memorials WHERE status = ${status}
      `
      const out: Memorial[] = []
      for (const row of rows as { blob: unknown }[]) {
        const blob = parseStoredBlob(row.blob)
        if (blob) out.push(hydrateMemorial(blob.memorial))
      }
      return out
    } catch (err) {
      console.error('[passage] Postgres listMemorialsByStatus failed; using file/seed fallbacks', {
        status,
        err,
      })
    }
  }
  const fs = await getFileStore()
  const slugs = await fs.listSlugs()
  const out: Memorial[] = []
  for (const s of slugs) {
    const b = await fs.read(s)
    if (b?.memorial.status === status) out.push(hydrateMemorial(b.memorial))
  }
  return out
}

export interface CreateMemorialInput {
  slug: string
  tradition: Tradition
  deceased_name: string
  deceased_title?: string
  deceased_family_house?: string
  deceased_community?: string
  date_of_birth?: string
  date_of_passing: string
  place_of_passing?: string
  age?: number
  photo_url?: string
  gallery_urls?: string[]
  biography?: string
  surviving_family: SurvivingFamilyMember[]
  allied_families: string[]
  events: Omit<MemorialEvent, 'id' | 'memorial_id'>[]
  fundraising_active: boolean
  fundraising_goal?: number
  fundraising_currency: string
  fundraising_label?: string
  fundraising_appeal?: string
  coordinator_name: string
  coordinator_whatsapp: string
  coordinator_email: string
  coordinator_recovery_email?: string
  coordinator_pin_hash: string
  announcement_text?: string
  memorial_mode?: MemorialMode
  output_template?: import('@/lib/types').OutputTemplate
  visual_theme?: import('@/lib/types').VisualTheme
}

export async function createMemorial(input: CreateMemorialInput): Promise<Memorial> {
  await ensureExampleMemorialSeeded()
  const { v4: uuid } = await import('uuid')
  const id = uuid()
  const now = new Date().toISOString()
  const memorial: Memorial = {
    id,
    created_at: now,
    slug: input.slug,
    status: 'draft',
    deceased_name: input.deceased_name,
    deceased_title: input.deceased_title,
    deceased_family_house: input.deceased_family_house,
    deceased_community: input.deceased_community,
    date_of_birth: input.date_of_birth,
    date_of_passing: input.date_of_passing,
    place_of_passing: input.place_of_passing,
    age: input.age,
    photo_url: input.photo_url,
    gallery_urls: input.gallery_urls?.length ? [...input.gallery_urls] : undefined,
    biography: input.biography,
    tradition: input.tradition,
    surviving_family: input.surviving_family,
    allied_families: input.allied_families,
    coordinator_name: input.coordinator_name,
    coordinator_whatsapp: input.coordinator_whatsapp,
    coordinator_email: input.coordinator_email,
    announcement_text: input.announcement_text,
    memorial_mode: input.memorial_mode ?? 'notice',
    output_template: input.output_template ?? 'notice',
    visual_theme: input.visual_theme ?? 'programme',
    coordinator_recovery_email: input.coordinator_recovery_email,
    fundraising_goal: input.fundraising_goal,
    fundraising_currency: input.fundraising_currency || 'GHS',
    fundraising_label: input.fundraising_label,
    fundraising_active: input.fundraising_active,
    fundraising_appeal: input.fundraising_appeal,
  }
  const events: MemorialEvent[] = input.events.map((e, i) => ({
    id: uuid(),
    memorial_id: id,
    title: e.title,
    event_date: e.event_date,
    location: e.location,
    online_link: e.online_link,
    notes: e.notes,
    sort_order: e.sort_order ?? i,
  }))
  const blob: StoredMemorialBlob = {
    memorial,
    events,
    tributes: [],
    contributions: [],
    coordinator_pin_hash: input.coordinator_pin_hash,
  }
  if (await readBlob(input.slug)) {
    throw new Error('Slug already exists')
  }
  await writeBlob(blob)
  return memorial
}

export type MemorialPinUpdate = Partial<
  Pick<
    Memorial,
    | 'announcement_text'
    | 'fundraising_active'
    | 'fundraising_goal'
    | 'fundraising_currency'
    | 'fundraising_label'
    | 'fundraising_appeal'
    | 'poster_url'
    | 'poster_approved_at'
    | 'gallery_urls'
    | 'stakeholders'
    | 'public_contacts'
    | 'internal_contacts'
    | 'closing_thank_you'
    | 'wind_down_meetings'
    | 'memorial_mode'
    | 'output_template'
    | 'visual_theme'
    | 'tasks'
    | 'pledges'
    | 'closure_status'
    | 'closed_at'
    | 'closure_notes'
    | 'deceased_name'
    | 'deceased_title'
    | 'deceased_family_house'
    | 'deceased_community'
    | 'date_of_birth'
    | 'date_of_passing'
    | 'place_of_passing'
    | 'age'
    | 'coordinator_recovery_email'
    | 'last_bank_reconciliation'
  >
> & {
  photo_url?: string | null
  events?: MemorialEvent[]
  remembrance?: Remembrance | null
  programme_readings?: ProgrammeReading[]
}

export async function updateMemorialWithPin(
  slug: string,
  pin: string,
  patch: MemorialPinUpdate,
): Promise<Memorial | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (!verifyPin(pin, blob.coordinator_pin_hash)) return null

  const {
    events,
    stakeholders,
    remembrance,
    programme_readings,
    public_contacts,
    internal_contacts,
    wind_down_meetings,
    closing_thank_you,
    tasks,
    pledges,
    closure_status,
    closed_at,
    closure_notes,
    last_bank_reconciliation,
    ...memorialFields
  } = patch
  const memorial: Memorial = { ...blob.memorial }
  for (const [key, value] of Object.entries(memorialFields) as [keyof Memorial, unknown][]) {
    if (value === undefined) continue
    if (key === 'photo_url' && (value === null || value === '')) {
      delete (memorial as { photo_url?: string }).photo_url
      continue
    }
    ;(memorial as unknown as Record<string, unknown>)[key as string] = value
  }
  if (stakeholders !== undefined) {
    memorial.stakeholders = stakeholders.length ? stakeholders : undefined
  }
  if (remembrance !== undefined) {
    if (remembrance === null) {
      delete memorial.remembrance
    } else {
      memorial.remembrance = remembrance
    }
  }
  if (programme_readings !== undefined) {
    memorial.programme_readings = programme_readings.length ? programme_readings : undefined
  }
  if (public_contacts !== undefined) {
    memorial.public_contacts = public_contacts.length ? public_contacts : undefined
    if (public_contacts.length > 0) {
      const first = public_contacts[0]
      memorial.coordinator_name = first.name
      if (first.email) memorial.coordinator_email = first.email
      if (first.whatsapp || first.phone) {
        memorial.coordinator_whatsapp = first.whatsapp || first.phone
      }
    }
  }
  if (internal_contacts !== undefined) {
    memorial.internal_contacts = internal_contacts.length ? internal_contacts : undefined
  }
  if (closing_thank_you !== undefined) {
    const v = typeof closing_thank_you === 'string' ? closing_thank_you.trim() : ''
    if (v) memorial.closing_thank_you = v
    else delete memorial.closing_thank_you
  }
  if (wind_down_meetings !== undefined) {
    memorial.wind_down_meetings = wind_down_meetings.length ? wind_down_meetings : undefined
  }
  if (tasks !== undefined) {
    memorial.tasks = tasks.length ? tasks : undefined
  }
  if (pledges !== undefined) {
    memorial.pledges = pledges.length ? pledges : undefined
  }
  if (closure_status !== undefined) {
    memorial.closure_status = closure_status
    if (closure_status === 'closed' && !memorial.closed_at) {
      memorial.closed_at = new Date().toISOString()
    }
    if (closure_status === 'active') {
      delete memorial.closed_at
    }
  }
  if (closed_at !== undefined) {
    if (closed_at) memorial.closed_at = closed_at
    else delete memorial.closed_at
  }
  if (closure_notes !== undefined) {
    const v = typeof closure_notes === 'string' ? closure_notes.trim() : ''
    if (v) memorial.closure_notes = v
    else delete memorial.closure_notes
  }
  if (last_bank_reconciliation !== undefined) {
    if (last_bank_reconciliation) memorial.last_bank_reconciliation = last_bank_reconciliation
    else delete memorial.last_bank_reconciliation
  }
  const nextEvents =
    events?.map((e) => ({
      ...e,
      memorial_id: blob.memorial.id,
    })) ?? blob.events

  await writeBlob({
    ...blob,
    memorial,
    events: nextEvents,
  })
  return memorial
}

export async function submitMemorialForReview(
  slug: string,
  pin: string,
): Promise<Memorial | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (!verifyPin(pin, blob.coordinator_pin_hash)) return null
  if (blob.memorial.status !== 'draft') return null
  await writeBlob({
    ...blob,
    memorial: { ...blob.memorial, status: 'pending_review' },
  })
  return { ...blob.memorial, status: 'pending_review' }
}

export async function adminApproveMemorial(slug: string): Promise<Memorial | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (blob.memorial.status !== 'pending_review') return null
  await writeBlob({
    ...blob,
    memorial: { ...blob.memorial, status: 'live' },
  })
  return { ...blob.memorial, status: 'live' }
}

export async function addTribute(
  slug: string,
  input: Pick<Tribute, 'author_name' | 'author_location' | 'message' | 'video_url'>,
): Promise<Tribute | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  const { v4: uuid } = await import('uuid')
  const tribute: Tribute = {
    id: uuid(),
    memorial_id: blob.memorial.id,
    author_name: input.author_name,
    author_location: input.author_location,
    message: input.message,
    video_url: input.video_url,
    created_at: new Date().toISOString(),
    approved: false,
  }
  await writeBlob({
    ...blob,
    tributes: [...blob.tributes, tribute],
  })
  return tribute
}

export async function approveTributeWithPin(
  slug: string,
  pin: string,
  tributeId: string,
): Promise<Tribute | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (!verifyPin(pin, blob.coordinator_pin_hash)) return null
  const idx = blob.tributes.findIndex((t) => t.id === tributeId)
  if (idx === -1) return null
  const tributes = [...blob.tributes]
  tributes[idx] = { ...blob.tributes[idx], approved: true }
  await writeBlob({ ...blob, tributes })
  return tributes[idx]
}

export async function setTributeImageWithPin(
  slug: string,
  pin: string,
  tributeId: string,
  imageUrl: string,
): Promise<Tribute | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (!verifyPin(pin, blob.coordinator_pin_hash)) return null
  const idx = blob.tributes.findIndex((t) => t.id === tributeId)
  if (idx === -1) return null
  const tributes = [...blob.tributes]
  tributes[idx] = { ...blob.tributes[idx], image_url: imageUrl }
  await writeBlob({ ...blob, tributes })
  return tributes[idx]
}

export async function clearTributeImageWithPin(
  slug: string,
  pin: string,
  tributeId: string,
): Promise<Tribute | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (!verifyPin(pin, blob.coordinator_pin_hash)) return null
  const idx = blob.tributes.findIndex((t) => t.id === tributeId)
  if (idx === -1) return null
  const tributes = [...blob.tributes]
  const current = { ...blob.tributes[idx] }
  delete current.image_url
  tributes[idx] = current
  await writeBlob({ ...blob, tributes })
  return tributes[idx]
}

export async function addContributionRecord(
  slug: string,
  c: Omit<Contribution, 'id' | 'memorial_id'>,
): Promise<Contribution | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  const { v4: uuid } = await import('uuid')
  const row: Contribution = {
    id: uuid(),
    memorial_id: blob.memorial.id,
    contributor_name: c.contributor_name,
    contributor_whatsapp: c.contributor_whatsapp,
    amount: c.amount,
    currency: c.currency,
    message: c.message,
    paystack_reference: c.paystack_reference,
    paid_at: c.paid_at,
    payout_status: c.payout_status,
  }
  await writeBlob({
    ...blob,
    contributions: [...blob.contributions, row],
  })
  return row
}

export async function markContributionPaid(
  slug: string,
  reference: string,
): Promise<Contribution | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  const idx = blob.contributions.findIndex((c) => c.paystack_reference === reference)
  if (idx === -1) return null
  const row: Contribution = {
    ...blob.contributions[idx],
    paid_at: new Date().toISOString(),
    payout_status: 'paid',
  }
  const contributions = [...blob.contributions]
  contributions[idx] = row
  await writeBlob({ ...blob, contributions })
  return row
}

export async function verifyCoordinatorPin(slug: string, pin: string): Promise<boolean> {
  const blob = await readBlob(slug)
  if (!blob) return false
  return verifyPin(pin, blob.coordinator_pin_hash)
}
