'use client'

import { useRef, useState } from 'react'
import { yearOrIsoToDate, type DeathCertificateResult } from '@/lib/ocr'

export type DeathCertificateApplyPayload = {
  deceased_name?: string
  date_of_birth?: string
  date_of_passing?: string
  place_of_passing?: string
  age?: number
}

type ApplyField =
  | 'deceased_name'
  | 'date_of_birth'
  | 'date_of_passing'
  | 'place_of_passing'
  | 'age'

interface Props {
  label?: string
  hint?: string
  slug?: string
  pin?: string
  onApply: (payload: DeathCertificateApplyPayload) => void
  onError?: (msg: string) => void
}

type State = 'idle' | 'scanning' | 'review' | 'error'

function defaultSelected(): Record<ApplyField, boolean> {
  return {
    deceased_name: true,
    date_of_passing: true,
    place_of_passing: true,
    age: true,
    date_of_birth: false,
  }
}

export function DeathCertificateScanPanel({
  label = 'Scan death certificate',
  hint = 'Optional. Review each field before applying — nothing saves until you confirm.',
  slug,
  pin,
  onApply,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<State>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [result, setResult] = useState<DeathCertificateResult | null>(null)
  const [selected, setSelected] = useState<Record<ApplyField, boolean>>(defaultSelected)

  async function handleFile(file: File) {
    setErrMsg(null)
    setState('scanning')

    const form = new FormData()
    form.append('file', file)
    form.append('doc_type', 'death_certificate')
    if (slug) form.append('slug', slug)
    if (pin) form.append('pin', pin)

    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: form })
      const json = (await res.json()) as {
        success: boolean
        data: DeathCertificateResult
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

  function buildPayload(data: DeathCertificateResult): DeathCertificateApplyPayload {
    const payload: DeathCertificateApplyPayload = {}
    if (selected.deceased_name && data.full_name) payload.deceased_name = data.full_name
    const dop = yearOrIsoToDate(data.date_of_death, null)
    if (selected.date_of_passing && dop) payload.date_of_passing = dop
    if (selected.place_of_passing && data.place_of_death) {
      payload.place_of_passing = data.place_of_death
    }
    if (selected.age && data.age != null && Number.isFinite(data.age)) {
      payload.age = data.age
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
          {busy ? 'Reading certificate…' : label}
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
            Tick fields to copy into the memorial, then apply.
          </p>
          <ScanRow
            field="deceased_name"
            label="Full name"
            value={result.full_name}
            checked={selected.deceased_name}
            onToggle={toggle}
          />
          <ScanRow
            field="date_of_passing"
            label="Date of passing"
            value={yearOrIsoToDate(result.date_of_death, null)}
            checked={selected.date_of_passing}
            onToggle={toggle}
          />
          <ScanRow
            field="place_of_passing"
            label="Place of passing"
            value={result.place_of_death}
            checked={selected.place_of_passing}
            onToggle={toggle}
          />
          <ScanRow
            field="age"
            label="Age"
            value={result.age != null ? String(result.age) : null}
            checked={selected.age}
            onToggle={toggle}
          />
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
}: {
  field: ApplyField
  label: string
  value: string | null
  checked: boolean
  onToggle: (f: ApplyField) => void
}) {
  if (!value?.trim()) return null
  return (
    <label className="flex gap-2 text-xs items-center">
      <input type="checkbox" checked={checked} onChange={() => onToggle(field)} />
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-[#1A1A1A]/65">{value}</span>
      </span>
    </label>
  )
}
