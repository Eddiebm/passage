import { NextResponse } from 'next/server'

/**
 * TODO(Paystack webhook): verify `x-paystack-signature` with `PAYSTACK_SECRET_KEY`,
 * idempotently record contributions, and notify the coordinator (Phase 2: WhatsApp).
 */
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        message:
          'Webhook ignored: PAYSTACK_SECRET_KEY not set. Configure Paystack and signature verification before production.',
      },
      { status: 202 },
    )
  }
  const raw = await request.text()
  return NextResponse.json({
    ok: true,
    received: true,
    bytes: raw.length,
    note: 'MVP placeholder — implement signature verification and persistence.',
  })
}
