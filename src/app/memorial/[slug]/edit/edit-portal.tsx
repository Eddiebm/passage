'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type {
  ContactCard,
  LastBankReconciliation,
  MemorialEvent,
  MemorialMode,
  MemorialPledge,
  MemorialPledgeStatus,
  MemorialTask,
  MemorialWithDetails,
  OutputTemplate,
  VisualTheme,
  Remembrance,
  Stakeholder,
  StakeholderCategory,
  Tribute,
  WindDownMeeting,
} from '@/lib/types'
import {
  STAKEHOLDER_CATEGORY_LABEL,
  normalizeMemorialMode,
  normalizeOutputTemplate,
  normalizeVisualTheme,
} from '@/lib/memorial-hydrate'
import { VisualThemePicker } from '@/components/visual-theme-picker'
import { memorialAbsoluteUrl } from '@/lib/memorial-share'
import { formatPledgeAmountMinor } from '@/lib/memorial-pledges'
import {
  buildPledgeReminderCopyPack,
  buildReminderCopyPack,
  coordinatorPublicContactLine,
  type ReminderEmailTemplate,
} from '@/lib/reminder-copy'
import type { Contribution } from '@/lib/types'
import { ScheduleReminderControls } from '@/components/schedule-reminder-controls'
import { SiteHeader } from '@/components/site-header'
import { GallerySizeWarning } from '@/components/gallery-size-warning'
import { MemorialImageFileInput } from '@/components/memorial-image-file-input'
import { BankReconciliationPanel } from '@/components/bank-reconciliation-panel'
import {
  DeathCertificateScanPanel,
  type DeathCertificateApplyPayload,
} from '@/components/death-certificate-scan-panel'
import { PosterScanPanel, type PosterScanApplyPayload } from '@/components/poster-scan-panel'
import { ProgrammeReadingsEditor } from '@/components/programme-readings-editor'
import {
  uploadMemorialImage,
  uploadMemorialImagesSequential,
  uploadMemorialTributeImage,
} from '@/lib/memorial-image-client'
import { validateMemorialImageFile } from '@/lib/memorial-image'

const OUTPUT_TEMPLATE_CHOICES: { value: OutputTemplate; title: string; body: string }[] = [
  {
    value: 'notice',
    title: 'Notice card',
    body: 'Minimal typography — calm announcement-first layout on the public page and print sheet.',
  },
  {
    value: 'programme',
    title: 'Programme sheet',
    body: 'Denser type and tighter rhythm — suited to order-of-service style pages.',
  },
  {
    value: 'banner_classic',
    title: 'Banner (classic)',
    body: 'Hero emphasis for `/banner` routes; public page uses a slightly larger headline scale.',
  },
]

function formatAccraLocal(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

const STAKEHOLDER_CATEGORIES = Object.keys(STAKEHOLDER_CATEGORY_LABEL) as StakeholderCategory[]

function newStakeholder(): Stakeholder {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `st-${Date.now()}`,
    category: 'other',
    name: '',
    visibility: 'public',
  }
}

function newTask(): MemorialTask {
  const id =
    typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID
      ? globalThis.crypto.randomUUID()
      : `task-${Date.now()}`
  return { id, title: '', status: 'open' }
}

function newPledge(currency: string): MemorialPledge {
  const id =
    typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID
      ? globalThis.crypto.randomUUID()
      : `pledge-${Date.now()}`
  return { id, pledger_name: '', status: 'pledged', currency, visibility: 'public' }
}

const PLEDGE_STATUSES: MemorialPledgeStatus[] = ['pledged', 'partial', 'fulfilled', 'cancelled']

function newProgrammeEvent(memorialId: string, sortOrder: number): MemorialEvent {
  const id =
    typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID
      ? globalThis.crypto.randomUUID()
      : `ev-${Date.now()}`
  return {
    id,
    memorial_id: memorialId,
    title: '',
    sort_order: sortOrder,
    visibility: 'public',
  }
}

function newContact(): ContactCard {
  return { name: '', role_label: '' }
}

export function EditPortal({ slug }: { slug: string }) {
  const [pin, setPin] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState<MemorialWithDetails | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [closingThankYou, setClosingThankYou] = useState('')
  const [windMeetings, setWindMeetings] = useState<WindDownMeeting[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [stakeholderDrafts, setStakeholderDrafts] = useState<Stakeholder[]>([])
  const [remembranceDraft, setRemembranceDraft] = useState<Remembrance>({})
  const [publicContactsDraft, setPublicContactsDraft] = useState<ContactCard[]>([])
  const [internalContactsDraft, setInternalContactsDraft] = useState<ContactCard[]>([])
  const [memorialModeDraft, setMemorialModeDraft] = useState<MemorialMode>('notice')
  const [familyDeskOpen, setFamilyDeskOpen] = useState(true)
  const [tasksDraft, setTasksDraft] = useState<MemorialTask[]>([])
  const [pledgesDraft, setPledgesDraft] = useState<MemorialPledge[]>([])
  const [eventsDraft, setEventsDraft] = useState<MemorialEvent[]>([])
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null)
  const [reminderEmail, setReminderEmail] = useState('')
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [schedulerAvailable, setSchedulerAvailable] = useState(false)
  const [closureNotesDraft, setClosureNotesDraft] = useState('')
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; name: string } | null>(
    null,
  )
  const [uploadFileErrors, setUploadFileErrors] = useState<string[]>([])
  const [primaryUrlDraft, setPrimaryUrlDraft] = useState('')
  const [galleryUrlDraft, setGalleryUrlDraft] = useState('')
  const [tributeUploadingId, setTributeUploadingId] = useState<string | null>(null)
  const [outputTemplateDraft, setOutputTemplateDraft] = useState<OutputTemplate>('notice')
  const [visualThemeDraft, setVisualThemeDraft] = useState<VisualTheme>('programme')
  const [bankReconciliation, setBankReconciliation] = useState<LastBankReconciliation | undefined>()
  const [deceasedDraft, setDeceasedDraft] = useState({
    deceased_name: '',
    date_of_birth: '',
    date_of_passing: '',
    place_of_passing: '',
    age: '',
  })
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState('')
  const [newPin, setNewPin] = useState('')
  const [coordinatorRecoveryEmailDraft, setCoordinatorRecoveryEmailDraft] = useState('')
  const searchParams = useSearchParams()
  const urlRecoveryToken = searchParams.get('recovery_token')?.trim() ?? ''

  async function load() {
    setMsg(null)
    const res = await fetch(`/api/memorials/${slug}`, {
      headers: pin ? { 'x-passage-pin': pin } : {},
    })
    if (!res.ok) {
      setData(null)
      setLoaded(false)
      setMsg('Could not load memorial. Check the PIN.')
      return
    }
    const json = (await res.json()) as {
      memorial: MemorialWithDetails
      contributions?: Contribution[]
      scheduler_available?: boolean
    }
    const m = json.memorial
    setData(m)
    setAnnouncement(m.announcement_text || '')
    setStakeholderDrafts(m.stakeholders?.length ? [...m.stakeholders] : [])
    setRemembranceDraft(m.remembrance ?? {})
    setPublicContactsDraft(m.public_contacts?.length ? [...m.public_contacts] : [])
    setInternalContactsDraft(m.internal_contacts?.length ? [...m.internal_contacts] : [])
    setClosingThankYou(m.closing_thank_you ?? '')
    setWindMeetings(m.wind_down_meetings?.length ? [...m.wind_down_meetings] : [])
    setMemorialModeDraft(normalizeMemorialMode(m.memorial_mode))
    setFamilyDeskOpen(normalizeMemorialMode(m.memorial_mode) !== 'notice')
    setTasksDraft(m.tasks?.length ? [...m.tasks] : [])
    setPledgesDraft(m.pledges?.length ? [...m.pledges] : [])
    setEventsDraft(m.events?.length ? [...m.events] : [])
    setReminderEmail(m.coordinator_email || m.public_contacts?.[0]?.email || '')
    setContributions(json.contributions ?? [])
    setSchedulerAvailable(Boolean(json.scheduler_available))
    setClosureNotesDraft(m.closure_notes ?? '')
    setPrimaryUrlDraft(m.photo_url ?? '')
    setGalleryUrlDraft('')
    setOutputTemplateDraft(normalizeOutputTemplate(m.output_template))
    setVisualThemeDraft(normalizeVisualTheme(m.visual_theme))
    setBankReconciliation(m.last_bank_reconciliation)
    setDeceasedDraft({
      deceased_name: m.deceased_name,
      date_of_birth: m.date_of_birth ?? '',
      date_of_passing: m.date_of_passing,
      place_of_passing: m.place_of_passing ?? '',
      age: m.age != null ? String(m.age) : '',
    })
    setCoordinatorRecoveryEmailDraft(m.coordinator_recovery_email ?? m.coordinator_email ?? '')
    setLoaded(true)
    void checkEmailConfigured()
  }

  async function checkEmailConfigured() {
    try {
      const res = await fetch(`/api/memorials/${slug}/reminders/send`)
      if (!res.ok) {
        setEmailConfigured(false)
        return
      }
      const json = (await res.json()) as { configured?: boolean }
      setEmailConfigured(Boolean(json.configured))
    } catch {
      setEmailConfigured(false)
    }
  }

  async function requestPinRecovery() {
    setRecoveryMsg(null)
    const res = await fetch(`/api/memorials/${slug}/pin/recovery-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recoveryEmail }),
    })
    const json = (await res.json()) as { message?: string; error?: string }
    if (!res.ok) {
      setRecoveryMsg(json.error ?? 'Request failed.')
      return
    }
    setRecoveryMsg(json.message ?? 'If it matches, we sent a link.')
  }

  async function resetPinWithToken() {
    setRecoveryMsg(null)
    const token = resetToken || urlRecoveryToken
    const res = await fetch(`/api/memorials/${slug}/pin/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_pin: newPin }),
    })
    const json = (await res.json()) as { message?: string; error?: string }
    if (!res.ok) {
      setRecoveryMsg(json.error ?? 'Reset failed.')
      return
    }
    setPin(newPin)
    window.sessionStorage.setItem(`passage_pin_${slug}`, newPin)
    setRecoveryMsg(json.message ?? 'PIN updated.')
    setResetToken('')
    setNewPin('')
  }

  function applyDeathCertScan(payload: DeathCertificateApplyPayload) {
    setDeceasedDraft((d) => ({
      ...d,
      ...(payload.deceased_name ? { deceased_name: payload.deceased_name } : {}),
      ...(payload.date_of_birth ? { date_of_birth: payload.date_of_birth } : {}),
      ...(payload.date_of_passing ? { date_of_passing: payload.date_of_passing } : {}),
      ...(payload.place_of_passing ? { place_of_passing: payload.place_of_passing } : {}),
      ...(payload.age != null ? { age: String(payload.age) } : {}),
    }))
    setMsg('Applied certificate suggestions — review and save deceased details.')
  }

  async function saveDeceasedDetails() {
    const ageRaw = deceasedDraft.age.trim()
    const age = ageRaw ? Number.parseInt(ageRaw, 10) : undefined
    await patchMemorialFields({
      deceased_name: deceasedDraft.deceased_name.trim(),
      date_of_birth: deceasedDraft.date_of_birth.trim() || null,
      date_of_passing: deceasedDraft.date_of_passing.trim(),
      place_of_passing: deceasedDraft.place_of_passing.trim() || null,
      age: Number.isFinite(age) ? age : null,
    })
  }

  function applyEditPosterScan(payload: PosterScanApplyPayload) {
    if (payload.deceased_name) {
      setDeceasedDraft((d) => ({ ...d, deceased_name: payload.deceased_name! }))
    }
    if (payload.date_of_birth) {
      setDeceasedDraft((d) => ({ ...d, date_of_birth: payload.date_of_birth! }))
    }
    if (payload.date_of_passing) {
      setDeceasedDraft((d) => ({ ...d, date_of_passing: payload.date_of_passing! }))
    }
    if (payload.announcement_text) setAnnouncement(payload.announcement_text)
    if (payload.events?.length && data) {
      const memorialId = data.id
      const start = eventsDraft.length
      const added = payload.events.map((ev, i) => ({
        id:
          typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID
            ? globalThis.crypto.randomUUID()
            : `ev-scan-${Date.now()}-${i}`,
        memorial_id: memorialId,
        title: ev.title,
        event_date: ev.event_date || undefined,
        location: ev.location || undefined,
        online_link: ev.online_link || undefined,
        notes: ev.notes || undefined,
        sort_order: start + i,
        visibility: 'public' as const,
      }))
      setEventsDraft((prev) => [...prev, ...added])
    }
    if (payload.public_contacts?.length) {
      setPublicContactsDraft((prev) => [...prev, ...payload.public_contacts!])
    }
    setMsg('Applied scan suggestions — review fields and save when ready.')
  }

  async function uploadImage(file: File, slot: 'primary' | 'gallery') {
    if (!pin) {
      setMsg('Enter your PIN first.')
      return
    }
    const check = validateMemorialImageFile(file)
    if (!check.ok) {
      setMsg(check.error)
      return
    }
    setMsg(null)
    setPhotoUploading(true)
    try {
      const up = await uploadMemorialImage(slug, pin, file, slot)
      if (!up.ok) {
        setMsg(up.error)
        return
      }
      setMsg(slot === 'primary' ? 'Primary photo updated.' : 'Image added to gallery.')
      await load()
    } finally {
      setPhotoUploading(false)
    }
  }

  async function uploadGalleryFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (!list.length) return
    if (!pin) {
      setMsg('Enter your PIN first.')
      return
    }
    const valid: File[] = []
    const preflightErrors: string[] = []
    for (const file of list) {
      const check = validateMemorialImageFile(file)
      if (!check.ok) preflightErrors.push(`${file.name}: ${check.error}`)
      else valid.push(file)
    }
    if (!valid.length) {
      setUploadFileErrors(preflightErrors)
      setMsg(preflightErrors[0] || 'No valid files to upload.')
      return
    }
    setMsg(null)
    setUploadFileErrors(preflightErrors)
    setPhotoUploading(true)
    try {
      const results = await uploadMemorialImagesSequential(slug, pin, valid, 'gallery', (current, total, name) => {
        setUploadProgress({ current, total, name })
      })
      const failed = [...preflightErrors, ...results.filter((r) => !r.ok).map((r) => `${r.name}: ${r.error}`)]
      const okCount = results.filter((r) => r.ok).length
      setUploadFileErrors(failed)
      if (okCount && !failed.length) {
        setMsg(okCount === 1 ? 'Image added to gallery.' : `${okCount} images added to gallery.`)
      } else if (okCount) {
        setMsg(`${okCount} of ${list.length} uploaded. See errors below.`)
      } else {
        setMsg('No images uploaded.')
      }
      if (okCount) await load()
    } finally {
      setPhotoUploading(false)
      setUploadProgress(null)
    }
  }

  async function uploadTributeImage(tributeId: string, file: File) {
    if (!pin) {
      setMsg('Enter your PIN first.')
      return
    }
    const check = validateMemorialImageFile(file)
    if (!check.ok) {
      setMsg(check.error)
      return
    }
    setTributeUploadingId(tributeId)
    setMsg(null)
    try {
      const up = await uploadMemorialTributeImage(slug, pin, tributeId, file)
      if (!up.ok) {
        setMsg(up.error)
        return
      }
      setMsg('Tribute photo attached.')
      await load()
    } finally {
      setTributeUploadingId(null)
    }
  }

  async function clearTributeImage(tributeId: string) {
    if (!pin) {
      setMsg('Enter your PIN first.')
      return
    }
    const res = await fetch(`/api/memorials/${slug}/tributes/${tributeId}/image`, {
      method: 'DELETE',
      headers: { 'x-passage-pin': pin },
    })
    if (!res.ok) {
      const j = (await res.json()) as { error?: string }
      setMsg(j.error || 'Could not remove tribute photo.')
      return
    }
    setMsg('Tribute photo removed.')
    await load()
  }

  async function savePrimaryPhotoUrl() {
    const url = primaryUrlDraft.trim()
    if (!url) {
      setMsg('Enter an image URL or upload a file.')
      return
    }
    await patchMemorialFields({ photo_url: url })
    setPrimaryUrlDraft(url)
  }

  async function addGalleryUrl() {
    if (!data) return
    const url = galleryUrlDraft.trim()
    if (!url) {
      setMsg('Enter a gallery image URL.')
      return
    }
    const existing = data.gallery_urls ?? []
    if (existing.includes(url)) {
      setMsg('That URL is already in the gallery.')
      return
    }
    await patchMemorialFields({ gallery_urls: [...existing, url] })
    setGalleryUrlDraft('')
  }

  async function patchMemorialFields(body: Record<string, unknown>) {
    if (!pin) return
    const res = await fetch(`/api/memorials/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
      body: JSON.stringify({ pin, ...body }),
    })
    if (!res.ok) {
      setMsg('Save failed.')
      return
    }
    setMsg('Saved.')
    await load()
  }

  async function downloadSocialPng(variant: 'square' | 'story' | 'portrait') {
    if (!pin) {
      setMsg('Enter your PIN first.')
      return
    }
    setMsg(null)
    const res = await fetch(`/api/memorials/${slug}/social/${variant}`, {
      headers: { 'x-passage-pin': pin },
    })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      setMsg(j.error || 'Could not generate social image.')
      return
    }
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `passage-${slug}-${variant}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)
    setMsg(`Downloaded ${variant} image.`)
  }

  async function copyReminderText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setMsg('Reminder text copied for WhatsApp.')
    } catch {
      setMsg('Clipboard not available — select and copy manually.')
    }
  }

  async function sendReminderEmail(input: {
    type: 'task' | 'event' | 'pledge'
    target_id: string
    template: ReminderEmailTemplate | string
  }) {
    if (!pin) {
      setMsg('Enter your PIN first.')
      return
    }
    const to = reminderEmail.trim()
    if (!to) {
      setMsg('Enter a recipient email.')
      return
    }
    setMsg(null)
    const res = await fetch(`/api/memorials/${slug}/reminders/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
      body: JSON.stringify({ pin, to_email: to, ...input }),
    })
    const json = (await res.json().catch(() => ({}))) as { detail?: string; error?: string }
    if (res.status === 503) {
      setEmailConfigured(false)
      setMsg(json.detail || 'Email not configured — set RESEND_API_KEY on the server.')
      return
    }
    if (!res.ok) {
      setMsg(json.error || json.detail || 'Could not send email.')
      return
    }
    setMsg('Reminder email sent.')
  }

  async function removeGalleryUrl(url: string) {
    if (!data) return
    const next = (data.gallery_urls ?? []).filter((u) => u !== url)
    await patchMemorialFields({ gallery_urls: next })
  }

  async function clearPrimaryPhoto() {
    await patchMemorialFields({ photo_url: null })
    setPrimaryUrlDraft('')
  }

  async function saveClosingThankYou() {
    await patchMemorialFields({ closing_thank_you: closingThankYou })
  }

  async function saveClosureNotes() {
    await patchMemorialFields({ closure_notes: closureNotesDraft })
  }

  async function closeMemorial() {
    await patchMemorialFields({
      closure_notes: closureNotesDraft,
      closure_status: 'closed',
    })
    setShowCloseConfirm(false)
    setMsg('Memorial closed. Public page will show a restrained closed notice.')
  }

  async function reopenMemorial() {
    await patchMemorialFields({ closure_status: 'active' })
    setMsg('Memorial reopened.')
  }

  function markPledgeFulfilledFromPayment(pledgeId: string, reference: string) {
    const contribution = contributions.find(
      (c) => c.paystack_reference?.trim() === reference.trim() && c.paid_at,
    )
    if (!contribution) {
      setMsg('No paid contribution with that Paystack reference.')
      return
    }
    setPledgesDraft((rows) =>
      rows.map((r) =>
        r.id === pledgeId
          ? {
              ...r,
              status: 'fulfilled' as const,
              contribution_id: contribution.id,
              paystack_reference: reference.trim(),
            }
          : r,
      ),
    )
    setMsg('Pledge linked — save pledges to persist.')
  }

  async function saveWindMeetings() {
    await patchMemorialFields({ wind_down_meetings: windMeetings })
  }

  function addWindMeeting() {
    setWindMeetings((prev) => [
      ...prev,
      {
        id: globalThis.crypto.randomUUID(),
        title: '',
        visibility: 'coordinator_only',
      },
    ])
  }

  function updateWindMeeting(id: string, partial: Partial<WindDownMeeting>) {
    setWindMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...partial } : m)))
  }

  function removeWindMeeting(id: string) {
    setWindMeetings((prev) => prev.filter((m) => m.id !== id))
  }

  async function save() {
    if (!pin) return
    const res = await fetch(`/api/memorials/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
      body: JSON.stringify({ pin, announcement_text: announcement }),
    })
    if (!res.ok) {
      setMsg('Save failed.')
      return
    }
    setMsg('Saved.')
    await load()
  }

  async function submitReview() {
    if (!pin) return
    const res = await fetch(`/api/memorials/${slug}/submit-for-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
      body: JSON.stringify({ pin }),
    })
    if (!res.ok) {
      setMsg('Submit failed — check PIN or status (must be draft).')
      return
    }
    window.sessionStorage.setItem(`passage_pin_${slug}`, pin)
    setMsg('Submitted for internal review. Thank you.')
    await load()
  }

  async function approvePoster() {
    if (!pin) return
    const res = await fetch(`/api/memorials/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
      body: JSON.stringify({ pin, poster_approved_at: new Date().toISOString() }),
    })
    if (!res.ok) {
      setMsg('Could not update poster approval.')
      return
    }
    setMsg('Poster marked approved (timestamp recorded).')
    await load()
  }

  async function approveTribute(t: Tribute) {
    if (!pin) return
    const res = await fetch(`/api/memorials/${slug}/tributes/${t.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passage-pin': pin },
      body: JSON.stringify({ pin }),
    })
    if (!res.ok) {
      setMsg('Could not approve tribute.')
      return
    }
    setMsg('Tribute approved.')
    await load()
  }

  function loadSavedPin() {
    const saved = window.sessionStorage.getItem(`passage_pin_${slug}`)
    if (saved) setPin(saved)
  }

  function persistPin() {
    window.sessionStorage.setItem(`passage_pin_${slug}`, pin)
    setMsg('PIN remembered on this device for this memorial.')
  }

  return (
    <div className="min-h-full bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Family edit portal</h1>
          <Link href={`/memorial/${slug}`} className="text-sm text-[#C9A02C] underline">
            View memorial
          </Link>
        </div>
        <p className="text-sm text-[#1A1A1A]/70">
          Enter the coordinator PIN you received when the memorial was created. Nothing goes live without your
          review; submit for internal approval when you are ready.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-[#1A1A1A]/70">PIN</label>
            <input
              className="mt-1 w-40 rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              type="password"
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="button"
            className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
            onClick={load}
          >
            Load
          </button>
          <button type="button" className="text-sm text-[#C9A02C] underline" onClick={loadSavedPin}>
            Load saved PIN
          </button>
          <button type="button" className="text-sm text-[#C9A02C] underline" onClick={persistPin}>
            Remember PIN on this device
          </button>
        </div>

        <details className="rounded-lg border border-[#3D2B1F]/10 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-medium text-[#3D2B1F]">Forgot PIN?</summary>
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[#1A1A1A]/65">
              Enter the recovery email for this memorial. If it matches, we send a one-hour link (when email is
              configured).
            </p>
            <label className="block text-xs font-medium text-[#1A1A1A]/70">
              Recovery email
              <input
                className="mt-1 w-full max-w-sm rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <button
              type="button"
              className="rounded-md border border-[#C9A02C]/50 px-4 py-2 text-sm font-medium"
              onClick={() => void requestPinRecovery()}
            >
              Send recovery link
            </button>
            {(urlRecoveryToken || resetToken) && (
              <div className="space-y-2 border-t border-[#3D2B1F]/10 pt-3">
                <p className="text-xs text-[#1A1A1A]/65">Set a new 6-digit PIN from your recovery link.</p>
                <label className="block text-xs font-medium">
                  New PIN
                  <input
                    className="mt-1 w-32 rounded border border-[#3D2B1F]/20 px-3 py-2 font-mono tracking-widest"
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </label>
                <button
                  type="button"
                  className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
                  onClick={() => void resetPinWithToken()}
                >
                  Save new PIN
                </button>
              </div>
            )}
            {recoveryMsg && <p className="text-xs text-[#3D2B1F]">{recoveryMsg}</p>}
          </div>
        </details>

        {msg && <p className="text-sm text-[#3D2B1F]">{msg}</p>}

        {loaded && data && (
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-wider text-[#C9A02C]">Status: {data.status}</p>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Public memorial format</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Controls how much appears on the public page. PIN, saves, and submissions always stay available.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {(['notice', 'programme', 'full'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setMemorialModeDraft(mode)}
                    className={`min-h-[44px] flex-1 rounded-lg border px-3 py-2 text-left text-sm transition sm:min-w-[10rem] ${
                      memorialModeDraft === mode
                        ? 'border-[#C9A02C] bg-[#C9A02C]/10'
                        : 'border-[#3D2B1F]/15 bg-[#FAFAF8]'
                    }`}
                  >
                    {mode === 'notice' ? 'Notice only' : null}
                    {mode === 'programme' ? 'Programme / brochure' : null}
                    {mode === 'full' ? 'Full coordination' : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 min-h-[44px] rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                onClick={() => void patchMemorialFields({ memorial_mode: memorialModeDraft })}
              >
                Save format
              </button>
            </section>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Appearance</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Colour and typography for the public memorial — separate from how much content is shown.
              </p>
              <VisualThemePicker value={visualThemeDraft} onChange={setVisualThemeDraft} />
              <button
                type="button"
                className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                onClick={() => void patchMemorialFields({ visual_theme: visualThemeDraft })}
              >
                Save appearance
              </button>
            </section>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Print &amp; page template</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Visual layout for the public memorial and print sheet (separate from how much content is shown).
              </p>
              <div className="flex flex-col gap-2">
                {OUTPUT_TEMPLATE_CHOICES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setOutputTemplateDraft(t.value)}
                    className={`min-h-[44px] rounded-lg border px-3 py-2 text-left text-sm transition ${
                      outputTemplateDraft === t.value
                        ? 'border-[#C9A02C] bg-[#C9A02C]/10'
                        : 'border-[#3D2B1F]/15 bg-[#FAFAF8]'
                    }`}
                  >
                    <p className="font-medium">{t.title}</p>
                    <p className="mt-1 text-xs text-[#1A1A1A]/65">{t.body}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                onClick={() => void patchMemorialFields({ output_template: outputTemplateDraft })}
              >
                Save template
              </button>
            </section>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Deceased details</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Core fields for the memorial header. Scan a certificate or poster, then save.
              </p>
              <DeathCertificateScanPanel
                slug={slug}
                pin={pin}
                onApply={applyDeathCertScan}
                onError={(m) => setMsg(m)}
              />
              <label className="block text-xs font-medium text-[#1A1A1A]/70">
                Full name
                <input
                  className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                  value={deceasedDraft.deceased_name}
                  onChange={(e) => setDeceasedDraft((d) => ({ ...d, deceased_name: e.target.value }))}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[#1A1A1A]/70">
                  Date of birth
                  <input
                    type="date"
                    className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                    value={deceasedDraft.date_of_birth}
                    onChange={(e) => setDeceasedDraft((d) => ({ ...d, date_of_birth: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-medium text-[#1A1A1A]/70">
                  Date of passing
                  <input
                    type="date"
                    className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                    value={deceasedDraft.date_of_passing}
                    onChange={(e) => setDeceasedDraft((d) => ({ ...d, date_of_passing: e.target.value }))}
                  />
                </label>
              </div>
              <label className="block text-xs font-medium text-[#1A1A1A]/70">
                Place of passing
                <input
                  className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                  value={deceasedDraft.place_of_passing}
                  onChange={(e) => setDeceasedDraft((d) => ({ ...d, place_of_passing: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-medium text-[#1A1A1A]/70">
                Age
                <input
                  className="mt-1 w-24 rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={deceasedDraft.age}
                  onChange={(e) => setDeceasedDraft((d) => ({ ...d, age: e.target.value.replace(/\D/g, '') }))}
                />
              </label>
              <button
                type="button"
                className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
                onClick={() => void saveDeceasedDetails()}
              >
                Save deceased details
              </button>
            </section>

            <details
              className="rounded-lg border border-[#3D2B1F]/10 bg-[#FAFAF8]/50 p-4"
              open={familyDeskOpen}
              onToggle={(e) => setFamilyDeskOpen((e.currentTarget as HTMLDetailsElement).open)}
            >
              <summary className="cursor-pointer text-sm font-semibold text-[#3D2B1F] outline-none">
                Family desk (advanced)
              </summary>
              <div className="mt-6 space-y-8 border-t border-[#3D2B1F]/10 pt-6">
                {memorialModeDraft === 'programme' && (
                  <p className="text-sm text-[#1A1A1A]/70">
                    Remembrance and programme contacts live here. Programme times can be edited in the{' '}
                    <strong>Programme events</strong> section below (public vs coordinator-only visibility).
                  </p>
                )}

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Stakeholders & vendors</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Elders, church, burial, catering, logistics — mark coordinator-only rows to hide from the public page.
              </p>
              <div className="space-y-4">
                {stakeholderDrafts.map((s, idx) => (
                  <div key={s.id} className="space-y-2 rounded border border-[#3D2B1F]/15 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-[#1A1A1A]/70">
                        Category
                        <select
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={s.category}
                          onChange={(e) => {
                            const v = e.target.value as StakeholderCategory
                            setStakeholderDrafts((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, category: v } : r)),
                            )
                          }}
                        >
                          {STAKEHOLDER_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {STAKEHOLDER_CATEGORY_LABEL[c]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-[#1A1A1A]/70">
                        Visibility
                        <select
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={s.visibility}
                          onChange={(e) => {
                            const v = e.target.value === 'coordinator_only' ? 'coordinator_only' : 'public'
                            setStakeholderDrafts((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, visibility: v } : r)),
                            )
                          }}
                        >
                          <option value="public">Public</option>
                          <option value="coordinator_only">Coordinator only</option>
                        </select>
                      </label>
                    </div>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Name
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={s.name}
                        onChange={(e) =>
                          setStakeholderDrafts((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)),
                          )
                        }
                      />
                    </label>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Role label
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={s.role_label ?? ''}
                        onChange={(e) =>
                          setStakeholderDrafts((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, role_label: e.target.value } : r)),
                          )
                        }
                      />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-[#1A1A1A]/70">
                        Phone
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={s.phone ?? ''}
                          onChange={(e) =>
                            setStakeholderDrafts((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, phone: e.target.value } : r)),
                            )
                          }
                        />
                      </label>
                      <label className="text-xs text-[#1A1A1A]/70">
                        Email
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={s.email ?? ''}
                          onChange={(e) =>
                            setStakeholderDrafts((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, email: e.target.value } : r)),
                            )
                          }
                        />
                      </label>
                    </div>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Notes
                      <textarea
                        className="mt-1 min-h-[60px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={s.notes ?? ''}
                        onChange={(e) =>
                          setStakeholderDrafts((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, notes: e.target.value } : r)),
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="text-xs text-red-700 underline"
                      onClick={() => setStakeholderDrafts((rows) => rows.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                  onClick={() => setStakeholderDrafts((rows) => [...rows, newStakeholder()])}
                >
                  Add stakeholder
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                  onClick={() =>
                    void patchMemorialFields({
                      stakeholders: stakeholderDrafts.filter((s) => s.name.trim().length > 0),
                    })
                  }
                >
                  Save stakeholders
                </button>
              </div>
            </section>

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Remembrance (programme)</h2>
              <p className="text-sm text-[#1A1A1A]/70">Scripture and optional quotations for the order of service.</p>
              <label className="block text-xs text-[#1A1A1A]/70">
                Scripture reference
                <input
                  className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                  value={remembranceDraft.scripture?.reference ?? ''}
                  onChange={(e) =>
                    setRemembranceDraft((r) => ({
                      ...r,
                      scripture: {
                        reference: e.target.value,
                        text: r.scripture?.text ?? '',
                      },
                    }))
                  }
                />
              </label>
              <label className="block text-xs text-[#1A1A1A]/70">
                Scripture text
                <textarea
                  className="mt-1 min-h-[100px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                  value={remembranceDraft.scripture?.text ?? ''}
                  onChange={(e) =>
                    setRemembranceDraft((r) => ({
                      ...r,
                      scripture: {
                        reference: r.scripture?.reference ?? '',
                        text: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#1A1A1A]/70">Quotes</p>
                {(remembranceDraft.quotes ?? []).map((q, qi) => (
                  <div key={qi} className="flex flex-col gap-2 rounded border border-[#3D2B1F]/10 p-2 sm:flex-row">
                    <textarea
                      className="min-h-[60px] flex-1 rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      placeholder="Quote text"
                      value={q.text}
                      onChange={(e) =>
                        setRemembranceDraft((r) => {
                          const quotes = [...(r.quotes ?? [])]
                          quotes[qi] = { ...quotes[qi], text: e.target.value }
                          return { ...r, quotes }
                        })
                      }
                    />
                    <input
                      className="rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm sm:w-40"
                      placeholder="Attribution"
                      value={q.attribution ?? ''}
                      onChange={(e) =>
                        setRemembranceDraft((r) => {
                          const quotes = [...(r.quotes ?? [])]
                          quotes[qi] = { ...quotes[qi], attribution: e.target.value }
                          return { ...r, quotes }
                        })
                      }
                    />
                    <button
                      type="button"
                      className="text-xs text-red-700 underline sm:self-start"
                      onClick={() =>
                        setRemembranceDraft((r) => ({
                          ...r,
                          quotes: (r.quotes ?? []).filter((_, i) => i !== qi),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-[#C9A02C] underline"
                  onClick={() =>
                    setRemembranceDraft((r) => ({
                      ...r,
                      quotes: [...(r.quotes ?? []), { text: '' }],
                    }))
                  }
                >
                  Add quote
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                  onClick={() => {
                    const scripture =
                      remembranceDraft.scripture?.reference?.trim() ||
                      remembranceDraft.scripture?.text?.trim()
                        ? {
                            reference: remembranceDraft.scripture?.reference?.trim() ?? '',
                            text: remembranceDraft.scripture?.text?.trim() ?? '',
                          }
                        : undefined
                    const quotes = (remembranceDraft.quotes ?? [])
                      .map((q) => ({
                        text: q.text.trim(),
                        attribution: q.attribution?.trim(),
                      }))
                      .filter((q) => q.text.length > 0)
                    const payload: Remembrance = {
                      ...(scripture ? { scripture } : {}),
                      ...(quotes.length ? { quotes } : {}),
                    }
                    const empty = !scripture && !quotes.length
                    void patchMemorialFields(empty ? { remembrance: null } : { remembrance: payload })
                  }}
                >
                  Save remembrance
                </button>
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() => void patchMemorialFields({ remembrance: null })}
                >
                  Clear remembrance
                </button>
              </div>
            </section>

            <ProgrammeReadingsEditor
              key={(data.programme_readings ?? []).map((r) => r.id).join(',') || 'empty'}
              slug={slug}
              pin={pin}
              tradition={data.tradition}
              readings={data.programme_readings ?? []}
              onMessage={setMsg}
              onSave={(readings) => patchMemorialFields({ programme_readings: readings })}
            />

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Public contacts &amp; handoff</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Up to two cards shown on the memorial page (family liaison). Saving the first public contact also
                updates legacy coordinator fields — use this when the spokesperson changes.
              </p>
              <label className="block text-xs font-medium text-[#1A1A1A]/70">
                PIN recovery email (optional)
                <input
                  className="mt-1 w-full max-w-md rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                  type="email"
                  placeholder="Defaults to coordinator / first public contact email"
                  value={coordinatorRecoveryEmailDraft}
                  onChange={(e) => setCoordinatorRecoveryEmailDraft(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                onClick={() =>
                  void patchMemorialFields({
                    coordinator_recovery_email: coordinatorRecoveryEmailDraft.trim() || null,
                  })
                }
              >
                Save recovery email
              </button>
              {publicContactsDraft.map((c, idx) => (
                <div key={idx} className="space-y-2 rounded border border-[#3D2B1F]/15 p-3">
                  <label className="block text-xs text-[#1A1A1A]/70">
                    Name
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={c.name}
                      onChange={(e) =>
                        setPublicContactsDraft((rows) =>
                          rows.map((row, i) => (i === idx ? { ...row, name: e.target.value } : row)),
                        )
                      }
                    />
                  </label>
                  <label className="block text-xs text-[#1A1A1A]/70">
                    Role
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={c.role_label ?? ''}
                      onChange={(e) =>
                        setPublicContactsDraft((rows) =>
                          rows.map((row, i) => (i === idx ? { ...row, role_label: e.target.value } : row)),
                        )
                      }
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-xs text-[#1A1A1A]/70">
                      Phone
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={c.phone ?? ''}
                        onChange={(e) =>
                          setPublicContactsDraft((rows) =>
                            rows.map((row, i) => (i === idx ? { ...row, phone: e.target.value } : row)),
                          )
                        }
                      />
                    </label>
                    <label className="text-xs text-[#1A1A1A]/70">
                      WhatsApp
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={c.whatsapp ?? ''}
                        onChange={(e) =>
                          setPublicContactsDraft((rows) =>
                            rows.map((row, i) => (i === idx ? { ...row, whatsapp: e.target.value } : row)),
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className="block text-xs text-[#1A1A1A]/70">
                    Email
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={c.email ?? ''}
                      onChange={(e) =>
                        setPublicContactsDraft((rows) =>
                          rows.map((row, i) => (i === idx ? { ...row, email: e.target.value } : row)),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="text-xs text-red-700 underline"
                    onClick={() => setPublicContactsDraft((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={publicContactsDraft.length >= 2}
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm disabled:opacity-40"
                  onClick={() => setPublicContactsDraft((rows) => [...rows, newContact()])}
                >
                  Add public contact
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                  onClick={() =>
                    void patchMemorialFields({
                      public_contacts: publicContactsDraft.filter((c) => c.name.trim().length > 0),
                    })
                  }
                >
                  Save public contacts
                </button>
              </div>
            </section>

            <section className="space-y-3 rounded-lg border border-amber-900/25 bg-amber-50/40 p-4">
              <h2 className="font-semibold text-amber-950">Internal contacts (not public)</h2>
              <p className="text-sm text-amber-950/80">
                Coordinator-only directory — never shown on the public memorial page.
              </p>
              {internalContactsDraft.map((c, idx) => (
                <div key={idx} className="space-y-2 rounded border border-amber-900/20 bg-white p-3">
                  <label className="block text-xs text-[#1A1A1A]/70">
                    Name
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={c.name}
                      onChange={(e) =>
                        setInternalContactsDraft((rows) =>
                          rows.map((row, i) => (i === idx ? { ...row, name: e.target.value } : row)),
                        )
                      }
                    />
                  </label>
                  <label className="block text-xs text-[#1A1A1A]/70">
                    Role
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={c.role_label ?? ''}
                      onChange={(e) =>
                        setInternalContactsDraft((rows) =>
                          rows.map((row, i) => (i === idx ? { ...row, role_label: e.target.value } : row)),
                        )
                      }
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-xs text-[#1A1A1A]/70">
                      Phone
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={c.phone ?? ''}
                        onChange={(e) =>
                          setInternalContactsDraft((rows) =>
                            rows.map((row, i) => (i === idx ? { ...row, phone: e.target.value } : row)),
                          )
                        }
                      />
                    </label>
                    <label className="text-xs text-[#1A1A1A]/70">
                      WhatsApp
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={c.whatsapp ?? ''}
                        onChange={(e) =>
                          setInternalContactsDraft((rows) =>
                            rows.map((row, i) => (i === idx ? { ...row, whatsapp: e.target.value } : row)),
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className="block text-xs text-[#1A1A1A]/70">
                    Email
                    <input
                      className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                      value={c.email ?? ''}
                      onChange={(e) =>
                        setInternalContactsDraft((rows) =>
                          rows.map((row, i) => (i === idx ? { ...row, email: e.target.value } : row)),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="text-xs text-red-700 underline"
                    onClick={() => setInternalContactsDraft((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                  onClick={() => setInternalContactsDraft((rows) => [...rows, newContact()])}
                >
                  Add internal contact
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
                  onClick={() =>
                    void patchMemorialFields({
                      internal_contacts: internalContactsDraft.filter((c) => c.name.trim().length > 0),
                    })
                  }
                >
                  Save internal contacts
                </button>
              </div>
            </section>
              </div>
            </details>

            <section className="space-y-3">
              <h2 className="font-semibold">Photos</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Upload JPEG, PNG, or WebP (max 8MB). Primary photo appears on the memorial hero; additional images show in the gallery.
                On Vercel, set <code className="text-xs">BLOB_READ_WRITE_TOKEN</code> — otherwise uploads return an error (paste URL as fallback).
              </p>
              <PosterScanPanel
                label="Scan poster"
                hint="Read a funeral poster or announcement photo to suggest announcement text, programme events, and contacts. Confirm before saving."
                slug={slug}
                pin={pin}
                onFileSelected={(file) => {
                  if (pin) void uploadImage(file, 'gallery')
                }}
                onApply={applyEditPosterScan}
                onError={(msg) => setMsg(msg)}
              />
              {photoUploading && (
                <p className="text-sm text-[#1A1A1A]/70" role="status">
                  {uploadProgress
                    ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}: ${uploadProgress.name}`
                    : 'Uploading…'}
                </p>
              )}
              {uploadFileErrors.length > 0 && (
                <ul className="list-inside list-disc text-xs text-red-800/90">
                  {uploadFileErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-end gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-[#3D2B1F]/15 bg-[#3D2B1F]/10">
                  {data.photo_url ? (
                    <Image
                      src={data.photo_url}
                      alt="Primary"
                      fill
                      className="object-cover"
                      sizes="112px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-xs text-[#1A1A1A]/50">
                      No primary photo
                    </div>
                  )}
                </div>
                <div className="min-w-[12rem] flex-1 space-y-3">
                  <MemorialImageFileInput
                    label="Upload primary photo"
                    disabled={photoUploading}
                    onFiles={(files) => {
                      const f = files?.[0]
                      if (f) void uploadImage(f, 'primary')
                    }}
                  />
                  <details className="text-xs text-[#1A1A1A]/60">
                    <summary className="cursor-pointer text-[#C9A02C] underline">Paste image URL (fallback)</summary>
                    <div className="mt-2 space-y-1">
                    <input
                      type="url"
                      placeholder="https://…"
                      value={primaryUrlDraft}
                      onChange={(e) => setPrimaryUrlDraft(e.target.value)}
                      className="w-full max-w-md rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      disabled={photoUploading}
                      className="text-xs text-[#C9A02C] underline disabled:opacity-50"
                      onClick={() => void savePrimaryPhotoUrl()}
                    >
                      Save URL as primary
                    </button>
                    </div>
                  </details>
                  {data.photo_url && (
                    <button
                      type="button"
                      className="block text-xs text-[#C9A02C] underline"
                      onClick={() => void clearPrimaryPhoto()}
                    >
                      Remove primary photo
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <MemorialImageFileInput
                  label="Add to gallery (select multiple)"
                  multiple
                  disabled={photoUploading}
                  onFiles={(files) => {
                    if (files?.length) void uploadGalleryFiles(files)
                  }}
                />
                {(data.gallery_urls?.length ?? 0) >= 40 && <GallerySizeWarning />}
                <details className="text-xs text-[#1A1A1A]/60">
                  <summary className="cursor-pointer text-[#C9A02C] underline">Paste gallery URL (fallback)</summary>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <input
                      type="url"
                      placeholder="https://…"
                      value={galleryUrlDraft}
                      onChange={(e) => setGalleryUrlDraft(e.target.value)}
                      className="min-w-[12rem] flex-1 rounded border border-[#3D2B1F]/20 px-2 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={photoUploading}
                      className="min-h-[44px] rounded border border-[#3D2B1F]/25 px-3 py-2 text-xs disabled:opacity-50"
                      onClick={() => void addGalleryUrl()}
                    >
                      Add URL
                    </button>
                  </div>
                </details>
              </div>
              {(data.gallery_urls?.length ?? 0) > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(data.gallery_urls ?? []).map((url) => (
                    <li key={url} className="relative aspect-square overflow-hidden rounded-lg border border-[#3D2B1F]/10">
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width:640px) 50vw, 33vw"
                        unoptimized
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 rounded bg-[#1A1A1A]/85 px-2 py-1 text-[10px] font-medium text-[#FAFAF8]"
                        onClick={() => void removeGalleryUrl(url)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Social images</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Square (1080×1080), story (1080×1920), and portrait (1080×1350) crops from the primary photo (or first gallery
                image), with name, dates, and memorial link. Uses your PIN over a secure request — not linked on the public page.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-[#3D2B1F]/25 bg-[#FAFAF8] px-3 py-2 text-sm font-medium"
                  onClick={() => void downloadSocialPng('square')}
                >
                  Download square
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[#3D2B1F]/25 bg-[#FAFAF8] px-3 py-2 text-sm font-medium"
                  onClick={() => void downloadSocialPng('story')}
                >
                  Download story
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[#3D2B1F]/25 bg-[#FAFAF8] px-3 py-2 text-sm font-medium"
                  onClick={() => void downloadSocialPng('portrait')}
                >
                  Download portrait (4:5)
                </button>
              </div>
            </section>

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Closure &amp; accounting</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                When arrangements conclude, add disposition notes and close the memorial. Fundraising CTAs hide when
                closed.
              </p>
              <label className="block text-xs text-[#1A1A1A]/70">
                Disposition / thank-you
                <textarea
                  className="mt-1 min-h-[80px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                  value={closureNotesDraft}
                  onChange={(e) => setClosureNotesDraft(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                  onClick={() => void saveClosureNotes()}
                >
                  Save disposition notes
                </button>
                <Link
                  href={`/memorial/${slug}/closure`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-[#3D2B1F]/25 px-3 py-2 text-sm font-medium"
                >
                  Closure sheet (print)
                </Link>
              </div>
              {data.closure_status === 'closed' ? (
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-medium">Memorial closed</p>
                  <button type="button" className="mt-2 text-xs underline" onClick={() => void reopenMemorial()}>
                    Reopen
                  </button>
                </div>
              ) : showCloseConfirm ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm">
                  <p className="font-medium text-red-900">Close this memorial?</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="rounded bg-red-800 px-3 py-1.5 text-xs font-medium text-white"
                      onClick={() => void closeMemorial()}
                    >
                      Yes, close
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-300 px-3 py-1.5 text-xs"
                      onClick={() => setShowCloseConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-900"
                  onClick={() => setShowCloseConfirm(true)}
                >
                  Close memorial…
                </button>
              )}
            </section>

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Hand to printer</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Plain-language checklist for your print shop. Programme sheets use A4; outdoor roll-ups use the banner
                layout (850×2000mm).
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[#1A1A1A]/80">
                <li>Trim size: programme A4 portrait; roll-up 850mm × 2000mm (banner page).</li>
                <li>File: export PDF from the browser Print dialog (Save as PDF).</li>
                <li>Photos: supply originals if the shop asks for higher resolution.</li>
                <li>Colour: ask whether they need CMYK conversion from your PDF.</li>
                <li>QR code on banners links to this memorial — test scan before printing.</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/memorial/${slug}/printer-guide`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-[#C9A02C]/40 px-3 py-2 text-sm font-medium"
                >
                  Printer one-pager
                </Link>
                <Link
                  href={`/memorial/${slug}/print`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-[#3D2B1F]/25 bg-[#FAFAF8] px-3 py-2 text-sm font-medium"
                >
                  Programme print
                </Link>
                <Link
                  href={`/memorial/${slug}/banner`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md bg-[#1A1A1A] px-3 py-2 text-sm font-medium text-[#FAFAF8]"
                >
                  Roll-up banner
                </Link>
                <Link
                  href={`/memorial/${slug}/banner/wide`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-[#3D2B1F]/25 px-3 py-2 text-sm font-medium"
                >
                  Wide banner (3×6 ft)
                </Link>
              </div>
            </section>

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Email reminders</h2>
              {emailConfigured === false && (
                <p className="text-sm text-amber-800">
                  Email not configured — set <code className="text-xs">RESEND_API_KEY</code> on the server to send from
                  here. WhatsApp copy buttons on tasks and pledges still work.
                </p>
              )}
              <label className="block text-xs text-[#1A1A1A]/70">
                Send reminders to
                <input
                  type="email"
                  className="mt-1 w-full max-w-md rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                  placeholder="volunteer@example.com"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                />
              </label>
              <p className="text-xs text-[#1A1A1A]/55">
                Send now or schedule email from task, pledge, and programme rows below. WhatsApp uses copy buttons only
                (Phase 2: WABA). Scheduled sends need Postgres + Vercel cron.
              </p>
            </section>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Programme events</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Order of service entries. <strong>Public</strong> rows appear on the memorial when format is programme or full;{' '}
                <strong>Coordinator only</strong> stays in this portal and API.
              </p>
              <ul className="space-y-4">
                {eventsDraft.map((ev, idx) => (
                  <li key={ev.id} className="space-y-2 rounded border border-[#3D2B1F]/12 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1A1A1A]/50">
                        Event {idx + 1}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-red-700 underline"
                        onClick={() => setEventsDraft((rows) => rows.filter((r) => r.id !== ev.id))}
                      >
                        Remove
                      </button>
                    </div>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Title
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={ev.title}
                        onChange={(e) =>
                          setEventsDraft((rows) =>
                            rows.map((r) => (r.id === ev.id ? { ...r, title: e.target.value } : r)),
                          )
                        }
                      />
                    </label>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Date / time (ISO)
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        placeholder="2026-02-01T09:00:00.000Z"
                        value={ev.event_date ?? ''}
                        onChange={(e) =>
                          setEventsDraft((rows) =>
                            rows.map((r) =>
                              r.id === ev.id ? { ...r, event_date: e.target.value.trim() || undefined } : r,
                            ),
                          )
                        }
                      />
                    </label>
                    {ev.event_date && (
                      <p className="text-[11px] text-[#1A1A1A]/50">Accra: {formatAccraLocal(ev.event_date)}</p>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-[#1A1A1A]/70">
                        Location
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={ev.location ?? ''}
                          onChange={(e) =>
                            setEventsDraft((rows) =>
                              rows.map((r) =>
                                r.id === ev.id ? { ...r, location: e.target.value.trim() || undefined } : r,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="text-xs text-[#1A1A1A]/70">
                        Online link
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={ev.online_link ?? ''}
                          onChange={(e) =>
                            setEventsDraft((rows) =>
                              rows.map((r) =>
                                r.id === ev.id ? { ...r, online_link: e.target.value.trim() || undefined } : r,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Notes
                      <textarea
                        className="mt-1 min-h-[52px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={ev.notes ?? ''}
                        onChange={(e) =>
                          setEventsDraft((rows) =>
                            rows.map((r) =>
                              r.id === ev.id ? { ...r, notes: e.target.value.trim() || undefined } : r,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Visibility
                      <select
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={ev.visibility === 'coordinator_only' ? 'coordinator_only' : 'public'}
                        onChange={(e) =>
                          setEventsDraft((rows) =>
                            rows.map((r) =>
                              r.id === ev.id
                                ? {
                                    ...r,
                                    visibility: e.target.value === 'coordinator_only' ? 'coordinator_only' : 'public',
                                  }
                                : r,
                            ),
                          )
                        }
                      >
                        <option value="public">Public (programme)</option>
                        <option value="coordinator_only">Coordinator only</option>
                      </select>
                    </label>
                    <label className="block text-xs text-[#1A1A1A]/70">
                      Sort order
                      <input
                        type="number"
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm sm:max-w-[8rem]"
                        value={ev.sort_order}
                        onChange={(e) =>
                          setEventsDraft((rows) =>
                            rows.map((r) =>
                              r.id === ev.id
                                ? { ...r, sort_order: Number.parseInt(e.target.value, 10) || 0 }
                                : r,
                            ),
                          )
                        }
                      />
                    </label>
                    {ev.title.trim() && emailConfigured !== false && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                          onClick={() =>
                            void sendReminderEmail({
                              type: 'event',
                              target_id: ev.id,
                              template: 'event_upcoming',
                            })
                          }
                        >
                          Email now (upcoming)
                        </button>
                        <ScheduleReminderControls
                          slug={slug}
                          pin={pin}
                          kind="event"
                          targetId={ev.id}
                          template="event_upcoming"
                          toEmail={reminderEmail}
                          schedulerAvailable={schedulerAvailable}
                          onMessage={setMsg}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                  onClick={() =>
                    setEventsDraft((rows) => [...rows, newProgrammeEvent(data.id, rows.length)])
                  }
                >
                  Add programme event
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                  onClick={() =>
                    void patchMemorialFields({
                      events: eventsDraft
                        .filter((e) => e.title.trim().length > 0)
                        .map((e, i) => ({
                          ...e,
                          memorial_id: data.id,
                          sort_order: e.sort_order ?? i,
                        })),
                    })
                  }
                >
                  Save programme events
                </button>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Pledges</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Promised vs paid support. Public rows appear on the memorial in programme/full mode, or whenever
                fundraising is active. Link a contribution ID after manual reconciliation.
              </p>
              <ul className="space-y-4">
                {pledgesDraft.map((pledge) => {
                  const pageUrl = memorialAbsoluteUrl(slug)
                  const line = coordinatorPublicContactLine(data)
                  const pledgePack =
                    pledge.status !== 'fulfilled' && pledge.status !== 'cancelled'
                      ? buildPledgeReminderCopyPack({
                          pledge,
                          deceasedName: data.deceased_name,
                          memorialUrl: pageUrl,
                          coordinatorLine: line,
                          defaultCurrency: data.fundraising_currency,
                        })
                      : null
                  return (
                    <li key={pledge.id} className="space-y-2 rounded border border-[#3D2B1F]/12 p-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <button
                          type="button"
                          className="text-xs text-[#C9A02C] underline"
                          onClick={() =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id ? { ...r, status: 'fulfilled' as const } : r,
                              ),
                            )
                          }
                        >
                          Mark fulfilled
                        </button>
                        <button
                          type="button"
                          className="text-xs text-red-700 underline"
                          onClick={() => setPledgesDraft((rows) => rows.filter((r) => r.id !== pledge.id))}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Pledger name
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={pledge.pledger_name}
                          onChange={(e) =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id ? { ...r, pledger_name: e.target.value } : r,
                              ),
                            )
                          }
                        />
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="text-xs text-[#1A1A1A]/70">
                          Amount (minor units, e.g. 50000 = 500.00)
                          <input
                            type="number"
                            className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                            value={pledge.amount_minor ?? ''}
                            onChange={(e) => {
                              const raw = e.target.value.trim()
                              const n = raw ? Number.parseInt(raw, 10) : undefined
                              setPledgesDraft((rows) =>
                                rows.map((r) =>
                                  r.id === pledge.id
                                    ? {
                                        ...r,
                                        amount_minor:
                                          n != null && Number.isFinite(n) ? n : undefined,
                                      }
                                    : r,
                                ),
                              )
                            }}
                          />
                          {pledge.amount_minor != null && (
                            <span className="mt-0.5 block text-[10px] text-[#1A1A1A]/50">
                              {formatPledgeAmountMinor(
                                pledge.amount_minor,
                                pledge.currency || data.fundraising_currency,
                              )}
                            </span>
                          )}
                        </label>
                        <label className="text-xs text-[#1A1A1A]/70">
                          Status
                          <select
                            className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                            value={pledge.status}
                            onChange={(e) =>
                              setPledgesDraft((rows) =>
                                rows.map((r) =>
                                  r.id === pledge.id
                                    ? { ...r, status: e.target.value as MemorialPledgeStatus }
                                    : r,
                                ),
                              )
                            }
                          >
                            {PLEDGE_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Purpose
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={pledge.purpose ?? ''}
                          onChange={(e) =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id
                                  ? { ...r, purpose: e.target.value.trim() || undefined }
                                  : r,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Expected by (ISO date)
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={pledge.expected_by ?? ''}
                          onChange={(e) =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id
                                  ? { ...r, expected_by: e.target.value.trim() || undefined }
                                  : r,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Contribution ID (optional)
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 font-mono text-xs"
                          placeholder="UUID from a paid contribution"
                          value={pledge.contribution_id ?? ''}
                          onChange={(e) =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id
                                  ? { ...r, contribution_id: e.target.value.trim() || undefined }
                                  : r,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Paystack reference (match payment)
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 font-mono text-xs"
                          placeholder="T1234567890"
                          value={pledge.paystack_reference ?? ''}
                          onChange={(e) =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id
                                  ? { ...r, paystack_reference: e.target.value.trim() || undefined }
                                  : r,
                              ),
                            )
                          }
                        />
                      </label>
                      {pledge.paystack_reference?.trim() && (
                        <button
                          type="button"
                          className="text-xs text-[#C9A02C] underline"
                          onClick={() =>
                            markPledgeFulfilledFromPayment(pledge.id, pledge.paystack_reference!.trim())
                          }
                        >
                          Mark fulfilled from payment reference
                        </button>
                      )}
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Visibility
                        <select
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={pledge.visibility === 'coordinator_only' ? 'coordinator_only' : 'public'}
                          onChange={(e) =>
                            setPledgesDraft((rows) =>
                              rows.map((r) =>
                                r.id === pledge.id
                                  ? {
                                      ...r,
                                      visibility:
                                        e.target.value === 'coordinator_only'
                                          ? 'coordinator_only'
                                          : 'public',
                                    }
                                  : r,
                              ),
                            )
                          }
                        >
                          <option value="public">Public</option>
                          <option value="coordinator_only">Coordinator only</option>
                        </select>
                      </label>
                      {pledgePack && (
                        <div className="space-y-2 pt-1">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                              onClick={() => void copyReminderText(pledgePack.standard)}
                            >
                              WhatsApp (standard)
                            </button>
                            <button
                              type="button"
                              className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                              onClick={() => void copyReminderText(pledgePack.dueTomorrow)}
                            >
                              WhatsApp (due tomorrow)
                            </button>
                            {emailConfigured !== false && (
                              <button
                                type="button"
                                className="rounded border border-[#C9A02C]/40 px-2 py-1 text-xs"
                                onClick={() =>
                                  void sendReminderEmail({
                                    type: 'pledge',
                                    target_id: pledge.id,
                                    template: 'standard',
                                  })
                                }
                              >
                                Email now
                              </button>
                            )}
                          </div>
                          {emailConfigured !== false && (
                            <ScheduleReminderControls
                              slug={slug}
                              pin={pin}
                              kind="pledge"
                              targetId={pledge.id}
                              template="standard"
                              toEmail={reminderEmail}
                              schedulerAvailable={schedulerAvailable}
                              onMessage={setMsg}
                            />
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                  onClick={() =>
                    setPledgesDraft((rows) => [...rows, newPledge(data.fundraising_currency)])
                  }
                >
                  Add pledge
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
                  onClick={() =>
                    void patchMemorialFields({
                      pledges: pledgesDraft.filter((p) => p.pledger_name.trim().length > 0),
                    })
                  }
                >
                  Save pledges
                </button>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Coordinator tasks</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Private checklist (not shown on the public memorial). Use reminder copy for WhatsApp — pick the message that
                matches how soon the item is due.
              </p>
              <ul className="space-y-4">
                {tasksDraft.map((task) => {
                  const pageUrl = memorialAbsoluteUrl(slug)
                  const line = coordinatorPublicContactLine(data)
                  const pack = buildReminderCopyPack({
                    task,
                    deceasedName: data.deceased_name,
                    memorialUrl: pageUrl,
                    coordinatorLine: line,
                  })
                  return (
                    <li key={task.id} className="space-y-2 rounded border border-[#3D2B1F]/12 p-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-[#1A1A1A]/75">
                          <input
                            type="checkbox"
                            className="rounded border-[#3D2B1F]/30"
                            checked={task.status === 'done'}
                            onChange={(e) =>
                              setTasksDraft((rows) =>
                                rows.map((r) =>
                                  r.id === task.id
                                    ? { ...r, status: e.target.checked ? 'done' : 'open' }
                                    : r,
                                ),
                              )
                            }
                          />
                          Done
                        </label>
                        <button
                          type="button"
                          className="text-xs text-red-700 underline"
                          onClick={() => setTasksDraft((rows) => rows.filter((r) => r.id !== task.id))}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Title
                        <input
                          className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={task.title}
                          onChange={(e) =>
                            setTasksDraft((rows) =>
                              rows.map((r) => (r.id === task.id ? { ...r, title: e.target.value } : r)),
                            )
                          }
                        />
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="text-xs text-[#1A1A1A]/70">
                          Owner
                          <input
                            className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                            value={task.owner_name ?? ''}
                            onChange={(e) =>
                              setTasksDraft((rows) =>
                                rows.map((r) =>
                                  r.id === task.id
                                    ? { ...r, owner_name: e.target.value.trim() || undefined }
                                    : r,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="text-xs text-[#1A1A1A]/70">
                          Due (ISO)
                          <input
                            className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                            placeholder="2026-02-02T18:00:00.000Z"
                            value={task.due_at ?? ''}
                            onChange={(e) =>
                              setTasksDraft((rows) =>
                                rows.map((r) =>
                                  r.id === task.id
                                    ? { ...r, due_at: e.target.value.trim() || undefined }
                                    : r,
                                ),
                              )
                            }
                          />
                        </label>
                      </div>
                      <label className="block text-xs text-[#1A1A1A]/70">
                        Notes
                        <textarea
                          className="mt-1 min-h-[48px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                          value={task.notes ?? ''}
                          onChange={(e) =>
                            setTasksDraft((rows) =>
                              rows.map((r) =>
                                r.id === task.id
                                  ? { ...r, notes: e.target.value.trim() || undefined }
                                  : r,
                              ),
                            )
                          }
                        />
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                          onClick={() => void copyReminderText(pack.dueTomorrow)}
                        >
                          Copy reminder (due tomorrow)
                        </button>
                        <button
                          type="button"
                          className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                          onClick={() => void copyReminderText(pack.dueToday)}
                        >
                          Copy reminder (due today)
                        </button>
                        <button
                          type="button"
                          className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                          onClick={() => void copyReminderText(pack.overdue)}
                        >
                          Copy reminder (overdue)
                        </button>
                        <button
                          type="button"
                          className="rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
                          onClick={() => void copyReminderText(pack.noDueDate)}
                        >
                          Copy nudge (no due date)
                        </button>
                        {emailConfigured !== false && (
                          <>
                            <button
                              type="button"
                              className="rounded border border-[#C9A02C]/40 px-2 py-1 text-xs"
                              onClick={() =>
                                void sendReminderEmail({
                                  type: 'task',
                                  target_id: task.id,
                                  template: 'due_tomorrow',
                                })
                              }
                            >
                              Email (due tomorrow)
                            </button>
                            <button
                              type="button"
                              className="rounded border border-[#C9A02C]/40 px-2 py-1 text-xs"
                              onClick={() =>
                                void sendReminderEmail({
                                  type: 'task',
                                  target_id: task.id,
                                  template: 'due_today',
                                })
                              }
                            >
                              Email (due today)
                            </button>
                            <button
                              type="button"
                              className="rounded border border-[#C9A02C]/40 px-2 py-1 text-xs"
                              onClick={() =>
                                void sendReminderEmail({
                                  type: 'task',
                                  target_id: task.id,
                                  template: 'overdue',
                                })
                              }
                            >
                              Email (overdue)
                            </button>
                          </>
                        )}
                        {emailConfigured !== false && (
                          <ScheduleReminderControls
                            slug={slug}
                            pin={pin}
                            kind="task"
                            targetId={task.id}
                            template="due_tomorrow"
                            toEmail={reminderEmail}
                            schedulerAvailable={schedulerAvailable}
                            onMessage={setMsg}
                          />
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[#3D2B1F]/25 px-3 py-1.5 text-sm"
                  onClick={() => setTasksDraft((rows) => [...rows, newTask()])}
                >
                  Add task
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
                  onClick={() =>
                    void patchMemorialFields({
                      tasks: tasksDraft.filter((t) => t.title.trim().length > 0),
                    })
                  }
                >
                  Save tasks
                </button>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Announcement</h2>
              <textarea
                className="min-h-[200px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
              <button type="button" className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]" onClick={save}>
                Save changes
              </button>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold">Reconcile contributions</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Upload a bank or MoMo statement, then link each incoming credit to a recorded contribution.
                Nothing changes on contributions until you choose a link.
              </p>
              <BankReconciliationPanel
                slug={slug}
                pin={pin}
                contributions={contributions}
                initial={bankReconciliation}
                onSave={async (state) => {
                  await patchMemorialFields({ last_bank_reconciliation: state })
                }}
                onMessage={setMsg}
              />
            </section>

            <section className="space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4">
              <h2 className="font-semibold">Closing phase</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Final thank-you appears on the public memorial when saved. Wind-down meetings default to coordinator-only;
                tick “public” only when you are ready for guests to see them on the memorial page.
              </p>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#1A1A1A]/80">Thank you (all and sundry)</h3>
                <textarea
                  className="min-h-[120px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
                  placeholder="Plain text or light markdown-style paragraphs."
                  value={closingThankYou}
                  onChange={(e) => setClosingThankYou(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                  onClick={() => void saveClosingThankYou()}
                >
                  Save thank-you
                </button>
              </div>

              <div className="space-y-3 border-t border-[#3D2B1F]/10 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-[#1A1A1A]/80">Wind-down meetings</h3>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#C9A02C] underline"
                    onClick={addWindMeeting}
                  >
                    Add meeting
                  </button>
                </div>
                {windMeetings.length === 0 && (
                  <p className="text-sm text-[#1A1A1A]/55">No extra meetings yet.</p>
                )}
                <ul className="space-y-4">
                  {windMeetings.map((m) => (
                    <li key={m.id} className="rounded border border-[#3D2B1F]/12 p-3 text-sm">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={
                            m.visibility === 'public'
                              ? 'rounded bg-[#C9A02C]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3D2B1F]'
                              : 'rounded bg-[#3D2B1F]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1A1A1A]/70'
                          }
                        >
                          {m.visibility === 'public' ? 'Public' : 'Coordinator only'}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-700/80 underline"
                          onClick={() => removeWindMeeting(m.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="block text-xs font-medium text-[#1A1A1A]/65">Title</label>
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={m.title}
                        onChange={(e) => updateWindMeeting(m.id, { title: e.target.value })}
                      />
                      <label className="mt-2 block text-xs font-medium text-[#1A1A1A]/65">Starts (ISO datetime)</label>
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        placeholder="2026-02-02T10:00:00.000Z"
                        value={m.starts_at ?? ''}
                        onChange={(e) =>
                          updateWindMeeting(m.id, {
                            starts_at: e.target.value.trim() || undefined,
                          })
                        }
                      />
                      {m.starts_at && (
                        <p className="mt-1 text-[11px] text-[#1A1A1A]/50">Accra: {formatAccraLocal(m.starts_at)}</p>
                      )}
                      <label className="mt-2 block text-xs font-medium text-[#1A1A1A]/65">Location</label>
                      <input
                        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={m.location ?? ''}
                        onChange={(e) =>
                          updateWindMeeting(m.id, { location: e.target.value.trim() || undefined })
                        }
                      />
                      <label className="mt-2 block text-xs font-medium text-[#1A1A1A]/65">Notes</label>
                      <textarea
                        className="mt-1 min-h-[56px] w-full rounded border border-[#3D2B1F]/20 px-2 py-1.5 text-sm"
                        value={m.notes ?? ''}
                        onChange={(e) =>
                          updateWindMeeting(m.id, { notes: e.target.value.trim() || undefined })
                        }
                      />
                      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-[#1A1A1A]/75">
                        <input
                          type="checkbox"
                          className="rounded border-[#3D2B1F]/30"
                          checked={m.visibility === 'public'}
                          onChange={(e) =>
                            updateWindMeeting(m.id, {
                              visibility: e.target.checked ? 'public' : 'coordinator_only',
                            })
                          }
                        />
                        Show on public memorial
                      </label>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
                  onClick={() => void saveWindMeetings()}
                >
                  Save wind-down meetings
                </button>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Poster</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                {data.poster_approved_at
                  ? `Approved at ${data.poster_approved_at}`
                  : 'Poster generation is Phase 2 (DALL·E). For now you can record family approval.'}
              </p>
              <button type="button" className="text-sm underline" onClick={approvePoster}>
                Record poster approval
              </button>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Tributes</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Attach a photo to any tribute before or after approval. Visitors see images only on approved tributes.
              </p>
              <ul className="space-y-3">
                {data.tributes.length === 0 && (
                  <li className="text-sm text-[#1A1A1A]/60">No tributes yet.</li>
                )}
                {data.tributes.map((t) => (
                  <li key={t.id} className="rounded border border-[#3D2B1F]/15 bg-white p-3 text-sm">
                    <div className="flex flex-wrap gap-3">
                      {t.image_url ? (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-[#3D2B1F]/10">
                          <Image src={t.image_url} alt="" fill className="object-cover" sizes="80px" unoptimized />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {t.author_name}
                          {!t.approved && (
                            <span className="ml-2 text-xs font-normal text-amber-800">· awaiting approval</span>
                          )}
                        </p>
                        {t.message && <p className="mt-1 text-[#1A1A1A]/80">{t.message}</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <MemorialImageFileInput
                            label={t.image_url ? 'Replace photo' : 'Attach photo'}
                            disabled={tributeUploadingId === t.id}
                            onFiles={(files) => {
                              const f = files?.[0]
                              if (f) void uploadTributeImage(t.id, f)
                            }}
                          />
                          {t.image_url && (
                            <button
                              type="button"
                              className="text-xs text-[#C9A02C] underline"
                              onClick={() => void clearTributeImage(t.id)}
                            >
                              Remove photo
                            </button>
                          )}
                          {!t.approved && (
                            <button
                              type="button"
                              className="min-h-[44px] text-xs text-[#C9A02C] underline"
                              onClick={() => approveTribute(t)}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Submit for internal review</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                When the programme and announcement feel right, submit to the Passage review queue. An internal
                admin will move it live.
              </p>
              <button
                type="button"
                disabled={data.status !== 'draft'}
                className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8] disabled:opacity-40"
                onClick={submitReview}
              >
                Submit for review
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
