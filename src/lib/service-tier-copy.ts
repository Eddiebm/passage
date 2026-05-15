import type { MemorialMode } from '@/lib/types'

export type ServiceTierMode = MemorialMode

export type ServiceTierCopy = {
  mode: ServiceTierMode
  label: string
  /** One line when this tier is collapsed. */
  tagline: string
  /** One sentence: what this path is for. */
  description: string
  youGet: string[]
  enoughIfLabel: string
  enoughIf: string
  enoughNote?: string
  ctaLabel: string
  createHref: `/create?mode=${ServiceTierMode}`
  reassurance?: string
}

export const SERVICE_TIER_ORDER: ServiceTierMode[] = ['notice', 'programme', 'full']

export const SERVICE_TIER_COPY: Record<ServiceTierMode, ServiceTierCopy> = {
  notice: {
    mode: 'notice',
    label: 'Notice only',
    tagline: 'Inform family and friends — one link and a print sheet.',
    description:
      'Share the death notice quickly on WhatsApp and print a simple sheet.',
    youGet: ['Announcement', 'One photo', 'Contacts', 'Share text', 'Print notice'],
    enoughIfLabel: 'You do not need anything else if',
    enoughIf: 'your family only needs to inform people and give the date and time.',
    enoughNote: 'This is enough for many families.',
    ctaLabel: 'Start with notice only',
    createHref: '/create?mode=notice',
    reassurance: 'You can add programme or coordination later if needed.',
  },
  programme: {
    mode: 'programme',
    label: 'Programme & brochure',
    tagline: 'Order of service online — readings, gallery, print programme.',
    description:
      'Publish the funeral programme with readings and photos — share one link and print a programme sheet.',
    youGet: [
      'Everything in notice only',
      'Programme & events',
      'Readings, hymns & scripture',
      'Gallery',
      'Print programme',
    ],
    enoughIfLabel: 'This is enough if',
    enoughIf: 'you have a clear funeral programme to share and print.',
    ctaLabel: 'Start with programme & brochure',
    createHref: '/create?mode=programme',
    reassurance: 'You can turn on full coordination later if the family needs it.',
  },
  full: {
    mode: 'full',
    label: 'Full family coordination',
    tagline: 'Tasks, money, meetings, and document scans in one desk.',
    description:
      'Run the whole funeral from one place — tasks, pledges, payments, scans, and closure when it ends.',
    youGet: [
      'Everything in programme & brochure',
      'Tasks & reminders',
      'Pledges & payments',
      'OCR (posters, certificates)',
      'Stakeholders & meetings',
      'Closure & accounting',
    ],
    enoughIfLabel: 'This is enough if',
    enoughIf: 'your family is managing the whole funeral.',
    ctaLabel: 'Start with full coordination',
    createHref: '/create?mode=full',
    reassurance: 'You can keep the public page calm — coordinator tools stay in the family portal.',
  },
}

export function getServiceTierCopy(mode: ServiceTierMode): ServiceTierCopy {
  return SERVICE_TIER_COPY[mode]
}
