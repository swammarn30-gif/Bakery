import { boolean, decimal, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const itemTypeEnum = pgEnum("item_type", ["raw_material", "packaging_material", "finished_good", "other"]);
export const purchaseStatusEnum = pgEnum("purchase_status", ["draft", "approved"]);
export const departmentEnum = pgEnum("department", ["production", "packaging"]);
export const approvalEntityTypeEnum = pgEnum("approval_entity_type", ["opening", "stock_adjustment"]);
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);
export const importStatusEnum = pgEnum("import_status", ["validated", "applied", "rejected"]);

export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  itemType: itemTypeEnum("itemType").default("raw_material").notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  minimumStock: decimal("minimumStock", { precision: 18, scale: 4 }).default("0").notNull(),
  displayOrder: integer("displayOrder").default(100000).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, t => ({ nameIdx: uniqueIndex("items_name_idx").on(t.name) }));

export const purchases = pgTable("purchases", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  purchaseDate: varchar("purchaseDate", { length: 10 }).notNull(),
  itemId: integer("itemId").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  purchaseUnit: varchar("purchaseUnit", { length: 16 }).default("g").notNull(),
  totalValue: decimal("totalValue", { precision: 18, scale: 4 }).default("0").notNull(),
  unitCost: decimal("unitCost", { precision: 18, scale: 4 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  note: text("note"),
  status: purchaseStatusEnum("status").default("approved").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => ({ dateIdx: index("purchases_date_idx").on(t.purchaseDate), itemIdx: index("purchases_item_idx").on(t.itemId) }));

export const dailyStock = pgTable("dailyStock", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  stockDate: varchar("stockDate", { length: 10 }).notNull(),
  department: departmentEnum("department").notNull(),
  itemId: integer("itemId").notNull(),
  openingApproved: decimal("openingApproved", { precision: 18, scale: 4 }).default("0").notNull(),
  openingPending: decimal("openingPending", { precision: 18, scale: 4 }),
  inQty: decimal("inQty", { precision: 18, scale: 4 }).default("0").notNull(),
  issued: decimal("issued", { precision: 18, scale: 4 }).default("0").notNull(),
  autoIssued: decimal("autoIssued", { precision: 18, scale: 4 }),
  manualIssued: boolean("manualIssued").default(false).notNull(),
  returnQty: decimal("returnQty", { precision: 18, scale: 4 }).default("0").notNull(),
  damage: decimal("damage", { precision: 18, scale: 4 }).default("0").notNull(),
  note: text("note"),
  createdBy: integer("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, t => ({ dateDeptItemIdx: uniqueIndex("daily_stock_date_dept_item_idx").on(t.stockDate, t.department, t.itemId) }));

export const orders = pgTable("orders", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  orderDate: varchar("orderDate", { length: 10 }).notNull(),
  itemId: integer("itemId").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  note: text("note"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  itemId: integer("itemId").notNull(),
  department: departmentEnum("department").default("production").notNull(),
  version: integer("version").default(1).notNull(),
  effectiveFrom: varchar("effectiveFrom", { length: 10 }).notNull(),
  active: boolean("active").default(true).notNull(),
  note: text("note"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => ({ itemVersionIdx: uniqueIndex("recipes_item_version_idx").on(t.itemId, t.department, t.version) }));

export const recipeLines = pgTable("recipeLines", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  recipeId: integer("recipeId").notNull(),
  materialItemId: integer("materialItemId").notNull(),
  quantityPerBatch: decimal("quantityPerBatch", { precision: 18, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
});

export const sales = pgTable("sales", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  saleDate: varchar("saleDate", { length: 10 }).notNull(),
  itemId: integer("itemId").notNull(),
  opening: decimal("opening", { precision: 18, scale: 4 }).default("0").notNull(),
  produce: decimal("produce", { precision: 18, scale: 4 }).default("0").notNull(),
  sell: decimal("sell", { precision: 18, scale: 4 }).default("0").notNull(),
  note: text("note"),
  createdBy: integer("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, t => ({ dateItemIdx: uniqueIndex("sales_date_item_idx").on(t.saleDate, t.itemId) }));

export const shops = pgTable("shops", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  active: boolean("active").default(true).notNull(),
});

export const saleShopLines = pgTable("saleShopLines", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  saleId: integer("saleId").notNull(),
  shopId: integer("shopId").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
}, t => ({ saleShopIdx: uniqueIndex("sale_shop_idx").on(t.saleId, t.shopId) }));

export const approvals = pgTable("approvals", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  entityType: approvalEntityTypeEnum("entityType").notNull(),
  entityId: integer("entityId").notNull(),
  oldValue: decimal("oldValue", { precision: 18, scale: 4 }).notNull(),
  proposedValue: decimal("proposedValue", { precision: 18, scale: 4 }).notNull(),
  status: approvalStatusEnum("status").default("pending").notNull(),
  submittedBy: integer("submittedBy").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedBy: integer("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reason: text("reason"),
}, t => ({ entityIdx: index("approvals_entity_idx").on(t.entityType, t.entityId) }));

export const stockAdjustments = pgTable("stockAdjustments", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  adjustmentDate: varchar("adjustmentDate", { length: 10 }).notNull(),
  department: departmentEnum("department").notNull(),
  itemId: integer("itemId").notNull(),
  proposedValue: decimal("proposedValue", { precision: 18, scale: 4 }).notNull(),
  note: text("note"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const importBatches = pgTable("importBatches", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  schemaVersion: varchar("schemaVersion", { length: 32 }).notNull(),
  rowCount: integer("rowCount").notNull(),
  status: importStatusEnum("status").notNull(),
  errorMessage: text("errorMessage"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLog = pgTable("auditLog", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  actorId: integer("actorId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: integer("entityId"),
  beforeJson: text("beforeJson"),
  afterJson: text("afterJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Item = typeof items.$inferSelect;
export type DailyStock = typeof dailyStock.$inferSelect;
export type Sale = typeof sales.$inferSelect;
