import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MemorialSharePanel } from '@/components/memorial-share-panel'
import { SiteHeader } from '@/components/site-header'
import { ProgrammeReadingsList } from '@/components/programme-readings-display'
import { MemorialThemeShell } from '@/components/memorial-theme-shell'
import {
  memorialTemplateClass,
  normalizeVisualTheme,
  pledgesForPublicPage,
  programmeReadingsForPublicPage,
  STAKEHOLDER_CATEGORY_LABEL,
} from '@/lib/memorial-hydrate'
import { formatPledgeAmountMinor, pledgeStatusLabel } from '@/lib/memorial-pledges'
import {
  buildMemorialShareAnnouncement,
  memorialAbsoluteUrl,
  memorialMetaDescription,
  memorialPagePath,
  memorialWhatsAppWebShareUrl,
  pickMemorialOgImageUrl,
} from '@/lib/memorial-share'
import { getMemorialWithDetails } from '@/lib/memorial-store'
import { getSiteOrigin } from '@/lib/site-url'
import { MemorialClientSections } from './sections'

export const dynamic = 'force-dynamic'

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getMemorialWithDetails(slug)
  if (!data) {
    return {
      title: 'Memorial | Passage',
      description: 'This memorial page could not be found.',
    }
  }

  const origin = getSiteOrigin()
  const path = memorialPagePath(slug)
  const canonical = `${origin}${path}`
  const description = memorialMetaDescription(data)
  const ogImage = pickMemorialOgImageUrl(origin, data.photo_url, data.gallery_urls)
  const title = `${data.deceased_name} — memorial · Passage`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: data.deceased_name,
      description,
      url: canonical,
      siteName: 'Passage',
      type: 'article',
      ...(ogImage
        ? {
            images: [{ url: ogImage, alt: `${data.deceased_name} — memorial portrait` }],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: data.deceased_name,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default async function MemorialPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getMemorialWithDetails(slug)
  if (!data) notFound()

  const mode = data.memorial_mode ?? 'notice'
  const showProgrammeSurface = mode === 'programme' || mode === 'full'
  const showGallery = showProgrammeSurface
  const showRemembrance = showProgrammeSurface
  const showStakeholderDirectory = showProgrammeSurface
  const showTributeExcerpts = showProgrammeSurface
  const showWindDownPublic = showProgrammeSurface
  const pageUrl = memorialAbsoluteUrl(slug)
  const announcementPlain = buildMemorialShareAnnouncement(data, pageUrl)
  const whatsappHref = memorialWhatsAppWebShareUrl(announcementPlain)

  const progress =
    data.fundraising_goal && data.fundraising_goal > 0
      ? Math.min(100, Math.round((data.total_raised / data.fundraising_goal) * 100))
      : 0

  const galleryOnly = (data.gallery_urls ?? []).filter((u) => u && u !== data.photo_url)
  const isClosed = data.closure_status === 'closed'
  const publicPledges = pledgesForPublicPage(data)
  const programmeReadings = programmeReadingsForPublicPage(data)
  const pledgedMinor = publicPledges
    .filter((p) => p.status === 'pledged' || p.status === 'partial')
    .reduce((sum, p) => sum + (p.amount_minor ?? 0), 0)
  const fulfilledMinor = publicPledges
    .filter((p) => p.status === 'fulfilled')
    .reduce((sum, p) => sum + (p.amount_minor ?? 0), 0)

  const templateClass = memorialTemplateClass(data.output_template)
  const coordinatorTheme = normalizeVisualTheme(data.visual_theme)

  return (
    <MemorialThemeShell slug={slug} coordinatorTheme={coordinatorTheme} templateClass={templateClass}>
      <SiteHeader variant="minimal" memorialName={data.deceased_name} />
      {isClosed && (
        <div className="border-b border-amber-200/40 bg-amber-950/90 px-4 py-3 text-center text-sm text-amber-50">
          <p className="font-medium">This memorial has been closed</p>
          {(data.closure_notes?.trim() || data.closing_thank_you?.trim()) && (
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-amber-100/90">
              {data.closure_notes?.trim() || data.closing_thank_you?.trim()}
            </p>
          )}
        </div>
      )}
      <div className="passage-hero border-b border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] bg-[var(--passage-hero-bg)] text-[var(--passage-hero-text)]">
        <div className="passage-memorial-main mx-auto flex min-w-0 flex-col gap-8 px-4 py-12 sm:max-w-5xl sm:flex-row sm:items-center">
          <div
            className="relative h-48 w-full overflow-hidden bg-[color-mix(in_srgb,var(--passage-rule)_12%,transparent)] sm:h-56 sm:w-44 sm:shrink-0"
            style={{ borderRadius: 'var(--passage-radius)' }}
          >
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
              <div className="flex h-full items-center justify-center text-sm text-[var(--passage-hero-muted)]">
                No photo
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            {data.status !== 'live' && (
              <p className="inline-block rounded bg-[var(--passage-accent)]/20 px-2 py-1 text-xs font-medium text-[var(--passage-link)]">
                {data.status === 'draft' ? 'Draft — not yet submitted for review' : 'Awaiting internal approval'}
              </p>
            )}
            <div className="passage-accent-line" aria-hidden />
            <h1 className="passage-display-name text-3xl font-semibold leading-tight sm:text-4xl">
              {data.deceased_name}
            </h1>
            {data.deceased_title && (
              <p className="text-sm leading-relaxed text-[var(--passage-hero-muted)]">{data.deceased_title}</p>
            )}
            <p className="text-sm text-[var(--passage-hero-muted)]">
              {(data.deceased_family_house || '') +
                (data.deceased_family_house && data.deceased_community ? ' · ' : '') +
                (data.deceased_community || '')}
            </p>
            <p className="text-sm text-[var(--passage-hero-muted)]">
              {data.date_of_birth ? `Sunrise: ${data.date_of_birth}` : ''}
              {data.date_of_birth && data.date_of_passing ? ' · ' : ''}
              {data.date_of_passing ? `Sunset: ${data.date_of_passing}` : ''}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/memorial/${slug}/edit`}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--passage-link)] underline-offset-4 hover:underline"
              >
                Family edit portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="passage-memorial-main mx-auto min-w-0 space-y-12 px-4 py-12 sm:max-w-5xl">
        <MemorialSharePanel
          pageUrl={pageUrl}
          announcementPlainText={announcementPlain}
          whatsappHref={whatsappHref}
        />
        <p className="text-center text-xs text-[var(--passage-muted)] sm:text-left">
          <Link
            href={`/memorial/${slug}/print`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[var(--passage-rule)]/25 underline-offset-[3px] hover:text-[var(--passage-muted)]"
          >
            Print version
          </Link>{' '}
          <span className="hidden sm:inline">— opens a printer-friendly page.</span>
        </p>

        <section className="space-y-4">
          <h2 className="passage-section-title">Announcement</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] bg-white p-6 text-base leading-relaxed text-[var(--passage-muted)]">
            {data.announcement_text || 'The family will share words of announcement soon.'}
          </div>
        </section>

        {showProgrammeSurface && programmeReadings.length > 0 && (
          <section className="space-y-4">
            <h2 className="passage-section-title">Programme readings</h2>
            <ProgrammeReadingsList readings={programmeReadings} variant="screen" />
          </section>
        )}

        {(showRemembrance && (data.remembrance?.scripture || (data.remembrance?.quotes?.length ?? 0) > 0)) && (
          <section className="space-y-4 rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-white p-6">
            <h2 className="passage-section-title">Remembrance</h2>
            {data.remembrance?.scripture && (
              <figure className="space-y-2 text-sm leading-relaxed text-[var(--passage-muted)]">
                <blockquote className="border-l-2 border-[var(--passage-accent)] pl-4 italic">
                  {data.remembrance.scripture.text}
                </blockquote>
                {data.remembrance.scripture.reference && (
                  <figcaption className="pl-4 text-xs uppercase tracking-wide text-[var(--passage-muted)]">
                    {data.remembrance.scripture.reference}
                  </figcaption>
                )}
              </figure>
            )}
            {(data.remembrance?.quotes?.length ?? 0) > 0 && (
              <ul className="space-y-4 border-t border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] pt-4">
                {(data.remembrance?.quotes ?? []).map((q, i) => (
                  <li key={`${q.text.slice(0, 24)}-${i}`} className="text-sm leading-relaxed text-[var(--passage-muted)]">
                    <p className="italic">&ldquo;{q.text}&rdquo;</p>
                    {q.attribution && <p className="mt-1 text-xs text-[var(--passage-muted)]">— {q.attribution}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {((showStakeholderDirectory && (data.stakeholders?.length ?? 0) > 0) ||
          (data.public_contacts?.length ?? 0) > 0) && (
          <section className="space-y-6 rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-white p-6">
            <h2 className="passage-section-title">Key contacts</h2>
            {showStakeholderDirectory && (data.stakeholders?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--passage-muted)]">
                  Elders · church · burial · catering · logistics
                </p>
                <ul className="divide-y divide-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)]">
                  {(data.stakeholders ?? []).map((s) => (
                    <li key={s.id} className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--passage-text)]">{s.name}</p>
                        <p className="text-xs text-[var(--passage-link)]">{STAKEHOLDER_CATEGORY_LABEL[s.category]}</p>
                        {s.role_label && <p className="text-xs text-[var(--passage-muted)]">{s.role_label}</p>}
                        {s.notes && <p className="mt-1 text-xs text-[var(--passage-muted)]">{s.notes}</p>}
                      </div>
                      <div className="text-xs text-[var(--passage-muted)] sm:text-right">
                        {s.phone && <p>{s.phone}</p>}
                        {s.email && (
                          <a href={`mailto:${s.email}`} className="text-[var(--passage-link)] underline">
                            {s.email}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(data.public_contacts?.length ?? 0) > 0 && (
              <div
                className={`space-y-3 pt-4 ${
                  showStakeholderDirectory && (data.stakeholders?.length ?? 0) > 0
                    ? 'border-t border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)]'
                    : ''
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--passage-muted)]">Family liaison</p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {(data.public_contacts ?? []).map((c, i) => (
                    <li
                      key={`${c.name}-${i}`}
                      className="rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-[#FAFAF8] p-4 text-sm"
                    >
                      <p className="font-medium text-[var(--passage-text)]">{c.name}</p>
                      {c.role_label && <p className="text-xs text-[var(--passage-muted)]">{c.role_label}</p>}
                      <div className="mt-2 space-y-1 text-xs text-[var(--passage-muted)]">
                        {c.phone && <p>{c.phone}</p>}
                        {c.whatsapp && <p>WhatsApp: {c.whatsapp}</p>}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="text-[var(--passage-link)] underline">
                            {c.email}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {showGallery && galleryOnly.length > 0 && (
          <section className="space-y-4">
            <h2 className="passage-section-title">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryOnly.map((url) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-[#3D2B1F]/5"
                >
                  <Image
                    src={url}
                    alt={`${data.deceased_name} — memorial photograph`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {showProgrammeSurface && (
        <section className="space-y-4">
          <h2 className="passage-section-title">Programme</h2>
          <ul className="space-y-4">
            {data.events.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-white p-4 shadow-sm"
              >
                <p className="font-medium">{e.title}</p>
                <p className="mt-1 text-sm text-[var(--passage-muted)]">{formatAccra(e.event_date)}</p>
                {e.location && <p className="text-sm text-[var(--passage-muted)]">{e.location}</p>}
                {e.online_link && (
                  <a href={e.online_link} className="text-sm text-[var(--passage-link)] underline" target="_blank" rel="noreferrer">
                    Online link
                  </a>
                )}
                {e.notes && <p className="mt-2 text-sm text-[var(--passage-muted)]">{e.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
        )}

        {publicPledges.length > 0 && (
          <section className="space-y-4 rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] bg-white p-6">
            <h2 className="passage-section-title">Pledged support</h2>
            <p className="text-sm text-[var(--passage-muted)]">
              Names recorded as promised; fulfilled amounts reflect family confirmation.
            </p>
            {(pledgedMinor > 0 || fulfilledMinor > 0) && (
              <p className="text-sm text-[var(--passage-muted)]">
                {pledgedMinor > 0 && (
                  <span>
                    Outstanding pledges:{' '}
                    {formatPledgeAmountMinor(pledgedMinor, data.fundraising_currency)}
                  </span>
                )}
                {pledgedMinor > 0 && fulfilledMinor > 0 ? ' · ' : ''}
                {fulfilledMinor > 0 && (
                  <span>
                    Fulfilled: {formatPledgeAmountMinor(fulfilledMinor, data.fundraising_currency)}
                  </span>
                )}
              </p>
            )}
            <ul className="divide-y divide-[color-mix(in_srgb,var(--passage-rule)_22%,transparent)]">
              {publicPledges.map((p) => (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0">
                  <div>
                    <p className="font-medium text-[var(--passage-text)]">{p.pledger_name}</p>
                    {p.purpose && <p className="text-xs text-[var(--passage-muted)]">{p.purpose}</p>}
                  </div>
                  <div className="text-right text-sm">
                    {p.amount_minor != null && (
                      <p className="font-medium">
                        {formatPledgeAmountMinor(p.amount_minor, p.currency || data.fundraising_currency)}
                      </p>
                    )}
                    <p className="text-xs text-[var(--passage-link)]">{pledgeStatusLabel(p.status)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.fundraising_active && !isClosed && (
          <section className="space-y-4 rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_15%,transparent)] bg-white p-6">
            <h2 className="passage-section-title">
              {data.fundraising_label || 'Family support'}
            </h2>
            {data.fundraising_appeal && (
              <p className="text-sm leading-relaxed text-[var(--passage-muted)]">{data.fundraising_appeal}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Raised {data.total_raised.toLocaleString()} {data.fundraising_currency}
                </span>
                {data.fundraising_goal && (
                  <span className="text-[var(--passage-muted)]">
                    Goal {data.fundraising_goal.toLocaleString()} {data.fundraising_currency}
                  </span>
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#3D2B1F]/10">
                <div
                  className="h-full bg-[var(--passage-accent)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Link
              href={`/memorial/${slug}/contribute`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAF8] hover:bg-[#3D2B1F]"
            >
              Contribute
            </Link>
          </section>
        )}

        {showTributeExcerpts && (
          <section className="space-y-4">
            <h2 className="passage-section-title">Tribute wall</h2>
            <div className="space-y-3">
              {data.tributes.length === 0 && (
                <p className="text-sm text-[var(--passage-muted)]">Be the first to leave a tribute.</p>
              )}
              {data.tributes.map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-white p-4 text-sm leading-relaxed"
                >
                  {t.image_url && (
                    <div className="relative mb-3 aspect-[4/3] max-h-48 w-full overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)]">
                      <Image
                        src={t.image_url}
                        alt={`Photo from ${t.author_name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 640px"
                        unoptimized
                      />
                    </div>
                  )}
                  <p className="font-medium">
                    {t.author_name}
                    {t.author_location ? ` · ${t.author_location}` : ''}
                  </p>
                  {t.message && <p className="mt-2 text-[var(--passage-muted)]">{t.message}</p>}
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {data.closing_thank_you?.trim() && (
          <section className="space-y-3 border-t border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] pt-10">
            <h2 className="passage-section-title">Thank you</h2>
            <div className="whitespace-pre-wrap rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-[#FAFAF8] p-6 text-sm leading-relaxed text-[var(--passage-muted)]">
              {data.closing_thank_you.trim()}
            </div>
          </section>
        )}

        {showWindDownPublic && (data.wind_down_meetings?.length ?? 0) > 0 && (
          <section className="space-y-3 border-t border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] pt-10">
            <h2 className="passage-section-title">Closing meetings</h2>
            <p className="text-xs text-[var(--passage-muted)]">Additional gatherings after the main programme.</p>
            <ul className="space-y-3">
              {(data.wind_down_meetings ?? []).map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-[color-mix(in_srgb,var(--passage-rule)_10%,transparent)] bg-white p-4 text-sm shadow-sm"
                >
                  <p className="font-medium text-[var(--passage-text)]">{m.title}</p>
                  {m.starts_at && (
                    <p className="mt-1 text-xs text-[var(--passage-muted)]">{formatAccra(m.starts_at)}</p>
                  )}
                  {m.location && <p className="mt-1 text-sm text-[var(--passage-muted)]">{m.location}</p>}
                  {m.notes && <p className="mt-2 text-sm text-[var(--passage-muted)]">{m.notes}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <MemorialClientSections slug={slug} headline={mode === 'notice' ? 'Leave a message' : undefined} />
      </div>
    </MemorialThemeShell>
  )
}
