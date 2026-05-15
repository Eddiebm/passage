'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MemorialWithDetails, Tribute } from '@/lib/types'
import { SiteHeader } from '@/components/site-header'

export function EditPortal({ slug }: { slug: string }) {
  const [pin, setPin] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState<MemorialWithDetails | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

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
    const json = (await res.json()) as { memorial: MemorialWithDetails }
    setData(json.memorial)
    setAnnouncement(json.memorial.announcement_text || '')
    setLoaded(true)
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

        {msg && <p className="text-sm text-[#3D2B1F]">{msg}</p>}

        {loaded && data && (
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-wider text-[#C9A02C]">Status: {data.status}</p>

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
              <h2 className="font-semibold">Tributes awaiting approval</h2>
              <ul className="space-y-3">
                {data.tributes.filter((t) => !t.approved).length === 0 && (
                  <li className="text-sm text-[#1A1A1A]/60">No pending tributes.</li>
                )}
                {data.tributes
                  .filter((t) => !t.approved)
                  .map((t) => (
                    <li key={t.id} className="rounded border border-[#3D2B1F]/15 bg-white p-3 text-sm">
                      <p className="font-medium">{t.author_name}</p>
                      <p className="text-[#1A1A1A]/80">{t.message}</p>
                      <button type="button" className="mt-2 text-xs text-[#C9A02C] underline" onClick={() => approveTribute(t)}>
                        Approve
                      </button>
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
