'use client'

import { useState } from 'react'
import { ServiceTierTabs, type ServiceTierMode } from '@/components/service-tier-tabs'

export function HomeServiceTierSection() {
  const [activeMode, setActiveMode] = useState<ServiceTierMode>('notice')

  return (
    <section className="w-full max-w-2xl space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--passage-muted)]">What does your family need today</p>
        <h2 className="font-[family-name:var(--passage-font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
          Start where you are
        </h2>
        <p className="text-sm leading-relaxed text-[var(--passage-muted)]">
          Some families need the word out tonight. Others are coordinating a five-day event from three countries.
          Each option stands on its own — add more only if you need it.
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
