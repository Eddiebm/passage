import { SHOWCASE_DECEASED_COPY } from '@/lib/example-memorial-names'
import { getAfricaPhotoForThemeId } from '@/lib/theme-preview-image'

/** Fixed copy for design-lab and theme picker previews. */
export const SHOWCASE_SAMPLE = SHOWCASE_DECEASED_COPY

/** Portrait from Africa library by theme index (legacy helper). */
export function getShowcasePhotoForThemeIndex(themeIndex: number): string {
  return getAfricaPhotoForThemeId(`theme-index-${themeIndex}`)
}

/** Stable regional / hashed portrait from public/photos/africa/. */
export function getShowcasePhotoForThemeId(themeId: string): string {
  return getAfricaPhotoForThemeId(themeId)
}
