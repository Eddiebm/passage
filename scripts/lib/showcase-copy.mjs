import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NAMES_PATH = path.join(__dirname, '..', '..', 'src', 'lib', 'africa-portrait-names.json')

/** @type {Record<string, { gender: 'male' | 'female', deceasedName: string, deceasedTitle: string, familyLine: string }>} */
export const AFRICA_PORTRAIT_PROFILES = JSON.parse(fs.readFileSync(NAMES_PATH, 'utf8'))

const SHARED_DATES = {
  datesLine: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
  datesShort: '12 March 1942 – 3 May 2026',
  funeralDate: 'Saturday, 17 May 2026',
  funeralVenue: 'Family home and place of worship',
  funeralTime: '9:00am – 2:00pm',
  quote: 'A life well lived. A legacy forever cherished.',
  epitaph:
    'A devoted parent and pillar of strength. Your love and wisdom live on in us.',
}

const SNIPPET_BY_GENDER = {
  male: 'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
  female:
    'It is with profound sadness that the family announces the passing of our beloved mother and grandmother.',
}

/** @param {string} portraitFile */
export function showcaseCopyForPortrait(portraitFile) {
  const profile =
    AFRICA_PORTRAIT_PROFILES[portraitFile] ?? AFRICA_PORTRAIT_PROFILES['pan-african-elder-man.jpg']
  return {
    deceasedName: profile.deceasedName,
    deceasedTitle: profile.deceasedTitle,
    familyLine: profile.familyLine,
    announcementSnippet: SNIPPET_BY_GENDER[profile.gender],
    ...SHARED_DATES,
  }
}

/** Default when theme id is unknown (matches ghana-fashion-elder). */
export const SHOWCASE = showcaseCopyForPortrait('ghana-fashion-elder.jpg')

/**
 * @param {string} s
 */
export function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @param {number} n
 * @param {string} id
 */
export function hashPick(n, id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h % n
}
