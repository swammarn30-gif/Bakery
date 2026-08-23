import { describe, expect, it } from "vitest";
import { mergeLedgerDraft, type LedgerDraft } from "./ledgerDraft";

const row: LedgerDraft = {
  opening: "773",
  inQty: "",
  issued: "",
  returnQty: "",
  damage: "",
  pendingOpening: "",
  note: "",
  manualIssued: false,
};

describe("mergeLedgerDraft", () => {
  it("retains earlier spreadsheet edits when later cells in the same row change", () => {
    const afterIssued = mergeLedgerDraft(row, { issued: "50", manualIssued: true });
    const afterReturn = mergeLedgerDraft(afterIssued, { returnQty: "14" });
    const afterDamage = mergeLedgerDraft(afterReturn, { damage: "3" });

    expect(afterDamage).toEqual({
      ...row,
      issued: "50",
      returnQty: "14",
      damage: "3",
      manualIssued: true,
    });
  });
});
