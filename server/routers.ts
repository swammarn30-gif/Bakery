import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { and, desc, eq, sql } from "drizzle-orm";
import { approvals, dailyStock, items, purchases, saleShopLines, sales, shops, getDb, listDailyStock, listItems, listPendingApprovals, listPurchases, listSales, listShops, writeAudit } from "./db";
import { z } from "zod";
import { calculateClosing, calculateUsed, normalizeDateRange, sumShopQuantities } from "../shared/calculations";

const dateRange = z.object({ from: z.string(), to: z.string() }).transform(v => normalizeDateRange(v.from, v.to));
const numeric = z.coerce.number().finite();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const options = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...options, maxAge: -1 }); return { success: true } as const; }),
  }),
  dashboard: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { items: 0, pendingApprovals: 0, purchases: 0, sales: 0 };
    const [itemRows, approvalRows, purchaseRows, saleRows] = await Promise.all([db.select({ count: sql<number>`count(*)` }).from(items), db.select({ count: sql<number>`count(*)` }).from(approvals).where(eq(approvals.status, "pending")), db.select({ count: sql<number>`count(*)` }).from(purchases), db.select({ count: sql<number>`count(*)` }).from(sales)]);
    return { items: Number(itemRows[0]?.count ?? 0), pendingApprovals: Number(approvalRows[0]?.count ?? 0), purchases: Number(purchaseRows[0]?.count ?? 0), sales: Number(saleRows[0]?.count ?? 0) };
  }),
  items: router({
    list: protectedProcedure.query(() => listItems()),
    create: protectedProcedure.input(z.object({ name: z.string().min(1), itemType: z.enum(["raw_material", "packaging_material", "finished_good", "other"]), unit: z.string().min(1), minimumStock: numeric.default(0) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(items).values({ ...input, minimumStock: String(input.minimumStock) }); await writeAudit(ctx.user.id, "create", "item", Number(result[0].insertId), null, input); return { id: Number(result[0].insertId) }; }),
    update: protectedProcedure.input(z.object({ id: z.number().int(), name: z.string().min(1), itemType: z.enum(["raw_material", "packaging_material", "finished_good", "other"]), unit: z.string().min(1), minimumStock: numeric, active: z.boolean() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const before = (await db.select().from(items).where(eq(items.id, input.id)).limit(1))[0]; await db.update(items).set({ name: input.name, itemType: input.itemType, unit: input.unit, minimumStock: String(input.minimumStock), active: input.active }).where(eq(items.id, input.id)); await writeAudit(ctx.user.id, "update", "item", input.id, before, input); return { success: true }; }),
  }),
  purchases: router({
    list: protectedProcedure.input(dateRange).query(({ input }) => listPurchases(input.from, input.to)),
    create: protectedProcedure.input(z.object({ purchaseDate: z.string(), itemId: z.number().int(), quantity: numeric.positive(), unit: z.string().min(1), unitCost: numeric.nonnegative(), supplier: z.string().optional(), note: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(purchases).values({ ...input, quantity: String(input.quantity), unitCost: String(input.unitCost), createdBy: ctx.user.id }); await writeAudit(ctx.user.id, "create", "purchase", Number(result[0].insertId), null, input); return { id: Number(result[0].insertId) }; }),
  }),
  stock: router({
    list: protectedProcedure.input(z.object({ department: z.enum(["production", "packaging"]), from: z.string(), to: z.string() })).query(({ input }) => listDailyStock(input.department, input.from, input.to)),
    save: protectedProcedure.input(z.object({ id: z.number().int().optional(), stockDate: z.string(), department: z.enum(["production", "packaging"]), itemId: z.number().int(), openingApproved: numeric, inQty: numeric, issued: numeric, returnQty: numeric, damage: numeric, note: z.string().optional(), autoIssued: numeric.optional(), manualIssued: z.boolean().default(false) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const row = { stockDate: input.stockDate, department: input.department, itemId: input.itemId, openingApproved: String(input.openingApproved), inQty: String(input.inQty), issued: String(input.issued), returnQty: String(input.returnQty), damage: String(input.damage), note: input.note, autoIssued: input.autoIssued === undefined ? null : String(input.autoIssued), manualIssued: input.manualIssued, createdBy: ctx.user.id }; const existing = (await db.select().from(dailyStock).where(and(eq(dailyStock.stockDate, input.stockDate), eq(dailyStock.department, input.department), eq(dailyStock.itemId, input.itemId))).limit(1))[0]; if (existing) await db.update(dailyStock).set(row).where(eq(dailyStock.id, existing.id)); else await db.insert(dailyStock).values(row); return { used: calculateUsed({ opening: input.openingApproved, inQty: input.inQty, issued: input.issued, returnQty: input.returnQty, damage: input.damage }), closing: calculateClosing({ opening: input.openingApproved, inQty: input.inQty, issued: input.issued, returnQty: input.returnQty, damage: input.damage }) }; }),
    proposeOpening: protectedProcedure.input(z.object({ id: z.number().int(), proposedValue: numeric, reason: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = (await db.select().from(dailyStock).where(eq(dailyStock.id, input.id)).limit(1))[0]; if (!existing) throw new Error("Stock row not found"); await db.update(dailyStock).set({ openingPending: String(input.proposedValue) }).where(eq(dailyStock.id, input.id)); await db.insert(approvals).values({ entityType: "opening", entityId: input.id, oldValue: existing.openingApproved, proposedValue: String(input.proposedValue), submittedBy: ctx.user.id, reason: input.reason }); return { status: "pending" as const }; }),
  }),
  approvals: router({
    pending: adminProcedure.query(() => listPendingApprovals()),
    review: adminProcedure.input(z.object({ id: z.number().int(), decision: z.enum(["approved", "rejected"]), reason: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const approval = (await db.select().from(approvals).where(eq(approvals.id, input.id)).limit(1))[0]; if (!approval || approval.status !== "pending") throw new Error("Pending approval not found"); await db.update(approvals).set({ status: input.decision, reviewedBy: ctx.user.id, reviewedAt: new Date(), reason: input.reason ?? approval.reason }).where(eq(approvals.id, input.id)); if (approval.entityType === "opening") { const row = (await db.select().from(dailyStock).where(eq(dailyStock.id, approval.entityId)).limit(1))[0]; if (row) await db.update(dailyStock).set({ openingApproved: input.decision === "approved" ? approval.proposedValue : row.openingApproved, openingPending: null }).where(eq(dailyStock.id, row.id)); } await writeAudit(ctx.user.id, input.decision, approval.entityType, approval.entityId, approval, { ...approval, status: input.decision }); return { success: true }; }),
  }),
  shops: router({ list: protectedProcedure.query(() => listShops()), create: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(shops).values({ name: input.name }); return { id: Number(result[0].insertId) }; }) }),
  sales: router({
    list: protectedProcedure.input(dateRange).query(({ input }) => listSales(input.from, input.to)),
    detail: protectedProcedure.input(z.object({ saleId: z.number().int() })).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(saleShopLines).where(eq(saleShopLines.saleId, input.saleId)); }),
    save: protectedProcedure.input(z.object({ id: z.number().int().optional(), saleDate: z.string(), itemId: z.number().int(), opening: numeric, produce: numeric, shopLines: z.array(z.object({ shopId: z.number().int(), quantity: numeric.nonnegative() })), note: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const sell = sumShopQuantities(input.shopLines); const existing = input.id ? (await db.select().from(sales).where(eq(sales.id, input.id)).limit(1))[0] : (await db.select().from(sales).where(and(eq(sales.saleDate, input.saleDate), eq(sales.itemId, input.itemId))).limit(1))[0]; let saleId = input.id; if (existing) await db.update(sales).set({ opening: String(input.opening), produce: String(input.produce), sell: String(sell), note: input.note }).where(eq(sales.id, existing.id)); else { const result = await db.insert(sales).values({ saleDate: input.saleDate, itemId: input.itemId, opening: String(input.opening), produce: String(input.produce), sell: String(sell), note: input.note, createdBy: ctx.user.id }); saleId = Number(result[0].insertId); } if (saleId) { await db.delete(saleShopLines).where(eq(saleShopLines.saleId, saleId)); if (input.shopLines.length) await db.insert(saleShopLines).values(input.shopLines.map(line => ({ saleId: saleId!, shopId: line.shopId, quantity: String(line.quantity) }))); } return { sell, closing: input.opening + input.produce - sell }; }),
  }),
});

export type AppRouter = typeof appRouter;
