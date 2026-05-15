import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import type { VisualThemeGroup } from '@/lib/visual-themes'

/** Portrait filenames under /photos/africa/ (sync with scripts/download-africa-photos.mjs). */
export const AFRICA_PORTRAIT_FILES = [
  'ghana-accra-elder-man.jpg',
  'ghana-accra-elder-woman.jpg',
  'ghana-fashion-elder.jpg',
  'nigeria-lagos-woman.jpg',
  'nigeria-lagos-elder-man.jpg',
  'nigeria-tribal-marks-elder.jpg',
  'senegal-dakar-elder.jpg',
  'mali-bamako-man.jpg',
  'ivory-coast-abidjan-woman.jpg',
  'cameroon-yaounde-elder.jpg',
  'drc-kinshasa-woman.jpg',
  'kenya-nairobi-elder-woman.jpg',
  'kenya-nairobi-young-woman.jpg',
  'ethiopia-addis-elder-man.jpg',
  'ethiopia-lalibela-priest.jpg',
  'tanzania-dar-woman.jpg',
  'somalia-mogadishu-woman.jpg',
  'somalia-mogadishu-man.jpg',
  'egypt-cairo-elder.jpg',
  'morocco-fez-woman.jpg',
  'tunisia-gabes-elder.jpg',
  'south-africa-cape-elder.jpg',
  'south-africa-storyteller.jpg',
  'zimbabwe-harare-elder.jpg',
  'botswana-gaborone-woman.jpg',
  'namibia-windhoek-woman.jpg',
  'angola-luanda-man.jpg',
  'madagascar-antananarivo-elder.jpg',
  'mauritius-port-louis-woman.jpg',
  'rwanda-kigali-man.jpg',
  'rwanda-kigali-woman.jpg',
  'uganda-kampala-elder.jpg',
  'uganda-kampala-girl.jpg',
  'liberia-monrovia-elder.jpg',
  'sierra-leone-freetown-woman.jpg',
  'mozambique-maputo-man.jpg',
  'zambia-lusaka-woman.jpg',
  'zambia-chief-elder.jpg',
  'pan-african-elder-man.jpg',
  'pan-african-elder-woman.jpg',
] as const

export type AfricaPortraitFile = (typeof AFRICA_PORTRAIT_FILES)[number]

const AFRICA_PHOTO_DIR = '/photos/africa'
const THEME_PREVIEW_DIR = '/theme-previews'

const REGION_HINTS: { tokens: string[]; file: AfricaPortraitFile }[] = [
  { tokens: ['kente', 'adinkra', 'ashanti'], file: 'ghana-accra-elder-woman.jpg' },
  { tokens: ['ghana', 'accra', 'cape-coast', 'volta'], file: 'ghana-fashion-elder.jpg' },
  { tokens: ['nigeria', 'lagos', 'abuja', 'yoruba', 'ibadan'], file: 'nigeria-lagos-woman.jpg' },
  { tokens: ['senegal', 'dakar', 'teranga'], file: 'senegal-dakar-elder.jpg' },
  { tokens: ['mali', 'bamako', 'mudcloth'], file: 'mali-bamako-man.jpg' },
  { tokens: ['ivory', 'abidjan', 'cote', 'coral'], file: 'ivory-coast-abidjan-woman.jpg' },
  { tokens: ['cameroon'], file: 'cameroon-yaounde-elder.jpg' },
  { tokens: ['congo', 'kinshasa', 'river'], file: 'drc-kinshasa-woman.jpg' },
  { tokens: ['kenya', 'nairobi', 'highlands'], file: 'kenya-nairobi-elder-woman.jpg' },
  { tokens: ['ethiopia', 'addis', 'horn', 'asmara', 'orthodox'], file: 'ethiopia-addis-elder-man.jpg' },
  { tokens: ['tanzania', 'dar-teal', 'savanna'], file: 'tanzania-dar-woman.jpg' },
  { tokens: ['somalia', 'mogadishu', 'somali'], file: 'somalia-mogadishu-man.jpg' },
  { tokens: ['egypt', 'cairo', 'nile'], file: 'egypt-cairo-elder.jpg' },
  { tokens: ['morocco', 'fez', 'marrakech', 'sahara', 'maghreb'], file: 'morocco-fez-woman.jpg' },
  { tokens: ['tunisia', 'gabes'], file: 'tunisia-gabes-elder.jpg' },
  { tokens: ['south-africa', 'ubuntu', 'cape-winds'], file: 'south-africa-cape-elder.jpg' },
  { tokens: ['zimbabwe', 'harare', 'stone'], file: 'zimbabwe-harare-elder.jpg' },
  { tokens: ['botswana', 'sand'], file: 'botswana-gaborone-woman.jpg' },
  { tokens: ['namibia', 'windhoek', 'dust'], file: 'namibia-windhoek-woman.jpg' },
  { tokens: ['angola', 'amber', 'maputo'], file: 'angola-luanda-man.jpg' },
  { tokens: ['madagascar', 'rain'], file: 'madagascar-antananarivo-elder.jpg' },
  { tokens: ['mauritius', 'azure', 'seychelles', 'reunion', 'lagoon'], file: 'mauritius-port-louis-woman.jpg' },
  { tokens: ['rwanda', 'kigali'], file: 'rwanda-kigali-man.jpg' },
  { tokens: ['uganda', 'kampala', 'lake'], file: 'uganda-kampala-elder.jpg' },
  { tokens: ['liberia', 'monrovia'], file: 'liberia-monrovia-elder.jpg' },
  { tokens: ['sierra-leone', 'freetown', 'harmony', 'mist'], file: 'sierra-leone-freetown-woman.jpg' },
  { tokens: ['mozambique'], file: 'mozambique-maputo-man.jpg' },
  { tokens: ['zambia', 'copper'], file: 'zambia-lusaka-woman.jpg' },
  { tokens: ['pan-african', 'continental', 'ancestral', 'baobab', 'savanna', 'burkina', 'ouagadougou', 'lome', 'malawi', 'benin', 'gambia', 'togo'], file: 'pan-african-elder-man.jpg' },
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function matchRegionalPortrait(themeId: string): AfricaPortraitFile | undefined {
  const id = themeId.toLowerCase()
  for (const { tokens, file } of REGION_HINTS) {
    if (tokens.some((t) => id.includes(t))) return file
  }
  return undefined
}

export function getAfricaPhotoForThemeId(themeId: string): string {
  const regional = matchRegionalPortrait(themeId)
  if (regional) return `${AFRICA_PHOTO_DIR}/${regional}`
  const idx = hashString(themeId) % AFRICA_PORTRAIT_FILES.length
  return `${AFRICA_PHOTO_DIR}/${AFRICA_PORTRAIT_FILES[idx]!}`
}

export type ThemePreviewLayout = 'programme' | 'monument' | 'kente' | 'night'

export function getThemePreviewLayout(themeId: string, group?: VisualThemeGroup): ThemePreviewLayout {
  const id = themeId.toLowerCase()
  if (group === 'dark' || id.includes('night') || id.includes('candle') || id.includes('burgundy-mass')) {
    return 'night'
  }
  if (group === 'cultural' || id.includes('kente') || id.includes('adinkra') || id.includes('ashanti')) {
    return 'kente'
  }
  if (id.includes('monument') || id.includes('high-contrast') || id.includes('newspaper')) {
    return 'monument'
  }
  const layouts: ThemePreviewLayout[] = ['programme', 'monument', 'kente', 'night']
  return layouts[hashString(themeId) % layouts.length]!
}

export function getThemeCompletePreviewPath(themeId: string): string {
  return `${THEME_PREVIEW_DIR}/${themeId}.jpg`
}

/** @deprecated Use `themePreviewAssetUrl` from `@/lib/theme-poster-assets`. */
export function themePreviewImageUrl(themeId: string): string {
  return getThemeCompletePreviewPath(themeId)
}

export function themeHasCompletePreview(themeId: string): boolean {
  return VISUAL_THEME_REGISTRY.some((t) => t.id === themeId)
}
