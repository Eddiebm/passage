import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { getMemorialWithDetails } from '@/lib/memorial-store'
import { MemorialClientSections } from './sections'

function formatAccra(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export default async function MemorialPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getMemorialWithDetails(slug)
  if (!data) notFound()

  const waNumber = data.coordinator_whatsapp?.replace(/\D/g, '') || ''
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Sharing the memorial for ${data.deceased_name}: ${process.env.NEXT_PUBLIC_SITE_URL || ''}/memorial/${slug}`,
      )}`
    : 'https://wa.me/'

  const progress =
    data.fundraising_goal && data.fundraising_goal > 0
      ? Math.min(100, Math.round((data.total_raised / data.fundraising_goal) * 100))
      : 0

  return (
    <div className="min-h-full bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <div className="border-b border-[#3D2B1F]/15 bg-[#1A1A1A] text-[#FAFAF8]">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center">
          <div className="relative h-48 w-full overflow-hidden rounded-lg bg-[#3D2B1F]/40 sm:h-56 sm:w-44 sm:shrink-0">
            {data.photo_url ? (
              <Image
                src={data.photo_url}
                alt={data.deceased_name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 176px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#FAFAF8]/60">
                No photo
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            {data.status !== 'live' && (
              <p className="inline-block rounded bg-[#C9A02C]/20 px-2 py-1 text-xs font-medium text-[#C9A02C]">
                {data.status === 'draft' ? 'Draft — not yet submitted for review' : 'Awaiting internal approval'}
              </p>
            )}
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{data.deceased_name}</h1>
            {data.deceased_title && (
              <p className="text-sm leading-relaxed text-[#FAFAF8]/80">{data.deceased_title}</p>
            )}
            <p className="text-sm text-[#FAFAF8]/70">
              {(data.deceased_family_house || '') +
                (data.deceased_family_house && data.deceased_community ? ' · ' : '') +
                (data.deceased_community || '')}
            </p>
            <p className="text-sm text-[#FAFAF8]/80">
              {data.date_of_birth ? `Sunrise: ${data.date_of_birth}` : ''}
              {data.date_of_birth && data.date_of_passing ? ' · ' : ''}
              {data.date_of_passing ? `Sunset: ${data.date_of_passing}` : ''}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/memorial/${slug}/edit`}
                className="text-sm font-medium text-[#C9A02C] underline-offset-4 hover:underline"
              >
                Family edit portal
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#C9A02C] underline-offset-4 hover:underline"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#3D2B1F]">Announcement</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-[#3D2B1F]/15 bg-white p-6 text-base leading-relaxed text-[#1A1A1A]/90">
            {data.announcement_text || 'The family will share words of announcement soon.'}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#3D2B1F]">Programme</h2>
          <ul className="space-y-4">
            {data.events.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-[#3D2B1F]/10 bg-white p-4 shadow-sm"
              >
                <p className="font-medium">{e.title}</p>
                <p className="mt-1 text-sm text-[#1A1A1A]/70">{formatAccra(e.event_date)}</p>
                {e.location && <p className="text-sm text-[#1A1A1A]/80">{e.location}</p>}
                {e.online_link && (
                  <a href={e.online_link} className="text-sm text-[#C9A02C] underline" target="_blank" rel="noreferrer">
                    Online link
                  </a>
                )}
                {e.notes && <p className="mt-2 text-sm text-[#1A1A1A]/70">{e.notes}</p>}
              </li>
            ))}
          </ul>
        </section>

        {data.fundraising_active && (
          <section className="space-y-4 rounded-lg border border-[#3D2B1F]/15 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#3D2B1F]">
              {data.fundraising_label || 'Family support'}
            </h2>
            {data.fundraising_appeal && (
              <p className="text-sm leading-relaxed text-[#1A1A1A]/80">{data.fundraising_appeal}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Raised {data.total_raised.toLocaleString()} {data.fundraising_currency}
                </span>
                {data.fundraising_goal && (
                  <span className="text-[#1A1A1A]/60">
                    Goal {data.fundraising_goal.toLocaleString()} {data.fundraising_currency}
                  </span>
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#3D2B1F]/10">
                <div
                  className="h-full bg-[#C9A02C]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Link
              href={`/memorial/${slug}/contribute`}
              className="inline-flex rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8] hover:bg-[#3D2B1F]"
            >
              Contribute
            </Link>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#3D2B1F]">Tribute wall</h2>
          <div className="space-y-3">
            {data.tributes.length === 0 && (
              <p className="text-sm text-[#1A1A1A]/60">Be the first to leave a tribute.</p>
            )}
            {data.tributes.map((t) => (
              <blockquote
                key={t.id}
                className="rounded-lg border border-[#3D2B1F]/10 bg-white p-4 text-sm leading-relaxed"
              >
                <p className="font-medium">
                  {t.author_name}
                  {t.author_location ? ` · ${t.author_location}` : ''}
                </p>
                {t.message && <p className="mt-2 text-[#1A1A1A]/80">{t.message}</p>}
              </blockquote>
            ))}
          </div>
        </section>

        <MemorialClientSections slug={slug} />
      </div>
    </div>
  )
}
