import { deriveSequentialStockRows } from "./calculations";

export type LowStockItem = {
  id: number;
  name: string;
  unit: string;
  itemType: string;
  active: boolean;
  minimumStock: string | number;
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
  return activeLedgerItems.map(item => {
    const minimumStock = Number(item.minimumStock ?? 0);
    const currentStock = closingByItem.get(item.id) ?? 0;
    return {
      itemId: item.id,
      item: item.name,
      unit: item.unit,
      department: item.itemType === "raw_material" ? "production" as const : "packaging" as const,
      currentStock,
      minimumStock,
      shortfall: Math.max(0, minimumStock - currentStock),
      status: currentStock <= minimumStock ? "low" as const : "healthy" as const,
    };
  }).filter(item => item.status === "low").sort((left, right) => right.shortfall - left.shortfall || left.item.localeCompare(right.item));
}
