import type { VisualTheme } from '@/lib/visual-themes'
import { getVisualThemeMeta } from '@/lib/visual-themes'

const SAMPLE = {
  name: 'Kwame Mensah Bannerman',
  dates: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
  line: 'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
}

export function MemorialThemePreview({
  themeId,
  compact = false,
  className = '',
}: {
  themeId: VisualTheme
  compact?: boolean
  className?: string
}) {
  const meta = getVisualThemeMeta(themeId)

  return (
    <div
      className={`passage-memorial-root overflow-hidden ${compact ? 'text-[11px]' : ''} ${className}`}
      data-theme={themeId}
    >
      <div
        className={
          compact
            ? 'px-3 py-4'
            : 'mx-auto min-h-[70vh] max-w-[var(--passage-content-max)] px-6 py-16'
        }
      >
        <div
          className={
            compact
              ? 'rounded border border-[color-mix(in_srgb,var(--passage-rule)_20%,transparent)] bg-[var(--passage-card-bg)] p-3'
              : 'passage-panel p-8'
          }
        >
          <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--passage-muted)]">
            {meta?.label ?? themeId}
          </p>
          <div className="passage-accent-line" aria-hidden />
          <h1
            className={`passage-display-name mt-2 text-[var(--passage-heading)] ${
              compact ? 'text-base leading-tight' : 'text-3xl'
            }`}
            style={{ fontFamily: 'var(--passage-font-display)' }}
          >
            {SAMPLE.name}
          </h1>
          <p className="mt-2 text-[var(--passage-muted)]">{SAMPLE.dates}</p>
          <hr className="my-3 border-0 border-t border-[color-mix(in_srgb,var(--passage-rule)_35%,transparent)]" />
          <p className="leading-relaxed text-[var(--passage-text)]">{SAMPLE.line}</p>
        </div>
      </div>
    </div>
  )
}
