import type { Contribution, MemorialPledge } from '@/lib/types'
import { formatPledgeAmountMinor } from '@/lib/memorial-pledges'

export interface ContributionByCurrency {
  currency: string
  total: number
  count: number
  rows: Contribution[]
}

export interface PledgeAccountingSummary {
  pledged: number
  partial: number
  fulfilled: number
  cancelled: number
  open: number
  totalsByCurrency: { currency: string; pledgedMinor: number; fulfilledMinor: number }[]
}

export function contributionsByCurrency(contributions: Contribution[]): ContributionByCurrency[] {
  const paid = contributions.filter((c) => c.paid_at && c.payout_status !== 'failed')
  const map = new Map<string, ContributionByCurrency>()
  for (const c of paid) {
    const currency = c.currency || 'GHS'
    const existing = map.get(currency) ?? { currency, total: 0, count: 0, rows: [] }
    existing.total += c.amount
    existing.count += 1
    existing.rows.push(c)
    map.set(currency, existing)
  }
  return [...map.values()].sort((a, b) => a.currency.localeCompare(b.currency))
}

export function summarizePledges(
  pledges: MemorialPledge[] | undefined,
  defaultCurrency: string,
): PledgeAccountingSummary {
  const list = pledges ?? []
  const counts = { pledged: 0, partial: 0, fulfilled: 0, cancelled: 0, open: 0 }
  for (const p of list) {
    if (p.status === 'pledged') counts.pledged += 1
    else if (p.status === 'partial') counts.partial += 1
    else if (p.status === 'fulfilled') counts.fulfilled += 1
    else if (p.status === 'cancelled') counts.cancelled += 1
  }
  counts.open = counts.pledged + counts.partial

  const currencySet = new Set<string>()
  for (const p of list) {
    if (p.amount_minor != null) currencySet.add(p.currency || defaultCurrency)
  }
  const currencies = currencySet.size ? [...currencySet] : [defaultCurrency]

  const totalsByCurrency = currencies.map((currency) => {
    const relevant = list.filter((p) => (p.currency || defaultCurrency) === currency && p.amount_minor != null)
    const pledgedMinor = relevant
      .filter((p) => p.status === 'pledged' || p.status === 'partial')
      .reduce((s, p) => s + (p.amount_minor ?? 0), 0)
    const fulfilledMinor = relevant
      .filter((p) => p.status === 'fulfilled')
      .reduce((s, p) => s + (p.amount_minor ?? 0), 0)
    return { currency, pledgedMinor, fulfilledMinor }
  })

  return { ...counts, totalsByCurrency }
}

export function formatMinorSummary(minor: number, currency: string): string {
  if (minor <= 0) return '—'
  return formatPledgeAmountMinor(minor, currency)
}
