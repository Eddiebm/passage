import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  contributionsByCurrency,
  formatMinorSummary,
  summarizePledges,
} from '@/lib/closure-accounting'
import { formatPledgeAmountMinor } from '@/lib/memorial-pledges'
import { memorialPagePath } from '@/lib/memorial-share'
import { getMemorialBlob } from '@/lib/memorial-store'
import { getSiteOrigin } from '@/lib/site-url'
import { MemorialPrintToolbar } from '../print/print-toolbar'

function formatAccra(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const blob = await getMemorialBlob(slug)
  if (!blob) return { title: 'Closure · Memorial | Passage' }
  const origin = getSiteOrigin()
  return {
    title: `${blob.memorial.deceased_name} — closure & accounting · Passage`,
    description: `Closure summary for ${blob.memorial.deceased_name}.`,
    alternates: { canonical: `${origin}${memorialPagePath(slug)}/closure` },
    robots: { index: false, follow: false },
  }
}

export default async function MemorialClosurePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blob = await getMemorialBlob(slug)
  if (!blob) notFound()

  const m = blob.memorial
  const currency = m.fundraising_currency || 'GHS'
  const contribGroups = contributionsByCurrency(blob.contributions)
  const pledgeSummary = summarizePledges(m.pledges, currency)
  const closed = m.closure_status === 'closed'

  return (
    <div className="memorial-print-root">
      <MemorialPrintToolbar />

      <header className="print-block print-section-major">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A02C]">
          Closure &amp; accounting
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{m.deceased_name}</h1>
        {closed && m.closed_at && (
          <p className="mt-1 text-sm text-[#1A1A1A]/70">Closed {formatAccra(m.closed_at)}</p>
        )}
        {!closed && (
          <p className="mt-1 text-sm text-amber-900">
            Memorial still active — close from the edit portal when arrangements conclude.
          </p>
        )}
      </header>

      {m.closure_notes?.trim() && (
        <section className="print-block print-section">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3D2B1F]">Disposition</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.closure_notes.trim()}</p>
        </section>
      )}

      <section className="print-block print-section">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3D2B1F]">
          Contributions received
        </h2>
        {contribGroups.length === 0 ? (
          <p className="mt-2 text-sm text-[#1A1A1A]/70">No recorded payments yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {contribGroups.map((g) => (
              <li key={g.currency}>
                <p className="text-sm font-medium">
                  Total {g.total.toLocaleString()} {g.currency} · {g.count} payment
                  {g.count === 1 ? '' : 's'}
                </p>
                <table className="mt-2 w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#3D2B1F]/20 text-left">
                      <th className="py-1 pr-2">Date</th>
                      <th className="py-1 pr-2">Name</th>
                      <th className="py-1 pr-2 text-right">Amount</th>
                      <th className="py-1">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((c) => (
                      <tr key={c.id} className="border-b border-[#3D2B1F]/10">
                        <td className="py-1.5 pr-2">{formatAccra(c.paid_at)}</td>
                        <td className="py-1.5 pr-2">{c.contributor_name || '—'}</td>
                        <td className="py-1.5 pr-2 text-right">
                          {c.amount.toLocaleString()} {c.currency}
                        </td>
                        <td className="py-1.5 font-mono text-[10px]">{c.paystack_reference || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="print-block print-section">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3D2B1F]">Pledges</h2>
        <p className="mt-2 text-sm text-[#1A1A1A]/80">
          Pledged: {pledgeSummary.pledged} · Partial: {pledgeSummary.partial} · Fulfilled:{' '}
          {pledgeSummary.fulfilled} · Cancelled: {pledgeSummary.cancelled} · Open:{' '}
          {pledgeSummary.open}
        </p>
        {pledgeSummary.totalsByCurrency.some(
          (t) => t.pledgedMinor > 0 || t.fulfilledMinor > 0,
        ) && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {pledgeSummary.totalsByCurrency.map((t) => (
              <li key={t.currency}>
                {t.currency}: outstanding {formatMinorSummary(t.pledgedMinor, t.currency)} · fulfilled{' '}
                {formatMinorSummary(t.fulfilledMinor, t.currency)}
              </li>
            ))}
          </ul>
        )}
        {(m.pledges?.length ?? 0) > 0 && (
          <table className="mt-3 w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#3D2B1F]/20 text-left">
                <th className="py-1 pr-2">Pledger</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2 text-right">Amount</th>
                <th className="py-1">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {(m.pledges ?? []).map((p) => (
                <tr key={p.id} className="border-b border-[#3D2B1F]/10">
                  <td className="py-1.5 pr-2">{p.pledger_name}</td>
                  <td className="py-1.5 pr-2 capitalize">{p.status}</td>
                  <td className="py-1.5 pr-2 text-right">
                    {p.amount_minor != null
                      ? formatPledgeAmountMinor(p.amount_minor, p.currency || currency)
                      : '—'}
                  </td>
                  <td className="py-1.5 font-mono text-[10px]">{p.contribution_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="print-block mt-8 border-t border-[#3D2B1F]/15 pt-4 text-xs text-[#1A1A1A]/60">
        <p>
          Coordinator sheet — not linked on the public memorial. Print via browser (Save as PDF).
        </p>
        <p className="mt-1">
          <Link href={`/memorial/${slug}/edit`} className="underline">
            Edit portal
          </Link>
          {' · '}
          <Link href={`/memorial/${slug}/print`} className="underline">
            Programme print
          </Link>
        </p>
      </footer>
    </div>
  )
}
