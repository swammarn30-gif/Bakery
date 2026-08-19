ALTER TABLE `purchases` ADD `purchaseUnit` varchar(16) DEFAULT 'g' NOT NULL;--> statement-breakpoint
ALTER TABLE `purchases` ADD `totalValue` decimal(18,4) DEFAULT '0' NOT NULL;