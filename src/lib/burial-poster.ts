import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'

/** Portrait burial poster — WhatsApp share, home print, funeral vendor handoff. */
export const BURIAL_POSTER_WIDTH = 1080
export const BURIAL_POSTER_HEIGHT = 1920
export const BURIAL_POSTER_ASPECT = '9/16' as const

import { themePosterAssetUrl, themePosterHiResAssetUrl } from '@/lib/theme-poster-assets'

/** @deprecated Use `themePosterAssetUrl` from `@/lib/theme-poster-assets`. */
export function burialPosterImageUrl(themeId: string): string {
  return themePosterAssetUrl(themeId)
}

/** @deprecated Use `themePosterHiResAssetUrl` from `@/lib/theme-poster-assets`. */
export function burialPosterHiResImageUrl(themeId: string): string {
  return themePosterHiResAssetUrl(themeId)
}

export function themeHasBurialPoster(themeId: string): boolean {
  return VISUAL_THEME_REGISTRY.some((t) => t.id === themeId)
}

export const BURIAL_POSTER_COUNT = VISUAL_THEME_REGISTRY.length
