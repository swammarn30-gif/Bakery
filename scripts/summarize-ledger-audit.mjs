import fs from "node:fs";
const input = process.argv[2];
if (!input) throw new Error("Usage: node summarize-ledger-audit.mjs INPUT");
const value = JSON.parse(fs.readFileSync(input, "utf8"));
const byDepartment = {};
const byDate = {};
for (const row of value.effectiveNegativeClosings) {
  byDepartment[row.department] = (byDepartment[row.department] ?? 0) + 1;
  byDate[`${row.department}|${row.date}`] = (byDate[`${row.department}|${row.date}`] ?? 0) + 1;
}
console.log(JSON.stringify({
  destinationRows: value.destinationRows,
  perDepartment: value.perDepartment,
  itemCount: value.itemCount,
  missingMappings: value.missingMappings.length,
  movementMismatchCount: value.movementMismatchCount,
  effectiveNegativeClosingCount: value.effectiveNegativeClosingCount,
  negativeByDepartment: byDepartment,
  negativeByDate: byDate,
  examples: value.effectiveNegativeClosings.slice(0, 12),
}, null, 2));
