import { NextResponse } from 'next/server'
import { approveTributeWithPin } from '@/lib/memorial-store'

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await context.params
  const body = (await request.json()) as { pin?: string }
  const pin = request.headers.get('x-passage-pin')?.trim() || body.pin?.trim()
  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 401 })
  }
  const tribute = await approveTributeWithPin(slug, pin, id)
  if (!tribute) {
    return NextResponse.json({ error: 'Not found or invalid PIN' }, { status: 403 })
  }
  return NextResponse.json({ tribute })
}
