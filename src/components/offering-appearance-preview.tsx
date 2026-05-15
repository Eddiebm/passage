import Link from 'next/link'
import { ThemePreviewImage } from '@/components/theme-preview-image'
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
        Every programme memorial can use a different visual style — calm programme, night vigil, kente
        restraint, and dozens more. Each card is a full poster-scale phone preview; open the design lab
        preview or see it on a live example memorial with programme layout (not notice-only).
      </p>
      <AppearancePreviewGrid themes={themes} />
      <p className="text-sm">
        <Link href="/design-lab" className="passage-text-link font-medium">
          See all appearance examples ({VISUAL_THEME_COUNT}) →
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
        const detailHref = `/design-lab/${themeId}`
        const liveHref = themeExampleHref(themeId)
        return (
          <article
            key={theme.id}
            className="overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] bg-[var(--passage-card-bg)] shadow-sm"
          >
            <Link href={detailHref} className="block">
              <ThemePreviewImage themeId={themeId} />
            </Link>
            <div className="border-t border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] px-3 py-2">
              <p className="text-sm font-medium text-[var(--passage-heading)]">{theme.label}</p>
              <p className="mt-1 text-[10px] text-[var(--passage-muted)]">{themeExampleLabel(themeId)}</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium">
                <Link
                  href={detailHref}
                  className="text-[var(--passage-accent)] underline-offset-2 hover:underline"
                >
                  Full preview
                </Link>
                <Link
                  href={liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--passage-accent)] underline-offset-2 hover:underline"
                >
                  View on example memorial
                </Link>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
