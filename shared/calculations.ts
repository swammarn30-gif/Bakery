export type StockInputs = { opening: number; inQty: number; issued: number; returnQty: number; damage: number };

export function calculateUsed({ issued, returnQty, damage }: StockInputs) {
  return issued - returnQty - damage;
}

export function calculateClosing({ opening, inQty, issued, returnQty }: StockInputs) {
  return opening + inQty + returnQty - issued;
}

export function calculateStockRow(input: StockInputs) {
  return { used: calculateUsed(input), closing: calculateClosing(input) };
}

export function calculateSaleClosing(opening: number, produce: number, sell: number) {
  return opening + produce - sell;
}

export function calculateIssuedFromBom(orderQuantity: number, quantityPerBatch: number, batchSize = 1) {
  if (batchSize <= 0) throw new Error("batchSize must be greater than zero");
  return (orderQuantity / batchSize) * quantityPerBatch;
}

export function weightedAverageCost(purchases: Array<{ quantity: number; unitCost: number }>, carriedCost = 0) {
  const valid = purchases.filter(p => p.quantity > 0);
  const quantity = valid.reduce((sum, p) => sum + p.quantity, 0);
  if (quantity === 0) return carriedCost;
  const value = valid.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
  return value / quantity;
}

export function valueOf(quantity: number, averageCost: number) {
  return quantity * averageCost;
}

export function sumShopQuantities(lines: Array<{ quantity: number }>) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function saleRowKey(saleDate: string, itemId: number) {
  return `${saleDate}:${itemId}`;
}

export function aggregateSaleRows(rows: Array<{ saleDate: string; itemId: number; opening: number; produce: number; shopLines: Array<{ quantity: number }> }>) {
  const byKey = new Map<string, { saleDate: string; itemId: number; opening: number; produce: number; sell: number; closing: number }>();
  for (const row of rows) {
    const sell = sumShopQuantities(row.shopLines);
    byKey.set(saleRowKey(row.saleDate, row.itemId), { saleDate: row.saleDate, itemId: row.itemId, opening: row.opening, produce: row.produce, sell, closing: row.opening + row.produce - sell });
  }
  return Array.from(byKey.values());
}

export function carryForwardOpening(previousApprovedClosing: number | null | undefined, fallback = 0) {
  return previousApprovedClosing === null || previousApprovedClosing === undefined ? fallback : previousApprovedClosing;
}

export const STANDARD_IMPORT_COLUMNS = ["Date", "Department", "Item", "Unit", "Opening", "In", "Issued", "Return", "Damage", "Note"] as const;

export function validateImportRows(rows: Array<Record<string, unknown>>, approvedKeys: Set<string> = new Set()) {
  const errors: string[] = []; const seen = new Set<string>();
  rows.forEach((row, index) => { const key = `${String(row.Date ?? "")}|${String(row.Department ?? "")}|${String(row.Item ?? "")}`; if (!row.Date || !row.Department || !row.Item || !row.Unit) errors.push(`Row ${index + 2}: Date, Department, Item, and Unit are required`); if (seen.has(key)) errors.push(`Row ${index + 2}: duplicate row`); if (approvedKeys.has(key)) errors.push(`Row ${index + 2}: approved data cannot be overwritten`); seen.add(key); });
  return { valid: errors.length === 0, errors };
}

export function validateBackupSnapshot(snapshot: unknown, supportedVersion = 1) {
  if (!snapshot || typeof snapshot !== "object") return { valid: false, error: "Backup must be an object" };
  const record = snapshot as Record<string, unknown>;
  if (record.schemaVersion !== supportedVersion) return { valid: false, error: `Unsupported schema version: ${String(record.schemaVersion)}` };
  const collections = ["items", "purchases", "dailyStock", "orders", "sales", "shops", "recipes", "stockAdjustments"];
  const missing = collections.filter(key => !Array.isArray(record[key]));
  return missing.length ? { valid: false, error: `Missing collections: ${missing.join(", ")}` } : { valid: true as const };
}

export function normalizeDateRange(from: string, to: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error("Dates must use YYYY-MM-DD");
  if (from > to) throw new Error("From date must not be after To date");
  return { from, to };
}
