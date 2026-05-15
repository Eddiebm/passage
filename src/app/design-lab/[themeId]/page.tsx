import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
import { completeShowcaseCreateHref } from '@/lib/complete-showcase'
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
  searchParams,
}: {
  params: Promise<{ themeId: string }>
  searchParams: Promise<{ theme?: string }>
}) {
  const { themeId } = await params
  const query = await searchParams
  const resolvedId = (query.theme && isVisualTheme(query.theme) ? query.theme : themeId) as string

  if (!isVisualTheme(resolvedId)) notFound()

  const meta = getVisualThemeMeta(resolvedId)
  if (!meta) notFound()

  const theme = resolvedId as VisualTheme
  const liveHref = themeExampleHref(theme)
  const createHref = completeShowcaseCreateHref(theme)

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div className="sticky top-0 z-10 border-b border-[color-mix(in_srgb,var(--passage-rule)_20%,transparent)] bg-[var(--passage-bg)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 text-sm">
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
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--passage-muted)]">
              {meta.group} · {meta.id}
            </p>
            <Link
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-bg)] px-3 py-1.5 text-xs font-medium text-[var(--passage-link)] hover:underline"
            >
              View full example
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
      <MemorialThemePreview themeId={theme} />
    </div>
  )
}
