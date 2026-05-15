import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'

/** Portrait burial poster — WhatsApp share, home print, funeral vendor handoff. */
export const BURIAL_POSTER_WIDTH = 1080
export const BURIAL_POSTER_HEIGHT = 1920
export const BURIAL_POSTER_ASPECT = '9/16' as const

const BURIAL_POSTER_DIR = '/burial-posters'

export function burialPosterImageUrl(themeId: string): string {
  return `${BURIAL_POSTER_DIR}/${themeId}.jpg`
}

export function burialPosterHiResImageUrl(themeId: string): string {
  return `${BURIAL_POSTER_DIR}/${themeId}@2x.jpg`
}

export function themeHasBurialPoster(themeId: string): boolean {
  return VISUAL_THEME_REGISTRY.some((t) => t.id === themeId)
}

export const BURIAL_POSTER_COUNT = VISUAL_THEME_REGISTRY.length
