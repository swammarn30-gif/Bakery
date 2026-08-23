import { describe, expect, it } from "vitest";
import { formatLedgerQuantity, formatQuantity } from "./Home";

describe("formatQuantity", () => {
  it("renders ledger zero values as blank without changing nonzero formatting", () => {
    expect(formatLedgerQuantity(0)).toBe("");
    expect(formatLedgerQuantity("0.000")).toBe("");
    expect(formatLedgerQuantity(400)).toBe("400");
    expect(formatLedgerQuantity("12.500")).toBe("12.5");
  });
  it("removes trailing zeroes from whole quantities", () => {
    expect(formatQuantity("400.000")).toBe("400");
  });

  it("keeps meaningful fractional precision", () => {
    expect(formatQuantity(12.5)).toBe("12.5");
    expect(formatQuantity(12.3456)).toBe("12.346");
  });

  it("handles empty, invalid, and negative values safely", () => {
    expect(formatQuantity(undefined)).toBe("0");
    expect(formatQuantity("not-a-number")).toBe("0");
    expect(formatQuantity(-2.25)).toBe("-2.25");
  });
});
