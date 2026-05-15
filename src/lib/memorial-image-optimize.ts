import sharp from 'sharp'
import type { MemorialImageMime } from '@/lib/memorial-image'

const MAX_WIDTH = 1920
const WEBP_QUALITY = 85

/**
 * Resize memorial photos for storage (max width 1920px).
 * JPEG/WebP and opaque PNG → WebP; PNG with alpha → resized PNG.
 */
export async function optimizeMemorialImageForStorage(
  bytes: Buffer,
  sourceMime: MemorialImageMime,
): Promise<{ bytes: Buffer; contentType: MemorialImageMime }> {
  const base = sharp(bytes, { failOn: 'none' }).rotate()
  const meta = await base.metadata()
  const resize =
    meta.width && meta.width > MAX_WIDTH
      ? { width: MAX_WIDTH, withoutEnlargement: true as const }
      : undefined

  const keepPng = sourceMime === 'image/png' && meta.hasAlpha === true
  if (keepPng) {
    let pipeline = base
    if (resize) pipeline = pipeline.resize(resize)
    const out = await pipeline.png({ compressionLevel: 9 }).toBuffer()
    return { bytes: out, contentType: 'image/png' }
  }

  let pipeline = base
  if (resize) pipeline = pipeline.resize(resize)
  const out = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
  return { bytes: out, contentType: 'image/webp' }
}
