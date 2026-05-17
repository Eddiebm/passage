import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HelpServiceTierGuide } from '@/components/help-service-tier-guide'
import { getPassageSupportContact, getPassageSupportEmail } from '@/lib/support-email'

export const metadata: Metadata = {
  title: 'Help — Passage',
  description: 'A gentle guide for families using Passage to honour a loved one.',
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
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--passage-muted)]">For the family</p>
        <h1 className="mt-2 font-[family-name:var(--passage-font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          A guide for families using Passage
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--passage-muted)]">
          Step by step, at your own pace. You do not need to figure this out alone.
        </p>
        <div className="mt-10 space-y-8">
          <GuideSection title="What Passage is for">
            <p>
              Passage helps your family share the news, publish the funeral programme, receive contributions,
              and give your loved one a dignified memorial — all from one calm place, shared on WhatsApp.
            </p>
          </GuideSection>
          <GuideSection title="Getting started">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <strong>Create the memorial</strong> — add the name, dates, a photo, and choose the appearance.
              </li>
              <li>
                <strong>Review and publish</strong> when the family is ready.
              </li>
              <li>
                <strong>Share the link</strong> on WhatsApp so everyone — near and far — can see it.
              </li>
              <li>
                <strong>Come back to edit</strong> at any time using your family PIN.
              </li>
            </ol>
          </GuideSection>
          <GuideSection title="Which option is right for us?">
            <HelpServiceTierGuide />
          </GuideSection>
          <GuideSection title="Choosing the appearance">
            <p>
              In the family portal under <strong>Appearance</strong>, choose from Programme, Monument, Kente, or Night.
              Guests see the family&apos;s choice. They can also switch style themselves at the bottom of the memorial page.
            </p>
          </GuideSection>
          <GuideSection title="Adding photos">
            <p>
              Upload a portrait during setup, and add a gallery of memories when you are ready.
              You can enable the gallery from the family portal whenever the time feels right.
            </p>
          </GuideSection>
          <GuideSection title="Programme readings">
            <p>
              Add scripture, hymns, or Quran verses. You can also upload printed programme pages.
              Mark anything sensitive as coordinator-only so it stays private.
            </p>
          </GuideSection>
          <GuideSection title="Contributions from family and friends">
            <p>
              Loved ones can contribute via mobile money or card through Paystack. You can track pledges,
              verify payments, and close the accounts when everything is settled.
            </p>
          </GuideSection>
          <GuideSection title="Printing">
            <p>
              Print the programme sheet, a burial banner, or open the printer guide to take to a local print shop.
            </p>
          </GuideSection>
          <GuideSection title="Scanning documents">
            <p>
              Photograph a funeral poster, death certificate, or bank statement — Passage reads the text and
              suggests the fields. You review everything before anything is saved.
            </p>
          </GuideSection>
          <GuideSection title="When the funeral is over">
            <p>
              Closing the memorial gives it a clear, respectful public state and lets you finalise the accounts.
              The page stays up as a lasting memory.
            </p>
          </GuideSection>
          <GuideSection title="Need more help?" id="contact">
            <p>
              We are here.{' '}
              {supportEmail ? (
                <a href={`mailto:${supportEmail}`} className="passage-text-link">
                  {contact}
                </a>
              ) : (
                <span className="font-medium">{contact}</span>
              )}
              {'. '}
              <Link href="/privacy" className="passage-text-link">
                Privacy policy
              </Link>
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
