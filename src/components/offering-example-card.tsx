import Image from 'next/image'
import Link from 'next/link'
import type { TierExampleMemorial } from '@/lib/service-tier-examples'
import { exampleMemorialViewHref } from '@/lib/service-tier-examples'

export function OfferingExampleCard({ example }: { example: TierExampleMemorial }) {
  const href = exampleMemorialViewHref(example)

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-surface,#fff)]">
      <div className="relative aspect-[4/3] w-full bg-[color-mix(in_srgb,var(--passage-rule)_8%,transparent)]">
        <Image
          src={example.photoUrl}
          alt={`${example.deceasedName} — memorial example`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, 320px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="font-[family-name:var(--passage-font-display)] text-lg font-semibold tracking-tight text-[var(--passage-heading)]">
            {example.deceasedName}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--passage-muted)]">{example.summary}</p>
        </div>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_35%,transparent)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--passage-heading)] transition hover:bg-[color-mix(in_srgb,var(--passage-rule)_6%,transparent)]"
        >
          View full example
        </Link>
      </div>
    </article>
  )
}
