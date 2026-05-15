import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#1A1A1A] text-[#FAFAF8]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-12 px-4 py-20">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C9A02C]">Powered by IdeaByLunch</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Every life deserves to be remembered.
          </h1>
          <p className="text-lg leading-relaxed text-[#FAFAF8]/80">
            The platform that holds your family together from the moment someone passes — through burial,
            remembrance, and the years beyond. Built with cultural precision for Ghana and Nigeria first,
            with love for the whole diaspora.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-md bg-[#C9A02C] px-6 py-3 text-base font-medium text-[#1A1A1A] transition hover:bg-[#d4ae3f]"
            >
              Create a memorial
            </Link>
            <Link
              href="/memorial/bannerman-samuel-2026"
              className="inline-flex items-center justify-center rounded-md border border-[#FAFAF8]/25 px-6 py-3 text-base font-medium text-[#FAFAF8] transition hover:border-[#C9A02C] hover:text-[#C9A02C]"
            >
              See an example
            </Link>
          </div>
        </div>
        <div className="grid gap-6 border-t border-[#3D2B1F]/40 pt-10 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-[#C9A02C]">Family edits final</h2>
            <p className="mt-2 text-sm text-[#FAFAF8]/70">
              Nothing publishes without the family seeing and approving it. The drafts serve the family —
              not the other way around.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#C9A02C]">Meet people where they are</h2>
            <p className="mt-2 text-sm text-[#FAFAF8]/70">
              Warm, dignified language. Traditional titles, family houses, and allied families honoured as
              first-class details.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#C9A02C]">One coordinator, lighter load</h2>
            <p className="mt-2 text-sm text-[#FAFAF8]/70">
              Programmes, appeals, tributes, and contributions in one calm place — so grief is not
              competing with admin.
            </p>
          </div>
        </div>
      </main>
      <footer className="border-t border-[#3D2B1F]/30 py-6 text-center text-xs text-[#FAFAF8]/50">
        <p>Passage — digital infrastructure for how African communities process death.</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/help" className="text-[#FAFAF8]/70 underline hover:text-[#C9A02C]">
            Help
          </Link>
          <span className="text-[#FAFAF8]/30" aria-hidden>
            ·
          </span>
          <Link href="/privacy" className="text-[#FAFAF8]/70 underline hover:text-[#C9A02C]">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  )
}
