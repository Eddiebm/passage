'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TRADITION_PRESETS } from '@/lib/tradition-presets'
import type { CreateMemorialForm, SurvivingFamilyMember } from '@/lib/types'
import type { Tradition } from '@/lib/types'
import { SiteHeader } from '@/components/site-header'

const STEPS = [
  'Tradition',
  'Deceased',
  'Family',
  'Events',
  'Fundraising',
  'Coordinator',
  'Review',
] as const

const emptyMember: SurvivingFamilyMember = { title: '', name: '', note: '' }

const emptyEvent = {
  title: '',
  event_date: '',
  location: '',
  online_link: '',
  notes: '',
  sort_order: 0,
}

export function CreateWizard() {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{
    coordinator_pin: string
    memorial_url: string
    edit_url: string
  } | null>(null)

  const [form, setForm] = useState<CreateMemorialForm>({
    tradition: 'ghana-christian',
    deceased_name: '',
    deceased_title: '',
    deceased_family_house: '',
    deceased_community: '',
    date_of_birth: '',
    date_of_passing: '',
    biography: '',
    surviving_family: [{ ...emptyMember }],
    allied_families: [],
    events: [{ ...emptyEvent, sort_order: 0 }],
    fundraising_active: false,
    fundraising_goal: '',
    fundraising_currency: 'GHS',
    fundraising_label: '',
    fundraising_appeal: '',
    photo_url: '',
    coordinator_name: '',
    coordinator_whatsapp: '',
    coordinator_email: '',
  })

  const tradition = TRADITION_PRESETS[form.tradition]

  const canNext = useMemo(() => {
    if (step === 0) return true
    if (step === 1) {
      if (!form.deceased_name.trim() || !form.date_of_passing.trim()) return false
      if (tradition.photoRequired && !form.photo_url?.trim()) return false
      return true
    }
    if (step === 5) {
      return (
        form.coordinator_name.trim().length > 0 &&
        form.coordinator_whatsapp.trim().length > 0 &&
        form.coordinator_email.includes('@')
      )
    }
    return true
  }, [step, form, tradition.photoRequired])

  function update<K extends keyof CreateMemorialForm>(key: K, value: CreateMemorialForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit() {
    setSaving(true)
    try {
      const res = await fetch('/api/memorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          allied_families: form.allied_families,
        }),
      })
      const json = (await res.json()) as {
        coordinator_pin?: string
        memorial_url?: string
        edit_url?: string
        error?: string
      }
      if (!res.ok) {
        alert(json.error || 'Could not create memorial')
        return
      }
      if (json.coordinator_pin && json.memorial_url && json.edit_url) {
        setResult({
          coordinator_pin: json.coordinator_pin,
          memorial_url: json.memorial_url,
          edit_url: json.edit_url,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-full bg-[#1A1A1A] text-[#FAFAF8]">
        <SiteHeader />
        <div className="mx-auto max-w-xl space-y-6 px-4 py-16">
          <h1 className="text-2xl font-semibold">Memorial draft created</h1>
          <p className="text-sm text-[#FAFAF8]/80">
            Save your coordinator PIN somewhere safe. It is not emailed in this MVP.
          </p>
          <div className="rounded-lg border border-[#C9A02C]/40 bg-[#3D2B1F]/40 p-4">
            <p className="text-xs uppercase tracking-wider text-[#C9A02C]">Coordinator PIN</p>
            <p className="mt-2 text-3xl font-mono font-semibold tracking-widest">{result.coordinator_pin}</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link className="text-[#C9A02C] underline" href={result.memorial_url}>
              View memorial draft
            </Link>
            <Link className="text-[#C9A02C] underline" href={result.edit_url}>
              Open family edit portal
            </Link>
            <Link className="text-[#FAFAF8]/70 underline" href="/">
              Back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A02C]">Step {step + 1} of {STEPS.length}</p>
        <h1 className="mt-2 text-3xl font-semibold">Create a memorial</h1>
        <p className="mt-2 text-sm text-[#1A1A1A]/70">{STEPS[step]}</p>

        <div className="mt-8 space-y-6">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(TRADITION_PRESETS) as Tradition[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => update('tradition', key)}
                  className={`rounded-lg border p-4 text-left text-sm transition ${
                    form.tradition === key
                      ? 'border-[#C9A02C] bg-[#C9A02C]/10'
                      : 'border-[#3D2B1F]/15 bg-white hover:border-[#C9A02C]/50'
                  }`}
                >
                  <p className="font-medium">{TRADITION_PRESETS[key].label}</p>
                  <p className="mt-2 text-xs text-[#1A1A1A]/60">{TRADITION_PRESETS[key].openingLine.slice(0, 80)}…</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Full name" value={form.deceased_name} onChange={(v) => update('deceased_name', v)} />
              {tradition.includeTraditionalTitle && (
                <Field label="Traditional / formal title" value={form.deceased_title} onChange={(v) => update('deceased_title', v)} />
              )}
              {tradition.includeFamilyHouse && (
                <Field label="Family house" value={form.deceased_family_house} onChange={(v) => update('deceased_family_house', v)} />
              )}
              <Field label="Community" value={form.deceased_community} onChange={(v) => update('deceased_community', v)} />
              <Field label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => update('date_of_birth', v)} />
              <Field label="Date of passing" type="date" value={form.date_of_passing} onChange={(v) => update('date_of_passing', v)} required />
              <Field
                label={tradition.photoRequired ? 'Photo URL (required for this tradition)' : 'Photo URL'}
                value={form.photo_url || ''}
                onChange={(v) => update('photo_url', v)}
              />
              <div>
                <label className="text-xs font-medium text-[#1A1A1A]/70">Biography</label>
                <textarea
                  className="mt-1 min-h-[100px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                  value={form.biography}
                  onChange={(e) => update('biography', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#1A1A1A]/70">Surviving family</p>
              {form.surviving_family.map((m, i) => (
                <div key={i} className="space-y-2 rounded border border-[#3D2B1F]/15 bg-white p-3">
                  <Field
                    label="Role (e.g. Wife, Son)"
                    value={m.title}
                    onChange={(v) => {
                      const next = [...form.surviving_family]
                      next[i] = { ...next[i], title: v }
                      update('surviving_family', next)
                    }}
                  />
                  <Field
                    label="Name"
                    value={m.name}
                    onChange={(v) => {
                      const next = [...form.surviving_family]
                      next[i] = { ...next[i], name: v }
                      update('surviving_family', next)
                    }}
                  />
                  <Field
                    label="Note (optional)"
                    value={m.note || ''}
                    onChange={(v) => {
                      const next = [...form.surviving_family]
                      next[i] = { ...next[i], note: v }
                      update('surviving_family', next)
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-[#C9A02C] underline"
                onClick={() => update('surviving_family', [...form.surviving_family, { ...emptyMember }])}
              >
                Add family member
              </button>

              {tradition.includeAlliedFamilies && (
                <div>
                  <label className="text-xs font-medium text-[#1A1A1A]/70">Allied families (one per line)</label>
                  <textarea
                    className="mt-1 min-h-[80px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                    value={form.allied_families.join('\n')}
                    onChange={(e) =>
                      update(
                        'allied_families',
                        e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {form.events.map((ev, i) => (
                <div key={i} className="space-y-2 rounded border border-[#3D2B1F]/15 bg-white p-3">
                  <Field
                    label="Event title"
                    value={ev.title}
                    onChange={(v) => {
                      const next = [...form.events]
                      next[i] = { ...next[i], title: v, sort_order: i }
                      update('events', next)
                    }}
                  />
                  <Field
                    label="Date & time (local)"
                    type="datetime-local"
                    value={ev.event_date?.slice(0, 16) || ''}
                    onChange={(v) => {
                      const next = [...form.events]
                      next[i] = { ...next[i], event_date: v ? new Date(v).toISOString() : '' }
                      update('events', next)
                    }}
                  />
                  <Field
                    label="Location"
                    value={ev.location || ''}
                    onChange={(v) => {
                      const next = [...form.events]
                      next[i] = { ...next[i], location: v }
                      update('events', next)
                    }}
                  />
                  <Field
                    label="Online link"
                    value={ev.online_link || ''}
                    onChange={(v) => {
                      const next = [...form.events]
                      next[i] = { ...next[i], online_link: v }
                      update('events', next)
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-[#C9A02C] underline"
                onClick={() =>
                  update('events', [...form.events, { ...emptyEvent, sort_order: form.events.length }])
                }
              >
                Add event
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.fundraising_active}
                  onChange={(e) => update('fundraising_active', e.target.checked)}
                />
                Enable fundraising on this memorial
              </label>
              {form.fundraising_active && (
                <>
                  <Field label="Goal amount" value={form.fundraising_goal} onChange={(v) => update('fundraising_goal', v)} />
                  <div>
                    <label className="text-xs font-medium text-[#1A1A1A]/70">Currency</label>
                    <select
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                      value={form.fundraising_currency}
                      onChange={(e) => update('fundraising_currency', e.target.value)}
                    >
                      <option value="GHS">GHS</option>
                      <option value="NGN">NGN</option>
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <Field label="Label (e.g. Funeral expenses)" value={form.fundraising_label} onChange={(v) => update('fundraising_label', v)} />
                  <div>
                    <label className="text-xs font-medium text-[#1A1A1A]/70">Appeal (optional — AI can expand)</label>
                    <textarea
                      className="mt-1 min-h-[80px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                      value={form.fundraising_appeal}
                      onChange={(e) => update('fundraising_appeal', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Field label="Coordinator name" value={form.coordinator_name} onChange={(v) => update('coordinator_name', v)} />
              <Field label="WhatsApp (international format)" value={form.coordinator_whatsapp} onChange={(v) => update('coordinator_whatsapp', v)} />
              <Field label="Email" type="email" value={form.coordinator_email} onChange={(v) => update('coordinator_email', v)} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3 rounded-lg border border-[#3D2B1F]/15 bg-white p-4 text-sm leading-relaxed">
              <p>
                <strong>Tradition:</strong> {tradition.label}
              </p>
              <p>
                <strong>Deceased:</strong> {form.deceased_name}
              </p>
              <p>
                <strong>Coordinator:</strong> {form.coordinator_name} · {form.coordinator_email}
              </p>
              <p className="text-[#1A1A1A]/70">
                By continuing, you confirm the family will review all generated text and programme details
                before the memorial is submitted for internal approval.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-between gap-4">
          <button
            type="button"
            className="rounded-md border border-[#3D2B1F]/20 px-4 py-2 text-sm"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8] disabled:opacity-40"
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext || saving}
              className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A] disabled:opacity-40"
              onClick={submit}
            >
              {saving ? 'Creating…' : 'Create draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#1A1A1A]/70">{label}</label>
      <input
        type={type}
        required={required}
        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
