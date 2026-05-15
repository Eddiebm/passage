import type { VisualTheme } from '@/lib/visual-themes'
import { getVisualThemeMeta } from '@/lib/visual-themes'
import {
  exampleMemorialDisplayName,
  isThemeExampleSlug,
  THEME_EXAMPLE_FEMALE_SLUG,
  THEME_EXAMPLE_MALE_SLUG,
  THEME_EXAMPLE_SLUGS,
  themeExampleHref,
} from '@/lib/theme-example-memorials'

export const COMPLETE_SHOWCASE_PATH = '/examples/complete' as const

export type CompleteShowcaseEntry = {
  visualTheme: VisualTheme
  imageSrc: string
  label: string
  description: string
  exampleLabel: string
  liveHref: string
}

const COMPLETE_THEME_IDS = ['programme', 'monument', 'kente', 'night'] as const satisfies readonly VisualTheme[]

/** Flagship complete examples — phone mockup PNGs + live memorial theme override. */
const COMPLETE_THEME_SLUG: Record<(typeof COMPLETE_THEME_IDS)[number], typeof THEME_EXAMPLE_MALE_SLUG | typeof THEME_EXAMPLE_FEMALE_SLUG> = {
  programme: THEME_EXAMPLE_MALE_SLUG,
  monument: THEME_EXAMPLE_MALE_SLUG,
  kente: THEME_EXAMPLE_FEMALE_SLUG,
  night: THEME_EXAMPLE_MALE_SLUG,
}

const SHOWCASE_IMAGE_BY_THEME: Record<(typeof COMPLETE_THEME_IDS)[number], string> = {
  programme: '/showcase/complete-programme.jpg',
  monument: '/showcase/complete-monument.jpg',
  kente: '/showcase/complete-kente.jpg',
  night: '/showcase/complete-night.jpg',
}

export const COMPLETE_SHOWCASE_ENTRIES: CompleteShowcaseEntry[] = COMPLETE_THEME_IDS.map((id) => {
  const meta = getVisualThemeMeta(id)!
  const slug = COMPLETE_THEME_SLUG[id]
  return {
    visualTheme: id,
    imageSrc: SHOWCASE_IMAGE_BY_THEME[id],
    label: meta.label,
    description: meta.description,
    exampleLabel: `Example: ${exampleMemorialDisplayName(slug)}`,
    liveHref: `/memorial/${slug}?visual_theme=${id}`,
  }
})

export function completeShowcaseLiveHref(visualTheme: VisualTheme): string {
  const entry = COMPLETE_SHOWCASE_ENTRIES.find((e) => e.visualTheme === visualTheme)
  if (entry) return entry.liveHref
  return themeExampleHref(visualTheme)
}

export function completeShowcaseCreateHref(visualTheme: VisualTheme, mode?: string): string {
  const params = new URLSearchParams({ visual_theme: visualTheme })
  if (mode) params.set('mode', mode)
  return `/create?${params.toString()}`
}

export { isThemeExampleSlug as isExampleMemorialSlug, THEME_EXAMPLE_SLUGS as EXAMPLE_MEMORIAL_SLUGS }
