import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { memorialAbsoluteUrl, memorialPagePath } from '@/lib/memorial-share'
import { getMemorialWithDetails } from '@/lib/memorial-store'
import { getSiteOrigin } from '@/lib/site-url'
import { MemorialBannerToolbar } from '../banner-toolbar'
import '../banner.css'
import './wide.css'

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
  if (!data) return { title: 'Wide banner · Passage' }
  const origin = getSiteOrigin()
  return {
    title: `${data.deceased_name} — wide banner · Passage`,
    description: `Wide outdoor banner (~3×6 ft) for ${data.deceased_name}.`,
    alternates: { canonical: `${origin}${memorialPagePath(slug)}/banner/wide` },
    robots: { index: false, follow: true },
  }
}

export default async function MemorialWideBannerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getMemorialWithDetails(slug)
  if (!data) notFound()

  const memorialUrl = memorialAbsoluteUrl(slug)
  const qrDataUrl = await QRCode.toDataURL(memorialUrl, {
    margin: 1,
    width: 400,
    color: { dark: '#1A1A1A', light: '#FAFAF8' },
  })

  const datesLine = [
    data.date_of_birth ? `Sunrise ${formatAccra(data.date_of_birth)}` : '',
    data.date_of_passing ? `Sunset ${formatAccra(data.date_of_passing)}` : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="memorial-banner-wide-root memorial-banner-root">
      <div className="memorial-banner-toolbar screen-only font-sans">
        <MemorialBannerToolbar slug={slug} />
        <p className="mx-auto max-w-2xl px-4 pb-2 text-xs text-[#1A1A1A]/65">
          <Link href={`/memorial/${slug}/banner`} className="underline">
            Roll-up (850×2000mm)
          </Link>
          {' · '}
          <Link href={`/memorial/${slug}/printer-guide`} className="underline">
            Printer guide
          </Link>
        </p>
      </div>
      <article className="memorial-banner-wide-sheet print-block">
        {data.photo_url ? (
          <div className="memorial-banner-wide-photo-wrap">
            <Image
              src={data.photo_url}
              alt={data.deceased_name}
              width={640}
              height={480}
              className="memorial-banner-wide-photo"
              unoptimized
              priority
            />
          </div>
        ) : (
          <div />
        )}
        <div className="memorial-banner-wide-copy memorial-banner-copy">
          <p className="memorial-banner-eyebrow">In loving memory</p>
          <h1 className="memorial-banner-name">{data.deceased_name}</h1>
          {data.deceased_title ? <p className="memorial-banner-title">{data.deceased_title}</p> : null}
          {(data.deceased_family_house || data.deceased_community) && (
            <p className="memorial-banner-family">
              {[data.deceased_family_house, data.deceased_community].filter(Boolean).join(' · ')}
            </p>
          )}
          {datesLine ? <p className="memorial-banner-dates">{datesLine}</p> : null}
          {data.announcement_text?.trim() ? (
            <p className="memorial-banner-announcement">
              {data.announcement_text.trim().slice(0, 320)}
              {data.announcement_text.trim().length > 320 ? '…' : ''}
            </p>
          ) : null}
        </div>
        <div className="memorial-banner-wide-footer memorial-banner-footer">
          <div className="memorial-banner-qr memorial-banner-wide-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR code linking to ${memorialUrl}`} width={160} height={160} />
          </div>
          <div className="memorial-banner-scan">
            <p className="memorial-banner-scan-label">Scan for programme &amp; tributes</p>
            <p className="memorial-banner-url">{memorialUrl.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>
        <p className="memorial-banner-trim-note screen-only" style={{ gridColumn: '1 / -1' }}>
          Wide preset: ~915×1830mm (3×6 ft). Confirm bleed and material with your printer.
        </p>
      </article>
    </div>
  )
}
