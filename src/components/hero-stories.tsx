'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Story = {
  name: string
  location: string
  situation: string
  line: string
}

const STORIES: Story[] = [
  {
    name: 'Adjoa',
    location: 'London',
    situation: 'Father passed in Kumasi. Seven WhatsApp threads. No date agreed.',
    line: 'She is the most organised person in the family. No one has said so out loud, but everyone is calling her.',
  },
  {
    name: 'Kojo',
    location: 'Accra',
    situation: 'Mother died Monday. The funeral is Saturday. Four days.',
    line: 'The canopy hire wants 50% upfront. The uncle is travelling from Tamale. The diaspora wants a livestream. His phone has not stopped.',
  },
  {
    name: 'Usman',
    location: 'Kano',
    situation: 'Father died at 2:17am. Janazah before Maghrib.',
    line: 'His sister is calling from Manchester. She just found out. She will miss the burial entirely.',
  },
  {
    name: 'Chinwe',
    location: 'Toronto',
    situation: 'Planning the Ikwa Ozu. 600 people. Six weeks.',
    line: 'She is doing this from a living room in Canada, across a seven-hour time difference, with family members who are equally adamant and rarely agree.',
  },
  {
    name: 'Emeka',
    location: 'Lagos',
    situation: 'Brother died suddenly at 36. No warning. Parents broken.',
    line: 'He is the younger one. He did not ask for this. But someone has to.',
  },
  {
    name: 'Grace',
    location: 'Birmingham',
    situation: 'Mother died in Tema. Grace cannot go back.',
    line: 'She is choosing the fabric from photos sent on WhatsApp. The shame of not being there sits heavily on her.',
  },
  {
    name: 'Fatima',
    location: 'Abuja',
    situation: '47 names in a notebook. 17 have not pledged.',
    line: 'She cannot chase them openly. But if the money does not come in, the family takes a loan — and the shame of a smaller funeral is worse.',
  },
]

export function HeroStories() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % STORIES.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const story = STORIES[index]

  return (
    <div className="space-y-8">
      {/* Rotating story */}
      <div
        className="space-y-4 transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--passage-font-display)] text-lg font-semibold text-[var(--passage-heading)]">
            {story.name}
          </span>
          <span className="text-sm text-[var(--passage-muted)]">{story.location}</span>
        </div>

        <p className="text-xs uppercase tracking-[0.18em] text-[var(--passage-muted)]">
          {story.situation}
        </p>

        <h1 className="font-[family-name:var(--passage-font-display)] text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
          {story.line}
        </h1>
      </div>

      {/* Story dots */}
      <div className="flex gap-1.5">
        {STORIES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Story ${i + 1}`}
            onClick={() => { setIndex(i); setVisible(true) }}
            className={[
              'h-1 rounded-full transition-all duration-300',
              i === index
                ? 'w-6 bg-[var(--passage-heading)]'
                : 'w-1.5 bg-[var(--passage-muted)]/30',
            ].join(' ')}
          />
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/create"
          className="passage-text-link text-base font-medium"
        >
          Start the memorial →
        </Link>
        <Link
          href="/memorial/samuel-mensah-2026"
          className="text-base text-[var(--passage-muted)] hover:text-[var(--passage-text)]"
        >
          See an example
        </Link>
      </div>
    </div>
  )
}
