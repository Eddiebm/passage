'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TRADITION_PRESETS } from '@/lib/tradition-presets'
import type { CreateMemorialForm, MemorialMode, OutputTemplate, SurvivingFamilyMember } from '@/lib/types'
import type { Tradition } from '@/lib/types'
import { SiteHeader } from '@/components/site-header'
import { MemorialImageFileInput } from '@/components/memorial-image-file-input'
import {
  DeathCertificateScanPanel,
  type DeathCertificateApplyPayload,
} from '@/components/death-certificate-scan-panel'
import { PosterScanPanel, type PosterScanApplyPayload } from '@/components/poster-scan-panel'
import { uploadMemorialImage, uploadMemorialImagesSequential } from '@/lib/memorial-image-client'
import { validateMemorialImageFile } from '@/lib/memorial-image'
import { GallerySizeWarning } from '@/components/gallery-size-warning'
const STEPS = [
  'How you\'ll use Passage',
  'Tradition',
  'Deceased',
  'Family',
  'Events',
  'Fundraising',
  'Coordinator',
  'Review',
] as const

const OUTPUT_TEMPLATE_CHOICES: { value: OutputTemplate; title: string; body: string }[] = [
  {
    value: 'notice',
    title: 'Notice card',
    body: 'Minimal layout for announcement-first sharing.',
  },
  {
    value: 'programme',
    title: 'Programme sheet',
    body: 'Denser typography for order-of-service style pages.',
  },
  {
    value: 'banner_classic',
    title: 'Banner (classic)',
    body: 'Strong hero scale — pairs with `/banner` print routes.',
  },
]

const MODE_CHOICES: { value: MemorialMode; title: string; body: string }[] = [
  {
    value: 'notice',
    title: 'Notice only',
    body: 'A calm, single-scroll announcement — share dates and words; keep vendor lists and programme detail tucked away in the family portal.',
  },
  {
    value: 'programme',
    title: 'Programme / brochure',
    body: 'Adds remembrance readings and the public programme view — for families who want an order of service online without full coordination.',
  },
  {
    value: 'full',
    title: 'Full coordination',
    body: 'Everything Passage offers on the public page — key contacts, gallery, programme, tributes, and closing meetings when you mark them public.',
  },
]

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
    memorial_mode: 'notice',
    output_template: 'notice',
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
    coordinator_recovery_email: '',
  })

  const [primaryFile, setPrimaryFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [showPhotoUrlFallback, setShowPhotoUrlFallback] = useState(false)

  const primaryPreviewUrl = useMemo(() => {
    if (!primaryFile) return null
    return URL.createObjectURL(primaryFile)
  }, [primaryFile])

  useEffect(() => {
    return () => {
      if (primaryPreviewUrl) URL.revokeObjectURL(primaryPreviewUrl)
    }
  }, [primaryPreviewUrl])

  const tradition = TRADITION_PRESETS[form.tradition]

  const canNext = useMemo(() => {
    if (step === 0) return true
    if (step === 1) return true
    if (step === 2) {
      if (!form.deceased_name.trim() || !form.date_of_passing.trim()) return false
      if (tradition.photoRequired && !form.photo_url?.trim() && !primaryFile) return false
      return true
    }
    if (step === 6) {
      return (
        form.coordinator_name.trim().length > 0 &&
        form.coordinator_whatsapp.trim().length > 0 &&
        form.coordinator_email.includes('@')
      )
    }
    return true
  }, [step, form, tradition.photoRequired, primaryFile])

  function update<K extends keyof CreateMemorialForm>(key: K, value: CreateMemorialForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function applyDeathCertScan(payload: DeathCertificateApplyPayload) {
    if (payload.deceased_name) update('deceased_name', payload.deceased_name)
    if (payload.date_of_birth) update('date_of_birth', payload.date_of_birth)
    if (payload.date_of_passing) update('date_of_passing', payload.date_of_passing)
    if (payload.place_of_passing) update('place_of_passing', payload.place_of_passing)
    if (payload.age != null) update('age', String(payload.age))
    setUploadNotice('Applied certificate suggestions — please review every field.')
  }

  function applyPosterScan(payload: PosterScanApplyPayload) {
    if (payload.deceased_name) update('deceased_name', payload.deceased_name)
    if (payload.deceased_title) update('deceased_title', payload.deceased_title)
    if (payload.deceased_family_house) update('deceased_family_house', payload.deceased_family_house)
    if (payload.deceased_community) update('deceased_community', payload.deceased_community)
    if (payload.date_of_birth) update('date_of_birth', payload.date_of_birth)
    if (payload.date_of_passing) update('date_of_passing', payload.date_of_passing)
    if (payload.biography) update('biography', payload.biography)
    if (payload.events?.length) {
      update('events', payload.events)
    }
    setUploadNotice('Applied scan suggestions — please review every field before continuing.')
  }

  function stagePrimaryFile(file: File | null) {
    if (!file) {
      setPrimaryFile(null)
      return
    }
    const check = validateMemorialImageFile(file)
    if (!check.ok) {
      setUploadNotice(check.error)
      return
    }
    setUploadNotice(null)
    setPrimaryFile(file)
  }

  function stageGalleryFiles(files: File[]) {
    const valid: File[] = []
    for (const f of files) {
      const check = validateMemorialImageFile(f)
      if (!check.ok) {
        setUploadNotice(check.error)
        return
      }
      valid.push(f)
    }
    if (valid.length) {
      setUploadNotice(null)
      setGalleryFiles((prev) => [...prev, ...valid])
    }
  }

  async function submit() {
    setSaving(true)
    setUploadNotice(null)
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
        memorial?: { slug: string }
        coordinator_pin?: string
        memorial_url?: string
        edit_url?: string
        error?: string
      }
      if (!res.ok) {
        alert(json.error || 'Could not create memorial')
        return
      }
      if (json.coordinator_pin && json.memorial_url && json.edit_url && json.memorial?.slug) {
        const slug = json.memorial.slug
        const pin = json.coordinator_pin
        if (primaryFile || galleryFiles.length > 0) {
          const failures: string[] = []
          if (primaryFile) {
            setUploadProgress('Uploading portrait…')
            const up = await uploadMemorialImage(slug, pin, primaryFile, 'primary')
            if (!up.ok) failures.push(`Portrait: ${up.error}`)
          }
          if (galleryFiles.length > 0) {
            const results = await uploadMemorialImagesSequential(
              slug,
              pin,
              galleryFiles,
              'gallery',
              (current, total, name) => {
                setUploadProgress(`Uploading gallery ${current} of ${total}: ${name}`)
              },
            )
            for (const r of results) {
              if (!r.ok) failures.push(`${r.name}: ${r.error}`)
            }
          }
          setUploadProgress(null)
          if (failures.length) {
            setUploadNotice(
              `${failures.join(' · ')} Your memorial was created — open the edit portal to retry uploads.`,
            )
          }
        }
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
          {uploadNotice && (
            <p className="rounded-lg border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              {uploadNotice}
            </p>
          )}
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
            <div className="space-y-4">
              <p className="text-sm text-[#1A1A1A]/70">
                Choose how much appears on the public memorial. You can change this later in the family edit portal.
              </p>
              <div className="grid gap-3">
                {MODE_CHOICES.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => update('memorial_mode', m.value)}
                    className={`min-h-[44px] rounded-lg border p-4 text-left text-sm transition ${
                      form.memorial_mode === m.value
                        ? 'border-[#C9A02C] bg-[#C9A02C]/10'
                        : 'border-[#3D2B1F]/15 bg-white hover:border-[#C9A02C]/50'
                    }`}
                  >
                    <p className="font-medium">{m.title}</p>
                    <p className="mt-2 text-xs text-[#1A1A1A]/65 leading-relaxed">{m.body}</p>
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]/80 pt-2">Print &amp; page template</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {OUTPUT_TEMPLATE_CHOICES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => update('output_template', t.value)}
                    className={`min-h-[44px] rounded-lg border p-3 text-left text-sm transition ${
                      (form.output_template ?? 'notice') === t.value
                        ? 'border-[#C9A02C] bg-[#C9A02C]/10'
                        : 'border-[#3D2B1F]/15 bg-white hover:border-[#C9A02C]/50'
                    }`}
                  >
                    <p className="font-medium">{t.title}</p>
                    <p className="mt-1 text-[10px] text-[#1A1A1A]/60 leading-snug">{t.body}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(TRADITION_PRESETS) as Tradition[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => update('tradition', key)}
                  className={`min-h-[44px] rounded-lg border p-4 text-left text-sm transition ${
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

          {step === 2 && (
            <div className="space-y-4">
              <PosterScanPanel
                label="Scan poster"
                hint="Upload a photo of the funeral poster or announcement. We suggest fields — you choose what to apply."
                onFileSelected={(file) => stagePrimaryFile(file)}
                onApply={applyPosterScan}
                onError={(msg) => setUploadNotice(msg)}
              />
              <DeathCertificateScanPanel
                label="Scan death certificate (optional)"
                onApply={applyDeathCertScan}
                onError={(msg) => setUploadNotice(msg)}
              />
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
              <Field label="Place of passing" value={form.place_of_passing ?? ''} onChange={(v) => update('place_of_passing', v)} />
              <Field label="Age" value={form.age ?? ''} onChange={(v) => update('age', v)} />
              <div className="rounded border border-[#3D2B1F]/15 bg-white p-4 space-y-3">
                <p className="text-xs font-medium text-[#1A1A1A]/70">Portrait photo</p>
                <p className="text-xs text-[#1A1A1A]/60">
                  Upload from your phone or computer (JPEG, PNG, or WebP, max 8MB). Files upload right after you create the draft.
                </p>
                <MemorialImageFileInput
                  label="Upload portrait photo"
                  onFiles={(files) => stagePrimaryFile(files?.[0] ?? null)}
                />
                {(primaryPreviewUrl || form.photo_url?.trim()) && (
                  <div className="flex items-start gap-3">
                    <Image
                      src={primaryPreviewUrl || (form.photo_url as string)}
                      alt="Portrait preview"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded border border-[#3D2B1F]/20 object-cover"
                      unoptimized
                    />
                    <div className="flex flex-col gap-2 text-sm">
                      {primaryFile && (
                        <button
                          type="button"
                          className="text-[#C9A02C] underline"
                          onClick={() => stagePrimaryFile(null)}
                        >
                          Remove selected file
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className="text-xs text-[#C9A02C] underline"
                  onClick={() => setShowPhotoUrlFallback((v) => !v)}
                >
                  {showPhotoUrlFallback ? 'Hide URL fallback' : 'Paste image URL instead (fallback)'}
                </button>
                {showPhotoUrlFallback && (
                  <Field
                    label="Image URL"
                    value={form.photo_url || ''}
                    onChange={(v) => update('photo_url', v)}
                  />
                )}
              </div>
              {uploadNotice && step === 2 && (
                <p className="rounded border border-amber-600/35 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  {uploadNotice}
                </p>
              )}
              <div className="rounded border border-[#3D2B1F]/15 bg-white p-4 space-y-2">
                <p className="text-xs font-medium text-[#1A1A1A]/70">Gallery (optional)</p>
                <MemorialImageFileInput
                  label="Add to gallery (select multiple)"
                  multiple
                  onFiles={(files) => stageGalleryFiles(files ? Array.from(files) : [])}
                />
                {galleryFiles.length >= 40 && <GallerySizeWarning />}
                {galleryFiles.length > 0 && (
                  <ul className="space-y-1 text-xs text-[#1A1A1A]/80">
                    {galleryFiles.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          className="shrink-0 text-[#C9A02C] underline"
                          onClick={() => setGalleryFiles((prev) => prev.filter((_, j) => j !== i))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

          {step === 3 && (
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

          {step === 4 && (
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

          {step === 5 && (
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

          {step === 6 && (
            <div className="space-y-4">
              <Field label="Coordinator name" value={form.coordinator_name} onChange={(v) => update('coordinator_name', v)} />
              <Field label="WhatsApp (international format)" value={form.coordinator_whatsapp} onChange={(v) => update('coordinator_whatsapp', v)} />
              <Field label="Email" type="email" value={form.coordinator_email} onChange={(v) => update('coordinator_email', v)} />
              <Field
                label="PIN recovery email (optional)"
                type="email"
                value={form.coordinator_recovery_email ?? ''}
                onChange={(v) => update('coordinator_recovery_email', v)}
              />
              <p className="text-xs text-[#1A1A1A]/60">
                Used for &quot;Forgot PIN?&quot; in the edit portal. Defaults to coordinator email if blank.
              </p>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3 rounded-lg border border-[#3D2B1F]/15 bg-white p-4 text-sm leading-relaxed">
              <p>
                <strong>Public format:</strong>{' '}
                {MODE_CHOICES.find((m) => m.value === form.memorial_mode)?.title ?? form.memorial_mode}
              </p>
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
              <p className="text-xs text-[#1A1A1A]/55">
                After publish, add scripture, hymns, and Quran readings from the family edit portal (Programme readings
                section).
              </p>
              <p className="text-xs text-[#1A1A1A]/55">
                Memorial content is stored as described in our{' '}
                <Link href="/privacy" className="text-[#C9A02C] underline">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] text-[#1A1A1A]/45">
          <Link href="/privacy" className="underline hover:text-[#C9A02C]">
            Privacy
          </Link>
        </p>

        <div className="mt-4 flex justify-between gap-4">
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
              {saving ? (uploadProgress || 'Creating…') : 'Create draft'}
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
