import { NextResponse } from 'next/server'
import { generateThankYouDraft } from '@/lib/openai-copy'

export async function POST(request: Request) {
  const body = await request.json()
  const text = await generateThankYouDraft({
    deceased_name: body.deceased_name,
    contributor_name: body.contributor_name,
    amount: Number(body.amount) || 0,
    currency: body.currency ?? 'GHS',
  })
  return NextResponse.json({ text })
}
