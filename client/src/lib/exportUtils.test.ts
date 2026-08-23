import { describe, expect, it } from "vitest";
import { dateColumnsBetween, departmentExportFilename, isDepartmentExportReady, toDateColumnExportRows, toDateGroupedExport } from "./exportUtils";

describe("department-specific date-column exports", () => {
  it("creates ordered date columns and preserves stock formulas", () => {
    const rows = toDateColumnExportRows([
      { stockDate: "2026-08-01", itemId: 1, openingApproved: "100", inQty: "25", issued: "40", returnQty: "3", damage: "2", note: null },
    ], id => id === 1 ? "Flour" : "Packaging Box", "2026-08-01", "2026-08-02");

    expect(rows).toHaveLength(8);
    expect(rows[0]).toEqual({ Item: "Flour", Field: "Opening", "2026-08-01": 100, "2026-08-02": "" });
    expect(rows.find(row => row.Field === "Used")).toEqual({ Item: "Flour", Field: "Used", "2026-08-01": 35, "2026-08-02": "" });
    expect(rows.find(row => row.Field === "Closing")).toEqual({ Item: "Flour", Field: "Closing", "2026-08-01": 88, "2026-08-02": "" });
    expect(rows.some(row => row.Item === "Packaging Box")).toBe(false);
  });

  it("keeps Packaging export rows independent from Production rows", () => {
    const rows = toDateColumnExportRows([
      { stockDate: "2026-08-02", itemId: 2, openingApproved: 10, inQty: 4, issued: 3, returnQty: 0, damage: 1, note: "pcs" },
    ], id => id === 2 ? "Gift Box" : "Flour", "2026-08-01", "2026-08-02");

    expect(rows).toHaveLength(8);
    expect(rows[0].Item).toBe("Gift Box");
    expect(rows.find(row => row.Field === "Closing")?.["2026-08-02"]).toBe(11);
    expect(rows.some(row => row.Item === "Flour")).toBe(false);
  });

  it("creates the requested date sequence and distinct department filenames", () => {
    expect(dateColumnsBetween("2026-08-01", "2026-08-03")).toEqual(["2026-08-01", "2026-08-02", "2026-08-03"]);
    expect(departmentExportFilename("production", "2026-08-01", "2026-08-20")).toBe("Bakery_production_2026-08-01_to_2026-08-20.xlsx");
    expect(departmentExportFilename("packaging", "2026-08-01", "2026-08-20")).toBe("Bakery_packaging_2026-08-01_to_2026-08-20.xlsx");
  });

  it("seeds grouped export rows from item master and fills existing metrics", () => {
    const grouped = toDateGroupedExport([
      { stockDate: "2026-08-01", itemId: 1, openingApproved: 100, inQty: 25, issued: 40, returnQty: 3, damage: 2, note: "ok" },
    ], id => id === 1 ? "Flour" : "Box", id => id === 1 ? "g" : "pcs", "2026-08-01", "2026-08-02", [
      { id: 1, name: "Flour", unit: "g" },
      { id: 2, name: "Box", unit: "pcs" },
    ]);

    expect(grouped.rows).toHaveLength(2);
    expect(grouped.rows[0]?.values["2026-08-01|Closing"]).toBe(88);
    expect(grouped.rows[1]?.item).toBe("Box");
    expect(grouped.rows[1]?.values["2026-08-02|Opening"]).toBe("");
  });

  it("blocks a department workbook until both query datasets are ready", () => {
    expect(isDepartmentExportReady(false, true, false)).toBe(false);
    expect(isDepartmentExportReady(true, false, false)).toBe(false);
    expect(isDepartmentExportReady(true, true, true)).toBe(false);
    expect(isDepartmentExportReady(true, true, false)).toBe(true);
  });
});
