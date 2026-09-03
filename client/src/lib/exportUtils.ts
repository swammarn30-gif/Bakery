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

export type ExportItem = {
  id: number;
  name: string;
  unit: string;
};

export type DateColumnExportRow = {
  Item: string;
  Field: string;
  [date: string]: string | number;
};

export type GroupedDateExport = {
  dates: string[];
  fields: string[];
  rows: Array<{ item: string; unit: string; values: Record<string, string | number> }>;
};

type ExportMetric = "Opening" | "In" | "Issued" | "Return" | "Damage" | "Used" | "Closing" | "Note";

const fields: ExportMetric[] = ["Opening", "In", "Issued", "Return", "Damage", "Used", "Closing", "Note"];

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
  for (const row of sequentialExportRows(rows)) {
    const item = byItem.get(row.itemId) ?? { name: nameOf(row.itemId), rows: new Map<string, ExportStockRow>() };
    item.rows.set(row.stockDate, row);
    byItem.set(row.itemId, item);
  }
  return Array.from(byItem.values()).flatMap(item => fields.map(field => {
    const result: DateColumnExportRow = { Item: item.name, Field: field };
    for (const date of dates) result[date] = item.rows.has(date) ? metricValue(item.rows.get(date)!, field) : "";
    return result;
  }));
}

export function toDateGroupedExport(rows: ExportStockRow[], nameOf: (itemId: number) => string, unitOf: (itemId: number) => string, from: string, to: string, itemMaster: ExportItem[] = []): GroupedDateExport {
  const dates = dateColumnsBetween(from, to);
  const byItem = new Map<number, { item: string; unit: string; rows: Map<string, ExportStockRow> }>();
  // Seed from Item Master so a workbook never contains only headers when stock
  // rows are sparse, delayed, or temporarily unavailable from the query cache.
  for (const item of itemMaster) byItem.set(item.id, { item: item.name, unit: item.unit, rows: new Map<string, ExportStockRow>() });
  for (const row of sequentialExportRows(rows)) {
    const existing = byItem.get(row.itemId) ?? { item: nameOf(row.itemId), unit: unitOf(row.itemId), rows: new Map<string, ExportStockRow>() };
    existing.rows.set(row.stockDate, row);
    byItem.set(row.itemId, existing);
  }
  return {
    dates,
    fields,
    rows: Array.from(byItem.values()).map(item => {
      const values: Record<string, string | number> = {};
      for (const date of dates) for (const field of fields) values[`${date}|${field}`] = item.rows.has(date) ? metricValue(item.rows.get(date)!, field) : "";
      return { item: item.item, unit: item.unit, values };
    }),
  };
}

export function departmentExportFilename(department: "production" | "packaging", from: string, to: string) {
  return `Bakery_${department}_${from}_to_${to}.xlsx`;
}

export function isDepartmentExportReady(hasDepartmentRows: boolean, hasItemMaster: boolean, isFetching: boolean) {
  return hasDepartmentRows && hasItemMaster && !isFetching;
}

export type TransferDepartment = "production" | "packaging";

function importNumber(value: unknown): number {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function importText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

export function parseTransferWorkbookMatrix(matrix: unknown[][], department: TransferDepartment): Array<Record<string, unknown>> {
  const firstRow = matrix[0] ?? [];
  const firstCell = importText(firstRow[0]).toLowerCase();
  const isFlatDailyLedger = firstCell === "date" && importText(firstRow[2]).toLowerCase() === "item";
  if (isFlatDailyLedger) {
    const headers = firstRow.map(importText);
    return matrix.slice(1).filter(row => row.some(cell => importText(cell) !== "")).map(row => {
      const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
      return {
        Date: importText(record.Date),
        Department: importText(record.Department).toLowerCase() || department,
        Item: importText(record.Item),
        Unit: importText(record.Unit),
        Opening: importNumber(record.Opening),
        In: importNumber(record.In),
        Issued: importNumber(record.Issued),
        Return: importNumber(record.Return),
        Damage: importNumber(record.Damage),
        Note: importText(record.Note),
      };
    });
  }

  const dates = firstRow.slice(2).filter((value, index) => index % fields.length === 0).map(importText);
  const rows: Array<Record<string, unknown>> = [];
  for (const sourceRow of matrix.slice(2)) {
    const item = importText(sourceRow[0]);
    const unit = importText(sourceRow[1]);
    if (!item || !unit) continue;
    dates.forEach((date, dateIndex) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
      const offset = 2 + dateIndex * fields.length;
      const values = sourceRow.slice(offset, offset + fields.length);
      if (!values.some(value => importText(value) !== "")) return;
      const byField = Object.fromEntries(fields.map((field, fieldIndex) => [field, values[fieldIndex] ?? ""]));
      rows.push({
        Date: date,
        Department: department,
        Item: item,
        Unit: unit,
        Opening: importNumber(byField.Opening),
        In: importNumber(byField.In),
        Issued: importNumber(byField.Issued),
        Return: importNumber(byField.Return),
        Damage: importNumber(byField.Damage),
        Note: importText(byField.Note),
      });
    });
  }
  return rows;
}

export function reportExportFilename(department: TransferDepartment, itemName: string, from: string, to: string) {
  const safeItem = itemName.trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "item";
  return `Bakery_report_${department}_${safeItem}_${from}_to_${to}.xlsx`;
}

function sequentialExportRows(rows: ExportStockRow[]): ExportStockRow[] {
  const lastClosing = new Map<number, number>();
  return [...rows].sort((a, b) => a.stockDate.localeCompare(b.stockDate) || a.itemId - b.itemId).map(row => {
    const opening = lastClosing.has(row.itemId) ? lastClosing.get(row.itemId)! : Number(row.openingApproved ?? 0);
    const closing = opening + Number(row.inQty ?? 0) + Number(row.returnQty ?? 0) - Number(row.issued ?? 0);
    lastClosing.set(row.itemId, closing);
    return { ...row, openingApproved: opening };
  });
}
