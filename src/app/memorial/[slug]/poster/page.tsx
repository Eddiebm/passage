import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { burialPosterImageUrl } from '@/lib/burial-poster'
import { memorialAbsoluteUrl, memorialPagePath } from '@/lib/memorial-share'
import { memorialTemplateClass, memorialThemeClass, normalizeVisualTheme } from '@/lib/memorial-hydrate'
import { getMemorialWithDetails } from '@/lib/memorial-store'
import { getSiteOrigin } from '@/lib/site-url'
import { MemorialPosterToolbar } from './poster-toolbar'
import './poster.css'

function formatAccra(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'long',
  }).format(d)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getMemorialWithDetails(slug)
  if (!data) return { title: 'Burial poster · Passage' }
  const origin = getSiteOrigin()
  return {
    title: `${data.deceased_name} — burial poster · Passage`,
    description: `Portrait burial poster for ${data.deceased_name} — print or share digitally.`,
    alternates: { canonical: `${origin}${memorialPagePath(slug)}/poster` },
    robots: { index: false, follow: true },
  }
}

export default async function MemorialPosterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ theme?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const data = await getMemorialWithDetails(slug)
  if (!data) notFound()

  const theme = normalizeVisualTheme(sp.theme ?? data.visual_theme)
  const themeClass = memorialThemeClass(theme)
  const templateClass = memorialTemplateClass(data.output_template)
  const memorialUrl = memorialAbsoluteUrl(slug)
  const staticPosterUrl = burialPosterImageUrl(theme)
  const qrDataUrl = await QRCode.toDataURL(memorialUrl, {
    margin: 1,
    width: 320,
    color: { dark: '#1A1A1A', light: '#FAFAF8' },
  })

  const datesLine = [
    data.date_of_birth ? `Sunrise ${formatAccra(data.date_of_birth)}` : '',
    data.date_of_passing ? `Sunset ${formatAccra(data.date_of_passing)}` : '',
  ]
    .filter(Boolean)
    .join(' · ')

  const announcement =
    data.announcement_text?.trim().slice(0, 520) ||
    'The family will share words of announcement soon.'

  return (
    <div className={`memorial-poster-root ${templateClass} ${themeClass}`} data-theme={theme}>
      <MemorialPosterToolbar
        slug={slug}
        deceasedName={data.deceased_name}
        staticPosterDownloadUrl={staticPosterUrl}
        themeId={theme}
      />

      <article className="memorial-poster-sheet print-block" aria-label={`Burial poster for ${data.deceased_name}`}>
        {data.photo_url ? (
          <div className="memorial-poster-photo-wrap">
            <Image
              src={data.photo_url}
              alt={data.deceased_name}
              width={1080}
              height={810}
              className="memorial-poster-photo"
              unoptimized
              priority
            />
          </div>
        ) : null}
        <div className="memorial-poster-copy">
          <p className="memorial-poster-eyebrow">In loving memory</p>
          <h1 className="memorial-poster-name">{data.deceased_name}</h1>
          {data.deceased_title ? <p className="memorial-poster-title">{data.deceased_title}</p> : null}
          {(data.deceased_family_house || data.deceased_community) && (
            <p className="memorial-poster-family">
              {[data.deceased_family_house, data.deceased_community].filter(Boolean).join(' · ')}
            </p>
          )}
          {datesLine ? <p className="memorial-poster-dates">{datesLine}</p> : null}
          <p className="memorial-poster-announcement">{announcement}</p>
        </div>
        <div className="memorial-poster-footer">
          <div className="memorial-poster-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR code linking to ${memorialUrl}`} width={140} height={140} />
          </div>
          <div className="memorial-poster-scan">
            <p className="memorial-poster-scan-label">Scan for programme &amp; tributes</p>
            <p className="memorial-poster-url">{memorialUrl.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>
        <p className="memorial-poster-trim-note screen-only">
          Burial poster: 1080×1920 portrait (9:16). For print shops in Accra, export via browser Print → Save as PDF,
          or download the themed JPG from the toolbar.
        </p>
      </article>

      <p className="screen-only mx-auto max-w-md px-4 pb-8 text-center text-xs text-[#1A1A1A]/55">
        This page uses your memorial details. The themed JPG download uses sample copy for style preview — use Print on
        this page for your family&apos;s names.{' '}
        <Link href={`/memorial/${slug}/printer-guide`} className="underline">
          Printer guide
        </Link>
      </p>
    </div>
  )
}
