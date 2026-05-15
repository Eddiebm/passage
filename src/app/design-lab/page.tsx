import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { VISUAL_THEME_COUNT } from '@/lib/visual-themes'
import { CompleteShowcasePromo } from '@/components/complete-showcase-promo'
import { DesignLabThemeGrid } from './design-lab-theme-grid'

export const metadata: Metadata = {
  title: 'Design lab — memorial themes · Passage',
  description: `Preview all ${VISUAL_THEME_COUNT} visual themes for Passage memorial pages.`,
}

export default function DesignLabPage() {
  return (
    <div className="min-h-full bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A02C]">Passage</p>
        <h1 className="mt-2 text-3xl font-semibold">Memorial design lab</h1>
        <CompleteShowcasePromo variant="banner" className="mt-6" />

        <h2 className="mt-12 text-lg font-semibold">All appearance styles ({VISUAL_THEME_COUNT})</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#1A1A1A]/70">
          Each card shows a programme-scale thumbnail (400×711). For full 1080×1920 burial posters — download and
          print — see{' '}
          <a href="/posters" className="font-medium text-[#6B1F2A] underline-offset-2 hover:underline">
            all burial posters
          </a>
          . Not the minimal death notice.
        </p>

        <Suspense fallback={<p className="mt-8 text-sm text-[#1A1A1A]/60">Loading themes…</p>}>
          <DesignLabThemeGrid />
        </Suspense>
      </div>
    </div>
  )
}
