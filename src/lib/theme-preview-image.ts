import { AFRICA_EXTENDED_THEME_IDS, VISUAL_THEME_REGISTRY } from '@/lib/visual-themes'
import type { VisualThemeGroup } from '@/lib/visual-themes'

/** Portrait filenames under /photos/africa/ (sync with scripts/download-africa-photos.mjs). */
export const AFRICA_PORTRAIT_FILES = [
  'ghana-accra-elder-man.jpg',
  'nigeria-lagos-woman.jpg',
  'senegal-dakar-elder.jpg',
  'mali-bamako-man.jpg',
  'ivory-coast-abidjan-woman.jpg',
  'cameroon-yaounde-elder.jpg',
  'drc-kinshasa-woman.jpg',
  'kenya-nairobi-elder-woman.jpg',
  'ethiopia-addis-elder-man.jpg',
  'tanzania-dar-woman.jpg',
  'somalia-mogadishu-man.jpg',
  'egypt-cairo-elder.jpg',
  'morocco-fez-woman.jpg',
  'south-africa-cape-elder.jpg',
  'zimbabwe-harare-elder.jpg',
  'botswana-gaborone-woman.jpg',
  'madagascar-antananarivo-elder.jpg',
  'mauritius-port-louis-woman.jpg',
  'rwanda-kigali-man.jpg',
  'uganda-kampala-elder.jpg',
  'namibia-windhoek-woman.jpg',
  'angola-luanda-man.jpg',
  'liberia-monrovia-elder.jpg',
  'sierra-leone-freetown-woman.jpg',
  'pan-african-elder-man.jpg',
] as const

export type AfricaPortraitFile = (typeof AFRICA_PORTRAIT_FILES)[number]

const AFRICA_PHOTO_DIR = '/photos/africa'
const THEME_PREVIEW_DIR = '/theme-previews'

/** Region tokens in filenames → theme id substrings for africa-extended matching. */
const REGION_HINTS: { tokens: string[]; file: AfricaPortraitFile }[] = [
  { tokens: ['ghana', 'accra', 'kente', 'cape-coast', 'ashanti'], file: 'ghana-accra-elder-man.jpg' },
  { tokens: ['nigeria', 'lagos', 'abuja', 'yoruba'], file: 'nigeria-lagos-woman.jpg' },
  { tokens: ['senegal', 'dakar'], file: 'senegal-dakar-elder.jpg' },
  { tokens: ['mali', 'bamako'], file: 'mali-bamako-man.jpg' },
  { tokens: ['ivory', 'abidjan', 'cote', 'coral'], file: 'ivory-coast-abidjan-woman.jpg' },
  { tokens: ['cameroon'], file: 'cameroon-yaounde-elder.jpg' },
  { tokens: ['congo', 'kinshasa', 'river'], file: 'drc-kinshasa-woman.jpg' },
  { tokens: ['kenya', 'nairobi'], file: 'kenya-nairobi-elder-woman.jpg' },
  { tokens: ['ethiopia', 'addis', 'horn'], file: 'ethiopia-addis-elder-man.jpg' },
  { tokens: ['tanzania', 'dar-teal', 'dar-es'], file: 'tanzania-dar-woman.jpg' },
  { tokens: ['somalia', 'mogadishu'], file: 'somalia-mogadishu-man.jpg' },
  { tokens: ['egypt', 'cairo', 'nile'], file: 'egypt-cairo-elder.jpg' },
  { tokens: ['morocco', 'fez', 'tunis', 'sahara', 'maghreb'], file: 'morocco-fez-woman.jpg' },
  { tokens: ['south-africa', 'ubuntu', 'cape-winds', 'cape-town'], file: 'south-africa-cape-elder.jpg' },
  { tokens: ['zimbabwe', 'harare', 'stone'], file: 'zimbabwe-harare-elder.jpg' },
  { tokens: ['botswana', 'sand', 'windhoek'], file: 'botswana-gaborone-woman.jpg' },
  { tokens: ['madagascar', 'rain'], file: 'madagascar-antananarivo-elder.jpg' },
  { tokens: ['mauritius', 'azure', 'seychelles', 'reunion', 'lagoon'], file: 'mauritius-port-louis-woman.jpg' },
  { tokens: ['rwanda', 'kigali'], file: 'rwanda-kigali-man.jpg' },
  { tokens: ['uganda', 'kampala'], file: 'uganda-kampala-elder.jpg' },
  { tokens: ['namibia', 'dust'], file: 'namibia-windhoek-woman.jpg' },
  { tokens: ['angola', 'amber', 'maputo'], file: 'angola-luanda-man.jpg' },
  { tokens: ['liberia', 'monrovia'], file: 'liberia-monrovia-elder.jpg' },
  { tokens: ['sierra-leone', 'freetown', 'harmony', 'mist'], file: 'sierra-leone-freetown-woman.jpg' },
  { tokens: ['pan-african', 'continental', 'ancestral', 'baobab', 'savanna', 'burkina', 'ouagadougou', 'lome', 'malawi'], file: 'pan-african-elder-man.jpg' },
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function africaPhotoPath(file: AfricaPortraitFile): string {
  return `${AFRICA_PHOTO_DIR}/${file}`
}

function matchRegionalPortrait(themeId: string): AfricaPortraitFile | undefined {
  const id = themeId.toLowerCase()
  for (const { tokens, file } of REGION_HINTS) {
    if (tokens.some((t) => id.includes(t))) return file
  }
  return undefined
}

/** Stable portrait for a theme — regional match for africa-extended, else hash across library. */
export function getAfricaPhotoForThemeId(themeId: string): string {
  const isExtended = AFRICA_EXTENDED_THEME_IDS.includes(themeId as (typeof AFRICA_EXTENDED_THEME_IDS)[number])
  if (isExtended) {
    const regional = matchRegionalPortrait(themeId)
    if (regional) return africaPhotoPath(regional)
  } else {
    const regional = matchRegionalPortrait(themeId)
    if (regional) return africaPhotoPath(regional)
  }
  const idx = hashString(themeId) % AFRICA_PORTRAIT_FILES.length
  return africaPhotoPath(AFRICA_PORTRAIT_FILES[idx]!)
}

export type ThemePreviewLayout = 'programme' | 'monument' | 'kente' | 'night'

/** Map theme group + id to one of four complete phone layout templates. */
export function getThemePreviewLayout(themeId: string, group?: VisualThemeGroup): ThemePreviewLayout {
  const id = themeId.toLowerCase()
  const flagship: ThemePreviewLayout[] = ['programme', 'monument', 'kente', 'night']
  if (flagship.includes(id as ThemePreviewLayout)) return id as ThemePreviewLayout
  if (group === 'dark' || id.includes('night') || id.includes('candle') || id.includes('burgundy-mass')) {
    return 'night'
  }
  if (
    group === 'cultural' ||
    id.includes('kente') ||
    id.includes('adinkra') ||
    id.includes('ashanti') ||
    id.includes('ankara')
  ) {
    return 'kente'
  }
  if (id.includes('monument') || id.includes('high-contrast') || id.includes('newspaper')) {
    return 'monument'
  }
  const layouts: ThemePreviewLayout[] = ['programme', 'monument', 'kente', 'night']
  return layouts[hashString(themeId) % layouts.length]!
}

/** Generated JPG mockup path (run scripts/generate-theme-complete-previews.mjs). */
export function getThemeCompletePreviewPath(themeId: string): string {
  return `${THEME_PREVIEW_DIR}/${themeId}.jpg`
}

/** @deprecated Use `themePreviewImageUrl` from `@/lib/visual-themes`. */
export function themePreviewImageUrl(themeId: string): string {
  return getThemeCompletePreviewPath(themeId)
}

export function themeHasCompletePreview(themeId: string): boolean {
  return VISUAL_THEME_REGISTRY.some((t) => t.id === themeId)
}
