/**
 * Passage OCR — Hetzner dots.mocr for raw text, then structured field extraction.
 *
 * Env (Vercel + .env.local):
 *   OCR_SERVICE_URL, OCR_SERVICE_KEY — dots.mocr on Hetzner (preferred for PDFs + scans)
 *   OPENAI_API_KEY — field extraction (Passage default); vision fallback when mocr unset
 *   ANTHROPIC_API_KEY — optional fallback for field extraction (integration spec)
 */

import { createHash } from 'node:crypto'
import OpenAI from 'openai'

export type DocumentType =
  | 'bank_statement'
  | 'mobile_money'
  | 'death_certificate'
  | 'funeral_poster'
  | 'vendor_invoice'
  | 'tribute_letter'

export interface Transaction {
  date: string
  amount: number
  currency: string
  sender: string | null
  reference: string | null
  type: 'credit' | 'debit' | 'unknown'
}

export interface BankStatementResult {
  doc_type: 'bank_statement' | 'mobile_money'
  account_holder: string | null
  period_start: string | null
  period_end: string | null
  transactions: Transaction[]
  total_credits: number
  file_hash: string
  raw_text: string
}

export interface DeathCertificateResult {
  doc_type: 'death_certificate'
  full_name: string | null
  date_of_death: string | null
  place_of_death: string | null
  age: number | null
  registration_number: string | null
  file_hash: string
  raw_text: string
}

export interface FuneralPosterEventStub {
  title: string
  event_date: string | null
  location: string | null
  notes: string | null
}

export interface FuneralPosterContactHint {
  name: string
  role_label: string | null
  phone: string | null
  email: string | null
}

/** Funeral announcement / poster — pre-fill memorial create & edit drafts. */
export interface FuneralPosterResult {
  doc_type: 'funeral_poster'
  deceased_name: string | null
  deceased_title: string | null
  deceased_family_house: string | null
  deceased_community: string | null
  date_of_birth: string | null
  date_of_passing: string | null
  birth_year: number | null
  death_year: number | null
  announcement_text: string | null
  events: FuneralPosterEventStub[]
  contact_hints: FuneralPosterContactHint[]
  file_hash: string
  raw_text: string
}

export interface VendorInvoiceResult {
  doc_type: 'vendor_invoice'
  vendor_name: string | null
  invoice_number: string | null
  invoice_date: string | null
  total_amount: number | null
  currency: string
  line_items: { description: string; amount: number }[]
  file_hash: string
  raw_text: string
}

export interface TributeLetterResult {
  doc_type: 'tribute_letter'
  author_name: string | null
  text: string
  file_hash: string
  raw_text: string
}

export type OCRResult =
  | BankStatementResult
  | DeathCertificateResult
  | FuneralPosterResult
  | VendorInvoiceResult
  | TributeLetterResult

export function isOcrConfigured(): boolean {
  const mocr =
    Boolean(process.env.OCR_SERVICE_URL?.trim()) && Boolean(process.env.OCR_SERVICE_KEY?.trim())
  const openai = Boolean(process.env.OPENAI_API_KEY?.trim())
  const anthropic = Boolean(process.env.ANTHROPIC_API_KEY?.trim())
  return mocr || openai || anthropic
}

const EXTRACTION_PROMPTS: Record<DocumentType, string> = {
  bank_statement: `Extract all transactions from this bank statement. Return ONLY valid JSON, no markdown:
{"account_holder":null,"period_start":null,"period_end":null,"transactions":[{"date":"YYYY-MM-DD","amount":0,"currency":"GHS","sender":null,"reference":null,"type":"credit"}],"total_credits":0}
Focus on incoming credits. Amounts as numbers only.`,

  mobile_money: `Extract all incoming transactions from this mobile money statement (MTN MoMo, Vodafone Cash, AirtelTigo). Return ONLY valid JSON, no markdown:
{"account_holder":null,"period_start":null,"period_end":null,"transactions":[{"date":"YYYY-MM-DD","amount":0,"currency":"GHS","sender":null,"reference":null,"type":"credit"}],"total_credits":0}`,

  death_certificate: `Extract from this death certificate. Return ONLY valid JSON, no markdown:
{"full_name":null,"date_of_death":null,"place_of_death":null,"age":null,"registration_number":null}`,

  funeral_poster: `Extract from this funeral poster, announcement, or printed programme sheet (Ghana/Nigeria/West African style). Return ONLY valid JSON, no markdown:
{"deceased_name":null,"deceased_title":null,"deceased_family_house":null,"deceased_community":null,"date_of_birth":null,"date_of_passing":null,"birth_year":null,"death_year":null,"announcement_text":null,"events":[{"title":"","event_date":null,"location":null,"notes":null}],"contact_hints":[{"name":"","role_label":null,"phone":null,"email":null}]}
Use ISO dates (YYYY-MM-DD) when a full date is visible; otherwise birth_year/death_year as integers. announcement_text is the main body copy if present. events are funeral services (wake, burial, thanksgiving, etc.).`,

  vendor_invoice: `Extract invoice details. Return ONLY valid JSON, no markdown:
{"vendor_name":null,"invoice_number":null,"invoice_date":null,"total_amount":null,"currency":"GHS","line_items":[{"description":"","amount":0}]}`,

  tribute_letter: `Extract the condolence letter content. Return ONLY valid JSON, no markdown:
{"author_name":null,"text":"full letter text"}`,
}

function hashFile(buffer: ArrayBuffer): string {
  return createHash('sha256').update(Buffer.from(buffer)).digest('hex').slice(0, 16)
}

async function extractRawTextMocr(file: File): Promise<{ text: string; file_hash: string }> {
  const url = process.env.OCR_SERVICE_URL?.trim()
  const key = process.env.OCR_SERVICE_KEY?.trim()
  if (!url || !key) {
    throw new Error('OCR service not configured (set OCR_SERVICE_URL and OCR_SERVICE_KEY)')
  }

  const form = new FormData()
  form.append('file', file)
  form.append('doc_type', 'generic')
  form.append('api_key', key)

  const res = await fetch(`${url.replace(/\/$/, '')}/process`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(`OCR service error ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { text: string; file_hash: string }
  return { text: data.text, file_hash: data.file_hash }
}

async function extractRawTextOpenAI(file: File, buffer: ArrayBuffer): Promise<{ text: string; file_hash: string }> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) throw new Error('OCR not configured — set OCR_SERVICE_* or OPENAI_API_KEY')
  if (!file.type.startsWith('image/')) {
    throw new Error('Without OCR_SERVICE_URL, only image files (PNG, JPG, WEBP) are supported')
  }

  const client = new OpenAI({ apiKey: key })
  const base64 = Buffer.from(buffer).toString('base64')
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Transcribe all visible text from this funeral document image. Preserve line breaks. Return plain text only, no commentary.',
          },
          {
            type: 'image_url',
            image_url: { url: `data:${file.type};base64,${base64}` },
          },
        ],
      },
    ],
  })
  const text = completion.choices[0]?.message?.content?.trim() ?? ''
  return { text, file_hash: hashFile(buffer) }
}

async function extractRawText(file: File): Promise<{ text: string; file_hash: string }> {
  const buffer = await file.arrayBuffer()
  const hasMocr =
    Boolean(process.env.OCR_SERVICE_URL?.trim()) && Boolean(process.env.OCR_SERVICE_KEY?.trim())

  if (hasMocr) {
    try {
      return await extractRawTextMocr(file)
    } catch (err) {
      if (process.env.OPENAI_API_KEY?.trim() && file.type.startsWith('image/')) {
        console.warn('[ocr] mocr failed, falling back to OpenAI vision:', err)
        return extractRawTextOpenAI(file, buffer)
      }
      throw err
    }
  }
  return extractRawTextOpenAI(file, buffer)
}

function parseJsonFields(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as Record<string, unknown>
  } catch {
    return {}
  }
}

async function extractFieldsAnthropic(rawText: string, docType: DocumentType): Promise<Record<string, unknown>> {
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (!key) return {}

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'Extract structured data. Return ONLY valid JSON. No markdown, no explanation.',
      messages: [
        {
          role: 'user',
          content: `${EXTRACTION_PROMPTS[docType]}\n\nDocument:\n${rawText.slice(0, 14000)}`,
        },
      ],
    }),
  })
  if (!res.ok) {
    console.warn('[ocr] Anthropic extraction failed:', res.status)
    return {}
  }
  const data = (await res.json()) as { content?: { text?: string }[] }
  const text = data.content?.[0]?.text ?? '{}'
  return parseJsonFields(text)
}

async function extractFieldsOpenAI(rawText: string, docType: DocumentType): Promise<Record<string, unknown>> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return {}

  const client = new OpenAI({ apiKey: key })
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Extract structured data. Return ONLY valid JSON. No markdown, no explanation.',
      },
      {
        role: 'user',
        content: `${EXTRACTION_PROMPTS[docType]}\n\nDocument:\n${rawText.slice(0, 14000)}`,
      },
    ],
  })
  const text = completion.choices[0]?.message?.content?.trim() ?? '{}'
  return parseJsonFields(text)
}

async function extractFields(rawText: string, docType: DocumentType): Promise<Record<string, unknown>> {
  if (!rawText.trim()) return {}

  const openai = await extractFieldsOpenAI(rawText, docType)
  if (Object.keys(openai).length > 0) return openai

  return extractFieldsAnthropic(rawText, docType)
}

/** ISO date from YYYY-MM-DD string or year-only fallback. */
export function yearOrIsoToDate(iso: string | null | undefined, year: number | null | undefined): string {
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10)
  if (year && year > 1800 && year < 2100) return `${year}-01-01`
  return ''
}

export async function processDocument(file: File, docType: DocumentType): Promise<OCRResult> {
  if (!isOcrConfigured()) {
    throw new Error(
      'Document scanning is not configured. Set OCR_SERVICE_URL + OCR_SERVICE_KEY, or OPENAI_API_KEY.',
    )
  }

  const { text: raw_text, file_hash } = await extractRawText(file)
  const fields = await extractFields(raw_text, docType)
  return { doc_type: docType, raw_text, file_hash, ...fields } as OCRResult
}
