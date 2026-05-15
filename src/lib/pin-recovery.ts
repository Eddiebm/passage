import { createHash, randomBytes } from 'node:crypto'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getDb, hasDatabaseEnv } from '@/lib/db'
import { hashPin } from '@/lib/crypto-pin'
import {
  getMemorialBlob,
  readMemorialBlobWithoutSeeding,
  setCoordinatorPinHash,
  updatePinRecoveryRateWindow,
} from '@/lib/memorial-store'
import { sendPlainEmail } from '@/lib/resend-email'
import { getSiteOrigin } from '@/lib/site-url'
import type { Memorial, PinRecoveryRateWindow } from '@/lib/types'

const TOKEN_TTL_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_HOUR = 5

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

function hourBucket(iso = new Date().toISOString()): string {
  return iso.slice(0, 13)
}

export function resolveRecoveryEmail(memorial: Memorial): string | undefined {
  const explicit = memorial.coordinator_recovery_email?.trim().toLowerCase()
  if (explicit) return explicit
  const legacy = memorial.coordinator_email?.trim().toLowerCase()
  if (legacy) return legacy
  const contact = memorial.public_contacts?.[0]?.email?.trim().toLowerCase()
  return contact || undefined
}

function checkRateLimit(memorial: Memorial): { ok: true } | { ok: false; retryAfterMinutes: number } {
  const bucket = hourBucket()
  const current = memorial.pin_recovery_rate
  if (current?.window_start === bucket && current.count >= MAX_REQUESTS_PER_HOUR) {
    return { ok: false, retryAfterMinutes: 60 }
  }
  return { ok: true }
}

function nextRateWindow(memorial: Memorial): PinRecoveryRateWindow {
  const bucket = hourBucket()
  const current = memorial.pin_recovery_rate
  if (current?.window_start === bucket) {
    return { window_start: bucket, count: (current.count ?? 0) + 1 }
  }
  return { window_start: bucket, count: 1 }
}

async function persistRateWindow(slug: string, window: PinRecoveryRateWindow): Promise<void> {
  await updatePinRecoveryRateWindow(slug, window)
}

async function storeTokenPostgres(slug: string, tokenHash: string, expiresAt: Date): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO pin_recovery_tokens (token_hash, slug, expires_at)
    VALUES (${tokenHash}, ${slug}, ${expiresAt.toISOString()}::timestamptz)
    ON CONFLICT (token_hash) DO UPDATE SET
      slug = EXCLUDED.slug,
      expires_at = EXCLUDED.expires_at
  `
}

async function getFileRecoveryRoot(): Promise<string> {
  const root = path.join(process.cwd(), '.passage-dev', 'pin-recovery')
  await mkdir(root, { recursive: true })
  return root
}

async function storeTokenFile(slug: string, tokenHash: string, expiresAt: Date): Promise<void> {
  const root = await getFileRecoveryRoot()
  await writeFile(
    path.join(root, `${tokenHash}.json`),
    JSON.stringify({ slug, expires_at: expiresAt.toISOString() }),
    'utf8',
  )
}

async function consumeToken(slug: string, token: string): Promise<boolean> {
  const tokenHash = hashToken(token)
  const expiresCutoff = new Date()

  if (hasDatabaseEnv()) {
    const sql = getDb()
    const rows = (await sql`
      SELECT slug, expires_at FROM pin_recovery_tokens
      WHERE token_hash = ${tokenHash} AND slug = ${slug}
      LIMIT 1
    `) as { slug: string; expires_at: string }[]
    const row = rows[0]
    if (!row) return false
    if (new Date(row.expires_at) < expiresCutoff) {
      await sql`DELETE FROM pin_recovery_tokens WHERE token_hash = ${tokenHash}`
      return false
    }
    await sql`DELETE FROM pin_recovery_tokens WHERE token_hash = ${tokenHash}`
    return true
  }

  const root = await getFileRecoveryRoot()
  try {
    const raw = await readFile(path.join(root, `${tokenHash}.json`), 'utf8')
    const parsed = JSON.parse(raw) as { slug: string; expires_at: string }
    if (parsed.slug !== slug) return false
    if (new Date(parsed.expires_at) < expiresCutoff) {
      await unlink(path.join(root, `${tokenHash}.json`)).catch(() => {})
      return false
    }
    await unlink(path.join(root, `${tokenHash}.json`)).catch(() => {})
    return true
  } catch {
    return false
  }
}

/** Prune expired file tokens (best-effort; Postgres rows can be cleaned by cron later). */
export async function pruneExpiredRecoveryTokens(): Promise<void> {
  if (hasDatabaseEnv()) return
  const root = await getFileRecoveryRoot()
  const names = await readdir(root).catch(() => [] as string[])
  const now = Date.now()
  for (const name of names) {
    if (!name.endsWith('.json')) continue
    try {
      const raw = await readFile(path.join(root, name), 'utf8')
      const parsed = JSON.parse(raw) as { expires_at: string }
      if (new Date(parsed.expires_at).getTime() < now) {
        await unlink(path.join(root, name)).catch(() => {})
      }
    } catch {
      /* ignore */
    }
  }
}

/**
 * If email matches recovery address, mint token and email link when Resend is configured.
 * Always returns generic success to avoid email enumeration.
 */
export async function requestPinRecovery(
  slug: string,
  email: string,
): Promise<{ ok: true; emailed: boolean } | { ok: false; error: string; status: number }> {
  const blob = await readMemorialBlobWithoutSeeding(slug)
  if (!blob) {
    return { ok: true, emailed: false }
  }

  const normalized = email.trim().toLowerCase()
  if (!normalized.includes('@')) {
    return { ok: false, error: 'Valid email required', status: 400 }
  }

  const recoveryTarget = resolveRecoveryEmail(blob.memorial)
  if (!recoveryTarget || recoveryTarget !== normalized) {
    return { ok: true, emailed: false }
  }

  const rate = checkRateLimit(blob.memorial)
  if (!rate.ok) {
    return { ok: false, error: 'Too many recovery requests. Try again in about an hour.', status: 429 }
  }

  await persistRateWindow(slug, nextRateWindow(blob.memorial))

  const token = generateToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

  if (hasDatabaseEnv()) {
    await storeTokenPostgres(slug, tokenHash, expiresAt)
  } else {
    await storeTokenFile(slug, tokenHash, expiresAt)
  }

  const editUrl = `${getSiteOrigin()}/memorial/${slug}/edit?recovery_token=${encodeURIComponent(token)}`
  const deceased = blob.memorial.deceased_name
  const send = await sendPlainEmail({
    to: normalized,
    subject: `Passage — reset coordinator PIN for ${deceased}`,
    text: `You requested to reset the coordinator PIN for the ${deceased} memorial on Passage.\n\nOpen this link within one hour to set a new PIN:\n${editUrl}\n\nIf you did not request this, ignore this email.`,
  })

  return { ok: true, emailed: send.ok }
}

export async function resetCoordinatorPinWithToken(
  slug: string,
  token: string,
  newPin: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const pin = newPin.trim()
  if (!/^\d{6}$/.test(pin)) {
    return { ok: false, error: 'PIN must be exactly 6 digits', status: 400 }
  }

  const valid = await consumeToken(slug, token)
  if (!valid) {
    return { ok: false, error: 'Invalid or expired recovery link', status: 400 }
  }

  const updated = await setCoordinatorPinHash(slug, hashPin(pin))
  if (!updated) {
    return { ok: false, error: 'Memorial not found', status: 404 }
  }

  return { ok: true }
}

/** Used by tests / admin to verify memorial exists before showing recovery UI. */
export async function memorialExists(slug: string): Promise<boolean> {
  const blob = await getMemorialBlob(slug)
  return Boolean(blob)
}
