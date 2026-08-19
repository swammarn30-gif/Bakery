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

export function calculateDepartmentIssued(orderQuantity: number, department: "production" | "packaging", recipe: { department: "production" | "packaging"; lines: Array<{ quantityPerBatch: number }> }, batchSize = 1) {
  if (recipe.department !== department) return 0;
  return recipe.lines.reduce((total, line) => total + calculateIssuedFromBom(orderQuantity, line.quantityPerBatch, batchSize), 0);
}

export const PURCHASE_UNITS = ["kg", "g", "viss", "pcs"] as const;
export type PurchaseUnit = typeof PURCHASE_UNITS[number];

export function toBaseQuantity(quantity: number, unit: PurchaseUnit) {
  if (!Number.isFinite(quantity) || quantity < 0) throw new Error("Quantity must be non-negative");
  if (unit === "kg") return quantity * 1000;
  if (unit === "viss") return quantity * 1600;
  return quantity;
}

export function baseUnitFor(unit: PurchaseUnit) {
  return unit === "pcs" ? "pcs" : "g";
}

export function normalizePurchase(quantity: number, unit: PurchaseUnit, totalValue: number, itemBaseUnit: "g" | "pcs" = baseUnitFor(unit)) {
  if (!Number.isFinite(totalValue) || totalValue < 0) throw new Error("Total value must be non-negative");
  if (itemBaseUnit === "pcs" && unit !== "pcs") throw new Error("pcs-base items must be purchased in pcs");
  if (itemBaseUnit === "g" && unit === "pcs") throw new Error("g-base items must be purchased in kg, g, or viss");
  const baseQuantity = toBaseQuantity(quantity, unit);
  if (baseQuantity <= 0) throw new Error("Quantity must be greater than zero");
  return { baseQuantity, baseUnit: itemBaseUnit, totalValue, baseUnitCost: totalValue / baseQuantity };
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

export function selectEffectiveRecipe<T extends { itemId: number; effectiveFrom: string; active: boolean }>(rows: T[], itemId: number, asOf: string) {
  return rows.filter(row => row.itemId === itemId && row.active && row.effectiveFrom <= asOf).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
}

export function enforceSingleActiveRecipe<T extends { id: number; itemId: number; active: boolean }>(rows: T[], recipeId: number, active = true) {
  const selected = rows.find(row => row.id === recipeId);
  if (!selected) return rows;
  return rows.map(row => ({ ...row, active: row.id === recipeId ? active : active && row.itemId === selected.itemId ? false : row.active }));
}

export function selectStockRowByItem<T extends { itemId: number }>(rows: T[], itemId: number) {
  return rows.find(row => row.itemId === itemId);
}

export function openingApprovalPresentation(row: { openingApproved: number; openingPending?: number | null }, decision?: "approved" | "rejected") {
  if (decision === "approved" && row.openingPending !== null && row.openingPending !== undefined) return { official: row.openingPending, pending: null, faded: false };
  if (decision === "rejected") return { official: row.openingApproved, pending: null, faded: false };
  return { official: row.openingApproved, pending: row.openingPending ?? null, faded: row.openingPending !== null && row.openingPending !== undefined };
}

export function parseRecipeLinesJson(value: string) {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { return { valid: false as const, error: "Recipe lines must be valid JSON" }; }
  if (!Array.isArray(parsed) || parsed.length === 0) return { valid: false as const, error: "Recipe lines must be a non-empty array" };
  const lines = parsed.map((line) => ({ materialItemId: Number((line as Record<string, unknown>).materialItemId), quantityPerBatch: Number((line as Record<string, unknown>).quantityPerBatch), unit: String((line as Record<string, unknown>).unit ?? "") }));
  if (lines.some(line => !Number.isInteger(line.materialItemId) || line.materialItemId <= 0 || !Number.isFinite(line.quantityPerBatch) || line.quantityPerBatch <= 0 || !line.unit)) return { valid: false as const, error: "Each recipe line needs a material, positive quantity, and unit" };
  return { valid: true as const, lines };
}

export function applyRecipeEdit<T extends { effectiveFrom: string; note?: string | null }>(existing: T, effectiveFrom: string, note: string | undefined, lines: unknown[]) {
  return { ...existing, effectiveFrom, note: note ?? null, lines };
}

export function safeRecipeLinesUpdate<T>(existing: T[], payload: string, parse = parseRecipeLinesJson) {
  const parsed = parse(payload);
  return parsed.valid ? { valid: true as const, lines: parsed.lines } : { valid: false as const, lines: existing, error: parsed.error };
}

export function migrateBackupSnapshot(snapshot: unknown, currentVersion = 1) {
  if (!snapshot || typeof snapshot !== "object") return { valid: false as const, error: "Backup must be an object" };
  const record = snapshot as Record<string, unknown>;
  if (record.schemaVersion === currentVersion) return { valid: true as const, snapshot: record };
  if (record.schemaVersion === 0) return { valid: true as const, snapshot: { ...record, schemaVersion: currentVersion, approvals: record.approvals ?? [], importBatches: record.importBatches ?? [] } };
  return { valid: false as const, error: `Unsupported schema version: ${String(record.schemaVersion)}` };
}

export function validateBackupSnapshot(snapshot: unknown, supportedVersion = 1) {
  if (!snapshot || typeof snapshot !== "object") return { valid: false, error: "Backup must be an object" };
  const record = snapshot as Record<string, unknown>;
  if (record.schemaVersion !== supportedVersion) return { valid: false, error: `Unsupported schema version: ${String(record.schemaVersion)}` };
  const collections = ["items", "purchases", "dailyStock", "orders", "sales", "shops", "recipes", "recipeLines", "saleShopLines", "stockAdjustments"];
  const missing = collections.filter(key => !Array.isArray(record[key]));
  return missing.length ? { valid: false, error: `Missing collections: ${missing.join(", ")}` } : { valid: true as const };
}

export function resolveIssuedQuantity(autoIssued: number, savedIssued: number, manualIssued: boolean) {
  return manualIssued ? savedIssued : autoIssued;
}

export function recalculateSequentialOpenings<T extends { itemId: number; date: string; opening: number; closing: number }>(rows: T[], fallbackOpening = 0) {
  const lastClosing = new Map<number, number>();
  return [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.itemId - b.itemId).map(row => {
    const opening = lastClosing.has(row.itemId) ? lastClosing.get(row.itemId)! : row.opening ?? fallbackOpening;
    const next = { ...row, opening };
    lastClosing.set(row.itemId, row.closing);
    return next;
  });
}

export function normalizeDateRange(from: string, to: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error("Dates must use YYYY-MM-DD");
  if (from > to) throw new Error("From date must not be after To date");
  return { from, to };
}
