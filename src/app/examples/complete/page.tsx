import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  COMPLETE_SHOWCASE_ENTRIES,
  completeShowcaseCreateHref,
} from '@/lib/complete-showcase'
import { VISUAL_THEME_COUNT } from '@/lib/visual-themes'

export const metadata: Metadata = {
  title: 'Four complete memorial looks · Passage',
  description:
    'Live example memorials with real photos — printed programme, quiet monument, kente restraint, and night vigil.',
}

export default function CompleteShowcasePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C9A02C]">Complete examples (4)</p>
        <h1 className="mt-2 font-[family-name:var(--font-libre-baskerville)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Four complete looks
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#1A1A1A]/70">
          Each card opens a real memorial page — portrait, biography, and gallery — with a different visual
          theme applied for preview. Nothing here is a generated mockup.
        </p>
        <p className="mt-4 text-sm text-[#1A1A1A]/60">
          Not sure which palette fits?{' '}
          <Link href="/design-lab" className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
            Browse all appearance styles ({VISUAL_THEME_COUNT}+)
          </Link>{' '}
          for colour swatches, each with a link to the same live examples.
        </p>

        <ul className="mt-12 space-y-16">
          {COMPLETE_SHOWCASE_ENTRIES.map((entry) => (
            <li key={entry.visualTheme} className="space-y-4">
              <Link
                href={entry.liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-2xl border border-[#3D2B1F]/12 bg-[#1A1A1A]/5 shadow-md transition hover:border-[#6B1F2A]/30"
              >
                <div className="relative aspect-[3/4] w-full max-h-[480px] sm:max-h-[560px]">
                  <Image
                    src={entry.imageSrc}
                    alt={`${entry.label} — ${entry.exampleLabel}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 672px"
                    priority={entry.visualTheme === 'programme'}
                  />
                </div>
              </Link>
              <div>
                <h2 className="font-[family-name:var(--font-libre-baskerville)] text-2xl font-semibold text-[#3D2B1F]">
                  {entry.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]/75">{entry.description}</p>
                <p className="mt-2 text-xs text-[#1A1A1A]/55">{entry.exampleLabel}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#1A1A1A]/45">
                  visual_theme: {entry.visualTheme}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={entry.liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
                  >
                    View live example
                  </Link>
                  <Link
                    href={completeShowcaseCreateHref(entry.visualTheme)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#3D2B1F] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] transition hover:opacity-90"
                  >
                    Use this style
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <section className="mt-16 border-t border-[#3D2B1F]/12 pt-10">
          <h2 className="text-sm font-medium text-[#3D2B1F]">All appearance styles ({VISUAL_THEME_COUNT}+)</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]/65">
            The design lab lists every coordinator-selectable theme. Each swatch links to a real example
            memorial with that theme applied.
          </p>
          <Link
            href="/design-lab"
            className="mt-4 inline-block text-sm font-medium text-[#6B1F2A] underline-offset-2 hover:underline"
          >
            Open the design lab →
          </Link>
        </section>

        <p className="mt-12 text-sm text-[#1A1A1A]/60">
          <Link href="/" className="passage-text-link">
            ← Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
