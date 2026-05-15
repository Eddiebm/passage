import type {
  ContactCard,
  Memorial,
  MemorialMode,
  MemorialPledge,
  OutputTemplate,
  ProgrammeReading,
  StakeholderCategory,
} from '@/lib/types'
import { publicPledgesForMemorial } from '@/lib/memorial-pledges'
import { publicProgrammeReadings } from '@/lib/programme-readings'

const MEMORIAL_MODES: MemorialMode[] = ['notice', 'programme', 'full']

export function normalizeMemorialMode(raw: unknown): MemorialMode {
  if (typeof raw === 'string' && MEMORIAL_MODES.includes(raw as MemorialMode)) {
    return raw as MemorialMode
  }
  return 'notice'
}

const OUTPUT_TEMPLATES: OutputTemplate[] = ['notice', 'programme', 'banner_classic']

export function normalizeOutputTemplate(raw: unknown): OutputTemplate {
  if (typeof raw === 'string' && OUTPUT_TEMPLATES.includes(raw as OutputTemplate)) {
    return raw as OutputTemplate
  }
  return 'notice'
}

export function memorialTemplateClass(template?: OutputTemplate): string {
  return `passage-template-${normalizeOutputTemplate(template)}`
}

const STAKEHOLDER_CATEGORIES: StakeholderCategory[] = [
  'family_protocol',
  'faith',
  'interment',
  'catering',
  'site_ops',
  'media',
  'transport',
  'other',
]

export function isStakeholderCategory(v: unknown): v is StakeholderCategory {
  return typeof v === 'string' && STAKEHOLDER_CATEGORIES.includes(v as StakeholderCategory)
}

/** Default `memorial_mode`, migrate legacy `public_contacts` from coordinator_* when missing. */
export function hydrateMemorial(memorial: Memorial): Memorial {
  const withMode: Memorial = {
    ...memorial,
    memorial_mode: normalizeMemorialMode(memorial.memorial_mode),
    output_template: normalizeOutputTemplate(memorial.output_template),
  }

  const hasPublic = (withMode.public_contacts?.length ?? 0) > 0
  if (hasPublic) return withMode

  const name = withMode.coordinator_name?.trim()
  const email = withMode.coordinator_email?.trim()
  const whatsapp = withMode.coordinator_whatsapp?.trim()
  if (!name && !email && !whatsapp) return withMode

  const card: ContactCard = {
    name: name || 'Family coordinator',
    role_label: 'Coordinator',
    ...(email ? { email } : {}),
    ...(whatsapp ? { whatsapp } : {}),
  }

  return {
    ...withMode,
    public_contacts: [card],
  }
}

/** Strip coordinator-only data for anonymous visitors. */
export function memorialForPublicAudience(memorial: Memorial): Memorial {
  const {
    internal_contacts,
    stakeholders,
    wind_down_meetings,
    tasks,
    pledges,
    coordinator_recovery_email,
    last_bank_reconciliation,
    pin_recovery_rate,
    ...rest
  } = memorial
  void internal_contacts
  void tasks
  void coordinator_recovery_email
  void last_bank_reconciliation
  void pin_recovery_rate
  const publicStakeholders = stakeholders?.filter((s) => s.visibility === 'public')
  const publicMeetings = wind_down_meetings?.filter((m) => m.visibility === 'public')
  const publicPledges = publicPledgesForMemorial({ ...memorial, pledges })
  const publicReadings = publicProgrammeReadings(memorial)
  return {
    ...rest,
    ...(publicStakeholders?.length ? { stakeholders: publicStakeholders } : {}),
    ...(publicMeetings?.length ? { wind_down_meetings: publicMeetings } : {}),
    ...(publicPledges.length ? { pledges: publicPledges } : {}),
    ...(publicReadings.length ? { programme_readings: publicReadings } : {}),
  }
}

export function programmeReadingsForPublicPage(memorial: Memorial): ProgrammeReading[] {
  const mode = normalizeMemorialMode(memorial.memorial_mode)
  if (mode !== 'programme' && mode !== 'full') return []
  return publicProgrammeReadings(memorial)
}

/** Pledges visible on the public memorial page (programme/full, or when fundraising is active). */
export function pledgesForPublicPage(memorial: Memorial): MemorialPledge[] {
  const mode = normalizeMemorialMode(memorial.memorial_mode)
  const showSurface = mode === 'programme' || mode === 'full' || memorial.fundraising_active
  if (!showSurface) return []
  return publicPledgesForMemorial(memorial)
}

export function coordinatorEmailFallback(memorial: Memorial): string | undefined {
  const m = hydrateMemorial(memorial)
  const first = m.public_contacts?.[0]
  return first?.email?.trim() || memorial.coordinator_email?.trim()
}

export function coordinatorWhatsappFallback(memorial: Memorial): string | undefined {
  const m = hydrateMemorial(memorial)
  const first = m.public_contacts?.[0]
  const wa = first?.whatsapp?.trim() || first?.phone?.trim()
  return wa || memorial.coordinator_whatsapp?.trim()
}

export const STAKEHOLDER_CATEGORY_LABEL: Record<StakeholderCategory, string> = {
  family_protocol: 'Family & protocol',
  faith: 'Faith',
  interment: 'Interment',
  catering: 'Catering',
  site_ops: 'Site & logistics',
  media: 'Media',
  transport: 'Transport',
  other: 'Other',
}
