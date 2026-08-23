import { describe, expect, it } from "vitest";
import { getLowStockItems } from "../shared/lowStock";

describe("getLowStockItems", () => {
  it("uses the latest sequential Closing and respects the approved Closing formula", () => {
    const rows = getLowStockItems([
      { id: 1, name: "Flour", unit: "g", itemType: "raw_material", active: true, minimumStock: "100" },
      { id: 2, name: "Box", unit: "pcs", itemType: "packaging_material", active: true, minimumStock: "50" },
      { id: 3, name: "Inactive", unit: "g", itemType: "raw_material", active: false, minimumStock: "999" },
    ], [
      { stockDate: "2026-08-01", department: "production", itemId: 1, openingApproved: "100", inQty: "20", issued: "40", returnQty: "5", damage: "7" },
      { stockDate: "2026-08-02", department: "production", itemId: 1, openingApproved: "85", inQty: "0", issued: "10", returnQty: "0", damage: "3" },
      { stockDate: "2026-08-01", department: "packaging", itemId: 2, openingApproved: "70", inQty: "0", issued: "10", returnQty: "0", damage: "0" },
    ]);

    expect(rows).toEqual([{ itemId: 1, item: "Flour", unit: "g", department: "production", currentStock: 75, minimumStock: 100, shortfall: 25, status: "low" }]);
  });

  it("includes a new active ledger item at or below its saved minimum", () => {
    expect(getLowStockItems([{ id: 4, name: "Sticker", unit: "pcs", itemType: "packaging_material", active: true, minimumStock: 0 }], [])).toEqual([
      { itemId: 4, item: "Sticker", unit: "pcs", department: "packaging", currentStock: 0, minimumStock: 0, shortfall: 0, status: "low" },
    ]);
  });
});
