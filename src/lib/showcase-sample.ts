import { getAfricaPhotoForThemeId } from '@/lib/theme-preview-image'

/** Fixed copy for design-lab and theme picker previews. */
export const SHOWCASE_SAMPLE = {
  deceasedName: 'Kwame Mensah Bannerman',
  deceasedTitle: 'Of blessed memory',
  familyLine: 'Bannerman family · Osu, Accra',
  dateOfBirth: '12 March 1942',
  dateOfPassing: '3 May 2026',
  datesLine: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
  announcementSnippet:
    'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
} as const

/** Portrait from Africa library by theme index (legacy helper). */
export function getShowcasePhotoForThemeIndex(themeIndex: number): string {
  return getAfricaPhotoForThemeId(`theme-index-${themeIndex}`)
}

/** Stable regional / hashed portrait from public/photos/africa/. */
export function getShowcasePhotoForThemeId(themeId: string): string {
  return getAfricaPhotoForThemeId(themeId)
}
