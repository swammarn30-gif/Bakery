import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { approvals, dailyStock, items, purchases, saleShopLines, sales, shops, getDb, listDailyStock, listItems, listPendingApprovals, listPurchases, listSales, listShops, writeAudit } from "./db";
import { orders, recipes, recipeLines, stockAdjustments } from "../drizzle/schema";
import { z } from "zod";
import { calculateClosing, calculateUsed, normalizeDateRange, sumShopQuantities, weightedAverageCost } from "../shared/calculations";

const dateRange = z.object({ from: z.string(), to: z.string() }).transform(v => normalizeDateRange(v.from, v.to));
const numeric = z.coerce.number().finite();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const options = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...options, maxAge: -1 }); return { success: true } as const; }),
  }),
  backup: router({
    export: protectedProcedure.query(async () => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [itemRows, purchaseRows, stockRows, orderRows, saleRows, shopRows, recipeRows, adjustmentRows] = await Promise.all([db.select().from(items), db.select().from(purchases), db.select().from(dailyStock), db.select().from(orders), db.select().from(sales), db.select().from(shops), db.select().from(recipes), db.select().from(stockAdjustments)]); return { schemaVersion: 1, exportedAt: new Date().toISOString(), items: itemRows, purchases: purchaseRows, dailyStock: stockRows, orders: orderRows, sales: saleRows, shops: shopRows, recipes: recipeRows, stockAdjustments: adjustmentRows }; }),
  }),
  costing: router({
    average: protectedProcedure.input(z.object({ itemId: z.number().int(), month: z.string().regex(/^\\d{4}-\\d{2}$/), carriedCost: numeric.nonnegative().default(0) })).query(async ({ input }) => { const db = await getDb(); if (!db) return { averageCost: input.carriedCost, purchaseQuantity: 0, purchaseValue: 0 }; const from = `${input.month}-01`; const to = `${input.month}-31`; const rows = await db.select().from(purchases).where(and(eq(purchases.itemId, input.itemId), gte(purchases.purchaseDate, from), lte(purchases.purchaseDate, to))); const averageCost = weightedAverageCost(rows.map(row => ({ quantity: Number(row.quantity), unitCost: Number(row.unitCost) })), input.carriedCost); return { averageCost, purchaseQuantity: rows.reduce((sum, row) => sum + Number(row.quantity), 0), purchaseValue: rows.reduce((sum, row) => sum + Number(row.quantity) * Number(row.unitCost), 0) }; }),
  }),
  dashboard: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { items: 0, pendingApprovals: 0, purchases: 0, sales: 0 };
    const [itemRows, approvalRows, purchaseRows, saleRows] = await Promise.all([db.select({ count: sql<number>`count(*)` }).from(items), db.select({ count: sql<number>`count(*)` }).from(approvals).where(eq(approvals.status, "pending")), db.select({ count: sql<number>`count(*)` }).from(purchases), db.select({ count: sql<number>`count(*)` }).from(sales)]);
    return { items: Number(itemRows[0]?.count ?? 0), pendingApprovals: Number(approvalRows[0]?.count ?? 0), purchases: Number(purchaseRows[0]?.count ?? 0), sales: Number(saleRows[0]?.count ?? 0) };
  }),
  reports: router({
    itemHistory: protectedProcedure.input(z.object({ itemId: z.number().int(), from: z.string(), to: z.string() }).transform(v => ({ ...v, ...normalizeDateRange(v.from, v.to) }))).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { averageCost: 0, events: [], totals: { quantity: 0, value: 0 } };
      const [purchaseRows, stockRows, saleRows] = await Promise.all([
        db.select().from(purchases).where(and(eq(purchases.itemId, input.itemId), gte(purchases.purchaseDate, input.from), lte(purchases.purchaseDate, input.to))),
        db.select().from(dailyStock).where(and(eq(dailyStock.itemId, input.itemId), gte(dailyStock.stockDate, input.from), lte(dailyStock.stockDate, input.to))),
        db.select().from(sales).where(and(eq(sales.itemId, input.itemId), gte(sales.saleDate, input.from), lte(sales.saleDate, input.to))),
      ]);
      const averageCost = weightedAverageCost(purchaseRows.map(row => ({ quantity: Number(row.quantity), unitCost: Number(row.unitCost) })), 0);
      const events = [
        ...purchaseRows.map(row => ({ date: row.purchaseDate, type: "Purchase", quantity: Number(row.quantity), value: Number(row.quantity) * Number(row.unitCost) })),
        ...stockRows.map(row => ({ date: row.stockDate, type: `${row.department} Closing`, quantity: Number(row.openingApproved) + Number(row.inQty) + Number(row.returnQty) - Number(row.issued), value: (Number(row.openingApproved) + Number(row.inQty) + Number(row.returnQty) - Number(row.issued)) * averageCost })),
        ...saleRows.map(row => ({ date: row.saleDate, type: "Sale", quantity: -Number(row.sell), value: -Number(row.sell) * averageCost })),
      ].sort((a, b) => a.date.localeCompare(b.date));
      return { averageCost, events, totals: { quantity: events.reduce((sum, event) => sum + event.quantity, 0), value: events.reduce((sum, event) => sum + event.value, 0) } };
    }),
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
    list: protectedProcedure.input(z.object({ department: z.enum(["production", "packaging"]), from: z.string(), to: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await listDailyStock(input.department, input.from, input.to);
      const [orderRows, recipeRows, lineRows] = await Promise.all([
        db.select().from(orders).where(and(gte(orders.orderDate, input.from), lte(orders.orderDate, input.to))),
        db.select().from(recipes).where(eq(recipes.active, true)),
        db.select().from(recipeLines),
      ]);
      return rows.map(row => {
        const dailyOrders = orderRows.filter(order => order.orderDate === row.stockDate);
        const autoIssued = dailyOrders.reduce((sum, order) => {
          const recipe = recipeRows.filter(recipe => recipe.itemId === order.itemId && recipe.effectiveFrom <= row.stockDate).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
          const line = recipe ? lineRows.find(line => line.recipeId === recipe.id && line.materialItemId === row.itemId) : undefined;
          return sum + (line ? Number(order.quantity) * Number(line.quantityPerBatch) : 0);
        }, 0);
        return { ...row, autoIssued: String(autoIssued) };
      });
    }),
    autoIssued: protectedProcedure.input(z.object({ stockDate: z.string(), department: z.enum(["production", "packaging"]), itemId: z.number().int() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { autoIssued: 0 };
      const [orderRows, recipeRows, lineRows] = await Promise.all([
        db.select().from(orders).where(eq(orders.orderDate, input.stockDate)),
        db.select().from(recipes).where(and(eq(recipes.active, true), lte(recipes.effectiveFrom, input.stockDate))),
        db.select().from(recipeLines),
      ]);
      const total = orderRows.reduce((sum, order) => {
        const recipe = recipeRows.filter(row => row.itemId === order.itemId).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
        const line = recipe ? lineRows.find(row => row.recipeId === recipe.id && row.materialItemId === input.itemId) : undefined;
        return sum + (line ? Number(order.quantity) * Number(line.quantityPerBatch) : 0);
      }, 0);
      return { autoIssued: total };
    }),
    save: protectedProcedure.input(z.object({ id: z.number().int().optional(), stockDate: z.string(), department: z.enum(["production", "packaging"]), itemId: z.number().int(), openingApproved: numeric, inQty: numeric, issued: numeric, returnQty: numeric, damage: numeric, note: z.string().optional(), autoIssued: numeric.optional(), manualIssued: z.boolean().default(false) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const row = { stockDate: input.stockDate, department: input.department, itemId: input.itemId, openingApproved: String(input.openingApproved), inQty: String(input.inQty), issued: String(input.issued), returnQty: String(input.returnQty), damage: String(input.damage), note: input.note, autoIssued: input.autoIssued === undefined ? null : String(input.autoIssued), manualIssued: input.manualIssued, createdBy: ctx.user.id }; const existing = (await db.select().from(dailyStock).where(and(eq(dailyStock.stockDate, input.stockDate), eq(dailyStock.department, input.department), eq(dailyStock.itemId, input.itemId))).limit(1))[0]; if (existing) await db.update(dailyStock).set(row).where(eq(dailyStock.id, existing.id)); else await db.insert(dailyStock).values(row); return { used: calculateUsed({ opening: input.openingApproved, inQty: input.inQty, issued: input.issued, returnQty: input.returnQty, damage: input.damage }), closing: calculateClosing({ opening: input.openingApproved, inQty: input.inQty, issued: input.issued, returnQty: input.returnQty, damage: input.damage }) }; }),
    proposeOpening: protectedProcedure.input(z.object({ id: z.number().int(), proposedValue: numeric, reason: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = (await db.select().from(dailyStock).where(eq(dailyStock.id, input.id)).limit(1))[0]; if (!existing) throw new Error("Stock row not found"); await db.update(dailyStock).set({ openingPending: String(input.proposedValue) }).where(eq(dailyStock.id, input.id)); await db.insert(approvals).values({ entityType: "opening", entityId: input.id, oldValue: existing.openingApproved, proposedValue: String(input.proposedValue), submittedBy: ctx.user.id, reason: input.reason }); return { status: "pending" as const }; }),
  }),
  adjustments: router({
    submit: protectedProcedure.input(z.object({ adjustmentDate: z.string(), department: z.enum(["production", "packaging"]), itemId: z.number().int(), proposedValue: numeric, note: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(stockAdjustments).values({ ...input, proposedValue: String(input.proposedValue), createdBy: ctx.user.id }); const adjustmentId = Number(result[0].insertId); await db.insert(approvals).values({ entityType: "stock_adjustment", entityId: adjustmentId, oldValue: "0", proposedValue: String(input.proposedValue), submittedBy: ctx.user.id, reason: input.note }); return { id: adjustmentId, status: "pending" as const }; }),
  }),
  approvals: router({
    pending: adminProcedure.query(() => listPendingApprovals()),
    review: adminProcedure.input(z.object({ id: z.number().int(), decision: z.enum(["approved", "rejected"]), reason: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const approval = (await db.select().from(approvals).where(eq(approvals.id, input.id)).limit(1))[0]; if (!approval || approval.status !== "pending") throw new Error("Pending approval not found"); await db.update(approvals).set({ status: input.decision, reviewedBy: ctx.user.id, reviewedAt: new Date(), reason: input.reason ?? approval.reason }).where(eq(approvals.id, input.id)); if (approval.entityType === "opening") { const row = (await db.select().from(dailyStock).where(eq(dailyStock.id, approval.entityId)).limit(1))[0]; if (row) await db.update(dailyStock).set({ openingApproved: input.decision === "approved" ? approval.proposedValue : row.openingApproved, openingPending: null }).where(eq(dailyStock.id, row.id)); } if (approval.entityType === "stock_adjustment" && input.decision === "approved") { const adjustment = (await db.select().from(stockAdjustments).where(eq(stockAdjustments.id, approval.entityId)).limit(1))[0]; if (adjustment) { const row = (await db.select().from(dailyStock).where(and(eq(dailyStock.stockDate, adjustment.adjustmentDate), eq(dailyStock.department, adjustment.department), eq(dailyStock.itemId, adjustment.itemId))).limit(1))[0]; if (row) await db.update(dailyStock).set({ openingApproved: approval.proposedValue }).where(eq(dailyStock.id, row.id)); } } await writeAudit(ctx.user.id, input.decision, approval.entityType, approval.entityId, approval, { ...approval, status: input.decision }); return { success: true }; }),
  }),
  orders: router({
    list: protectedProcedure.input(dateRange).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(orders).where(and(gte(orders.orderDate, input.from), lte(orders.orderDate, input.to))).orderBy(desc(orders.orderDate)); }),
    create: protectedProcedure.input(z.object({ orderDate: z.string(), itemId: z.number().int(), quantity: numeric.positive(), note: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(orders).values({ ...input, quantity: String(input.quantity), createdBy: ctx.user.id }); return { id: Number(result[0].insertId) }; }),
  }),
  recipes: router({
    list: protectedProcedure.query(async () => { const db = await getDb(); if (!db) return []; return db.select().from(recipes).orderBy(desc(recipes.effectiveFrom)); }),
    create: protectedProcedure.input(z.object({ itemId: z.number().int(), effectiveFrom: z.string(), note: z.string().optional(), lines: z.array(z.object({ materialItemId: z.number().int(), quantityPerBatch: numeric.positive(), unit: z.string().min(1) })) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(recipes).values({ itemId: input.itemId, effectiveFrom: input.effectiveFrom, note: input.note, createdBy: ctx.user.id }); const recipeId = Number(result[0].insertId); if (input.lines.length) await db.insert(recipeLines).values(input.lines.map(line => ({ recipeId, materialItemId: line.materialItemId, quantityPerBatch: String(line.quantityPerBatch), unit: line.unit }))); return { id: recipeId }; }),
    detail: protectedProcedure.input(z.object({ id: z.number().int() })).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(recipeLines).where(eq(recipeLines.recipeId, input.id)); }),
    update: protectedProcedure.input(z.object({ id: z.number().int(), effectiveFrom: z.string(), note: z.string().optional(), lines: z.array(z.object({ materialItemId: z.number().int(), quantityPerBatch: numeric.positive(), unit: z.string().min(1) })) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(recipes).set({ effectiveFrom: input.effectiveFrom, note: input.note }).where(eq(recipes.id, input.id)); await db.delete(recipeLines).where(eq(recipeLines.recipeId, input.id)); if (input.lines.length) await db.insert(recipeLines).values(input.lines.map(line => ({ recipeId: input.id, materialItemId: line.materialItemId, quantityPerBatch: String(line.quantityPerBatch), unit: line.unit }))); return { success: true }; }),
    setActive: protectedProcedure.input(z.object({ id: z.number().int(), active: z.boolean() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const recipe = (await db.select().from(recipes).where(eq(recipes.id, input.id)).limit(1))[0]; if (!recipe) throw new Error("Recipe not found"); if (input.active) await db.update(recipes).set({ active: false }).where(eq(recipes.itemId, recipe.itemId)); await db.update(recipes).set({ active: input.active }).where(eq(recipes.id, input.id)); return { success: true }; }),
  }),
  shops: router({ list: protectedProcedure.query(() => listShops()), create: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(shops).values({ name: input.name }); return { id: Number(result[0].insertId) }; }) }),
  sales: router({
    list: protectedProcedure.input(dateRange).query(({ input }) => listSales(input.from, input.to)),
    detail: protectedProcedure.input(z.object({ saleId: z.number().int() })).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(saleShopLines).where(eq(saleShopLines.saleId, input.saleId)); }),
    save: protectedProcedure.input(z.object({ id: z.number().int().optional(), saleDate: z.string(), itemId: z.number().int(), opening: numeric, produce: numeric, shopLines: z.array(z.object({ shopId: z.number().int(), quantity: numeric.nonnegative() })), note: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const sell = sumShopQuantities(input.shopLines); const existing = input.id ? (await db.select().from(sales).where(eq(sales.id, input.id)).limit(1))[0] : (await db.select().from(sales).where(and(eq(sales.saleDate, input.saleDate), eq(sales.itemId, input.itemId))).limit(1))[0]; let saleId = input.id; if (existing) await db.update(sales).set({ opening: String(input.opening), produce: String(input.produce), sell: String(sell), note: input.note }).where(eq(sales.id, existing.id)); else { const result = await db.insert(sales).values({ saleDate: input.saleDate, itemId: input.itemId, opening: String(input.opening), produce: String(input.produce), sell: String(sell), note: input.note, createdBy: ctx.user.id }); saleId = Number(result[0].insertId); } if (saleId) { await db.delete(saleShopLines).where(eq(saleShopLines.saleId, saleId)); if (input.shopLines.length) await db.insert(saleShopLines).values(input.shopLines.map(line => ({ saleId: saleId!, shopId: line.shopId, quantity: String(line.quantity) }))); } return { sell, closing: input.opening + input.produce - sell }; }),
  }),
});

export type AppRouter = typeof appRouter;
