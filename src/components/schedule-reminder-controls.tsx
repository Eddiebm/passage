'use client'

import { useState } from 'react'

type ReminderKind = 'task' | 'event' | 'pledge'

function presetSendAt(preset: 'tomorrow_8am' | 'in_24h'): string {
  const now = new Date()
  if (preset === 'tomorrow_8am') {
    const d = new Date(now)
    d.setDate(d.getDate() + 1)
    d.setHours(8, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  }
  const d = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 16)
}

export function ScheduleReminderControls(props: {
  slug: string
  pin: string
  kind: ReminderKind
  targetId: string
  template: string
  toEmail: string
  schedulerAvailable: boolean
  onMessage: (msg: string) => void
}) {
  const [sendAtLocal, setSendAtLocal] = useState(presetSendAt('tomorrow_8am'))
  const [busy, setBusy] = useState(false)

  if (!props.schedulerAvailable) {
    return (
      <p className="text-[10px] text-[#1A1A1A]/55">
        Scheduled email requires Postgres (<code>003_reminder_jobs.sql</code>) and{' '}
        <code>CRON_SECRET</code> on Vercel.
      </p>
    )
  }

  async function schedule() {
    if (!props.pin) {
      props.onMessage('Enter your PIN first.')
      return
    }
    const to = props.toEmail.trim()
    if (!to) {
      props.onMessage('Enter a recipient email above.')
      return
    }
    const sendAt = new Date(sendAtLocal)
    if (Number.isNaN(sendAt.getTime())) {
      props.onMessage('Pick a valid date and time.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/memorials/${props.slug}/reminders/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-passage-pin': props.pin },
        body: JSON.stringify({
          pin: props.pin,
          kind: props.kind,
          target_id: props.targetId,
          template: props.template,
          to_email: to,
          send_at: sendAt.toISOString(),
          channel: 'email',
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { detail?: string; error?: string }
      if (!res.ok) {
        props.onMessage(json.detail || json.error || 'Could not schedule reminder.')
        return
      }
      props.onMessage(`Email scheduled for ${sendAt.toLocaleString('en-GB', { timeZone: 'Africa/Accra' })} (Accra).`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 space-y-2 rounded border border-dashed border-[#3D2B1F]/15 p-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#1A1A1A]/50">Schedule email</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-[#3D2B1F]/20 px-2 py-0.5 text-[10px]"
          disabled={busy}
          onClick={() => setSendAtLocal(presetSendAt('tomorrow_8am'))}
        >
          Tomorrow 8am
        </button>
        <button
          type="button"
          className="rounded border border-[#3D2B1F]/20 px-2 py-0.5 text-[10px]"
          disabled={busy}
          onClick={() => setSendAtLocal(presetSendAt('in_24h'))}
        >
          In 24h
        </button>
      </div>
      <label className="block text-[10px] text-[#1A1A1A]/65">
        Send at (local)
        <input
          type="datetime-local"
          className="mt-0.5 w-full max-w-xs rounded border border-[#3D2B1F]/20 px-2 py-1 text-xs"
          value={sendAtLocal}
          onChange={(e) => setSendAtLocal(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        className="rounded bg-[#3D2B1F]/90 px-2 py-1 text-[10px] font-medium text-[#FAFAF8] disabled:opacity-50"
        onClick={() => void schedule()}
      >
        {busy ? 'Scheduling…' : 'Schedule'}
      </button>
    </div>
  )
}
