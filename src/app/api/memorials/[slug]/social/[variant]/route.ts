import { NextResponse } from 'next/server'
import { memorialAbsoluteUrl } from '@/lib/memorial-share'
import { parseSocialVariant, renderMemorialSocialPng } from '@/lib/memorial-social-image'
import { getMemorialBlob, verifyCoordinatorPin } from '@/lib/memorial-store'

export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

function getPin(request: Request): string | undefined {
  const url = new URL(request.url)
  const q = url.searchParams.get('pin')?.trim()
  return request.headers.get('x-passage-pin')?.trim() || (q && q.length ? q : undefined)
}

/**
 * Social export: GET /api/memorials/[slug]/social/square (or story, portrait).
 * Optional `.png` suffix on the variant segment is accepted.
 * Auth: coordinator PIN via `x-passage-pin` or `?pin=` (query is an MVP tradeoff — see README).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string; variant: string }> },
) {
  const { slug, variant: variantRaw } = await context.params
  const variant = parseSocialVariant(variantRaw)
  if (!variant) {
    return NextResponse.json({ error: 'Invalid variant (use square, story, or portrait)' }, { status: 400 })
  }
  const pin = getPin(request)
  if (!pin) {
    return NextResponse.json(
      { error: 'PIN required — send x-passage-pin header or ?pin= query (MVP; see README)' },
      { status: 401 },
    )
  }
  if (!(await verifyCoordinatorPin(slug, pin))) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
  }
  const blob = await getMemorialBlob(slug)
  if (!blob) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const buf = await renderMemorialSocialPng({
      memorial: blob.memorial,
      memorialPageUrl: memorialAbsoluteUrl(slug),
      variant,
    })
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="passage-${slug}-${variant}.png"`,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Export failed'
    return NextResponse.json({ error: msg }, { status: 422 })
  }
}
