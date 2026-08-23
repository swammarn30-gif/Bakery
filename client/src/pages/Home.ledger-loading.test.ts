import { describe, expect, it } from "vitest";
import { getLedgerViewState } from "./Home";

describe("getLedgerViewState", () => {
  it("shows a skeleton only for the first request without usable data", () => {
    expect(getLedgerViewState({ itemsLoading: true, rowsLoading: true, itemsError: false, rowsError: false, hasItemsData: false, hasRowsData: false, activeItemCount: 0 })).toBe("loading");
  });

  it("keeps the existing ledger visible while the next date is fetching", () => {
    expect(getLedgerViewState({ itemsLoading: false, rowsLoading: true, itemsError: false, rowsError: false, hasItemsData: true, hasRowsData: true, activeItemCount: 70 })).toBe("ready");
  });

  it("never presents the misleading empty-item state while a request is loading", () => {
    expect(getLedgerViewState({ itemsLoading: false, rowsLoading: true, itemsError: false, rowsError: false, hasItemsData: true, hasRowsData: false, activeItemCount: 70 })).toBe("loading");
  });

  it("shows a recoverable error state rather than an indefinite skeleton", () => {
    expect(getLedgerViewState({ itemsLoading: false, rowsLoading: false, itemsError: false, rowsError: true, hasItemsData: true, hasRowsData: false, activeItemCount: 70 })).toBe("error");
  });
});
