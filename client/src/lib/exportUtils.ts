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

export type DepartmentExportRow = {
  Date: string;
  Item: string;
  Opening: number;
  In: number;
  Issued: number;
  Return: number;
  Damage: number;
  Used: number;
  Closing: number;
  Note: string;
};

export function toDepartmentExportRows(rows: ExportStockRow[], nameOf: (itemId: number) => string): DepartmentExportRow[] {
  return rows.map(row => ({
    Date: row.stockDate,
    Item: nameOf(row.itemId),
    Opening: Number(row.openingApproved),
    In: Number(row.inQty),
    Issued: Number(row.issued),
    Return: Number(row.returnQty),
    Damage: Number(row.damage),
    Used: Number(row.issued) - Number(row.returnQty) - Number(row.damage),
    Closing: Number(row.openingApproved) + Number(row.inQty) + Number(row.returnQty) - Number(row.issued),
    Note: row.note ?? "",
  }));
}

export function departmentExportFilename(department: "production" | "packaging", from: string, to: string) {
  return `Bakery_${department}_${from}_to_${to}.xlsx`;
}
