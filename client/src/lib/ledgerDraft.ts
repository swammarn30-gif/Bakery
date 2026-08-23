export type LedgerDraft = {
  opening: string;
  inQty: string;
  issued: string;
  returnQty: string;
  damage: string;
  pendingOpening: string;
  note: string;
  manualIssued: boolean;
};

/** Preserve all prior fields when one cell in a spreadsheet row changes. */
export function mergeLedgerDraft(current: LedgerDraft, patch: Partial<LedgerDraft>): LedgerDraft {
  return { ...current, ...patch };
}
