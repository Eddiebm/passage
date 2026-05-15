import { NextResponse } from 'next/server'
import { completeContributionPayment, getMemorialBlob } from '@/lib/memorial-store'
import { paystackVerifyReference } from '@/lib/paystack'

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const body = (await request.json()) as { reference?: string; amount?: number }
  const reference = body.reference?.trim()
  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 })
  }

  const blob = await getMemorialBlob(slug)
  if (!blob) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const alreadyPaid = blob.contributions.find((c) => c.paystack_reference === reference && c.paid_at)
  if (alreadyPaid) {
    return NextResponse.json({ ok: true, contribution: alreadyPaid })
  }

  const verified = await paystackVerifyReference(reference)
  if (!verified.ok || !verified.paid) {
    return NextResponse.json(
      { ok: false, paid: false, detail: verified.rawMessage || 'Unpaid or unverified' },
      { status: 400 },
    )
  }

  const amountMajorFromGateway =
    typeof verified.amount === 'number' ? verified.amount / 100 : Number.NaN
  const amountMajor = Number.isFinite(amountMajorFromGateway)
    ? amountMajorFromGateway
    : Number(body.amount)
  const currency = verified.currency || blob.memorial.fundraising_currency || 'GHS'

  const paid = await completeContributionPayment(slug, {
    reference,
    amountMajor: Number.isFinite(amountMajor) ? amountMajor : 0,
    currency,
    contributor_name: verified.metadata?.contributor_name,
    contributor_whatsapp: verified.metadata?.contributor_whatsapp,
    message: verified.metadata?.message,
    pledge_id: verified.metadata?.pledge_id,
  })
  if (!paid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, contribution: paid })
}
