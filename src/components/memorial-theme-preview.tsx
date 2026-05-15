import Image from 'next/image'
import type { VisualTheme } from '@/lib/visual-themes'
import { getVisualThemeMeta } from '@/lib/visual-themes'
import {
  getShowcasePhotoForThemeId,
  getShowcaseSampleForThemeId,
  type ShowcaseSample,
} from '@/lib/showcase-sample'

function PreviewHero({
  compact,
  photoSrc,
  sample,
}: {
  compact: boolean
  photoSrc: string
  sample: ShowcaseSample
}) {
  return (
    <div className="passage-hero border-b border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] bg-[var(--passage-hero-bg)] text-[var(--passage-hero-text)]">
      <div
        className={
          compact
            ? 'flex min-h-[200px] flex-col'
            : 'mx-auto flex min-w-0 flex-col gap-8 px-4 py-12 sm:max-w-5xl sm:flex-row sm:items-center'
        }
      >
        <div
          className={
            compact
              ? 'relative h-24 w-full shrink-0'
              : 'relative h-56 w-full overflow-hidden bg-[color-mix(in_srgb,var(--passage-rule)_12%,transparent)] sm:h-64 sm:w-52 sm:shrink-0'
          }
          style={{ borderRadius: compact ? 0 : 'var(--passage-radius)' }}
        >
          <Image
            src={photoSrc}
            alt={sample.deceasedName}
            fill
            className="object-cover"
            sizes={compact ? '200px' : '(max-width: 640px) 100vw, 280px'}
            unoptimized
          />
        </div>
        <div className={compact ? 'space-y-1 px-2.5 py-2' : 'flex-1 space-y-3'}>
          {!compact && (
            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--passage-hero-muted)]">
              Preview
            </p>
          )}
          <div className="passage-accent-line" aria-hidden />
          <h1
            className={`passage-display-name font-semibold leading-tight text-[var(--passage-hero-text)] ${
              compact ? 'text-[11px]' : 'text-3xl sm:text-4xl'
            }`}
            style={{ fontFamily: 'var(--passage-font-display)' }}
          >
            {sample.deceasedName}
          </h1>
          {!compact && (
            <p className="text-sm text-[var(--passage-hero-muted)]">{sample.deceasedTitle}</p>
          )}
          <p
            className={`text-[var(--passage-hero-muted)] ${
              compact ? 'text-[8px] leading-snug' : 'text-sm'
            }`}
          >
            {compact ? sample.datesLine : sample.familyLine}
          </p>
          {!compact && (
            <p className="text-sm text-[var(--passage-hero-muted)]">{sample.datesLine}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewAnnouncement({ compact, sample }: { compact: boolean; sample: ShowcaseSample }) {
  return (
    <div
      className={
        compact
          ? 'border-t border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] px-2.5 py-2'
          : 'passage-panel mx-auto max-w-[var(--passage-content-max)] p-8'
      }
    >
      {!compact && (
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--passage-muted)]">
          Sample announcement
        </p>
      )}
      <p
        className={`leading-relaxed text-[var(--passage-text)] ${
          compact ? 'line-clamp-3 text-[9px] leading-snug' : 'mt-4 text-base'
        }`}
      >
        {sample.announcementSnippet}
      </p>
    </div>
  )
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-[200px] max-w-[200px]">
      <div className="rounded-[20px] border border-[#1a1a1a]/12 bg-[#1a1a1a] p-1 shadow-md">
        <div className="aspect-[9/16] min-h-[300px] overflow-hidden rounded-[15px] bg-[var(--passage-bg)]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function MemorialThemePreview({
  themeId,
  compact = false,
  embedded = false,
  className = '',
}: {
  themeId: VisualTheme
  compact?: boolean
  /** When true, parent MemorialThemeShell supplies data-theme and root styles. */
  embedded?: boolean
  className?: string
}) {
  const meta = getVisualThemeMeta(themeId)
  const photoSrc = getShowcasePhotoForThemeId(themeId)
  const sample = getShowcaseSampleForThemeId(themeId)
  const rootProps = embedded ? {} : ({ 'data-theme': themeId } as const)

  if (compact) {
    return (
      <div
        className={
          embedded
            ? `overflow-hidden bg-[var(--passage-bg)] ${className}`
            : `passage-memorial-root overflow-hidden bg-[var(--passage-bg)] ${className}`
        }
        {...rootProps}
      >
        <div className="flex justify-center p-3">
          <PhoneFrame>
            <PreviewHero compact photoSrc={photoSrc} sample={sample} />
            <PreviewAnnouncement compact sample={sample} />
          </PhoneFrame>
        </div>
      </div>
    )
  }

  return (
    <div
      className={
        embedded
          ? `overflow-x-hidden bg-[var(--passage-bg)] ${className}`
          : `passage-memorial-root overflow-x-hidden bg-[var(--passage-bg)] ${className}`
      }
      {...rootProps}
    >
      <div className="mx-auto min-h-[min(100vh,900px)] max-w-5xl px-4 py-8 sm:px-6">
        {!embedded && (
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--passage-muted)]">
            {meta?.label ?? themeId}
          </p>
        )}
        <PreviewHero compact={false} photoSrc={photoSrc} sample={sample} />
        <PreviewAnnouncement compact={false} sample={sample} />
      </div>
    </div>
  )
}
