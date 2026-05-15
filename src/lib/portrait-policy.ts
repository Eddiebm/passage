/**
 * Passage customer-facing portrait policy.
 * Passage sells to African families — all stock/preview portraits must clearly
 * represent African people (continental or diaspora with explicit African context).
 */

export const PORTRAIT_POLICY_SUMMARY =
  'Only African portrait assets for customer-facing previews, theme mockups, and marketing imagery.'

/** Allowed roots for automated portrait pipelines (see scripts/download-africa-photos.mjs). */
export const ALLOWED_PORTRAIT_SOURCES = [
  '/photos/africa/',
  '/seed/',
] as const

/** Keywords that must appear in Unsplash alt/description/tags for auto-download. */
export const AFRICA_CONTEXT_KEYWORDS = [
  'africa',
  'african',
  'ghana',
  'nigeria',
  'kenya',
  'senegal',
  'ethiopia',
  'somalia',
  'uganda',
  'tanzania',
  'rwanda',
  'zimbabwe',
  'botswana',
  'namibia',
  'angola',
  'mozambique',
  'cameroon',
  'congo',
  'kinshasa',
  'lagos',
  'accra',
  'dakar',
  'cairo',
  'morocco',
  'maghreb',
  'sahel',
  'yoruba',
  'hausa',
  'zulu',
  'amhara',
  'swahili',
  'west africa',
  'east africa',
  'horn of africa',
  'ivory coast',
  'sierra leone',
  'liberia',
  'mali',
  'madagascar',
  'mauritius',
  'zambia',
  'tunisia',
  'goree',
  'lalibela',
  'kisumu',
  'nairobi',
  'himba',
  'lesedi',
  'bagamoyo',
  'mogadishu',
  'moroccan',
  'marrakech',
  'zimbabwean',
  'ugandan',
  'zambian',
  'nigerian',
  'tribal',
] as const

/** Reject generic global corporate stock and non-portrait results. */
export const PORTRAIT_REJECT_KEYWORDS = [
  'linkedin sales',
  'corporate headshot',
  'wocintech',
  'caucasian only',
  'handmade craft',
  'art and craft only',
] as const

export function textMatchesAfricaContext(text: string): boolean {
  const lower = text.toLowerCase()
  if (PORTRAIT_REJECT_KEYWORDS.some((k) => lower.includes(k))) return false
  return AFRICA_CONTEXT_KEYWORDS.some((k) => lower.includes(k))
}
