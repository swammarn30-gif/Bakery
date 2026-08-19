import { beforeEach, describe, expect, it, vi } from "vitest";

const state = {
  approvals: [] as Array<Record<string, unknown>>,
  stock: [] as Array<Record<string, unknown>>,
  targetApprovalId: 0,
};

vi.mock("./db", () => ({
  approvals: "approvals", dailyStock: "dailyStock", stockAdjustments: "stockAdjustments",
  getDb: vi.fn(async () => ({
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () => table === "approvals" ? state.approvals.filter(row => row.id === state.targetApprovalId) : table === "dailyStock" ? state.stock.filter(row => row.id === 2) : [],
        }),
      }),
    }),
    update: () => ({
      set: (value: Record<string, unknown>) => ({
        where: async () => {
          const approval = state.approvals.find(row => row.id === state.targetApprovalId);
          if (approval && value.status) Object.assign(approval, value);
          const row = state.stock.find(stockRow => stockRow.id === 2);
          if (row && (value.openingApproved !== undefined || value.openingPending === null)) Object.assign(row, value);
        },
      }),
    }),
  })),
  writeAudit: vi.fn(async () => undefined),
  listPendingApprovals: vi.fn(async () => state.approvals),
}));

const { appRouter } = await import("./routers");
type Context = Parameters<typeof appRouter.createCaller>[0];
const ctx = { user: { id: 99, openId: "admin", email: "admin@example.com", name: "Admin", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as Context["req"], res: {} as Context["res"] } as Context;

describe("approvals.review router behavior", () => {
  beforeEach(() => {
    state.targetApprovalId = 2;
    state.approvals = [
      { id: 1, entityType: "opening", entityId: 1, oldValue: "4", proposedValue: "8", status: "pending", reason: null },
      { id: 2, entityType: "opening", entityId: 2, oldValue: "5", proposedValue: "9", status: "pending", reason: null },
    ];
    state.stock = [
      { id: 1, openingApproved: "4", openingPending: "7" },
      { id: 2, openingApproved: "5", openingPending: "9" },
    ];
  });

  it("approves only the selected Opening stock row", async () => {
    await appRouter.createCaller(ctx).approvals.review({ id: 2, decision: "approved" });
    expect(state.stock[1]).toMatchObject({ openingApproved: "9", openingPending: null });
    expect(state.stock[0]).toMatchObject({ openingApproved: "4", openingPending: "7" });
  });

  it("rejects the selected Opening proposal without changing another row", async () => {
    await appRouter.createCaller(ctx).approvals.review({ id: 2, decision: "rejected" });
    expect(state.stock[1]).toMatchObject({ openingApproved: "5", openingPending: null });
    expect(state.stock[0]).toMatchObject({ openingApproved: "4", openingPending: "7" });
  });
});

export {};
