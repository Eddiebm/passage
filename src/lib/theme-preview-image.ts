import { VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import type { VisualThemeGroup } from '@/lib/visual-themes'

/** Portrait filenames under /photos/africa/ (sync with scripts/download-africa-photos.mjs). */
export const AFRICA_PORTRAIT_FILES = [
  'nigeria-lagos-elder-man.jpg',
  'nigeria-tribal-marks-elder.jpg',
  'cameroon-yaounde-elder.jpg',
  'kenya-nairobi-elder-woman.jpg',
  'ethiopia-lalibela-priest.jpg',
  'somalia-mogadishu-woman.jpg',
  'tunisia-gabes-elder.jpg',
  'south-africa-cape-elder.jpg',
  'mozambique-maputo-man.jpg',
  'zambia-chief-elder.jpg',
  'pan-african-elder-man.jpg',
] as const

export type AfricaPortraitFile = (typeof AFRICA_PORTRAIT_FILES)[number]

const AFRICA_PHOTO_DIR = '/photos/africa'
const THEME_PREVIEW_DIR = '/theme-previews'

const REGION_HINTS: { tokens: string[]; file: AfricaPortraitFile }[] = [
  { tokens: ['kente', 'adinkra', 'ashanti', 'ghana', 'accra', 'cape-coast', 'volta'], file: 'nigeria-lagos-elder-man.jpg' },
  { tokens: ['nigeria', 'lagos', 'abuja', 'yoruba', 'ibadan'], file: 'nigeria-lagos-elder-man.jpg' },
  { tokens: ['senegal', 'dakar', 'teranga', 'mali', 'bamako', 'mudcloth'], file: 'pan-african-elder-man.jpg' },
  { tokens: ['ivory', 'abidjan', 'cote', 'coral'], file: 'pan-african-elder-man.jpg' },
  { tokens: ['cameroon'], file: 'cameroon-yaounde-elder.jpg' },
  { tokens: ['congo', 'kinshasa', 'river'], file: 'pan-african-elder-man.jpg' },
  { tokens: ['kenya', 'nairobi', 'highlands', 'tanzania', 'dar-teal', 'savanna'], file: 'kenya-nairobi-elder-woman.jpg' },
  { tokens: ['ethiopia', 'addis', 'horn', 'asmara', 'orthodox'], file: 'ethiopia-lalibela-priest.jpg' },
  { tokens: ['somalia', 'mogadishu', 'somali'], file: 'somalia-mogadishu-woman.jpg' },
  { tokens: ['egypt', 'cairo', 'nile', 'morocco', 'fez', 'marrakech', 'sahara', 'maghreb', 'tunisia', 'gabes'], file: 'tunisia-gabes-elder.jpg' },
  { tokens: ['south-africa', 'ubuntu', 'cape-winds'], file: 'south-africa-cape-elder.jpg' },
  { tokens: ['zimbabwe', 'harare', 'stone', 'botswana', 'sand', 'namibia', 'windhoek', 'dust', 'zambia', 'copper'], file: 'zambia-chief-elder.jpg' },
  { tokens: ['angola', 'amber', 'maputo', 'mozambique'], file: 'mozambique-maputo-man.jpg' },
  { tokens: ['madagascar', 'rain', 'mauritius', 'azure', 'seychelles', 'reunion', 'lagoon'], file: 'pan-african-elder-man.jpg' },
  { tokens: ['rwanda', 'kigali', 'uganda', 'kampala', 'lake'], file: 'pan-african-elder-man.jpg' },
  { tokens: ['liberia', 'monrovia', 'sierra-leone', 'freetown', 'harmony', 'mist'], file: 'pan-african-elder-man.jpg' },
  { tokens: ['pan-african', 'continental', 'ancestral', 'baobab', 'burkina', 'ouagadougou', 'lome', 'malawi', 'benin', 'gambia', 'togo'], file: 'pan-african-elder-man.jpg' },
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
