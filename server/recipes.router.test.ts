import { beforeEach, describe, expect, it, vi } from "vitest";

const state = { recipes: [] as Array<Record<string, unknown>>, recipeLines: [] as Array<Record<string, unknown>>, targetId: 2, updateCalls: 0, deleteCalls: 0 };

vi.mock("./db", () => ({
  recipes: "recipes", recipeLines: "recipeLines",
  getDb: vi.fn(async () => ({
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () => state.recipes.filter(row => row.id === state.targetId),
          orderBy: async () => state.recipes,
        }),
        orderBy: async () => state.recipes,
      }),
    }),
    delete: () => ({ where: async () => { state.deleteCalls += 1; state.recipeLines = []; } }),
    insert: () => ({ values: async (rows: Record<string, unknown> | Array<Record<string, unknown>>) => { state.recipeLines.push(...(Array.isArray(rows) ? rows : [rows])); return [{ insertId: 1 }]; } }),
    update: () => ({
      set: (value: Record<string, unknown>) => ({ where: async () => { state.updateCalls += 1;
        if (value.effectiveFrom) { const row = state.recipes.find(candidate => candidate.id === state.targetId); if (row) Object.assign(row, value); }
        if (value.active === false) for (const row of state.recipes) if (row.itemId === 10) row.active = false;
        if (value.active === true) { const row = state.recipes.find(candidate => candidate.id === state.targetId); if (row) row.active = true; }
      } }),
    }),
  })),
}));

const { appRouter } = await import("./routers");
type Context = Parameters<typeof appRouter.createCaller>[0];
const ctx = { user: { id: 1, openId: "test", email: "test@example.com", name: "Test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as Context["req"], res: {} as Context["res"] } as Context;

describe("recipes.setActive router behavior", () => {
  beforeEach(() => { state.recipes = [{ id: 1, itemId: 10, active: true, effectiveFrom: "2026-01-01", note: "old" }, { id: 2, itemId: 10, active: false, effectiveFrom: "2026-02-01", note: "old" }, { id: 3, itemId: 11, active: true, effectiveFrom: "2026-01-01", note: null }]; state.recipeLines = [{ recipeId: 2, materialItemId: 5, quantityPerBatch: "2", unit: "kg" }]; state.targetId = 2; state.updateCalls = 0; state.deleteCalls = 0; });

  it("activates one version and deactivates the other version for the same item", async () => {
    await appRouter.createCaller(ctx).recipes.setActive({ id: 2, active: true });
    expect(state.recipes.map(row => ({ id: row.id, active: row.active }))).toEqual([{ id: 1, active: false }, { id: 2, active: true }, { id: 3, active: true }]);
  });

  it("persists an existing-version header update and all material lines", async () => {
    await appRouter.createCaller(ctx).recipes.update({ id: 2, effectiveFrom: "2026-04-01", note: "updated", lines: [{ materialItemId: 5, quantityPerBatch: 2, unit: "kg" }, { materialItemId: 6, quantityPerBatch: 1, unit: "l" }, { materialItemId: 7, quantityPerBatch: 0.5, unit: "kg" }] });
    expect(state.recipes.find(row => row.id === 2)).toMatchObject({ effectiveFrom: "2026-04-01", note: "updated" });
    expect(state.recipeLines).toHaveLength(3);
  });

  it("rejects malformed edits before update or line deletion", async () => {
    await expect(appRouter.createCaller(ctx).recipes.update({ id: 2, effectiveFrom: "2026-04-01", note: "bad", lines: [{ materialItemId: 0, quantityPerBatch: 0, unit: "" }] })).rejects.toThrow();
    expect(state.updateCalls).toBe(0);
    expect(state.deleteCalls).toBe(0);
    expect(state.recipeLines).toEqual([{ recipeId: 2, materialItemId: 5, quantityPerBatch: "2", unit: "kg" }]);
  });

  it("deactivates only the targeted Recipe/BOM version", async () => {
    state.targetId = 1;
    await appRouter.createCaller(ctx).recipes.setActive({ id: 1, active: false });
    expect(state.recipes.map(row => ({ id: row.id, active: row.active }))).toEqual([{ id: 1, active: false }, { id: 2, active: false }, { id: 3, active: true }]);
  });

  it("reactivates an inactive version and returns it in the full recipe list", async () => {
    await appRouter.createCaller(ctx).recipes.setActive({ id: 2, active: true });
    const rows = await appRouter.createCaller(ctx).recipes.list();
    expect(rows.find(row => row.id === 2)?.active).toBe(true);
  });
});

export {};
