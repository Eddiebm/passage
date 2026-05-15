import { EXAMPLE_MEMORIAL_SLUGS } from '@/lib/seed-memorial'
import type { MemorialMode } from '@/lib/types'
import { normalizeMemorialMode } from '@/lib/memorial-hydrate'

export function isExampleMemorialSlug(slug: string): boolean {
  return (EXAMPLE_MEMORIAL_SLUGS as readonly string[]).includes(slug)
}

type PreviewSearchParams = {
  memorial_mode?: string
  preview?: string
}

/** For seeded example memorials only — force public display mode via query string. */
export function resolveExamplePreviewMode(
  slug: string,
  searchParams: PreviewSearchParams,
): MemorialMode | null {
  if (!isExampleMemorialSlug(slug)) return null
  const raw =
    searchParams.memorial_mode?.trim() ||
    (searchParams.preview === 'notice' ||
    searchParams.preview === 'programme' ||
    searchParams.preview === 'full'
      ? searchParams.preview
      : undefined)
  if (!raw) return null
  const mode = normalizeMemorialMode(raw)
  return mode
}

export function exampleMemorialPreviewHref(slug: string, mode: MemorialMode): string {
  return `/memorial/${slug}?memorial_mode=${mode}`
}
