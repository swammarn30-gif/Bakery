import { describe, expect, it } from "vitest";
import { isMobilePrimaryTab, mobileNavigationItems } from "./mobileNavigation";

describe("mobileNavigationItems", () => {
  it("keeps the four most frequent ERP destinations in the bottom navigation", () => {
    expect(mobileNavigationItems.map(item => item.value)).toEqual(["overview", "production", "packaging", "reports"]);
  });

  it("routes less frequent workflows through the More menu", () => {
    expect(isMobilePrimaryTab("production")).toBe(true);
    expect(isMobilePrimaryTab("purchase")).toBe(false);
    expect(isMobilePrimaryTab("approvals")).toBe(false);
  });
});
