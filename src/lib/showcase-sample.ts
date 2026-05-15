import { BANNERMAN_SEED_PHOTO, GHANA_MUSLIM_SEED_PHOTO } from '@/lib/seed-memorial'
import { exampleSlugForTheme } from '@/lib/theme-example-memorials'

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

/** Stable male/female portrait from theme id hash (matches live example memorial pairing). */
export function getShowcasePhotoForThemeId(themeId: string): string {
  const slug = exampleSlugForTheme(themeId)
  return slug === 'ghana-muslim-example-2026' ? GHANA_MUSLIM_SEED_PHOTO : BANNERMAN_SEED_PHOTO
}
