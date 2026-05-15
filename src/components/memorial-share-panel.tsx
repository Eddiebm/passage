'use client'

import { useCallback, useState } from 'react'

type CopyKind = 'link' | 'announcement' | null

/**
 * WhatsApp-first share actions. Social raster exports are coordinator-only (edit portal).
 */
export function MemorialSharePanel({
  pageUrl,
  announcementPlainText,
  whatsappHref,
}: {
  pageUrl: string
  announcementPlainText: string
  whatsappHref: string
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

  return (
    <section
      className="max-w-full min-w-0 overflow-hidden rounded-lg border border-[#3D2B1F]/12 bg-white p-5 shadow-sm"
      aria-labelledby="memorial-share-heading"
    >
      <h2 id="memorial-share-heading" className="text-base font-semibold text-[#3D2B1F]">
        Share this memorial
      </h2>
      <p className="mt-1 text-xs text-[#1A1A1A]/60">
        WhatsApp is often the first place families share news. Copy the link or message below, or open WhatsApp with the text filled in.
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
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-[#1A1A1A] px-4 text-sm font-medium text-[#FAFAF8] hover:bg-[#3D2B1F] sm:min-w-[11rem]"
        >
          Share on WhatsApp
        </a>
      </div>
    </section>
  )
}
