import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ProgrammeReadingsList } from '@/components/programme-readings-display'
import { programmeReadingsForPublicPage, STAKEHOLDER_CATEGORY_LABEL } from '@/lib/memorial-hydrate'
import { memorialPagePath } from '@/lib/memorial-share'
import { memorialTemplateClass, memorialThemeClass, normalizeVisualTheme } from '@/lib/memorial-hydrate'
import { getMemorialWithDetails } from '@/lib/memorial-store'
import { getSiteOrigin } from '@/lib/site-url'
import { MemorialPrintToolbar } from './print-toolbar'

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
    return { title: 'Print · Memorial | Passage' }
  }
  const origin = getSiteOrigin()
  const canonical = `${origin}${memorialPagePath(slug)}/print`
  return {
    title: `${data.deceased_name} — print · Passage`,
    description: `Printer-friendly memorial summary for ${data.deceased_name}.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
  }
}

export default async function MemorialPrintPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getMemorialWithDetails(slug)
  if (!data) notFound()

  const mode = data.memorial_mode ?? 'notice'
  const showProgrammeSurface = mode === 'programme' || mode === 'full'
  const showRemembrance = showProgrammeSurface
  const showStakeholderDirectory = showProgrammeSurface
  const showWindDownPublic = showProgrammeSurface

  const hasRemembrance =
    Boolean(data.remembrance?.scripture?.text) || (data.remembrance?.quotes?.length ?? 0) > 0
  const hasContacts =
    (showStakeholderDirectory && (data.stakeholders?.length ?? 0) > 0) ||
    (data.public_contacts?.length ?? 0) > 0
  const programmeReadings = programmeReadingsForPublicPage(data)

  const templateClass = memorialTemplateClass(data.output_template)
  const theme = normalizeVisualTheme(data.visual_theme)
  const themeClass = memorialThemeClass(theme)

  return (
    <div className={`memorial-print-root ${templateClass} ${themeClass}`} data-theme={theme}>
      <MemorialPrintToolbar />

      <header className="print-block print-section-major">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {data.photo_url ? (
            <div className="shrink-0">
              <Image
                src={data.photo_url}
                alt={data.deceased_name}
                width={220}
                height={280}
                className="print-hero-photo h-auto max-w-[44mm] sm:max-w-[52mm]"
                unoptimized
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            {data.status !== 'live' && (
              <p className="font-sans text-[10pt] font-medium uppercase tracking-wide text-[#6b5b4f]">
                {data.status === 'draft'
                  ? 'Draft — not yet published for public viewing'
                  : 'Awaiting approval — treat as provisional'}
              </p>
            )}
            <h1>{data.deceased_name}</h1>
            {data.deceased_title ? (
              <p className="text-[12pt] leading-snug text-[#2a2a2a]">{data.deceased_title}</p>
            ) : null}
            <p className="text-[10.5pt] text-[#444]">
              {(data.deceased_family_house || '') +
                (data.deceased_family_house && data.deceased_community ? ' · ' : '') +
                (data.deceased_community || '')}
            </p>
            <p className="text-[10.5pt] text-[#444]">
              {data.date_of_birth ? `Sunrise: ${data.date_of_birth}` : ''}
              {data.date_of_birth && data.date_of_passing ? ' · ' : ''}
              {data.date_of_passing ? `Sunset: ${data.date_of_passing}` : ''}
            </p>
          </div>
        </div>
      </header>

      <section className="print-block print-section-major">
        <h2>Announcement</h2>
        <div className="print-announcement text-[11pt] leading-relaxed">
          {data.announcement_text?.trim() || 'The family will share words of announcement soon.'}
        </div>
      </section>

      {showProgrammeSurface && programmeReadings.length > 0 ? (
        <section className="print-block print-section-major">
          <h2>Programme readings</h2>
          <ProgrammeReadingsList readings={programmeReadings} variant="print" />
        </section>
      ) : null}

      {showRemembrance && hasRemembrance ? (
        <section className="print-block print-section-major">
          <h2>Remembrance</h2>
          {data.remembrance?.scripture?.text ? (
            <figure className="mb-4 space-y-1">
              <blockquote className="border-l-2 border-[#999] pl-3 text-[11pt] italic leading-relaxed">
                {data.remembrance.scripture.text}
              </blockquote>
              {data.remembrance.scripture.reference ? (
                <figcaption className="pl-3 text-[9pt] uppercase tracking-wide text-[#555]">
                  {data.remembrance.scripture.reference}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
          {(data.remembrance?.quotes?.length ?? 0) > 0 ? (
            <ul className="space-y-3 border-t border-[#ddd] pt-3">
              {(data.remembrance?.quotes ?? []).map((q, i) => (
                <li key={`${q.text.slice(0, 24)}-${i}`} className="text-[10.5pt] leading-relaxed">
                  <p className="italic">&ldquo;{q.text}&rdquo;</p>
                  {q.attribution ? <p className="mt-1 text-[9.5pt] text-[#555]">— {q.attribution}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {hasContacts ? (
        <section className="print-block print-section-major">
          <h2>Key contacts</h2>
          {showStakeholderDirectory && (data.stakeholders?.length ?? 0) > 0 ? (
            <div className="mb-4">
              <p className="mb-2 text-[9pt] font-medium uppercase tracking-wide text-[#555]">
                Programme &amp; logistics
              </p>
              <ul className="print-list">
                {(data.stakeholders ?? []).map((s) => (
                  <li key={s.id}>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-[9.5pt] text-[#555]">{STAKEHOLDER_CATEGORY_LABEL[s.category]}</p>
                    {s.role_label ? <p className="text-[9.5pt] text-[#444]">{s.role_label}</p> : null}
                    {s.notes ? <p className="mt-1 text-[9.5pt] text-[#444]">{s.notes}</p> : null}
                    <div className="mt-1 text-[9.5pt]">
                      {s.phone ? <p>{s.phone}</p> : null}
                      {s.email ? <p>{s.email}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {(data.public_contacts?.length ?? 0) > 0 ? (
            <div
              className={
                showStakeholderDirectory && (data.stakeholders?.length ?? 0) > 0
                  ? 'border-t border-[#ddd] pt-4'
                  : ''
              }
            >
              <p className="mb-2 text-[9pt] font-medium uppercase tracking-wide text-[#555]">
                Family liaison
              </p>
              <ul className="print-list">
                {(data.public_contacts ?? []).map((c, i) => (
                  <li key={`${c.name}-${i}`}>
                    <p className="font-semibold">{c.name}</p>
                    {c.role_label ? <p className="text-[9.5pt] text-[#444]">{c.role_label}</p> : null}
                    <div className="mt-1 text-[9.5pt]">
                      {c.phone ? <p>{c.phone}</p> : null}
                      {c.whatsapp ? <p>WhatsApp: {c.whatsapp}</p> : null}
                      {c.email ? <p>{c.email}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {showProgrammeSurface && data.events.length > 0 ? (
        <section className="print-section-major">
          <h2>Programme</h2>
          <ul className="print-list">
            {data.events.map((e) => (
              <li key={e.id} className="print-block">
                <p className="font-semibold">{e.title}</p>
                <p className="text-[10pt] text-[#444]">{formatAccra(e.event_date)}</p>
                {e.location ? <p className="text-[10pt]">{e.location}</p> : null}
                {e.online_link ? (
                  <p className="text-[9.5pt] break-all">
                    <a href={e.online_link}>{e.online_link}</a>
                  </p>
                ) : null}
                {e.notes ? <p className="mt-1 text-[9.5pt] text-[#444]">{e.notes}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.closing_thank_you?.trim() ? (
        <section className="print-block print-section-major">
          <h2>Thank you</h2>
          <div className="print-announcement text-[10.5pt] leading-relaxed">{data.closing_thank_you.trim()}</div>
        </section>
      ) : null}

      {showWindDownPublic && (data.wind_down_meetings?.length ?? 0) > 0 ? (
        <section className="print-section-major">
          <h2>Closing meetings</h2>
          <p className="mb-2 text-[9.5pt] text-[#555]">Additional gatherings after the main programme.</p>
          <ul className="print-list">
            {(data.wind_down_meetings ?? []).map((m) => (
              <li key={m.id} className="print-block">
                <p className="font-semibold">{m.title}</p>
                {m.starts_at ? (
                  <p className="text-[10pt] text-[#444]">{formatAccra(m.starts_at)}</p>
                ) : null}
                {m.location ? <p className="text-[10pt]">{m.location}</p> : null}
                {m.notes ? <p className="mt-1 text-[9.5pt] text-[#444]">{m.notes}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
