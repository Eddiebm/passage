/**
 * Generates dignified sample memorial photos under public/seed/.
 * Male-presenting silhouettes: mensah-* (Samuel example).
 * Female-presenting silhouettes: muslim-* (Fatima programme example).
 * Run: node scripts/generate-seed-images.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'seed')

/** Male-presenting portrait: broader shoulders, uncovered head, squarer jaw hint. */
function portraitSvgMale({ w, h, bg1, bg2, accent, label, sublabel }) {
  const cx = w / 2
  const headY = h * 0.31
  const headR = w * 0.105
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <ellipse cx="${cx}" cy="${h * 0.6}" rx="${w * 0.3}" ry="${h * 0.17}" fill="${accent}" opacity="0.2"/>
  <ellipse cx="${cx}" cy="${headY + headR * 0.35}" rx="${headR * 1.05}" ry="${headR * 0.92}" fill="${accent}" opacity="0.3"/>
  <circle cx="${cx}" cy="${headY}" r="${headR}" fill="${accent}" opacity="0.34"/>
  <rect x="${cx - headR * 0.85}" y="${headY + headR * 0.55}" width="${headR * 1.7}" height="${headR * 0.35}" rx="6" fill="${accent}" opacity="0.22"/>
  <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#0a0a0a" opacity="0.35"/>
  <text x="${cx}" y="${h * 0.84}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#FAFAF8" fill-opacity="0.55">${label}</text>
  <text x="${cx}" y="${h * 0.88}" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#FAFAF8" fill-opacity="0.4">${sublabel}</text>
</svg>`
}

/** Female-presenting portrait: softer shoulders; optional hijab drape for Muslim example. */
function portraitSvgFemale({ w, h, bg1, bg2, accent, label, sublabel, hijab = false }) {
  const cx = w / 2
  const headY = h * 0.32
  const headR = w * 0.095
  const hijabPaths = hijab
    ? `
  <ellipse cx="${cx}" cy="${headY - headR * 0.15}" rx="${headR * 1.55}" ry="${headR * 1.35}" fill="${accent}" opacity="0.28"/>
  <path d="M ${cx - headR * 1.5} ${headY - headR * 0.2}
           Q ${cx} ${headY + headR * 1.6} ${cx + headR * 1.5} ${headY - headR * 0.2}
           Q ${cx} ${headY + headR * 0.9} ${cx - headR * 1.5} ${headY - headR * 0.2} Z"
        fill="${accent}" opacity="0.24"/>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <ellipse cx="${cx}" cy="${h * 0.59}" rx="${w * 0.22}" ry="${h * 0.14}" fill="${accent}" opacity="0.18"/>
  ${hijabPaths}
  <circle cx="${cx}" cy="${headY}" r="${headR}" fill="${accent}" opacity="0.32"/>
  <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#0a0a0a" opacity="0.35"/>
  <text x="${cx}" y="${h * 0.84}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#FAFAF8" fill-opacity="0.55">${label}</text>
  <text x="${cx}" y="${h * 0.88}" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#FAFAF8" fill-opacity="0.4">${sublabel}</text>
</svg>`
}

function sceneSvg({ w, h, bg1, bg2, accent, label }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="${w * 0.08}" y="${h * 0.55}" width="${w * 0.84}" height="${h * 0.28}" rx="12" fill="${accent}" opacity="0.15"/>
  <circle cx="${w * 0.25}" cy="${h * 0.42}" r="${w * 0.06}" fill="${accent}" opacity="0.25"/>
  <circle cx="${w * 0.42}" cy="${h * 0.38}" r="${w * 0.055}" fill="${accent}" opacity="0.22"/>
  <circle cx="${w * 0.58}" cy="${h * 0.4}" r="${w * 0.058}" fill="${accent}" opacity="0.24"/>
  <circle cx="${w * 0.74}" cy="${h * 0.43}" r="${w * 0.052}" fill="${accent}" opacity="0.2"/>
  <text x="${w / 2}" y="${h * 0.92}" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#FAFAF8" fill-opacity="0.45">${label}</text>
</svg>`
}

async function writeJpeg(name, svg, quality = 90) {
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality, mozjpeg: true }).toBuffer()
  await fs.writeFile(path.join(OUT, name), buf)
  return buf.length
}

const W = 1200
const H = 1500

const jobs = [
  {
    file: 'mensah-primary.jpg',
    svg: portraitSvgMale({
      w: W,
      h: H,
      bg1: '#2c241c',
      bg2: '#4a3b30',
      accent: '#c9a962',
      label: 'Gentleman — sample',
      sublabel: 'Passage · male example',
    }),
  },
  {
    file: 'mensah-1.jpg',
    svg: sceneSvg({
      w: W,
      h: H,
      bg1: '#1e2a38',
      bg2: '#3d4f5c',
      accent: '#d4c4a8',
      label: 'Family gathering',
    }),
  },
  {
    file: 'mensah-2.jpg',
    svg: sceneSvg({
      w: W,
      h: H,
      bg1: '#2a2418',
      bg2: '#4d4030',
      accent: '#e8dcc8',
      label: 'Church service',
    }),
  },
  {
    file: 'mensah-3.jpg',
    svg: portraitSvgMale({
      w: W,
      h: H,
      bg1: '#1a2820',
      bg2: '#2f4538',
      accent: '#b8c9b0',
      label: 'Celebration of life',
      sublabel: 'Sample gallery',
    }),
  },
  {
    file: 'mensah-4.jpg',
    svg: sceneSvg({
      w: W,
      h: H,
      bg1: '#352820',
      bg2: '#5c4838',
      accent: '#f0e6d6',
      label: 'Community remembrance',
    }),
  },
  {
    file: 'muslim-primary.jpg',
    svg: portraitSvgFemale({
      w: W,
      h: H,
      bg1: '#1e2a26',
      bg2: '#3d5248',
      accent: '#9fb5a8',
      label: 'Matriarch — sample',
      sublabel: 'Passage · female example',
      hijab: true,
    }),
  },
  {
    file: 'muslim-1.jpg',
    svg: sceneSvg({
      w: W,
      h: H,
      bg1: '#1a2830',
      bg2: '#2e4550',
      accent: '#c5d4ce',
      label: 'Mosque gathering',
    }),
  },
  {
    file: 'muslim-2.jpg',
    svg: sceneSvg({
      w: W,
      h: H,
      bg1: '#2a2824',
      bg2: '#454038',
      accent: '#d8cfc0',
      label: 'Family remembrance',
    }),
  },
  {
    file: 'muslim-3.jpg',
    svg: portraitSvgFemale({
      w: W,
      h: H,
      bg1: '#242820',
      bg2: '#3e4a38',
      accent: '#b0b8a4',
      label: 'Quiet reflection',
      sublabel: 'Sample gallery',
      hijab: true,
    }),
  },
]

await fs.mkdir(OUT, { recursive: true })
for (const { file, svg } of jobs) {
  const bytes = await writeJpeg(file, svg)
  console.log(`wrote ${file} (${Math.round(bytes / 1024)} KB)`)
}
