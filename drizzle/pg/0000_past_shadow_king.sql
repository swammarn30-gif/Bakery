CREATE TYPE "public"."approval_entity_type" AS ENUM('opening', 'stock_adjustment');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."department" AS ENUM('production', 'packaging');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('validated', 'applied', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('raw_material', 'packaging_material', 'finished_good', 'other');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('draft', 'approved');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "approvals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entityType" "approval_entity_type" NOT NULL,
	"entityId" integer NOT NULL,
	"oldValue" numeric(18, 4) NOT NULL,
	"proposedValue" numeric(18, 4) NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"submittedBy" integer NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL,
	"reviewedBy" integer,
	"reviewedAt" timestamp,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "auditLog" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auditLog_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actorId" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"entityType" varchar(100) NOT NULL,
	"entityId" integer,
	"beforeJson" text,
	"afterJson" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dailyStock" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dailyStock_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"stockDate" varchar(10) NOT NULL,
	"department" "department" NOT NULL,
	"itemId" integer NOT NULL,
	"openingApproved" numeric(18, 4) DEFAULT '0' NOT NULL,
	"openingPending" numeric(18, 4),
	"inQty" numeric(18, 4) DEFAULT '0' NOT NULL,
	"issued" numeric(18, 4) DEFAULT '0' NOT NULL,
	"autoIssued" numeric(18, 4),
	"manualIssued" boolean DEFAULT false NOT NULL,
	"returnQty" numeric(18, 4) DEFAULT '0' NOT NULL,
	"damage" numeric(18, 4) DEFAULT '0' NOT NULL,
	"note" text,
	"createdBy" integer NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "importBatches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "importBatches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"filename" varchar(255) NOT NULL,
	"schemaVersion" varchar(32) NOT NULL,
	"rowCount" integer NOT NULL,
	"status" "import_status" NOT NULL,
	"errorMessage" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"itemType" "item_type" DEFAULT 'raw_material' NOT NULL,
	"unit" varchar(32) NOT NULL,
	"minimumStock" numeric(18, 4) DEFAULT '0' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderDate" varchar(10) NOT NULL,
	"itemId" integer NOT NULL,
	"quantity" numeric(18, 4) NOT NULL,
	"note" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"purchaseDate" varchar(10) NOT NULL,
	"itemId" integer NOT NULL,
	"quantity" numeric(18, 4) NOT NULL,
	"unit" varchar(32) NOT NULL,
	"purchaseUnit" varchar(16) DEFAULT 'g' NOT NULL,
	"totalValue" numeric(18, 4) DEFAULT '0' NOT NULL,
	"unitCost" numeric(18, 4) NOT NULL,
	"supplier" varchar(255),
	"note" text,
	"status" "purchase_status" DEFAULT 'approved' NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipeLines" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recipeLines_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"recipeId" integer NOT NULL,
	"materialItemId" integer NOT NULL,
	"quantityPerBatch" numeric(18, 4) NOT NULL,
	"unit" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recipes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"itemId" integer NOT NULL,
	"department" "department" DEFAULT 'production' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"effectiveFrom" varchar(10) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"note" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saleShopLines" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "saleShopLines_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"saleId" integer NOT NULL,
	"shopId" integer NOT NULL,
	"quantity" numeric(18, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"saleDate" varchar(10) NOT NULL,
	"itemId" integer NOT NULL,
	"opening" numeric(18, 4) DEFAULT '0' NOT NULL,
	"produce" numeric(18, 4) DEFAULT '0' NOT NULL,
	"sell" numeric(18, 4) DEFAULT '0' NOT NULL,
	"note" text,
	"createdBy" integer NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "shops_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "stockAdjustments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stockAdjustments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"adjustmentDate" varchar(10) NOT NULL,
	"department" "department" NOT NULL,
	"itemId" integer NOT NULL,
	"proposedValue" numeric(18, 4) NOT NULL,
	"note" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "approvals_entity_idx" ON "approvals" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_stock_date_dept_item_idx" ON "dailyStock" USING btree ("stockDate","department","itemId");--> statement-breakpoint
CREATE UNIQUE INDEX "items_name_idx" ON "items" USING btree ("name");--> statement-breakpoint
CREATE INDEX "purchases_date_idx" ON "purchases" USING btree ("purchaseDate");--> statement-breakpoint
CREATE INDEX "purchases_item_idx" ON "purchases" USING btree ("itemId");--> statement-breakpoint
CREATE UNIQUE INDEX "recipes_item_version_idx" ON "recipes" USING btree ("itemId","department","version");--> statement-breakpoint
CREATE UNIQUE INDEX "sale_shop_idx" ON "saleShopLines" USING btree ("saleId","shopId");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_date_item_idx" ON "sales" USING btree ("saleDate","itemId");