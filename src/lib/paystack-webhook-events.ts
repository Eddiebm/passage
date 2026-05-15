import { getDb, hasDatabaseEnv } from '@/lib/db'

/**
 * Inserts a webhook idempotency row. Returns true if this invocation won the insert
 * (first time seeing this key). False if the key already exists (duplicate delivery).
 */
export async function tryInsertPaystackWebhookEvent(
  idempotencyKey: string,
  payload: unknown,
): Promise<boolean> {
  if (!hasDatabaseEnv()) return true
  const sql = getDb()
  const payloadJson = JSON.stringify(payload ?? null)
  const rows = (await sql`
    INSERT INTO paystack_webhook_events (idempotency_key, payload)
    VALUES (${idempotencyKey}, ${payloadJson}::jsonb)
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING idempotency_key
  `) as { idempotency_key: string }[]
  return rows.length > 0
}

export async function deletePaystackWebhookEvent(idempotencyKey: string): Promise<void> {
  if (!hasDatabaseEnv()) return
  const sql = getDb()
  await sql`DELETE FROM paystack_webhook_events WHERE idempotency_key = ${idempotencyKey}`
}
