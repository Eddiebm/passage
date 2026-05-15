import { v4 as uuid } from 'uuid'

const PAYSTACK_BASE = 'https://api.paystack.co'

export type PaystackInitResult =
  | {
      ok: true
      mode: 'live'
      authorization_url: string
      access_code: string
      reference: string
    }
  | {
      ok: true
      mode: 'placeholder'
      authorization_url: null
      access_code: null
      reference: string
      message: string
    }

export async function paystackInitializeTransaction(input: {
  email: string
  amountMinorUnits: number
  currency: string
  callbackUrl: string
  metadata: Record<string, string>
}): Promise<PaystackInitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) {
    // TODO(Paystack): wire live initialization when PAYSTACK_SECRET_KEY is set.
    return {
      ok: true,
      mode: 'placeholder',
      authorization_url: null,
      access_code: null,
      reference: `dev_${uuid()}`,
      message:
        'Paystack is not configured (missing PAYSTACK_SECRET_KEY). This reference is for local testing only.',
    }
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountMinorUnits,
      currency: input.currency,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  })
  const json = (await res.json()) as {
    status?: boolean
    message?: string
    data?: { authorization_url: string; access_code: string; reference: string }
  }
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || 'Paystack initialize failed')
  }
  return {
    ok: true,
    mode: 'live',
    authorization_url: json.data.authorization_url,
    access_code: json.data.access_code,
    reference: json.data.reference,
  }
}

export async function paystackVerifyReference(reference: string): Promise<{
  ok: boolean
  paid: boolean
  amount?: number
  currency?: string
  customer?: { email?: string }
  metadata?: Record<string, string>
  rawMessage?: string
}> {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) {
    // TODO(Paystack): verify against Paystack API in production.
    return {
      ok: true,
      paid: reference.startsWith('dev_'),
      rawMessage: 'No PAYSTACK_SECRET_KEY — treating dev_* references as paid for local MVP.',
    }
  }
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const json = (await res.json()) as {
    status?: boolean
    message?: string
    data?: { status?: string; amount?: number; currency?: string; customer?: { email?: string }; metadata?: Record<string, string> }
  }
  if (!res.ok || !json.status || !json.data) {
    return { ok: false, paid: false, rawMessage: json.message }
  }
  const paid = json.data.status === 'success'
  return {
    ok: true,
    paid,
    amount: json.data.amount,
    currency: json.data.currency,
    customer: json.data.customer,
    metadata: json.data.metadata,
  }
}
