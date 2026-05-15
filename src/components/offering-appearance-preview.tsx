import Link from 'next/link'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
import {
  getThemesForOfferingPreview,
  VISUAL_THEME_COUNT,
  type VisualThemeMeta,
} from '@/lib/visual-themes'
import type { VisualTheme } from '@/lib/visual-themes'

export function OfferingAppearancePreview() {
  const themes = getThemesForOfferingPreview(6)

  return (
    <section className="mt-10 space-y-4" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" className="text-sm font-medium text-[var(--passage-heading)]">
        Choose how it looks
      </h2>
      <p className="text-sm leading-relaxed text-[var(--passage-muted)]">
        Every memorial can use a different visual style — calm programme, night vigil, kente restraint, and
        dozens more.
      </p>
      <AppearancePreviewGrid themes={themes} />
      <p className="text-sm">
        <Link href="/design-lab" className="passage-text-link font-medium">
          See all appearance examples ({VISUAL_THEME_COUNT}+) →
        </Link>
      </p>
    </section>
  )
}

function AppearancePreviewGrid({ themes }: { themes: VisualThemeMeta[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => (
        <Link
          key={theme.id}
          href={`/design-lab/${theme.id}`}
          className="group overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] bg-[var(--passage-card-bg)] shadow-sm transition hover:border-[color-mix(in_srgb,var(--passage-accent)_40%,transparent)] hover:shadow-md"
        >
          <MemorialThemePreview themeId={theme.id as VisualTheme} compact />
          <div className="border-t border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] px-3 py-2">
            <p className="text-sm font-medium text-[var(--passage-heading)] group-hover:text-[var(--passage-accent)]">
              {theme.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
