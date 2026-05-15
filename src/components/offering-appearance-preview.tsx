import Link from 'next/link'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
import {
  getThemesForOfferingPreview,
  VISUAL_THEME_COUNT,
  type VisualThemeMeta,
} from '@/lib/visual-themes'
import type { VisualTheme } from '@/lib/visual-themes'
import { themeExampleHref, themeExampleLabel } from '@/lib/theme-example-memorials'

export function OfferingAppearancePreview() {
  const themes = getThemesForOfferingPreview(6)

  return (
    <section className="mt-10 space-y-4" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" className="text-sm font-medium text-[var(--passage-heading)]">
        Choose how it looks
      </h2>
      <p className="text-sm leading-relaxed text-[var(--passage-muted)]">
        Every memorial can use a different visual style — calm programme, night vigil, kente restraint, and
        dozens more. Swatches below; each opens a real example memorial in a new tab.
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
      {themes.map((theme) => {
        const themeId = theme.id as VisualTheme
        const liveHref = themeExampleHref(themeId)
        return (
          <article
            key={theme.id}
            className="overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] bg-[var(--passage-card-bg)] shadow-sm"
          >
            <MemorialThemePreview themeId={themeId} compact />
            <div className="border-t border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] px-3 py-2">
              <p className="text-sm font-medium text-[var(--passage-heading)]">{theme.label}</p>
              <p className="mt-1 text-[10px] text-[var(--passage-muted)]">{themeExampleLabel(themeId)}</p>
              <Link
                href={liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-[var(--passage-accent)] underline-offset-2 hover:underline"
              >
                View full example
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
