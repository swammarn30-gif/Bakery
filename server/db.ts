import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { approvals, auditLog, dailyStock, items, purchases, saleShopLines, sales, shops, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;
let configuredConnectionString: string | undefined;

export function configureDatabase(connectionString: string | undefined) {
  if (!connectionString || configuredConnectionString === connectionString) return;
  configuredConnectionString = connectionString;
  _client = null;
  _db = null;
}

export async function getDb() {
  const connectionString = configuredConnectionString ?? process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!_db && connectionString) {
    try {
      _client = postgres(connectionString, { prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _client = null;
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user") };
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, updatedAt: new Date() } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export function sortItemsByDisplayOrder<T extends { displayOrder: number; id: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
}

export async function listItems() { const db = await getDb(); return db ? db.select().from(items).orderBy(asc(items.displayOrder), asc(items.id)) : []; }
export async function listShops() { const db = await getDb(); return db ? db.select().from(shops).where(eq(shops.active, true)).orderBy(shops.name) : []; }
export async function listDailyStock(department: "production" | "packaging", from: string, to: string) { const db = await getDb(); return db ? db.select().from(dailyStock).where(and(eq(dailyStock.department, department), gte(dailyStock.stockDate, from), lte(dailyStock.stockDate, to))).orderBy(desc(dailyStock.stockDate)) : []; }
export async function listSales(from: string, to: string) { const db = await getDb(); return db ? db.select().from(sales).where(and(gte(sales.saleDate, from), lte(sales.saleDate, to))).orderBy(desc(sales.saleDate)) : []; }
export async function listPurchases(from: string, to: string) { const db = await getDb(); return db ? db.select().from(purchases).where(and(gte(purchases.purchaseDate, from), lte(purchases.purchaseDate, to))).orderBy(desc(purchases.purchaseDate)) : []; }
export async function listPendingApprovals() { const db = await getDb(); return db ? db.select().from(approvals).where(eq(approvals.status, "pending")).orderBy(desc(approvals.submittedAt)) : []; }

export async function writeAudit(actorId: number, action: string, entityType: string, entityId: number | null, before: unknown, after: unknown) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({ actorId, action, entityType, entityId, beforeJson: before ? JSON.stringify(before) : null, afterJson: after ? JSON.stringify(after) : null });
}

export { approvals, dailyStock, items, purchases, saleShopLines, sales, shops };
