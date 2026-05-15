import { v4 as uuid } from 'uuid'
import type {
  Contribution,
  Memorial,
  MemorialEvent,
  StoredMemorialBlob,
  Tribute,
} from '@/lib/types'
import { hashPin } from '@/lib/crypto-pin'

const SLUG = 'bannerman-samuel-2026'

export function getExampleMemorialBlob(): StoredMemorialBlob {
  const memorialId = uuid()
  const created = '2026-01-10T12:00:00.000Z'
  const memorial: Memorial = {
    id: memorialId,
    created_at: created,
    slug: SLUG,
    status: 'live',
    deceased_name: 'Samuel Kwesi Bannerman',
    deceased_title: 'Weku Nukpa of the Bannerman family of Kanlow in Ngleshie Alata Jamestown',
    deceased_family_house: 'Bannerman family of Kanlow',
    deceased_community: 'Ngleshie Alata Jamestown',
    date_of_birth: '1948-03-22',
    date_of_passing: '2026-01-08',
    photo_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
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
