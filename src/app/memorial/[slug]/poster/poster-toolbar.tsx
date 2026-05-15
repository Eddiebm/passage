'use client'

import Link from 'next/link'

export function MemorialPosterToolbar({
  slug,
  deceasedName,
  staticPosterDownloadUrl,
  themeId,
}: {
  slug: string
  deceasedName: string
  staticPosterDownloadUrl: string
  themeId: string
}) {
  return (
    <div className="screen-only sticky top-0 z-10 border-b border-[#3D2B1F]/15 bg-[#FAFAF8]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A02C]">Burial poster</p>
          <p className="text-sm font-medium text-[#3D2B1F]">{deceasedName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-[#3D2B1F] px-4 py-2 text-sm font-medium text-[#FAFAF8] hover:opacity-90"
          >
            Print / Save PDF
          </button>
          <a
            href={staticPosterDownloadUrl}
            download={`passage-burial-poster-${themeId}.jpg`}
            className="rounded-md border border-[#3D2B1F]/25 bg-white px-4 py-2 text-sm font-medium text-[#3D2B1F] hover:bg-[#3D2B1F]/5"
          >
            Download themed JPG
          </a>
          <Link
            href={`/memorial/${slug}`}
            className="rounded-md border border-[#3D2B1F]/25 px-4 py-2 text-sm font-medium text-[#3D2B1F] hover:bg-[#3D2B1F]/5"
          >
            Memorial page
          </Link>
        </div>
      </div>
    </div>
  )
}
