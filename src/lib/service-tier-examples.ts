import type { MemorialMode } from '@/lib/types'
import {
  BANNERMAN_SEED_PHOTO,
  EXAMPLE_MEMORIAL_SLUGS,
  GHANA_MUSLIM_SEED_PHOTO,
} from '@/lib/seed-memorial'
import type { ServiceTierMode } from '@/lib/service-tier-copy'
import { exampleMemorialPreviewHref, isExampleMemorialSlug } from '@/lib/memorial-preview-mode'

export type TierExampleMemorial = {
  slug: string
  deceasedName: string
  summary: string
  photoUrl: string
  /** When set, example opens with this mode (for notice demo on full seed). */
  previewMode?: MemorialMode
  /** Optional label above the card (e.g. secondary examples). */
  eyebrow?: string
}

export type ServiceTierExamples = {
  examples: TierExampleMemorial[]
}

export const SERVICE_TIER_EXAMPLES: Record<ServiceTierMode, ServiceTierExamples> = {
  notice: {
    examples: [
      {
        slug: 'bannerman-samuel-2026',
        deceasedName: 'Samuel Kwesi Bannerman',
        summary: 'A calm notice with announcement, portrait, contacts, and print sheet.',
        photoUrl: BANNERMAN_SEED_PHOTO,
        previewMode: 'notice',
      },
      {
        slug: 'ghana-muslim-example-2026',
        deceasedName: 'Hajia Aminata Mensah',
        summary: 'A shorter notice layout — announcement, portrait, and contacts only.',
        photoUrl: GHANA_MUSLIM_SEED_PHOTO,
        previewMode: 'notice',
        eyebrow: 'Another example',
      },
    ],
  },
  programme: {
    examples: [
      {
        slug: 'ghana-muslim-example-2026',
        deceasedName: 'Hajia Aminata Mensah',
        summary: 'Funeral programme with Janazah details, readings, and photo gallery.',
        photoUrl: GHANA_MUSLIM_SEED_PHOTO,
      },
      {
        slug: 'bannerman-samuel-2026',
        deceasedName: 'Samuel Kwesi Bannerman',
        summary: 'Christian order of service with readings, gallery, and print programme.',
        photoUrl: BANNERMAN_SEED_PHOTO,
        previewMode: 'programme',
        eyebrow: 'Another example',
      },
    ],
  },
  full: {
    examples: [
      {
        slug: 'bannerman-samuel-2026',
        deceasedName: 'Samuel Kwesi Bannerman',
        summary: 'Full coordination — programme, pledges, tasks, stakeholders, and closure.',
        photoUrl: BANNERMAN_SEED_PHOTO,
      },
      {
        slug: 'ghana-muslim-example-2026',
        deceasedName: 'Hajia Aminata Mensah',
        summary: 'Programme-first layout with Janazah details, gallery, and family contacts.',
        photoUrl: GHANA_MUSLIM_SEED_PHOTO,
        eyebrow: 'Another example',
      },
    ],
  },
}

export function getServiceTierExamples(mode: ServiceTierMode): ServiceTierExamples {
  return SERVICE_TIER_EXAMPLES[mode]
}

export function exampleMemorialViewHref(example: TierExampleMemorial): string {
  if (example.previewMode) {
    return exampleMemorialPreviewHref(example.slug, example.previewMode)
  }
  return `/memorial/${example.slug}`
}

export { EXAMPLE_MEMORIAL_SLUGS, isExampleMemorialSlug }
