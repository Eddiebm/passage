import { NextResponse } from 'next/server'
import {
  completeContributionPayment,
  readMemorialBlobWithoutSeeding,
} from '@/lib/memorial-store'
import {
  deletePaystackWebhookEvent,
  tryInsertPaystackWebhookEvent,
} from '@/lib/paystack-webhook-events'

function stringFromMetadata(meta: unknown, key: string): string | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const v = (meta as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : undefined
}

function paystackIdempotencyKey(data: Record<string, unknown>, reference: string): string {
  if (typeof data.id === 'number' || typeof data.id === 'string') {
    return `charge.success:${String(data.id)}`
  }
  return `charge.success:${reference}`
}

/**
 * Processes a verified Paystack `charge.success` webhook for one memorial slug.
 * Shared by per-slug and global webhook routes.
 */
export async function handlePaystackChargeSuccessWebhook(
  memorialSlug: string,
  charge: Record<string, unknown>,
  parsedEnvelope: unknown,
  opts?: { slugFromUrl?: string },
): Promise<NextResponse> {
  const slugFromUrl = opts?.slugFromUrl?.trim()
  const memorialSlugMeta = stringFromMetadata(charge.metadata, 'memorial_slug')?.trim() ?? ''
  if (slugFromUrl && memorialSlugMeta && memorialSlugMeta !== slugFromUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: 'slug_metadata_mismatch',
        detail: 'URL slug must match metadata.memorial_slug when set.',
      },
      { status: 400 },
    )
  }

  const slug = (memorialSlug || slugFromUrl || memorialSlugMeta).trim()
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'missing_memorial_slug' }, { status: 400 })
  }

  if (charge.status !== 'success') {
    return NextResponse.json({ ok: true, ignored: true, reason: 'charge_not_success' })
  }

  const reference = typeof charge.reference === 'string' ? charge.reference.trim() : ''
  if (!reference) {
    return NextResponse.json({ ok: false, error: 'missing_reference' }, { status: 400 })
  }

  const amountMinor = typeof charge.amount === 'number' ? charge.amount : Number.NaN
  const amountMajor = Number.isFinite(amountMinor) ? amountMinor / 100 : 0
  const currency = typeof charge.currency === 'string' ? charge.currency : 'GHS'

  const contributor_name = stringFromMetadata(charge.metadata, 'contributor_name')
  const contributor_whatsapp = stringFromMetadata(charge.metadata, 'contributor_whatsapp')
  const message = stringFromMetadata(charge.metadata, 'message')
  const pledge_id = stringFromMetadata(charge.metadata, 'pledge_id')

  const blob = await readMemorialBlobWithoutSeeding(slug)
  if (!blob) {
    return NextResponse.json({ ok: true, noop: true, reason: 'memorial_not_found' })
  }

  const existingPaid = blob.contributions.find(
    (c) => c.paystack_reference === reference && c.paid_at,
  )
  if (existingPaid) {
    return NextResponse.json({ ok: true, duplicate: true, contributionId: existingPaid.id })
  }

  const idempotencyKey = paystackIdempotencyKey(charge, reference)
  const acquired = await tryInsertPaystackWebhookEvent(idempotencyKey, parsedEnvelope)

  if (!acquired) {
    const stillUnpaid = !blob.contributions.some(
      (c) => c.paystack_reference === reference && c.paid_at,
    )
    if (stillUnpaid) {
      try {
        const contribution = await completeContributionPayment(slug, {
          reference,
          amountMajor,
          currency: currency || blob.memorial.fundraising_currency || 'GHS',
          contributor_name,
          contributor_whatsapp,
          message,
          pledge_id,
        })
        return NextResponse.json({
          ok: true,
          recovered: true,
          contributionId: contribution?.id ?? null,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown_error'
        return NextResponse.json({ ok: false, error: msg }, { status: 500 })
      }
    }
    return NextResponse.json({ ok: true, duplicate: true })
  }

  try {
    const contribution = await completeContributionPayment(slug, {
      reference,
      amountMajor,
      currency: currency || blob.memorial.fundraising_currency || 'GHS',
      contributor_name,
      contributor_whatsapp,
      message,
      pledge_id,
    })
    if (!contribution) {
      await deletePaystackWebhookEvent(idempotencyKey)
      return NextResponse.json({ ok: true, noop: true, reason: 'memorial_not_found_after_lock' })
    }
    return NextResponse.json({ ok: true, contributionId: contribution.id })
  } catch (e) {
    await deletePaystackWebhookEvent(idempotencyKey)
    const msg = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
