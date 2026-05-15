'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

function ContributeInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const [amount, setAmount] = useState('200')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [devReference, setDevReference] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref')
    const verify = searchParams.get('verify')
    if (verify && ref) {
      const storedAmount = sessionStorage.getItem(`passage_pay_${slug}_amount`) || amount
      void (async () => {
        const res = await fetch(`/api/memorials/${slug}/paystack/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: ref, amount: Number(storedAmount) }),
        })
        const json = await res.json()
        if (res.ok) setStatus('Payment recorded. Thank you.')
        else setStatus(json.detail || 'Verification failed')
      })()
    }
  }, [searchParams, slug, amount])

  async function startPay() {
    setStatus('Starting…')
    const res = await fetch(`/api/memorials/${slug}/paystack/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        amount: Number(amount),
        contributor_name: name,
        message,
      }),
    })
    const json = (await res.json()) as {
      mode?: string
      authorization_url?: string | null
      reference?: string
      message?: string
      error?: string
    }
    if (!res.ok) {
      setStatus(json.error || 'Could not start payment')
      return
    }
    if (json.mode === 'live' && json.authorization_url) {
      sessionStorage.setItem(`passage_pay_${slug}_amount`, amount)
      window.location.href = json.authorization_url
      return
    }
    if (json.reference) {
      setDevReference(json.reference)
      sessionStorage.setItem(`passage_pay_${slug}_amount`, amount)
      setStatus(
        json.message ||
          'Paystack is in placeholder mode. Use the button below to simulate a successful payment locally.',
      )
    }
  }

  async function simulateDevPaid() {
    if (!devReference) return
    const res = await fetch(`/api/memorials/${slug}/paystack/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: devReference, amount: Number(amount) }),
    })
    const json = await res.json()
    if (res.ok) setStatus('Local payment recorded. Thank you.')
    else setStatus(json.detail || 'Verify failed')
  }

  return (
    <div className="min-h-full bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <Link href={`/memorial/${slug}`} className="text-sm text-[#C9A02C] underline">
          ← Back to memorial
        </Link>
        <h1 className="text-2xl font-semibold">Contribute</h1>
        <p className="text-sm text-[#1A1A1A]/70">
          Support the family in a difficult season. Payments are processed with Paystack when configured.
        </p>
        <div className="space-y-3 rounded-lg border border-[#3D2B1F]/15 bg-white p-4">
          <Field label="Amount" value={amount} onChange={setAmount} />
          <Field label="Email (for receipt)" value={email} onChange={setEmail} type="email" />
          <Field label="Your name" value={name} onChange={setName} />
          <div>
            <label className="text-xs font-medium text-[#1A1A1A]/70">Message (optional)</label>
            <textarea
              className="mt-1 min-h-[80px] w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="w-full rounded-md bg-[#1A1A1A] py-2 text-sm font-medium text-[#FAFAF8]"
            onClick={startPay}
          >
            Continue to Paystack
          </button>
          {devReference && (
            <button
              type="button"
              className="w-full rounded-md border border-[#C9A02C] py-2 text-sm font-medium text-[#1A1A1A]"
              onClick={simulateDevPaid}
            >
              Simulate successful payment (local dev)
            </button>
          )}
        </div>
        {status && <p className="text-sm text-[#3D2B1F]">{status}</p>}
      </div>
    </div>
  )
}

export function ContributePageClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <ContributeInner slug={slug} />
    </Suspense>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#1A1A1A]/70">{label}</label>
      <input
        type={type}
        className="mt-1 w-full rounded border border-[#3D2B1F]/20 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
