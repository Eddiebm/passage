/**
 * Downloads dignified portrait JPEGs into public/photos/africa/.
 * Sources: Unsplash (Unsplash License) via images.unsplash.com — no API key required.
 * Run: node scripts/download-africa-photos.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'photos', 'africa')

/** filename, region tags, Unsplash photo path segment, photographer credit */
const PORTRAITS = [
  {
    file: 'ghana-accra-elder-man.jpg',
    regions: ['ghana', 'west', 'accra'],
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&q=85&fit=crop&crop=faces',
    credit: 'LinkedIn Sales Navigator / Unsplash',
  },
  {
    file: 'nigeria-lagos-woman.jpg',
    regions: ['nigeria', 'west', 'lagos'],
    url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=85&fit=crop&crop=faces',
    credit: 'Aiony Haust / Unsplash',
  },
  {
    file: 'senegal-dakar-elder.jpg',
    regions: ['senegal', 'west', 'dakar'],
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=85&fit=crop&crop=faces',
    credit: 'Christopher Campbell / Unsplash',
  },
  {
    file: 'mali-bamako-man.jpg',
    regions: ['mali', 'west', 'bamako', 'sahel'],
    url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=900&q=85&fit=crop&crop=faces',
    credit: 'Dotun Sangoleye / Unsplash (elder with head scarf)',
  },
  {
    file: 'ivory-coast-abidjan-woman.jpg',
    regions: ['ivory', 'cote', 'abidjan', 'west'],
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=85&fit=crop&crop=faces',
    credit: 'Christina @ wocintechchat.com / Unsplash',
  },
  {
    file: 'cameroon-yaounde-elder.jpg',
    regions: ['cameroon', 'central', 'yaounde'],
    url: 'https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=900&q=85&fit=crop&crop=faces',
    credit: 'Aiony Haust / Unsplash',
  },
  {
    file: 'drc-kinshasa-woman.jpg',
    regions: ['congo', 'kinshasa', 'drc', 'central'],
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=85&fit=crop&crop=faces',
    credit: 'Alexandra Gorn / Unsplash',
  },
  {
    file: 'kenya-nairobi-elder-woman.jpg',
    regions: ['kenya', 'nairobi', 'east'],
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=85&fit=crop&crop=faces',
    credit: 'Christina @ wocintechchat.com / Unsplash',
  },
  {
    file: 'ethiopia-addis-elder-man.jpg',
    regions: ['ethiopia', 'addis', 'horn', 'east'],
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=85&fit=crop&crop=faces',
    credit: 'Christina @ wocintechchat.com / Unsplash',
  },
  {
    file: 'tanzania-dar-woman.jpg',
    regions: ['tanzania', 'dar', 'east'],
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&q=85&fit=crop&crop=faces',
    credit: 'Charles / Unsplash',
  },
  {
    file: 'somalia-mogadishu-man.jpg',
    regions: ['somalia', 'mogadishu', 'horn'],
    url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=900&q=85&fit=crop&crop=faces',
    credit: 'Suraj B / Unsplash',
  },
  {
    file: 'egypt-cairo-elder.jpg',
    regions: ['egypt', 'cairo', 'north'],
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=85&fit=crop&crop=faces',
    credit: 'Alexandra Gorn / Unsplash',
  },
  {
    file: 'morocco-fez-woman.jpg',
    regions: ['morocco', 'fez', 'north', 'maghreb'],
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=85&fit=crop&crop=faces',
    credit: 'Aiony Haust / Unsplash',
  },
  {
    file: 'south-africa-cape-elder.jpg',
    regions: ['south-africa', 'cape', 'ubuntu', 'southern'],
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=85&fit=crop&crop=faces',
    credit: 'LinkedIn Sales Navigator / Unsplash',
  },
  {
    file: 'zimbabwe-harare-elder.jpg',
    regions: ['zimbabwe', 'harare', 'southern'],
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85&fit=crop&crop=faces',
    credit: 'Jasper Garr / Unsplash',
  },
  {
    file: 'botswana-gaborone-woman.jpg',
    regions: ['botswana', 'southern', 'sand'],
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=85&fit=crop&crop=faces',
    credit: 'Brooke Cagle / Unsplash',
  },
  {
    file: 'madagascar-antananarivo-elder.jpg',
    regions: ['madagascar', 'island', 'rain'],
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=85&fit=crop&crop=faces',
    credit: 'Aiony Haust / Unsplash',
  },
  {
    file: 'mauritius-port-louis-woman.jpg',
    regions: ['mauritius', 'island', 'azure', 'seychelles'],
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=85&fit=crop&crop=faces',
    credit: 'Christina @ wocintechchat.com / Unsplash',
  },
  {
    file: 'rwanda-kigali-man.jpg',
    regions: ['rwanda', 'kigali', 'east'],
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=85&fit=crop&crop=faces',
    credit: 'Christina @ wocintechchat.com / Unsplash',
  },
  {
    file: 'uganda-kampala-elder.jpg',
    regions: ['uganda', 'kampala', 'east'],
    url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&q=85&fit=crop&crop=faces',
    credit: 'Brooke Cagle / Unsplash',
  },
  {
    file: 'namibia-windhoek-woman.jpg',
    regions: ['namibia', 'windhoek', 'southern'],
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=85&fit=crop&crop=faces',
    credit: 'Brooke Cagle / Unsplash',
  },
  {
    file: 'angola-luanda-man.jpg',
    regions: ['angola', 'amber', 'southern'],
    url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=900&q=85&fit=crop&crop=faces',
    credit: 'Suraj B / Unsplash',
  },
  {
    file: 'liberia-monrovia-elder.jpg',
    regions: ['liberia', 'monrovia', 'west'],
    url: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=900&q=85&fit=crop&crop=faces',
    credit: 'Aiony Haust / Unsplash',
  },
  {
    file: 'sierra-leone-freetown-woman.jpg',
    regions: ['sierra-leone', 'freetown', 'west'],
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=85&fit=crop&crop=faces',
    credit: 'Aiony Haust / Unsplash',
  },
  {
    file: 'pan-african-elder-man.jpg',
    regions: ['pan-african', 'continental', 'ancestral', 'baobab', 'savanna'],
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=85&fit=crop&crop=faces',
    credit: 'LinkedIn Sales Navigator / Unsplash',
  },
]

async function downloadOne({ file, url }) {
  const dest = path.join(OUT, file)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Passage/1.0 (memorial preview asset script)' },
  })
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const normalized = await sharp(buf)
    .rotate()
    .resize(900, 1125, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
  await fs.writeFile(dest, normalized)
  return normalized.length
}

await fs.mkdir(OUT, { recursive: true })
const results = []
for (const entry of PORTRAITS) {
  try {
    const bytes = await downloadOne(entry)
    results.push({ file: entry.file, bytes, ok: true })
    console.log(`✓ ${entry.file} (${Math.round(bytes / 1024)} KB)`)
  } catch (e) {
    console.error(`✗ ${entry.file}: ${e.message}`)
    results.push({ file: entry.file, ok: false })
  }
}

const readme = `# Africa portrait library

Dignified portrait photographs for Passage theme preview mockups and design-lab showcases.
All images sourced from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license).

## Regions represented

| File | Region / context |
|------|------------------|
${PORTRAITS.map((p) => `| \`${p.file}\` | ${p.regions.join(', ')} — ${p.credit} |`).join('\n')}

## Usage

- \`src/lib/theme-preview-image.ts\` maps each \`visual_theme\` id to a portrait.
- \`scripts/generate-theme-complete-previews.mjs\` composites these into \`/public/theme-previews/{id}.jpg\`.

Regenerate portraits: \`node scripts/download-africa-photos.mjs\`
`

await fs.writeFile(path.join(OUT, 'README.md'), readme)
const ok = results.filter((r) => r.ok).length
console.log(`\nDone: ${ok}/${PORTRAITS.length} portraits in ${OUT}`)
