import json
import re
import sys

input_path, output_path = sys.argv[1:3]
with open(input_path, encoding="utf-8") as f:
    envelope = json.load(f)
text = envelope.get("result", "")
match = re.search(r"(\[\s*\{.*\}\s*\])", text, re.S)
if not match:
    raise SystemExit("No structured Item Master array found")
rows = json.loads(match.group(1))
if not isinstance(rows, list) or not rows:
    raise SystemExit("Item Master array is empty")
for row in rows:
    if not all(key in row for key in ("id", "name", "unit", "itemType", "active")):
        raise SystemExit(f"Malformed Item Master row: {row}")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(json.dumps({"items": len(rows), "production": sum(r["itemType"] == "raw_material" for r in rows), "packaging": sum(r["itemType"] == "packaging_material" for r in rows), "finished": sum(r["itemType"] == "finished_good" for r in rows)}))
