'use client'

import { useState } from 'react'
import { TRANSLATE_LANGUAGES, TRANSLATE_LANGUAGE_LABELS, type TranslateLanguage } from '@/lib/claude-copy'
import type { MemorialWithDetails } from '@/lib/types'

const LANGUAGES = Object.entries(TRANSLATE_LANGUAGES) as [TranslateLanguage, { label: string; country: string }][]

type Props = {
  memorial: MemorialWithDetails
  slug: string
  pin: string
  onSaved?: () => void
  onMessage?: (msg: string) => void
}

async function readSSE(
  res: Response,
  onChunk: (text: string) => void,
): Promise<void> {
  if (!res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6)
      if (payload === '[DONE]') return
      try {
        const { text } = JSON.parse(payload) as { text: string }
        onChunk(text)
      } catch {
        // malformed chunk — skip
      }
    }
  }
}

export function ObituaryWordsPanel({ memorial, slug, pin, onSaved, onMessage }: Props) {
  const [obituary, setObituary]       = useState('')
  const [generating, setGenerating]   = useState(false)
  const [saving, setSaving]           = useState(false)
  const [activeLang, setActiveLang]   = useState<TranslateLanguage | null>(null)
  const [translation, setTranslation] = useState('')
  const [translating, setTranslating] = useState(false)

  async function generate() {
    setGenerating(true)
    setObituary('')
    try {
      const res = await fetch('/api/ai/obituary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memorial }),
      })
      if (!res.ok) { onMessage?.('Could not generate obituary.'); return }
      await readSSE(res, (text) => setObituary((prev) => prev + text))
    } finally {
      setGenerating(false)
    }
  }

  async function translate(lang: TranslateLanguage) {
    if (!obituary.trim()) return
    setActiveLang(lang)
    setTranslation('')
    setTranslating(true)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: obituary,
          language: lang,
          tier: memorial.memorial_mode ?? 'notice',
        }),
      })
      if (!res.ok) { onMessage?.('Translation failed.'); return }
      await readSSE(res, (text) => setTranslation((prev) => prev + text))
    } finally {
      setTranslating(false)
    }
  }

  async function save() {
    if (!pin || !obituary.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/memorials/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
        body: JSON.stringify({ pin, biography: obituary }),
      })
      if (!res.ok) { onMessage?.('Save failed.'); return }
      onMessage?.('Obituary saved.')
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const hasText   = obituary.length > 0
  const showPanel = hasText || generating

  return (
    <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-3 sm:p-4">

      <div>
        <h2 className="font-semibold">Obituary</h2>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          Drafted from the details you have already saved. Edit freely before publishing.
        </p>
      </div>

      {/* Generate button — full width on mobile, auto on sm+ */}
      <button
        type="button"
        disabled={generating}
        onClick={() => void generate()}
        className="min-h-[44px] w-full rounded border border-[#3D2B1F]/25 px-4 py-2 text-sm disabled:opacity-40 sm:w-auto"
      >
        {generating ? 'Writing…' : hasText ? 'Rewrite obituary' : 'Write obituary'}
      </button>

      {showPanel && (
        /* text-base (16px) prevents iOS auto-zoom on focus */
        <textarea
          className="min-h-[260px] w-full rounded border border-[#3D2B1F]/20 px-3 py-3 font-serif text-base leading-relaxed sm:min-h-[300px]"
          value={obituary}
          onChange={(e) => setObituary(e.target.value)}
          readOnly={generating}
          placeholder={generating ? '' : 'Obituary will appear here…'}
        />
      )}

      {hasText && !generating && (
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="min-h-[44px] w-full rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A] disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Saving…' : 'Save obituary'}
        </button>
      )}

      {hasText && !generating && (
        <div className="space-y-3 border-t border-[#3D2B1F]/10 pt-4">

          <p className="text-sm font-medium text-[#1A1A1A]">Translate</p>

          {/* 3-col grid on mobile keeps all 6 buttons tidy; flex-wrap on sm+ */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            {LANGUAGES.map(([code, { label, country }]) => (
              <button
                key={code}
                type="button"
                disabled={translating}
                onClick={() => void translate(code)}
                className={[
                  'flex min-h-[56px] flex-col items-center justify-center rounded border px-2 py-2 transition-colors sm:min-h-[44px] sm:px-3',
                  activeLang === code
                    ? 'border-[#3D2B1F] bg-[#3D2B1F] text-[#f4f0e8]'
                    : 'border-[#3D2B1F]/25 text-[#1A1A1A] hover:border-[#3D2B1F]/50',
                  translating && activeLang !== code ? 'opacity-40' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="text-sm font-medium leading-tight">{label}</span>
                <span className={[
                  'mt-0.5 text-[10px] leading-tight',
                  activeLang === code ? 'text-[#f4f0e8]/70' : 'text-[#1A1A1A]/45',
                ].join(' ')}>
                  {country}
                </span>
              </button>
            ))}
          </div>

          {(translation || translating) && activeLang && (
            <div className="rounded border border-[#3D2B1F]/10 bg-[#f4f0e8] px-4 py-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/50">
                {TRANSLATE_LANGUAGES[activeLang].label} — {TRANSLATE_LANGUAGES[activeLang].country}
              </p>
              {/* text-base prevents iOS zoom if user taps to select/copy */}
              <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-[#1A1A1A]">
                {translating && !translation ? '…' : translation}
              </p>
              {translation && !translating && (
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(translation)}
                  className="mt-3 min-h-[44px] text-sm text-[#1A1A1A]/50 underline underline-offset-2"
                >
                  Copy
                </button>
              )}
            </div>
          )}

        </div>
      )}

    </section>
  )
}
