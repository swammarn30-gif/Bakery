import { describe, expect, it } from "vitest";
import { aggregateSaleRows, calculateClosing, calculateIssuedFromBom, calculateSaleClosing, calculateUsed, carryForwardOpening, saleRowKey, sumShopQuantities, valueOf, weightedAverageCost } from "../shared/calculations";

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

  it("calculates quantity-weighted monthly average cost", () => {
    expect(weightedAverageCost([{ quantity: 100, unitCost: 2000 }, { quantity: 200, unitCost: 2500 }])).toBeCloseTo(2333.333333);
  });

  it("carries forward the previous cost when the month has no purchases", () => {
    expect(weightedAverageCost([], 2333.333333)).toBeCloseTo(2333.333333);
  });

  it("keeps quantity and value separate", () => {
    expect(valueOf(73, 2500)).toBe(182500);
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
