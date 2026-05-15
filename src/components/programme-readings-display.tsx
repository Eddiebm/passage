import Image from 'next/image'
import type { ProgrammeReading } from '@/lib/types'

function ReadingBody({ reading, variant }: { reading: ProgrammeReading; variant: 'screen' | 'print' }) {
  if (reading.type === 'scripture') {
    return (
      <figure className="space-y-2 text-sm leading-relaxed">
        {reading.scripture_text ? (
          <blockquote
            className={
              variant === 'print'
                ? 'border-l-2 border-[#999] pl-3 text-[11pt] italic leading-relaxed whitespace-pre-wrap'
                : 'border-l-2 border-[#C9A02C]/60 pl-4 italic whitespace-pre-wrap'
            }
          >
            {reading.scripture_text}
          </blockquote>
        ) : null}
        {reading.scripture_reference ? (
          <figcaption
            className={
              variant === 'print'
                ? 'pl-3 text-[9pt] uppercase tracking-wide text-[#555]'
                : 'pl-4 text-xs uppercase tracking-wide text-[#1A1A1A]/55'
            }
          >
            {reading.scripture_reference}
            {reading.bible_translation ? ` · ${reading.bible_translation}` : ''}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  if (reading.type === 'hymn') {
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {(reading.hymn_book || reading.hymn_number || reading.hymn_title) && (
          <p
            className={
              variant === 'print'
                ? 'text-[9pt] font-medium uppercase tracking-wide text-[#555]'
                : 'text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/55'
            }
          >
            {[reading.hymn_book, reading.hymn_number ? `No. ${reading.hymn_number}` : '', reading.hymn_title]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {reading.hymn_lyrics ? (
          <div
            className={
              variant === 'print'
                ? 'whitespace-pre-wrap text-[10.5pt] leading-relaxed'
                : 'whitespace-pre-wrap text-[#1A1A1A]/85'
            }
          >
            {reading.hymn_lyrics}
          </div>
        ) : null}
      </div>
    )
  }

  if (reading.type === 'quran') {
    return (
      <div className="space-y-3 text-sm leading-relaxed">
        {reading.quran_reference ? (
          <p
            className={
              variant === 'print'
                ? 'text-[9pt] font-medium uppercase tracking-wide text-[#555]'
                : 'text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/55'
            }
          >
            {reading.quran_reference}
          </p>
        ) : null}
        {reading.quran_arabic ? (
          <p
            className="text-right text-base leading-loose whitespace-pre-wrap"
            dir="rtl"
            lang="ar"
          >
            {reading.quran_arabic}
          </p>
        ) : null}
        {reading.quran_translation ? (
          <p
            className={
              variant === 'print'
                ? 'whitespace-pre-wrap text-[10.5pt] leading-relaxed'
                : 'whitespace-pre-wrap text-[#1A1A1A]/85'
            }
          >
            {reading.quran_translation}
          </p>
        ) : null}
      </div>
    )
  }

  if (reading.type === 'upload') {
    return (
      <div className="space-y-3">
        {reading.document_caption ? (
          <p className={variant === 'print' ? 'text-[10pt] text-[#444]' : 'text-sm text-[#1A1A1A]/80'}>
            {reading.document_caption}
          </p>
        ) : null}
        {reading.document_url ? (
          <div
            className={
              variant === 'print'
                ? 'relative mx-auto aspect-[3/4] w-full max-w-[120mm] overflow-hidden border border-[#ccc]'
                : 'relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-md border border-[#3D2B1F]/15'
            }
          >
            <Image
              src={reading.document_url}
              alt={reading.document_caption || reading.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
          </div>
        ) : null}
      </div>
    )
  }

  return null
}

export function ProgrammeReadingsList({
  readings,
  variant = 'screen',
}: {
  readings: ProgrammeReading[]
  variant?: 'screen' | 'print'
}) {
  const itemClass =
    variant === 'print'
      ? 'print-block space-y-2 border-b border-[#ddd] pb-4 last:border-0'
      : 'space-y-3 rounded-lg border border-[#3D2B1F]/10 bg-white p-4 shadow-sm'

  return (
    <ol className={variant === 'print' ? 'print-list space-y-4' : 'space-y-4'}>
      {readings.map((reading, index) => (
        <li key={reading.id} className={itemClass}>
          <p
            className={
              variant === 'print'
                ? 'font-semibold text-[11pt]'
                : 'text-sm font-medium text-[#3D2B1F]'
            }
          >
            {reading.title?.trim() || `Reading ${index + 1}`}
          </p>
          <ReadingBody reading={reading} variant={variant} />
        </li>
      ))}
    </ol>
  )
}
