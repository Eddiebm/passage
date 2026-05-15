import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-[#3D2B1F]/30 bg-[#1A1A1A]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#FAFAF8]">
          Passage
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[#FAFAF8]/80">
          <Link href="/create" className="hover:text-[#C9A02C]">
            Create a memorial
          </Link>
          <Link href="/memorial/bannerman-samuel-2026" className="hover:text-[#C9A02C]">
            Example
          </Link>
          <Link href="/help" className="hover:text-[#C9A02C]">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-[#C9A02C]">
            Privacy
          </Link>
          <Link href="/admin" className="hover:text-[#C9A02C]">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
