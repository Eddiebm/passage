import { NextResponse } from 'next/server'
import { requestPinRecovery } from '@/lib/pin-recovery'

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  let body: { email?: string }
  try {
    body = (await request.json()) as { email?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  const result = await requestPinRecovery(slug, email)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    ok: true,
    message:
      'If that email matches our records for this memorial, we sent a recovery link. Check your inbox.',
    emailed: result.emailed,
  })
}
