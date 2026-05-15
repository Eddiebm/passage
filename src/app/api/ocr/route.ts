/**
 * POST /api/ocr
 *
 * multipart/form-data:
 *   file      PDF, PNG, JPG, WEBP — max 20MB
 *   doc_type  bank_statement | mobile_money | death_certificate | funeral_poster | vendor_invoice | tribute_letter
 *   pin       coordinator PIN — required for bank_statement, mobile_money, vendor_invoice
 *   slug      memorial slug — required when pin is provided
 */

import { NextResponse } from 'next/server'
import { isOcrConfigured, processDocument, type DocumentType } from '@/lib/ocr'
import { verifyCoordinatorPin } from '@/lib/memorial-store'

const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
const VALID_DOC_TYPES: DocumentType[] = [
  'bank_statement',
  'mobile_money',
  'death_certificate',
  'funeral_poster',
  'vendor_invoice',
  'tribute_letter',
]
const PIN_REQUIRED: DocumentType[] = ['bank_statement', 'mobile_money', 'vendor_invoice']

export async function POST(request: Request) {
  try {
    if (!isOcrConfigured()) {
      return NextResponse.json(
        {
          error:
            'Document scanning is not configured on this server. Set OCR_SERVICE_URL + OCR_SERVICE_KEY, or OPENAI_API_KEY.',
        },
        { status: 503 },
      )
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    const docType = form.get('doc_type') as DocumentType | null
    const pin =
      (form.get('pin') as string | null)?.trim() ?? request.headers.get('x-passage-pin')?.trim()
    const slug = (form.get('slug') as string | null)?.trim()

    if (!file || !docType) {
      return NextResponse.json({ error: 'file and doc_type are required' }, { status: 400 })
    }
    if (!VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: 'Invalid doc_type' }, { status: 400 })
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 })
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 413 })
    }

    if (PIN_REQUIRED.includes(docType)) {
      if (!pin || !slug) {
        return NextResponse.json({ error: 'pin and slug required' }, { status: 401 })
      }
      const valid = await verifyCoordinatorPin(slug, pin)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
      }
    }

    const data = await processDocument(file, docType)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[/api/ocr]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 },
    )
  }
}
