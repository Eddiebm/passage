import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import { DesignLabThemeGrid } from './design-lab-theme-grid'

const THEME_COUNT = VISUAL_THEME_REGISTRY.length

export const metadata: Metadata = {
  title: 'Design lab — memorial themes · Passage',
  description: `Preview all ${THEME_COUNT} visual themes for Passage memorial pages.`,
}

export default function DesignLabPage() {
  return (
    <div className="min-h-full bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A02C]">Passage</p>
        <h1 className="mt-2 text-3xl font-semibold">Memorial design lab</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#1A1A1A]/70">
          {THEME_COUNT} funeral-appropriate appearances for coordinators to choose from. Click any
          card for a full-page sample memorial shell.
        </p>

        <DesignLabThemeGrid />
      </div>
    </div>
  )
}
