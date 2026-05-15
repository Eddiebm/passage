/** Shared memorial copy for generated previews (matches showcase-sample.ts). */
export const SHOWCASE = {
  deceasedName: 'Kwame Mensah Bannerman',
  deceasedTitle: 'Of blessed memory',
  familyLine: 'Bannerman family · Osu, Accra',
  datesLine: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
  datesShort: '12 March 1942 – 3 May 2026',
  announcementSnippet:
    'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
  funeralDate: 'Saturday, 17 May 2026',
  funeralVenue: 'St. Mary’s Anglican Church, Osu',
  funeralTime: '9:00am – 2:00pm',
  quote: 'A life well lived. A legacy forever cherished.',
  epitaph:
    'A devoted father, grandfather and pillar of strength. Your love and wisdom live on in us.',
}

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
