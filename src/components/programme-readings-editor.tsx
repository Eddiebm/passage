'use client'

import { useMemo, useState } from 'react'
import type { ProgrammeReading, ProgrammeReadingType, Tradition } from '@/lib/types'
import {
  PROGRAMME_HYMN_BOOKS,
  findHymn,
  findScripture,
  getSuggestedReadings,
  type ProgrammeReadingTemplate,
} from '@/lib/programme-reading-library'
import { uploadMemorialImage } from '@/lib/memorial-image-client'
import { MemorialImageFileInput } from '@/components/memorial-image-file-input'
import { validateMemorialImageFile } from '@/lib/memorial-image'

function newReadingId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `pr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function templateToReading(template: ProgrammeReadingTemplate, sortOrder: number): ProgrammeReading {
  return {
    ...template,
    id: newReadingId(),
    sort_order: sortOrder,
    visibility: template.visibility ?? 'public',
  }
}

function emptyReading(type: ProgrammeReadingType, sortOrder: number): ProgrammeReading {
  const base = { id: newReadingId(), type, title: '', sort_order: sortOrder, visibility: 'public' as const }
  if (type === 'scripture') return { ...base, bible_translation: 'KJV' }
  return base
}

const READING_TYPE_LABEL: Record<ProgrammeReadingType, string> = {
  scripture: 'Scripture',
  hymn: 'Hymn',
  quran: 'Quran',
  upload: 'Uploaded page',
}

type Props = {
  slug: string
  pin: string
  tradition: Tradition
  readings: ProgrammeReading[]
  onSave: (readings: ProgrammeReading[]) => void | Promise<void>
  onMessage?: (msg: string) => void
}

export function ProgrammeReadingsEditor({ slug, pin, tradition, readings, onSave, onMessage }: Props) {
  const [drafts, setDrafts] = useState<ProgrammeReading[]>(() =>
    [...readings].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  )
  const [addType, setAddType] = useState<ProgrammeReadingType>('scripture')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const suggestions = useMemo(() => getSuggestedReadings(tradition), [tradition])

  function updateReading(id: string, partial: Partial<ProgrammeReading>) {
    setDrafts((rows) => rows.map((r) => (r.id === id ? { ...r, ...partial } : r)))
  }

  function removeReading(id: string) {
    setDrafts((rows) => rows.filter((r) => r.id !== id))
  }

  function moveReading(id: string, direction: -1 | 1) {
    setDrafts((rows) => {
      const idx = rows.findIndex((r) => r.id === id)
      if (idx < 0) return rows
      const next = idx + direction
      if (next < 0 || next >= rows.length) return rows
      const copy = [...rows]
      const [item] = copy.splice(idx, 1)
      copy.splice(next, 0, item)
      return copy.map((r, i) => ({ ...r, sort_order: i }))
    })
  }

  function addFromTemplate(template: ProgrammeReadingTemplate) {
    setDrafts((rows) => [...rows, templateToReading(template, rows.length)])
  }

  function addBlank() {
    setDrafts((rows) => [...rows, emptyReading(addType, rows.length)])
  }

  function applyHymnLookup(id: string, book: string, number: string) {
    const found = findHymn(book, number)
    if (!found) {
      onMessage?.('No hymn found for that book and number in the library.')
      return
    }
    updateReading(id, {
      hymn_book: found.hymn_book,
      hymn_number: found.hymn_number,
      hymn_title: found.hymn_title,
      hymn_lyrics: found.hymn_lyrics,
      title: found.title || 'Hymn',
    })
    onMessage?.('Hymn loaded from library.')
  }

  function applyScriptureLookup(id: string, reference: string) {
    const found = findScripture(reference)
    if (!found) {
      onMessage?.('No matching scripture in the library — enter text manually.')
      return
    }
    updateReading(id, {
      scripture_reference: found.scripture_reference,
      scripture_text: found.scripture_text,
      bible_translation: found.bible_translation,
      title: found.title || 'Scripture reading',
    })
    onMessage?.('Scripture loaded from library.')
  }

  async function uploadProgrammePage(readingId: string, file: File) {
    const validated = validateMemorialImageFile(file)
    if (!validated.ok) {
      onMessage?.(validated.error)
      return
    }
    setUploadingId(readingId)
    const result = await uploadMemorialImage(slug, pin, file, 'programme')
    setUploadingId(null)
    if (!result.ok) {
      onMessage?.(result.error)
      return
    }
    updateReading(readingId, { document_url: result.url })
    onMessage?.('Programme page uploaded.')
  }

  async function save() {
    const normalized = drafts
      .filter((r) => r.title.trim().length > 0)
      .map((r, i) => ({ ...r, title: r.title.trim(), sort_order: i }))
    await onSave(normalized)
  }

  return (
    <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
      <div>
        <h2 className="font-semibold">Programme readings</h2>
        <p className="mt-1 text-sm text-[#1A1A1A]/70">
          Order-of-service scripture, hymns, Quran, or scanned pages. Public rows appear on the memorial when format is
          programme or full.
        </p>
      </div>

      <details className="rounded border border-[#3D2B1F]/10 bg-[#FAFAF8] p-3">
        <summary className="cursor-pointer text-sm font-medium text-[#3D2B1F]">
          Add from suggestions ({tradition.replace(/-/g, ' ')})
        </summary>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
          {suggestions.map((s, i) => (
            <li key={`${s.type}-${s.title}-${i}`} className="flex items-center justify-between gap-2">
              <span className="text-[#1A1A1A]/85">
                <span className="text-xs uppercase text-[#C9A02C]">{s.type}</span> — {s.title}
                {s.scripture_reference ? ` (${s.scripture_reference})` : ''}
                {s.hymn_title ? ` (${s.hymn_title})` : ''}
                {s.quran_reference ? ` (${s.quran_reference})` : ''}
              </span>
              <button
                type="button"
                className="shrink-0 text-xs text-[#C9A02C] underline"
                onClick={() => addFromTemplate(s)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </details>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-[#1A1A1A]/70">
          Add blank
          <select
            className="mt-1 block rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
            value={addType}
            onChange={(e) => setAddType(e.target.value as ProgrammeReadingType)}
          >
            {(Object.keys(READING_TYPE_LABEL) as ProgrammeReadingType[]).map((t) => (
              <option key={t} value={t}>
                {READING_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
          onClick={addBlank}
        >
          Add reading
        </button>
      </div>

      {drafts.length === 0 ? (
        <p className="text-sm text-[#1A1A1A]/60">No readings yet — add from suggestions or create a blank entry.</p>
      ) : null}

      <div className="space-y-4">
        {drafts.map((reading, idx) => (
          <div key={reading.id} className="space-y-3 rounded border border-[#3D2B1F]/15 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#1A1A1A]/50">
                {idx + 1}. {READING_TYPE_LABEL[reading.type]}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-xs underline"
                  disabled={idx === 0}
                  onClick={() => moveReading(reading.id, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="text-xs underline"
                  disabled={idx === drafts.length - 1}
                  onClick={() => moveReading(reading.id, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="text-xs text-red-700 underline"
                  onClick={() => removeReading(reading.id)}
                >
                  Remove
                </button>
              </div>
            </div>

            <label className="block text-xs text-[#1A1A1A]/70">
              Label (e.g. Opening hymn)
              <input
                className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                value={reading.title}
                onChange={(e) => updateReading(reading.id, { title: e.target.value })}
              />
            </label>

            <label className="block text-xs text-[#1A1A1A]/70">
              Visibility
              <select
                className="mt-1 block rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                value={reading.visibility ?? 'public'}
                onChange={(e) =>
                  updateReading(reading.id, {
                    visibility: e.target.value as 'public' | 'coordinator_only',
                  })
                }
              >
                <option value="public">Public (programme &amp; print)</option>
                <option value="coordinator_only">Coordinator only</option>
              </select>
            </label>

            {reading.type === 'scripture' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className="flex-1 text-xs text-[#1A1A1A]/70">
                    Reference
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={reading.scripture_reference ?? ''}
                      onChange={(e) => updateReading(reading.id, { scripture_reference: e.target.value })}
                    />
                  </label>
                  <button
                    type="button"
                    className="self-end rounded border border-[#3D2B1F]/25 px-2 py-1.5 text-xs"
                    onClick={() => applyScriptureLookup(reading.id, reading.scripture_reference ?? '')}
                  >
                    Load KJV
                  </button>
                </div>
                <label className="block text-xs text-[#1A1A1A]/70">
                  Text
                  <textarea
                    className="mt-1 min-h-[80px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.scripture_text ?? ''}
                    onChange={(e) => updateReading(reading.id, { scripture_text: e.target.value })}
                  />
                </label>
                <label className="block text-xs text-[#1A1A1A]/70">
                  Translation
                  <input
                    className="mt-1 w-full max-w-xs rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.bible_translation ?? ''}
                    onChange={(e) => updateReading(reading.id, { bible_translation: e.target.value })}
                  />
                </label>
              </div>
            )}

            {reading.type === 'hymn' && (
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-xs text-[#1A1A1A]/70">
                    Hymn book
                    <select
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={reading.hymn_book ?? ''}
                      onChange={(e) => updateReading(reading.id, { hymn_book: e.target.value })}
                    >
                      <option value="">—</option>
                      {PROGRAMME_HYMN_BOOKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-[#1A1A1A]/70">
                    Number
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={reading.hymn_number ?? ''}
                      onChange={(e) => updateReading(reading.id, { hymn_number: e.target.value })}
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="rounded border border-[#3D2B1F]/25 px-2 py-1.5 text-xs"
                      onClick={() =>
                        applyHymnLookup(reading.id, reading.hymn_book ?? '', reading.hymn_number ?? '')
                      }
                    >
                      Load lyrics
                    </button>
                  </div>
                </div>
                <label className="block text-xs text-[#1A1A1A]/70">
                  Hymn title
                  <input
                    className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.hymn_title ?? ''}
                    onChange={(e) => updateReading(reading.id, { hymn_title: e.target.value })}
                  />
                </label>
                <label className="block text-xs text-[#1A1A1A]/70">
                  Lyrics (full text for programme)
                  <textarea
                    className="mt-1 min-h-[100px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.hymn_lyrics ?? ''}
                    onChange={(e) => updateReading(reading.id, { hymn_lyrics: e.target.value })}
                  />
                </label>
              </div>
            )}

            {reading.type === 'quran' && (
              <div className="space-y-2">
                <label className="block text-xs text-[#1A1A1A]/70">
                  Reference
                  <input
                    className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.quran_reference ?? ''}
                    onChange={(e) => updateReading(reading.id, { quran_reference: e.target.value })}
                  />
                </label>
                <label className="block text-xs text-[#1A1A1A]/70">
                  Arabic
                  <textarea
                    className="mt-1 min-h-[60px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    dir="rtl"
                    value={reading.quran_arabic ?? ''}
                    onChange={(e) => updateReading(reading.id, { quran_arabic: e.target.value })}
                  />
                </label>
                <label className="block text-xs text-[#1A1A1A]/70">
                  English translation
                  <textarea
                    className="mt-1 min-h-[60px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.quran_translation ?? ''}
                    onChange={(e) => updateReading(reading.id, { quran_translation: e.target.value })}
                  />
                </label>
              </div>
            )}

            {reading.type === 'upload' && (
              <div className="space-y-2">
                <label className="block text-xs text-[#1A1A1A]/70">
                  Caption
                  <input
                    className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    value={reading.document_caption ?? ''}
                    onChange={(e) => updateReading(reading.id, { document_caption: e.target.value })}
                  />
                </label>
                {reading.document_url ? (
                  <p className="break-all text-xs text-[#1A1A1A]/60">{reading.document_url}</p>
                ) : null}
                <MemorialImageFileInput
                  label={uploadingId === reading.id ? 'Uploading…' : 'Upload programme page (JPEG/PNG/WebP)'}
                  disabled={uploadingId === reading.id}
                  onFiles={(files) => {
                    const file = files?.[0]
                    if (file) void uploadProgrammePage(reading.id, file)
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
          onClick={() => void save()}
        >
          Save programme readings
        </button>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => setDrafts([])}
        >
          Clear all (save to persist)
        </button>
      </div>
    </section>
  )
}
