import type { MemorialPledge, StoredMemorialBlob } from '@/lib/types'

/**
 * Resolves which pledge to fulfill after a successful payment.
 * Prefer explicit metadata.pledge_id; else match pledge.paystack_reference;
 * else exactly one open pledge with matching amount_minor + currency (heuristic).
 */
export function resolvePledgeIdForPayment(
  blob: StoredMemorialBlob,
  input: {
    pledgeId?: string
    paystackReference: string
    amountMajor?: number
    currency?: string
  },
): string | undefined {
  const pledges = blob.memorial.pledges ?? []
  if (!pledges.length) return undefined

  const explicit = input.pledgeId?.trim()
  if (explicit && pledges.some((p) => p.id === explicit)) return explicit

  const byRef = pledges.find(
    (p) =>
      p.paystack_reference === input.paystackReference &&
      p.status !== 'fulfilled' &&
      p.status !== 'cancelled',
  )
  if (byRef) return byRef.id

  if (input.amountMajor === undefined || !Number.isFinite(input.amountMajor)) return undefined
  const amountMinor = Math.round(input.amountMajor * 100)
  const currency = (input.currency || blob.memorial.fundraising_currency || 'GHS').toUpperCase()
  const open = pledges.filter(
    (p) =>
      p.status === 'pledged' &&
      p.amount_minor !== undefined &&
      p.amount_minor === amountMinor &&
      (p.currency || blob.memorial.fundraising_currency || 'GHS').toUpperCase() === currency,
  )
  if (open.length === 1) return open[0]!.id
  return undefined
}

export function applyPledgeFulfillment(
  pledges: MemorialPledge[],
  pledgeId: string,
  contributionId: string,
  paystackReference: string,
): MemorialPledge[] {
  const idx = pledges.findIndex((p) => p.id === pledgeId)
  if (idx === -1) return pledges
  const next = [...pledges]
  next[idx] = {
    ...next[idx],
    status: 'fulfilled',
    contribution_id: contributionId,
    paystack_reference: paystackReference,
  }
  return next
}
