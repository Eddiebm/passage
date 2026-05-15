import { NextResponse } from 'next/server'
import { handlePaystackChargeSuccessWebhook } from '@/lib/paystack-webhook-handler'
import { verifyPaystackWebhookSignature } from '@/lib/paystack-webhook-signature'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function stringFromMetadata(meta: unknown, key: string): string | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const v = (meta as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : undefined
}

/**
 * Global Paystack webhook — one dashboard URL for all memorials.
 * Memorial slug is read from `metadata.memorial_slug` (set at transaction init).
 *
 * `POST https://<domain>/api/paystack/webhook`
 */
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: 'paystack_not_configured',
        detail: 'Set PAYSTACK_SECRET_KEY on the server.',
      },
      { status: 503 },
    )
  }

  const raw = await request.text()
  const signature = request.headers.get('x-paystack-signature')
  if (!verifyPaystackWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const envelope = parsed as { event?: string; data?: unknown }
  if (envelope.event !== 'charge.success') {
    return NextResponse.json({ ok: true, ignored: true, event: envelope.event ?? null })
  }

  const data = envelope.data
  if (!data || typeof data !== 'object') {
    return NextResponse.json({ ok: false, error: 'missing_charge_data' }, { status: 400 })
  }
  const charge = data as Record<string, unknown>

  const slug = stringFromMetadata(charge.metadata, 'memorial_slug')?.trim() ?? ''
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: 'missing_memorial_slug', detail: 'metadata.memorial_slug is required.' },
      { status: 400 },
    )
  }

  return handlePaystackChargeSuccessWebhook(slug, charge, parsed)
}
