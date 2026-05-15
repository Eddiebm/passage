import { NextResponse } from 'next/server'
import { generateAnnouncementDraft } from '@/lib/openai-copy'

export async function POST(request: Request) {
  const body = await request.json()
  const text = await generateAnnouncementDraft({ memorial: body.memorial })
  return NextResponse.json({ text })
}
