import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ThemePreviewImage } from '@/components/theme-preview-image'
import { MemorialThemeShell } from '@/components/memorial-theme-shell'
import { completeShowcaseCreateHref } from '@/lib/complete-showcase'
import {
  designLabBurialPosterHref,
  isFlagshipShowcaseTheme,
  completeShowcaseThemeHref,
} from '@/lib/theme-poster-assets'
import { themeExampleHref, themeExampleLabel } from '@/lib/theme-example-memorials'
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
  if (!meta) {
    return { title: 'Theme preview · Passage' }
  }
  return {
    title: `${meta.label} — design lab · Passage`,
    description: meta.description,
  }
}

export default async function DesignLabThemePage({
  params,
}: {
  params: Promise<{ themeId: string }>
}) {
  const { themeId } = await params

  if (!isVisualTheme(themeId)) notFound()

  const meta = getVisualThemeMeta(themeId)
  if (!meta) notFound()

  const theme = themeId as VisualTheme
  const liveHref = themeExampleHref(theme)
  const createHref = completeShowcaseCreateHref(theme)
  const burialPosterHref = designLabBurialPosterHref(theme)
  const flagshipHref = isFlagshipShowcaseTheme(theme) ? completeShowcaseThemeHref(theme) : null

  return (
    <MemorialThemeShell
      slug="design-lab"
      coordinatorTheme={theme}
      templateClass="passage-template-programme"
    >
      <div className="sticky top-0 z-10 border-b border-[color-mix(in_srgb,var(--passage-rule)_20%,transparent)] bg-[var(--passage-bg)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <Link
              href="/design-lab"
              className="text-[var(--passage-muted)] hover:text-[var(--passage-text)]"
            >
              ← All themes
            </Link>
            <p className="mt-1 font-medium text-[var(--passage-text)]">{meta.label}</p>
            <p className="text-xs text-[var(--passage-muted)]">{meta.description}</p>
            <p className="mt-1 text-[10px] text-[var(--passage-muted)]">{themeExampleLabel(theme)}</p>
            <p className="mt-1 text-[10px] text-[var(--passage-muted)]">
              Phone-frame preview — same JPG as the design lab grid thumbnail.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--passage-muted)]">
              {meta.group} · {meta.id}
            </p>
            <Link
              href={burialPosterHref}
              className="inline-flex min-h-[36px] items-center rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-bg)] px-3 py-1.5 text-xs font-medium text-[var(--passage-link)] hover:underline"
            >
              Burial poster (9:16)
            </Link>
            {flagshipHref ? (
              <Link
                href={flagshipHref}
                className="inline-flex min-h-[36px] items-center rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-bg)] px-3 py-1.5 text-xs font-medium text-[var(--passage-link)] hover:underline"
              >
                Complete poster look
              </Link>
            ) : null}
            <Link
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-bg)] px-3 py-1.5 text-xs font-medium text-[var(--passage-link)] hover:underline"
            >
              Live example memorial
            </Link>
            <Link
              href={createHref}
              className="inline-flex min-h-[36px] items-center rounded-md bg-[var(--passage-heading)] px-4 py-1.5 text-xs font-medium text-[var(--passage-bg)] transition hover:opacity-90"
            >
              Use this style →
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-center px-4 py-10">
        <ThemePreviewImage themeId={theme} large priority />
      </div>
    </MemorialThemeShell>
  )
}
