import { describe, expect, it } from "vitest";
import { isActiveLedgerItem } from "./Home";

describe("isActiveLedgerItem", () => {
  const production = { active: true, itemType: "raw_material" };
  const packaging = { active: true, itemType: "packaging_material" };
  const inactiveProduction = { active: false, itemType: "raw_material" };

  it("keeps active raw materials in the Production ledger only", () => {
    expect(isActiveLedgerItem(production, "production")).toBe(true);
    expect(isActiveLedgerItem(production, "packaging")).toBe(false);
  });

  it("keeps active packaging materials in the Packaging ledger only", () => {
    expect(isActiveLedgerItem(packaging, "packaging")).toBe(true);
    expect(isActiveLedgerItem(packaging, "production")).toBe(false);
  });

  it("excludes inactive items from both ledgers", () => {
    expect(isActiveLedgerItem(inactiveProduction, "production")).toBe(false);
    expect(isActiveLedgerItem(inactiveProduction, "packaging")).toBe(false);
  });
});
