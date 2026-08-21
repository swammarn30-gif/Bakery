export type ExportStockRow = {
  stockDate: string;
  itemId: number;
  openingApproved: string | number;
  inQty: string | number;
  issued: string | number;
  returnQty: string | number;
  damage: string | number;
  note?: string | null;
};

export type DateColumnExportRow = {
  Item: string;
  Field: string;
  [date: string]: string | number;
};

type ExportMetric = "Opening" | "In" | "Issued" | "Return" | "Damage" | "Used" | "Closing" | "Note";

function metricValue(row: ExportStockRow, field: ExportMetric): number | string {
  if (field === "Opening") return Number(row.openingApproved);
  if (field === "In") return Number(row.inQty);
  if (field === "Issued") return Number(row.issued);
  if (field === "Return") return Number(row.returnQty);
  if (field === "Damage") return Number(row.damage);
  if (field === "Used") return Number(row.issued) - Number(row.returnQty) - Number(row.damage);
  if (field === "Closing") return Number(row.openingApproved) + Number(row.inQty) + Number(row.returnQty) - Number(row.issued);
  return row.note ?? "";
}

export function dateColumnsBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function toDateColumnExportRows(rows: ExportStockRow[], nameOf: (itemId: number) => string, from: string, to: string): DateColumnExportRow[] {
  const dates = dateColumnsBetween(from, to);
  const byItem = new Map<number, { name: string; rows: Map<string, ExportStockRow> }>();
  for (const row of rows) {
    const item = byItem.get(row.itemId) ?? { name: nameOf(row.itemId), rows: new Map<string, ExportStockRow>() };
    item.rows.set(row.stockDate, row);
    byItem.set(row.itemId, item);
  }
  const fields: ExportMetric[] = ["Opening", "In", "Issued", "Return", "Damage", "Used", "Closing", "Note"];
  return Array.from(byItem.values()).flatMap(item => fields.map(field => {
    const result: DateColumnExportRow = { Item: item.name, Field: field };
    for (const date of dates) result[date] = item.rows.has(date) ? metricValue(item.rows.get(date)!, field) : "";
    return result;
  }));
}

export function departmentExportFilename(department: "production" | "packaging", from: string, to: string) {
  return `Bakery_${department}_${from}_to_${to}.xlsx`;
}
