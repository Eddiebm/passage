'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'

type CopyKind = 'link' | 'announcement' | null

/**
 * WhatsApp-first share actions. Social raster exports are coordinator-only (edit portal).
 */
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
  /** Personalized burial poster print page for this memorial. */
  burialPosterPageUrl?: string
  /** Static themed JPG (1080×1920) for WhatsApp image share. */
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

  const copiedLink = lastCopied === 'link'
  const copiedAnnouncement = lastCopied === 'announcement'

  const whatsappPosterHref = burialPosterDownloadUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${announcementPlainText}\n\nBurial poster: ${burialPosterDownloadUrl}\n${pageUrl}`)}`
    : whatsappHref

  return (
    <section
      className="max-w-full min-w-0 overflow-hidden rounded-lg border border-[#3D2B1F]/12 bg-white p-5 shadow-sm"
      aria-labelledby="memorial-share-heading"
    >
      <h2 id="memorial-share-heading" className="text-base font-semibold text-[#3D2B1F]">
        Share this memorial
      </h2>
      <p className="mt-1 text-xs text-[#1A1A1A]/60">
        WhatsApp is often the first place families share news. Copy the link or message, share the burial poster image,
        or open WhatsApp with text filled in.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => copy(pageUrl, 'link')}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-[#FAFAF8] px-4 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/5"
        >
          {copiedLink ? 'Link copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={() => copy(announcementPlainText, 'announcement')}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-[#FAFAF8] px-4 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/5"
        >
          {copiedAnnouncement ? 'Announcement copied' : 'Copy announcement'}
        </button>
        <a
          href={whatsappPosterHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-[#1A1A1A] px-4 text-sm font-medium text-[#FAFAF8] hover:bg-[#3D2B1F] sm:min-w-[11rem]"
        >
          Share on WhatsApp
        </a>
      </div>

      {burialPosterPageUrl || burialPosterDownloadUrl ? (
        <div className="mt-4 border-t border-[#3D2B1F]/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B1F2A]">Burial poster</p>
          <p className="mt-1 text-xs text-[#1A1A1A]/55">
            Full portrait poster for print or WhatsApp — not the short death notice.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {burialPosterPageUrl ? (
              <Link
                href={burialPosterPageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#6B1F2A]/30 bg-[#FAF6EE] px-4 text-sm font-medium text-[#6B1F2A] hover:bg-[#6B1F2A]/10"
              >
                Open burial poster
              </Link>
            ) : null}
            {burialPosterDownloadUrl ? (
              <a
                href={burialPosterDownloadUrl}
                download
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[#3D2B1F]/20 bg-white px-4 text-sm font-medium text-[#1A1A1A] hover:bg-[#3D2B1F]/5"
              >
                Download poster JPG
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
