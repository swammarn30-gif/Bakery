import { describe, expect, it } from "vitest";
import { departmentExportFilename, toDepartmentExportRows } from "./exportUtils";

describe("department-specific exports", () => {
  it("maps only the supplied Production rows and preserves stock formulas", () => {
    const rows = toDepartmentExportRows([
      { stockDate: "2026-08-20", itemId: 1, openingApproved: "100", inQty: "25", issued: "40", returnQty: "3", damage: "2", note: null },
    ], id => id === 1 ? "Flour" : "Packaging Box");

    expect(rows).toEqual([{
      Date: "2026-08-20", Item: "Flour", Opening: 100, In: 25, Issued: 40,
      Return: 3, Damage: 2, Used: 35, Closing: 88, Note: "",
    }]);
    expect(rows.some(row => row.Item === "Packaging Box")).toBe(false);
  });

  it("keeps Packaging export rows independent from Production rows", () => {
    const rows = toDepartmentExportRows([
      { stockDate: "2026-08-20", itemId: 2, openingApproved: 10, inQty: 4, issued: 3, returnQty: 0, damage: 1, note: "pcs" },
    ], id => id === 2 ? "Gift Box" : "Flour");

    expect(rows).toHaveLength(1);
    expect(rows[0].Item).toBe("Gift Box");
    expect(rows[0].Closing).toBe(11);
  });

  it("creates distinct department filenames for the selected date range", () => {
    expect(departmentExportFilename("production", "2026-08-01", "2026-08-20")).toBe("Bakery_production_2026-08-01_to_2026-08-20.xlsx");
    expect(departmentExportFilename("packaging", "2026-08-01", "2026-08-20")).toBe("Bakery_packaging_2026-08-01_to_2026-08-20.xlsx");
  });
});
