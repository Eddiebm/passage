import { NextResponse } from 'next/server'
import { generateFundraisingAppealDraft } from '@/lib/openai-copy'

export async function POST(request: Request) {
  const body = await request.json()
  const text = await generateFundraisingAppealDraft({
    memorial: body.memorial,
    goal: body.goal,
    currency: body.currency ?? 'GHS',
  })
  return NextResponse.json({ text })
}
