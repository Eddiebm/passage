import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Serves files from `.passage-dev/uploads` in development only.
 * Production must use Vercel Blob (or other public) URLs — not this dev-only route.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ segments?: string[] }> },
) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }
  const { segments } = await context.params
  if (!segments?.length) {
    return new NextResponse('Not found', { status: 404 })
  }
  if (segments.some((s) => s.includes('..') || s.includes('/') || s.includes('\\'))) {
    return new NextResponse('Invalid path', { status: 400 })
  }
  const root = path.join(process.cwd(), '.passage-dev', 'uploads')
  const filePath = path.join(root, ...segments)
  const normalizedRoot = path.normalize(root + path.sep)
  if (!path.normalize(filePath + path.sep).startsWith(normalizedRoot)) {
    return new NextResponse('Invalid path', { status: 400 })
  }
  try {
    const data = await readFile(filePath)
    const ext = path.extname(filePath)
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentTypeForExt(ext),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
