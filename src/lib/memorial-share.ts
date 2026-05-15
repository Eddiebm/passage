import type { Memorial } from '@/lib/types'
import { getSiteOrigin } from '@/lib/site-url'
import { hydrateMemorial } from '@/lib/memorial-hydrate'

const META_DESC_MAX = 160

function singleLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** First ~160 characters for meta description (announcement, then biography). */
export function memorialMetaDescription(m: Memorial, max = META_DESC_MAX): string {
  const fromAnnouncement = m.announcement_text?.trim()
  if (fromAnnouncement) {
    const one = singleLine(fromAnnouncement)
    if (one.length <= max) return one
    return `${one.slice(0, max - 1).trimEnd()}…`
  }
  const bio = m.biography?.trim()
  if (bio) {
    const one = singleLine(bio)
    if (one.length <= max) return one
    return `${one.slice(0, max - 1).trimEnd()}…`
  }
  return `Memorial for ${m.deceased_name}. Programme, announcements, and tributes on Passage.`
}

/**
 * Public liaison line only (hydrated `public_contacts` / legacy coordinator fields).
 * Never uses `internal_contacts`.
 */
export function formatPublicLiaisonLine(m: Memorial): string | undefined {
  const hydrated = hydrateMemorial(m)
  const c = hydrated.public_contacts?.[0]
  if (!c) return undefined
  const bits: string[] = []
  if (c.phone?.trim()) bits.push(c.phone.trim())
  if (c.whatsapp?.trim()) bits.push(`WhatsApp ${c.whatsapp.trim()}`)
  if (c.email?.trim()) bits.push(c.email.trim())
  if (bits.length === 0 && c.name.trim()) return `Family liaison: ${c.name.trim()}`
  return `Family liaison: ${c.name.trim()} — ${bits.join(' · ')}`
}

/** Plain text for copy / WhatsApp share: name, dates, link, optional public liaison line. */
export function buildMemorialShareAnnouncement(m: Memorial, memorialPageUrl: string): string {
  const lines: string[] = [m.deceased_name]
  const dob = m.date_of_birth?.trim()
  const dop = m.date_of_passing?.trim()
  const dateLine = [dob ? `Sunrise: ${dob}` : '', dop ? `Sunset: ${dop}` : ''].filter(Boolean).join(' · ')
  if (dateLine) lines.push(dateLine)
  lines.push(memorialPageUrl)
  const liaison = formatPublicLiaisonLine(m)
  if (liaison) lines.push(liaison)
  return lines.join('\n')
}

export function memorialPagePath(slug: string): string {
  return `/memorial/${slug}`
}

export function memorialAbsoluteUrl(slug: string): string {
  const origin = getSiteOrigin()
  return `${origin}${memorialPagePath(slug)}`
}

/** Resolve relative upload paths to absolute URLs for Open Graph. */
export function toAbsoluteImageUrl(origin: string, url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined
  const u = url.trim()
  if (u.startsWith('https://') || u.startsWith('http://')) return u
  if (u.startsWith('//')) return `https:${u}`
  const path = u.startsWith('/') ? u : `/${u}`
  return `${origin}${path}`
}

export function pickMemorialOgImageUrl(
  origin: string,
  photoUrl: string | undefined,
  galleryUrls: string[] | undefined,
): string | undefined {
  const primary = toAbsoluteImageUrl(origin, photoUrl)
  if (primary) return primary
  const firstGallery = galleryUrls?.find((u) => u?.trim())
  return toAbsoluteImageUrl(origin, firstGallery)
}

export function memorialWhatsAppWebShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
