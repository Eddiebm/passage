import { BANNERMAN_SEED_PHOTO, GHANA_MUSLIM_SEED_PHOTO } from '@/lib/seed-memorial'
import { VISUAL_THEME_IDS } from '@/lib/visual-themes'

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

/** Rotate male / female seed portraits by theme index for variety. */
export function getShowcasePhotoForThemeIndex(themeIndex: number): string {
  return themeIndex % 2 === 0 ? BANNERMAN_SEED_PHOTO : GHANA_MUSLIM_SEED_PHOTO
}

export function getShowcasePhotoForThemeId(themeId: string): string {
  const index = VISUAL_THEME_IDS.indexOf(themeId)
  return getShowcasePhotoForThemeIndex(index >= 0 ? index : 0)
}
