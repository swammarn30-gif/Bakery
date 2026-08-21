import { describe, expect, it } from "vitest";
import { sortItemsByDisplayOrder } from "./db";

describe("item display order", () => {
  it("keeps legacy order ahead of alphabetical order and uses id as a stable tie-breaker", () => {
    const rows = [
      { id: 20, name: "Z item", displayOrder: 2 },
      { id: 3, name: "A item", displayOrder: 1 },
      { id: 2, name: "B item", displayOrder: 1 },
    ];

    expect(sortItemsByDisplayOrder(rows).map(row => row.id)).toEqual([2, 3, 20]);
    expect(rows.map(row => row.id)).toEqual([20, 3, 2]);
  });
});
