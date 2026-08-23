import json
import re
import sys
import unicodedata
from pathlib import Path

production_path, packaging_path, items_path, output_path, summary_path = sys.argv[1:]

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def clean(text):
    text = unicodedata.normalize("NFKC", text).replace("\u200b", "")
    return re.sub(r"\s+", " ", text).strip()

def sql_num(value):
    if not re.fullmatch(r"-?\d+(?:\.\d+)?", str(value)):
        raise ValueError(f"invalid numeric value: {value!r}")
    return str(value)

items = load(items_path)
item_map = {}
for item in items:
    key = clean(item["name"])
    if key in item_map:
        raise SystemExit(f"duplicate destination item name: {key}")
    item_map[key] = item

all_rows = []
missing = []
for source_path, department, expected_type, expected_unit in [
    (production_path, "production", "raw_material", "g"),
    (packaging_path, "packaging", "packaging_material", "pcs"),
]:
    for day in load(source_path):
        for source_row in day["rows"]:
            source_name = clean(source_row["name"])
            source_unit = source_name.rsplit(" ", 1)[-1]
            item_name = source_name[: -(len(source_unit) + 1)] if source_unit in {"g", "pcs"} else source_name
            item = item_map.get(item_name)
            if not item:
                missing.append({"department": department, "date": day["date"], "sourceName": source_name, "normalizedName": item_name})
                continue
            if item["itemType"] != expected_type or item["unit"] != expected_unit:
                raise SystemExit(f"incompatible mapping for {source_name}: {item}")
            opening, in_qty, issued, return_qty, damage = map(sql_num, source_row["values"])
            all_rows.append({
                "date": day["date"],
                "department": department,
                "itemId": item["id"],
                "itemName": item["name"],
                "opening": opening if day["date"] == "2026-08-01" else "0",
                "inQty": in_qty,
                "issued": issued,
                "returnQty": return_qty,
                "damage": damage,
            })

if missing:
    Path(summary_path).write_text(json.dumps({"missing": missing}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    raise SystemExit(f"unmapped source rows: {len(missing)}; see {summary_path}")
if len(all_rows) != 20 * (44 + 69):
    raise SystemExit(f"expected 2260 rows, got {len(all_rows)}")

values = []
for row in all_rows:
    values.append(f"('{row['date']}', '{row['department']}', {row['itemId']}, {row['opening']}, {row['inQty']}, {row['issued']}, NULL, TRUE, {row['returnQty']}, {row['damage']}, NULL, 3)")
query = "INSERT INTO public.\"dailyStock\" (\"stockDate\", \"department\", \"itemId\", \"openingApproved\", \"inQty\", \"issued\", \"autoIssued\", \"manualIssued\", \"returnQty\", \"damage\", \"note\", \"createdBy\") VALUES\n" + ",\n".join(values) + "\nON CONFLICT (\"stockDate\", \"department\", \"itemId\") DO UPDATE SET \"openingApproved\" = CASE WHEN EXCLUDED.\"stockDate\" = '2026-08-01' THEN EXCLUDED.\"openingApproved\" ELSE public.\"dailyStock\".\"openingApproved\" END, \"inQty\" = EXCLUDED.\"inQty\", \"issued\" = EXCLUDED.\"issued\", \"autoIssued\" = NULL, \"manualIssued\" = TRUE, \"returnQty\" = EXCLUDED.\"returnQty\", \"damage\" = EXCLUDED.\"damage\", \"note\" = EXCLUDED.\"note\", \"createdBy\" = EXCLUDED.\"createdBy\";"

Path(output_path).write_text(json.dumps({"project_id": "npiifxjxwvxetanhbugk", "query": query}, ensure_ascii=False), encoding="utf-8")
summary = {
    "rows": len(all_rows),
    "dates": 20,
    "productionRows": sum(r["department"] == "production" for r in all_rows),
    "packagingRows": sum(r["department"] == "packaging" for r in all_rows),
    "openingRows": sum(r["date"] == "2026-08-01" for r in all_rows),
    "movementRows": sum(r["date"] != "2026-08-01" for r in all_rows),
    "manualIssuedRows": sum(r["department"] in {"production", "packaging"} for r in all_rows),
}
Path(summary_path).write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(summary))
