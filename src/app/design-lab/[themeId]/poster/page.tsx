import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeAssetFullBleed } from '@/components/theme-asset-full-bleed'
import { completeShowcaseCreateHref } from '@/lib/complete-showcase'
import { themeExampleHref, themeExampleLabel } from '@/lib/theme-example-memorials'
import {
  designLabThemePreviewHref,
  themePosterAssetUrl,
} from '@/lib/theme-poster-assets'
import { getVisualThemeMeta, isVisualTheme, VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import type { VisualTheme } from '@/lib/visual-themes'

export async function generateStaticParams() {
  return VISUAL_THEME_REGISTRY.map((t) => ({ themeId: t.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ themeId: string }>
}): Promise<Metadata> {
  const { themeId } = await params
  const meta = getVisualThemeMeta(themeId)
  if (!meta) return { title: 'Burial poster preview · Passage' }
  return {
    title: `${meta.label} — burial poster · Passage`,
    description: `Full 1080×1920 burial poster for ${meta.label}. Same image as the posters browse grid.`,
  }
}

export default async function DesignLabBurialPosterPage({
  params,
}: {
  params: Promise<{ themeId: string }>
}) {
  const { themeId } = await params
  if (!isVisualTheme(themeId)) notFound()

  const meta = getVisualThemeMeta(themeId)
  if (!meta) notFound()

  const theme = themeId as VisualTheme
  const downloadHref = themePosterAssetUrl(theme)
  const liveHref = themeExampleHref(theme)
  const createHref = completeShowcaseCreateHref(theme)
  const phonePreviewHref = designLabThemePreviewHref(theme)

  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C9A02C]">Burial poster preview</p>
        <h1 className="mt-2 font-[family-name:var(--font-libre-baskerville)] text-3xl font-semibold tracking-tight sm:text-4xl">
          {meta.label}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#1A1A1A]/70">{meta.description}</p>
        <p className="mt-2 text-xs text-[#1A1A1A]/55">{themeExampleLabel(theme)}</p>
        <p className="mt-2 text-[10px] uppercase tracking-wider text-[#1A1A1A]/45">
          1080×1920 portrait · same JPG as download from Posters
        </p>

        <div className="mt-8">
          <ThemeAssetFullBleed themeId={theme} tier="burial-poster" priority />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={downloadHref}
            download={`passage-burial-poster-${themeId}.jpg`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#3D2B1F] px-5 py-2.5 text-sm font-medium text-[#FAFAF8] transition hover:opacity-90"
          >
            Download poster JPG
          </a>
          <Link
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
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
            href={phonePreviewHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#3D2B1F] transition hover:border-[#6B1F2A]/40"
          >
            Phone-frame preview (design lab)
          </Link>
        </div>

        <p className="mt-10 text-sm text-[#1A1A1A]/60">
          <Link href="/posters" className="passage-text-link">
            ← All burial posters
          </Link>
          {' · '}
          <Link href="/design-lab" className="passage-text-link">
            Design lab
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
