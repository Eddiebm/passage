import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Libre_Baskerville, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Passage — Every life remembered',
  description:
    'Digital infrastructure for how African communities process death — programmes, appeals, tributes, and contributions in one dignified place.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme="programme"
      className={`h-full antialiased ${dmSans.variable} ${libreBaskerville.variable} ${cormorant.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-full bg-[var(--passage-bg)] font-sans text-[var(--passage-text)]">
        {children}
      </body>
    </html>
  )
}
