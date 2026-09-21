CREATE TABLE `chain_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tx_hash` text NOT NULL,
	`log_index` integer NOT NULL,
	`block_number` integer NOT NULL,
	`event_name` text NOT NULL,
	`batch_id` integer,
	`transfer_id` integer,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fork_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_id` integer NOT NULL,
	`tx_hash` text NOT NULL,
	`actor` text NOT NULL,
	`attempted_recipient` text,
	`block_number` integer NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fork_attempts_tx_hash_unique` ON `fork_attempts` (`tx_hash`);--> statement-breakpoint
CREATE TABLE `indexer_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
