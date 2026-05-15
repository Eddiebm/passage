import { NextResponse } from 'next/server'
import { clearTributeImageWithPin } from '@/lib/memorial-store'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await context.params
  const pin = request.headers.get('x-passage-pin')?.trim()
  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 403 })
  }
  const tribute = await clearTributeImageWithPin(slug, pin, id)
  if (!tribute) {
    return NextResponse.json({ error: 'PIN invalid or tribute not found' }, { status: 403 })
  }
  return NextResponse.json({ tribute })
}
