import fs from "node:fs";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const expectedRows = Number(process.argv[4] ?? 0);
if (!inputPath || !outputPath) throw new Error("Usage: node parse-source-ledger.mjs INPUT OUTPUT [EXPECTED_ROWS]");
const raw = fs.readFileSync(inputPath, "utf8");
const quotedJson = raw.trim();
if (!quotedJson.startsWith('"')) throw new Error("Browser console JSON string not found");
const data = JSON.parse(JSON.parse(quotedJson));
if (!Array.isArray(data) || data.length !== 20) throw new Error(`Expected 20 dates, got ${data.length}`);
for (const day of data) {
  if (!/^2026-08-(0[1-9]|1\d|20)$/.test(day.date)) throw new Error(`Unexpected date ${day.date}`);
  if (!Array.isArray(day.rows) || (expectedRows > 0 && day.rows.length !== expectedRows)) throw new Error(`${day.date}: expected ${expectedRows} rows, got ${day.rows?.length}`);
  for (const row of day.rows) {
    if (!row.name || !Array.isArray(row.values) || row.values.length !== 5) throw new Error(`${day.date}: malformed row`);
    for (const value of row.values) if (value === "" || Number.isNaN(Number(value))) throw new Error(`${day.date}/${row.name}: malformed quantity ${value}`);
  }
}
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n");
console.log(JSON.stringify({ dates: data.length, rowsPerDate: data[0].rows.length, outputPath }));
