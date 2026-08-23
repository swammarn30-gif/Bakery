import { describe, expect, it } from "vitest";
import { getLedgerRangeTotals } from "./ledgerReport";

describe("getLedgerRangeTotals", () => {
  it("totals the requested In, Damage, and Used columns across an item date range", () => {
    expect(getLedgerRangeTotals([
      { inQty: 120, damage: 2, used: 60 },
      { inQty: "30", damage: "1", used: "12.5" },
      { inQty: null, damage: undefined, used: 0 },
    ])).toEqual({ inQty: 150, damage: 3, used: 72.5 });
  });

  it("keeps an empty date range at numeric zero totals", () => {
    expect(getLedgerRangeTotals([])).toEqual({ inQty: 0, damage: 0, used: 0 });
  });

  it("does not let invalid values corrupt the range total", () => {
    expect(getLedgerRangeTotals([{ inQty: "not-a-number", damage: Number.NaN, used: "" }])).toEqual({ inQty: 0, damage: 0, used: 0 });
  });
});
