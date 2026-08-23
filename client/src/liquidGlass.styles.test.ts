import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Liquid Glass ERP styling", () => {
  const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("keeps daily ledgers as a table-first, glass-styled mobile experience", () => {
    expect(styles).toContain(".compact-ledger-shell table thead");
    expect(styles).toContain(".compact-ledger-shell table td.sticky");
    expect(styles).toContain("nav[aria-label=\"Mobile primary navigation\"]");
  });

  it("keeps non-essential motion behind reduced-motion support", () => {
    expect(styles).toContain("@media (prefers-reduced-motion: no-preference)");
  });
});
