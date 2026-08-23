import { calculateUsed, deriveSequentialStockRows } from "./calculations.js";

export type LowStockItem = {
  id: number;
  name: string;
  unit: string;
  itemType: string;
  active: boolean;
};

export type LowStockLedgerRow = {
  stockDate: string;
  department: "production" | "packaging";
  itemId: number;
  openingApproved: string | number;
  inQty: string | number;
  issued: string | number;
  returnQty: string | number;
  damage: string | number;
  autoIssued?: string | number | null;
  manualIssued?: boolean;
};

export function getLowStockItems(items: LowStockItem[], rows: LowStockLedgerRow[]) {
  const activeLedgerItems = items.filter(item => item.active && (item.itemType === "raw_material" || item.itemType === "packaging_material"));
  const effectiveRows = rows.map(row => ({
    ...row,
    issued: row.manualIssued ? row.issued : row.autoIssued ?? row.issued,
  }));
  const closingByItem = new Map<number, number>();
  for (const entry of deriveSequentialStockRows(effectiveRows)) closingByItem.set(entry.row.itemId, entry.closing);
  const usageByItem = new Map<number, { totalUsed: number; dayCount: number }>();
  for (const row of effectiveRows) {
    const current = usageByItem.get(row.itemId) ?? { totalUsed: 0, dayCount: 0 };
    current.totalUsed += calculateUsed({ opening: Number(row.openingApproved), inQty: Number(row.inQty), issued: Number(row.issued), returnQty: Number(row.returnQty), damage: Number(row.damage) });
    current.dayCount += 1;
    usageByItem.set(row.itemId, current);
  }
  return activeLedgerItems.map(item => {
    const currentStock = closingByItem.get(item.id) ?? 0;
    const usage = usageByItem.get(item.id) ?? { totalUsed: 0, dayCount: 0 };
    const averageUsed = usage.dayCount ? usage.totalUsed / usage.dayCount : 0;
    const threeDayThreshold = averageUsed * 3;
    return {
      itemId: item.id,
      item: item.name,
      unit: item.unit,
      department: item.itemType === "raw_material" ? "production" as const : "packaging" as const,
      currentStock,
      averageUsed,
      threeDayThreshold,
      shortfall: Math.max(0, threeDayThreshold - currentStock),
      status: currentStock < threeDayThreshold ? "low" as const : "healthy" as const,
    };
  }).filter(item => item.status === "low").sort((left, right) => right.shortfall - left.shortfall || left.item.localeCompare(right.item));
}
