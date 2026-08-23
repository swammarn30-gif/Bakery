import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel serverless ESM imports", () => {
  it("uses a Node-resolvable JavaScript extension for the low-stock calculation dependency", () => {
    const source = readFileSync(resolve(process.cwd(), "shared/lowStock.ts"), "utf8");

    expect(source).toContain('from "./calculations.js"');
  });
});
