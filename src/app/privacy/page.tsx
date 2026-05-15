import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getPassageSupportContact, getPassageSupportEmail } from '@/lib/support-email'

export const metadata: Metadata = {
  title: 'Privacy — Passage',
  description: 'How Passage collects, stores, and shares memorial data.',
}

export default function PrivacyPage() {
  const contact = getPassageSupportContact()
  const supportEmail = getPassageSupportEmail()

  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A02C]">Passage</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
          Last updated: May 2026. Plain-language summary for coordinators and guests.
        </p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#1A1A1A]/85">
          <section>
            <h2 className="text-base font-semibold text-[#1A1A1A]">What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Memorial content, programme, readings, and contacts you enter.</li>
              <li>Photos, guest tributes, and Paystack references when fundraising is on.</li>
              <li>OCR uploads processed by configured providers.</li>
              <li>Coordinator and reminder email addresses.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#1A1A1A]">Who can see what</h2>
            <p className="mt-3">Public pages show published content; coordinator-only fields stay behind the family PIN.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#1A1A1A]">Contact</h2>
            <p className="mt-3">
              Questions about data access or deletion:{' '}
              {supportEmail ? (
                <a href={`mailto:${supportEmail}`} className="font-medium text-[#1A1A1A] underline hover:text-[#C9A02C]">
                  {contact}
                </a>
              ) : (
                <span className="font-medium text-[#1A1A1A]">{contact}</span>
              )}
            </p>
          </section>
        </div>
        <p className="mt-12 text-xs text-[#1A1A1A]/55">
          <Link href="/" className="text-[#C9A02C] underline hover:text-[#d4ae3f]">Back to home</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
