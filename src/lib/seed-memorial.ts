import { v4 as uuid } from 'uuid'
import type {
  Contribution,
  Memorial,
  MemorialEvent,
  Stakeholder,
  StoredMemorialBlob,
  Tribute,
  WindDownMeeting,
} from '@/lib/types'
import { hashPin } from '@/lib/crypto-pin'

export const EXAMPLE_MEMORIAL_SLUGS = [
  'bannerman-samuel-2026',
  'ghana-muslim-example-2026',
] as const

/** Committed under `public/seed/` — work offline and in production without Blob. */
export const BANNERMAN_SEED_PHOTO = '/seed/bannerman-primary.jpg'
export const BANNERMAN_SEED_GALLERY = [
  '/seed/bannerman-1.jpg',
  '/seed/bannerman-2.jpg',
  '/seed/bannerman-3.jpg',
  '/seed/bannerman-4.jpg',
] as const

export const GHANA_MUSLIM_SEED_PHOTO = '/seed/muslim-primary.jpg'
export const GHANA_MUSLIM_SEED_GALLERY = [
  '/seed/muslim-1.jpg',
  '/seed/muslim-2.jpg',
  '/seed/muslim-3.jpg',
] as const

const SLUG = EXAMPLE_MEMORIAL_SLUGS[0]

export function getExampleMemorialBlob(): StoredMemorialBlob {
  const memorialId = uuid()
  const created = '2026-01-10T12:00:00.000Z'
  const stakeholders: Stakeholder[] = [
    {
      id: uuid(),
      category: 'faith',
      name: 'Rev. Joseph Hammond',
      role_label: 'Officiant — St. Mary’s Anglican Church, Jamestown',
      phone: '+233241000001',
      visibility: 'public',
    },
    {
      id: uuid(),
      category: 'interment',
      name: 'Kwame Ofori',
      role_label: 'Cemetery liaison',
      phone: '+233551112222',
      notes: 'Gate access and procession timing',
      visibility: 'public',
    },
    {
      id: uuid(),
      category: 'catering',
      name: 'Auntie Esi’s Kitchen',
      role_label: 'Refreshments after burial',
      email: 'catering@example.local',
      visibility: 'coordinator_only',
    },
  ]
  const memorial: Memorial = {
    id: memorialId,
    created_at: created,
    slug: SLUG,
    status: 'live',
    memorial_mode: 'full',
    deceased_name: 'Samuel Kwesi Bannerman',
    deceased_title: 'Weku Nukpa of the Bannerman family of Kanlow in Ngleshie Alata Jamestown',
    deceased_family_house: 'Bannerman family of Kanlow',
    deceased_community: 'Ngleshie Alata Jamestown',
    date_of_birth: '1948-03-22',
    date_of_passing: '2026-01-08',
    photo_url: BANNERMAN_SEED_PHOTO,
    gallery_urls: [...BANNERMAN_SEED_GALLERY],
    biography:
      'A devoted father, uncle, and steward of the family stool. Known for his quiet strength, generosity to young people, and unwavering commitment to truth and dignity.',
    tradition: 'ghana-christian',
    surviving_family: [
      {
        title: 'Wife',
        name: 'Mrs. Akosua Bannerman (née Mensah)',
        note: 'Educator and community organiser',
      },
      {
        title: 'Son',
        name: 'Mr. Eddie Bannerman-Menson',
        note: 'Technology and product leadership',
      },
      {
        title: 'Daughter',
        name: 'Dr. Efua Bannerman',
        note: 'Physician, Korle Bu Teaching Hospital',
      },
    ],
    allied_families: ['Mensah family of Osu', 'Laryea family of Jamestown'],
    stakeholders,
    remembrance: {
      scripture: {
        reference: 'John 14:1–3 (NIV)',
        text: '“Do not let your hearts be troubled. You believe in God; believe also in me. My Father’s house has many rooms…”',
      },
      quotes: [
        {
          text: 'We gather not only in grief, but in gratitude for a life that taught us steadiness and grace.',
          attribution: 'Family programme',
        },
      ],
    },
    public_contacts: [
      {
        name: 'Eddie Bannerman-Menson',
        role_label: 'Chief mourner (programme coordinator)',
        whatsapp: '+233200000000',
        email: 'coordinator@example.local',
      },
    ],
    internal_contacts: [
      {
        name: 'Funeral logistics desk',
        role_label: 'Site & transport',
        phone: '+233500000000',
      },
    ],
    coordinator_name: 'Eddie Bannerman-Menson',
    coordinator_whatsapp: '+233200000000',
    coordinator_email: 'coordinator@example.local',
    announcement_text:
      'It is with profound sadness that the family announces the passing of Samuel Kwesi Bannerman (Weku Nukpa of the Bannerman family of Kanlow in Ngleshie Alata Jamestown), who entered into rest on 8 January 2026.\n\nSunrise: 22 March 1948 | Sunset: 8 January 2026\n\nThe family invites all who loved him to join us in celebrating a life lived with honour, humour, and deep care for others. May his soul rest in perfect peace. Amen.',
    fundraising_active: true,
    fundraising_goal: 2500000,
    fundraising_currency: 'GHS',
    fundraising_label: 'Funeral expenses & family support',
    fundraising_appeal:
      'Friends and family abroad have asked how they can stand with us. Any contribution eases the burden on the household and helps us give Uncle Sam the farewell he deserves — with dignity, warmth, and room to grieve without spreadsheets.',
    closing_thank_you:
      'The family thanks all and sundry — friends near and far, allied houses, clergy, and every hand that helped us carry these days with grace. Your prayers, presence, and practical kindness will not be forgotten.',
    wind_down_meetings: [
      {
        id: uuid(),
        title: 'Thanksgiving service — all welcome',
        starts_at: '2026-02-09T09:00:00.000Z',
        location: "St. Mary's Anglican Church, Jamestown",
        notes: 'A short service of thanks; no dress code beyond respectful church wear.',
        visibility: 'public',
      },
    ] satisfies WindDownMeeting[],
  }

  const events: MemorialEvent[] = [
    {
      id: uuid(),
      memorial_id: memorialId,
      title: 'One-week observation',
      event_date: '2026-01-15T16:00:00.000Z',
      location: 'Family residence, Jamestown',
      online_link: '',
      notes: 'Allied families and friends welcome.',
      sort_order: 0,
    },
    {
      id: uuid(),
      memorial_id: memorialId,
      title: 'Funeral service',
      event_date: '2026-02-01T09:00:00.000Z',
      location: 'St. Mary’s Anglican Church, Jamestown',
      online_link: 'https://example.com/stream-placeholder',
      notes: 'Procession follows to Kanlow family house.',
      sort_order: 1,
    },
    {
      id: uuid(),
      memorial_id: memorialId,
      title: 'Burial & thanksgiving',
      event_date: '2026-02-01T14:00:00.000Z',
      location: 'Private cemetery, Accra',
      online_link: '',
      notes: '',
      sort_order: 2,
    },
  ]

  const tributes: Tribute[] = [
    {
      id: uuid(),
      memorial_id: memorialId,
      author_name: 'Naa Ayele',
      author_location: 'Accra',
      message:
        'Uncle Sam taught me that leadership is service. We will miss his laughter in the compound.',
      video_url: undefined,
      created_at: '2026-01-11T10:00:00.000Z',
      approved: true,
    },
    {
      id: uuid(),
      memorial_id: memorialId,
      author_name: 'Kofi Osei',
      author_location: 'London',
      message:
        'He was the first person to meet me at Kotoka when I came home after ten years away. Rest well, senior.',
      video_url: undefined,
      created_at: '2026-01-12T08:30:00.000Z',
      approved: true,
    },
  ]

  const contributions: Contribution[] = [
    {
      id: uuid(),
      memorial_id: memorialId,
      contributor_name: 'Anonymous (UK)',
      contributor_whatsapp: undefined,
      amount: 50000,
      currency: 'GHS',
      message: 'With love from London.',
      paystack_reference: 'seed_ref_001',
      paid_at: '2026-01-10T18:00:00.000Z',
      payout_status: 'paid',
    },
    {
      id: uuid(),
      memorial_id: memorialId,
      contributor_name: 'Auntie Rose',
      contributor_whatsapp: '+233241111111',
      amount: 200000,
      currency: 'GHS',
      message: '',
      paystack_reference: 'seed_ref_002',
      paid_at: '2026-01-11T09:00:00.000Z',
      payout_status: 'paid',
    },
  ]

  return {
    memorial,
    events,
    tributes,
    contributions,
    coordinator_pin_hash: hashPin('123456'),
  }
}

const GHANA_MUSLIM_SLUG = EXAMPLE_MEMORIAL_SLUGS[1]

/** Programme-mode Ghanaian Muslim example — seeds only when slug is missing. */
export function getGhanaMuslimExampleMemorialBlob(): StoredMemorialBlob {
  const memorialId = uuid()
  const created = '2026-02-01T10:00:00.000Z'
  const memorial: Memorial = {
    id: memorialId,
    created_at: created,
    slug: GHANA_MUSLIM_SLUG,
    status: 'live',
    memorial_mode: 'programme',
    output_template: 'programme',
    visual_theme: 'programme',
    deceased_name: 'Hajia Aminata Mensah (née Yakubu)',
    deceased_title: 'Matriarch of the Mensah family of Nima',
    deceased_family_house: 'Mensah family of Nima',
    deceased_community: 'Nima, Accra',
    date_of_birth: '1952-08-14',
    date_of_passing: '2026-01-28',
    photo_url: GHANA_MUSLIM_SEED_PHOTO,
    gallery_urls: [...GHANA_MUSLIM_SEED_GALLERY],
    biography:
      'Beloved mother, aunt, and pillar of the community. Known for her hospitality at Ramadan, her counsel to young women, and her quiet generosity to neighbours in need.',
    tradition: 'ghana-muslim',
    surviving_family: [
      {
        title: 'Son',
        name: 'Mr. Ibrahim Mensah',
        note: 'Family spokesperson',
      },
    ],
    allied_families: ['Yakubu family of Tamale'],
    remembrance: {
      quotes: [
        {
          text: 'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُون',
          attribution: 'Qur’an 2:156',
        },
      ],
    },
    public_contacts: [
      {
        name: 'Mr. Ibrahim Mensah',
        role_label: 'Family liaison — programme & Janazah',
        whatsapp: '+233200000001',
        email: 'liaison@example.local',
      },
    ],
    coordinator_name: 'Mr. Ibrahim Mensah',
    coordinator_whatsapp: '+233200000001',
    coordinator_email: 'liaison@example.local',
    announcement_text:
      'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُون\n\nWith humble hearts, the Muslim family announces the passing of Hajia Aminata Mensah (née Yakubu), matriarch of the Mensah family of Nima, who returned to her Lord on 28 January 2026.\n\nBorn: 14 August 1952 | Passed: 28 January 2026\n\nJanazah prayer and burial will follow Islamic rites; the family will announce date, time, and venue in due course. May Allah grant her Al-Jannah Firdaus. Ameen.',
    fundraising_active: false,
    fundraising_currency: 'GHS',
    closing_thank_you:
      'The family thanks all who have called, visited, and prayed. Your duʿāʾ and practical kindness are deeply appreciated.',
  }

  const events: MemorialEvent[] = [
    {
      id: uuid(),
      memorial_id: memorialId,
      title: 'Janazah prayer',
      event_date: '2026-02-05T08:00:00.000Z',
      location: 'Nima Central Mosque, Accra',
      online_link: '',
      notes: 'Burial to follow at the Islamic cemetery. All are welcome to attend.',
      sort_order: 0,
      visibility: 'public',
    },
  ]

  return {
    memorial,
    events,
    tributes: [],
    contributions: [],
    coordinator_pin_hash: hashPin('123456'),
  }
}
