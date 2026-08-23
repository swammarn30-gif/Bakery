import fs from "node:fs";

const [prodSourcePath, packSourcePath, destStockPath, destItemsPath, outputPath] = process.argv.slice(2);
if (!prodSourcePath || !packSourcePath || !destStockPath || !destItemsPath || !outputPath) {
  throw new Error("Usage: node compare-ledger-movements.mjs PROD PACK DEST_STOCK DEST_ITEMS OUT");
}
const parseJson = path => JSON.parse(fs.readFileSync(path, "utf8"));
const unwrap = path => {
  const outer = parseJson(path);
  const text = outer.result ?? "";
  const start = text.indexOf("\n[");
  const end = text.lastIndexOf("\n</untrusted-data-");
  if (start < 0 || end < 0) throw new Error(`Invalid Supabase result wrapper: ${path}`);
  return JSON.parse(text.slice(start + 1, end));
};
const normalizeName = value => String(value).replace(/\s+(?:g|pcs)$/i, "").trim();
const toNumber = value => Number(value ?? 0);
const closing = (opening, row) => opening + toNumber(row.inQty) - toNumber(row.issued) + toNumber(row.returnQty);
const sources = { production: parseJson(prodSourcePath), packaging: parseJson(packSourcePath) };
const destinationRows = unwrap(destStockPath);
const items = unwrap(destItemsPath);
const itemByKey = new Map(items.map(item => [`${normalizeName(item.name)}|${String(item.unit).toLowerCase()}`, item]));
const destinationByKey = new Map(destinationRows.map(row => [`${row.department}|${row.stockDate}|${row.itemId}`, row]));
const movementMismatches = [];
const missingMappings = [];
const effectiveNegativeClosings = [];
const perDepartment = {};
for (const [department, days] of Object.entries(sources)) {
  const byItem = new Map();
  let rowsChecked = 0;
  for (const day of days) {
    for (const sourceRow of day.rows) {
      const unit = sourceRow.name.match(/\s+(g|pcs)$/i)?.[1]?.toLowerCase() ?? "";
      const item = itemByKey.get(`${normalizeName(sourceRow.name)}|${unit}`);
      if (!item) {
        missingMappings.push({ department, date: day.date, name: sourceRow.name, unit });
        continue;
      }
      const dest = destinationByKey.get(`${department}|${day.date}|${item.id}`);
      if (!dest) {
        movementMismatches.push({ department, date: day.date, name: sourceRow.name, reason: "missing destination row" });
        continue;
      }
      const sourceValues = sourceRow.values.map(toNumber);
      const destinationValues = [dest.openingApproved, dest.inQty, dest.issued, dest.returnQty, dest.damage].map(toNumber);
      const fields = ["openingApproved", "inQty", "issued", "returnQty", "damage"];
      const fieldsToCompare = day.date === "2026-08-01" ? fields : fields.slice(1);
      for (const field of fieldsToCompare) {
        const index = fields.indexOf(field);
        if (sourceValues[index] !== destinationValues[index]) {
          movementMismatches.push({ department, date: day.date, itemId: item.id, name: sourceRow.name, field, source: sourceValues[index], destination: destinationValues[index] });
        }
      }
      const previous = byItem.get(item.id) ?? 0;
      const effectiveOpening = day.date === "2026-08-01" ? destinationValues[0] : previous;
      const effectiveClosing = closing(effectiveOpening, dest);
      if (effectiveClosing < 0) effectiveNegativeClosings.push({ department, date: day.date, itemId: item.id, name: sourceRow.name, opening: effectiveOpening, inQty: destinationValues[1], issued: destinationValues[2], returnQty: destinationValues[3], damage: destinationValues[4], closing: effectiveClosing });
      byItem.set(item.id, effectiveClosing);
      rowsChecked += 1;
    }
  }
  perDepartment[department] = { rowsChecked };
}
const result = { perDepartment, destinationRows: destinationRows.length, itemCount: items.length, missingMappings, movementMismatches, movementMismatchCount: movementMismatches.length, effectiveNegativeClosings, effectiveNegativeClosingCount: effectiveNegativeClosings.length };
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ ...perDepartment, destinationRows: result.destinationRows, missingMappings: result.missingMappings.length, movementMismatchCount: result.movementMismatchCount, effectiveNegativeClosingCount: result.effectiveNegativeClosingCount, outputPath }));
