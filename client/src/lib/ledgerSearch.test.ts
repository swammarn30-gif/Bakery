import { describe, expect, it } from "vitest";
import { filterLedgerItemsByName } from "./ledgerSearch";

describe("filterLedgerItemsByName", () => {
  const items = [{ name: "Flour" }, { name: "Cake Box" }, { name: "Sticker" }];

  it("keeps all ledger items when no search text is supplied", () => {
    expect(filterLedgerItemsByName(items, "  ")).toEqual(items);
  });

  it("filters item rows case-insensitively without changing their order", () => {
    expect(filterLedgerItemsByName(items, "CAKE")).toEqual([{ name: "Cake Box" }]);
  });
});
