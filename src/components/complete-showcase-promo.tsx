import Link from 'next/link'
import { COMPLETE_SHOWCASE_PATH } from '@/lib/complete-showcase'
import type { ServiceTierMode } from '@/lib/service-tier-copy'

type CompleteShowcasePromoProps = {
  variant?: 'card' | 'banner' | 'inline'
  /** When on the notice tier start page, clarify these are poster looks — not notice-only. */
  tierMode?: ServiceTierMode
  className?: string
}

export function CompleteShowcasePromo({
  variant = 'card',
  tierMode,
  className = '',
}: CompleteShowcasePromoProps) {
  const isNoticeTier = tierMode === 'notice'

  if (variant === 'inline') {
    return (
      <p className={`text-sm ${className}`}>
        <Link href={COMPLETE_SHOWCASE_PATH} className="passage-text-link font-medium">
          {isNoticeTier
            ? 'See 4 full memorial poster looks (not notice-only) →'
            : 'See 4 complete memorial poster looks →'}
        </Link>
      </p>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={`rounded-lg border border-[#C9A02C]/35 bg-[#FAF6EE] px-4 py-3 text-sm text-[#1A1A1A]/85 ${className}`}
      >
        <span className="font-medium text-[#3D2B1F]">
          {isNoticeTier ? 'Want a designed memorial poster?' : 'Four flagship poster looks'}
        </span>{' '}
        <Link href={COMPLETE_SHOWCASE_PATH} className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
          See 4 complete memorial posters
        </Link>
        <span className="text-[#1A1A1A]/55">
          {isNoticeTier
            ? ' — full programme-style layouts, not the minimal death notice.'
            : ' — programme, monument, kente, and night vigil with real portraits.'}
        </span>
      </div>
    )
  }

  return (
    <Link
      href={COMPLETE_SHOWCASE_PATH}
      className={`block rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-card-bg)] p-5 shadow-sm transition hover:border-[color-mix(in_srgb,var(--passage-accent)_35%,transparent)] hover:shadow-md ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--passage-muted)]">Complete memorial posters</p>
      <p className="mt-2 font-[family-name:var(--passage-font-display)] text-xl font-semibold text-[var(--passage-heading)]">
        {isNoticeTier ? 'Full poster looks — not notice-only' : 'Four complete memorial posters'}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--passage-muted)]">
        {isNoticeTier
          ? 'These are designed programme-style memorial pages with portrait and gallery — separate from the short death notice above.'
          : 'Printed programme, quiet monument, kente restraint, and night vigil — final poster aesthetics with real photography.'}
      </p>
      <p className="mt-3 text-sm font-medium text-[var(--passage-accent)]">View the four poster looks →</p>
    </Link>
  )
}
