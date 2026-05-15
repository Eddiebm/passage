export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildMemorialSlug(name: string, dateOfPassingIso: string): string {
  const year = dateOfPassingIso.slice(0, 4) || new Date().getFullYear().toString()
  const base = slugify(name)
  const suffix = `${year}`
  if (!base) return `memorial-${suffix}`
  return `${base}-${suffix}`
}
