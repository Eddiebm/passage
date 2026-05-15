import { NextResponse } from 'next/server'
import {
  getMemorialBlob,
  getMemorialWithDetails,
  updateMemorialWithPin,
  verifyCoordinatorPin,
} from '@/lib/memorial-store'
import type { Contribution } from '@/lib/types'
import { parseStructuredMemorialPatch } from '@/lib/memorial-patch-body'
import type { MemorialEvent, MemorialMode, WindDownMeeting } from '@/lib/types'

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
    includeCoordinatorFields: Boolean(coordinator),
  })
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  let contributions: Contribution[] | undefined
  let scheduler_available = false
  if (coordinator) {
    const blob = await getMemorialBlob(slug)
    contributions = blob?.contributions
    const { reminderJobsAvailable } = await import('@/lib/reminder-jobs')
    scheduler_available = reminderJobsAvailable()
  }
  return NextResponse.json({
    memorial: data,
    ...(contributions ? { contributions } : {}),
    scheduler_available,
  })
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
    photo_url?: string | null
    gallery_urls?: string[]
    events?: MemorialEvent[]
    closing_thank_you?: string
    wind_down_meetings?: WindDownMeeting[]
    memorial_mode?: MemorialMode
  }
  const pin = getPin(request, body)
  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 401 })
  }

  const structured = parseStructuredMemorialPatch(body)
  if (!structured.ok) {
    return NextResponse.json({ error: structured.error }, { status: 400 })
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
    photo_url: body.photo_url as string | null | undefined,
    gallery_urls: body.gallery_urls,
    closing_thank_you: body.closing_thank_you,
    wind_down_meetings: body.wind_down_meetings,
    ...structured.patch,
  })
  if (!updated) {
    return NextResponse.json({ error: 'Not found or invalid PIN' }, { status: 403 })
  }
  return NextResponse.json({ memorial: updated })
}
