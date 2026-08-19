CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('opening','stock_adjustment') NOT NULL,
	`entityId` int NOT NULL,
	`oldValue` decimal(18,4) NOT NULL,
	`proposedValue` decimal(18,4) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`submittedBy` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reason` text,
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`beforeJson` text,
	`afterJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyStock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockDate` varchar(10) NOT NULL,
	`department` enum('production','packaging') NOT NULL,
	`itemId` int NOT NULL,
	`openingApproved` decimal(18,4) NOT NULL DEFAULT '0',
	`openingPending` decimal(18,4),
	`inQty` decimal(18,4) NOT NULL DEFAULT '0',
	`issued` decimal(18,4) NOT NULL DEFAULT '0',
	`autoIssued` decimal(18,4),
	`manualIssued` boolean NOT NULL DEFAULT false,
	`returnQty` decimal(18,4) NOT NULL DEFAULT '0',
	`damage` decimal(18,4) NOT NULL DEFAULT '0',
	`note` text,
	`createdBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyStock_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_stock_date_dept_item_idx` UNIQUE(`stockDate`,`department`,`itemId`)
);
--> statement-breakpoint
CREATE TABLE `importBatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`schemaVersion` varchar(32) NOT NULL,
	`rowCount` int NOT NULL,
	`status` enum('validated','applied','rejected') NOT NULL,
	`errorMessage` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `importBatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`itemType` enum('raw_material','packaging_material','finished_good','other') NOT NULL DEFAULT 'raw_material',
	`unit` varchar(32) NOT NULL,
	`minimumStock` decimal(18,4) NOT NULL DEFAULT '0',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `items_id` PRIMARY KEY(`id`),
	CONSTRAINT `items_name_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderDate` varchar(10) NOT NULL,
	`itemId` int NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`note` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseDate` varchar(10) NOT NULL,
	`itemId` int NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`unitCost` decimal(18,4) NOT NULL,
	`supplier` varchar(255),
	`note` text,
	`status` enum('draft','approved') NOT NULL DEFAULT 'approved',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipeLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` int NOT NULL,
	`materialItemId` int NOT NULL,
	`quantityPerBatch` decimal(18,4) NOT NULL,
	`unit` varchar(32) NOT NULL,
	CONSTRAINT `recipeLines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`effectiveFrom` varchar(10) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`note` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `recipes_item_version_idx` UNIQUE(`itemId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `saleShopLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`shopId` int NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	CONSTRAINT `saleShopLines_id` PRIMARY KEY(`id`),
	CONSTRAINT `sale_shop_idx` UNIQUE(`saleId`,`shopId`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleDate` varchar(10) NOT NULL,
	`itemId` int NOT NULL,
	`opening` decimal(18,4) NOT NULL DEFAULT '0',
	`produce` decimal(18,4) NOT NULL DEFAULT '0',
	`sell` decimal(18,4) NOT NULL DEFAULT '0',
	`note` text,
	`createdBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_date_item_idx` UNIQUE(`saleDate`,`itemId`)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`),
	CONSTRAINT `shops_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `stockAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adjustmentDate` varchar(10) NOT NULL,
	`department` enum('production','packaging') NOT NULL,
	`itemId` int NOT NULL,
	`proposedValue` decimal(18,4) NOT NULL,
	`note` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `approvals_entity_idx` ON `approvals` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `purchases_date_idx` ON `purchases` (`purchaseDate`);--> statement-breakpoint
CREATE INDEX `purchases_item_idx` ON `purchases` (`itemId`);