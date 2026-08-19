import { beforeEach, describe, expect, it, vi } from "vitest";

const state = {
  orders: [] as Array<Record<string, unknown>>,
  recipes: [] as Array<Record<string, unknown>>,
  recipeLines: [] as Array<Record<string, unknown>>,
};

vi.mock("../drizzle/schema", () => ({ orders: "orders", recipes: "recipes", recipeLines: "recipeLines", stockAdjustments: "stockAdjustments", importBatches: "importBatches", approvals: "approvals" }));

vi.mock("./db", () => ({
  items: "items",
  dailyStock: "dailyStock",
  orders: "orders",
  recipes: "recipes",
  recipeLines: "recipeLines",
  getDb: vi.fn(async () => ({
    select: () => ({
        from: (table: unknown) => {
          const rows = table === "orders" ? state.orders : table === "recipes" ? state.recipes : table === "recipeLines" ? state.recipeLines : [];
          return Object.assign(rows, { where: async () => rows });
        },
    }),
  })),
  listDailyStock: vi.fn(async () => []),
}));

const { appRouter } = await import("./routers");
type Context = Parameters<typeof appRouter.createCaller>[0];
const ctx = { user: { id: 1, openId: "test", email: "test@example.com", name: "Test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as Context["req"], res: {} as Context["res"] } as Context;

describe("stock.autoIssued department-aware Spanish BOM flow", () => {
  beforeEach(() => {
    state.orders = [{ id: 1, orderDate: "2026-08-20", itemId: 10, quantity: "100" }];
    state.recipes = [
      { id: 1, itemId: 10, department: "production", effectiveFrom: "2026-01-01", active: true },
      { id: 2, itemId: 10, department: "packaging", effectiveFrom: "2026-01-01", active: true },
    ];
    state.recipeLines = [
      { recipeId: 1, materialItemId: 101, quantityPerBatch: "0.4" },
      { recipeId: 1, materialItemId: 102, quantityPerBatch: "0.1" },
      { recipeId: 2, materialItemId: 201, quantityPerBatch: "1" },
      { recipeId: 2, materialItemId: 202, quantityPerBatch: "1" },
    ];
  });

  it("uses the Production recipe only for flour/sugar and Packaging recipe only for box/sticker", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.stock.autoIssued({ stockDate: "2026-08-20", department: "production", itemId: 101 })).resolves.toEqual({ autoIssued: 40 });
    await expect(caller.stock.autoIssued({ stockDate: "2026-08-20", department: "production", itemId: 102 })).resolves.toEqual({ autoIssued: 10 });
    await expect(caller.stock.autoIssued({ stockDate: "2026-08-20", department: "packaging", itemId: 201 })).resolves.toEqual({ autoIssued: 100 });
    await expect(caller.stock.autoIssued({ stockDate: "2026-08-20", department: "packaging", itemId: 202 })).resolves.toEqual({ autoIssued: 100 });
    await expect(caller.stock.autoIssued({ stockDate: "2026-08-20", department: "production", itemId: 201 })).resolves.toEqual({ autoIssued: 0 });
  });
});

export {};

