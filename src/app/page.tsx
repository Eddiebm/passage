import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CompleteShowcasePromo } from '@/components/complete-showcase-promo'
import { HomeServiceTierSection } from '@/components/home-service-tier-section'
import { VISUAL_THEME_COUNT } from '@/lib/visual-themes'

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="passage-memorial-main mx-auto flex w-full flex-1 flex-col gap-14 px-4 py-16">
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
        <HomeServiceTierSection />
        <CompleteShowcasePromo />
        <Link
          href="/design-lab"
          className="block max-w-xl rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-card-bg)] p-5 shadow-sm transition hover:border-[color-mix(in_srgb,var(--passage-accent)_35%,transparent)] hover:shadow-md"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--passage-muted)]">
            All appearance styles ({VISUAL_THEME_COUNT})
          </p>
          <p className="mt-2 font-[family-name:var(--passage-font-display)] text-xl font-semibold text-[var(--passage-heading)]">
            Browse every colour and typography option
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--passage-muted)]">
            Regional palettes, cultural accents, light and dark variants — quick swatches in the design lab.
            For full mobile layouts with photos, start with the four complete examples above.
          </p>
          <p className="mt-3 text-sm font-medium text-[var(--passage-accent)]">Explore the design lab →</p>
        </Link>
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
      <SiteFooter showExamples />
    </div>
  )
}
