/** Operator contact for privacy / support copy (env or generic fallback). */
export function getPassageSupportEmail(): string | null {
  const email = process.env.PASSAGE_SUPPORT_EMAIL?.trim()
  return email || null
}

export function getPassageSupportContact(): string {
  const email = getPassageSupportEmail()
  if (email) return email
  return 'Passage operator — contact your family liaison'
}
