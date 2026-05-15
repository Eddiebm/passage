import {
  BANNERMAN_SEED_PHOTO,
  EXAMPLE_MEMORIAL_SLUGS,
  GHANA_MUSLIM_SEED_PHOTO,
} from '@/lib/seed-memorial'
import type { VisualTheme } from '@/lib/visual-themes'
import { isVisualTheme, VISUAL_THEME_IDS } from '@/lib/visual-themes'

/**
 * Real seeded memorials used for every public theme / tier example link.
 * Add more slugs here when additional live example memorials exist.
 */
export const THEME_EXAMPLE_SLUGS = EXAMPLE_MEMORIAL_SLUGS

export const THEME_EXAMPLE_MALE_SLUG = 'bannerman-samuel-2026' as const
export const THEME_EXAMPLE_FEMALE_SLUG = 'ghana-muslim-example-2026' as const

const EXAMPLE_DISPLAY_NAMES: Record<(typeof THEME_EXAMPLE_SLUGS)[number], string> = {
  [THEME_EXAMPLE_MALE_SLUG]: 'Samuel Kwesi Bannerman',
  [THEME_EXAMPLE_FEMALE_SLUG]: 'Hajia Aminata Mensah',
}

const EXAMPLE_PHOTOS: Record<(typeof THEME_EXAMPLE_SLUGS)[number], string> = {
  [THEME_EXAMPLE_MALE_SLUG]: BANNERMAN_SEED_PHOTO,
  [THEME_EXAMPLE_FEMALE_SLUG]: GHANA_MUSLIM_SEED_PHOTO,
}

function hashThemeId(themeId: string): number {
  let h = 0
  for (let i = 0; i < themeId.length; i++) {
    h = (h * 31 + themeId.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Pick male or female example slug from theme id (stable, alternates across registry). */
export function exampleSlugForTheme(themeId: string): (typeof THEME_EXAMPLE_SLUGS)[number] {
  return hashThemeId(themeId) % 2 === 0 ? THEME_EXAMPLE_MALE_SLUG : THEME_EXAMPLE_FEMALE_SLUG
}

export function isThemeExampleSlug(slug: string): slug is (typeof THEME_EXAMPLE_SLUGS)[number] {
  return (THEME_EXAMPLE_SLUGS as readonly string[]).includes(slug)
}

export function exampleMemorialDisplayName(
  slug: (typeof THEME_EXAMPLE_SLUGS)[number],
): string {
  return EXAMPLE_DISPLAY_NAMES[slug]
}

export function exampleMemorialPhotoUrl(slug: (typeof THEME_EXAMPLE_SLUGS)[number]): string {
  return EXAMPLE_PHOTOS[slug]
}

/** Public memorial URL with non-persisted theme override (example slugs only). */
export function themeExampleHref(themeId: VisualTheme | string): string {
  const slug = exampleSlugForTheme(themeId)
  return `/memorial/${slug}?visual_theme=${encodeURIComponent(themeId)}`
}

export function themeExampleLabel(themeId: VisualTheme | string): string {
  const slug = exampleSlugForTheme(themeId)
  return `Example: ${EXAMPLE_DISPLAY_NAMES[slug]}`
}

/** Precomputed map for all registry themes (design lab, pickers). */
export const THEME_EXAMPLE_BY_ID: Record<VisualTheme, (typeof THEME_EXAMPLE_SLUGS)[number]> =
  Object.fromEntries(
    VISUAL_THEME_IDS.map((id) => [id, exampleSlugForTheme(id)]),
  ) as Record<VisualTheme, (typeof THEME_EXAMPLE_SLUGS)[number]>

export function parseVisualThemeQueryParam(
  visual_theme?: string,
  appearance?: string,
): VisualTheme | null {
  const raw = visual_theme?.trim() || appearance?.trim()
  if (!raw || !isVisualTheme(raw)) return null
  return raw
}
