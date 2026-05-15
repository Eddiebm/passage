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
  title: 'Four complete memorial poster looks · Passage',
  description:
    'Full memorial poster and programme aesthetics — printed programme, quiet monument, kente restraint, and night vigil. Not the minimal death notice.',
}

export default function CompleteShowcasePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C9A02C]">Complete poster looks (4)</p>
        <h1 className="mt-2 font-[family-name:var(--font-libre-baskerville)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Four complete memorial posters
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#1A1A1A]/70">
          These are full memorial poster and programme layouts — portrait, announcement, programme styling, and
          gallery density — the looks families print and share as a designed memorial page.
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/60">
          They are <span className="font-medium text-[#3D2B1F]">not</span> the minimal death notice (
          <Link href="/start/notice" className="text-[#6B1F2A] underline-offset-2 hover:underline">
            notice only
          </Link>
          ). For a short announcement-only sheet, start there instead.
        </p>
        <p className="mt-4 text-sm text-[#1A1A1A]/60">
          Need all {VISUAL_THEME_COUNT} burial poster styles?{' '}
          <Link href="/posters" className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
            Browse burial posters
          </Link>{' '}
          — download JPGs or start a memorial with a style preselected.{' '}
          <Link href="/design-lab" className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
            Design lab
          </Link>{' '}
          has smaller phone previews for every theme.
        </p>

        <ul className="mt-12 space-y-16">
          {COMPLETE_SHOWCASE_ENTRIES.map((entry) => (
            <li key={entry.visualTheme} className="space-y-4">
              <Link
                href={entry.previewHref}
                className="block overflow-hidden rounded-2xl border border-[#3D2B1F]/12 bg-[#F4F0E8] shadow-md transition hover:border-[#6B1F2A]/30"
              >
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={entry.imageSrc}
                    alt={`${entry.label} memorial poster — ${entry.exampleLabel}`}
                    fill
                    className="object-contain object-center"
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
                  visual_theme: {entry.visualTheme} · programme poster
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={entry.previewHref}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#3D2B1F] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] transition hover:opacity-90"
                  >
                    Open full preview
                  </Link>
                  <Link
                    href={entry.memorialHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
                  >
                    View on live example memorial
                  </Link>
                  <Link
                    href={completeShowcaseCreateHref(entry.visualTheme)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
                  >
                    Use this style
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <section className="mt-16 border-t border-[#3D2B1F]/12 pt-10">
          <h2 className="text-sm font-medium text-[#3D2B1F]">All {VISUAL_THEME_COUNT} burial posters</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]/65">
            Every visual theme has a full 1080×1920 burial poster — portrait, print-ready, with real photography.
          </p>
          <Link
            href="/posters"
            className="mt-4 inline-block text-sm font-medium text-[#6B1F2A] underline-offset-2 hover:underline"
          >
            Browse all burial posters →
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
