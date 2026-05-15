import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import type { VisualTheme } from '@/lib/visual-themes'

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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VISUAL_THEME_REGISTRY.map((theme) => (
            <Link
              key={theme.id}
              href={`/design-lab/${theme.id}`}
              className="group overflow-hidden rounded-lg border border-[#3D2B1F]/12 bg-white shadow-sm transition hover:border-[#C9A02C]/60 hover:shadow-md"
            >
              <MemorialThemePreview themeId={theme.id as VisualTheme} compact />
              <div className="border-t border-[#3D2B1F]/10 px-4 py-3">
                <p className="text-sm font-medium group-hover:text-[#6B1F2A]">{theme.label}</p>
                <p className="mt-1 text-xs text-[#1A1A1A]/60">{theme.description}</p>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-[#1A1A1A]/40">
                  {theme.group} · {theme.id}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
