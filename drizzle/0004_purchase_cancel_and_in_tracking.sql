ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'cancelled';--> statement-breakpoint
ALTER TABLE "dailyStock" ADD COLUMN IF NOT EXISTS "purchaseInQty" decimal(18,4) NOT NULL DEFAULT '0';
