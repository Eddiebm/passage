'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeaderOfferingLinks } from '@/components/site-header-offering-links'
import type { ServiceTierMode } from '@/lib/service-tier-copy'

const EXAMPLE_MEMORIAL_HREF = '/memorial/samuel-mensah-2026'

type SiteHeaderProps = {
  /** Public memorial: family name only, no site nav clutter. */
  variant?: 'default' | 'minimal'
  memorialName?: string
  /** Highlights the matching tier link in the header nav. */
  highlightTierMode?: ServiceTierMode | null
}

export function SiteHeader({ variant = 'default', memorialName, highlightTierMode = null }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

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
        {/* Desktop layout */}
        <div className="hidden sm:flex sm:flex-col sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
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
            <SiteHeaderOfferingLinks highlightTierMode={highlightTierMode} />
            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/design-lab" className="text-[var(--passage-header-text)]/85 hover:text-[var(--passage-header-link)]">
                Appearances
              </Link>
              <Link href={EXAMPLE_MEMORIAL_HREF} className="text-[var(--passage-header-text)]/85 hover:text-[var(--passage-header-link)]">
                Example
              </Link>
              <Link
                href="/create"
                className="inline-flex min-h-[44px] items-center rounded-md bg-[var(--passage-heading)] px-4 py-2 font-medium text-[var(--passage-bg)] hover:opacity-90"
              >
                Get started
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex items-center justify-between sm:hidden">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--passage-header-text)]">
            Passage
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="inline-flex min-h-[44px] items-center rounded-md bg-[var(--passage-heading)] px-4 py-2 text-sm font-medium text-[var(--passage-bg)]"
            >
              Get started
            </Link>
            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[var(--passage-header-text)] hover:bg-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)]"
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <nav className="mt-4 flex flex-col gap-1 border-t border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] pt-4 sm:hidden">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--passage-header-text)] hover:bg-[color-mix(in_srgb,var(--passage-rule)_8%,transparent)]">
              Notice only
            </Link>
            <Link href="/start/programme" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--passage-header-text)] hover:bg-[color-mix(in_srgb,var(--passage-rule)_8%,transparent)]">
              Programme & brochure
            </Link>
            <Link href="/start/full" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--passage-header-text)] hover:bg-[color-mix(in_srgb,var(--passage-rule)_8%,transparent)]">
              Full family coordination
            </Link>
            <div className="my-1 border-t border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)]" />
            <Link href="/design-lab" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-[var(--passage-header-text)]/80 hover:bg-[color-mix(in_srgb,var(--passage-rule)_8%,transparent)]">
              Appearances
            </Link>
            <Link href={EXAMPLE_MEMORIAL_HREF} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-[var(--passage-header-text)]/80 hover:bg-[color-mix(in_srgb,var(--passage-rule)_8%,transparent)]">
              Example memorial
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
