import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)] bg-[var(--passage-header-bg)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--passage-header-text)]"
        >
          Passage
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-[var(--passage-header-text)]/85">
          <Link href="/create" className="passage-text-link hover:opacity-90">
            Create a memorial
          </Link>
          <Link href="/design-lab" className="hover:text-[var(--passage-header-link)]">
            Design lab
          </Link>
          <Link href="/memorial/bannerman-samuel-2026" className="hover:text-[var(--passage-header-link)]">
            Example
          </Link>
          <Link href="/help" className="hover:text-[var(--passage-header-link)]">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-[var(--passage-header-link)]">
            Privacy
          </Link>
          <Link href="/admin" className="hover:text-[var(--passage-header-link)]">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
