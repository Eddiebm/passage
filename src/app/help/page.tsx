import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HelpServiceTierGuide } from '@/components/help-service-tier-guide'
import { getPassageSupportContact, getPassageSupportEmail } from '@/lib/support-email'

export const metadata: Metadata = {
  title: 'Help — Passage',
  description: 'How to run a funeral on Passage — coordinator guide.',
}

function GuideSection({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-b border-[color-mix(in_srgb,var(--passage-rule)_18%,transparent)] pb-8"
    >
      <h2 className="passage-section-title border-0 pb-0">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--passage-muted)]">{children}</div>
    </section>
  )
}

export default function HelpPage() {
  const contact = getPassageSupportContact()
  const supportEmail = getPassageSupportEmail()

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="passage-memorial-main mx-auto w-full flex-1 px-4 py-10 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--passage-muted)]">Coordinator desk</p>
        <h1 className="mt-2 font-[family-name:var(--passage-font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          How to run a funeral on Passage
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--passage-muted)]">
          A calm checklist for family coordinators.
        </p>
        <div className="mt-10 space-y-8">
          <GuideSection title="What Passage is">
            <p>Announce, share one WhatsApp link, print programmes and banners, and coordinate contributions.</p>
          </GuideSection>
          <GuideSection title="Quick start">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <strong>Create</strong> — name, dates, coordinator PIN, and visual theme.
              </li>
              <li>
                <strong>Publish</strong> when the family approves.
              </li>
              <li>
                <strong>Share</strong> the memorial link on WhatsApp.
              </li>
              <li>
                <strong>Edit</strong> anytime with your PIN.
              </li>
            </ol>
          </GuideSection>
          <GuideSection title="Service tiers">
            <HelpServiceTierGuide />
          </GuideSection>
          <GuideSection title="Visual themes">
            <p>
              In the edit portal under <strong>Appearance</strong>, choose Programme, Monument, Kente, or Night.
              Guests see the family&apos;s choice; they can switch view at the foot of the memorial page.
            </p>
          </GuideSection>
          <GuideSection title="Photos">
            <p>Upload a portrait and batch gallery images; enable the gallery when ready.</p>
          </GuideSection>
          <GuideSection title="Programme readings">
            <p>Scripture, hymns, Quran, or uploaded programme pages. Mark sensitive items coordinator-only.</p>
          </GuideSection>
          <GuideSection title="Money (Paystack)">
            <p>MoMo and card via Paystack; pledges and verified payments; closure accounting when you close.</p>
          </GuideSection>
          <GuideSection title="Print">
            <p>Programme, banner, and printer guide for local print shops.</p>
          </GuideSection>
          <GuideSection title="OCR (scan documents)">
            <p>Scan posters, death certificates, or bank statements; review extracted fields before saving.</p>
          </GuideSection>
          <GuideSection title="Close the memorial">
            <p>Close when the funeral ends for a clear public state and final accounting.</p>
          </GuideSection>
          <GuideSection title="Get help" id="contact">
            <p>
              <Link href="/privacy" className="passage-text-link">
                Privacy
              </Link>
              {' · '}Questions:{' '}
              {supportEmail ? (
                <a href={`mailto:${supportEmail}`} className="passage-text-link">
                  {contact}
                </a>
              ) : (
                <span className="font-medium">{contact}</span>
              )}
              .
            </p>
          </GuideSection>
        </div>
        <p className="mt-10 text-xs text-[var(--passage-muted)]">
          <Link href="/" className="passage-text-link">
            Back to home
          </Link>
        </p>
      </main>
      <SiteFooter showExamples />
    </div>
  )
}
