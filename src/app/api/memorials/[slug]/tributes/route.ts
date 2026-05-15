import { NextResponse } from 'next/server'
import { addTribute, getMemorialWithDetails } from '@/lib/memorial-store'

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const data = await getMemorialWithDetails(slug)
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ tributes: data.tributes })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const body = (await request.json()) as {
    author_name?: string
    author_location?: string
    message?: string
    video_url?: string
  }
  if (!body.author_name?.trim()) {
    return NextResponse.json({ error: 'author_name required' }, { status: 400 })
  }
  const tribute = await addTribute(slug, {
    author_name: body.author_name.trim(),
    author_location: body.author_location?.trim(),
    message: body.message?.trim(),
    video_url: body.video_url?.trim(),
  })
  if (!tribute) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ tribute })
}
