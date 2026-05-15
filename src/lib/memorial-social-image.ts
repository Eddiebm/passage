import sharp from 'sharp'
import type { Memorial } from '@/lib/types'

export type SocialImageVariant = 'square' | 'story' | 'portrait'

const VARIANT_SIZE: Record<SocialImageVariant, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  portrait: { w: 1080, h: 1350 },
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function pickSourceImageUrl(memorial: Memorial): string | null {
  const primary = memorial.photo_url?.trim()
  if (primary) return primary
  const g = memorial.gallery_urls?.find((u) => u?.trim())
  return g?.trim() ?? null
}

function formatDatesLine(m: Memorial): string {
  const birth = m.date_of_birth?.trim()
  const pass = m.date_of_passing?.trim()
  if (birth && pass) return `${birth} — ${pass}`
  if (pass) return `Sunset: ${pass}`
  return ''
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

/**
 * Raster social crop (1080-based) with name, dates, and memorial URL overlay.
 * Requires Node runtime (sharp).
 */
export async function renderMemorialSocialPng(input: {
  memorial: Memorial
  memorialPageUrl: string
  variant: SocialImageVariant
}): Promise<Buffer> {
  const { w, h } = VARIANT_SIZE[input.variant]
  const srcUrl = pickSourceImageUrl(input.memorial)
  if (!srcUrl) {
    throw new Error('No photo_url or gallery image available for social export')
  }

  const res = await fetch(srcUrl, { redirect: 'follow' })
  if (!res.ok) {
    throw new Error(`Could not fetch source image (${res.status})`)
  }
  const arrayBuf = await res.arrayBuffer()
  const base = await sharp(Buffer.from(arrayBuf))
    .rotate()
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.92, saturation: 0.95 })
    .png()
    .toBuffer()

  const name = escapeXml(truncate(input.memorial.deceased_name.trim() || 'In memoriam', 80))
  const dates = escapeXml(truncate(formatDatesLine(input.memorial), 96))
  const url = escapeXml(truncate(input.memorialPageUrl.replace(/^https?:\/\//, ''), 72))

  const overlaySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#0a0a0a" stop-opacity="0.78"/>
      <stop offset="55%" stop-color="#0a0a0a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${Math.round(h * 0.42)}" width="${w}" height="${Math.round(h * 0.58)}" fill="url(#g)"/>
  <text x="48" y="${h - 120}" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="600" fill="#FAFAF8">${name}</text>
  <text x="48" y="${h - 62}" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#FAFAF8" fill-opacity="0.92">${dates}</text>
  <text x="48" y="${h - 22}" font-family="ui-monospace, monospace" font-size="22" fill="#FAFAF8" fill-opacity="0.78">${url}</text>
</svg>`

  return sharp(base)
    .composite([
      {
        input: Buffer.from(overlaySvg),
        top: 0,
        left: 0,
      },
    ])
    .png({ compressionLevel: 8 })
    .toBuffer()
}

export function parseSocialVariant(raw: string): SocialImageVariant | null {
  const v = raw.replace(/\.png$/i, '').trim().toLowerCase()
  if (v === 'square' || v === 'story' || v === 'portrait') return v
  return null
}
