# Passage

Digital memorial infrastructure — programmes, family-edited announcements, tributes, and contributions (Paystack) for Ghana, Nigeria, and the diaspora.

**Navigation:** plain language for grief-stricken coordinators (phone-first) — home offers three service tiers; header stays minimal; Help · Privacy · Contact sit in the footer. Choose a service tier on the home page (**Notice Only**, **Program / Brochure**, or **Full Coordination**) or at `/create?mode=notice|programme|full`. Each memorial can use one of **73 visual themes** (colour and typography) set in the create wizard or edit portal under **Appearance**. Browse them all at [`/design-lab`](http://localhost:3000/design-lab) (no login).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Two example memorials seed on first access (only if each slug is missing). Each example ships with **sample portrait and gallery photos** under [`public/seed/`](public/seed/) (served as `/seed/…` — no Blob or external CDN required). Regenerate assets with `node scripts/generate-seed-images.mjs`.

### Visual themes & design lab

- **Registry:** `src/lib/visual-themes.ts` — 73 funeral-appropriate themes (`programme`, `monument`, `kente`, `night`, plus regional palettes across Africa such as `cairo-ivory`, `senegal-teranga`, `south-africa-ubuntu`, …). Groups: Light, Dark, Cultural, Across Africa.
- **CSS:** `src/styles/themes.css` — `[data-theme="…"]` blocks set `--passage-bg`, `--passage-text`, `--passage-muted`, `--passage-accent`, `--passage-rule`, `--passage-card-bg`, `--passage-font-display`, `--passage-font-body` (and related layout tokens).
- **Preview:** [http://localhost:3000/design-lab](http://localhost:3000/design-lab) — grid of mini memorial samples; each card links to `/design-lab/<themeId>` for a full-page sample shell.
- **Fonts:** Root layout loads **four** Google families shared across themes: DM Sans, Libre Baskerville, Cormorant Garamond, Source Serif 4.

| Example | URL |
|---------|-----|
| Ghanaian Christian (full) | [http://localhost:3000/memorial/samuel-mensah-2026](http://localhost:3000/memorial/samuel-mensah-2026) |
| Ghanaian Muslim (programme) | [http://localhost:3000/memorial/ghana-muslim-example-2026](http://localhost:3000/memorial/ghana-muslim-example-2026) |

**Example coordinator PIN (seed only):** `123456` — use on either memorial’s `/edit` path to load the coordinator view (pending tributes, submit for review, photos, etc.).

## Data layer (Neon Postgres vs local dev)

- **Without** `DATABASE_URL` or `POSTGRES_URL`, the app persists memorials under **`.passage-dev/memorials/*.json`** (gitignored). This is the default for a friction-free local MVP.
- **With** a database URL set, reads/writes go to **Postgres** (tested with [Neon](https://neon.tech)) using a single `memorials` row per slug. The JSON document in the `blob` column matches `StoredMemorialBlob` in `src/lib/types.ts` (`memorial`, `events`, `tributes`, `contributions`, `coordinator_pin_hash`). Denormalized `id`, `slug`, and `status` columns support primary key and admin listing queries.
- **When Postgres is enabled**, the file store under `.passage-dev/memorials/` is **not** written; data lives only in the database (avoids split-brain between disk and Neon).

### Apply migrations (Neon / any Postgres)

From the repo root, with your connection string in the environment:

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
psql "$DATABASE_URL" -f db/migrations/002_paystack_webhook_events.sql
psql "$DATABASE_URL" -f db/migrations/003_reminder_jobs.sql
psql "$DATABASE_URL" -f db/migrations/004_pin_recovery_tokens.sql
```

(`POSTGRES_URL` works too if that is what your host injects.) On **Vercel**, add the [Neon](https://vercel.com/marketplace/neon) integration so `DATABASE_URL` is available to serverless routes, then run the same SQL once against the branch/database you use for production.

`002_paystack_webhook_events.sql` adds the `paystack_webhook_events` table used to **deduplicate Paystack webhooks** (retries and duplicate deliveries) when Postgres is enabled. Without `DATABASE_URL`, the app still dedupes by contribution `paystack_reference` + `paid_at` only (good enough for local JSON mode; concurrent duplicate deliveries are unlikely).

### Migrating from Supabase

Older deployments used Supabase for Postgres (`memorials` + `events` + `tributes` + `contributions`) and optional Supabase Storage. That stack is **removed** from this codebase.

- **Env:** Drop `SUPABASE_*` variables. Set `DATABASE_URL` (or `POSTGRES_URL`) and run `001_init.sql`.
- **Data:** There is no automatic importer. Either re-create memorials (including running the app so the **example memorial** seeds on first access) or build a one-off export from Supabase → JSON blobs matching `StoredMemorialBlob` and `INSERT` into `memorials`.

## Memorial images (uploads)

Coordinator-authenticated uploads (`POST /api/memorials/[slug]/images`) store bytes in this order:

1. **Vercel Blob** — when `BLOB_READ_WRITE_TOKEN` is set (public blob URLs).
2. **Local development** — when `NODE_ENV === 'development'`, files go to **`.passage-dev/uploads/`** (gitignored with the rest of `.passage-dev/`) and are served only via **`GET /api/uploads/...`** (that route returns 404 outside development).

If neither applies (for example production without Blob), uploads return **503** with an explanatory error; memorials can still use pasted **image URLs** on `photo_url` / `gallery_urls`, or paths under **`/seed/`** for built-in demo content.

**Example memorial photos:** committed JPEGs in `public/seed/` (`mensah-*.jpg`, `muslim-*.jpg`). Open Graph and Twitter cards resolve these to absolute URLs via the site origin (`pickMemorialOgImageUrl` in `src/lib/memorial-share.ts`).

**Limits:** server validates **JPEG / PNG / WebP** by magic bytes and enforces **8MB** max on the **original upload** (before resize). Uploaded photos are resized server-side (max width **1920px**, WebP quality ~85; PNG kept only when transparency is detected). Very small serverless body limits on some hosts may require raising platform limits separately.

## Document scanning (OCR)

Coordinators can scan funeral posters, death certificates, and bank/MoMo statements from the **create wizard** (step: Deceased) and **family edit portal** (Photos + Contribution reconciliation). Flow is **upload → extract → review → apply** — nothing publishes until the family saves.

`POST /api/ocr` accepts multipart `file`, `doc_type`, and optional `pin` + `slug` (required for bank statements).

| Variable | Purpose |
|----------|---------|
| `OCR_SERVICE_URL`, `OCR_SERVICE_KEY` | **Preferred:** [dots.mocr](https://github.com/) on Hetzner (`/process` endpoint). Handles PDFs and scans. |
| `OPENAI_API_KEY` | Structured field extraction (Passage default). **Fallback** raw text via GPT-4o vision when mocr is unset (images only). |
| `ANTHROPIC_API_KEY` | Optional second fallback for extraction (integration spec). |

If none of the above are set, `/api/ocr` returns **503** and the UI shows the error.

**Privacy:** document images are sent to your configured OCR/LLM providers for processing only; Passage does not store uploaded scan files on the OCR route (gallery uploads use the separate images API). Review extracted fields before saving — OCR can misread names, dates, and amounts.

**Deltas vs integration spec:** route is `/api/ocr` (not `/api/memorials/ocr`). Added `funeral_poster` doc type for announcement/programme pre-fill. Field extraction prefers **OpenAI** over Anthropic to match existing `/api/ai/*` routes.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` or `POSTGRES_URL` | Optional **Postgres** persistence via Neon (or any Postgres). If unset, `.passage-dev/memorials/*.json` is used. |
| `BLOB_READ_WRITE_TOKEN` | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) read-write token for coordinator image uploads in production. |
| `OPENAI_API_KEY` | GPT-4o announcement / appeal / thank-you drafts **and OCR field extraction** (vision fallback when mocr unset). If unset, AI copy routes return dignified placeholders; OCR needs mocr or returns 503. |
| `OCR_SERVICE_URL`, `OCR_SERVICE_KEY` | Optional Hetzner dots.mocr service for PDF/image text extraction (see **Document scanning** above). |
| `ANTHROPIC_API_KEY` | Optional fallback for OCR structured extraction when OpenAI extraction returns empty. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Reserved for Phase 2 caching/session (not required for this MVP). |
| `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` (or `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` for client widgets) | Live Paystack init/verify **and webhook HMAC verification**. If the secret is missing, init returns a **dev reference** and the contribute page can simulate verify locally; **webhooks return 503** until the secret is set. Use **test** keys (`sk_test_…`) on preview/staging and **live** keys (`sk_live_…`) only in production — Paystack test and live dashboards are separate. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for Paystack callbacks, **Open Graph / Twitter absolute image URLs**, and memorial share links (defaults to `http://localhost:3000` in dev). On Vercel, `VERCEL_URL` is used as a fallback when this is unset (HTTPS). |
| `RESEND_API_KEY` | Optional. Enables coordinator **email reminders** from the edit portal (`POST /api/memorials/[slug]/reminders/send`). Without it, the UI shows “Email not configured” and copy-to-clipboard reminders still work. |
| `RESEND_FROM_EMAIL` | Optional sender for Resend (e.g. `Passage <memorials@yourdomain.com>`). Defaults to Resend’s onboarding address when unset. |
| `CRON_SECRET` | Protects `GET /api/cron/reminders` (Vercel Cron). Set on Vercel; cron sends `Authorization: Bearer <CRON_SECRET>`. Required for **scheduled** email reminders. |
| `WHATSAPP_*` | **Phase 2** — Meta WhatsApp Business API (WABA). Not used in this MVP; coordinators use WhatsApp **copy** buttons instead. |
| `PASSAGE_ADMIN_PASSWORD` | Protects `/admin` queue via `/api/admin/login` cookie session. |
| `PASSAGE_SUPPORT_EMAIL` | Optional. Contact on `/privacy` and `/help` (e.g. `support@yourdomain.com`). |

### Mobile Money (Ghana)

Collections run through **Paystack** — Passage does **not** call MTN (or other telco) APIs directly. For Ghana memorials (`fundraising_currency` **GHS**), checkout init sends `channels: ['mobile_money', 'card']` so MTN / AirtelTigo / Telecel MoMo and cards appear on the Paystack page.

**Merchant dashboard:** In [Paystack](https://dashboard.paystack.com/) → **Settings** → **Preferences** (or **Payment channels**), enable **Mobile Money** for your Ghana business account. Without this, MoMo may not appear even when the API requests the channel. Use **test** keys and the test MoMo flow on staging before going live.

### Paystack webhooks (production)

1. Set `PAYSTACK_SECRET_KEY` on Vercel (same value you use for `transaction/initialize` and `transaction/verify`).
2. Run migration `002_paystack_webhook_events.sql` when using Neon (see above).
3. In the [Paystack Dashboard](https://dashboard.paystack.com/) → **Settings** → **API** → **Webhooks**, add **one global URL** (recommended):

   `https://<your-domain>/api/paystack/webhook`

   Init stamps `metadata.memorial_slug` on every charge; the global handler resolves the memorial from metadata.

   **Legacy (still supported):** per-slug URL `https://<your-domain>/api/memorials/<memorial-slug>/paystack/webhook` — metadata must match the slug in the path when both are set (mismatch → **400**).

**Behaviour:** valid `charge.success` events update the memorial JSON `contributions[]` the same way as a successful `POST /api/memorials/[slug]/paystack/verify`. Invalid `x-paystack-signature` → **400**. Unknown memorial slug (no row / no file) → **200** `{ "noop": true }` so Paystack does not retry forever on stale URLs. Other events return **200** `{ "ignored": true }`.

Do not commit secrets; use `.env.local` (gitignored).

## Production go-live checklist

1. **Postgres migrations** (once per database):

   ```bash
   psql "$DATABASE_URL" -f db/migrations/001_init.sql
   psql "$DATABASE_URL" -f db/migrations/002_paystack_webhook_events.sql
   psql "$DATABASE_URL" -f db/migrations/003_reminder_jobs.sql
   ```

2. **Environment variables** (Vercel production):

   | Variable | Required for go-live |
   |----------|----------------------|
   | `DATABASE_URL` or `POSTGRES_URL` | Yes — persistent memorials |
   | `BLOB_READ_WRITE_TOKEN` | Yes — coordinator image uploads |
   | `PAYSTACK_SECRET_KEY` | Yes — live init, verify, webhooks |
   | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` or `PAYSTACK_PUBLIC_KEY` | If using Paystack inline widgets |
   | `NEXT_PUBLIC_SITE_URL` | Yes — Paystack callbacks, OG/share URLs |
   | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional — email reminders |
   | `CRON_SECRET` | Optional — scheduled reminders (`003`) |
   | `OPENAI_API_KEY` / `OCR_SERVICE_*` | Optional — AI copy & document scan |
   | `PASSAGE_ADMIN_PASSWORD` | Recommended — `/admin` queue |

3. **Paystack:** Register webhook `https://<your-domain>/api/paystack/webhook`; enable **Mobile Money** in the merchant dashboard (see **Mobile Money** above); use **live** keys only in production.

4. **Smoke tests** (replace slug/domain):

   | URL | Check |
   |-----|--------|
   | `/` | Marketing home loads |
   | `/create` | Intake wizard loads |
   | `/memorial/samuel-mensah-2026` | Seeded Christian example (after first hit) |
   | `/memorial/ghana-muslim-example-2026` | Seeded Ghana Muslim programme example |
   | `/privacy` | Privacy policy |
   | `/design-lab` | All 73 memorial visual themes |
   | `/memorial/<slug>/contribute` | Paystack redirect or dev placeholder |
   | `/memorial/<slug>/print` | Print layout renders |

## Pilot prep

Before a pilot deploy, apply Postgres migrations (when using Neon):

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
psql "$DATABASE_URL" -f db/migrations/002_paystack_webhook_events.sql
psql "$DATABASE_URL" -f db/migrations/003_reminder_jobs.sql
psql "$DATABASE_URL" -f db/migrations/004_pin_recovery_tokens.sql
```

Smoke-check key routes (server must be running for HTTP checks, or pass your production URL):

```bash
npm run dev   # in another terminal, if testing locally
./scripts/smoke-pilot.sh
# or against production:
./scripts/smoke-pilot.sh https://your-domain.com
# optional full build before curls:
./scripts/smoke-pilot.sh https://your-domain.com --build
```

Equivalent npm script: `npm run smoke:pilot` (defaults to `http://localhost:3000`).

Optional env: `PASSAGE_SUPPORT_EMAIL` — shown on `/privacy` (defaults to generic “Passage operator” copy).

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run smoke:pilot` — pilot HTTP smoke checks (`bash scripts/smoke-pilot.sh [BASE_URL] [--build]`)

**Print / Save as PDF:** each public memorial has a printer-friendly page at `/memorial/<slug>/print` (also linked from the memorial as “Print version”). Families use the browser’s **Print** dialog and choose **Save as PDF** (or send straight to a printer) — no InDesign or Canva required. Set **`NEXT_PUBLIC_SITE_URL`** in production so Open Graph, share links, and any absolute URLs resolve to your real domain rather than localhost.

## Social image exports (coordinator MVP)

Fixed-size PNGs for Instagram / Facebook-style posts, generated server-side with **sharp** from the memorial **primary photo** or the **first gallery URL**.

- **Route:** `GET /api/memorials/<slug>/social/<variant>` where `<variant>` is `square` (1080×1080), `story` (1080×1920), or `portrait` (1080×1350). An optional `.png` suffix on the path segment is accepted (e.g. `square.png`).
- **Auth:** coordinator PIN via **`x-passage-pin`** header **or** **`?pin=`** query string.
  - The **family edit portal** uses the header only (download buttons).
  - **Security tradeoff (MVP):** `?pin=` can appear in reverse-proxy access logs, CDN logs, and browser history. Do not share bookmarked URLs that include the PIN; prefer the edit portal or tools that send the header.
- **Overlay:** deceased name, sunrise/sunset dates when present, and a short memorial URL (from `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` via `memorialAbsoluteUrl`).
- **No new environment variables** for this feature.

## Closure accounting (MVP)

- **`memorial.closure_status`:** `active` (default) or `closed`, plus optional `closed_at`, `closure_notes`.
- Edit portal: disposition notes, **Close memorial** (confirm), reopen, link to **`/memorial/<slug>/closure`** (print-friendly contributions + pledge summary).
- Public page: when closed, shows a restrained banner and hides the fundraising contribute CTA.

## Scheduled email reminders (MVP)

Requires **Postgres** (`003_reminder_jobs.sql`), **`RESEND_API_KEY`**, and **`CRON_SECRET`**.

1. Coordinator schedules from edit portal (task / event / pledge rows) via `POST /api/memorials/<slug>/reminders/schedule` (PIN).
2. **Vercel Cron** (`vercel.json`) hits `GET /api/cron/reminders` every 15 minutes with `Authorization: Bearer $CRON_SECRET`.
3. Due jobs send via Resend; status `sent` or `failed` on `reminder_jobs`.

**Local test (cron):**

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/reminders"
```

WhatsApp scheduling is **not** implemented — use copy buttons; WABA documented as Phase 2.

## Pledge ↔ payment match (MVP)

- Paystack init accepts optional `pledge_id` → stored in metadata; webhook/verify call `completeContributionPayment`, which sets pledge `status: fulfilled` and `contribution_id` when `metadata.pledge_id` or `pledge.paystack_reference` matches.
- **Conservative heuristic:** if no `pledge_id` in metadata, when **exactly one** open pledge has `amount_minor` equal to the payment amount (pesewas) and matching currency, that pledge is fulfilled and `contributions[].matched_pledge_id` is set. Otherwise left unmatched — not fuzzy matching.
- Edit portal: **Mark fulfilled from payment reference** when a paid contribution shares the same Paystack reference.

## PIN recovery & coordinator handoff (MVP)

- Optional `coordinator_recovery_email` on the memorial (create wizard or edit portal). Falls back to `coordinator_email` or first public contact email.
- `POST /api/memorials/<slug>/pin/recovery-request` with `{ email }` — always responds generically; sends a one-hour link via Resend when the email matches (`NEXT_PUBLIC_SITE_URL` + `RESEND_API_KEY`).
- `POST /api/memorials/<slug>/pin/reset` with `{ token, new_pin }` — validates token from `004_pin_recovery_tokens.sql` (Postgres) or `.passage-dev/pin-recovery/` (local JSON).
- Rate limit: **5 requests per memorial per hour** (`pin_recovery_rate` on blob).
- Edit portal **Forgot PIN?** flow; recovery link opens `/memorial/<slug>/edit?recovery_token=…`.
- **Handoff:** saving `public_contacts[0]` with PIN also syncs legacy `coordinator_*` fields (spokesperson change).

## Bank reconciliation (MVP)

- After bank/MoMo OCR in the edit portal, scan is stored on `memorial.last_bank_reconciliation` (`scanned_at`, `file_hash`, `transactions[]` with per-row `reconciliation_status` and optional `contribution_id`).
- UI: OCR credits table + contributions table; manual **Link to contribution**; **Suggest matches** (amount within 1 pesewa + same calendar day **or** reference contains Paystack ref). User confirms links — contributions are not auto-modified.

## Print / page templates (MVP)

- `memorial.output_template`: `notice` | `programme` | `banner_classic` (separate from `memorial_mode` feature gating).
- Chosen in create wizard step 1 and edit portal; applies root CSS class on public memorial + print (`globals.css`).

## Coordinator tasks & reminder copy (MVP)

- **`memorial.tasks`** on the stored blob: `{ id, title, owner_name?, due_at?, status: 'open'|'done', notes? }[]`.
- Tasks are **omitted from public** memorial JSON and public pages (`memorialForPublicAudience`).
- **Reminder “packs”** are plain-text snippets for WhatsApp (no SMS): due tomorrow / due today / overdue / no-date nudge — copy buttons in the edit portal.
- **Email reminders (MVP):** with `RESEND_API_KEY`, coordinators can send one-off emails for tasks (`due_tomorrow` / `due_today` / `overdue`) and programme events (`event_upcoming`) via `POST /api/memorials/<slug>/reminders/send` (PIN required). WhatsApp copy remains the default when email is not configured.

## Pledges (MVP)

- **`memorial.pledges`** on the blob: promised vs paid tracking (`pledged` | `partial` | `fulfilled` | `cancelled`), optional `amount_minor`, `contribution_id` for manual reconciliation, `visibility: public | coordinator_only`.
- **Public display:** shown when `memorial_mode` is `programme` or `full`, **or** when `fundraising_active` is true — only rows with `visibility: public` (name + amount when set).
- Edit portal: CRUD, mark fulfilled, copy pledge reminder text for WhatsApp.

## Burial posters (100 styles)

- **Browse:** `/posters` — grid of all visual themes with download (1080×1920 JPG) and “use on memorial”.
- **Assets:** `public/burial-posters/{themeId}.jpg` (portrait 9:16, WhatsApp + print). Design-lab thumbnails stay at `public/theme-previews/` (400×711).
- **Regenerate** (after Africa portraits or theme registry changes):

```bash
npm run photos:africa          # if portraits missing
npm run burial-posters         # 1080×1920
npm run burial-posters:2x      # optional 2160×3840 for print shops
npm run theme-previews         # design-lab thumbnails only
```

- **Per memorial:** `/memorial/<slug>/poster` — personalized burial poster (print / Save as PDF) + themed JPG download; share panel on the public page.

## Outdoor / printer pack (MVP)

- Edit portal **Hand to printer** — checklist plus links to:
  - `/memorial/<slug>/printer-guide` — one-page brief for your print shop (includes burial poster sizes for Accra)
  - `/memorial/<slug>/poster` — portrait burial poster (9:16)
  - `/memorial/<slug>/print` — A4 programme sheet (not the burial poster)
  - `/memorial/<slug>/banner` — roll-up (**850×2000mm**), QR to memorial URL
  - `/memorial/<slug>/banner/wide` — wide vinyl (~3×6 ft / 915×1830mm aspect)

## Programme events & visibility (MVP)

- Programme rows remain top-level **`events[]`** on the blob (same shape as intake / `MemorialEvent`).
- Optional **`visibility`:** `public` (default) or `coordinator_only`. Coordinator-only rows are excluded from public programme and print views (same pattern as stakeholders / wind-down).

## Programme readings (MVP)

- **`memorial.programme_readings`** on the blob: ordered scripture, hymn, Quran, or uploaded programme pages (`ProgrammeReading` in `src/lib/types.ts`).
- **Curated library:** `src/lib/programme-reading-library.ts` — Ghana Christian funeral set (KJV scriptures + EP/Methodist-style hymns with full lyrics), Ghana Muslim set (Al-Fatiha, Yasin excerpt, common duas). Helpers: `getSuggestedReadings(tradition)`, `findHymn(book, number)`, `findScripture(ref)`.
- **Uploads:** `POST /api/memorials/<slug>/images` with `slot=programme` returns a URL (does not add to gallery); attach via edit portal on an upload reading.
- **Public display:** when `memorial_mode` is `programme` or `full`, public rows appear on `/memorial/<slug>` and `/memorial/<slug>/print` (respects `output_template` typography classes).
- Edit portal: reorder, add from suggestions, manual forms, save via `PATCH` with PIN.

## Sharing & distribution

Channel priority on the product is **WhatsApp → social → print**. Public memorial pages ship a **WhatsApp-first** share panel (copy link, copy short announcement text, open `wa.me` with prefilled message) plus a **print layout** (see Print / Save as PDF above).

## Phase 2 (intentionally deferred)

- **Large / post-MVP:** richer server-generated PDF packs (beyond browser Save as PDF); automated WhatsApp/SMS reminders and scheduling bots; tokenized social URLs without PIN in query; typography/branding options on social exports.
- WhatsApp bot intake, video tribute upload, DALL·E poster pipeline, annual remembrance, production Paystack webhooks with signature verification, Upstash-backed sessions, image CDN resizing/optimization.
