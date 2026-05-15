'use client'

import { useState } from 'react'
import { ServiceTierTabs, type ServiceTierMode } from '@/components/service-tier-tabs'

export function HomeServiceTierSection() {
  const [activeMode, setActiveMode] = useState<ServiceTierMode>('notice')

  return (
    <section className="w-full max-w-2xl space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--passage-muted)]">Choose your service</p>
        <h2 className="font-[family-name:var(--passage-font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
          Pick the path that fits today
        </h2>
        <p className="text-sm leading-relaxed text-[var(--passage-muted)]">
          Each option stands on its own — no pressure to add more than your family needs right now.
        </p>
      </div>
      <ServiceTierTabs
        activeMode={activeMode}
        onSelect={setActiveMode}
        showStartCta
      />
    </section>
  )
}
