'use client'

/**
 * Generic OCR upload dropzone — bank statements, death certificates, etc.
 *
 * Death cert in /create (no PIN):
 *   <OCRUpload docType="death_certificate" label="Upload death certificate" onResult={...} />
 *
 * Bank statement in /edit (PIN required):
 *   <OCRUpload docType="bank_statement" slug={slug} pin={pin} onResult={...} />
 */

import { useRef, useState } from 'react'
import type { DocumentType, OCRResult } from '@/lib/ocr'

interface Props {
  docType: DocumentType
  label: string
  hint?: string
  slug?: string
  pin?: string
  onResult: (data: OCRResult) => void
  onError?: (msg: string) => void
}

type State = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

const TYPE_LABEL: Record<DocumentType, string> = {
  bank_statement: 'bank statement',
  mobile_money: 'mobile money statement',
  death_certificate: 'death certificate',
  funeral_poster: 'funeral poster',
  vendor_invoice: 'vendor invoice',
  tribute_letter: 'condolence letter',
}

export function OCRUpload({ docType, label, hint, slug, pin, onResult, onError }: Props) {
  const [state, setState] = useState<State>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setFileName(file.name)
    setErrMsg(null)
    setState('uploading')

    const form = new FormData()
    form.append('file', file)
    form.append('doc_type', docType)
    if (slug) form.append('slug', slug)
    if (pin) form.append('pin', pin)

    try {
      setState('processing')
      const res = await fetch('/api/ocr', { method: 'POST', body: form })
      const json = (await res.json()) as { success: boolean; data: OCRResult; error?: string }
      if (!res.ok || !json.success) throw new Error(json.error ?? `Error ${res.status}`)
      setState('done')
      onResult(json.data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      setState('error')
      setErrMsg(msg)
      onError?.(msg)
    }
  }

  const busy = state === 'uploading' || state === 'processing'

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-[#1A1A1A]/70 mb-1">{label}</p>
      {hint && <p className="text-xs text-[#1A1A1A]/50 mb-2">{hint}</p>}

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) void handleFile(f)
        }}
        className={[
          'w-full rounded border-2 border-dashed px-4 py-5 text-center text-sm transition',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A02C]/50',
          busy
            ? 'cursor-wait border-[#3D2B1F]/10 bg-[#FAFAF8]'
            : state === 'done'
              ? 'border-[#3D2B1F]/20 bg-white cursor-pointer'
              : state === 'error'
                ? 'border-red-200 bg-red-50/40 cursor-pointer'
                : 'border-[#3D2B1F]/20 bg-white hover:border-[#C9A02C]/50 cursor-pointer',
        ].join(' ')}
      >
        <span className="flex flex-col items-center gap-1">
          {busy ? (
            <>
              <Spinner />
              <span className="text-[#1A1A1A]/60">Reading {TYPE_LABEL[docType]}…</span>
            </>
          ) : state === 'done' ? (
            <>
              <CheckIcon />
              <span className="text-[#1A1A1A]/70">Done{fileName ? ` — ${fileName}` : ''}</span>
              <span className="text-xs text-[#1A1A1A]/40">Upload another to replace</span>
            </>
          ) : state === 'error' ? (
            <>
              <AlertIcon />
              <span className="text-red-600 text-xs">{errMsg}</span>
              <span className="text-xs text-[#1A1A1A]/40">Tap to try again</span>
            </>
          ) : (
            <>
              <UploadIcon />
              <span>
                <span className="font-medium text-[#1A1A1A]">Tap to upload</span>
                <span className="text-[#1A1A1A]/50"> or drag and drop</span>
              </span>
              <span className="text-xs text-[#1A1A1A]/40">PDF, PNG, JPG up to 20 MB</span>
            </>
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleFile(f)
        }}
        aria-label={label}
      />
    </div>
  )
}

function UploadIcon() {
  return (
    <svg className="h-6 w-6 text-[#1A1A1A]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="h-6 w-6 text-[#C9A02C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l7.354 12.748zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  )
}
function Spinner() {
  return (
    <svg className="h-6 w-6 animate-spin text-[#C9A02C]" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
