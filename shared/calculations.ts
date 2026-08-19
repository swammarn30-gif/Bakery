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

export function normalizeDateRange(from: string, to: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error("Dates must use YYYY-MM-DD");
  if (from > to) throw new Error("From date must not be after To date");
  return { from, to };
}
