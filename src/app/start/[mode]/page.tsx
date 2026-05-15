import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OfferingAppearancePreview } from '@/components/offering-appearance-preview'
import { OfferingExampleCard } from '@/components/offering-example-card'
import { OfferingFeatureChecklist } from '@/components/offering-feature-checklist'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getServiceTierCopy, type ServiceTierMode } from '@/lib/service-tier-copy'
import { getServiceTierExamples } from '@/lib/service-tier-examples'
import { isServiceTierMode } from '@/lib/service-tiers'

type PageProps = {
  params: Promise<{ mode: string }>
}

export function generateStaticParams() {
  return [{ mode: 'notice' }, { mode: 'programme' }, { mode: 'full' }]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { mode } = await params
  if (!isServiceTierMode(mode)) {
    return { title: 'Start — Passage' }
  }
  const tier = getServiceTierCopy(mode)
  return {
    title: `${tier.label} — examples · Passage`,
    description: `${tier.description} See a real example before you start.`,
  }
}

export default async function OfferingStartPage({ params }: PageProps) {
  const { mode: rawMode } = await params
  if (!isServiceTierMode(rawMode)) notFound()

  const mode = rawMode as ServiceTierMode
  const tier = getServiceTierCopy(mode)
  const { examples } = getServiceTierExamples(mode)

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader highlightTierMode={mode} />
      <main className="passage-memorial-main mx-auto w-full flex-1 px-4 py-10 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--passage-muted)]">See before you start</p>
        <h1 className="mt-2 font-[family-name:var(--passage-font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          {tier.label}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--passage-muted)]">{tier.description}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--passage-muted)]">{tier.tagline}</p>

        <section className="mt-10 space-y-4" aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="text-sm font-medium text-[var(--passage-heading)]">
            Example memorials
          </h2>
          <p className="text-sm leading-relaxed text-[var(--passage-muted)]">
            These are real layouts families use — open one in a new tab to see exactly what guests receive.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
              {examples.map((example) => (
                <OfferingExampleCard
                  key={`${example.slug}-${example.previewMode ?? 'live'}-${example.eyebrow ?? 'primary'}`}
                  example={example}
                />
              ))}
            </div>
            <OfferingFeatureChecklist tier={tier} />
          </div>
        </section>

        <OfferingAppearancePreview />

        <div className="mt-10 flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] pt-8 sm:flex-row sm:items-center">
          <Link
            href={tier.createHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-[var(--passage-heading,#1A1A1A)] px-6 py-3 text-base font-medium text-[var(--passage-bg,#FAFAF8)] transition hover:opacity-90"
          >
            Start yours
          </Link>
          {tier.reassurance ? (
            <p className="max-w-sm text-sm leading-relaxed text-[var(--passage-muted)]">{tier.reassurance}</p>
          ) : null}
        </div>

        <p className="mt-8 text-sm text-[var(--passage-muted)]">
          <Link href="/" className="passage-text-link">
            ← Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
