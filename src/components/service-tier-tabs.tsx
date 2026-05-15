'use client'

import Link from 'next/link'
import { useId } from 'react'
import {
  SERVICE_TIERS,
  type ServiceTierCopy,
  type ServiceTierMode,
} from '@/lib/service-tiers'
export { SERVICE_TIERS, tierDefaults, tierLabel, isServiceTierMode } from '@/lib/service-tiers'
export type { ServiceTierMode }

type ServiceTierTabsProps = {
  activeMode: ServiceTierMode
  onSelect?: (mode: ServiceTierMode) => void
  /** Show tier CTAs to `/create?mode=…` (landing / help). */
  showStartCta?: boolean
  /** Emphasise pre-selected tier from `?mode=` (create wizard). */
  highlightPreselected?: boolean
  className?: string
}

function TierPanelBody({
  tier,
  showStartCta,
}: {
  tier: ServiceTierCopy
  showStartCta: boolean
}) {
  return (
    <>
      <p className="text-sm leading-relaxed text-[var(--passage-muted)]">{tier.description}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-[var(--passage-muted)]">
        You get
      </p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--passage-text)]">
        {tier.youGet.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[var(--passage-accent,#C9A02C)]" aria-hidden>
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-[var(--passage-text)]">
        <span className="font-medium text-[var(--passage-heading)]">{tier.enoughIfLabel}</span>{' '}
        {tier.enoughIf}
        {tier.enoughNote ? (
          <>
            {' '}
            <span className="text-[var(--passage-muted)]">{tier.enoughNote}</span>
          </>
        ) : null}
      </p>
      {showStartCta ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={tier.createHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--passage-heading,#1A1A1A)] px-5 py-2.5 text-sm font-medium text-[var(--passage-bg,#FAFAF8)] transition hover:opacity-90"
          >
            {tier.ctaLabel}
          </Link>
          {tier.reassurance ? (
            <p className="text-xs leading-relaxed text-[var(--passage-muted)] sm:max-w-[14rem]">
              {tier.reassurance}
            </p>
          ) : null}
        </div>
      ) : tier.reassurance ? (
        <p className="mt-4 text-xs leading-relaxed text-[var(--passage-muted)]">{tier.reassurance}</p>
      ) : null}
    </>
  )
}

export function ServiceTierTabs({
  activeMode,
  onSelect,
  showStartCta = false,
  highlightPreselected = false,
  className = '',
}: ServiceTierTabsProps) {
  const baseId = useId()

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="What you need"
        className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden"
      >
        {SERVICE_TIERS.map((tier) => {
          const selected = tier.mode === activeMode
          const tabId = `${baseId}-pill-${tier.mode}`
          const panelId = `${baseId}-panel-${tier.mode}`
          return (
            <button
              key={tier.mode}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              onClick={() => onSelect?.(tier.mode)}
              className={`min-h-[44px] shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                selected
                  ? 'border-[var(--passage-accent,#C9A02C)] bg-[color-mix(in_srgb,var(--passage-accent,#C9A02C)_12%,transparent)] text-[var(--passage-heading,#1A1A1A)]'
                  : 'border-[color-mix(in_srgb,var(--passage-rule,#3D2B1F)_22%,transparent)] bg-[var(--passage-surface,#fff)] text-[var(--passage-muted)]'
              } ${highlightPreselected && selected ? 'ring-2 ring-[var(--passage-accent,#C9A02C)]/35 ring-offset-2 ring-offset-[var(--passage-bg,#FAFAF8)]' : ''}`}
            >
              {tier.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        {SERVICE_TIERS.map((tier) => {
          const selected = tier.mode === activeMode
          const tabId = `${baseId}-tab-${tier.mode}`
          const panelId = `${baseId}-panel-${tier.mode}`
          return (
            <div
              key={tier.mode}
              className={`rounded-lg border transition ${
                selected
                  ? 'border-[color-mix(in_srgb,var(--passage-accent,#C9A02C)_45%,transparent)] bg-[var(--passage-surface,#fff)]'
                  : 'border-[color-mix(in_srgb,var(--passage-rule)_20%,transparent)] bg-[color-mix(in_srgb,var(--passage-surface,#fff)_60%,transparent)]'
              } ${highlightPreselected && selected ? 'ring-2 ring-[var(--passage-accent,#C9A02C)]/25 ring-offset-2 ring-offset-[var(--passage-bg,#FAFAF8)]' : ''}`}
            >
              <button
                type="button"
                role="tab"
                id={tabId}
                aria-selected={selected}
                aria-controls={panelId}
                onClick={() => onSelect?.(tier.mode)}
                className="flex w-full min-h-[44px] flex-col gap-1 px-4 py-3 text-left sm:px-5 sm:py-4"
              >
                <span className="font-[family-name:var(--passage-font-display)] text-base font-semibold tracking-tight text-[var(--passage-heading)] sm:text-lg">
                  {tier.label}
                </span>
                {!selected ? (
                  <span className="text-sm leading-relaxed text-[var(--passage-muted)]">{tier.tagline}</span>
                ) : null}
              </button>
              {selected ? (
                <div
                  role="tabpanel"
                  id={panelId}
                  aria-labelledby={tabId}
                  className="border-t border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] px-4 pb-5 pt-1 sm:px-5 sm:pb-6"
                >
                  <TierPanelBody tier={tier} showStartCta={showStartCta} />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
