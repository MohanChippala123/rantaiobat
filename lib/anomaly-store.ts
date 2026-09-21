import { neon } from "@neondatabase/serverless";

export type ForkAttempt = {
  id: number;
  batchId: number;
  txHash: string;
  actor: string;
  attemptedRecipient: string | null;
  blockNumber: number;
  reason: string;
  createdAt: number;
};

function databaseUrl() {
  const value = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!value) throw new Error("Persistent anomaly storage is not configured");
  return value;
}

async function db() {
  const sql = neon(databaseUrl());
  await sql`
    CREATE TABLE IF NOT EXISTS fork_attempts (
      id BIGSERIAL PRIMARY KEY,
      batch_id BIGINT NOT NULL,
      tx_hash TEXT NOT NULL UNIQUE,
      actor TEXT NOT NULL,
      attempted_recipient TEXT,
      block_number BIGINT NOT NULL,
      reason TEXT NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS fork_attempts_batch_id_idx ON fork_attempts (batch_id)`;
  return sql;
}

function mapAttempt(row: Record<string, unknown>): ForkAttempt {
  return {
    id: Number(row.id),
    batchId: Number(row.batch_id),
    txHash: String(row.tx_hash),
    actor: String(row.actor),
    attemptedRecipient: row.attempted_recipient ? String(row.attempted_recipient) : null,
    blockNumber: Number(row.block_number),
    reason: String(row.reason),
    createdAt: Number(row.created_at),
  };
}

export async function listForkAttempts(batchId: number) {
  const sql = await db();
  const rows = await sql`
    SELECT id, batch_id, tx_hash, actor, attempted_recipient, block_number, reason, created_at
    FROM fork_attempts
    WHERE batch_id = ${batchId}
    ORDER BY created_at ASC
  `;
  return rows.map((row) => mapAttempt(row));
}

export async function recordForkAttempt(input: Omit<ForkAttempt, "id">) {
  const sql = await db();
  const rows = await sql`
    INSERT INTO fork_attempts
      (batch_id, tx_hash, actor, attempted_recipient, block_number, reason, created_at)
    VALUES
      (${input.batchId}, ${input.txHash}, ${input.actor}, ${input.attemptedRecipient}, ${input.blockNumber}, ${input.reason}, ${input.createdAt})
    ON CONFLICT (tx_hash) DO UPDATE SET tx_hash = EXCLUDED.tx_hash
    RETURNING id, batch_id, tx_hash, actor, attempted_recipient, block_number, reason, created_at
  `;
  return mapAttempt(rows[0]);
}
