export type LedgerReportMovement = {
  inQty: number | string | null | undefined;
  damage: number | string | null | undefined;
  used: number | string | null | undefined;
  usedPrice?: number | string | null | undefined;
  damagePrice?: number | string | null | undefined;
  closingPrice?: number | string | null | undefined;
};

export type LedgerRangeTotals = { inQty: number; damage: number; used: number; usedPrice: number; damagePrice: number; closingPrice: number };

const numberOrZero = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

export function getLedgerRangeTotals(rows: readonly LedgerReportMovement[]) {
  return rows.reduce<LedgerRangeTotals>(
    (totals, row) => ({
      inQty: totals.inQty + numberOrZero(row.inQty),
      damage: totals.damage + numberOrZero(row.damage),
      used: totals.used + numberOrZero(row.used),
      usedPrice: totals.usedPrice + numberOrZero(row.usedPrice),
      damagePrice: totals.damagePrice + numberOrZero(row.damagePrice),
      closingPrice: totals.closingPrice + numberOrZero(row.closingPrice),
    }),
    { inQty: 0, damage: 0, used: 0, usedPrice: 0, damagePrice: 0, closingPrice: 0 },
  );
}
