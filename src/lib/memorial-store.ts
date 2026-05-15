import type {
  Contribution,
  Memorial,
  MemorialEvent,
  MemorialStatus,
  MemorialWithDetails,
  StoredMemorialBlob,
  SurvivingFamilyMember,
  Tribute,
  Tradition,
} from '@/lib/types'
import { verifyPin } from '@/lib/crypto-pin'
import { getExampleMemorialBlob } from '@/lib/seed-memorial'

const EXAMPLE_SLUG = 'bannerman-samuel-2026'

function sumRaised(contributions: Contribution[]): number {
  return contributions
    .filter((c) => c.payout_status !== 'failed' && c.paid_at)
    .reduce((acc, c) => acc + c.amount, 0)
}

function toPublicMemorial(m: Memorial): Memorial {
  return { ...m }
}

function toDetails(
  blob: StoredMemorialBlob,
  opts?: { includeAllTributes?: boolean },
): MemorialWithDetails {
  const tributes = opts?.includeAllTributes
    ? blob.tributes
    : blob.tributes.filter((t) => t.approved)
  return {
    ...toPublicMemorial(blob.memorial),
    events: [...blob.events].sort((a, b) => a.sort_order - b.sort_order),
    tributes,
    total_raised: sumRaised(blob.contributions),
    tribute_count: tributes.length,
  }
}

async function getFileStore(): Promise<{
  read: (slug: string) => Promise<StoredMemorialBlob | null>
  write: (slug: string, blob: StoredMemorialBlob) => Promise<void>
  listSlugs: () => Promise<string[]>
}> {
  const { mkdir, readFile, writeFile, readdir } = await import('node:fs/promises')
  const path = await import('node:path')
  const root = path.join(process.cwd(), '.passage-dev', 'memorials')

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

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}

async function getSupabase() {
  if (!hasSupabaseEnv()) return null
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

async function readFromSupabase(slug: string): Promise<StoredMemorialBlob | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data: row, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !row) return null

  const memorial: Memorial = {
    id: row.id,
    created_at: row.created_at,
    slug: row.slug,
    status: row.status,
    deceased_name: row.deceased_name,
    deceased_title: row.deceased_title ?? undefined,
    deceased_family_house: row.deceased_family_house ?? undefined,
    deceased_community: row.deceased_community ?? undefined,
    date_of_birth: row.date_of_birth ?? undefined,
    date_of_passing: row.date_of_passing,
    photo_url: row.photo_url ?? undefined,
    biography: row.biography ?? undefined,
    tradition: row.tradition,
    surviving_family: (row.surviving_family as SurvivingFamilyMember[]) ?? [],
    allied_families: row.allied_families ?? [],
    coordinator_name: row.coordinator_name ?? undefined,
    coordinator_whatsapp: row.coordinator_whatsapp ?? undefined,
    coordinator_email: row.coordinator_email ?? undefined,
    poster_url: row.poster_url ?? undefined,
    poster_approved_at: row.poster_approved_at ?? undefined,
    announcement_text: row.announcement_text ?? undefined,
    fundraising_goal: row.fundraising_goal ?? undefined,
    fundraising_currency: row.fundraising_currency ?? 'GHS',
    fundraising_label: row.fundraising_label ?? undefined,
    fundraising_active: row.fundraising_active ?? false,
    fundraising_appeal: row.fundraising_appeal ?? undefined,
  }

  const [{ data: ev }, { data: tr }, { data: co }] = await Promise.all([
    supabase.from('events').select('*').eq('memorial_id', row.id),
    supabase.from('tributes').select('*').eq('memorial_id', row.id),
    supabase.from('contributions').select('*').eq('memorial_id', row.id),
  ])

  return {
    memorial,
    events: (ev ?? []) as MemorialEvent[],
    tributes: (tr ?? []) as Tribute[],
    contributions: (co ?? []) as Contribution[],
    coordinator_pin_hash: row.coordinator_pin as string,
  }
}

async function writeToSupabase(blob: StoredMemorialBlob): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const m = blob.memorial
  const upsert = {
    id: m.id,
    created_at: m.created_at,
    slug: m.slug,
    status: m.status,
    deceased_name: m.deceased_name,
    deceased_title: m.deceased_title ?? null,
    deceased_family_house: m.deceased_family_house ?? null,
    deceased_community: m.deceased_community ?? null,
    date_of_birth: m.date_of_birth ?? null,
    date_of_passing: m.date_of_passing,
    photo_url: m.photo_url ?? null,
    biography: m.biography ?? null,
    tradition: m.tradition,
    surviving_family: m.surviving_family,
    allied_families: m.allied_families,
    coordinator_name: m.coordinator_name ?? null,
    coordinator_whatsapp: m.coordinator_whatsapp ?? null,
    coordinator_email: m.coordinator_email ?? null,
    poster_url: m.poster_url ?? null,
    poster_approved_at: m.poster_approved_at ?? null,
    announcement_text: m.announcement_text ?? null,
    fundraising_goal: m.fundraising_goal ?? null,
    fundraising_currency: m.fundraising_currency,
    fundraising_label: m.fundraising_label ?? null,
    fundraising_active: m.fundraising_active,
    fundraising_appeal: m.fundraising_appeal ?? null,
    coordinator_pin: blob.coordinator_pin_hash,
  }
  const { error } = await supabase.from('memorials').upsert(upsert)
  if (error) throw error

  await supabase.from('events').delete().eq('memorial_id', m.id)
  if (blob.events.length) {
    const { error: e2 } = await supabase.from('events').insert(
      blob.events.map((e) => ({
        id: e.id,
        memorial_id: m.id,
        title: e.title,
        event_date: e.event_date ?? null,
        location: e.location ?? null,
        online_link: e.online_link ?? null,
        notes: e.notes ?? null,
        sort_order: e.sort_order,
      })),
    )
    if (e2) throw e2
  }

  await supabase.from('tributes').delete().eq('memorial_id', m.id)
  if (blob.tributes.length) {
    const { error: e3 } = await supabase.from('tributes').insert(
      blob.tributes.map((t) => ({
        id: t.id,
        memorial_id: m.id,
        author_name: t.author_name,
        author_location: t.author_location ?? null,
        message: t.message ?? null,
        video_url: t.video_url ?? null,
        created_at: t.created_at,
        approved: t.approved,
      })),
    )
    if (e3) throw e3
  }

  await supabase.from('contributions').delete().eq('memorial_id', m.id)
  if (blob.contributions.length) {
    const { error: e4 } = await supabase.from('contributions').insert(
      blob.contributions.map((c) => ({
        id: c.id,
        memorial_id: m.id,
        contributor_name: c.contributor_name ?? null,
        contributor_whatsapp: c.contributor_whatsapp ?? null,
        amount: c.amount,
        currency: c.currency,
        message: c.message ?? null,
        paystack_reference: c.paystack_reference ?? null,
        paid_at: c.paid_at ?? null,
        payout_status: c.payout_status,
      })),
    )
    if (e4) throw e4
  }
}

async function readBlob(slug: string): Promise<StoredMemorialBlob | null> {
  if (hasSupabaseEnv()) {
    const s = await readFromSupabase(slug)
    if (s) return s
  }
  const fs = await getFileStore()
  return fs.read(slug)
}

async function writeBlob(blob: StoredMemorialBlob): Promise<void> {
  if (hasSupabaseEnv()) {
    await writeToSupabase(blob)
  }
  const fs = await getFileStore()
  await fs.write(blob.memorial.slug, blob)
}

export async function ensureExampleMemorialSeeded(): Promise<void> {
  const existing = await readBlob(EXAMPLE_SLUG)
  if (existing) return
  const example = getExampleMemorialBlob()
  await writeBlob(example)
}

export async function getMemorialBlob(slug: string): Promise<StoredMemorialBlob | null> {
  await ensureExampleMemorialSeeded()
  return readBlob(slug)
}

export async function getMemorialWithDetails(
  slug: string,
  opts?: { includeAllTributes?: boolean },
): Promise<MemorialWithDetails | null> {
  const blob = await getMemorialBlob(slug)
  if (!blob) return null
  return toDetails(blob, opts)
}

export async function listMemorialsByStatus(status: MemorialStatus): Promise<Memorial[]> {
  await ensureExampleMemorialSeeded()
  if (hasSupabaseEnv()) {
    const supabase = await getSupabase()
    if (!supabase) return []
    const { data, error } = await supabase.from('memorials').select('*').eq('status', status)
    if (error || !data) return []
    return data.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      slug: row.slug,
      status: row.status,
      deceased_name: row.deceased_name,
      deceased_title: row.deceased_title ?? undefined,
      deceased_family_house: row.deceased_family_house ?? undefined,
      deceased_community: row.deceased_community ?? undefined,
      date_of_birth: row.date_of_birth ?? undefined,
      date_of_passing: row.date_of_passing,
      photo_url: row.photo_url ?? undefined,
      biography: row.biography ?? undefined,
      tradition: row.tradition as Tradition,
      surviving_family: (row.surviving_family as SurvivingFamilyMember[]) ?? [],
      allied_families: row.allied_families ?? [],
      coordinator_name: row.coordinator_name ?? undefined,
      coordinator_whatsapp: row.coordinator_whatsapp ?? undefined,
      coordinator_email: row.coordinator_email ?? undefined,
      poster_url: row.poster_url ?? undefined,
      poster_approved_at: row.poster_approved_at ?? undefined,
      announcement_text: row.announcement_text ?? undefined,
      fundraising_goal: row.fundraising_goal ?? undefined,
      fundraising_currency: row.fundraising_currency ?? 'GHS',
      fundraising_label: row.fundraising_label ?? undefined,
      fundraising_active: row.fundraising_active ?? false,
      fundraising_appeal: row.fundraising_appeal ?? undefined,
    }))
  }
  const fs = await getFileStore()
  const slugs = await fs.listSlugs()
  const out: Memorial[] = []
  for (const s of slugs) {
    const b = await fs.read(s)
    if (b?.memorial.status === status) out.push(toPublicMemorial(b.memorial))
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
  photo_url?: string
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
  coordinator_pin_hash: string
  announcement_text?: string
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
    photo_url: input.photo_url,
    biography: input.biography,
    tradition: input.tradition,
    surviving_family: input.surviving_family,
    allied_families: input.allied_families,
    coordinator_name: input.coordinator_name,
    coordinator_whatsapp: input.coordinator_whatsapp,
    coordinator_email: input.coordinator_email,
    announcement_text: input.announcement_text,
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

export async function updateMemorialWithPin(
  slug: string,
  pin: string,
  patch: Partial<
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
    >
  > & { events?: MemorialEvent[] },
): Promise<Memorial | null> {
  const blob = await readBlob(slug)
  if (!blob) return null
  if (!verifyPin(pin, blob.coordinator_pin_hash)) return null

  const { events, ...memorialFields } = patch
  const memorial: Memorial = {
    ...blob.memorial,
    ...memorialFields,
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
