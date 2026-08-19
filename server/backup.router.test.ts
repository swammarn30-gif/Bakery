import { describe, expect, it, vi } from "vitest";

const state = { deletes: 0, inserts: 0, audits: 0 };
vi.mock("./db", () => ({
  items: "items", purchases: "purchases", dailyStock: "dailyStock", orders: "orders", sales: "sales", shops: "shops", recipes: "recipes", recipeLines: "recipeLines", saleShopLines: "saleShopLines", stockAdjustments: "stockAdjustments", approvals: "approvals", importBatches: "importBatches",
  getDb: vi.fn(async () => ({ transaction: async (callback: (tx: any) => Promise<unknown>) => callback({ delete: async () => { state.deletes += 1; }, insert: () => ({ values: async () => { state.inserts += 1; return [{ insertId: state.inserts }]; } }) }) })),
  writeAudit: vi.fn(async () => { state.audits += 1; }),
}));
const { appRouter } = await import("./routers");
type Context = Parameters<typeof appRouter.createCaller>[0];
const ctx = { user: { id: 1, openId: "admin", email: "admin@example.com", name: "Admin", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as Context["req"], res: {} as Context["res"] } as Context;

describe("backup.restore safeguards", () => {
  it("restores a validated snapshot inside the transaction and records an audit", async () => {
    state.deletes = 0; state.inserts = 0; state.audits = 0;
    const snapshot = { schemaVersion: 1, items: [{ id: 1 }], purchases: [], dailyStock: [], orders: [], sales: [], shops: [], recipes: [], recipeLines: [], saleShopLines: [], stockAdjustments: [], approvals: [{ id: 8 }], importBatches: [{ id: 9 }] };
    const result = await appRouter.createCaller(ctx).backup.restore({ confirm: true, snapshot });
    expect(result).toEqual({ restored: true, schemaVersion: 1 });
    expect(state.deletes).toBe(10);
    expect(state.inserts).toBe(3);
    expect(state.audits).toBe(1);
  });
  it("migrates a version-zero snapshot by supplying current metadata collections", async () => {
    state.deletes = 0; state.inserts = 0; state.audits = 0;
    const snapshot = { schemaVersion: 0, items: [], purchases: [], dailyStock: [], orders: [], sales: [], shops: [], recipes: [], recipeLines: [], saleShopLines: [], stockAdjustments: [] };
    const result = await appRouter.createCaller(ctx).backup.restore({ confirm: true, snapshot });
    expect(result.schemaVersion).toBe(1);
    expect(state.audits).toBe(1);
  });
  it("rejects unsupported schema versions before any database access", async () => {
    await expect(appRouter.createCaller(ctx).backup.restore({ confirm: true, snapshot: { schemaVersion: 99 } })).rejects.toThrow("Unsupported schema version");
  });
  it("requires every exported collection before restore", async () => {
    await expect(appRouter.createCaller(ctx).backup.restore({ confirm: true, snapshot: { schemaVersion: 1, items: [] } })).rejects.toThrow("Missing collections");
  });
});

export {};
