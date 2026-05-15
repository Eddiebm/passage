'use client'

import { useState } from 'react'

export function MemorialClientSections({
  slug,
  headline,
}: {
  slug: string
  headline?: string
}) {
  const [authorName, setAuthorName] = useState('')
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function submitTribute(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Sending…')
    const res = await fetch(`/api/memorials/${slug}/tributes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: authorName,
        message,
        author_location: location,
      }),
    })
    if (!res.ok) {
      setStatus('Could not send tribute. Try again.')
      return
    }
    setStatus('Thank you. Your tribute is awaiting family approval.')
    setAuthorName('')
    setMessage('')
    setLocation('')
  }

  return (
    <section className="max-w-xl space-y-4 rounded-lg border border-[#3D2B1F]/15 bg-white p-6">
      <h2 className="text-lg font-semibold text-[#3D2B1F]">{headline ?? 'Leave a tribute'}</h2>
      <p className="text-sm text-[#1A1A1A]/70">
        Tributes appear after the family approves them. Video upload is planned for a later release.
      </p>
      <form className="space-y-3" onSubmit={submitTribute}>
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/70">Your name</label>
          <input
            className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/70">Location (optional)</label>
          <input
            className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#1A1A1A]/70">Message</label>
          <textarea
            className="mt-1 min-h-[120px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#d4ae3f]"
        >
          Submit tribute
        </button>
      </form>
      {status && <p className="text-sm text-[#3D2B1F]">{status}</p>}
    </section>
  )
}
