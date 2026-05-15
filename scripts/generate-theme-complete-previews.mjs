/**
 * Generates /public/theme-previews/{themeId}.jpg — phone mockups with real Africa portraits.
 * Run after download-africa-photos.mjs: node scripts/generate-theme-complete-previews.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const AFRICA_DIR = path.join(ROOT, 'public', 'photos', 'africa')
const OUT_DIR = path.join(ROOT, 'public', 'theme-previews')
const SHOWCASE_OUT = path.join(ROOT, 'public', 'showcase')
const FLAGSHIP_THEMES = ['programme', 'monument', 'kente', 'night']
const THEMES_FILE = path.join(ROOT, 'src', 'lib', 'visual-themes.ts')

const W = 400
const H = 711

const SAMPLE = {
  name: 'Kwame Mensah Bannerman',
  dates: '12 March 1942 · 3 May 2026',
  line: 'Of blessed memory · Bannerman family',
  snippet: 'It is with profound sadness that the family announces the passing of our beloved father.',
}

const REGION_HINTS = [
  { tokens: ['ghana', 'accra', 'kente', 'cape-coast', 'ashanti'], file: 'ghana-accra-elder-man.jpg' },
  { tokens: ['nigeria', 'lagos', 'abuja', 'yoruba'], file: 'nigeria-lagos-woman.jpg' },
  { tokens: ['senegal', 'dakar'], file: 'senegal-dakar-elder.jpg' },
  { tokens: ['mali', 'bamako'], file: 'mali-bamako-man.jpg' },
  { tokens: ['ivory', 'abidjan', 'cote', 'coral'], file: 'ivory-coast-abidjan-woman.jpg' },
  { tokens: ['cameroon'], file: 'cameroon-yaounde-elder.jpg' },
  { tokens: ['congo', 'kinshasa', 'river'], file: 'drc-kinshasa-woman.jpg' },
  { tokens: ['kenya', 'nairobi'], file: 'kenya-nairobi-elder-woman.jpg' },
  { tokens: ['ethiopia', 'addis'], file: 'ethiopia-addis-elder-man.jpg' },
  { tokens: ['tanzania', 'dar-teal', 'dar-es'], file: 'tanzania-dar-woman.jpg' },
  { tokens: ['somalia', 'mogadishu'], file: 'somalia-mogadishu-man.jpg' },
  { tokens: ['egypt', 'cairo', 'nile'], file: 'egypt-cairo-elder.jpg' },
  { tokens: ['morocco', 'fez', 'tunis', 'sahara'], file: 'morocco-fez-woman.jpg' },
  { tokens: ['south-africa', 'ubuntu', 'cape-winds'], file: 'south-africa-cape-elder.jpg' },
  { tokens: ['zimbabwe', 'harare', 'stone'], file: 'zimbabwe-harare-elder.jpg' },
  { tokens: ['botswana', 'sand', 'windhoek'], file: 'botswana-gaborone-woman.jpg' },
  { tokens: ['madagascar', 'rain'], file: 'madagascar-antananarivo-elder.jpg' },
  { tokens: ['mauritius', 'azure', 'seychelles', 'reunion', 'lagoon'], file: 'mauritius-port-louis-woman.jpg' },
  { tokens: ['rwanda', 'kigali'], file: 'rwanda-kigali-man.jpg' },
  { tokens: ['uganda', 'kampala'], file: 'uganda-kampala-elder.jpg' },
  { tokens: ['namibia', 'dust'], file: 'namibia-windhoek-woman.jpg' },
  { tokens: ['angola', 'amber', 'maputo'], file: 'angola-luanda-man.jpg' },
  { tokens: ['liberia', 'monrovia'], file: 'liberia-monrovia-elder.jpg' },
  { tokens: ['sierra-leone', 'freetown', 'harmony', 'mist'], file: 'sierra-leone-freetown-woman.jpg' },
  { tokens: ['pan-african', 'continental', 'ancestral', 'baobab', 'savanna', 'burkina', 'malawi'], file: 'pan-african-elder-man.jpg' },
]

const LAYOUTS = {
  programme: {
    bg: '#F7F4EF',
    heroBg: '#EDE8DF',
    text: '#2A1F18',
    muted: '#5C4A3D',
    accent: '#6B1F2A',
    rule: '#C9A962',
    band: null,
  },
  monument: {
    bg: '#F5F5F3',
    heroBg: '#E8E8E6',
    text: '#1A1A1A',
    muted: '#4A4A48',
    accent: '#2A2A28',
    rule: '#8A8A88',
    band: null,
  },
  kente: {
    bg: '#FBF7EE',
    heroBg: '#F3EBD8',
    text: '#1A1408',
    muted: '#4A3D28',
    accent: '#B8860B',
    rule: '#C9A02C',
    band: '#6B1F2A,#C9A02C,#1B5E20,#1A1A1A',
  },
  night: {
    bg: '#1C1814',
    heroBg: '#2A241E',
    text: '#F5F0E8',
    muted: '#C4B8A8',
    accent: '#E8C878',
    rule: '#8A7048',
    band: null,
  },
}

function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function parseThemeIds(src) {
  const blocks = [...src.matchAll(/\{\s*\n\s+id: '([^']+)',([\s\S]*?)\n\s+\},/g)]
  return blocks.map((m) => ({
    id: m[1],
    africaExtended: m[2].includes("batch: 'africa-extended'"),
  }))
}

async function listAvailablePortraits() {
  const names = await fs.readdir(AFRICA_DIR)
  return names.filter((n) => n.endsWith('.jpg'))
}

function resolvePortrait(themeId, available) {
  const id = themeId.toLowerCase()
  for (const { tokens, file } of REGION_HINTS) {
    if (tokens.some((t) => id.includes(t)) && available.includes(file)) return file
  }
  const idx = hashString(themeId) % available.length
  return available[idx]
}

function resolveLayout(themeId, group) {
  const id = themeId.toLowerCase()
  if (group === 'dark' || id.includes('night') || id.includes('candle') || id.includes('burgundy-mass')) {
    return 'night'
  }
  if (group === 'cultural' || id.includes('kente') || id.includes('adinkra') || id.includes('ashanti')) {
    return 'kente'
  }
  if (id.includes('monument') || id.includes('high-contrast') || id.includes('newspaper')) {
    return 'monument'
  }
  const keys = ['programme', 'monument', 'kente', 'night']
  return keys[hashString(themeId) % keys.length]
}

function parseGroupForTheme(src, themeId) {
  const re = new RegExp(`id: '${themeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?group: '([^']+)'`)
  const m = src.match(re)
  return m?.[1] ?? 'light'
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

function kenteBand(y, colors) {
  const cols = colors.split(',')
  const w = W / cols.length
  return cols
    .map(
      (c, i) =>
        `<rect x="${i * w}" y="${y}" width="${w}" height="6" fill="${c}"/>`,
    )
    .join('')
}

function layoutSvg(layoutKey, themeLabel) {
  const L = LAYOUTS[layoutKey]
  const heroH = Math.round(H * 0.42)
  const bandTop = L.band ? kenteBand(0, L.band) : ''
  const bandBottom = L.band ? kenteBand(H - 6, L.band) : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${L.bg}"/>
  ${bandTop}
  <rect x="8" y="${L.band ? 14 : 8}" width="${W - 16}" height="${heroH}" rx="8" fill="${L.heroBg}"/>
  <rect x="0" y="${heroH + 20}" width="${W}" height="2" fill="${L.rule}" opacity="0.55"/>
  <text x="${W / 2}" y="${heroH + 44}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="600" fill="${L.text}">${escapeXml(SAMPLE.name)}</text>
  <text x="${W / 2}" y="${heroH + 62}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="${L.muted}">${escapeXml(SAMPLE.dates)}</text>
  <text x="${W / 2}" y="${heroH + 78}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" fill="${L.muted}">${escapeXml(SAMPLE.line)}</text>
  <line x1="40" y1="${heroH + 90}" x2="${W - 40}" y2="${heroH + 90}" stroke="${L.accent}" stroke-width="1" opacity="0.35"/>
  <text x="16" y="${heroH + 108}" font-family="system-ui, sans-serif" font-size="7" fill="${L.muted}" letter-spacing="0.12em">SAMPLE ANNOUNCEMENT</text>
  <text x="16" y="${heroH + 128}" font-family="system-ui, sans-serif" font-size="9" fill="${L.text}" opacity="0.88">
    <tspan x="16" dy="0">${escapeXml(SAMPLE.snippet.slice(0, 52))}</tspan>
    <tspan x="16" dy="14">${escapeXml(SAMPLE.snippet.slice(52, 104))}…</tspan>
  </text>
  <text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7" fill="${L.muted}" opacity="0.65">${escapeXml(themeLabel)}</text>
  ${bandBottom}
</svg>`
}

async function buildPreview({ themeId, themeLabel, group }, portraitFile, available) {
  const layoutKey = resolveLayout(themeId, group)
  const portrait = resolvePortrait(themeId, available)
  const portraitPath = path.join(AFRICA_DIR, portrait)
  const heroH = Math.round(H * 0.42)
  const pad = 8
  const photoW = W - pad * 2
  const photoH = heroH - (layoutKey === 'kente' ? 6 : 0)

  const photo = await sharp(portraitPath)
    .resize(photoW, photoH, { fit: 'cover', position: 'attention' })
    .toBuffer()

  const frameSvg = layoutSvg(layoutKey, themeLabel)
  const frameBuf = await sharp(Buffer.from(frameSvg)).png().toBuffer()

  const photoY = pad + (layoutKey === 'kente' ? 6 : 0)
  const out = await sharp(frameBuf)
    .composite([{ input: photo, left: pad, top: photoY }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()

  const outPath = path.join(OUT_DIR, `${themeId}.jpg`)
  await fs.writeFile(outPath, out)
  if (FLAGSHIP_THEMES.includes(themeId)) {
    await fs.writeFile(path.join(SHOWCASE_OUT, `complete-${themeId}.jpg`), out)
  }
  return { themeId, layoutKey, portrait, bytes: out.length }
}

const themesSrc = await fs.readFile(THEMES_FILE, 'utf8')
const themes = parseThemeIds(themesSrc)
const available = await listAvailablePortraits()
if (available.length < 20) {
  console.warn(`Warning: only ${available.length} portraits in ${AFRICA_DIR} (expected ≥20)`)
}

await fs.mkdir(OUT_DIR, { recursive: true })

const labelById = Object.fromEntries(
  [...themesSrc.matchAll(/id: '([^']+)',\n\s+label: '([^']+)'/g)].map((m) => [m[1], m[2]]),
)

let ok = 0
for (const { id } of themes) {
  const group = parseGroupForTheme(themesSrc, id)
  const label = labelById[id] ?? id
  try {
    const r = await buildPreview({ themeId: id, themeLabel: label, group }, null, available)
    ok++
    if (ok % 20 === 0) console.log(`… ${ok} previews`)
    void r
  } catch (e) {
    console.error(`✗ ${id}: ${e.message}`)
  }
}

console.log(`Generated ${ok}/${themes.length} previews → ${OUT_DIR}`)
