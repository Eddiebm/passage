import Link from 'next/link'
import { COMPLETE_SHOWCASE_PATH } from '@/lib/complete-showcase'

type CompleteShowcasePromoProps = {
  variant?: 'card' | 'banner' | 'inline'
  className?: string
}

export function CompleteShowcasePromo({ variant = 'card', className = '' }: CompleteShowcasePromoProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-sm ${className}`}>
        <Link href={COMPLETE_SHOWCASE_PATH} className="passage-text-link font-medium">
          See 4 complete examples with photos →
        </Link>
      </p>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={`rounded-lg border border-[#C9A02C]/35 bg-[#FAF6EE] px-4 py-3 text-sm text-[#1A1A1A]/85 ${className}`}
      >
        <span className="font-medium text-[#3D2B1F]">Looking for a full preview?</span>{' '}
        <Link href={COMPLETE_SHOWCASE_PATH} className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
          See 4 complete examples with photos
        </Link>
        <span className="text-[#1A1A1A]/55"> — live example memorials with real photos.</span>
      </div>
    )
  }

  return (
    <Link
      href={COMPLETE_SHOWCASE_PATH}
      className={`block rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-card-bg)] p-5 shadow-sm transition hover:border-[color-mix(in_srgb,var(--passage-accent)_35%,transparent)] hover:shadow-md ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--passage-muted)]">Complete examples</p>
      <p className="mt-2 font-[family-name:var(--passage-font-display)] text-xl font-semibold text-[var(--passage-heading)]">
        See 4 complete examples with photos
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--passage-muted)]">
        Printed programme, quiet monument, kente restraint, and night vigil — full mobile memorial layouts
        with portrait and gallery, not just colour swatches.
      </p>
      <p className="mt-3 text-sm font-medium text-[var(--passage-accent)]">View the four complete looks →</p>
    </Link>
  )
}
