import { beforeEach, describe, expect, it, vi } from "vitest";

const state = { items: [] as Array<Record<string, unknown>>, stock: [] as Array<Record<string, unknown>>, inserts: [] as Array<Record<string, unknown>>, audits: 0, selectCalls: 0 };
vi.mock("./db", () => ({
  items: "items", dailyStock: "dailyStock", importBatches: "importBatches",
  getDb: vi.fn(async () => ({
    select: () => ({ from: () => { const result = state.selectCalls++ === 0 ? state.items : state.stock; return { where: async () => result, then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(result)) }; } }),
    insert: (table: unknown) => ({ values: async (value: Record<string, unknown>) => { state.inserts.push({ table, ...value }); return [{ insertId: state.inserts.length }]; } }),
  })),
  writeAudit: vi.fn(async () => { state.audits += 1; }),
}));
const { appRouter } = await import("./routers");
type Context = Parameters<typeof appRouter.createCaller>[0];
const ctx = { user: { id: 1, openId: "admin", email: "admin@example.com", name: "Admin", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as Context["req"], res: {} as Context["res"] } as Context;

describe("imports.applyProduction", () => {
  beforeEach(() => { state.items = [{ id: 4, name: "Flour" }]; state.stock = [{ id: 9, stockDate: "2026-08-18", department: "production", itemId: 4 }]; state.inserts = []; state.audits = 0; state.selectCalls = 0; });
  it("applies validated rows with batch metadata and audit logging", async () => {
    state.stock = [];
    const result = await appRouter.createCaller(ctx).imports.applyProduction({ filename: "daily.xlsx", rows: [{ Date: "2026-08-18", Department: "production", Item: "Flour", Unit: "kg", Opening: 1, In: 2, Issued: 1, Return: 0, Damage: 0, Note: "imported" }] });
    expect(result.rowCount).toBe(1);
    expect(state.inserts).toHaveLength(2);
    expect(state.inserts[0]).toMatchObject({ filename: "daily.xlsx", status: "applied", rowCount: 1 });
    expect(state.audits).toBe(1);
  });

  it("rejects an existing approved row before writing a batch or stock row", async () => {
    await expect(appRouter.createCaller(ctx).imports.applyProduction({ filename: "daily.xlsx", rows: [{ Date: "2026-08-18", Department: "production", Item: "Flour", Unit: "kg", Opening: 1, In: 2, Issued: 1, Return: 0, Damage: 0 }] })).rejects.toThrow("approved data cannot be overwritten");
    expect(state.inserts).toHaveLength(0);
  });
});

export {};
