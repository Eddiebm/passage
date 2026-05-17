import { getShowcaseSampleForThemeId } from '@/lib/africa-portrait-names'
import type { MemorialMode } from '@/lib/types'
import type { VisualTheme } from '@/lib/visual-themes'
import { getVisualThemeMeta } from '@/lib/visual-themes'
import {
  isThemeExampleSlug,
  THEME_EXAMPLE_SLUGS,
  themeExampleHref,
} from '@/lib/theme-example-memorials'
import { flagshipShowcaseAssetUrl } from '@/lib/theme-poster-assets'

export const COMPLETE_SHOWCASE_PATH = '/examples/complete' as const

/** Full memorial poster / programme surface — not the minimal death notice. */
export const COMPLETE_SHOWCASE_MEMORIAL_MODE: MemorialMode = 'programme'

export type CompleteShowcaseEntry = {
  visualTheme: VisualTheme
  imageSrc: string
  label: string
  description: string
  exampleLabel: string
  /** Full memorial-style preview (design lab theme page). */
  previewHref: string
  /** Live seeded example memorial — programme layout + theme override. */
  memorialHref: string
}

const COMPLETE_THEME_IDS = [
  'programme',
  'monument',
  'kente',
  'night',
  'adinkra-minimal',
  'earth-clay',
  'ivory-letter',
  'burgundy-mass',
  'candlelight',
  'newspaper',
] as const satisfies readonly VisualTheme[]

export function completeShowcasePreviewHref(visualTheme: VisualTheme): string {
  return `/examples/complete/${visualTheme}`
}

export function getCompleteShowcaseEntry(
  visualTheme: string,
): CompleteShowcaseEntry | undefined {
  return COMPLETE_SHOWCASE_ENTRIES.find((e) => e.visualTheme === visualTheme)
}

export const COMPLETE_SHOWCASE_ENTRIES: CompleteShowcaseEntry[] = COMPLETE_THEME_IDS.map((id) => {
  const meta = getVisualThemeMeta(id)!
  const sample = getShowcaseSampleForThemeId(id)
  return {
    visualTheme: id,
    imageSrc: flagshipShowcaseAssetUrl(id),
    label: meta.label,
    description: meta.description,
    exampleLabel: `Example: ${sample.deceasedName}`,
    previewHref: completeShowcasePreviewHref(id),
    memorialHref: themeExampleHref(id, { memorialMode: COMPLETE_SHOWCASE_MEMORIAL_MODE }),
  }
})

/** Primary “complete look” destination for flagship themes. */
export function completeShowcaseLiveHref(visualTheme: VisualTheme): string {
  const entry = COMPLETE_SHOWCASE_ENTRIES.find((e) => e.visualTheme === visualTheme)
  if (entry) return entry.previewHref
  return `/design-lab/${visualTheme}`
}

export function completeShowcaseMemorialHref(visualTheme: VisualTheme): string {
  const entry = COMPLETE_SHOWCASE_ENTRIES.find((e) => e.visualTheme === visualTheme)
  if (entry) return entry.memorialHref
  return themeExampleHref(visualTheme, { memorialMode: COMPLETE_SHOWCASE_MEMORIAL_MODE })
}

export function completeShowcaseCreateHref(visualTheme: VisualTheme): string {
  const params = new URLSearchParams({
    visual_theme: visualTheme,
    mode: COMPLETE_SHOWCASE_MEMORIAL_MODE,
  })
  return `/create?${params.toString()}`
}

export { isThemeExampleSlug as isExampleMemorialSlug, THEME_EXAMPLE_SLUGS as EXAMPLE_MEMORIAL_SLUGS }
