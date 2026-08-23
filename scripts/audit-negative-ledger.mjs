import fs from "node:fs";

const [productionPath, packagingPath, destinationPath, outputPath] = process.argv.slice(2);
if (!productionPath || !packagingPath || !destinationPath || !outputPath) {
  throw new Error("Usage: node audit-negative-ledger.mjs PROD PACK DEST OUT");
}
const readJson = path => JSON.parse(fs.readFileSync(path, "utf8"));
const readSource = path => {
  const value = readJson(path);
  if (!Array.isArray(value)) throw new Error(`Invalid source array: ${path}`);
  return value;
};
const unwrapResult = path => {
  const outer = readJson(path);
  const text = outer.result ?? "";
  const start = text.indexOf("\n[");
  const end = text.lastIndexOf("\n</untrusted-data-");
  if (start < 0 || end < 0) throw new Error(`Could not locate result array in ${path}`);
  return JSON.parse(text.slice(start + 1, end));
};
const closing = ({ opening, inQty, issued, returnQty, damage }) =>
  Number(opening) + Number(inQty) - Number(issued) + Number(returnQty) - Number(damage);
const sources = {
  production: readSource(productionPath),
  packaging: readSource(packagingPath),
};
const destination = unwrapResult(destinationPath);
const negatives = [];
const sourceNegativeClosings = [];
for (const [department, days] of Object.entries(sources)) {
  for (const day of days) {
    for (const row of day.rows) {
      const [opening, inQty, issued, returnQty, damage] = row.values.map(Number);
      const value = closing({ opening, inQty, issued, returnQty, damage });
      if (value < 0) sourceNegativeClosings.push({ department, date: day.date, name: row.name, closing: value, values: row.values });
    }
  }
}
for (const row of destination) {
  const value = closing(row);
  if (value < 0) negatives.push({ ...row, calculatedClosing: value });
}
const byDept = Object.fromEntries(Object.entries(sources).map(([department, days]) => [department, { dates: days.length, rows: days.reduce((n, day) => n + day.rows.length, 0) }]));
const result = {
  sourceSummary: byDept,
  destinationRows: destination.length,
  sourceNegativeClosings,
  destinationNegativeRows: negatives,
  destinationNegativeCount: negatives.length,
  sourceNegativeCount: sourceNegativeClosings.length,
};
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ sourceNegativeCount: result.sourceNegativeCount, destinationNegativeCount: result.destinationNegativeCount, destinationRows: result.destinationRows, outputPath }));
