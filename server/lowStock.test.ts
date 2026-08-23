import { describe, expect, it } from "vitest";
import { getLowStockItems } from "../shared/lowStock";

describe("getLowStockItems", () => {
  it("uses the all-history average Used multiplied by three as the low-stock threshold", () => {
    const rows = getLowStockItems([
      { id: 1, name: "Flour", unit: "g", itemType: "raw_material", active: true },
      { id: 2, name: "Box", unit: "pcs", itemType: "packaging_material", active: true },
      { id: 3, name: "Inactive", unit: "g", itemType: "raw_material", active: false },
    ], [
      { stockDate: "2026-08-01", department: "production", itemId: 1, openingApproved: "100", inQty: "20", issued: "40", returnQty: "5", damage: "7" },
      { stockDate: "2026-08-02", department: "production", itemId: 1, openingApproved: "85", inQty: "0", issued: "35", returnQty: "0", damage: "3" },
      { stockDate: "2026-08-01", department: "packaging", itemId: 2, openingApproved: "70", inQty: "0", issued: "10", returnQty: "0", damage: "0" },
    ]);

    expect(rows).toEqual([{ itemId: 1, item: "Flour", unit: "g", department: "production", currentStock: 50, averageUsed: 30, threeDayThreshold: 90, shortfall: 40, status: "low" }]);
  });

  it("shows an item only when its Closing is below average Used × 3", () => {
    expect(getLowStockItems([{ id: 4, name: "Sticker", unit: "pcs", itemType: "packaging_material", active: true }], [
      { stockDate: "2026-08-01", department: "packaging", itemId: 4, openingApproved: "20", inQty: "0", issued: "10", returnQty: "0", damage: "0" },
      { stockDate: "2026-08-02", department: "packaging", itemId: 4, openingApproved: "10", inQty: "0", issued: "5", returnQty: "0", damage: "0" },
    ])).toEqual([
      { itemId: 4, item: "Sticker", unit: "pcs", department: "packaging", currentStock: 5, averageUsed: 7.5, threeDayThreshold: 22.5, shortfall: 17.5, status: "low" },
    ]);
  });
});
