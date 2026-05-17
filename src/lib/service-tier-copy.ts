import type { MemorialMode } from '@/lib/types'

export type ServiceTierMode = MemorialMode

export type ServiceTierCopy = {
  mode: ServiceTierMode
  label: string
  /** Shorter label for header nav on small screens. */
  navLabel: string
  /** One line when this tier is collapsed. */
  tagline: string
  /** One sentence: what this path is for. */
  description: string
  youGet: string[]
  enoughIfLabel: string
  enoughIf: string
  enoughNote?: string
  ctaLabel: string
  /** Offering page with examples before create wizard. */
  startHref: `/start/${ServiceTierMode}`
  createHref: `/create?mode=${ServiceTierMode}`
  reassurance?: string
}

export const SERVICE_TIER_ORDER: ServiceTierMode[] = ['notice', 'programme', 'full']

export const SERVICE_TIER_COPY: Record<ServiceTierMode, ServiceTierCopy> = {
  notice: {
    mode: 'notice',
    label: 'Notice only',
    navLabel: 'Notice only',
    tagline: 'Let people know, wherever they are — one link, one message.',
    description:
      'Get the news out gently and clearly. One link to share on WhatsApp, one sheet to print and hand out.',
    youGet: ['Announcement', 'Portrait photo', 'Contacts', 'Ready-to-share message', 'Print notice'],
    enoughIfLabel: 'This is enough if',
    enoughIf: 'you need to reach family and friends with the news and the service details.',
    enoughNote: 'Most families start here.',
    ctaLabel: 'Start — notice only',
    startHref: '/start/notice',
    createHref: '/create?mode=notice',
    reassurance: 'You can always add a programme or coordination later, when the time is right.',
  },
  programme: {
    mode: 'programme',
    label: 'Programme & brochure',
    navLabel: 'Programme & brochure',
    tagline: 'A beautiful order of service — readings, gallery, and a printable programme.',
    description:
      'Give your loved one a full programme. Share one link with everyone who matters, and print a brochure to hand out on the day.',
    youGet: [
      'Everything in notice only',
      'Programme & events',
      'Readings, hymns & scripture',
      'Photo gallery',
      'Print programme',
    ],
    enoughIfLabel: 'This is enough if',
    enoughIf: 'you want to share the programme and readings with family who cannot be there in person.',
    ctaLabel: 'Start — programme & brochure',
    startHref: '/start/programme',
    createHref: '/create?mode=programme',
    reassurance: 'Full coordination can be added later — no pressure to decide everything now.',
  },
  full: {
    mode: 'full',
    label: 'Full family coordination',
    navLabel: 'Full coordination',
    tagline: 'Everything in one place — from the first call to the final accounts.',
    description:
      'Support your family through every detail — tasks, contributions, payments, and a peaceful closure when it is over.',
    youGet: [
      'Everything in programme & brochure',
      'Tasks & reminders',
      'Pledges & payments',
      'Scan posters & certificates',
      'Stakeholders & meetings',
      'Closure & final accounting',
    ],
    enoughIfLabel: 'This is the right choice if',
    enoughIf: 'your family is carrying the full weight of organising the funeral.',
    ctaLabel: 'Start — full coordination',
    startHref: '/start/full',
    createHref: '/create?mode=full',
    reassurance: 'The public memorial stays simple and calm — all the coordination tools are in the private family portal.',
  },
}

export function getServiceTierCopy(mode: ServiceTierMode): ServiceTierCopy {
  return SERVICE_TIER_COPY[mode]
}
