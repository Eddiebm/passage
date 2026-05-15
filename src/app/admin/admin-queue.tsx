'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Memorial } from '@/lib/types'
import { SiteHeader } from '@/components/site-header'

export function AdminQueue() {
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  async function login() {
    setMsg(null)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) {
      const j = await res.json()
      setMsg(j.error || 'Login failed')
      return
    }
    setLoggedIn(true)
    await refresh()
  }

  async function refresh() {
    const res = await fetch('/api/admin/pending')
    if (!res.ok) {
      setLoggedIn(false)
      return
    }
    const json = (await res.json()) as { memorials: Memorial[] }
    setMemorials(json.memorials)
  }

  async function approve(slug: string) {
    const res = await fetch(`/api/admin/approve/${slug}`, { method: 'POST' })
    if (!res.ok) {
      setMsg('Approve failed')
      return
    }
    setMsg(`Approved ${slug}`)
    await refresh()
  }

  return (
    <div className="min-h-full bg-[#1A1A1A] text-[#FAFAF8]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold">Internal review queue</h1>
        {!loggedIn ? (
          <div className="space-y-3 rounded-lg border border-[#3D2B1F]/40 bg-[#3D2B1F]/20 p-4">
            <p className="text-sm text-[#FAFAF8]/80">
              Set <code className="text-[#C9A02C]">PASSAGE_ADMIN_PASSWORD</code> in your environment, then sign in
              here.
            </p>
            <input
              type="password"
              className="w-full max-w-xs rounded border border-[#FAFAF8]/20 bg-[#1A1A1A] px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
            />
            <button
              type="button"
              className="block rounded-md bg-[#C9A02C] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
              onClick={login}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button type="button" className="text-sm text-[#C9A02C] underline" onClick={refresh}>
              Refresh
            </button>
            {memorials.length === 0 && <p className="text-sm text-[#FAFAF8]/70">No memorials pending review.</p>}
            <ul className="space-y-3">
              {memorials.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#3D2B1F]/40 bg-[#3D2B1F]/20 p-4">
                  <div>
                    <p className="font-medium">{m.deceased_name}</p>
                    <p className="text-xs text-[#FAFAF8]/60">{m.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/memorial/${m.slug}`} className="text-sm text-[#C9A02C] underline">
                      View
                    </Link>
                    <button
                      type="button"
                      className="rounded-md bg-[#C9A02C] px-3 py-1 text-xs font-medium text-[#1A1A1A]"
                      onClick={() => approve(m.slug)}
                    >
                      Approve (go live)
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {msg && <p className="text-sm text-[#FAFAF8]/80">{msg}</p>}
      </div>
    </div>
  )
}
