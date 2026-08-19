ALTER TABLE `recipes` DROP INDEX `recipes_item_version_idx`;--> statement-breakpoint
ALTER TABLE `recipes` ADD `department` enum('production','packaging') DEFAULT 'production' NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_item_version_idx` UNIQUE(`itemId`,`department`,`version`);