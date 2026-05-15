'use client'

import Link from 'next/link'

export function MemorialBannerToolbar({ slug }: { slug: string }) {
  return (
    <div className="memorial-banner-toolbar screen-only">
      <p className="text-sm text-[#1A1A1A]/75">
        Outdoor roll-up layout (850×2000mm). Use <strong>Print</strong> and send the PDF to your printer, or export
        from the browser.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8]"
          onClick={() => window.print()}
        >
          Print banner
        </button>
        <Link
          href={`/memorial/${slug}/print`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-md border border-[#3D2B1F]/25 bg-white px-4 py-2 text-sm font-medium"
        >
          Programme print sheet
        </Link>
        <Link
          href={`/memorial/${slug}`}
          className="inline-flex items-center text-sm text-[#C9A02C] underline-offset-4 hover:underline"
        >
          Back to memorial
        </Link>
      </div>
    </div>
  )
}
