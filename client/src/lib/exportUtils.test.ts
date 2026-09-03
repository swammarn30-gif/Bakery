import { describe, expect, it } from "vitest";
import { dateColumnsBetween, departmentExportFilename, isDepartmentExportReady, parseTransferWorkbookMatrix, reportExportFilename, toDateColumnExportRows, toDateGroupedExport } from "./exportUtils";

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

  it("carries each item closing into the next exported date opening", () => {
    const grouped = toDateGroupedExport([
      { stockDate: "2026-08-01", itemId: 1, openingApproved: 100, inQty: 25, issued: 40, returnQty: 3, damage: 2, note: null },
      { stockDate: "2026-08-02", itemId: 1, openingApproved: 0, inQty: 10, issued: 20, returnQty: 0, damage: 1, note: null },
    ], id => "Flour", id => "g", "2026-08-01", "2026-08-02", [{ id: 1, name: "Flour", unit: "g" }]);

    expect(grouped.rows[0]?.values["2026-08-01|Closing"]).toBe(88);
    expect(grouped.rows[0]?.values["2026-08-02|Opening"]).toBe(88);
    expect(reportExportFilename("production", "Flour", "2026-08-01", "2026-08-02")).toBe("Bakery_report_production_Flour_2026-08-01_to_2026-08-02.xlsx");
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

describe("date-range transfer parsing", () => {
  it("converts grouped date columns back into flat rows for the selected department", () => {
    const rows = parseTransferWorkbookMatrix([
      ["Item", "Unit", "2026-08-01", "", "", "", "", "", "", "", "2026-08-02", "", "", "", "", "", "", ""],
      ["", "", "Opening", "In", "Issued", "Return", "Damage", "Used", "Closing", "Note", "Opening", "In", "Issued", "Return", "Damage", "Used", "Closing", "Note"],
      ["Flour", "g", 100, 25, 40, 3, 2, 35, 88, "first", 88, 10, 20, 0, 1, 19, 78, "second"],
    ], "production");

    expect(rows).toEqual([
      { Date: "2026-08-01", Department: "production", Item: "Flour", Unit: "g", Opening: 100, In: 25, Issued: 40, Return: 3, Damage: 2, Note: "first" },
      { Date: "2026-08-02", Department: "production", Item: "Flour", Unit: "g", Opening: 88, In: 10, Issued: 20, Return: 0, Damage: 1, Note: "second" },
    ]);
  });

  it("preserves flat daily export rows and uses the selected department only when missing", () => {
    const rows = parseTransferWorkbookMatrix([
      ["Date", "Department", "Item", "Unit", "Opening", "In", "Issued", "Return", "Damage", "Used", "Closing", "Note"],
      ["2026-08-03", "", "Box", "pcs", 12, 4, 3, 0, 1, 2, 13, "ok"],
    ], "packaging");

    expect(rows[0]).toMatchObject({ Date: "2026-08-03", Department: "packaging", Item: "Box", Unit: "pcs", Opening: 12, In: 4, Issued: 3, Return: 0, Damage: 1, Note: "ok" });
  });
});
