import type { ServiceTierCopy } from '@/lib/service-tier-copy'

export function OfferingFeatureChecklist({ tier }: { tier: ServiceTierCopy }) {
  return (
    <aside
      className="rounded-lg border border-[color-mix(in_srgb,var(--passage-accent,#C9A02C)_35%,transparent)] bg-[color-mix(in_srgb,var(--passage-accent,#C9A02C)_6%,var(--passage-surface,#fff))] p-4 sm:p-5"
      aria-label="What you will make"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--passage-muted)]">
        What you will make
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--passage-text)]">
        {tier.youGet.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-0.5 text-[var(--passage-accent,#C9A02C)]" aria-hidden>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-[var(--passage-muted)]">
        <span className="font-medium text-[var(--passage-heading)]">{tier.enoughIfLabel}</span>{' '}
        {tier.enoughIf}
      </p>
    </aside>
  )
}
