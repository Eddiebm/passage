import { NextResponse } from 'next/server'
import { createMemorial, getMemorialBlob } from '@/lib/memorial-store'
import { generateCoordinatorPin, hashPin } from '@/lib/crypto-pin'
import { normalizeMemorialMode, normalizeOutputTemplate } from '@/lib/memorial-hydrate'
import { buildMemorialSlug } from '@/lib/slugify'
import { isTradition } from '@/lib/tradition-presets'
import {
  generateAnnouncementDraft,
  generateFundraisingAppealDraft,
} from '@/lib/openai-copy'
import type { CreateMemorialForm, MemorialEvent, SurvivingFamilyMember } from '@/lib/types'

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let n = 0
  while (await getMemorialBlob(slug)) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateMemorialForm> & {
    slug?: string
    custom_slug?: string
  }

  if (!body.deceased_name || !body.date_of_passing || !body.tradition) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!isTradition(body.tradition)) {
    return NextResponse.json({ error: 'Invalid tradition' }, { status: 400 })
  }

  const baseSlug =
    (body.custom_slug || body.slug || buildMemorialSlug(body.deceased_name, body.date_of_passing))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 120) || `memorial-${Date.now()}`
  const slug = await uniqueSlug(baseSlug)

  const surviving_family: SurvivingFamilyMember[] = Array.isArray(body.surviving_family)
    ? body.surviving_family.filter((m) => m?.name?.trim())
    : []

  const rawAllied = body.allied_families as unknown
  const allied_families = Array.isArray(rawAllied)
    ? rawAllied.map((s) => String(s).trim()).filter(Boolean)
    : typeof rawAllied === 'string'
      ? rawAllied.split('\n').map((s) => s.trim()).filter(Boolean)
      : []

  const eventsInput = Array.isArray(body.events) ? body.events : []
  const events: Omit<MemorialEvent, 'id' | 'memorial_id'>[] = eventsInput.map((e, i) => ({
    title: e.title || 'Event',
    event_date: e.event_date || undefined,
    location: e.location || undefined,
    online_link: e.online_link || undefined,
    notes: e.notes || undefined,
    sort_order: e.sort_order ?? i,
  }))

  const fundraising_goal =
    body.fundraising_active && body.fundraising_goal
      ? Number.parseInt(String(body.fundraising_goal).replace(/,/g, ''), 10)
      : undefined

  const memorialContext = {
    deceased_name: body.deceased_name,
    deceased_title: body.deceased_title,
    deceased_family_house: body.deceased_family_house,
    deceased_community: body.deceased_community,
    date_of_birth: body.date_of_birth,
    date_of_passing: body.date_of_passing,
    tradition: body.tradition,
    surviving_family,
    allied_families,
    biography: body.biography,
  }

  const [announcement_text, fundraising_appeal] = await Promise.all([
    generateAnnouncementDraft({ memorial: memorialContext }),
    body.fundraising_active
      ? generateFundraisingAppealDraft({
          memorial: {
            deceased_name: body.deceased_name,
            tradition: body.tradition,
            surviving_family,
            fundraising_label: body.fundraising_label,
          },
          goal: Number.isFinite(fundraising_goal) ? fundraising_goal : undefined,
          currency: body.fundraising_currency || 'GHS',
        })
      : Promise.resolve(''),
  ])

  const pin = generateCoordinatorPin()
  const coordinator_pin_hash = hashPin(pin)

  const ageRaw = body.age?.trim()
  const ageParsed = ageRaw ? Number.parseInt(ageRaw, 10) : undefined

  const memorial = await createMemorial({
    slug,
    tradition: body.tradition,
    memorial_mode: normalizeMemorialMode(body.memorial_mode),
    output_template: normalizeOutputTemplate(body.output_template),
    deceased_name: body.deceased_name,
    deceased_title: body.deceased_title || undefined,
    deceased_family_house: body.deceased_family_house || undefined,
    deceased_community: body.deceased_community || undefined,
    date_of_birth: body.date_of_birth || undefined,
    date_of_passing: body.date_of_passing,
    place_of_passing: body.place_of_passing?.trim() || undefined,
    age: Number.isFinite(ageParsed) ? ageParsed : undefined,
    photo_url: body.photo_url?.trim() || undefined,
    biography: body.biography || undefined,
    surviving_family,
    allied_families,
    events,
    fundraising_active: Boolean(body.fundraising_active),
    fundraising_goal: Number.isFinite(fundraising_goal) ? fundraising_goal : undefined,
    fundraising_currency: body.fundraising_currency || 'GHS',
    fundraising_label: body.fundraising_label || undefined,
    fundraising_appeal: body.fundraising_active ? fundraising_appeal || body.fundraising_appeal : undefined,
    coordinator_name: body.coordinator_name || 'Family coordinator',
    coordinator_whatsapp: body.coordinator_whatsapp || '',
    coordinator_email: body.coordinator_email || '',
    coordinator_recovery_email: body.coordinator_recovery_email?.trim() || undefined,
    coordinator_pin_hash,
    announcement_text,
  })

  return NextResponse.json({
    memorial,
    coordinator_pin: pin,
    memorial_url: `/memorial/${slug}`,
    edit_url: `/memorial/${slug}/edit`,
  })
}
