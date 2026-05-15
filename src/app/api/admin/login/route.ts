import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PASSAGE_ADMIN_COOKIE } from '@/lib/admin-session'

export async function POST(request: Request) {
  const expected = process.env.PASSAGE_ADMIN_PASSWORD?.trim()
  if (!expected) {
    return NextResponse.json(
      { error: 'Set PASSAGE_ADMIN_PASSWORD to enable admin.' },
      { status: 503 },
    )
  }
  const body = (await request.json()) as { password?: string }
  if (body.password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  const jar = await cookies()
  jar.set(PASSAGE_ADMIN_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return NextResponse.json({ ok: true })
}
