CREATE TYPE "user_role" AS ENUM ('user', 'admin');
CREATE TYPE "item_type" AS ENUM ('raw_material', 'packaging_material', 'finished_good', 'other');
CREATE TYPE "purchase_status" AS ENUM ('draft', 'approved');
CREATE TYPE "department" AS ENUM ('production', 'packaging');
CREATE TYPE "approval_entity_type" AS ENUM ('opening', 'stock_adjustment');
CREATE TYPE "approval_status" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "import_status" AS ENUM ('validated', 'applied', 'rejected');

CREATE TABLE "users" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "openId" varchar(64) NOT NULL UNIQUE,
  "name" text,
  "email" varchar(320),
  "loginMethod" varchar(64),
  "role" "user_role" DEFAULT 'user' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "lastSignedIn" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "items" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "itemType" "item_type" DEFAULT 'raw_material' NOT NULL,
  "unit" varchar(32) NOT NULL,
  "minimumStock" numeric(18,4) DEFAULT '0' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "items_name_idx" UNIQUE ("name")
);

CREATE TABLE "purchases" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "purchaseDate" varchar(10) NOT NULL,
  "itemId" integer NOT NULL,
  "quantity" numeric(18,4) NOT NULL,
  "unit" varchar(32) NOT NULL,
  "purchaseUnit" varchar(16) DEFAULT 'g' NOT NULL,
  "totalValue" numeric(18,4) DEFAULT '0' NOT NULL,
  "unitCost" numeric(18,4) NOT NULL,
  "supplier" varchar(255),
  "note" text,
  "status" "purchase_status" DEFAULT 'approved' NOT NULL,
  "createdBy" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "purchases_date_idx" ON "purchases" ("purchaseDate");
CREATE INDEX "purchases_item_idx" ON "purchases" ("itemId");

CREATE TABLE "dailyStock" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "stockDate" varchar(10) NOT NULL,
  "department" "department" NOT NULL,
  "itemId" integer NOT NULL,
  "openingApproved" numeric(18,4) DEFAULT '0' NOT NULL,
  "openingPending" numeric(18,4),
  "inQty" numeric(18,4) DEFAULT '0' NOT NULL,
  "issued" numeric(18,4) DEFAULT '0' NOT NULL,
  "autoIssued" numeric(18,4),
  "manualIssued" boolean DEFAULT false NOT NULL,
  "returnQty" numeric(18,4) DEFAULT '0' NOT NULL,
  "damage" numeric(18,4) DEFAULT '0' NOT NULL,
  "note" text,
  "createdBy" integer NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "daily_stock_date_dept_item_idx" UNIQUE ("stockDate", "department", "itemId")
);

CREATE TABLE "orders" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "orderDate" varchar(10) NOT NULL,
  "itemId" integer NOT NULL,
  "quantity" numeric(18,4) NOT NULL,
  "note" text,
  "createdBy" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "recipes" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "itemId" integer NOT NULL,
  "department" "department" DEFAULT 'production' NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "effectiveFrom" varchar(10) NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "note" text,
  "createdBy" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "recipes_item_version_idx" UNIQUE ("itemId", "department", "version")
);

CREATE TABLE "recipeLines" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "recipeId" integer NOT NULL,
  "materialItemId" integer NOT NULL,
  "quantityPerBatch" numeric(18,4) NOT NULL,
  "unit" varchar(32) NOT NULL
);

CREATE TABLE "sales" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "saleDate" varchar(10) NOT NULL,
  "itemId" integer NOT NULL,
  "opening" numeric(18,4) DEFAULT '0' NOT NULL,
  "produce" numeric(18,4) DEFAULT '0' NOT NULL,
  "sell" numeric(18,4) DEFAULT '0' NOT NULL,
  "note" text,
  "createdBy" integer NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "sales_date_item_idx" UNIQUE ("saleDate", "itemId")
);

CREATE TABLE "shops" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(255) NOT NULL UNIQUE,
  "active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "saleShopLines" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "saleId" integer NOT NULL,
  "shopId" integer NOT NULL,
  "quantity" numeric(18,4) NOT NULL,
  CONSTRAINT "sale_shop_idx" UNIQUE ("saleId", "shopId")
);

CREATE TABLE "approvals" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "entityType" "approval_entity_type" NOT NULL,
  "entityId" integer NOT NULL,
  "oldValue" numeric(18,4) NOT NULL,
  "proposedValue" numeric(18,4) NOT NULL,
  "status" "approval_status" DEFAULT 'pending' NOT NULL,
  "submittedBy" integer NOT NULL,
  "submittedAt" timestamp DEFAULT now() NOT NULL,
  "reviewedBy" integer,
  "reviewedAt" timestamp,
  "reason" text
);
CREATE INDEX "approvals_entity_idx" ON "approvals" ("entityType", "entityId");

CREATE TABLE "stockAdjustments" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "adjustmentDate" varchar(10) NOT NULL,
  "department" "department" NOT NULL,
  "itemId" integer NOT NULL,
  "proposedValue" numeric(18,4) NOT NULL,
  "note" text,
  "createdBy" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "importBatches" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "filename" varchar(255) NOT NULL,
  "schemaVersion" varchar(32) NOT NULL,
  "rowCount" integer NOT NULL,
  "status" "import_status" NOT NULL,
  "errorMessage" text,
  "createdBy" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "auditLog" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "actorId" integer NOT NULL,
  "action" varchar(100) NOT NULL,
  "entityType" varchar(100) NOT NULL,
  "entityId" integer,
  "beforeJson" text,
  "afterJson" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
