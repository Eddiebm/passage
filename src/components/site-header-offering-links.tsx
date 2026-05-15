'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { SERVICE_TIER_COPY, SERVICE_TIER_ORDER } from '@/lib/service-tier-copy'

const linkClass =
  'shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[var(--passage-header-text)]/85 hover:bg-[color-mix(in_srgb,var(--passage-header-text)_8%,transparent)] hover:text-[var(--passage-header-link)]'

const activeLinkClass =
  'shrink-0 whitespace-nowrap rounded-md bg-[color-mix(in_srgb,var(--passage-header-text)_12%,transparent)] px-2.5 py-1.5 font-medium text-[var(--passage-header-link)]'

export function SiteHeaderOfferingLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const startMatch = pathname?.match(/^\/start\/(notice|programme|full)$/)
  const activeMode =
    pathname === '/create'
      ? searchParams.get('mode')
      : startMatch
        ? startMatch[1]
        : null

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
