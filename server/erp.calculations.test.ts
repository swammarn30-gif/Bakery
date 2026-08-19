import { describe, expect, it } from "vitest";
import { calculateClosing, calculateIssuedFromBom, calculateSaleClosing, calculateUsed, sumShopQuantities, valueOf, weightedAverageCost } from "../shared/calculations";

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

  it("sums any number of shop lines", () => {
    expect(sumShopQuantities([{ quantity: 20 }, { quantity: 15 }, { quantity: 10 }])).toBe(45);
  });
});
