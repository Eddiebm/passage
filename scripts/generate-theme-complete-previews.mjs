/**
 * Generates /public/theme-previews/{themeId}.jpg — design-lab thumbnails (400×711).
 * Run after download-africa-photos.mjs: npm run theme-previews
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
const OUT_DIR = path.join(ROOT, 'public', 'theme-previews')
const SHOWCASE_OUT = path.join(ROOT, 'public', 'showcase')
const THEMES_FILE = path.join(ROOT, 'src', 'lib', 'visual-themes.ts')

const W = 400
const H = 711

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
      jpegQuality: 86,
    })
    await fs.writeFile(path.join(OUT_DIR, `${id}.jpg`), buffer)
    if (FLAGSHIP_THEMES.includes(id)) {
      await fs.writeFile(path.join(SHOWCASE_OUT, `complete-${id}.jpg`), buffer)
    }
    ok++
    if (ok % 20 === 0) console.log(`… ${ok} previews`)
  } catch (e) {
    console.error(`✗ ${id}: ${e.message}`)
  }
}

console.log(`Generated ${ok}/${themes.length} previews → ${OUT_DIR}`)
