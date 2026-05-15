const MAX_BYTES = 8 * 1024 * 1024

/** Use on `<input type="file" accept={...} />` for coordinator uploads. */
export const MEMORIAL_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

export type MemorialImageMime = 'image/jpeg' | 'image/png' | 'image/webp'

export function validateMemorialImageFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  const allowed = new Set<string>(['image/jpeg', 'image/png', 'image/webp'])
  if (!allowed.has(file.type)) {
    return { ok: false, error: 'Use JPEG, PNG, or WebP.' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'File too large (maximum 8MB).' }
  }
  if (file.size === 0) {
    return { ok: false, error: 'Empty file.' }
  }
  return { ok: true }
}

export function validateMemorialImageBuffer(
  buffer: ArrayBuffer,
): { ok: true; contentType: MemorialImageMime } | { ok: false; error: string } {
  if (buffer.byteLength === 0) {
    return { ok: false, error: 'Empty file.' }
  }
  if (buffer.byteLength > MAX_BYTES) {
    return { ok: false, error: 'File too large (maximum 8MB).' }
  }
  const b = new Uint8Array(buffer.slice(0, 16))

  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { ok: true, contentType: 'image/jpeg' }
  }
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return { ok: true, contentType: 'image/png' }
  }
  const webp =
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  if (webp) {
    return { ok: true, contentType: 'image/webp' }
  }
  return { ok: false, error: 'Unsupported format. Use JPEG, PNG, or WebP.' }
}
