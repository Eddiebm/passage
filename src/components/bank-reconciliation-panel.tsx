'use client'

import { useMemo, useState } from 'react'
import { OCRUpload } from '@/components/ocr-upload'
import {
  bankStatementToReconciliation,
  mergeReconciliationRows,
  suggestContributionMatches,
} from '@/lib/bank-reconciliation'
import type { BankStatementResult } from '@/lib/ocr'
import type { BankReconciliationTransaction, Contribution, LastBankReconciliation } from '@/lib/types'

interface Props {
  slug: string
  pin: string
  contributions: Contribution[]
  initial?: LastBankReconciliation
  onSave: (state: LastBankReconciliation) => Promise<void>
  onMessage?: (msg: string) => void
}

function rowKey(row: BankReconciliationTransaction, index: number): string {
  return `${index}-${row.date}-${row.amount}-${row.reference ?? ''}`
}

export function BankReconciliationPanel({
  slug,
  pin,
  contributions,
  initial,
  onSave,
  onMessage,
}: Props) {
  const [reconciliation, setReconciliation] = useState<LastBankReconciliation | undefined>(initial)
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, Contribution[]>>({})

  const paidContributions = useMemo(
    () => contributions.filter((c) => c.paid_at),
    [contributions],
  )

  async function persist(next: LastBankReconciliation) {
    setSaving(true)
    try {
      await onSave(next)
      setReconciliation(next)
      onMessage?.('Reconciliation saved.')
    } catch {
      onMessage?.('Could not save reconciliation.')
    } finally {
      setSaving(false)
    }
  }

  function updateRow(index: number, patch: Partial<BankReconciliationTransaction>) {
    if (!reconciliation) return
    const transactions = reconciliation.transactions.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    )
    const next = { ...reconciliation, transactions }
    setReconciliation(next)
    void persist(next)
  }

  function runSuggestions() {
    if (!reconciliation) return
    const map: Record<string, Contribution[]> = {}
    reconciliation.transactions.forEach((row, index) => {
      if (row.type !== 'credit') return
      const matches = suggestContributionMatches(row, paidContributions)
      if (matches.length) map[rowKey(row, index)] = matches
    })
    setSuggestions(map)
    const count = Object.keys(map).length
    onMessage?.(
      count
        ? `Found suggestions for ${count} row${count !== 1 ? 's' : ''} — review and link manually.`
        : 'No automatic suggestions for current rows.',
    )
  }

  return (
    <div className="space-y-4">
      <OCRUpload
        docType="bank_statement"
        label="Upload bank or MoMo statement"
        hint="PDF or screenshot, up to 20 MB. Credits are listed for manual matching."
        slug={slug}
        pin={pin}
        onResult={(result) => {
          const stmt = result as BankStatementResult
          const incoming = bankStatementToReconciliation(stmt)
          const merged = mergeReconciliationRows(
            reconciliation?.file_hash === stmt.file_hash ? reconciliation.transactions : undefined,
            incoming.transactions,
          )
          const next: LastBankReconciliation = {
            scanned_at: incoming.scanned_at,
            file_hash: stmt.file_hash,
            transactions: merged,
          }
          setSuggestions({})
          void persist(next)
          onMessage?.(
            `Loaded ${incoming.transactions.length} incoming credit${incoming.transactions.length !== 1 ? 's' : ''}.`,
          )
        }}
      />

      {reconciliation && reconciliation.transactions.length > 0 && (
        <>
          <ReconciliationToolbar saving={saving} onSuggest={runSuggestions} />

          <div className="overflow-x-auto rounded border border-[#3D2B1F]/12">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-[#3D2B1F]/5 text-[#1A1A1A]/70">
                <tr>
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Sender</th>
                  <th className="px-2 py-2 font-medium">Reference</th>
                  <th className="px-2 py-2 font-medium">Link</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reconciliation.transactions.map((row, index) => {
                  const key = rowKey(row, index)
                  const suggested = suggestions[key] ?? []
                  const linked = row.contribution_id
                    ? paidContributions.find((c) => c.id === row.contribution_id)
                    : undefined
                  return (
                    <tr key={key} className="border-t border-[#3D2B1F]/10">
                      <td className="px-2 py-2 whitespace-nowrap">{row.date}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {row.currency} {row.amount.toLocaleString()}
                      </td>
                      <td className="px-2 py-2">{row.sender ?? '—'}</td>
                      <td className="px-2 py-2 max-w-[8rem] truncate" title={row.reference ?? ''}>
                        {row.reference ?? '—'}
                      </td>
                      <td className="px-2 py-2 min-w-[10rem]">
                        <select
                          className="w-full rounded border border-[#3D2B1F]/20 px-1 py-1"
                          value={row.contribution_id ?? ''}
                          onChange={(e) => {
                            const id = e.target.value || undefined
                            updateRow(index, {
                              contribution_id: id,
                              reconciliation_status: id ? 'reconciled' : 'pending',
                            })
                          }}
                        >
                          <option value="">— Link to contribution —</option>
                          {paidContributions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.contributor_name || 'Anonymous'} · {c.currency}{' '}
                              {c.amount.toLocaleString()}
                              {c.paystack_reference ? ` · ${c.paystack_reference}` : ''}
                            </option>
                          ))}
                        </select>
                        {suggested.length > 0 && !linked && (
                          <p className="mt-1 text-[10px] text-[#C9A02C]">
                            Suggested:{' '}
                            {suggested
                              .map(
                                (c) =>
                                  `${c.contributor_name || 'Anonymous'} (${c.currency} ${c.amount})`,
                              )
                              .join('; ')}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="rounded border border-[#3D2B1F]/20 px-1 py-1"
                          value={row.reconciliation_status ?? 'pending'}
                          onChange={(e) => {
                            const status = e.target.value as
                              | 'pending'
                              | 'reconciled'
                              | 'unmatched'
                            updateRow(index, { reconciliation_status: status })
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="reconciled">Reconciled</option>
                          <option value="unmatched">Unmatched</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-medium text-[#1A1A1A]/80">Recorded contributions</h3>
          <div className="overflow-x-auto rounded border border-[#3D2B1F]/12">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-[#3D2B1F]/5 text-[#1A1A1A]/70">
                <tr>
                  <th className="px-2 py-2 font-medium">Paid</th>
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {paidContributions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-2 py-3 text-[#1A1A1A]/55">
                      No paid contributions yet.
                    </td>
                  </tr>
                )}
                {paidContributions.map((c) => (
                  <tr key={c.id} className="border-t border-[#3D2B1F]/10">
                    <td className="px-2 py-2 whitespace-nowrap">
                      {c.paid_at ? c.paid_at.slice(0, 10) : '—'}
                    </td>
                    <td className="px-2 py-2">{c.contributor_name ?? 'Anonymous'}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {c.currency} {c.amount.toLocaleString()}
                    </td>
                    <td className="px-2 py-2">{c.paystack_reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function ReconciliationToolbar({
  saving,
  onSuggest,
}: {
  saving: boolean
  onSuggest: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={saving}
        className="rounded-md border border-[#C9A02C]/50 px-3 py-1.5 text-sm font-medium text-[#3D2B1F]"
        onClick={onSuggest}
      >
        Suggest matches
      </button>
    </div>
  )
}
