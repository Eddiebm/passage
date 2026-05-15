import type { Memorial, MemorialPledge } from '@/lib/types'

export function publicPledgesForMemorial(memorial: Memorial): MemorialPledge[] {
  return (memorial.pledges ?? []).filter((p) => p.visibility !== 'coordinator_only')
}

export function formatPledgeAmountMinor(amountMinor: number, currency: string): string {
  const major = amountMinor / 100
  return `${major.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`
}

export function pledgeStatusLabel(status: MemorialPledge['status']): string {
  switch (status) {
    case 'pledged':
      return 'Pledged'
    case 'partial':
      return 'Partially paid'
    case 'fulfilled':
      return 'Fulfilled'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}
