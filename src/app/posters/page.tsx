import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BURIAL_POSTER_COUNT } from '@/lib/burial-poster'
import { COMPLETE_SHOWCASE_PATH } from '@/lib/complete-showcase'
import { PostersThemeGrid } from './posters-theme-grid'

export const metadata: Metadata = {
  title: 'Burial posters — 100 styles · Passage',
  description:
    'Browse and download full burial and memorial posters for WhatsApp, home print, and funeral vendors — not minimal death notices.',
}

export default function PostersPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A02C]">Passage</p>
        <h1 className="mt-2 text-3xl font-semibold">Burial posters ({BURIAL_POSTER_COUNT} styles)</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/70">
          Full portrait burial and memorial posters — real photography, themed layout, ready for WhatsApp,
          home printers, and print shops. These are{' '}
          <span className="font-medium text-[#3D2B1F]">not</span> the short death notice (
          <Link href="/start/notice" className="text-[#6B1F2A] underline-offset-2 hover:underline">
            notice only
          </Link>
          ).
        </p>
        <p className="mt-3 text-sm text-[#1A1A1A]/60">
          See the four flagship looks on{' '}
          <Link href={COMPLETE_SHOWCASE_PATH} className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
            complete poster examples
          </Link>
          , or open any style below for download and memorial setup.
        </p>

        <Suspense fallback={<p className="mt-8 text-sm text-[#1A1A1A]/60">Loading posters…</p>}>
          <PostersThemeGrid />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
