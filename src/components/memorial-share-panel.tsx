'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'

type CopyKind = 'link' | 'announcement' | null

function canNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export function MemorialSharePanel({
  pageUrl,
  announcementPlainText,
  whatsappHref,
  burialPosterPageUrl,
  burialPosterDownloadUrl,
}: {
  pageUrl: string
  announcementPlainText: string
  whatsappHref: string
  burialPosterPageUrl?: string
  burialPosterDownloadUrl?: string
}) {
  const [lastCopied, setLastCopied] = useState<CopyKind>(null)

  const copy = useCallback(async (text: string, kind: CopyKind) => {
    try {
      await navigator.clipboard.writeText(text)
      setLastCopied(kind)
      window.setTimeout(() => setLastCopied((k) => (k === kind ? null : k)), 2500)
    } catch {
      setLastCopied(null)
    }
  }, [])

  const nativeShare = useCallback(async () => {
    if (!canNativeShare()) return
    try {
      await navigator.share({
        title: 'Memorial — Passage',
        text: announcementPlainText,
        url: pageUrl,
      })
    } catch {
      // user cancelled or share failed — no-op
    }
  }, [announcementPlainText, pageUrl])

  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedText = encodeURIComponent(announcementPlainText.slice(0, 280))
  const encodedSubject = encodeURIComponent('Memorial notice')
  const encodedEmail = encodeURIComponent(`${announcementPlainText}\n\n${pageUrl}`)

  const platforms = [
    {
      label: 'WhatsApp',
      href: whatsappHref,
      color: '#25D366',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: '#1877F2',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: '#26A5E4',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: '#000000',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodedSubject}&body=${encodedEmail}`,
      color: '#6B1F2A',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 7L2 7" />
        </svg>
      ),
    },
  ]

  return (
    <section
      className="max-w-full min-w-0 overflow-hidden rounded-lg border border-[#3D2B1F]/12 bg-white p-5 shadow-sm"
      aria-labelledby="memorial-share-heading"
    >
      <h2 id="memorial-share-heading" className="text-base font-semibold text-[#3D2B1F]">
        Share this memorial
      </h2>
      <p className="mt-1 text-xs text-[#1A1A1A]/60">
        Let family and friends near and far know. Share the link however feels right for your family.
      </p>

      {/* Primary actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => copy(pageUrl, 'link')}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-[#FAFAF8] px-4 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/5"
        >
          {lastCopied === 'link' ? 'Link copied ✓' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={() => copy(announcementPlainText, 'announcement')}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-[#FAFAF8] px-4 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/5"
        >
          {lastCopied === 'announcement' ? 'Copied ✓' : 'Copy announcement'}
        </button>
        {canNativeShare() && (
          <button
            type="button"
            onClick={nativeShare}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md bg-[#1A1A1A] px-4 text-sm font-medium text-[#FAFAF8] hover:bg-[#3D2B1F]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        )}
      </div>

      {/* Platform buttons */}
      <div className="mt-4 border-t border-[#3D2B1F]/8 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#1A1A1A]/40">Share on</p>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#3D2B1F]/12 bg-[#FAFAF8] px-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/6 transition-colors"
            >
              <span style={{ color: p.color }}>{p.icon}</span>
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {/* Burial poster */}
      {(burialPosterPageUrl || burialPosterDownloadUrl) && (
        <div className="mt-4 border-t border-[#3D2B1F]/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B1F2A]">Burial poster</p>
          <p className="mt-1 text-xs text-[#1A1A1A]/55">
            Full portrait poster for print or image share — not the short death notice.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {burialPosterPageUrl && (
              <Link
                href={burialPosterPageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#6B1F2A]/30 bg-[#FAF6EE] px-4 text-sm font-medium text-[#6B1F2A] hover:bg-[#6B1F2A]/10"
              >
                Open burial poster
              </Link>
            )}
            {burialPosterDownloadUrl && (
              <a
                href={burialPosterDownloadUrl}
                download
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-4 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/5"
              >
                Download poster JPG
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
