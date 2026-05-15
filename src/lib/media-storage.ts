import { randomUUID } from 'node:crypto'
import path from 'node:path'

export type MemorialMediaBackend = 'vercel_blob' | 'local_dev'

export function resolveMemorialMediaBackend(): MemorialMediaBackend | 'none' {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return 'vercel_blob'
  if (process.env.NODE_ENV === 'development') return 'local_dev'
  return 'none'
}

export function memorialMediaBackendDescription(): string {
  const b = resolveMemorialMediaBackend()
  switch (b) {
    case 'vercel_blob':
      return 'Vercel Blob (public)'
    case 'local_dev':
      return 'Local .passage-dev/uploads (development only; URLs are /api/uploads/…)'
    case 'none':
      return 'Not configured'
  }
}

type Mime = 'image/jpeg' | 'image/png' | 'image/webp'

function extForMime(mime: Mime): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  return 'webp'
}

/**
 * Persists memorial image bytes. Priority: Vercel Blob → local dev uploads.
 * Returns a public or app-relative URL stored on the memorial record.
 */
export async function storeMemorialImage(
  slug: string,
  bytes: Buffer,
  contentType: Mime,
): Promise<{ url: string; backend: MemorialMediaBackend }> {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-').slice(0, 120) || 'memorial'
  const objectKey = `memorials/${safeSlug}/${randomUUID()}.${extForMime(contentType)}`

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (blobToken) {
    const { put } = await import('@vercel/blob')
    const uploaded = await put(objectKey, bytes, {
      access: 'public',
      token: blobToken,
      contentType,
    })
    return { url: uploaded.url, backend: 'vercel_blob' }
  }

  if (process.env.NODE_ENV === 'development') {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const relativePosix = objectKey.replace(/\\/g, '/')
    const diskPath = path.join(process.cwd(), '.passage-dev', 'uploads', ...relativePosix.split('/'))
    await mkdir(path.dirname(diskPath), { recursive: true })
    await writeFile(diskPath, bytes)
    return { url: `/api/uploads/${relativePosix}`, backend: 'local_dev' }
  }

  throw new Error(
    'Uploads are disabled: set BLOB_READ_WRITE_TOKEN for Vercel Blob, or use NODE_ENV=development for local uploads.',
  )
}

/** Deterministic path for coordinator-attached tribute photos. */
export async function storeMemorialTributeImage(
  slug: string,
  tributeId: string,
  bytes: Buffer,
  contentType: Mime,
): Promise<{ url: string; backend: MemorialMediaBackend }> {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-').slice(0, 120) || 'memorial'
  const safeId = tributeId.replace(/[^a-z0-9-]/gi, '-').slice(0, 80) || 'tribute'
  const objectKey = `memorials/${safeSlug}/tributes/${safeId}.${extForMime(contentType)}`

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (blobToken) {
    const { put } = await import('@vercel/blob')
    const uploaded = await put(objectKey, bytes, {
      access: 'public',
      token: blobToken,
      contentType,
    })
    return { url: uploaded.url, backend: 'vercel_blob' }
  }

  if (process.env.NODE_ENV === 'development') {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const relativePosix = objectKey.replace(/\\/g, '/')
    const diskPath = path.join(process.cwd(), '.passage-dev', 'uploads', ...relativePosix.split('/'))
    await mkdir(path.dirname(diskPath), { recursive: true })
    await writeFile(diskPath, bytes)
    return { url: `/api/uploads/${relativePosix}`, backend: 'local_dev' }
  }

  throw new Error(
    'Uploads are disabled: set BLOB_READ_WRITE_TOKEN for Vercel Blob, or use NODE_ENV=development for local uploads.',
  )
}
