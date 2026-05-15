export type Tradition =
  | 'ghana-christian'
  | 'ghana-muslim'
  | 'nigeria-christian'
  | 'nigeria-muslim'
  | 'diaspora'

export type MemorialStatus = 'draft' | 'pending_review' | 'live'

/** Lifecycle after main funeral work — separate from publish `status`. */
export type MemorialClosureStatus = 'active' | 'closed'

/** How much coordination UI and public surface to show — default `notice`. */
export type MemorialMode = 'notice' | 'programme' | 'full'

/** Visual layout for print / public hero — separate from `memorial_mode` feature gating. */
export type OutputTemplate = 'notice' | 'programme' | 'banner_classic'

export type StakeholderCategory =
  | 'family_protocol'
  | 'faith'
  | 'interment'
  | 'catering'
  | 'site_ops'
  | 'media'
  | 'transport'
  | 'other'

export interface Stakeholder {
  id: string
  category: StakeholderCategory
  name: string
  role_label?: string
  phone?: string
  email?: string
  notes?: string
  visibility: 'public' | 'coordinator_only'
}

export interface Remembrance {
  scripture?: { reference: string; text: string }
  quotes?: { text: string; attribution?: string }[]
}

export type ProgrammeReadingType = 'scripture' | 'hymn' | 'quran' | 'upload'

export interface ProgrammeReading {
  id: string
  type: ProgrammeReadingType
  /** Display label e.g. "Opening hymn", "Scripture reading". */
  title: string
  sort_order?: number
  visibility?: 'public' | 'coordinator_only'
  scripture_reference?: string
  scripture_text?: string
  bible_translation?: string
  hymn_book?: string
  hymn_number?: string
  hymn_title?: string
  hymn_lyrics?: string
  quran_reference?: string
  quran_arabic?: string
  quran_translation?: string
  document_url?: string
  document_caption?: string
}

export interface WindDownMeeting {
  id: string
  title: string
  starts_at?: string
  location?: string
  notes?: string
  visibility: 'public' | 'coordinator_only'
}

/** Coordinator checklist items; never exposed on anonymous public memorial payloads. */
export interface MemorialTask {
  id: string
  title: string
  owner_name?: string
  due_at?: string
  status: 'open' | 'done'
  notes?: string
}

export type MemorialPledgeStatus = 'pledged' | 'partial' | 'fulfilled' | 'cancelled'

/** Promised vs paid support; public rows omit `coordinator_only` and amounts policy per visibility. */
export interface MemorialPledge {
  id: string
  pledger_name: string
  amount_minor?: number
  currency?: string
  purpose?: string
  status: MemorialPledgeStatus
  expected_by?: string
  channel_note?: string
  /** Manual link to a `contributions[]` row after reconciliation. */
  contribution_id?: string
  /** Optional Paystack reference for auto-match on webhook / verify. */
  paystack_reference?: string
  visibility?: 'public' | 'coordinator_only'
}

export interface ContactCard {
  name: string
  role_label?: string
  phone?: string
  email?: string
  whatsapp?: string
}

export interface SurvivingFamilyMember {
  title: string   // "Wife", "Son", "Daughter", "Brother"
  name: string
  note?: string   // e.g. "former Minister of Mining and Natural Resources"
}

/** OCR bank/MoMo row with coordinator reconciliation state (stored on memorial blob). */
export interface BankReconciliationTransaction {
  date: string
  amount: number
  currency: string
  sender: string | null
  reference: string | null
  type: 'credit' | 'debit' | 'unknown'
  reconciliation_status?: 'pending' | 'reconciled' | 'unmatched'
  /** Linked `contributions[]` row after manual match — never auto-set. */
  contribution_id?: string
}

export interface LastBankReconciliation {
  scanned_at: string
  file_hash: string
  transactions: BankReconciliationTransaction[]
}

/** Rate limit metadata for PIN recovery requests (coordinator-only). */
export interface PinRecoveryRateWindow {
  window_start: string
  count: number
}

export interface Memorial {
  id: string
  created_at: string
  slug: string
  status: MemorialStatus
  /** `notice` = announcement-first; `programme` adds remembrance + programme; `full` shows full coordination surfaces. */
  memorial_mode?: MemorialMode
  /** Print / public typography variant — independent of `memorial_mode`. */
  output_template?: OutputTemplate

  // Deceased
  deceased_name: string
  deceased_title?: string         // traditional/professional title
  deceased_family_house?: string  // e.g. "Bannerman family of Kanlow"
  deceased_community?: string     // e.g. "Ngleshie Alata Jamestown"
  date_of_birth?: string          // ISO date string
  date_of_passing: string         // ISO date string
  place_of_passing?: string
  age?: number
  /** Primary portrait / hero image (first-class; prefer uploads over hotlinks in production). */
  photo_url?: string
  /** Additional images (programme sheets, family moments). Stored as public URLs. */
  gallery_urls?: string[]
  biography?: string

  // Tradition
  tradition: Tradition

  // Family
  surviving_family: SurvivingFamilyMember[]
  allied_families: string[]

  // Coordinator (legacy; prefer public_contacts / internal_contacts — hydrated on read when missing)
  coordinator_name?: string
  coordinator_whatsapp?: string
  coordinator_email?: string
  /** Optional email for PIN recovery links (defaults to coordinator / public contact email). */
  coordinator_recovery_email?: string
  /** Last bank/MoMo OCR scan + manual reconciliation links (coordinator-only). */
  last_bank_reconciliation?: LastBankReconciliation
  /** PIN recovery request rate limit (coordinator-only). */
  pin_recovery_rate?: PinRecoveryRateWindow

  /** Authorities / vendors / programme contacts — single list; UI groups by category. */
  stakeholders?: Stakeholder[]
  /** Scripture and readings for the printed / digital programme. */
  remembrance?: Remembrance
  /** Order-of-service readings (scripture, hymns, Quran, uploaded pages). */
  programme_readings?: ProgrammeReading[]
  /** Up to two cards shown on the public memorial (enforced in API). */
  public_contacts?: ContactCard[]
  /** Coordinator-only directory; never shown on the public memorial page. */
  internal_contacts?: ContactCard[]

  // Generated content
  poster_url?: string
  poster_approved_at?: string
  announcement_text?: string

  // Fundraising
  fundraising_goal?: number
  fundraising_currency: string
  fundraising_label?: string
  fundraising_active: boolean
  fundraising_appeal?: string

  /** Optional post-funeral thank-you (plain / markdown-style text; public when set). */
  closing_thank_you?: string
  /** Post-main-programme meetings; filter by visibility for public page. */
  wind_down_meetings?: WindDownMeeting[]

  /** Coordinator-only checklist; stripped for public GET / memorial pages. */
  tasks?: MemorialTask[]
  /** Promised contributions; public subset shown when programme/full or fundraising is active. */
  pledges?: MemorialPledge[]

  /** `active` while arrangements continue; `closed` when brought to a logical end. */
  closure_status?: MemorialClosureStatus
  closed_at?: string
  /** Plain-language disposition / thank-you shown on closure print and public footer. */
  closure_notes?: string
}

export interface MemorialEvent {
  id: string
  memorial_id: string
  title: string
  event_date?: string
  location?: string
  online_link?: string
  notes?: string
  sort_order: number
  /** Omitted or `public` = shown on programme / print; `coordinator_only` hidden from public. */
  visibility?: 'public' | 'coordinator_only'
}

export interface Contribution {
  id: string
  memorial_id: string
  contributor_name?: string
  contributor_whatsapp?: string
  amount: number
  currency: string
  message?: string
  paystack_reference?: string
  paid_at?: string
  payout_status: 'pending' | 'paid' | 'failed'
  /** Set when payment auto-matched exactly one open pledge (heuristic). */
  matched_pledge_id?: string
}

export interface Tribute {
  id: string
  memorial_id: string
  author_name: string
  author_location?: string
  message?: string
  /** Optional photo attached by coordinator (upload preferred). */
  image_url?: string
  video_url?: string
  created_at: string
  approved: boolean
}

export interface TraditionPreset {
  label: string
  openingLine: string
  dateFormat: string
  photoRequired: boolean
  photoGuidance?: string
  religiousClose: string
  familyOrder: string[]
  includeAlliedFamilies: boolean
  includeTraditionalTitle: boolean
  includeFamilyHouse: boolean
  urgencyNote?: string
  diasporaMode?: boolean
  multiTimezone?: boolean
}

export interface MemorialWithDetails extends Memorial {
  events: MemorialEvent[]
  tributes: Tribute[]
  total_raised: number
  tribute_count: number
}

/** Full persisted shape (PIN hash never sent to clients). */
export interface StoredMemorialBlob {
  memorial: Memorial
  events: MemorialEvent[]
  tributes: Tribute[]
  contributions: Contribution[]
  coordinator_pin_hash: string
}

// Form shape for /create
export interface CreateMemorialForm {
  memorial_mode: MemorialMode
  output_template?: OutputTemplate
  tradition: Tradition
  deceased_name: string
  deceased_title: string
  deceased_family_house: string
  deceased_community: string
  date_of_birth: string
  date_of_passing: string
  place_of_passing?: string
  age?: string
  biography: string
  surviving_family: SurvivingFamilyMember[]
  allied_families: string[]
  events: Omit<MemorialEvent, 'id' | 'memorial_id'>[]
  fundraising_active: boolean
  fundraising_goal: string
  fundraising_currency: string
  fundraising_label: string
  fundraising_appeal: string
  photo_url?: string
  gallery_urls?: string[]
  coordinator_name: string
  coordinator_whatsapp: string
  coordinator_email: string
  coordinator_recovery_email?: string
}
