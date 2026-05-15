import { Buffer } from 'node:buffer'
import { NextResponse } from 'next/server'
import { storeMemorialImage, storeMemorialTributeImage } from '@/lib/media-storage'
import { optimizeMemorialImageForStorage } from '@/lib/memorial-image-optimize'
import { validateMemorialImageBuffer } from '@/lib/memorial-image'
import {
  getMemorialBlob,
  setTributeImageWithPin,
  updateMemorialWithPin,
  verifyCoordinatorPin,
} from '@/lib/memorial-store'

export const runtime = 'nodejs'

function getPin(request: Request, form: FormData): string | undefined {
  return request.headers.get('x-passage-pin')?.trim() || String(form.get('pin') || '').trim() || undefined
}

function parseSlot(raw: string): 'primary' | 'gallery' | 'tribute' | 'programme' {
  const slot = raw.trim().toLowerCase()
  if (slot === 'primary') return 'primary'
  if (slot === 'tribute') return 'tribute'
  if (slot === 'programme') return 'programme'
  return 'gallery'
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const pin = getPin(request, form)
  if (!pin || !(await verifyCoordinatorPin(slug, pin))) {
    return NextResponse.json({ error: 'PIN required or invalid' }, { status: 403 })
  }

  const fileEntry = form.get('file')
  if (!(fileEntry instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }

  const slot = parseSlot(String(form.get('slot') || 'gallery'))

  const arrayBuffer = await fileEntry.arrayBuffer()
  const validated = validateMemorialImageBuffer(arrayBuffer)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  let bytes: Buffer
  let contentType = validated.contentType
  try {
    const optimized = await optimizeMemorialImageForStorage(Buffer.from(arrayBuffer), validated.contentType)
    bytes = optimized.bytes
    contentType = optimized.contentType
  } catch {
    return NextResponse.json({ error: 'Could not process image.' }, { status: 400 })
  }

  if (slot === 'tribute') {
    const tributeId = String(form.get('tribute_id') || '').trim()
    if (!tributeId) {
      return NextResponse.json({ error: 'Missing tribute_id for tribute slot' }, { status: 400 })
    }
    const blob = await getMemorialBlob(slug)
    if (!blob) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
    }
    if (!blob.tributes.some((t) => t.id === tributeId)) {
      return NextResponse.json({ error: 'Tribute not found' }, { status: 404 })
    }

    let url: string
    let backend: string
    try {
      const stored = await storeMemorialTributeImage(slug, tributeId, bytes, contentType)
      url = stored.url
      backend = stored.backend
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed'
      return NextResponse.json({ error: message }, { status: 503 })
    }

    const tribute = await setTributeImageWithPin(slug, pin, tributeId, url)
    if (!tribute) {
      return NextResponse.json({ error: 'Could not save tribute image' }, { status: 403 })
    }
    return NextResponse.json({ url, backend, slot, tribute })
  }

  let url: string
  let backend: string
  try {
    const stored = await storeMemorialImage(slug, bytes, contentType)
    url = stored.url
    backend = stored.backend
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 503 })
  }

  const blob = await getMemorialBlob(slug)
  if (!blob) {
    return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
  }

  if (slot === 'primary') {
    const memorial = await updateMemorialWithPin(slug, pin, { photo_url: url })
    if (!memorial) {
      return NextResponse.json({ error: 'Could not save image' }, { status: 403 })
    }
    return NextResponse.json({ url, backend, slot, memorial })
  }

  if (slot === 'programme') {
    return NextResponse.json({ url, backend, slot })
  }

  const existing = blob.memorial.gallery_urls ?? []
  const memorial = await updateMemorialWithPin(slug, pin, {
    gallery_urls: [...existing, url],
  })
  if (!memorial) {
    return NextResponse.json({ error: 'Could not save image' }, { status: 403 })
  }
  return NextResponse.json({ url, backend, slot, memorial })
}
