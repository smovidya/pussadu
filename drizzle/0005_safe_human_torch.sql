PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_asset_to_project` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`project_id` text NOT NULL,
	`borrower_id` text NOT NULL,
	`amount` integer DEFAULT 1 NOT NULL,
	`note` text,
	`status` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`admin_note` text DEFAULT '',
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`borrower_id`) REFERENCES `borrower`(`ouid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_asset_to_project`("id", "asset_id", "project_id", "borrower_id", "amount", "note", "status", "start_date", "end_date", "admin_note", "created_at", "updated_at", "deleted_at") SELECT "id", "asset_id", "project_id", "borrower_id", "amount", "note", "status", "start_date", "end_date", "admin_note", "created_at", "updated_at", "deleted_at" FROM `asset_to_project`;--> statement-breakpoint
DROP TABLE `asset_to_project`;--> statement-breakpoint
ALTER TABLE `__new_asset_to_project` RENAME TO `asset_to_project`;--> statement-breakpoint
PRAGMA foreign_keys=ON;