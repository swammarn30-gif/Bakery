import { describe, expect, it } from "vitest";
import { aggregateSaleRows, calculateClosing, calculateDepartmentIssued, calculateIssuedFromBom, normalizePurchase, toBaseQuantity, calculateSaleClosing, calculateUsed, carryForwardOpening, enforceSingleActiveRecipe, openingApprovalPresentation, applyRecipeEdit, parseRecipeLinesJson, recalculateSequentialOpenings, resolveIssuedQuantity, safeRecipeLinesUpdate, saleRowKey, selectEffectiveRecipe, selectStockRowByItem, sumShopQuantities, validateBackupSnapshot, validateImportRows, valueOf, weightedAverageCost } from "../shared/calculations";

describe("ERP calculations", () => {
  it("uses the specified Production and Packaging Used formula", () => {
    expect(calculateUsed({ opening: 100, inQty: 50, issued: 20, returnQty: 2, damage: 1 })).toBe(17);
  });

  it("uses the specified Production and Packaging Closing formula", () => {
    expect(calculateClosing({ opening: 100, inQty: 50, issued: 20, returnQty: 2, damage: 1 })).toBe(132);
  });

  it("uses the specified Sale Closing formula", () => {
    expect(calculateSaleClosing(100, 50, 45)).toBe(105);
  });

  it("generates BOM issuance from order quantity and preserves a separately editable value", () => {
    expect(calculateIssuedFromBom(100, 0.4, 1)).toBe(40);
  });

  it("splits Spanish BOM issuance between Production ingredients and Packaging materials", () => {
    const production = { department: "production" as const, lines: [{ quantityPerBatch: 0.4 }, { quantityPerBatch: 0.1 }] };
    const packaging = { department: "packaging" as const, lines: [{ quantityPerBatch: 1 }, { quantityPerBatch: 1 }] };
    expect(calculateDepartmentIssued(100, "production", production)).toBe(50);
    expect(calculateDepartmentIssued(100, "packaging", packaging)).toBe(200);
    expect(calculateDepartmentIssued(100, "production", packaging)).toBe(0);
  });

  it("normalizes Kg, g, Viss, and pcs into base quantities", () => {
    expect(toBaseQuantity(1200, "kg")).toBe(1200000);
    expect(toBaseQuantity(1, "viss")).toBe(1600);
    expect(toBaseQuantity(250, "g")).toBe(250);
    expect(toBaseQuantity(12, "pcs")).toBe(12);
  });

  it("derives base cost from total purchase value", () => {
    const result = normalizePurchase(1200, "kg", 1500000);
    expect(result.baseQuantity).toBe(1200000);
    expect(result.baseUnit).toBe("g");
    expect(result.baseUnitCost).toBe(1.25);
  });

  it("rejects incompatible source units for item base units", () => {
    expect(() => normalizePurchase(1, "kg", 100, "pcs")).toThrow("pcs-base items");
    expect(() => normalizePurchase(1, "pcs", 100, "g")).toThrow("g-base items");
  });

  it("calculates monthly weighted average from mixed normalized purchase units and carries forward", () => {
    const kg = normalizePurchase(1, "kg", 1000, "g");
    const grams = normalizePurchase(500, "g", 600, "g");
    expect(weightedAverageCost([{ quantity: kg.baseQuantity, unitCost: kg.baseUnitCost }, { quantity: grams.baseQuantity, unitCost: grams.baseUnitCost }])).toBeCloseTo(1.0666666667);
    expect(weightedAverageCost([], 1.0666666667)).toBeCloseTo(1.0666666667);
  });

  it("calculates quantity-weighted monthly average cost", () => {
    expect(weightedAverageCost([{ quantity: 100, unitCost: 2000 }, { quantity: 200, unitCost: 2500 }])).toBeCloseTo(2333.333333);
  });

  it("carries forward the previous cost when the month has no purchases", () => {
    expect(weightedAverageCost([], 2333.333333)).toBeCloseTo(2333.333333);
  });

  it("keeps quantity and value separate", () => {
    expect(valueOf(73, 2500)).toBe(182500);
  });

  it("selects the latest active Recipe/BOM effective on a date and enforces one active version", () => {
    const rows = [{ id: 1, itemId: 7, effectiveFrom: "2026-01-01", active: true }, { id: 2, itemId: 7, effectiveFrom: "2026-03-01", active: true }, { id: 3, itemId: 9, effectiveFrom: "2026-02-01", active: true }];
    expect(selectEffectiveRecipe(rows, 7, "2026-04-01")?.id).toBe(2);
    expect(enforceSingleActiveRecipe(rows, 2).filter(row => row.itemId === 7 && row.active).map(row => row.id)).toEqual([2]);
    expect(enforceSingleActiveRecipe(rows, 2, false).find(row => row.id === 2)?.active).toBe(false);
    expect(enforceSingleActiveRecipe(rows, 2, true).find(row => row.id === 2)?.active).toBe(true);
  });

  it("validates Recipe/BOM line payloads without silently accepting malformed data", () => {
    expect(parseRecipeLinesJson(JSON.stringify([{ materialItemId: 1, quantityPerBatch: 2, unit: "kg" }, { materialItemId: 2, quantityPerBatch: 0.5, unit: "kg" }])).valid).toBe(true);
    expect(parseRecipeLinesJson("not-json").valid).toBe(false);
    expect(parseRecipeLinesJson("[]").valid).toBe(false);
    expect(parseRecipeLinesJson(JSON.stringify([{ materialItemId: 0, quantityPerBatch: 1, unit: "kg" }])).valid).toBe(false);
  });

  it("preserves Recipe/BOM headers while replacing every validated material line", () => {
    const result = applyRecipeEdit({ id: 7, effectiveFrom: "2026-01-01", note: "old" }, "2026-03-01", "updated", [{ materialItemId: 5, quantityPerBatch: 2, unit: "kg" }, { materialItemId: 6, quantityPerBatch: 1, unit: "l" }]);
    expect(result).toMatchObject({ id: 7, effectiveFrom: "2026-03-01", note: "updated" });
    expect(result.lines).toHaveLength(2);
  });

  it("replaces all Recipe/BOM lines from the authoritative valid payload", () => {
    const existing = [{ materialItemId: 4, quantityPerBatch: 3, unit: "kg" }];
    const result = safeRecipeLinesUpdate(existing, JSON.stringify([{ materialItemId: 5, quantityPerBatch: 2, unit: "kg" }, { materialItemId: 6, quantityPerBatch: 1, unit: "l" }]));
    expect(result.valid).toBe(true);
    expect(result.lines).toEqual([{ materialItemId: 5, quantityPerBatch: 2, unit: "kg" }, { materialItemId: 6, quantityPerBatch: 1, unit: "l" }]);
  });

  it("preserves manual Issued overrides while allowing theoretical values to refresh", () => {
    expect(resolveIssuedQuantity(12, 5, true)).toBe(5);
    expect(resolveIssuedQuantity(12, 5, false)).toBe(12);
  });

  it("recalculates historical Opening values from each item’s previous Closing", () => {
    const rows = recalculateSequentialOpenings([{ itemId: 2, date: "2026-01-02", opening: 0, closing: 7 }, { itemId: 1, date: "2026-01-02", opening: 0, closing: 4 }, { itemId: 1, date: "2026-01-01", opening: 10, closing: 4 }, { itemId: 2, date: "2026-01-01", opening: 3, closing: 7 }]);
    expect(rows.find(row => row.itemId === 1 && row.date === "2026-01-02")?.opening).toBe(4);
    expect(rows.find(row => row.itemId === 2 && row.date === "2026-01-02")?.opening).toBe(7);
  });

  it("uses authoritative Recipe/BOM lines instead of duplicate visible fields", () => {
    const authoritative = JSON.stringify([{ materialItemId: 8, quantityPerBatch: 4, unit: "kg" }, { materialItemId: 9, quantityPerBatch: 2, unit: "l" }]);
    const duplicateFields = [{ materialItemId: 1, quantityPerBatch: 99, unit: "unit" }];
    const result = safeRecipeLinesUpdate(duplicateFields, authoritative);
    expect(result.valid).toBe(true);
    expect(result.lines).toEqual([{ materialItemId: 8, quantityPerBatch: 4, unit: "kg" }, { materialItemId: 9, quantityPerBatch: 2, unit: "l" }]);
  });

  it("keeps existing Recipe/BOM lines unchanged when an edit payload is malformed", () => {
    const existing = [{ materialItemId: 4, quantityPerBatch: 3, unit: "kg" }];
    const result = safeRecipeLinesUpdate(existing, "{bad-json");
    expect(result.valid).toBe(false);
    expect(result.lines).toEqual(existing);
  });

  it("targets the selected stock row for an Opening proposal", () => {
    const selected = selectStockRowByItem([{ id: 1, itemId: 11 }, { id: 2, itemId: 22 }], 22);
    expect(selected?.id).toBe(2);
  });

  it("keeps pending Opening faded and applies only the approved decision", () => {
    expect(openingApprovalPresentation({ openingApproved: 10, openingPending: 14 })).toEqual({ official: 10, pending: 14, faded: true });
    expect(openingApprovalPresentation({ openingApproved: 10, openingPending: 14 }, "approved")).toEqual({ official: 14, pending: null, faded: false });
    expect(openingApprovalPresentation({ openingApproved: 10, openingPending: 14 }, "rejected")).toEqual({ official: 10, pending: null, faded: false });
  });

  it("validates backup schema versions and required collections", () => {
    const valid = { schemaVersion: 1, items: [], purchases: [], dailyStock: [], orders: [], sales: [], shops: [], recipes: [], recipeLines: [], saleShopLines: [], stockAdjustments: [] };
    expect(validateBackupSnapshot(valid).valid).toBe(true);
    expect(validateBackupSnapshot({ ...valid, schemaVersion: 2 }).valid).toBe(false);
    expect(validateBackupSnapshot({ schemaVersion: 1, items: [] }).valid).toBe(false);
  });

  it("rejects duplicate and approved Excel import rows", () => {
    const rows = [{ Date: "2026-08-19", Department: "production", Item: "Flour", Unit: "kg" }, { Date: "2026-08-19", Department: "production", Item: "Flour", Unit: "kg" }];
    const result = validateImportRows(rows, new Set(["2026-08-20|production|Sugar"]));
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes("duplicate"))).toBe(true);
    expect(validateImportRows([{ Date: "2026-08-20", Department: "production", Item: "Sugar", Unit: "kg" }], new Set(["2026-08-20|production|Sugar"])).errors[0]).toContain("approved");
  });

  it("uses one identity for repeated same-date/product sale saves", () => {
    expect(saleRowKey("2026-08-19", 4)).toBe("2026-08-19:4");
    const rows = aggregateSaleRows([
      { saleDate: "2026-08-19", itemId: 4, opening: 100, produce: 50, shopLines: [{ quantity: 20 }, { quantity: 15 }] },
      { saleDate: "2026-08-19", itemId: 4, opening: 100, produce: 50, shopLines: [{ quantity: 45 }] },
      { saleDate: "2026-08-19", itemId: 5, opening: 40, produce: 10, shopLines: [{ quantity: 5 }] },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows.find(row => row.itemId === 4)?.sell).toBe(45);
    expect(rows.find(row => row.itemId === 5)?.closing).toBe(45);
  });

  it("carries the previous approved Closing into the next day Opening", () => {
    expect(carryForwardOpening(500)).toBe(500);
    expect(carryForwardOpening(undefined)).toBe(0);
  });

  it("sums any number of shop lines", () => {
    expect(sumShopQuantities([{ quantity: 20 }, { quantity: 15 }, { quantity: 10 }])).toBe(45);
  });
});
