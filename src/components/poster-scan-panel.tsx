'use client'

/**
 * Scan a funeral poster / announcement photo — review extracted fields before applying.
 * Never auto-publishes; coordinator confirms each group.
 */

import { useRef, useState } from 'react'
import { yearOrIsoToDate, type FuneralPosterResult } from '@/lib/ocr'
import type { ContactCard } from '@/lib/types'
import type { CreateMemorialForm } from '@/lib/types'

export type PosterScanApplyPayload = {
  deceased_name?: string
  deceased_title?: string
  deceased_family_house?: string
  deceased_community?: string
  date_of_birth?: string
  date_of_passing?: string
  biography?: string
  announcement_text?: string
  events?: CreateMemorialForm['events']
  public_contacts?: ContactCard[]
}

type ApplyField =
  | 'deceased_name'
  | 'deceased_title'
  | 'deceased_family_house'
  | 'deceased_community'
  | 'date_of_birth'
  | 'date_of_passing'
  | 'biography'
  | 'announcement_text'
  | 'events'
  | 'contacts'

interface Props {
  label?: string
  hint?: string
  slug?: string
  pin?: string
  /** Optional: stage scanned image as portrait or gallery file in create flow */
  onFileSelected?: (file: File) => void
  onApply: (payload: PosterScanApplyPayload) => void
  onError?: (msg: string) => void
}

type State = 'idle' | 'scanning' | 'review' | 'error'

function defaultSelected(): Record<ApplyField, boolean> {
  return {
    deceased_name: true,
    deceased_title: true,
    deceased_family_house: true,
    deceased_community: true,
    date_of_birth: true,
    date_of_passing: true,
    biography: false,
    announcement_text: true,
    events: true,
    contacts: true,
  }
}

export function PosterScanPanel({
  label = 'Scan poster',
  hint = 'Photo of a funeral poster or announcement. Review suggestions before applying — nothing is saved until you confirm.',
  slug,
  pin,
  onFileSelected,
  onApply,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<State>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [result, setResult] = useState<FuneralPosterResult | null>(null)
  const [selected, setSelected] = useState<Record<ApplyField, boolean>>(defaultSelected)

  async function handleFile(file: File) {
    setErrMsg(null)
    setState('scanning')
    onFileSelected?.(file)

    const form = new FormData()
    form.append('file', file)
    form.append('doc_type', 'funeral_poster')
    if (slug) form.append('slug', slug)
    if (pin) form.append('pin', pin)

    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: form })
      const json = (await res.json()) as {
        success: boolean
        data: FuneralPosterResult
        error?: string
      }
      if (!res.ok || !json.success) throw new Error(json.error ?? `Error ${res.status}`)
      setResult(json.data)
      setSelected(defaultSelected())
      setState('review')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Scan failed'
      setErrMsg(msg)
      setState('error')
      onError?.(msg)
    }
  }

  function buildPayload(data: FuneralPosterResult): PosterScanApplyPayload {
    const payload: PosterScanApplyPayload = {}
    if (selected.deceased_name && data.deceased_name) payload.deceased_name = data.deceased_name
    if (selected.deceased_title && data.deceased_title) payload.deceased_title = data.deceased_title
    if (selected.deceased_family_house && data.deceased_family_house) {
      payload.deceased_family_house = data.deceased_family_house
    }
    if (selected.deceased_community && data.deceased_community) {
      payload.deceased_community = data.deceased_community
    }
    const dob = yearOrIsoToDate(data.date_of_birth, data.birth_year)
    const dop = yearOrIsoToDate(data.date_of_passing, data.death_year)
    if (selected.date_of_birth && dob) payload.date_of_birth = dob
    if (selected.date_of_passing && dop) payload.date_of_passing = dop
    if (selected.biography && data.announcement_text) payload.biography = data.announcement_text
    if (selected.announcement_text && data.announcement_text) {
      payload.announcement_text = data.announcement_text
    }
    if (selected.events && data.events?.length) {
      payload.events = data.events
        .filter((e) => e.title?.trim())
        .map((e, i) => ({
          title: e.title.trim(),
          event_date: e.event_date ?? '',
          location: e.location ?? '',
          online_link: '',
          notes: e.notes ?? '',
          sort_order: i,
        }))
    }
    if (selected.contacts && data.contact_hints?.length) {
      payload.public_contacts = data.contact_hints
        .filter((c) => c.name?.trim())
        .map((c) => ({
          name: c.name.trim(),
          role_label: c.role_label ?? undefined,
          phone: c.phone ?? undefined,
          email: c.email ?? undefined,
        }))
    }
    return payload
  }

  function apply() {
    if (!result) return
    onApply(buildPayload(result))
    setState('idle')
    setResult(null)
  }

  function toggle(field: ApplyField) {
    setSelected((s) => ({ ...s, [field]: !s[field] }))
  }

  const busy = state === 'scanning'

  return (
    <div className="rounded border border-[#3D2B1F]/15 bg-[#FAFAF8]/80 p-4 space-y-3">
      <div>
        <p className="text-xs font-medium text-[#1A1A1A]/80">{label}</p>
        {hint && <p className="text-xs text-[#1A1A1A]/55 mt-1">{hint}</p>}
      </div>

      {state !== 'review' && (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="min-h-[44px] w-full rounded-md border border-[#C9A02C]/60 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A1A] transition hover:border-[#C9A02C] disabled:opacity-60"
        >
          {busy ? 'Reading poster…' : label}
        </button>
      )}

      {state === 'error' && errMsg && (
        <p className="text-xs text-red-700" role="alert">
          {errMsg}
        </p>
      )}

      {state === 'review' && result && (
        <div className="space-y-3 rounded border border-[#3D2B1F]/12 bg-white p-3 text-sm">
          <p className="text-xs font-medium text-[#1A1A1A]/75">
            Review extracted text — tick what to copy into the form, then apply. Nothing publishes until you save the memorial.
          </p>

          <ScanRow
            field="deceased_name"
            label="Full name"
            value={result.deceased_name}
            checked={selected.deceased_name}
            onToggle={toggle}
          />
          <ScanRow
            field="deceased_title"
            label="Title"
            value={result.deceased_title}
            checked={selected.deceased_title}
            onToggle={toggle}
          />
          <ScanRow
            field="deceased_family_house"
            label="Family house"
            value={result.deceased_family_house}
            checked={selected.deceased_family_house}
            onToggle={toggle}
          />
          <ScanRow
            field="deceased_community"
            label="Community"
            value={result.deceased_community}
            checked={selected.deceased_community}
            onToggle={toggle}
          />
          <ScanRow
            field="date_of_passing"
            label="Date of passing"
            value={yearOrIsoToDate(result.date_of_passing, result.death_year) || null}
            checked={selected.date_of_passing}
            onToggle={toggle}
          />
          <ScanRow
            field="date_of_birth"
            label="Date of birth"
            value={yearOrIsoToDate(result.date_of_birth, result.birth_year) || null}
            checked={selected.date_of_birth}
            onToggle={toggle}
          />
          <ScanRow
            field="announcement_text"
            label="Announcement excerpt"
            value={result.announcement_text?.slice(0, 200) ?? null}
            checked={selected.announcement_text}
            onToggle={toggle}
            multiline
          />
          {result.events?.length > 0 && (
            <label className="flex gap-2 text-xs">
              <input
                type="checkbox"
                checked={selected.events}
                onChange={() => toggle('events')}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Events ({result.events.length})</span>
                <ul className="mt-1 list-inside list-disc text-[#1A1A1A]/65">
                  {result.events.slice(0, 5).map((e, i) => (
                    <li key={i}>
                      {e.title}
                      {e.event_date ? ` — ${e.event_date}` : ''}
                    </li>
                  ))}
                </ul>
              </span>
            </label>
          )}
          {result.contact_hints?.length > 0 && (
            <label className="flex gap-2 text-xs">
              <input
                type="checkbox"
                checked={selected.contacts}
                onChange={() => toggle('contacts')}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Contact hints ({result.contact_hints.length})</span>
                <ul className="mt-1 list-inside list-disc text-[#1A1A1A]/65">
                  {result.contact_hints.slice(0, 4).map((c, i) => (
                    <li key={i}>
                      {c.name}
                      {c.phone ? ` · ${c.phone}` : ''}
                    </li>
                  ))}
                </ul>
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
              onClick={apply}
            >
              Apply selected
            </button>
            <button
              type="button"
              className="rounded-md border border-[#3D2B1F]/20 px-4 py-2 text-sm"
              onClick={() => {
                setState('idle')
                setResult(null)
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleFile(f)
          e.target.value = ''
        }}
        aria-label={label}
      />
    </div>
  )
}

function ScanRow({
  field,
  label,
  value,
  checked,
  onToggle,
  multiline,
}: {
  field: ApplyField
  label: string
  value: string | null
  checked: boolean
  onToggle: (f: ApplyField) => void
  multiline?: boolean
}) {
  if (!value?.trim()) return null
  return (
    <label className={`flex gap-2 text-xs ${multiline ? 'items-start' : 'items-center'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(field)}
        className={multiline ? 'mt-0.5' : undefined}
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-[#1A1A1A]/65">{value}</span>
      </span>
    </label>
  )
}
