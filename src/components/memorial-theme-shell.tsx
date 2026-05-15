import Link from 'next/link'
import type { VisualTheme } from '@/lib/types'
import { memorialThemeClass } from '@/lib/memorial-hydrate'

export function MemorialThemeShell({
  coordinatorTheme,
  templateClass,
  children,
}: {
  slug: string
  coordinatorTheme: VisualTheme
  templateClass: string
  children: React.ReactNode
}) {
  const themeClass = memorialThemeClass(coordinatorTheme)

  return (
    <div
      className={`passage-memorial-root overflow-x-hidden ${themeClass} ${templateClass}`}
      data-theme={coordinatorTheme}
    >
      {children}
      <footer className="border-t border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] px-4 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--passage-muted)]">Appearance</p>
        <p className="mt-2 text-xs text-[var(--passage-muted)]">
          <Link href="/design-lab" className="passage-text-link">
            Other memorial appearances
          </Link>
          <span className="opacity-50"> · inspiration for coordinators</span>
        </p>
      </footer>
    </div>
  )
}
