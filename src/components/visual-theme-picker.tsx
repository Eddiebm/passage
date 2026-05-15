'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { VisualTheme } from '@/lib/visual-themes'
import {
  VISUAL_THEME_COUNT,
  VISUAL_THEME_GROUPS,
  VISUAL_THEME_REGISTRY,
  type VisualThemeGroup,
  type VisualThemeMeta,
} from '@/lib/visual-themes'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'

function themeMatchesQuery(theme: VisualThemeMeta, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    theme.id.includes(q) ||
    theme.label.toLowerCase().includes(q) ||
    theme.description.toLowerCase().includes(q)
  )
}

export function VisualThemePicker({
  value,
  onChange,
  showDesignLabLink = true,
}: {
  value: VisualTheme
  onChange: (theme: VisualTheme) => void
  showDesignLabLink?: boolean
}) {
  const [query, setQuery] = useState('')

  const filteredRegistry = useMemo(
    () => VISUAL_THEME_REGISTRY.filter((t) => themeMatchesQuery(t, query)),
    [query],
  )

  const visibleGroups = useMemo(
    () =>
      VISUAL_THEME_GROUPS.filter((group) =>
        filteredRegistry.some((t) => t.group === group.id),
      ),
    [filteredRegistry],
  )

  return (
    <div className="space-y-6">
      {showDesignLabLink && (
        <p className="text-sm text-[var(--passage-muted)]">
          Choose how the public memorial looks.{' '}
          <Link href="/design-lab" className="passage-text-link">
            Preview all {VISUAL_THEME_COUNT} appearances in the design lab
          </Link>
          .
        </p>
      )}
      <label className="block">
        <span className="sr-only">Search themes</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, region, or mood…"
          className="w-full rounded-lg border border-[#3D2B1F]/20 bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
        />
      </label>
      {filteredRegistry.length === 0 ? (
        <p className="text-sm text-[#1A1A1A]/60">No themes match your search.</p>
      ) : (
        visibleGroups.map((group) => (
          <ThemeGroupSection
            key={group.id}
            groupId={group.id}
            groupLabel={group.label}
            themes={filteredRegistry.filter((t) => t.group === group.id)}
            value={value}
            onChange={onChange}
          />
        ))
      )}
    </div>
  )
}

function ThemeGroupSection({
  groupLabel,
  themes,
  value,
  onChange,
}: {
  groupId: VisualThemeGroup
  groupLabel: string
  themes: VisualThemeMeta[]
  value: VisualTheme
  onChange: (theme: VisualTheme) => void
}) {
  if (!themes.length) return null

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">
        {groupLabel}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const selected = value === theme.id
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id as VisualTheme)}
              className={`overflow-hidden rounded-lg border text-left transition ${
                selected
                  ? 'border-[#C9A02C] ring-2 ring-[#C9A02C]/30'
                  : 'border-[#3D2B1F]/15 hover:border-[#C9A02C]/50'
              }`}
              aria-pressed={selected}
            >
              <MemorialThemePreview themeId={theme.id as VisualTheme} compact />
              <div className="border-t border-[#3D2B1F]/10 bg-white px-3 py-2">
                <p className="text-sm font-medium text-[#1A1A1A]">{theme.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#1A1A1A]/60">
                  {theme.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
