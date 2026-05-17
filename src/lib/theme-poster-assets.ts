import type { VisualTheme } from '@/lib/visual-themes'

export type ThemeAssetTier = 'phone-preview' | 'burial-poster' | 'flagship-showcase'

/** Flagship programme poster looks (landscape showcase PNGs). */
export const FLAGSHIP_SHOWCASE_THEME_IDS = [
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

export type FlagshipShowcaseThemeId = (typeof FLAGSHIP_SHOWCASE_THEME_IDS)[number]

const THEME_PREVIEW_DIR = '/theme-previews'
const BURIAL_POSTER_DIR = '/burial-posters'
const SHOWCASE_DIR = '/showcase'

export function isFlagshipShowcaseTheme(themeId: string): themeId is FlagshipShowcaseThemeId {
  return (FLAGSHIP_SHOWCASE_THEME_IDS as readonly string[]).includes(themeId)
}

/** Design-lab phone-frame memorial preview (400×711 JPEG). */
export function themePreviewAssetUrl(themeId: string): string {
  return `${THEME_PREVIEW_DIR}/${themeId}.jpg`
}

/** Burial poster portrait asset (1080×1920 JPEG). */
export function themePosterAssetUrl(themeId: string): string {
  return `${BURIAL_POSTER_DIR}/${themeId}.jpg`
}

/** Optional hi-res burial poster (@2x). */
export function themePosterHiResAssetUrl(themeId: string): string {
  return `${BURIAL_POSTER_DIR}/${themeId}@2x.jpg`
}

/** Flagship complete memorial poster (landscape PNG). */
export function flagshipShowcaseAssetUrl(themeId: string): string {
  return `${SHOWCASE_DIR}/complete-${themeId}.png`
}

export function designLabThemePreviewHref(themeId: string): string {
  return `/design-lab/${themeId}`
}

export function designLabBurialPosterHref(themeId: string): string {
  return `/design-lab/${themeId}/poster`
}

export function completeShowcaseThemeHref(themeId: string): string {
  return `/examples/complete/${themeId}`
}

/**
 * Primary full preview for a theme card — matches thumbnail tier:
 * - Flagship four → landscape showcase PNG page
 * - All others → design-lab phone preview page
 */
export function themePhoneFullPreviewHref(themeId: string): string {
  if (isFlagshipShowcaseTheme(themeId)) return completeShowcaseThemeHref(themeId)
  return designLabThemePreviewHref(themeId)
}

/** Full preview for burial-poster grid cards (same asset as thumb). */
export function themeBurialPosterFullPreviewHref(themeId: string): string {
  return designLabBurialPosterHref(themeId)
}
