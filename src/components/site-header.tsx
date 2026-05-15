import Link from 'next/link'
import { Suspense } from 'react'
import { SiteHeaderOfferingLinks } from '@/components/site-header-offering-links'

const EXAMPLE_MEMORIAL_HREF = '/memorial/bannerman-samuel-2026'

type SiteHeaderProps = {
  /** Public memorial: family name only, no site nav clutter. */
  variant?: 'default' | 'minimal'
  memorialName?: string
}

export function SiteHeader({ variant = 'default', memorialName }: SiteHeaderProps) {
  if (variant === 'minimal') {
    return (
      <header className="border-b border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-header-bg)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/"
            className="text-sm text-[var(--passage-header-text)]/70 hover:text-[var(--passage-header-link)]"
          >
            Passage
          </Link>
          {memorialName ? (
            <p className="truncate text-sm font-medium text-[var(--passage-header-text)]">{memorialName}</p>
          ) : null}
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-header-bg)] backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 shrink-0">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-[var(--passage-header-text)]"
            >
              Passage
            </Link>
            <p className="mt-0.5 text-sm text-[var(--passage-header-text)]/70">What do you need?</p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 lg:items-end">
            <Suspense fallback={null}>
              <SiteHeaderOfferingLinks />
            </Suspense>

            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={EXAMPLE_MEMORIAL_HREF}
                className="text-[var(--passage-header-text)]/85 hover:text-[var(--passage-header-link)]"
              >
                Example
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center rounded-md bg-[var(--passage-heading)] px-4 py-2 font-medium text-[var(--passage-bg)] hover:opacity-90"
              >
                Get started
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
