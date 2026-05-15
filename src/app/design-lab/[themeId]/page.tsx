import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
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
          </div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--passage-muted)]">
            {meta.group} · {meta.id}
          </p>
        </div>
      </div>
      <MemorialThemePreview themeId={theme} />
    </div>
  )
}
