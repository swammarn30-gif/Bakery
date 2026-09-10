import { describe, expect, it } from "vitest";
import { getLedgerRangeTotals } from "./ledgerReport";

describe("getLedgerRangeTotals", () => {
  it("totals quantities and requested price columns across an item date range", () => {
    expect(getLedgerRangeTotals([
      { inQty: 120, damage: 2, used: 60, usedPrice: 600, damagePrice: 20, closingPrice: 900 },
      { inQty: "30", damage: "1", used: "12.5", usedPrice: "125", damagePrice: "10", closingPrice: "450" },
      { inQty: null, damage: undefined, used: 0 },
    ])).toEqual({ inQty: 150, damage: 3, used: 72.5, usedPrice: 725, damagePrice: 30, closingPrice: 1350 });
  });

  it("keeps an empty date range at numeric zero totals", () => {
    expect(getLedgerRangeTotals([])).toEqual({ inQty: 0, damage: 0, used: 0, usedPrice: 0, damagePrice: 0, closingPrice: 0 });
  });

  it("does not let invalid values corrupt the range total", () => {
    expect(getLedgerRangeTotals([{ inQty: "not-a-number", damage: Number.NaN, used: "" }])).toEqual({ inQty: 0, damage: 0, used: 0, usedPrice: 0, damagePrice: 0, closingPrice: 0 });
  });
});
