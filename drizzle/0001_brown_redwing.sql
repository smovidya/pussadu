ALTER TABLE `user` ADD `ouid` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_ouid_unique` ON `user` (`ouid`);