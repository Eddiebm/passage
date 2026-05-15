import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#FAFAF8] font-sans text-[#1A1A1A]">{children}</body>
    </html>
  )
}
