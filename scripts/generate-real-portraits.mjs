/**
 * Builds portrait JPEGs under public/photos/real/ from africa/ + seed/ only.
 * Run: node scripts/generate-real-portraits.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'photos', 'real')
const AFRICA = path.join(ROOT, 'public', 'photos', 'africa')
const SEED = path.join(ROOT, 'public', 'seed')

function gradePortrait(pipeline, opts = {}) {
  const warmth = opts.warmth ?? 1
  let img = pipeline.resize(900, 1125, { fit: 'cover', position: 'attention' })
  if (warmth > 1) img = img.modulate({ brightness: 1.02, saturation: 1.08 })
  else if (warmth < 1) img = img.modulate({ brightness: 0.98, saturation: 0.92 }).tint({ r: 220, g: 230, b: 245 })
  if (opts.vignette) {
    const svg = `<svg width="900" height="1125"><defs><radialGradient id="v" cx="50%" cy="42%" r="58%"><stop offset="55%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="black" stop-opacity="0.35"/></radialGradient></defs><rect width="900" height="1125" fill="url(#v)"/></svg>`
    return img.composite([{ input: Buffer.from(svg), blend: 'multiply' }])
  }
  return img.sharpen({ sigma: 0.6 }).jpeg({ quality: 88, mozjpeg: true })
}

async function cropFraction(inputPath, frac) {
  const meta = await sharp(inputPath).metadata()
  const w = meta.width ?? 900
  const h = meta.height ?? 1125
  return sharp(inputPath).extract({
    left: Math.round(w * frac.left),
    top: Math.round(h * frac.top),
    width: Math.round(w * frac.width),
    height: Math.round(h * frac.height),
  })
}

async function seedVariation(seedFile, outName, crop) {
  const input = path.join(SEED, seedFile)
  const meta = await sharp(input).metadata()
  const w = meta.width ?? 1200
  const h = meta.height ?? 1500
  const pipeline = sharp(input).extract({
    left: Math.round(w * crop.left),
    top: Math.round(h * crop.top),
    width: Math.round(w * crop.width),
    height: Math.round(h * crop.height),
  })
  await fs.writeFile(path.join(OUT, outName), await gradePortrait(pipeline, { warmth: crop.warmth ?? 1.05, vignette: true }))
}

const AFRICA_CROPS = [
  { file: 'portrait-woman-programme.jpg', source: 'kenya-nairobi-elder-woman.jpg', frac: { left: 0.12, top: 0.05, width: 0.76, height: 0.55 } },
  { file: 'portrait-man-kente.jpg', source: 'ghana-accra-elder-man.jpg', frac: { left: 0.08, top: 0.02, width: 0.84, height: 0.58 } },
  { file: 'portrait-woman-night.jpg', source: 'senegal-dakar-elder.jpg', frac: { left: 0.18, top: 0.06, width: 0.64, height: 0.52 } },
  { file: 'portrait-man-monument.jpg', source: 'south-africa-cape-elder.jpg', frac: { left: 0.15, top: 0.08, width: 0.7, height: 0.5 } },
]

await fs.mkdir(OUT, { recursive: true })

for (const item of AFRICA_CROPS) {
  const buf = await gradePortrait(await cropFraction(path.join(AFRICA, item.source), item.frac), { warmth: 1.05, vignette: true })
  await fs.writeFile(path.join(OUT, item.file), buf)
  console.log(`wrote ${item.file} (africa/${item.source})`)
}

for (const job of [
  { seed: 'bannerman-primary.jpg', out: 'portrait-man-warm-1.jpg', crop: { left: 0.15, top: 0.05, width: 0.7, height: 0.55, warmth: 1.12 } },
  { seed: 'bannerman-primary.jpg', out: 'portrait-man-warm-2.jpg', crop: { left: 0.25, top: 0.12, width: 0.5, height: 0.45, warmth: 1.08 } },
  { seed: 'bannerman-3.jpg', out: 'portrait-man-green.jpg', crop: { left: 0.1, top: 0.08, width: 0.8, height: 0.5, warmth: 0.95 } },
  { seed: 'muslim-primary.jpg', out: 'portrait-woman-soft-1.jpg', crop: { left: 0.18, top: 0.06, width: 0.64, height: 0.52, warmth: 1.06 } },
  { seed: 'muslim-primary.jpg', out: 'portrait-woman-soft-2.jpg', crop: { left: 0.3, top: 0.1, width: 0.4, height: 0.42, warmth: 1.02 } },
  { seed: 'muslim-3.jpg', out: 'portrait-woman-green.jpg', crop: { left: 0.12, top: 0.1, width: 0.76, height: 0.48, warmth: 0.98 } },
]) {
  await seedVariation(job.seed, job.out, job.crop)
  console.log(`wrote ${job.out} (seed/${job.seed})`)
}

console.log(`\n${(await fs.readdir(OUT)).length} portraits in public/photos/real/`)
