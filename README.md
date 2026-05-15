# Passage

Digital memorial infrastructure — programmes, family-edited announcements, tributes, and contributions (Paystack) for Ghana, Nigeria, and the diaspora.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visit the seeded example memorial at [http://localhost:3000/memorial/bannerman-samuel-2026](http://localhost:3000/memorial/bannerman-samuel-2026).

**Example coordinator PIN (seed only):** `123456` — use it on `/memorial/bannerman-samuel-2026/edit` to load the coordinator view (pending tributes, submit for review, etc.).

## Deploy (GitHub + Vercel)

### GitHub

1. Create the repository `eddiebm/passage` on GitHub (empty, no README) if it does not exist yet.
2. From this project directory, commit and push:

```bash
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/eddiebm/passage.git   # skip if origin already set
git push -u origin main
```

Use SSH instead of HTTPS if that is your usual setup, for example `git@github.com:eddiebm/passage.git`.

### Vercel

1. In the Vercel dashboard: **Add New… → Project → Import** the `eddiebm/passage` Git repository.
2. **Framework preset:** Next.js (App Router). **Root Directory:** `.` (repository root).
3. **Build Command:** `npm run build` (default). **Output:** leave the default for Next.js (no static `output` override required).
4. **Install Command:** default (`npm install` / detected from lockfile).

### Environment variables (Production and Preview)

Add the same keys to **Production** and **Preview** unless you intentionally want different values (for example a staging Supabase project).

| Variable | Required? | Notes |
|----------|-------------|-------|
| `PASSAGE_ADMIN_PASSWORD` | Recommended for production | Protects `/admin` via `/api/admin/login`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public URL (Paystack callbacks, absolute links). Example: `https://passage.example.com` or your `*.vercel.app` URL. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Optional | Enables Postgres persistence; without them the app uses `.passage-dev/` JSON files locally (not used on Vercel serverless disk — configure Supabase for production persistence). |
| `SUPABASE_ANON_KEY` | Optional | Reserved for future client-side usage. |
| `OPENAI_API_KEY` | Optional | Announcement / appeal drafts; without it the API returns safe placeholder copy. |
| `PAYSTACK_SECRET_KEY` | Optional for dev | Live Paystack charges; without it init returns a dev reference. |
| `PAYSTACK_PUBLIC_KEY` or `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Optional for dev | Client-side Paystack widget. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional | Reserved for Phase 2. |

After the first deployment, copy your deployment host (production domain or `https://<project>-<team>.vercel.app`) and set `NEXT_PUBLIC_SITE_URL` to match.

### Paystack webhooks

This codebase exposes a per-memorial webhook route:

`https://<your-vercel-host>/api/memorials/<memorial-slug>/paystack/webhook`

Replace `<your-vercel-host>` with your production hostname (or preview URL while testing) and `<memorial-slug>` with the memorial’s slug (for example `bannerman-samuel-2026`). Paystack’s dashboard expects a concrete URL; use your production domain when you go live. Signature verification is still marked TODO in `src/app/api/memorials/[slug]/paystack/webhook/route.ts` — treat webhooks as best-effort until that is implemented.

Sync env vars to a local `.env` after linking:

```bash
vercel link
vercel env pull .env.local
```

## Data layer (Supabase vs local dev)

- **Without** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, the app persists memorials under **`.passage-dev/memorials/*.json`** (gitignored). This is the default for a friction-free local MVP.
- **With** Supabase env vars set, reads/writes go to Postgres using the same logical shape as `CLAUDE.md` (`memorials`, `events`, `tributes`, `contributions`). You must create those tables in your project (see `CLAUDE.md` schema). If tables are missing, operations will fail until migrations are applied.

When Supabase is configured, the file store is **also** written on the server so you can still inspect JSON-shaped blobs during development; `readBlob` prefers Supabase and falls back to the file store if a row is missing.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | GPT-4o announcement / appeal / thank-you drafts. If unset, server returns dignified placeholder copy and logs a warning. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Optional Postgres persistence (see `CLAUDE.md`). |
| `SUPABASE_ANON_KEY` | Reserved for future client-side Supabase usage. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Reserved for Phase 2 caching/session (not required for this MVP). |
| `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` (or `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` for client widgets) | Live Paystack init/verify. If the secret is missing, init returns a **dev reference** and the contribute page can simulate verify locally. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for Paystack callbacks (defaults to `http://localhost:3000` in dev). |
| `PASSAGE_ADMIN_PASSWORD` | Protects `/admin` queue via `/api/admin/login` cookie session. |

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint

## Phase 2 (intentionally deferred)

- WhatsApp bot intake, automated WhatsApp alerts, video tribute upload, DALL·E poster pipeline, annual remembrance, production Paystack webhooks with signature verification, Upstash-backed sessions.
