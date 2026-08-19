import { beforeEach, describe, expect, it, vi } from "vitest";

const state = {
  sales: [] as Array<Record<string, unknown>>,
  shopLines: [] as Array<Record<string, unknown>>,
  nextSaleId: 1,
};

vi.mock("./db", () => ({
  sales: "sales", saleShopLines: "saleShopLines", dailyStock: "dailyStock", items: "items", purchases: "purchases", approvals: "approvals", shops: "shops", orders: "orders", recipes: "recipes", recipeLines: "recipeLines", stockAdjustments: "stockAdjustments",
  getDb: vi.fn(async () => ({
    select: () => ({
      from: (table: unknown) => ({
        where: (predicate: unknown) => ({
          limit: async () => table === "sales" ? state.sales.filter(() => true) : [],
        }),
      }),
    }),
    insert: () => ({
      values: async (value: Record<string, unknown> | Array<Record<string, unknown>>) => {
        const rows = Array.isArray(value) ? value : [value];
        if (rows[0] && "saleDate" in rows[0]) { const id = state.nextSaleId++; state.sales.push({ ...rows[0], id }); return [{ insertId: id }]; }
        state.shopLines.push(...rows);
        return [{ insertId: 1 }];
      },
    }),
    update: () => ({ set: (value: Record<string, unknown>) => ({ where: async () => { const row = state.sales[0]; if (row) Object.assign(row, value); } }) }),
    delete: () => ({ where: async () => { state.shopLines = []; } }),
  })),
  listItems: vi.fn(async () => []), listPurchases: vi.fn(async () => []), listDailyStock: vi.fn(async () => []), listPendingApprovals: vi.fn(async () => []), listSales: vi.fn(async () => state.sales), listShops: vi.fn(async () => []), writeAudit: vi.fn(async () => undefined),
}));

const { appRouter } = await import("./routers");

type Context = Parameters<typeof appRouter.createCaller>[0];
const ctx = { user: { id: 1, openId: "test", email: "test@example.com", name: "Test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as Context["req"], res: {} as Context["res"] } as Context;

describe("sales.save router behavior", () => {
  beforeEach(() => { state.sales = []; state.shopLines = []; state.nextSaleId = 1; });

  it("updates one sale row when the same date and product are saved twice", async () => {
    const caller = appRouter.createCaller(ctx);
    await caller.sales.save({ saleDate: "2026-08-18", itemId: 4, opening: 100, produce: 20, shopLines: [{ shopId: 1, quantity: 5 }] });
    await caller.sales.save({ saleDate: "2026-08-18", itemId: 4, opening: 100, produce: 30, shopLines: [{ shopId: 1, quantity: 8 }] });
    expect(state.sales).toHaveLength(1);
    expect(state.sales[0]?.produce).toBe("30");
  });

  it("replaces persisted shop lines when an existing sale is saved again", async () => {
    const caller = appRouter.createCaller(ctx);
    await caller.sales.save({ saleDate: "2026-08-18", itemId: 4, opening: 100, produce: 20, shopLines: [{ shopId: 1, quantity: 5 }, { shopId: 2, quantity: 3 }] });
    await caller.sales.save({ id: 1, saleDate: "2026-08-18", itemId: 4, opening: 100, produce: 20, shopLines: [{ shopId: 2, quantity: 9 }] });
    expect(state.shopLines).toEqual([{ saleId: 1, shopId: 2, quantity: "9" }]);
  });
});

export {};
