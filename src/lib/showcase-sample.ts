import {
  getShowcaseSampleForThemeId,
  SHOWCASE_SAMPLE_DEFAULT,
  type ShowcaseSample,
} from '@/lib/africa-portrait-names'
import { getAfricaPhotoForThemeId } from '@/lib/theme-preview-image'

export type { ShowcaseSample }

/** @deprecated Use `getShowcaseSampleForThemeId(themeId)` for portrait-matched copy. */
export const SHOWCASE_SAMPLE = {
  deceasedName: SHOWCASE_SAMPLE_DEFAULT.deceasedName,
  deceasedTitle: SHOWCASE_SAMPLE_DEFAULT.deceasedTitle,
  familyLine: SHOWCASE_SAMPLE_DEFAULT.familyLine,
  dateOfBirth: SHOWCASE_SAMPLE_DEFAULT.dateOfBirth,
  dateOfPassing: SHOWCASE_SAMPLE_DEFAULT.dateOfPassing,
  datesLine: SHOWCASE_SAMPLE_DEFAULT.datesLine,
  announcementSnippet: SHOWCASE_SAMPLE_DEFAULT.announcementSnippet,
} as const

export { getShowcaseSampleForThemeId }

/** Portrait from Africa library by theme index (legacy helper). */
export function getShowcasePhotoForThemeIndex(themeIndex: number): string {
  return getAfricaPhotoForThemeId(`theme-index-${themeIndex}`)
}

/** Stable regional / hashed portrait from public/photos/africa/. */
export function getShowcasePhotoForThemeId(themeId: string): string {
  return getAfricaPhotoForThemeId(themeId)
}
