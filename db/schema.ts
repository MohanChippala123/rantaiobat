import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chainEvents = sqliteTable("chain_events", {
  id: integer("id").primaryKey({ autoIncrement: true }), txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(), blockNumber: integer("block_number").notNull(),
  eventName: text("event_name").notNull(), batchId: integer("batch_id"), transferId: integer("transfer_id"),
  payload: text("payload").notNull(), createdAt: integer("created_at").notNull(),
});
export const forkAttempts = sqliteTable("fork_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }), batchId: integer("batch_id").notNull(),
  txHash: text("tx_hash").notNull().unique(), actor: text("actor").notNull(),
  attemptedRecipient: text("attempted_recipient"), blockNumber: integer("block_number").notNull(),
  reason: text("reason").notNull(), createdAt: integer("created_at").notNull(),
});
export const indexerState = sqliteTable("indexer_state", { key: text("key").primaryKey(), value: text("value").notNull() });
