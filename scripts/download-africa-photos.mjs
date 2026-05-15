/**
 * Downloads dignified African portrait JPEGs into public/photos/africa/.
 * Sources: Unsplash (Unsplash License) — curated slugs validated for African context.
 * Run: node scripts/download-africa-photos.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'photos', 'africa')

/** @see src/lib/portrait-policy.ts */
const AFRICA_CONTEXT_KEYWORDS = [
  'africa', 'african', 'ghana', 'nigeria', 'kenya', 'senegal', 'ethiopia', 'somalia',
  'uganda', 'tanzania', 'rwanda', 'zimbabwe', 'botswana', 'namibia', 'angola', 'mozambique',
  'cameroon', 'congo', 'kinshasa', 'lagos', 'accra', 'dakar', 'cairo', 'morocco', 'maghreb',
  'yoruba', 'hausa', 'ivory coast', 'sierra leone', 'liberia', 'mali', 'madagascar', 'mauritius',
  'zambia', 'tunisia', 'goree', 'lalibela', 'kisumu', 'nairobi', 'himba', 'lesedi', 'bagamoyo',
  'mogadishu', 'moroccan', 'marrakech', 'zimbabwean', 'ugandan', 'zambian', 'nigerian', 'tribal',
]
const PORTRAIT_REJECT_KEYWORDS = ['linkedin sales', 'corporate headshot', 'wocintech', 'handmade craft']
const AFRICA_RE = new RegExp(`\\b(${AFRICA_CONTEXT_KEYWORDS.join('|')})\\b`, 'i')
const REJECT_RE = new RegExp(`\\b(${PORTRAIT_REJECT_KEYWORDS.join('|')}|zebra|lion|waterbuck|lemur)\\b`, 'i')

/**
 * @type {{ file: string, regions: string[], photo: string, credit: string, context: string }[]}
 */
const PORTRAITS = [
  { file: 'ghana-accra-elder-man.jpg', regions: ['ghana', 'west', 'accra'], photo: '1744808233123-ada0a357783f', credit: 'David Geneugelijk', context: 'Shepherd in Accra, Ghana' },
  { file: 'ghana-accra-elder-woman.jpg', regions: ['ghana', 'west', 'accra'], photo: '1762945274836-4c2cbb75e20e', credit: 'Barnabas Lartey-Odoi Tetteh', context: 'Egg seller, Accra, Ghana' },
  { file: 'ghana-fashion-elder.jpg', regions: ['ghana', 'west'], photo: '1658457799137-1e15e0baaee7', credit: 'Barnabas Lartey-Odoi Tetteh', context: 'Fashion Africa, Ghana portrait' },
  { file: 'nigeria-lagos-woman.jpg', regions: ['nigeria', 'west', 'lagos'], photo: '1620424037570-15137a4a562d', credit: 'Belinda Amoah', context: 'Black African woman portrait' },
  { file: 'nigeria-lagos-elder-man.jpg', regions: ['nigeria', 'west', 'yoruba'], photo: '1688143029511-b37423aa60a2', credit: 'Tolu Akinyemi', context: 'Yoruba man, Nigeria' },
  { file: 'nigeria-tribal-marks-elder.jpg', regions: ['nigeria', 'west', 'ila'], photo: '1657356217561-6ed26b47e116', credit: 'OverlyOlu', context: 'ILA tribal marks, Nigerian elder' },
  { file: 'senegal-dakar-elder.jpg', regions: ['senegal', 'west', 'dakar', 'goree'], photo: '1568903421626-ca0f5d72b5b2', credit: 'Vince Gx', context: 'Woman in Gorée, Dakar, Senegal' },
  { file: 'mali-bamako-man.jpg', regions: ['mali', 'west', 'sahel'], photo: '1682687220063-4742bd7fd538', credit: 'Dotun Sangoleye', context: 'Elder, West Africa' },
  { file: 'ivory-coast-abidjan-woman.jpg', regions: ['ivory', 'cote', 'abidjan'], photo: '1661513754258-ae99fff69e02', credit: 'Oluwagbenga Fashola', context: 'African beauty portrait' },
  { file: 'cameroon-yaounde-elder.jpg', regions: ['cameroon', 'central'], photo: '1748180799911-05ff4dba03ea', credit: 'Sumeet Ahire', context: 'Elderly African man, traditional attire' },
  { file: 'drc-kinshasa-woman.jpg', regions: ['congo', 'kinshasa', 'drc'], photo: '1730768813881-ba6135d13a90', credit: 'Blake Cheek', context: 'Portrait in Africa, 2024' },
  { file: 'kenya-nairobi-elder-woman.jpg', regions: ['kenya', 'nairobi', 'kisumu'], photo: '1654027678170-2f16d4e87787', credit: 'Blake Cheek', context: 'Widow in Kisumu, Kenya' },
  { file: 'kenya-nairobi-young-woman.jpg', regions: ['kenya', 'nairobi'], photo: '1729691031378-d63d7e81bb38', credit: 'Blake Cheek', context: 'Portrait in Nairobi, Kenya' },
  { file: 'ethiopia-addis-elder-man.jpg', regions: ['ethiopia', 'addis', 'horn'], photo: '1573404907276-a970ad2a1d07', credit: 'Daniele Levis Pelusi', context: 'Ethiopia portrait' },
  { file: 'ethiopia-lalibela-priest.jpg', regions: ['ethiopia', 'lalibela'], photo: '1768590284443-abf79962bac2', credit: 'BLOG REGION', context: 'Orthodox priest near Lalibela, Ethiopia' },
  { file: 'tanzania-dar-woman.jpg', regions: ['tanzania', 'bagamoyo'], photo: '1644512174740-37fc9aba6109', credit: 'Paul Abrahams', context: 'African woman in Bagamoyo, Tanzania' },
  { file: 'somalia-mogadishu-woman.jpg', regions: ['somalia', 'mogadishu'], photo: '1729355796906-10a9809e0864', credit: 'Abdulkadir Hirabe', context: 'Mogadishu, Somalia' },
  { file: 'somalia-mogadishu-man.jpg', regions: ['somalia', 'mogadishu'], photo: '1664874322412-66e589265c15', credit: 'Ismail Salad Osman', context: 'Somalia, Horn of Africa portrait' },
  { file: 'egypt-cairo-elder.jpg', regions: ['egypt', 'cairo', 'nile'], photo: '1746102178814-9217bc7b6abe', credit: 'Unsplash', context: 'South Sudanese woman, North Africa' },
  { file: 'morocco-fez-woman.jpg', regions: ['morocco', 'fez', 'maghreb'], photo: '1681686586940-84a8227d7d1b', credit: 'Unsplash', context: 'Moroccan girl, Marrakech, Africa' },
  { file: 'tunisia-gabes-elder.jpg', regions: ['tunisia', 'maghreb'], photo: '1595024982636-aeda377cb449', credit: 'Unsplash', context: 'Old man in Gabès, Tunisia' },
  { file: 'south-africa-cape-elder.jpg', regions: ['south-africa', 'cape', 'ubuntu'], photo: '1672505155432-f25c16aef2a8', credit: 'Asher Pardey', context: 'South African man, Lesedi' },
  { file: 'south-africa-storyteller.jpg', regions: ['south-africa'], photo: '1512372923090-7b14fb496d44', credit: 'Maatla Seetelo', context: 'African storyteller portrait' },
  { file: 'zimbabwe-harare-elder.jpg', regions: ['zimbabwe', 'harare'], photo: '1646457416819-00ba490661b6', credit: 'Ben Masora', context: 'Zimbabwean woman portrait, Africa' },
  { file: 'botswana-gaborone-woman.jpg', regions: ['botswana'], photo: '1610892074942-8cef2e4d638a', credit: 'Thatselby', context: 'African portrait' },
  { file: 'namibia-windhoek-woman.jpg', regions: ['namibia', 'himba'], photo: '1606408060823-fe88d20bbdbe', credit: 'Elin Tabitha', context: 'Himba girl, Namibia, Africa' },
  { file: 'angola-luanda-man.jpg', regions: ['angola'], photo: '1642586593982-f81d4742bbf8', credit: 'Alberto Charamba', context: 'Worker portrait, Angola' },
  { file: 'madagascar-antananarivo-elder.jpg', regions: ['madagascar'], photo: '1628248285478-263df4ab243c', credit: 'Elle Leontiev', context: 'Malagasy woman, Madagascar' },
  { file: 'mauritius-port-louis-woman.jpg', regions: ['mauritius', 'island'], photo: '1635350296673-6513e79f5c8d', credit: 'Daren Inshape', context: 'Woman on beach, Mauritius' },
  { file: 'rwanda-kigali-man.jpg', regions: ['rwanda', 'kigali'], photo: '1729843823577-40db41a5e8c9', credit: 'Its Adonis', context: 'Faces of Rwanda portrait' },
  { file: 'rwanda-kigali-woman.jpg', regions: ['rwanda', 'kigali'], photo: '1729843832879-284e28d1661d', credit: 'Its Adonis', context: 'Faces of Rwanda portrait' },
  { file: 'uganda-kampala-elder.jpg', regions: ['uganda', 'kampala'], photo: '1740741704457-dcac552a6a6d', credit: 'Lisa Marie Theck', context: 'African woman portrait, Uganda' },
  { file: 'uganda-kampala-girl.jpg', regions: ['uganda', 'kampala'], photo: '1744973004101-06f758e2769e', credit: 'Lisa Marie Theck', context: 'Ugandan girl, traditional dress, Africa' },
  { file: 'liberia-monrovia-elder.jpg', regions: ['liberia', 'monrovia'], photo: '1631620570575-486ce20df339', credit: 'Bunting Kargbo', context: 'Black African girl, West Africa' },
  { file: 'sierra-leone-freetown-woman.jpg', regions: ['sierra-leone', 'freetown'], photo: '1630510590330-758f9428eb7c', credit: 'Random Institute', context: 'African dancer, West Africa' },
  { file: 'mozambique-maputo-man.jpg', regions: ['mozambique'], photo: '1709912760136-3da61d6f1361', credit: 'Sergio Martins', context: 'Mozambique portrait' },
  { file: 'zambia-lusaka-woman.jpg', regions: ['zambia'], photo: '1557335378-60e9755a3f63', credit: 'Unsplash', context: 'Zambian woman portrait, Africa' },
  { file: 'zambia-chief-elder.jpg', regions: ['zambia', 'lunda'], photo: '1632427511068-81a8a19890d7', credit: 'Sikwe Scarter', context: 'Senior Chief Musele, Zambia' },
  { file: 'pan-african-elder-man.jpg', regions: ['pan-african', 'continental'], photo: '1778405953873-413e3d5d8915', credit: 'Kyle Petzer', context: 'African elder portrait' },
  { file: 'pan-african-elder-woman.jpg', regions: ['pan-african', 'ancestral'], photo: '1664629153509-7f54425a1ff9', credit: 'Ali Drabo', context: 'Beautiful African woman portrait' },
]

function unsplashUrl(photoSlug) {
  return `https://images.unsplash.com/photo-${photoSlug}?w=900&q=85&fit=crop&crop=faces`
}

function validateAfricaContext(text) {
  if (!text || REJECT_RE.test(text)) return false
  return AFRICA_RE.test(text)
}

async function downloadOne({ file, photo, context }) {
  if (!validateAfricaContext(context)) {
    throw new Error(`${file}: failed African context validation`)
  }
  const res = await fetch(unsplashUrl(photo), {
    headers: { 'User-Agent': 'Passage/1.0 (memorial preview assets)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const normalized = await sharp(buf)
    .rotate()
    .resize(900, 1125, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
  await fs.writeFile(path.join(OUT, file), normalized)
  return normalized.length
}

async function pruneStale() {
  const keep = new Set(PORTRAITS.map((p) => p.file))
  for (const name of await fs.readdir(OUT)) {
    if (name.endsWith('.jpg') && !keep.has(name)) {
      await fs.unlink(path.join(OUT, name))
      console.log(`removed stale ${name}`)
    }
  }
}

await fs.mkdir(OUT, { recursive: true })
let ok = 0
for (const entry of PORTRAITS) {
  try {
    const bytes = await downloadOne(entry)
    ok++
    console.log(`✓ ${entry.file} (${Math.round(bytes / 1024)} KB)`)
  } catch (e) {
    console.error(`✗ ${entry.file}: ${e.message}`)
  }
}
await pruneStale()

const readme = `# Africa portrait library

Dignified **African** portraits for Passage theme previews. Passage sells to African families — every customer-facing preview must clearly represent African people.

## Sourcing policy

1. **African context required** — description must reference Africa or an African country/community (\`src/lib/portrait-policy.ts\`).
2. **Reject generic global stock** — no LinkedIn/corporate headshots or unrelated Western portrait stock.
3. **One unique photo per file** — no duplicate Unsplash IDs across regions.
4. **License** — [Unsplash License](https://unsplash.com/license).

## Regions (${PORTRAITS.length} portraits)

| File | Tags | Credit — context |
|------|------|------------------|
${PORTRAITS.map((p) => `| \`${p.file}\` | ${p.regions.join(', ')} | ${p.credit} — ${p.context} |`).join('\n')}

\`\`\`bash
npm run theme-previews:all
\`\`\`
`
await fs.writeFile(path.join(OUT, 'README.md'), readme)
console.log(`\nDone: ${ok}/${PORTRAITS.length} portraits in ${OUT}`)
