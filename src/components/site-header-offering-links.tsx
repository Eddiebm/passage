'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SERVICE_TIER_COPY, SERVICE_TIER_ORDER, type ServiceTierMode } from '@/lib/service-tier-copy'
import { isServiceTierMode } from '@/lib/service-tiers'

const linkClass =
  'shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[var(--passage-header-text)]/85 hover:bg-[color-mix(in_srgb,var(--passage-header-text)_8%,transparent)] hover:text-[var(--passage-header-link)]'

const activeLinkClass =
  'shrink-0 whitespace-nowrap rounded-md bg-[color-mix(in_srgb,var(--passage-header-text)_12%,transparent)] px-2.5 py-1.5 font-medium text-[var(--passage-header-link)]'

type SiteHeaderOfferingLinksProps = {
  /** Server- or parent-provided active tier (avoids useSearchParams CSR bailout). */
  highlightTierMode?: ServiceTierMode | null
}

export function SiteHeaderOfferingLinks({ highlightTierMode = null }: SiteHeaderOfferingLinksProps) {
  const pathname = usePathname()
  const startMatch = pathname?.match(/^\/start\/(notice|programme|full)$/)
  const pathMode = startMatch?.[1]
  const activeMode =
    highlightTierMode ??
    (pathMode && isServiceTierMode(pathMode) ? pathMode : null)

  return (
    <div
      className="-mx-1 flex gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
      aria-label="Service tiers"
    >
      {SERVICE_TIER_ORDER.map((mode) => {
        const tier = SERVICE_TIER_COPY[mode]
        const isActive = activeMode === mode
        return (
          <Link
            key={mode}
            href={tier.startHref}
            className={isActive ? activeLinkClass : linkClass}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="sm:hidden">{tier.navLabel}</span>
            <span className="hidden sm:inline">{tier.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
