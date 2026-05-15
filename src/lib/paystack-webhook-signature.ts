import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Verifies `x-paystack-signature` per Paystack: HMAC-SHA512 of the **raw**
 * request body using the secret key (same value as `PAYSTACK_SECRET_KEY` for API calls).
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secretKey: string,
): boolean {
  const sig = signatureHeader?.trim()
  if (!sig || !secretKey) return false
  const digest = createHmac('sha512', secretKey).update(rawBody, 'utf8').digest('hex')
  try {
    const a = Buffer.from(digest, 'utf8')
    const b = Buffer.from(sig, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
