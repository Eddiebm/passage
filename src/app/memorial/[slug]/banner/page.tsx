import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { memorialAbsoluteUrl, memorialPagePath } from '@/lib/memorial-share'
import { getMemorialWithDetails } from '@/lib/memorial-store'
import { getSiteOrigin } from '@/lib/site-url'
import { MemorialBannerToolbar } from './banner-toolbar'
import './banner.css'

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
  if (!data) {
    return { title: 'Banner · Memorial | Passage' }
  }
  const origin = getSiteOrigin()
  const canonical = `${origin}${memorialPagePath(slug)}/banner`
  return {
    title: `${data.deceased_name} — outdoor banner · Passage`,
    description: `Roll-up banner layout (850×2000mm) for ${data.deceased_name}.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
  }
}

export default async function MemorialBannerPage({
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
    width: 480,
    color: { dark: '#1A1A1A', light: '#FAFAF8' },
  })

  const datesLine = [
    data.date_of_birth ? `Sunrise ${formatAccra(data.date_of_birth)}` : '',
    data.date_of_passing ? `Sunset ${formatAccra(data.date_of_passing)}` : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="memorial-banner-root">
      <MemorialBannerToolbar slug={slug} />
      <article className="memorial-banner-sheet print-block">
        {data.photo_url ? (
          <div className="memorial-banner-photo-wrap">
            <Image
              src={data.photo_url}
              alt={data.deceased_name}
              width={720}
              height={900}
              className="memorial-banner-photo"
              unoptimized
              priority
            />
          </div>
        ) : null}
        <div className="memorial-banner-copy">
          <p className="memorial-banner-eyebrow">In loving memory</p>
          <h1 className="memorial-banner-name">{data.deceased_name}</h1>
          {data.deceased_title ? (
            <p className="memorial-banner-title">{data.deceased_title}</p>
          ) : null}
          {(data.deceased_family_house || data.deceased_community) && (
            <p className="memorial-banner-family">
              {[data.deceased_family_house, data.deceased_community].filter(Boolean).join(' · ')}
            </p>
          )}
          {datesLine ? <p className="memorial-banner-dates">{datesLine}</p> : null}
          {data.announcement_text?.trim() ? (
            <p className="memorial-banner-announcement">
              {data.announcement_text.trim().slice(0, 420)}
              {data.announcement_text.trim().length > 420 ? '…' : ''}
            </p>
          ) : null}
        </div>
        <div className="memorial-banner-footer">
          <div className="memorial-banner-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR code linking to ${memorialUrl}`} width={200} height={200} />
          </div>
          <div className="memorial-banner-scan">
            <p className="memorial-banner-scan-label">Scan for programme &amp; tributes</p>
            <p className="memorial-banner-url">{memorialUrl.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>
        <p className="memorial-banner-trim-note screen-only">
          Roll-up preset: 850×2000mm. Ask your printer about CMYK conversion and bleed.
        </p>
      </article>
    </div>
  )
}
