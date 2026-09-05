CREATE TABLE `borrowing_event` (
	`id` text PRIMARY KEY NOT NULL,
	`borrowing_request_id` text NOT NULL,
	`type` text NOT NULL,
	`actor_ouid` text NOT NULL,
	`detail` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`borrowing_request_id`) REFERENCES `asset_to_project`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_movement` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`borrowing_request_id` text,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text,
	`actor_ouid` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`borrowing_request_id`) REFERENCES `asset_to_project`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `asset` ADD `catalog_state` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `asset` ADD `total_amount` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `asset` ADD `maintenance_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `asset` ADD `damaged_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `asset` ADD `lost_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `asset` ADD `needs_inventory_review` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `borrower` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `borrower` ADD `borrowing_eligibility` text DEFAULT 'eligible' NOT NULL;--> statement-breakpoint
ALTER TABLE `borrower` ADD `eligibility_reason` text;--> statement-breakpoint
ALTER TABLE `borrower` ADD `eligibility_updated_at` integer;--> statement-breakpoint
ALTER TABLE `borrower` ADD `eligibility_updated_by` text;--> statement-breakpoint
CREATE UNIQUE INDEX `borrower_user_id_unique` ON `borrower` (`user_id`);--> statement-breakpoint
ALTER TABLE `project_to_borrower` ADD `role` text DEFAULT 'member' NOT NULL;
--> statement-breakpoint
UPDATE `asset`
SET `total_amount` = `amount` + COALESCE((
	SELECT SUM(`asset_to_project`.`amount`)
	FROM `asset_to_project`
	WHERE `asset_to_project`.`asset_id` = `asset`.`id`
		AND `asset_to_project`.`status` IN ('pending', 'approved', 'inuse')
), 0),
`catalog_state` = CASE
	WHEN `status` IN ('maintenance', 'damaged', 'lost') THEN 'paused'
	ELSE 'active'
END,
`needs_inventory_review` = CASE
	WHEN `status` IN ('maintenance', 'damaged', 'lost') THEN true
	ELSE false
END;
--> statement-breakpoint
UPDATE `borrower`
SET `user_id` = (
	SELECT `user`.`id` FROM `user` WHERE `user`.`ouid` = `borrower`.`ouid`
)
WHERE EXISTS (
	SELECT 1 FROM `user` WHERE `user`.`ouid` = `borrower`.`ouid`
);
--> statement-breakpoint
UPDATE `asset`
SET `damaged_amount` = COALESCE((
	SELECT SUM(`asset_to_project`.`amount`)
	FROM `asset_to_project`
	WHERE `asset_to_project`.`asset_id` = `asset`.`id`
		AND `asset_to_project`.`status` = 'damaged'
), 0),
`lost_amount` = COALESCE((
	SELECT SUM(`asset_to_project`.`amount`)
	FROM `asset_to_project`
	WHERE `asset_to_project`.`asset_id` = `asset`.`id`
		AND `asset_to_project`.`status` = 'lost'
), 0);
--> statement-breakpoint
INSERT INTO `inventory_movement`
	(`id`, `asset_id`, `borrowing_request_id`, `type`, `amount`, `reason`, `actor_ouid`, `created_at`)
SELECT lower(hex(randomblob(16))), `asset_id`, `id`, `status`, `amount`,
	'Migrated from legacy borrowing outcome', 'migration', unixepoch()
FROM `asset_to_project`
WHERE `status` IN ('damaged', 'lost');
--> statement-breakpoint
UPDATE `asset_to_project`
SET `status` = 'returned'
WHERE `status` IN ('damaged', 'lost');
--> statement-breakpoint
CREATE TRIGGER `asset_inventory_amounts_insert`
BEFORE INSERT ON `asset`
BEGIN
	SELECT RAISE(ABORT, 'invalid-inventory-amounts')
	WHERE NEW.`total_amount` < 0
		OR NEW.`maintenance_amount` < 0
		OR NEW.`damaged_amount` < 0
		OR NEW.`lost_amount` < 0
		OR NEW.`maintenance_amount` + NEW.`damaged_amount` + NEW.`lost_amount` > NEW.`total_amount`;
END;
--> statement-breakpoint
CREATE TRIGGER `asset_inventory_amounts_update`
BEFORE UPDATE OF `total_amount`, `maintenance_amount`, `damaged_amount`, `lost_amount` ON `asset`
BEGIN
	SELECT RAISE(ABORT, 'invalid-inventory-amounts')
	WHERE NEW.`total_amount` < 0
		OR NEW.`maintenance_amount` < 0
		OR NEW.`damaged_amount` < 0
		OR NEW.`lost_amount` < 0
		OR NEW.`maintenance_amount` + NEW.`damaged_amount` + NEW.`lost_amount` > NEW.`total_amount`;
END;
--> statement-breakpoint
CREATE TRIGGER `borrowing_capacity_insert`
BEFORE INSERT ON `asset_to_project`
WHEN NEW.`status` IN ('pending', 'approved', 'inuse')
BEGIN
	SELECT RAISE(ABORT, 'insufficient-availability')
	WHERE NEW.`amount` < 1 OR NEW.`start_date` > NEW.`end_date`
		OR NEW.`amount` + COALESCE((
			SELECT SUM(CASE
				WHEN existing.`status` = 'inuse' THEN max(0, existing.`amount` - COALESCE((
					SELECT SUM(movement.`amount`)
					FROM `inventory_movement` movement
					WHERE movement.`borrowing_request_id` = existing.`id`
						AND movement.`type` IN ('returned-usable', 'damaged', 'lost')
				), 0))
				ELSE existing.`amount`
			END)
			FROM `asset_to_project` existing
			WHERE existing.`asset_id` = NEW.`asset_id`
				AND (
					existing.`status` = 'inuse'
					OR (existing.`status` IN ('pending', 'approved')
						AND existing.`start_date` <= NEW.`end_date`
						AND existing.`end_date` >= NEW.`start_date`)
				)
		), 0) > COALESCE((
			SELECT `total_amount` - `maintenance_amount` - `damaged_amount` - `lost_amount`
			FROM `asset`
			WHERE `id` = NEW.`asset_id`
				AND `catalog_state` = 'active'
				AND `needs_inventory_review` = false
		), 0);
END;
--> statement-breakpoint
CREATE TRIGGER `borrowing_capacity_update`
BEFORE UPDATE OF `asset_id`, `amount`, `start_date`, `end_date`, `status` ON `asset_to_project`
WHEN NEW.`status` IN ('pending', 'approved', 'inuse')
BEGIN
	SELECT RAISE(ABORT, 'insufficient-availability')
	WHERE NEW.`amount` < 1 OR NEW.`start_date` > NEW.`end_date`
		OR NEW.`amount` + COALESCE((
			SELECT SUM(CASE
				WHEN existing.`status` = 'inuse' THEN max(0, existing.`amount` - COALESCE((
					SELECT SUM(movement.`amount`)
					FROM `inventory_movement` movement
					WHERE movement.`borrowing_request_id` = existing.`id`
						AND movement.`type` IN ('returned-usable', 'damaged', 'lost')
				), 0))
				ELSE existing.`amount`
			END)
			FROM `asset_to_project` existing
			WHERE existing.`asset_id` = NEW.`asset_id`
				AND existing.`id` != OLD.`id`
				AND (
					existing.`status` = 'inuse'
					OR (existing.`status` IN ('pending', 'approved')
						AND existing.`start_date` <= NEW.`end_date`
						AND existing.`end_date` >= NEW.`start_date`)
				)
		), 0) > COALESCE((
			SELECT `total_amount` - `maintenance_amount` - `damaged_amount` - `lost_amount`
			FROM `asset`
			WHERE `id` = NEW.`asset_id`
				AND `catalog_state` = 'active'
				AND `needs_inventory_review` = false
		), 0);
END;
--> statement-breakpoint
CREATE TRIGGER `inventory_resolution_limit`
BEFORE INSERT ON `inventory_movement`
WHEN NEW.`borrowing_request_id` IS NOT NULL
	AND NEW.`type` IN ('returned-usable', 'damaged', 'lost')
BEGIN
	SELECT RAISE(ABORT, 'borrowing-resolution-exceeds-amount')
	WHERE NEW.`amount` < 0 OR NEW.`amount` + COALESCE((
		SELECT SUM(existing.`amount`)
		FROM `inventory_movement` existing
		WHERE existing.`borrowing_request_id` = NEW.`borrowing_request_id`
			AND existing.`type` IN ('returned-usable', 'damaged', 'lost')
	), 0) > COALESCE((
		SELECT request.`amount`
		FROM `asset_to_project` request
		WHERE request.`id` = NEW.`borrowing_request_id`
	), 0);
END;
--> statement-breakpoint
CREATE TRIGGER `project_keep_coordinator_on_delete`
BEFORE DELETE ON `project_to_borrower`
WHEN OLD.`role` = 'coordinator'
BEGIN
	SELECT RAISE(ABORT, 'project-requires-coordinator')
	WHERE (SELECT COUNT(*) FROM `project_to_borrower`
		WHERE `project_id` = OLD.`project_id` AND `role` = 'coordinator') <= 1;
END;
--> statement-breakpoint
CREATE TRIGGER `project_keep_coordinator_on_update`
BEFORE UPDATE OF `role` ON `project_to_borrower`
WHEN OLD.`role` = 'coordinator' AND NEW.`role` != 'coordinator'
BEGIN
	SELECT RAISE(ABORT, 'project-requires-coordinator')
	WHERE (SELECT COUNT(*) FROM `project_to_borrower`
		WHERE `project_id` = OLD.`project_id` AND `role` = 'coordinator') <= 1;
END;
