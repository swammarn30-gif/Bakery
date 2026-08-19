import { boolean, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  itemType: mysqlEnum("itemType", ["raw_material", "packaging_material", "finished_good", "other"]).default("raw_material").notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  minimumStock: decimal("minimumStock", { precision: 18, scale: 4 }).default("0").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => ({ nameIdx: uniqueIndex("items_name_idx").on(t.name) }));

export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  purchaseDate: varchar("purchaseDate", { length: 10 }).notNull(),
  itemId: int("itemId").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  unitCost: decimal("unitCost", { precision: 18, scale: 4 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  note: text("note"),
  status: mysqlEnum("status", ["draft", "approved"]).default("approved").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => ({ dateIdx: index("purchases_date_idx").on(t.purchaseDate), itemIdx: index("purchases_item_idx").on(t.itemId) }));

export const dailyStock = mysqlTable("dailyStock", {
  id: int("id").autoincrement().primaryKey(),
  stockDate: varchar("stockDate", { length: 10 }).notNull(),
  department: mysqlEnum("department", ["production", "packaging"]).notNull(),
  itemId: int("itemId").notNull(),
  openingApproved: decimal("openingApproved", { precision: 18, scale: 4 }).default("0").notNull(),
  openingPending: decimal("openingPending", { precision: 18, scale: 4 }),
  inQty: decimal("inQty", { precision: 18, scale: 4 }).default("0").notNull(),
  issued: decimal("issued", { precision: 18, scale: 4 }).default("0").notNull(),
  autoIssued: decimal("autoIssued", { precision: 18, scale: 4 }),
  manualIssued: boolean("manualIssued").default(false).notNull(),
  returnQty: decimal("returnQty", { precision: 18, scale: 4 }).default("0").notNull(),
  damage: decimal("damage", { precision: 18, scale: 4 }).default("0").notNull(),
  note: text("note"),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => ({ dateDeptItemIdx: uniqueIndex("daily_stock_date_dept_item_idx").on(t.stockDate, t.department, t.itemId) }));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderDate: varchar("orderDate", { length: 10 }).notNull(),
  itemId: int("itemId").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  note: text("note"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  department: mysqlEnum("department", ["production", "packaging"]).default("production").notNull(),
  version: int("version").default(1).notNull(),
  effectiveFrom: varchar("effectiveFrom", { length: 10 }).notNull(),
  active: boolean("active").default(true).notNull(),
  note: text("note"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => ({ itemVersionIdx: uniqueIndex("recipes_item_version_idx").on(t.itemId, t.department, t.version) }));

export const recipeLines = mysqlTable("recipeLines", {
  id: int("id").autoincrement().primaryKey(),
  recipeId: int("recipeId").notNull(),
  materialItemId: int("materialItemId").notNull(),
  quantityPerBatch: decimal("quantityPerBatch", { precision: 18, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
});

export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  saleDate: varchar("saleDate", { length: 10 }).notNull(),
  itemId: int("itemId").notNull(),
  opening: decimal("opening", { precision: 18, scale: 4 }).default("0").notNull(),
  produce: decimal("produce", { precision: 18, scale: 4 }).default("0").notNull(),
  sell: decimal("sell", { precision: 18, scale: 4 }).default("0").notNull(),
  note: text("note"),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => ({ dateItemIdx: uniqueIndex("sales_date_item_idx").on(t.saleDate, t.itemId) }));

export const shops = mysqlTable("shops", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  active: boolean("active").default(true).notNull(),
});

export const saleShopLines = mysqlTable("saleShopLines", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  shopId: int("shopId").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
}, t => ({ saleShopIdx: uniqueIndex("sale_shop_idx").on(t.saleId, t.shopId) }));

export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["opening", "stock_adjustment"]).notNull(),
  entityId: int("entityId").notNull(),
  oldValue: decimal("oldValue", { precision: 18, scale: 4 }).notNull(),
  proposedValue: decimal("proposedValue", { precision: 18, scale: 4 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  submittedBy: int("submittedBy").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reason: text("reason"),
}, t => ({ entityIdx: index("approvals_entity_idx").on(t.entityType, t.entityId) }));

export const stockAdjustments = mysqlTable("stockAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  adjustmentDate: varchar("adjustmentDate", { length: 10 }).notNull(),
  department: mysqlEnum("department", ["production", "packaging"]).notNull(),
  itemId: int("itemId").notNull(),
  proposedValue: decimal("proposedValue", { precision: 18, scale: 4 }).notNull(),
  note: text("note"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const importBatches = mysqlTable("importBatches", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  schemaVersion: varchar("schemaVersion", { length: 32 }).notNull(),
  rowCount: int("rowCount").notNull(),
  status: mysqlEnum("status", ["validated", "applied", "rejected"]).notNull(),
  errorMessage: text("errorMessage"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  beforeJson: text("beforeJson"),
  afterJson: text("afterJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Item = typeof items.$inferSelect;
export type DailyStock = typeof dailyStock.$inferSelect;
export type Sale = typeof sales.$inferSelect;
