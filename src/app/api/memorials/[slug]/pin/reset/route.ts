import { NextResponse } from 'next/server'
import { resetCoordinatorPinWithToken } from '@/lib/pin-recovery'

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  let body: { token?: string; new_pin?: string }
  try {
    body = (await request.json()) as { token?: string; new_pin?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const newPin = typeof body.new_pin === 'string' ? body.new_pin : ''
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  const result = await resetCoordinatorPinWithToken(slug, token, newPin)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ ok: true, message: 'PIN updated. Sign in with your new PIN.' })
}
