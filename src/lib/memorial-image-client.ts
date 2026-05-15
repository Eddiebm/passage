/**
 * Client-side upload helper for coordinator memorial images.
 * Sends multipart FormData with `x-passage-pin` (never JSON body for the file).
 */
export type MemorialImageSlot = 'primary' | 'gallery' | 'tribute' | 'programme'

export type BatchUploadItemResult =
  | { ok: true; name: string; url: string }
  | { ok: false; name: string; error: string }

export async function uploadMemorialImage(
  slug: string,
  pin: string,
  file: File,
  slot: MemorialImageSlot,
  tributeId?: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('slot', slot)
  if (slot === 'tribute' && tributeId) {
    fd.append('tribute_id', tributeId)
  }
  const res = await fetch(`/api/memorials/${slug}/images`, {
    method: 'POST',
    headers: { 'x-passage-pin': pin },
    body: fd,
  })
  const json = (await res.json()) as { error?: string; url?: string }
  if (!res.ok) {
    return { ok: false, error: json.error || 'Upload failed.' }
  }
  if (!json.url) {
    return { ok: false, error: 'Upload succeeded but no URL was returned.' }
  }
  return { ok: true, url: json.url }
}

/** Upload files one at a time; continues after per-file failures. */
export async function uploadMemorialImagesSequential(
  slug: string,
  pin: string,
  files: File[],
  slot: Exclude<MemorialImageSlot, 'tribute' | 'programme'>,
  onProgress?: (current: number, total: number, fileName: string) => void,
): Promise<BatchUploadItemResult[]> {
  const results: BatchUploadItemResult[] = []
  const total = files.length
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.(i + 1, total, file.name)
    const up = await uploadMemorialImage(slug, pin, file, slot)
    if (up.ok) {
      results.push({ ok: true, name: file.name, url: up.url })
    } else {
      results.push({ ok: false, name: file.name, error: up.error })
    }
  }
  return results
}

export async function uploadMemorialTributeImage(
  slug: string,
  pin: string,
  tributeId: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  return uploadMemorialImage(slug, pin, file, 'tribute', tributeId)
}
