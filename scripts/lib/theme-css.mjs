import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STYLES_DIR = path.join(__dirname, '..', '..', 'src', 'styles')

const VAR_MAP = {
  '--passage-bg': 'bg',
  '--passage-surface': 'surface',
  '--passage-text': 'text',
  '--passage-muted': 'muted',
  '--passage-heading': 'heading',
  '--passage-accent': 'accent',
  '--passage-rule': 'rule',
  '--passage-link': 'link',
  '--passage-hero-bg': 'heroBg',
  '--passage-hero-text': 'heroText',
  '--passage-hero-muted': 'heroMuted',
  '--passage-header-bg': 'headerBg',
  '--passage-header-text': 'headerText',
  '--passage-header-link': 'headerLink',
  '--passage-kente-band': 'kenteBand',
}

/** @typedef {{ id: string, bg: string, surface: string, text: string, muted: string, heading: string, accent: string, rule: string, link: string, heroBg: string, heroText: string, heroMuted: string, headerBg: string, headerText: string, headerLink: string, kenteBand: string }} ThemeColors */

/**
 * @param {string} cssText
 * @returns {Map<string, ThemeColors>}
 */
export function parseThemeCss(cssText) {
  /** @type {Map<string, ThemeColors>} */
  const map = new Map()
  const blockRe =
    /html\[data-theme='([^']+)'\][^{]*\{([^}]+)\}/gs
  let match
  while ((match = blockRe.exec(cssText)) !== null) {
    const id = match[1]
    const body = match[2]
    /** @type {Record<string, string>} */
    const vars = { id }
    for (const [cssVar, key] of Object.entries(VAR_MAP)) {
      const re = new RegExp(`${cssVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*([^;]+);`)
      const m = body.match(re)
      if (m) vars[key] = m[1].trim()
    }
    if (vars.bg && vars.text) {
      map.set(id, /** @type {ThemeColors} */ (vars))
    }
  }
  return map
}

export async function loadAllThemeColors() {
  const files = ['themes.css', 'themes-africa-extended.css']
  /** @type {Map<string, ThemeColors>} */
  const merged = new Map()
  for (const file of files) {
    const text = await fs.readFile(path.join(STYLES_DIR, file), 'utf8')
    for (const [id, colors] of parseThemeCss(text)) {
      merged.set(id, colors)
    }
  }
  return merged
}

/**
 * @param {string} themeId
 * @returns {Promise<string[]>}
 */
export async function loadThemeIdsFromRegistry() {
  const registryPath = path.join(__dirname, '..', '..', 'src', 'lib', 'visual-themes.ts')
  const text = await fs.readFile(registryPath, 'utf8')
  const ids = []
  const re = /^\s+id:\s+'([^']+)',/gm
  let m
  while ((m = re.exec(text)) !== null) ids.push(m[1])
  return ids
}
