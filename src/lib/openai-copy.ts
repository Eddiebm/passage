import OpenAI from 'openai'
import type { Memorial, Tradition } from '@/lib/types'
import { TRADITION_PRESETS } from '@/lib/tradition-presets'

function warnNoKey(context: string) {
  console.warn(`[passage] OPENAI_API_KEY missing — returning placeholder for ${context}`)
}

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return null
  return new OpenAI({ apiKey: key })
}

export async function generateAnnouncementDraft(input: {
  memorial: Pick<
    Memorial,
    | 'deceased_name'
    | 'deceased_title'
    | 'deceased_family_house'
    | 'deceased_community'
    | 'date_of_birth'
    | 'date_of_passing'
    | 'tradition'
    | 'surviving_family'
    | 'allied_families'
    | 'biography'
  >
}): Promise<string> {
  const preset = TRADITION_PRESETS[input.memorial.tradition as Tradition]
  const client = getClient()
  if (!client) {
    warnNoKey('announcement')
    const dob = input.memorial.date_of_birth ?? '—'
    const dop = input.memorial.date_of_passing
    return `${preset.openingLine} ${input.memorial.deceased_name}${
      input.memorial.deceased_title ? `, ${input.memorial.deceased_title}` : ''
    }.\n\n${preset.dateFormat.replace('{dob}', dob).replace('{dop}', dop)}\n\n${
      input.memorial.biography ? `${input.memorial.biography}\n\n` : ''
    }${preset.religiousClose}`
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You write warm, dignified funeral announcements for West African families. Use formal English. Honour traditional titles and family houses when provided. Never sound corporate.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          tradition: input.memorial.tradition,
          preset,
          memorial: input.memorial,
        }),
      },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() || ''
}

export async function generateFundraisingAppealDraft(input: {
  memorial: Pick<Memorial, 'deceased_name' | 'tradition' | 'surviving_family' | 'fundraising_label'>
  goal?: number
  currency: string
}): Promise<string> {
  const client = getClient()
  if (!client) {
    warnNoKey('fundraising appeal')
    const label = input.memorial.fundraising_label || 'family support'
    return `Beloved friends and family, as we prepare to honour ${input.memorial.deceased_name}, we humbly welcome support toward ${label}. Every gesture helps carry the practical weight so we can grieve together with dignity. Thank you for standing with us.`
  }
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Write a short fundraising appeal in the voice of the bereaved family: warm, urgent, personal, never transactional.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          memorial: input.memorial,
          goal: input.goal,
          currency: input.currency,
        }),
      },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() || ''
}

export async function generateThankYouDraft(input: {
  deceased_name: string
  contributor_name?: string
  amount: number
  currency: string
}): Promise<string> {
  const client = getClient()
  const who = input.contributor_name || 'Friend'
  if (!client) {
    warnNoKey('thank-you')
    return `${who}, the family of the late ${input.deceased_name} is grateful for your support (${input.amount} ${input.currency}). Your kindness has lightened a heavy season. May you be blessed as you have blessed us.`
  }
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Write a brief thank-you note from the bereaved family to a contributor. Personal, warm, one short paragraph.',
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() || ''
}
