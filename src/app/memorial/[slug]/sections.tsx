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
    <section className="passage-rule-block max-w-xl space-y-4 p-0 pt-6">
      <h2 className="passage-section-title border-0 pb-0">{headline ?? 'Leave a tribute'}</h2>
      <p className="text-sm text-[var(--passage-muted)]">
        Tributes appear after the family approves them. Video upload is planned for a later release.
      </p>
      <form className="space-y-3" onSubmit={submitTribute}>
        <div>
          <label className="text-xs font-medium text-[var(--passage-muted)]">Your name</label>
          <input
            className="mt-1 w-full border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-surface)] px-3 py-2 text-sm text-[var(--passage-text)]"
            style={{ borderRadius: 'var(--passage-radius)' }}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--passage-muted)]">Location (optional)</label>
          <input
            className="mt-1 w-full border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-surface)] px-3 py-2 text-sm text-[var(--passage-text)]"
            style={{ borderRadius: 'var(--passage-radius)' }}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--passage-muted)]">Message</label>
          <textarea
            className="mt-1 min-h-[120px] w-full border border-[color-mix(in_srgb,var(--passage-rule)_25%,transparent)] bg-[var(--passage-surface)] px-3 py-2 text-sm text-[var(--passage-text)]"
            style={{ borderRadius: 'var(--passage-radius)' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] border border-[color-mix(in_srgb,var(--passage-rule)_35%,transparent)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--passage-link)] underline-offset-4 hover:underline"
        >
          Submit tribute
        </button>
      </form>
      {status && <p className="text-sm text-[var(--passage-heading)]">{status}</p>}
    </section>
  )
}
