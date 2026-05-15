'use client'

import Link from 'next/link'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import type { VisualTheme } from '@/lib/visual-themes'

export function DesignLabThemeGrid() {
  return (
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
  )
}
