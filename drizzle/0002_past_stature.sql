CREATE TABLE `user_file` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`r2_key` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`category` text,
	`is_public` integer,
	`description` text,
	`uploaded_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `session` ADD `timezone` text;--> statement-breakpoint
ALTER TABLE `session` ADD `city` text;--> statement-breakpoint
ALTER TABLE `session` ADD `country` text;--> statement-breakpoint
ALTER TABLE `session` ADD `region` text;--> statement-breakpoint
ALTER TABLE `session` ADD `region_code` text;--> statement-breakpoint
ALTER TABLE `session` ADD `colo` text;--> statement-breakpoint
ALTER TABLE `session` ADD `latitude` text;--> statement-breakpoint
ALTER TABLE `session` ADD `longitude` text;