/**
 * Generates /public/showcase/complete-{themeId}.png — landscape 1536×1024 screenshots.
 * Matches the format of the four existing flagship showcase PNGs.
 *
 * Prerequisites: dev server running on localhost:3000 (npm run dev)
 *
 * Usage:
 *   node scripts/generate-showcase-screenshots.mjs
 *   node scripts/generate-showcase-screenshots.mjs adinkra-minimal earth-clay ivory-letter
 *
 * Pass specific theme IDs as arguments, or omit to run all SHOWCASE_THEMES below.
 */

import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'showcase')

// The memorial page used for screenshots — seeded with real data and photos.
const BASE_URL = 'http://localhost:3002'
const MEMORIAL_SLUG = 'samuel-mensah-2026'
const MEMORIAL_MODE = 'programme'

// Themes to generate — extend this list to add more to the showcase page.
const SHOWCASE_THEMES = [
  'adinkra-minimal',   // Ghana · Off-white, ink-black, single gold rule
  'earth-clay',        // West Africa · Terracotta and ochre
  'ivory-letter',      // Warm ivory stock, soft brown ink
  'burgundy-mass',     // Rich wine ground, solemn cathedral tone
  'candlelight',       // Warm dim brown-black, honey highlights
  'newspaper',         // Newsprint grey, tight columns, obituary feel
]

// Viewport: 1536×1024 matches existing flagship showcase PNGs exactly.
const VIEWPORT = { width: 1536, height: 1024 }

// Milliseconds to wait after page load for fonts, images, and animations to settle.
const SETTLE_MS = 2000

async function screenshotTheme(page, themeId) {
  const url = `${BASE_URL}/memorial/${MEMORIAL_SLUG}?visual_theme=${themeId}&memorial_mode=${MEMORIAL_MODE}`
  console.log(`  → ${themeId}`)

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('load')
  await page.waitForTimeout(SETTLE_MS)

  // Hide the edit toolbar if present — we want the clean memorial only.
  await page.evaluate(() => {
    document.querySelectorAll('[data-toolbar], [role="toolbar"]').forEach((el) => {
      el.style.display = 'none'
    })
  })

  const outPath = path.join(OUT_DIR, `complete-${themeId}.png`)
  await page.screenshot({ path: outPath, fullPage: false })
  console.log(`  ✓ saved ${path.relative(ROOT, outPath)}`)
}

async function main() {
  const targets = process.argv.slice(2).length
    ? process.argv.slice(2)
    : SHOWCASE_THEMES

  await fs.mkdir(OUT_DIR, { recursive: true })

  console.log(`Launching browser — ${targets.length} theme(s) to screenshot`)
  console.log(`Viewport: ${VIEWPORT.width}×${VIEWPORT.height}`)
  console.log(`Memorial: ${BASE_URL}/memorial/${MEMORIAL_SLUG}\n`)

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize(VIEWPORT)

  let ok = 0
  let failed = 0

  for (const themeId of targets) {
    try {
      await screenshotTheme(page, themeId)
      ok++
    } catch (err) {
      console.error(`  ✗ ${themeId}: ${err.message}`)
      failed++
    }
  }

  await browser.close()

  console.log(`\nDone — ${ok} screenshots saved to public/showcase/`)
  if (failed > 0) console.warn(`${failed} failed — check theme IDs and dev server`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
