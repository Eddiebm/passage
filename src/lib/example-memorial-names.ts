/**
 * Generic, dignified names for demo / preview / seed memorials.
 * First names only (or Mr./Mrs. + first name in formal copy). No founder surnames.
 * Gender must match committed seed portraits (male → Samuel, female → Fatima).
 */
export const EXAMPLE_NAMES = {
  male: {
    firstName: 'Samuel',
    display: 'Samuel',
    formal: 'Mr. Samuel',
    late: 'The Late Samuel',
    slug: 'samuel-mensah-2026',
  },
  female: {
    firstName: 'Fatima',
    display: 'Fatima',
    formal: 'Mrs. Fatima',
    late: 'The Late Fatima',
    slug: 'ghana-muslim-example-2026',
  },
} as const

/** Design-lab, theme picker, and JPG preview mockups (male portrait). */
export const SHOWCASE_DECEASED_COPY = {
  deceasedName: EXAMPLE_NAMES.male.display,
  deceasedTitle: 'Of blessed memory',
  familyLine: 'The family',
  dateOfBirth: '12 March 1942',
  dateOfPassing: '3 May 2026',
  datesLine: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
  announcementSnippet:
    'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
} as const

/** Node preview generator (`scripts/generate-theme-complete-previews.mjs`). */
export const THEME_PREVIEW_JPG_COPY = {
  name: EXAMPLE_NAMES.male.display,
  dates: '12 March 1942 · 3 May 2026',
  line: 'Of blessed memory · The family',
  snippet: SHOWCASE_DECEASED_COPY.announcementSnippet,
} as const
