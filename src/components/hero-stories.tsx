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
    location: 'Croydon → Kumasi',
    situation: 'Ghana · Akan · The one-week observation is Saturday.',
    line: 'Her uncle wants the body released from Komfo Anokye mortuary this week. Her brother in Accra wants three weeks so the London relatives can travel. Nobody has agreed. The canopy hire is still unbooked.',
  },
  {
    name: 'Kojo',
    location: 'East Legon, Accra',
    situation: 'Ghana · Akan · Mother died Monday. The funeral is Saturday.',
    line: 'Four days. The nsawa collectors need a list. The women from the church are already sewing the cloth. The sound system company wants a deposit. His phone has not stopped since Monday afternoon.',
  },
  {
    name: 'Grace',
    location: 'Birmingham',
    situation: 'Ghana · Her visa means she cannot leave the UK.',
    line: 'Her mother is being buried in Tema this Saturday. Grace will not be there. She is sending money via MoMo and choosing the aso ntoma from photos on WhatsApp, trying to be present in a funeral she cannot attend.',
  },
  {
    name: 'Usman',
    location: 'Kano',
    situation: 'Nigeria · Hausa Muslim · Father died at 2:17am.',
    line: 'Islam is clear: buried before Maghrib if possible. The Imam has been called. The grave must be dug before sunrise. His sister is calling from Manchester — she just found out, she cannot get a flight in time, she will miss the Janazah entirely.',
  },
  {
    name: 'Chinwe',
    location: 'Scarborough, Toronto',
    situation: 'Nigeria · Igbo · The Ikwa Ozu is in six weeks. 600 people.',
    line: 'The first burial was quiet, as is custom. The real funeral — the masquerade, the palm wine, the three nights of music — takes planning from a living room in Canada, across a seven-hour time difference, with uncles who publicly pledged on WhatsApp and have not paid.',
  },
  {
    name: 'Emeka',
    location: 'Lagos',
    situation: 'Nigeria · Igbo · Brother died suddenly at 36.',
    line: 'An unexpected death in Igbo custom carries a different weight — no celebration of a long life, no dancing, no highlife. There are whispers. The parents cannot function. Emeka is the younger one. He did not ask for this.',
  },
  {
    name: 'Fatima',
    location: 'Abuja',
    situation: 'Nigeria · Yoruba · The aso ebi has been chosen. The live band is booked.',
    line: 'She is the unofficial treasurer. Forty-seven names. Seventeen have pledged nothing. She cannot chase them — that would cause a scene. But if the money does not come in before the band deposit is due, the family takes a loan.',
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
