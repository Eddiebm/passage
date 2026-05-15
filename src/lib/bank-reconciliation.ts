import type { BankReconciliationTransaction, Contribution } from '@/lib/types'
import type { BankStatementResult, Transaction } from '@/lib/ocr'

const AMOUNT_TOLERANCE = 0.01

function sameCalendarDay(isoA?: string, isoB?: string): boolean {
  if (!isoA || !isoB) return false
  const dayA = isoA.slice(0, 10)
  const dayB = isoB.slice(0, 10)
  return dayA.length === 10 && dayA === dayB
}

function referenceContainsPaystackRef(
  ocrReference: string | null | undefined,
  paystackReference: string | undefined,
): boolean {
  if (!ocrReference?.trim() || !paystackReference?.trim()) return false
  return ocrReference.toLowerCase().includes(paystackReference.trim().toLowerCase())
}

export function amountsMatchWithinTolerance(a: number, b: number): boolean {
  return Math.abs(a - b) <= AMOUNT_TOLERANCE
}

/** Suggest contribution rows for one OCR credit (amount + same day OR ref contains Paystack ref). */
export function suggestContributionMatches(
  txn: Pick<Transaction, 'amount' | 'date' | 'reference'>,
  contributions: Contribution[],
): Contribution[] {
  return contributions.filter((c) => {
    if (!amountsMatchWithinTolerance(c.amount, txn.amount)) return false
    const sameDay = sameCalendarDay(c.paid_at, txn.date)
    const refHit = referenceContainsPaystackRef(txn.reference, c.paystack_reference)
    return sameDay || refHit
  })
}

export function bankStatementToReconciliation(
  stmt: BankStatementResult,
): import('@/lib/types').LastBankReconciliation {
  const credits = stmt.transactions.filter((t) => t.type === 'credit')
  return {
    scanned_at: new Date().toISOString(),
    file_hash: stmt.file_hash,
    transactions: credits.map((t) => ({
      ...t,
      reconciliation_status: 'pending' as const,
    })),
  }
}

export function mergeReconciliationRows(
  existing: BankReconciliationTransaction[] | undefined,
  incoming: BankReconciliationTransaction[],
): BankReconciliationTransaction[] {
  if (!existing?.length) return incoming
  const byKey = new Map<string, BankReconciliationTransaction>()
  for (const row of existing) {
    const key = `${row.date}|${row.amount}|${row.reference ?? ''}|${row.sender ?? ''}`
    byKey.set(key, row)
  }
  for (const row of incoming) {
    const key = `${row.date}|${row.amount}|${row.reference ?? ''}|${row.sender ?? ''}`
    const prev = byKey.get(key)
    if (prev) {
      byKey.set(key, {
        ...row,
        reconciliation_status: prev.reconciliation_status,
        contribution_id: prev.contribution_id,
      })
    } else {
      byKey.set(key, row)
    }
  }
  return [...byKey.values()]
}
