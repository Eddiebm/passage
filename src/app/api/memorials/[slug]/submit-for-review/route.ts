import { NextResponse } from 'next/server'
import { submitMemorialForReview } from '@/lib/memorial-store'

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const body = (await request.json()) as { pin?: string }
  const pin = request.headers.get('x-passage-pin')?.trim() || body.pin?.trim()
  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 401 })
  }
  const memorial = await submitMemorialForReview(slug, pin)
  if (!memorial) {
    return NextResponse.json({ error: 'Not found, invalid PIN, or wrong status' }, { status: 403 })
  }
  return NextResponse.json({ memorial })
}
