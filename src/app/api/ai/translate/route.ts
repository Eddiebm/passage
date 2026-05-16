import { translateTextStream, TRANSLATE_LANGUAGE_LABELS } from '@/lib/claude-copy'
import type { TranslateLanguage } from '@/lib/claude-copy'
import { isServiceTierMode } from '@/lib/service-tiers'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json()
  const { text, language, tier } = body as { text?: string; language?: string; tier?: string }

  if (!text?.trim()) {
    return Response.json({ error: 'text is required' }, { status: 400 })
  }

  if (!language || !(language in TRANSLATE_LANGUAGE_LABELS)) {
    return Response.json(
      { error: `language must be one of: ${Object.keys(TRANSLATE_LANGUAGE_LABELS).join(', ')}` },
      { status: 400 }
    )
  }

  const resolvedTier = isServiceTierMode(tier) ? tier : 'notice'

  const stream = await translateTextStream({
    text,
    language: language as TranslateLanguage,
    tier: resolvedTier,
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
