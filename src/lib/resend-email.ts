import { Resend } from 'resend'

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export function resendFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Passage <onboarding@resend.dev>'
  )
}

export async function sendPlainEmail(input: {
  to: string
  subject: string
  text: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not set on the server.' }
  }
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: resendFromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
  })
  if (error) {
    return { ok: false, error: error.message || 'Resend send failed' }
  }
  return { ok: true }
}
