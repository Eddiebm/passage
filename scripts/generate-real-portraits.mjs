/**
 * Builds dignified portrait JPEGs under public/photos/real/
 * — crops from flagship showcase PNGs (real photos)
 * — variations from seed primaries (crops + grading)
 * Run: node scripts/generate-real-portraits.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'photos', 'real')
const SHOWCASE = path.join(ROOT, 'public', 'showcase')
const SEED = path.join(ROOT, 'public', 'seed')

/** @type {{ file: string, extract: { left: number, top: number, width: number, height: number } | null, source: string }}[] */
const SHOWCASE_CROPS = [
  {
    file: 'portrait-woman-programme.jpg',
    source: 'complete-programme.png',
    extract: null, // computed from metadata
  },
  {
    file: 'portrait-man-kente.jpg',
    source: 'complete-kente.png',
    extract: null,
  },
  {
    file: 'portrait-woman-night.jpg',
    source: 'complete-night.png',
    extract: null,
  },
  {
    file: 'portrait-man-monument.jpg',
    source: 'complete-monument.png',
    extract: null,
  },
]

/** Relative crop boxes (fraction of image) per showcase source */
const CROP_FRACTIONS = {
  'complete-programme.png': { left: 0.22, top: 0.2, width: 0.56, height: 0.28 },
  'complete-kente.png': { left: 0.12, top: 0.1, width: 0.76, height: 0.32 },
  'complete-night.png': { left: 0.28, top: 0.08, width: 0.44, height: 0.22 },
  'complete-monument.png': { left: 0.36, top: 0.42, width: 0.28, height: 0.14 },
}

/**
 * @param {string} inputPath
 * @param {{ left: number, top: number, width: number, height: number }} frac
 */
async function cropFraction(inputPath, frac) {
  const meta = await sharp(inputPath).metadata()
  const w = meta.width ?? 800
  const h = meta.height ?? 1200
  return sharp(inputPath).extract({
    left: Math.round(w * frac.left),
    top: Math.round(h * frac.top),
    width: Math.round(w * frac.width),
    height: Math.round(h * frac.height),
  })
}

/**
 * @param {import('sharp').Sharp} pipeline
 * @param {{ warmth?: number; vignette?: boolean }} opts
 */
function gradePortrait(pipeline, opts = {}) {
  const warmth = opts.warmth ?? 1
  let img = pipeline.resize(900, 1125, { fit: 'cover', position: 'attention' })
  if (warmth > 1) {
    img = img.modulate({ brightness: 1.02, saturation: 1.08 })
  } else if (warmth < 1) {
    img = img.modulate({ brightness: 0.98, saturation: 0.92 }).tint({ r: 220, g: 230, b: 245 })
  }
  if (opts.vignette) {
    const svg = `<svg width="900" height="1125"><defs><radialGradient id="v" cx="50%" cy="42%" r="58%"><stop offset="55%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="black" stop-opacity="0.35"/></radialGradient></defs><rect width="900" height="1125" fill="url(#v)"/></svg>`
    return img.composite([{ input: Buffer.from(svg), blend: 'multiply' }])
  }
  return img.sharpen({ sigma: 0.6 }).jpeg({ quality: 88, mozjpeg: true })
}

/**
 * @param {string} seedFile
 * @param {string} outName
 * @param {{ left: number; top: number; width: number; height: number; warmth?: number }} crop
 */
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
  const buf = await gradePortrait(pipeline, { warmth: crop.warmth ?? 1.05, vignette: true })
  await fs.writeFile(path.join(OUT, outName), buf)
}

await fs.mkdir(OUT, { recursive: true })

for (const item of SHOWCASE_CROPS) {
  const frac = CROP_FRACTIONS[item.source]
  const input = path.join(SHOWCASE, item.source)
  const cropped = await cropFraction(input, frac)
  const buf = await gradePortrait(cropped, { warmth: 1.05, vignette: true })
  await fs.writeFile(path.join(OUT, item.file), buf)
  console.log(`wrote ${item.file} (from ${item.source})`)
}

const seedJobs = [
  { seed: 'bannerman-primary.jpg', out: 'portrait-man-warm-1.jpg', crop: { left: 0.15, top: 0.05, width: 0.7, height: 0.55, warmth: 1.12 } },
  { seed: 'bannerman-primary.jpg', out: 'portrait-man-warm-2.jpg', crop: { left: 0.25, top: 0.12, width: 0.5, height: 0.45, warmth: 1.08 } },
  { seed: 'bannerman-3.jpg', out: 'portrait-man-green.jpg', crop: { left: 0.1, top: 0.08, width: 0.8, height: 0.5, warmth: 0.95 } },
  { seed: 'muslim-primary.jpg', out: 'portrait-woman-soft-1.jpg', crop: { left: 0.18, top: 0.06, width: 0.64, height: 0.52, warmth: 1.06 } },
  { seed: 'muslim-primary.jpg', out: 'portrait-woman-soft-2.jpg', crop: { left: 0.3, top: 0.1, width: 0.4, height: 0.42, warmth: 1.02 } },
  { seed: 'muslim-3.jpg', out: 'portrait-woman-green.jpg', crop: { left: 0.12, top: 0.1, width: 0.76, height: 0.48, warmth: 0.98 } },
]

for (const job of seedJobs) {
  await seedVariation(job.seed, job.out, job.crop)
  console.log(`wrote ${job.out} (from seed/${job.seed})`)
}

const files = await fs.readdir(OUT)
console.log(`\n${files.length} portraits in public/photos/real/`)
