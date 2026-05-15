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
- Next.js 15+ (App Router) on Vercel Edge where possible
- Upstash Redis (session state, caching)
- **Neon Postgres** (optional hosted database via `DATABASE_URL` / `POSTGRES_URL`; local default is `.passage-dev/memorials/*.json`)
- **Vercel Blob** (optional production image uploads via `BLOB_READ_WRITE_TOKEN`; local dev uses `.passage-dev/uploads/`)
- OpenAI API (GPT-4o for content generation, DALL-E 3 for poster generation)
- Paystack (payment processing — Ghana + Nigeria)
- WhatsApp Business API / Meta Cloud API (Phase 2)
- Tailwind CSS

## Environment variables needed
```
OPENAI_API_KEY=
OCR_SERVICE_URL=
OCR_SERVICE_KEY=
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
DATABASE_URL=
POSTGRES_URL=
BLOB_READ_WRITE_TOKEN=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=https://passage.africa
RESEND_API_KEY=
RESEND_FROM_EMAIL=
CRON_SECRET=
# Phase 2 — WhatsApp Business API (not wired in MVP)
# WHATSAPP_ACCESS_TOKEN=
# WHATSAPP_PHONE_NUMBER_ID=
```

### OCR (document scanning)
- `POST /api/ocr` — multipart `file` + `doc_type` (`funeral_poster`, `death_certificate`, `bank_statement`, `mobile_money`, `vendor_invoice`, `tribute_letter`).
- `src/lib/ocr.ts` — mocr raw text + OpenAI (then Anthropic) JSON extraction; `isOcrConfigured()` gates the route.
- UI: `PosterScanPanel` (review/apply, never auto-save), `OCRUpload` (dropzone). Create wizard step Deceased; edit portal Photos + bank reconciliation.
- **Privacy:** scans go to configured OCR/LLM providers; not persisted by the OCR route. Family must confirm before publish.

### Recent MVP lanes (coordinator)
- **Closure** — `memorial.closure_status` (`active`|`closed`), `closed_at`, `closure_notes`; edit portal close/reopen; `/memorial/[slug]/closure` print sheet; public closed banner hides fundraise CTA.
- **Scheduled reminders** — `reminder_jobs` table (`003_reminder_jobs.sql`); `POST …/reminders/schedule` + Vercel Cron `GET /api/cron/reminders` with `CRON_SECRET`; email only (WhatsApp = copy buttons; WABA Phase 2).
- **Pledge ↔ payment** — `pledge_id` in Paystack metadata; `completeContributionPayment` fulfills pledge; optional `pledge.paystack_reference`; conservative exact amount+currency match when exactly one open pledge qualifies.
- **PIN recovery** — `004_pin_recovery_tokens.sql`; `POST …/pin/recovery-request` + `…/pin/reset`; `coordinator_recovery_email`; rate limit on blob.
- **Bank reconciliation** — `last_bank_reconciliation` on memorial blob; edit portal match UI (no auto-link).
- **Output template** — `output_template` (`notice`|`programme`|`banner_classic`); root CSS on public + print.
- **OCR deceased fields** — death certificate + poster apply checkboxes for core deceased fields; PATCH via `memorial-patch-body`.
- **Pledges** — `memorial.pledges[]` on blob; public when programme/full or fundraising active; edit portal CRUD + WhatsApp reminder copy packs.
- **Printer pack** — `/memorial/[slug]/printer-guide`, `/print`, `/banner`, `/banner/wide` (~3×6 ft).
- **Paystack** — prefer global webhook `POST /api/paystack/webhook` (slug from `metadata.memorial_slug`); per-slug route kept for compatibility.
- **Email reminders** — `POST /api/memorials/[slug]/reminders/send` via Resend when `RESEND_API_KEY` set; tasks, events, pledges.

## Database schema (Neon / Postgres)

Migrations live in `db/migrations/`. The app uses **`@neondatabase/serverless`** from server routes (`src/lib/db.ts`) and stores one row per memorial.

### `memorials` table (authoritative)

```sql
id uuid primary key,
slug text unique not null,
status text not null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
blob jsonb not null
```

- **`blob`** is the full `StoredMemorialBlob` from `src/lib/types.ts`: `{ memorial, events, tributes, contributions, coordinator_pin_hash }`. All memorial fields (including `memorial_mode`, `gallery_urls`, `stakeholders`, `remembrance`, contacts, closing copy, wind-down meetings, etc.) live inside `blob.memorial` or the sibling arrays as in the TypeScript types.
- **`status`** duplicates `blob.memorial.status` for efficient admin listing (`WHERE status = 'pending_review'`).
- **Local dev without `DATABASE_URL`:** same logical document is written as formatted JSON under `.passage-dev/memorials/<slug>.json`.

Apply with: `psql "$DATABASE_URL" -f db/migrations/001_init.sql` (see `README.md`).

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
  'ghana-muslim': {
    label: 'Ghanaian Muslim',
    openingLine: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّٰهِ\nWith humble hearts, the Muslim family announces the passing of',
    dateFormat: '{dob} — {dop}',
    photoRequired: false,
    religiousClose: 'May Allah grant him/her Al-Jannah Firdaus. Ameen.',
    familyOrder: ['spouse', 'children', 'parents', 'siblings'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: true,
    urgencyNote: 'Janazah prayer and burial will follow Islamic rites; the family will announce date, time, and venue in due course.',
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

## Memorial modes (`memorial_mode`)

- **`notice`** — Public page reads like a single-scroll announcement: hero, share panel, announcement, family liaison cards (from `public_contacts` / legacy coordinator fields), fundraising if active, thank-you when set, and the “leave a message” form. Hides stakeholder directory, remembrance block, gallery, programme list, approved tribute excerpts, and wind-down meetings (coordinator-only content remains in the edit portal).
- **`programme`** — Adds remembrance, **programme readings** (`programme_readings[]`), gallery, programme events, full key contacts (public stakeholders + liaison), tribute wall, and closing meetings when marked public.
- **`full`** — Same public surface as `programme` for now (reserved for future deeper coordination / tasks).

Default is **`notice`**. The create wizard first step sets the mode; coordinators can change it in the edit portal (`PATCH` with validated `memorial_mode`).

## Programme readings

- Stored on **`memorial.programme_readings`**: `{ id, type: scripture|hymn|quran|upload, title, sort_order?, visibility?, … }`.
- Curated templates in **`src/lib/programme-reading-library.ts`** (`getSuggestedReadings`, `findHymn`, `findScripture`).
- Programme page uploads: images API **`slot=programme`** → URL on reading `document_url`.
- Public/print: filtered by `visibility` and gated by `memorial_mode` programme/full (see `programmeReadingsForPublicPage` in `memorial-hydrate.ts`).

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
- NEVER default Ghana Muslim families to `nigeria-muslim` — use `ghana-muslim` (allied families, family house, traditional title enabled)
- NEVER make the family feel like a customer — they are a family
- ALWAYS show the family what the AI generated and let them change it

