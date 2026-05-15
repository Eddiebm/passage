import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeAssetFullBleed } from '@/components/theme-asset-full-bleed'
import {
  COMPLETE_SHOWCASE_ENTRIES,
  COMPLETE_SHOWCASE_PATH,
  completeShowcaseCreateHref,
  getCompleteShowcaseEntry,
} from '@/lib/complete-showcase'
import { getVisualThemeMeta } from '@/lib/visual-themes'

export function generateStaticParams() {
  return COMPLETE_SHOWCASE_ENTRIES.map((entry) => ({ themeId: entry.visualTheme }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ themeId: string }>
}): Promise<Metadata> {
  const { themeId } = await params
  const entry = getCompleteShowcaseEntry(themeId)
  const meta = getVisualThemeMeta(themeId)
  if (!entry || !meta) {
    return { title: 'Memorial poster preview · Passage' }
  }
  return {
    title: `${meta.label} — full poster preview · Passage`,
    description: meta.description,
  }
}

export default async function CompleteShowcaseThemePage({
  params,
}: {
  params: Promise<{ themeId: string }>
}) {
  const { themeId } = await params
  const entry = getCompleteShowcaseEntry(themeId)
  if (!entry) notFound()

  const createHref = completeShowcaseCreateHref(entry.visualTheme)

  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C9A02C]">Full poster preview</p>
        <h1 className="mt-2 font-[family-name:var(--font-libre-baskerville)] text-3xl font-semibold tracking-tight sm:text-4xl">
          {entry.label}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#1A1A1A]/70">{entry.description}</p>
        <p className="mt-2 text-xs text-[#1A1A1A]/55">{entry.exampleLabel}</p>

        <div className="mt-8">
          <ThemeAssetFullBleed themeId={entry.visualTheme} tier="flagship-showcase" priority />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={entry.memorialHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#3D2B1F] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] transition hover:opacity-90"
          >
            View on live example memorial
          </Link>
          <Link
            href={createHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
          >
            Use this style
          </Link>
          <Link
            href={`/design-lab/${entry.visualTheme}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
          >
            Phone-frame preview (design lab)
          </Link>
        </div>

        <p className="mt-10 text-sm text-[#1A1A1A]/60">
          <Link href={COMPLETE_SHOWCASE_PATH} className="passage-text-link">
            ← All four complete posters
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
