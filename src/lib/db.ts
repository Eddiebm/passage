import { neon } from '@neondatabase/serverless'

/** Vercel Neon typically injects `DATABASE_URL`; `POSTGRES_URL` is an alternate name. */
export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ''
  )
}

export function hasDatabaseEnv(): boolean {
  return Boolean(getDatabaseUrl())
}

let sqlSingleton: ReturnType<typeof neon> | null = null

/**
 * Neon serverless SQL tagged-template client (Node serverless / App Router).
 * Throws if neither `DATABASE_URL` nor `POSTGRES_URL` is set.
 */
export function getDb(): ReturnType<typeof neon> {
  const url = getDatabaseUrl()
  if (!url) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not configured')
  }
  if (!sqlSingleton) {
    sqlSingleton = neon(url)
  }
  return sqlSingleton
}
