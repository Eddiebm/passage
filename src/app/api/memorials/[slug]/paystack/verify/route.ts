import { NextResponse } from 'next/server'
import {
  addContributionRecord,
  getMemorialBlob,
  markContributionPaid,
} from '@/lib/memorial-store'
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

  const verified = await paystackVerifyReference(reference)
  if (!verified.ok || !verified.paid) {
    return NextResponse.json(
      { ok: false, paid: false, detail: verified.rawMessage || 'Unpaid or unverified' },
      { status: 400 },
    )
  }

  const existing = blob.contributions.find((c) => c.paystack_reference === reference)
  if (existing?.paid_at) {
    return NextResponse.json({ ok: true, contribution: existing })
  }

  const amountMajorFromGateway =
    typeof verified.amount === 'number' ? verified.amount / 100 : Number.NaN
  const amountMajor = Number.isFinite(amountMajorFromGateway)
    ? amountMajorFromGateway
    : Number(body.amount)
  const currency = verified.currency || blob.memorial.fundraising_currency || 'GHS'

  if (!existing) {
    await addContributionRecord(slug, {
      contributor_name: verified.metadata?.contributor_name,
      contributor_whatsapp: verified.metadata?.contributor_whatsapp,
      amount: Number.isFinite(amountMajor) ? amountMajor : 0,
      currency,
      message: verified.metadata?.message,
      paystack_reference: reference,
      paid_at: undefined,
      payout_status: 'pending',
    })
  }
  const paid = await markContributionPaid(slug, reference)
  return NextResponse.json({ ok: true, contribution: paid })
}
