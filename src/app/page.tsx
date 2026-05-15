import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="passage-memorial-main mx-auto flex w-full flex-1 flex-col justify-center gap-10 px-4 py-16">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--passage-muted)]">Coordinator desk</p>
          <h1 className="font-[family-name:var(--passage-font-display)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Every life deserves to be remembered.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--passage-muted)]">
            Passage helps families publish announcements, programmes, and contribution links in one calm place —
            edited by the family, shared on WhatsApp.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/create" className="passage-text-link text-base font-medium">
              Create a memorial →
            </Link>
            <Link
              href="/memorial/bannerman-samuel-2026"
              className="text-base text-[var(--passage-muted)] hover:text-[var(--passage-text)]"
            >
              See an example
            </Link>
          </div>
        </div>
        <ul className="max-w-xl space-y-4 border-t border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] pt-8 text-sm leading-relaxed text-[var(--passage-muted)]">
          <li>
            <span className="text-[var(--passage-heading)]">Family edits final.</span> Nothing publishes without
            approval.
          </li>
          <li>
            <span className="text-[var(--passage-heading)]">One link.</span> Programme, appeal, and tributes together.
          </li>
          <li>
            <span className="text-[var(--passage-heading)]">Built for Ghana &amp; Nigeria first.</span> Titles, family
            houses, and traditions as first-class fields.
          </li>
        </ul>
      </main>
      <footer className="border-t border-[color-mix(in_srgb,var(--passage-rule)_20%,transparent)] py-6 text-center text-xs text-[var(--passage-muted)]">
        <p>Passage — digital infrastructure for how African communities process death.</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/help" className="passage-text-link">
            Help
          </Link>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="passage-text-link">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  )
}
