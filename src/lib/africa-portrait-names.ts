import portraitNamesJson from '@/lib/africa-portrait-names.json'
import {
  GENERIC_FAMILY_LINE,
  GENERIC_MEMORIAL_TITLE,
  genericFirstNameForPortrait,
} from '@/lib/example-memorial-names'
import {
  AFRICA_PORTRAIT_FILES,
  getAfricaPhotoForThemeId,
  type AfricaPortraitFile,
} from '@/lib/theme-preview-image'

export type PortraitGender = 'male' | 'female'

export type AfricaPortraitProfile = {
  gender: PortraitGender
  deceasedName: string
  deceasedTitle: string
  familyLine: string
  regionRationale: string
}

const SHARED_DATES = {
  dateOfBirth: '12 March 1942',
  dateOfPassing: '3 May 2026',
  datesLine: 'Sunrise: 12 March 1942 · Sunset: 3 May 2026',
} as const

const SNIPPET_BY_GENDER: Record<PortraitGender, string> = {
  male: 'It is with profound sadness that the family announces the passing of our beloved father and grandfather.',
  female:
    'It is with profound sadness that the family announces the passing of our beloved mother and grandmother.',
}

const RAW_PORTRAIT_PROFILES = portraitNamesJson as Record<
  AfricaPortraitFile,
  Pick<AfricaPortraitProfile, 'gender' | 'regionRationale'>
>

export const AFRICA_PORTRAIT_PROFILES = Object.fromEntries(
  (Object.entries(RAW_PORTRAIT_PROFILES) as [AfricaPortraitFile, (typeof RAW_PORTRAIT_PROFILES)[AfricaPortraitFile]][]).map(
    ([file, raw]) => [
      file,
      {
        gender: raw.gender,
        deceasedName: genericFirstNameForPortrait(file, raw.gender),
        deceasedTitle: GENERIC_MEMORIAL_TITLE,
        familyLine: GENERIC_FAMILY_LINE,
        regionRationale: raw.regionRationale,
      } satisfies AfricaPortraitProfile,
    ],
  ),
) as Record<AfricaPortraitFile, AfricaPortraitProfile>

export function isAfricaPortraitFile(file: string): file is AfricaPortraitFile {
  return (AFRICA_PORTRAIT_FILES as readonly string[]).includes(file)
}

export function portraitFileFromPhotoPath(photoPath: string): AfricaPortraitFile | undefined {
  const base = photoPath.split('/').pop()
  if (!base || !isAfricaPortraitFile(base)) return undefined
  return base
}

export function getAfricaPortraitProfile(file: AfricaPortraitFile): AfricaPortraitProfile {
  return AFRICA_PORTRAIT_PROFILES[file]
}

export type ShowcaseSample = {
  deceasedName: string
  deceasedTitle: string
  familyLine: string
  dateOfBirth: string
  dateOfPassing: string
  datesLine: string
  announcementSnippet: string
  portraitFile: AfricaPortraitFile
  gender: PortraitGender
}

export function getShowcaseSampleForPortraitFile(file: AfricaPortraitFile): ShowcaseSample {
  const profile = getAfricaPortraitProfile(file)
  return {
    deceasedName: profile.deceasedName,
    deceasedTitle: profile.deceasedTitle,
    familyLine: profile.familyLine,
    ...SHARED_DATES,
    announcementSnippet: SNIPPET_BY_GENDER[profile.gender],
    portraitFile: file,
    gender: profile.gender,
  }
}

export function getShowcaseSampleForThemeId(themeId: string): ShowcaseSample {
  const photoPath = getAfricaPhotoForThemeId(themeId)
  const file = portraitFileFromPhotoPath(photoPath)
  if (file) return getShowcaseSampleForPortraitFile(file)
  return getShowcaseSampleForPortraitFile('pan-african-elder-man.jpg')
}

/** @deprecated Use `getShowcaseSampleForThemeId` — kept for imports that expect a static default. */
export const SHOWCASE_SAMPLE_DEFAULT = getShowcaseSampleForPortraitFile('ghana-fashion-elder.jpg')
