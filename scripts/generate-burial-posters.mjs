/**
 * Generates /public/burial-posters/{themeId}.jpg — 1080×1920 portrait burial posters.
 * Optional --2x for 2160×3840 high-res (print shops).
 *
 * Prerequisites: public/photos/africa/*.jpg (npm run photos:africa)
 * Usage: npm run burial-posters
 *        npm run burial-posters -- --2x
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FLAGSHIP_THEMES,
  parseGroupForTheme,
  parseThemeIds,
  parseThemeLabels,
  renderBurialPosterJpeg,
} from './lib/render-burial-poster.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const AFRICA_DIR = path.join(ROOT, 'public', 'photos', 'africa')
const OUT_DIR = path.join(ROOT, 'public', 'burial-posters')
const SHOWCASE_OUT = path.join(ROOT, 'public', 'showcase')
const THEMES_FILE = path.join(ROOT, 'src', 'lib', 'visual-themes.ts')

const hiRes = process.argv.includes('--2x')
const W = hiRes ? 2160 : 1080
const H = hiRes ? 3840 : 1920
const quality = hiRes ? 90 : 88

const themesSrc = await fs.readFile(THEMES_FILE, 'utf8')
const themes = parseThemeIds(themesSrc)
const labelById = parseThemeLabels(themesSrc)

await fs.mkdir(OUT_DIR, { recursive: true })

let ok = 0
for (const { id } of themes) {
  const group = parseGroupForTheme(themesSrc, id)
  const label = labelById[id] ?? id
  try {
    const { buffer } = await renderBurialPosterJpeg({
      themeId: id,
      themeLabel: label,
      group,
      width: W,
      height: H,
      africaDir: AFRICA_DIR,
      jpegQuality: quality,
    })
    const outPath = path.join(OUT_DIR, `${id}.jpg`)
    await fs.writeFile(outPath, buffer)
    if (!hiRes && FLAGSHIP_THEMES.includes(id)) {
      await fs.writeFile(path.join(SHOWCASE_OUT, `complete-${id}.jpg`), buffer)
    }
    ok++
    if (ok % 10 === 0) console.log(`… ${ok}/${themes.length}`)
  } catch (e) {
    console.error(`✗ ${id}: ${e.message}`)
  }
}

console.log(`Generated ${ok}/${themes.length} burial posters (${W}×${H}) → ${OUT_DIR}`)
