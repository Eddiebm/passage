import { NextResponse } from 'next/server'
import {
  getMemorialWithDetails,
  updateMemorialWithPin,
  verifyCoordinatorPin,
} from '@/lib/memorial-store'
import type { MemorialEvent } from '@/lib/types'

function getPin(request: Request, body: { pin?: string }): string | undefined {
  return request.headers.get('x-passage-pin')?.trim() || body.pin?.trim()
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const pin = request.headers.get('x-passage-pin')?.trim()
  const coordinator = pin && (await verifyCoordinatorPin(slug, pin))
  const data = await getMemorialWithDetails(slug, {
    includeAllTributes: Boolean(coordinator),
  })
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ memorial: data })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const body = (await request.json()) as {
    pin?: string
    announcement_text?: string
    fundraising_active?: boolean
    fundraising_goal?: number
    fundraising_currency?: string
    fundraising_label?: string
    fundraising_appeal?: string
    poster_url?: string
    poster_approved_at?: string
    events?: MemorialEvent[]
  }
  const pin = getPin(request, body)
  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 401 })
  }

  const updated = await updateMemorialWithPin(slug, pin, {
    announcement_text: body.announcement_text,
    fundraising_active: body.fundraising_active,
    fundraising_goal: body.fundraising_goal,
    fundraising_currency: body.fundraising_currency,
    fundraising_label: body.fundraising_label,
    fundraising_appeal: body.fundraising_appeal,
    poster_url: body.poster_url,
    poster_approved_at: body.poster_approved_at,
    events: body.events,
  })
  if (!updated) {
    return NextResponse.json({ error: 'Not found or invalid PIN' }, { status: 403 })
  }
  return NextResponse.json({ memorial: updated })
}
