'use client'

export function MemorialPrintToolbar() {
  return (
    <div className="memorial-print-toolbar font-sans text-sm text-[#1A1A1A]/80">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded border border-[#3D2B1F]/25 bg-white px-3 py-2 font-medium text-[#1A1A1A] hover:bg-[#FAFAF8]"
      >
        Print
      </button>
      <span className="ml-3 text-xs text-[#1A1A1A]/55">
        Use your browser&apos;s print dialog — choose &ldquo;Save as PDF&rdquo; to keep a copy.
      </span>
    </div>
  )
}
