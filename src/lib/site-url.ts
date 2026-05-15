/**
 * Canonical origin for absolute URLs (OG tags, share links, Paystack callbacks).
 * Prefer `NEXT_PUBLIC_SITE_URL`; on Vercel use `VERCEL_URL` when unset.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `https://${host}`
  }
  return 'http://localhost:3000'
}
