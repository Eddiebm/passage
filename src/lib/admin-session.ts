export const PASSAGE_ADMIN_COOKIE = 'passage_admin_session'

export function isAdminSession(
  jar: Readonly<{ get: (name: string) => { value?: string } | undefined }>,
): boolean {
  return jar.get(PASSAGE_ADMIN_COOKIE)?.value === '1'
}
