import { beforeEach, describe, expect, it, vi } from "vitest";

const state = { recipes: [] as Array<Record<string, unknown>>, targetId: 2 };

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
    update: () => ({
      set: (value: Record<string, unknown>) => ({ where: async () => {
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
  beforeEach(() => { state.recipes = [{ id: 1, itemId: 10, active: true }, { id: 2, itemId: 10, active: false }, { id: 3, itemId: 11, active: true }]; state.targetId = 2; });

  it("activates one version and deactivates the other version for the same item", async () => {
    await appRouter.createCaller(ctx).recipes.setActive({ id: 2, active: true });
    expect(state.recipes).toEqual([{ id: 1, itemId: 10, active: false }, { id: 2, itemId: 10, active: true }, { id: 3, itemId: 11, active: true }]);
  });

  it("deactivates only the targeted Recipe/BOM version", async () => {
    state.targetId = 1;
    await appRouter.createCaller(ctx).recipes.setActive({ id: 1, active: false });
    expect(state.recipes).toEqual([{ id: 1, itemId: 10, active: false }, { id: 2, itemId: 10, active: false }, { id: 3, itemId: 11, active: true }]);
  });

  it("reactivates an inactive version and returns it in the full recipe list", async () => {
    await appRouter.createCaller(ctx).recipes.setActive({ id: 2, active: true });
    const rows = await appRouter.createCaller(ctx).recipes.list();
    expect(rows.find(row => row.id === 2)?.active).toBe(true);
  });
});

export {};
