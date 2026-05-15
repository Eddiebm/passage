import { NextResponse } from 'next/server'
import { coordinatorEmailFallback } from '@/lib/memorial-hydrate'
import { getMemorialBlob } from '@/lib/memorial-store'
import { PAYSTACK_GHANA_CHANNELS, paystackInitializeTransaction } from '@/lib/paystack'

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const blob = await getMemorialBlob(slug)
  if (!blob) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const body = (await request.json()) as {
    email?: string
    amount?: number
    contributor_name?: string
    contributor_whatsapp?: string
    message?: string
    pledge_id?: string
  }
  const email =
    body.email?.trim() || coordinatorEmailFallback(blob.memorial) || 'guest@example.local'
  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  const callbackUrl = `${site}/memorial/${slug}/contribute?verify=1`

  const minor = Math.round(amount * 100)
  const currency = (blob.memorial.fundraising_currency || 'GHS').toUpperCase()

  try {
    const init = await paystackInitializeTransaction({
      email,
      amountMinorUnits: minor,
      currency,
      callbackUrl,
      channels: currency === 'GHS' ? PAYSTACK_GHANA_CHANNELS : undefined,
      metadata: {
        memorial_slug: slug,
        contributor_name: body.contributor_name || '',
        contributor_whatsapp: body.contributor_whatsapp || '',
        message: body.message || '',
        ...(body.pledge_id?.trim() ? { pledge_id: body.pledge_id.trim() } : {}),
      },
    })
    return NextResponse.json(init)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Paystack error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
