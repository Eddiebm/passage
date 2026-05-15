@AGENTS.md

# PASSAGE — Build Instructions

## What this is
Passage is the digital infrastructure for how African communities process death. Not a poster tool — the full lifecycle platform from the moment someone dies through burial, remembrance services, and years beyond.

Powered by IdeaByLunch. Built for Ghana and Nigeria first, pan-African sub-continent vision.

## The founder context
The founder (Eddie) is Ghanaian. He has lived through exactly what this product solves — a WhatsApp group full of manually coordinated payment links, meeting invites sent across US/UK/Australia time zones, emotional appeals written by hand, and formal announcements that required someone who knew that "Weku Nukpa of the Bannerman family of Kanlow in Ngleshie Alata Jamestown" is not an optional detail. Build with that knowledge.

## Core product principles
1. **Family edits final** — Nothing ever publishes without the family seeing and approving it. Non-negotiable. The AI drafts. The family owns.
2. **Meet people where they are** — Bot/intake in Pidgin English. Output (poster, memorial page) in formal English. Never cold, never corporate.
3. **One coordinator shouldn't have to do everything** — The platform absorbs the admin so the family can grieve.
4. **Cultural precision** — Traditional titles, family houses, allied families, "Sunrise/Sunset" — these are not optional fields.

## Tech stack
- Next.js 15 (App Router) on Vercel Edge where possible
- Upstash Redis (session state, caching)
- Supabase (PostgreSQL + file storage for photos and generated posters)
- OpenAI API (GPT-4o for content generation, DALL-E 3 for poster generation)
- Paystack (payment processing — Ghana + Nigeria)
- WhatsApp Business API / Meta Cloud API (Phase 2)
- Tailwind CSS

## Environment variables needed
```
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=https://passage.africa
```

## Database schema (Supabase)

### `memorials` table
```sql
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
slug text unique not null,
status text default 'draft', -- draft | pending_review | live

-- Deceased info
deceased_name text not null,
deceased_title text,
deceased_family_house text,
deceased_community text,
date_of_birth date,
date_of_passing date not null,
photo_url text,
biography text,

-- Tradition preset
tradition text not null default 'ghana-christian',
-- options: ghana-christian | nigeria-christian | nigeria-muslim | diaspora

-- Surviving family (JSON array)
surviving_family jsonb default '[]',
-- [{title: "Wife", name: "Hon. Mrs. Cecilia...", note: "former Minister of..."}, ...]

-- Allied families
allied_families text[],

-- Contact family (who manages this memorial)
coordinator_name text,
coordinator_whatsapp text,
coordinator_email text,
coordinator_pin text, -- hashed PIN for edit access

-- Generated assets
poster_url text,
poster_approved_at timestamptz,
announcement_text text, -- GPT-4o generated, family-editable

-- Fundraising
fundraising_goal integer,
fundraising_currency text default 'GHS',
fundraising_label text,
fundraising_active boolean default false,
fundraising_appeal text -- GPT-4o generated appeal, family-editable
```

### `events` table
```sql
id uuid primary key default gen_random_uuid(),
memorial_id uuid references memorials(id),
title text not null,
event_date timestamptz,
location text,
online_link text,
notes text,
sort_order integer default 0
```

### `contributions` table
```sql
id uuid primary key default gen_random_uuid(),
memorial_id uuid references memorials(id),
contributor_name text,
contributor_whatsapp text,
amount integer not null,
currency text not null,
message text,
paystack_reference text unique,
paid_at timestamptz,
payout_status text default 'pending'
```

### `tributes` table
```sql
id uuid primary key default gen_random_uuid(),
memorial_id uuid references memorials(id),
author_name text not null,
author_location text,
message text,
video_url text,
created_at timestamptz default now(),
approved boolean default false
```

## Cultural presets

```typescript
export const TRADITION_PRESETS = {
  'ghana-christian': {
    label: 'Ghanaian Christian',
    openingLine: 'It is with profound sadness that the family announces the passing of',
    dateFormat: 'Sunrise: {dob} | Sunset: {dop}',
    photoRequired: true,
    religiousClose: 'May his/her soul rest in perfect peace. Amen.',
    familyOrder: ['spouse', 'children', 'siblings', 'parents'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: true,
  },
  'nigeria-christian': {
    label: 'Nigerian Christian',
    openingLine: 'The family of the late',
    dateFormat: 'Born: {dob} | Called to Glory: {dop}',
    photoRequired: true,
    religiousClose: 'He/She has fought a good fight. He/She has finished the course. He/She has kept the faith.',
    familyOrder: ['spouse', 'children', 'siblings', 'parents'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: false,
  },
  'nigeria-muslim': {
    label: 'Nigerian Muslim',
    openingLine: 'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُون\nIndeed, to Allah we belong and to Him we shall return.',
    dateFormat: '{dob} — {dop}',
    photoRequired: false,
    religiousClose: 'May Allah grant him/her Al-Jannah Firdaus. Ameen.',
    familyOrder: ['spouse', 'children', 'parents', 'siblings'],
    includeAlliedFamilies: false,
    includeTraditionalTitle: false,
    includeFamilyHouse: false,
    urgencyNote: 'Janazah prayer and burial to follow Islamic rites.',
  },
  'diaspora': {
    label: 'Diaspora (Multi-location)',
    openingLine: 'It is with deep sorrow that the family announces the passing of',
    dateFormat: 'Sunrise: {dob} | Sunset: {dop}',
    photoRequired: true,
    religiousClose: 'He/She will be deeply missed by all who knew him/her.',
    familyOrder: ['spouse', 'children', 'siblings', 'parents'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: true,
    diasporaMode: true,
    multiTimezone: true,
  },
}
```

## Pages to build

### `/` — Landing page
Dark, premium. Headline: "Every life deserves to be remembered." Subheadline: The platform that holds your family together from the moment someone passes. CTA: "Create a memorial" (primary) and "See an example" (secondary).

### `/create` — Multi-step memorial intake form
Steps:
1. Tradition — choose preset
2. Deceased — name, title, family house, DOB, DOP, photo, biography
3. Family — surviving family (dynamic list: role + name + note), allied families
4. Events — add all ceremony events with dates, locations, Zoom links
5. Fundraising — goal amount, currency (GHS/NGN/GBP/USD), label, appeal
6. Coordinator — name, WhatsApp, email (receives PIN for edit access)
7. Review & Approve — show full draft, family edits here, explicit approve before publish

### `/memorial/[slug]` — The memorial page
- Hero: name, dates, photo
- Announcement text
- Events programme (all ceremonies, timezone converter)
- Tribute wall (messages + video remembrances)
- Fundraising widget (goal, progress bar, contribute button)
- WhatsApp share kit
- "Leave a tribute" form

### `/memorial/[slug]/contribute` — Paystack checkout
Amount selector, message, name. On success: redirect back, WhatsApp alert to coordinator.

### `/memorial/[slug]/edit` — Family edit portal
PIN-protected. Edit announcement, events, fundraising. Approve poster. Add/remove events.

### `/admin` — Internal review queue
Password-protected. Shows pending_review memorials. Approve or request changes.

## Content generation

Use GPT-4o to generate:
1. **Announcement text** — formatted per tradition preset, using all submitted family data
2. **Fundraising appeal** — in the voice of the family (warm, urgent, personal — like Nii Lantey's message)
3. **Thank you messages** (post-funeral) — personalised per contributor

Poster: DALL-E 3 generates the visual template → sharp composites the deceased's photo in afterward.

**Nothing publishes without family approval on `/memorial/[slug]/edit`.**

## Phase 2 (not in MVP)
- WhatsApp bot intake (Pidgin English)
- Automated WhatsApp notifications
- Video tribute upload
- Repatriation mode (death abroad)
- Annual remembrance re-activation
- Thank you message sending

## Style
- Font: system-ui / -apple-system
- Palette: Near-black (#1A1A1A), warm white (#FAFAF8), gold (#C9A02C), deep brown (#3D2B1F)
- Tone: Warm, dignified, never cold or corporate
- No generic Western obituary language
- No stock funeral imagery

## Critical rules
- NEVER publish without family approval
- NEVER skip traditional titles, family house, allied families for Ghana Christian preset
- NEVER make the family feel like a customer — they are a family
- ALWAYS show the family what the AI generated and let them change it

