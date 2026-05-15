import { NextResponse } from 'next/server'
import { getMemorialBlob } from '@/lib/memorial-store'
import { paystackInitializeTransaction } from '@/lib/paystack'

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
  }
  const email = body.email?.trim() || blob.memorial.coordinator_email || 'guest@example.local'
  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  const callbackUrl = `${site}/memorial/${slug}/contribute?verify=1`

  const minor = Math.round(amount * 100)

  try {
    const init = await paystackInitializeTransaction({
      email,
      amountMinorUnits: minor,
      currency: blob.memorial.fundraising_currency || 'GHS',
      callbackUrl,
      metadata: {
        memorial_slug: slug,
        contributor_name: body.contributor_name || '',
        contributor_whatsapp: body.contributor_whatsapp || '',
        message: body.message || '',
      },
    })
    return NextResponse.json(init)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Paystack error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
