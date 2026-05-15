'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MemorialThemePreview } from '@/components/memorial-theme-preview'
import { themeExampleHref, themeExampleLabel } from '@/lib/theme-example-memorials'
import {
  AFRICA_EXTENDED_THEME_COUNT,
  VISUAL_THEME_GROUPS,
  VISUAL_THEME_REGISTRY,
} from '@/lib/visual-themes'
import type { VisualTheme, VisualThemeGroup } from '@/lib/visual-themes'

const PAGE_SIZE = 25

type LabFilter = 'all' | 'africa-extended' | VisualThemeGroup

function filterThemes(filter: LabFilter) {
  if (filter === 'all') return VISUAL_THEME_REGISTRY
  if (filter === 'africa-extended') {
    return VISUAL_THEME_REGISTRY.filter((t) => t.batch === 'africa-extended')
  }
  return VISUAL_THEME_REGISTRY.filter((t) => t.group === filter)
}

export function DesignLabThemeGrid() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') ?? 'all'
  const pageParam = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)

  const filter: LabFilter =
    filterParam === 'africa-extended' ||
    filterParam === 'light' ||
    filterParam === 'dark' ||
    filterParam === 'cultural' ||
    filterParam === 'regional'
      ? filterParam
      : 'all'

  const filtered = useMemo(() => filterThemes(filter), [filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(pageParam, totalPages)
  const pageThemes = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const [query, setQuery] = useState('')

  const visibleThemes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pageThemes
    return filtered.filter(
      (t) =>
        t.id.includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    )
  }, [filtered, pageThemes, query])

  function setLabParams(next: { filter?: LabFilter; page?: number }) {
    const params = new URLSearchParams(searchParams.toString())
    const nextFilter = next.filter ?? filter
    const nextPage = next.page ?? 1
    params.set('filter', nextFilter)
    params.set('page', String(nextPage))
    router.push(`/design-lab?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setLabParams({ filter: 'all', page: 1 })}>
            All ({VISUAL_THEME_REGISTRY.length})
          </FilterChip>
          {VISUAL_THEME_GROUPS.map((g) => (
            <FilterChip
              key={g.id}
              active={filter === g.id}
              onClick={() => setLabParams({ filter: g.id, page: 1 })}
            >
              {g.label}
            </FilterChip>
          ))}
          <FilterChip
            active={filter === 'africa-extended'}
            onClick={() => setLabParams({ filter: 'africa-extended', page: 1 })}
          >
            Across Africa ({AFRICA_EXTENDED_THEME_COUNT})
          </FilterChip>
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search themes</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search themes…"
            className="w-full rounded-lg border border-[#3D2B1F]/20 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      {!query && totalPages > 1 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPage={(p) => setLabParams({ page: p })}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleThemes.map((theme) => (
          <Link
            key={theme.id}
            href={`/design-lab/${theme.id}`}
            className="group overflow-hidden rounded-lg border border-[#3D2B1F]/12 bg-white shadow-sm transition hover:border-[#C9A02C]/60 hover:shadow-md"
          >
            <MemorialThemePreview themeId={theme.id as VisualTheme} compact />
            <ThemeCardFooter theme={theme} />
          </Link>
        ))}
      </div>

      {visibleThemes.length === 0 && (
        <p className="text-sm text-[#1A1A1A]/60">No themes match your search on this page.</p>
      )}

      {!query && totalPages > 1 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPage={(p) => setLabParams({ page: p })}
        />
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? 'border-[#6B1F2A] bg-[#6B1F2A] text-white'
          : 'border-[#3D2B1F]/20 bg-white text-[#1A1A1A]/70 hover:border-[#C9A02C]/50'
      }`}
    >
      {children}
    </button>
  )
}

function PaginationBar({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (page: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-md border border-[#3D2B1F]/20 px-3 py-1.5 disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-[#1A1A1A]/70">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-md border border-[#3D2B1F]/20 px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

function ThemeCardFooter({ theme }: { theme: (typeof VISUAL_THEME_REGISTRY)[number] }) {
  return (
    <div className="border-t border-[#3D2B1F]/10 px-4 py-3">
      <p className="text-sm font-medium group-hover:text-[#6B1F2A]">{theme.label}</p>
      <p className="mt-1 text-xs text-[#1A1A1A]/60">{theme.description}</p>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-[#1A1A1A]/40">
        {theme.group}
        {theme.batch === 'africa-extended' ? ' · new batch' : ''} · {theme.id}
      </p>
      <p className="mt-2 text-[11px] text-[#6B1F2A]/80">{themeExampleLabel(theme.id)}</p>
      <Link
        href={themeExampleHref(theme.id)}
        className="mt-1 inline-block text-[11px] font-medium text-[#6B1F2A] underline-offset-2 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View live example →
      </Link>
    </div>
  )
}
