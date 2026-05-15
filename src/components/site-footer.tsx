import Link from 'next/link'
import { getPassageSupportEmail } from '@/lib/support-email'

type SiteFooterProps = {
  className?: string
  /** Show example memorial link (home page). */
  showExamples?: boolean
}

export function SiteFooter({ className = '', showExamples = false }: SiteFooterProps) {
  const supportEmail = getPassageSupportEmail()

  return (
    <footer
      className={`border-t border-[color-mix(in_srgb,var(--passage-rule)_20%,transparent)] py-6 text-center text-xs text-[var(--passage-muted)] ${className}`}
    >
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/help" className="passage-text-link">
          Help
        </Link>
        <span aria-hidden>·</span>
        <Link href="/privacy" className="passage-text-link">
          Privacy
        </Link>
        <span aria-hidden>·</span>
        {supportEmail ? (
          <a href={`mailto:${supportEmail}`} className="passage-text-link">
            Contact
          </a>
        ) : (
          <Link href="/help#contact" className="passage-text-link">
            Contact
          </Link>
        )}
        {showExamples && (
          <>
            <span aria-hidden>·</span>
            <Link href="/memorial/samuel-mensah-2026" className="passage-text-link">
              Examples
            </Link>
            <span aria-hidden>·</span>
            <Link href="/design-lab" className="passage-text-link">
              Appearances
            </Link>
          </>
        )}
      </p>
    </footer>
  )
}
