import { describe, expect, it } from "vitest";
import { getMobileMoreItems, isMobilePrimaryTab, mobileNavigationItems } from "./mobileNavigation";

describe("mobileNavigationItems", () => {
  it("keeps the four most frequent ERP destinations in the bottom navigation", () => {
    expect(mobileNavigationItems.map(item => item.value)).toEqual(["purchase", "production", "packaging", "reports"]);
  });

  it("routes less frequent workflows through the More menu", () => {
    expect(isMobilePrimaryTab("production")).toBe(true);
    expect(isMobilePrimaryTab("purchase")).toBe(true);
    expect(isMobilePrimaryTab("overview")).toBe(false);
    expect(isMobilePrimaryTab("approvals")).toBe(false);
  });

  it("removes Overview and every liquid primary destination from More", () => {
    expect(getMobileMoreItems([
      { value: "overview" }, { value: "purchase" }, { value: "production" }, { value: "packaging" }, { value: "reports" }, { value: "items" }, { value: "low-stock" },
    ]).map(item => item.value)).toEqual(["items", "low-stock"]);
  });
});
