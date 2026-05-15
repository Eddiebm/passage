export type Tradition = 'ghana-christian' | 'nigeria-christian' | 'nigeria-muslim' | 'diaspora'

export type MemorialStatus = 'draft' | 'pending_review' | 'live'

export interface SurvivingFamilyMember {
  title: string   // "Wife", "Son", "Daughter", "Brother"
  name: string
  note?: string   // e.g. "former Minister of Mining and Natural Resources"
}

export interface Memorial {
  id: string
  created_at: string
  slug: string
  status: MemorialStatus

  // Deceased
  deceased_name: string
  deceased_title?: string         // traditional/professional title
  deceased_family_house?: string  // e.g. "Bannerman family of Kanlow"
  deceased_community?: string     // e.g. "Ngleshie Alata Jamestown"
  date_of_birth?: string          // ISO date string
  date_of_passing: string         // ISO date string
  photo_url?: string
  biography?: string

  // Tradition
  tradition: Tradition

  // Family
  surviving_family: SurvivingFamilyMember[]
  allied_families: string[]

  // Coordinator
  coordinator_name?: string
  coordinator_whatsapp?: string
  coordinator_email?: string

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
}

export interface Tribute {
  id: string
  memorial_id: string
  author_name: string
  author_location?: string
  message?: string
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
  tradition: Tradition
  deceased_name: string
  deceased_title: string
  deceased_family_house: string
  deceased_community: string
  date_of_birth: string
  date_of_passing: string
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
  coordinator_name: string
  coordinator_whatsapp: string
  coordinator_email: string
}
