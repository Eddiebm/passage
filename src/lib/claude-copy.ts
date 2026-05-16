import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import type { Memorial, MemorialMode, Tradition } from '@/lib/types'
import { TRADITION_PRESETS } from '@/lib/tradition-presets'

// ─── Model routing ────────────────────────────────────────────────────────────

const OPENROUTER_URL = 'https://openrouter.ai/api/v1'

const TIER_CONFIG = {
  notice:    { provider: 'openrouter' as const, model: 'google/gemini-2.5-flash' },
  programme: { provider: 'openrouter' as const, model: 'anthropic/claude-haiku-4-5' },
  full:      { provider: 'anthropic'  as const, model: 'claude-opus-4-7' },
} satisfies Record<MemorialMode, { provider: 'openrouter' | 'anthropic'; model: string }>

function getOpenRouterClient(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY?.trim()
  if (!key) return null
  return new OpenAI({
    apiKey: key,
    baseURL: OPENROUTER_URL,
    defaultHeaders: {
      'HTTP-Referer': 'https://passage-rouge.vercel.app',
      'X-Title': 'Passage',
    },
  })
}

function getAnthropicClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TranslateLanguage = 'twi' | 'ga' | 'ewe' | 'hausa' | 'yoruba' | 'igbo'

export type TranslateLanguageMeta = { label: string; country: string }

export const TRANSLATE_LANGUAGES: Record<TranslateLanguage, TranslateLanguageMeta> = {
  twi:    { label: 'Twi',    country: 'Ghana' },
  ga:     { label: 'Ga',     country: 'Ghana' },
  ewe:    { label: 'Ewe',    country: 'Ghana' },
  hausa:  { label: 'Hausa',  country: 'Ghana · Nigeria' },
  yoruba: { label: 'Yoruba', country: 'Nigeria' },
  igbo:   { label: 'Igbo',   country: 'Nigeria' },
}

/** Flat label map kept for route validation and system prompts. */
export const TRANSLATE_LANGUAGE_LABELS: Record<TranslateLanguage, string> = Object.fromEntries(
  Object.entries(TRANSLATE_LANGUAGES).map(([k, v]) => [k, v.label])
) as Record<TranslateLanguage, string>

type ObituaryInput = {
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
    | 'memorial_mode'
  >
}

// ─── Obituary ────────────────────────────────────────────────────────────────

export async function generateObituaryStream(input: ObituaryInput): Promise<ReadableStream<Uint8Array>> {
  const preset = TRADITION_PRESETS[input.memorial.tradition as Tradition]
  const tier = input.memorial.memorial_mode ?? 'notice'
  const { provider, model } = TIER_CONFIG[tier]

  const survivingNames = input.memorial.surviving_family
    .map(m => `${m.title} ${m.name}${m.note ? ` (${m.note})` : ''}`)
    .join(', ')

  const system = 'You write warm, dignified obituaries for West African families. Formal English. Never sound corporate.'
  const prompt = `Write a warm, dignified obituary for a West African family memorial page.

Tradition: ${preset.label}
Name: ${input.memorial.deceased_title ? `${input.memorial.deceased_title} ` : ''}${input.memorial.deceased_name}
${input.memorial.deceased_family_house ? `Family house: ${input.memorial.deceased_family_house}` : ''}
${input.memorial.deceased_community ? `Community: ${input.memorial.deceased_community}` : ''}
Date of birth: ${input.memorial.date_of_birth ?? 'unknown'}
Date of passing: ${input.memorial.date_of_passing}
${input.memorial.biography ? `Biography notes from family: ${input.memorial.biography}` : ''}
Surviving family: ${survivingNames || 'not specified'}
${input.memorial.allied_families?.length ? `Allied families: ${input.memorial.allied_families.join(', ')}` : ''}

Guidelines:
- 3–5 paragraphs. No headers, no bullet points, no markdown.
- Open with the tradition's opening line: "${preset.openingLine}"
- Honour traditional titles, family house, and community if provided.
- Weave in the biography naturally — celebrate the life, not just the death.
- Name surviving family with warmth and dignity.
- Close with: "${preset.religiousClose}"
- Formal English. Never sound corporate or generic.`

  if (provider === 'anthropic') {
    const client = getAnthropicClient()
    if (!client) return fallbackStream(buildObituaryFallback(input.memorial, preset))
    return anthropicStream(client, model, system, prompt, 1000)
  }

  const client = getOpenRouterClient()
  if (!client) return fallbackStream(buildObituaryFallback(input.memorial, preset))
  return openRouterStream(client, model, system, prompt, 1000)
}

// ─── Translator ───────────────────────────────────────────────────────────────

export async function translateTextStream(input: {
  text: string
  language: TranslateLanguage
  tier?: MemorialMode
}): Promise<ReadableStream<Uint8Array>> {
  const tier = input.tier ?? 'notice'
  const { provider, model } = TIER_CONFIG[tier]
  const languageLabel = TRANSLATE_LANGUAGE_LABELS[input.language]

  const system = 'You are a professional translator specialising in West African languages. Translate the provided text faithfully and with cultural sensitivity. Preserve the formal, dignified tone. Output only the translation — no commentary.'
  const prompt = `Translate the following into ${languageLabel}:\n\n${input.text}`

  if (provider === 'anthropic') {
    const client = getAnthropicClient()
    if (!client) return fallbackStream(`[Translation unavailable — ANTHROPIC_API_KEY not set]\n\n${input.text}`)
    return anthropicStream(client, model, system, prompt, 1500)
  }

  const client = getOpenRouterClient()
  if (!client) return fallbackStream(`[Translation unavailable — OPENROUTER_API_KEY not set]\n\n${input.text}`)
  return openRouterStream(client, model, system, prompt, 1500)
}

// ─── Stream helpers ───────────────────────────────────────────────────────────

async function openRouterStream(
  client: OpenAI,
  model: string,
  system: string,
  prompt: string,
  maxTokens: number,
): Promise<ReadableStream<Uint8Array>> {
  const stream = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          if (chunk.choices[0]?.finish_reason) controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })
}

function anthropicStream(
  client: Anthropic,
  model: string,
  system: string,
  prompt: string,
  maxTokens: number,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  return new ReadableStream({
    async start(controller) {
      stream.on('text', (text: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      })
      stream.on('finalMessage', () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      })
      stream.on('error', (err: Error) => {
        controller.error(err)
      })
    },
  })
}

function fallbackStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}

function buildObituaryFallback(
  memorial: ObituaryInput['memorial'],
  preset: (typeof TRADITION_PRESETS)[keyof typeof TRADITION_PRESETS]
): string {
  const name = `${memorial.deceased_title ? `${memorial.deceased_title} ` : ''}${memorial.deceased_name}`
  const dob = memorial.date_of_birth ?? '—'
  const dop = memorial.date_of_passing
  return `${preset.openingLine} ${name}.\n\n${preset.dateFormat.replace('{dob}', dob).replace('{dop}', dop)}\n\n${memorial.biography ? `${memorial.biography}\n\n` : ''}${preset.religiousClose}`
}
