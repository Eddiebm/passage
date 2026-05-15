import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { getPassageSupportContact, getPassageSupportEmail } from '@/lib/support-email'

export const metadata: Metadata = {
  title: 'Help — Passage',
  description: 'How to run a funeral on Passage — coordinator guide.',
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-20 border-b border-[#3D2B1F]/10 pb-8">
      <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#1A1A1A]/85">
        {children}
      </div>
    </section>
  )
}

export default function HelpPage() {
  const contact = getPassageSupportContact()
  const supportEmail = getPassageSupportEmail()

  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 pb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A02C]">Coordinator guide</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          How to run a funeral on Passage
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
          A calm, mobile-first checklist for family coordinators.
        </p>
        <div className="mt-10 space-y-8">
          <GuideSection title="What Passage is">
            <p>Announce, share one WhatsApp link, print programmes and banners, and coordinate contributions in one place.</p>
          </GuideSection>
          <GuideSection title="Quick start">
            <ol className="list-decimal space-y-2 pl-5">
              <li><strong>Create</strong> — name, dates, coordinator PIN.</li>
              <li><strong>Publish</strong> when the family approves.</li>
              <li><strong>Share</strong> the memorial link on WhatsApp.</li>
              <li><strong>Edit</strong> anytime with your PIN.</li>
            </ol>
          </GuideSection>
          <GuideSection title="Modes: notice, programme, full">
            <p><strong>Notice</strong> — essentials. <strong>Programme</strong> — order of service. <strong>Full</strong> — tributes, fundraising, gallery, coordinator tools.</p>
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
          <GuideSection title="Get help">
            <p>
              <Link href="/privacy" className="text-[#C9A02C] underline hover:text-[#d4ae3f]">Privacy</Link>
              {' · '}Questions:{' '}
              {supportEmail ? (
                <a href={`mailto:${supportEmail}`} className="text-[#C9A02C] underline hover:text-[#d4ae3f]">
                  {contact}
                </a>
              ) : (
                <span className="font-medium">{contact}</span>
              )}
              .
            </p>
          </GuideSection>
        </div>
        <p className="mt-10 text-xs text-[#1A1A1A]/55">
          <Link href="/" className="text-[#C9A02C] underline hover:text-[#d4ae3f]">Back to home</Link>
        </p>
      </main>
      <footer className="border-t border-[#3D2B1F]/15 py-6 text-center text-xs text-[#1A1A1A]/50">
        Passage — coordinator help
      </footer>
    </div>
  )
}
