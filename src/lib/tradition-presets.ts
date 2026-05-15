import type { Tradition, TraditionPreset } from '@/lib/types'

export const TRADITION_PRESETS: Record<Tradition, TraditionPreset> = {
  'ghana-christian': {
    label: 'Ghanaian Christian',
    openingLine:
      'It is with profound sadness that the family announces the passing of',
    dateFormat: 'Sunrise: {dob} | Sunset: {dop}',
    photoRequired: true,
    religiousClose: 'May his/her soul rest in perfect peace. Amen.',
    familyOrder: ['spouse', 'children', 'siblings', 'parents'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: true,
  },
  'nigeria-christian': {
    label: 'Nigerian Christian',
    openingLine: 'The family of the late',
    dateFormat: 'Born: {dob} | Called to Glory: {dop}',
    photoRequired: true,
    religiousClose:
      'He/She has fought a good fight. He/She has finished the course. He/She has kept the faith.',
    familyOrder: ['spouse', 'children', 'siblings', 'parents'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: false,
  },
  'nigeria-muslim': {
    label: 'Nigerian Muslim',
    openingLine:
      'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُون\nIndeed, to Allah we belong and to Him we shall return.',
    dateFormat: '{dob} — {dop}',
    photoRequired: false,
    religiousClose: 'May Allah grant him/her Al-Jannah Firdaus. Ameen.',
    familyOrder: ['spouse', 'children', 'parents', 'siblings'],
    includeAlliedFamilies: false,
    includeTraditionalTitle: false,
    includeFamilyHouse: false,
    urgencyNote: 'Janazah prayer and burial to follow Islamic rites.',
  },
  diaspora: {
    label: 'Diaspora (Multi-location)',
    openingLine:
      'It is with deep sorrow that the family announces the passing of',
    dateFormat: 'Sunrise: {dob} | Sunset: {dop}',
    photoRequired: true,
    religiousClose: 'He/She will be deeply missed by all who knew him/her.',
    familyOrder: ['spouse', 'children', 'siblings', 'parents'],
    includeAlliedFamilies: true,
    includeTraditionalTitle: true,
    includeFamilyHouse: true,
    diasporaMode: true,
    multiTimezone: true,
  },
}

export function isTradition(value: string): value is Tradition {
  return value in TRADITION_PRESETS
}
