'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ServiceTierTabs, type ServiceTierMode } from '@/components/service-tier-tabs'
import { getServiceTierCopy } from '@/lib/service-tier-copy'

export function HelpServiceTierGuide() {
  const [activeMode, setActiveMode] = useState<ServiceTierMode>('notice')
  const tier = getServiceTierCopy(activeMode)

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[var(--passage-muted)]">
        Each path stands on its own. Pick what matches what your family needs today — you can change the public page
        later in the family edit portal.
      </p>
      <ServiceTierTabs activeMode={activeMode} onSelect={setActiveMode} showStartCta />
      <div className="space-y-3 text-sm leading-relaxed text-[var(--passage-muted)]">
        <h3 className="text-base font-medium text-[var(--passage-heading)]">Coordinator notes for {tier.label}</h3>
        <p>{tier.description}</p>
        <p>
          <span className="font-medium text-[var(--passage-heading)]">{tier.enoughIfLabel}</span> {tier.enoughIf}
          {tier.enoughNote ? ` ${tier.enoughNote}` : ''}
        </p>
        <p>
          <Link href={tier.createHref} className="passage-text-link font-medium">
            {tier.ctaLabel} →
          </Link>
        </p>
      </div>
    </div>
  )
}
