/** Keep in sync with src/lib/example-memorial-names.ts */
export const GENERIC_MALE_FIRST_NAMES = [
  'Samuel',
  'James',
  'David',
  'Michael',
  'Ibrahim',
  'Ahmed',
]

export const GENERIC_FEMALE_FIRST_NAMES = [
  'Mary',
  'Grace',
  'Sarah',
  'Amina',
  'Fatima',
  'Elizabeth',
]

export const GENERIC_FAMILY_LINE = 'The family'
export const GENERIC_MEMORIAL_TITLE = 'Of blessed memory'

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
}

export const SHOWCASE_DECEASED_COPY = {
  deceasedName: EXAMPLE_NAMES.male.display,
  deceasedTitle: 'Of blessed memory',
  familyLine: 'The family',
  dateOfBirth: '12 March 1942',
  dateOfPassing: '3 May 2026',
  datesLine: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
  announcementSnippet:
    'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
}

export const THEME_PREVIEW_JPG_COPY = {
  name: EXAMPLE_NAMES.male.display,
  dates: '12 March 1942 · 3 May 2026',
  line: 'Of blessed memory · The family',
  snippet: SHOWCASE_DECEASED_COPY.announcementSnippet,
}

export function genericFirstNameForPortrait(portraitKey, gender) {
  const pool = gender === 'male' ? GENERIC_MALE_FIRST_NAMES : GENERIC_FEMALE_FIRST_NAMES
  let h = 0
  for (let i = 0; i < portraitKey.length; i++) {
    h = (h * 31 + portraitKey.charCodeAt(i)) | 0
  }
  return pool[Math.abs(h) % pool.length]
}
