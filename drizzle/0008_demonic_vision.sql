CREATE TABLE `notification` (
	`id` text PRIMARY KEY NOT NULL,
	`borrower_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`borrower_id`) REFERENCES `borrower`(`ouid`) ON UPDATE no action ON DELETE no action
);
