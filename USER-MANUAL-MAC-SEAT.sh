#!/usr/bin/env bash
# Run ON rizals-MacBook-Neo (Shell + machineId 55d92eb0-0ce0-4959-b297-440d80e59e38)
# After parent CopyFromBox of USER-MANUAL.pdf / .md / ya-respawn.sh / APP-TEMPLATE-0.1.tgz
set -euo pipefail
YBOT="/Users/rizal/Documents/ЯBOT"
PRX="/Users/rizal/Documents/PROJECTRXCODE"
SRC_PDF="${1:-/Users/rizal/Documents/USER-MANUAL.pdf}"
# Prefer Downloads candidate if Documents copy missing
if [[ ! -f "$SRC_PDF" && -f /Users/rizal/Downloads/R_OS_USER_GIVER_MANUAL_680.pdf ]]; then
  SRC_PDF=/Users/rizal/Downloads/R_OS_USER_GIVER_MANUAL_680.pdf
fi
SRC_MD="${2:-/Users/rizal/Documents/USER-MANUAL.md}"
mkdir -p "$YBOT/official-templates/APP-TEMPLATE-0.1" \
         "$YBOT/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15" \
         "$PRX/official-templates/APP-TEMPLATE-0.1" \
         "$PRX/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15" \
         "$YBOT/APP-TEMPLATE-0.1" "$PRX/APP-TEMPLATE-0.1"

for root in \
  "$YBOT" \
  "$PRX" \
  "$YBOT/official-templates/APP-TEMPLATE-0.1" \
  "$PRX/official-templates/APP-TEMPLATE-0.1" \
  "$YBOT/APP-TEMPLATE-0.1" \
  "$PRX/APP-TEMPLATE-0.1" \
  "$YBOT/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15" \
  "$PRX/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15"
do
  mkdir -p "$root"
  [[ -f "$SRC_PDF" ]] && cp -f "$SRC_PDF" "$root/USER-MANUAL.pdf"
  [[ -f "$SRC_MD" ]] && cp -f "$SRC_MD" "$root/USER-MANUAL.md"
done

if [[ -f /Users/rizal/Documents/ya-respawn.sh ]]; then
  cp -f /Users/rizal/Documents/ya-respawn.sh "$YBOT/ya-respawn.sh"
  chmod +x "$YBOT/ya-respawn.sh"
elif [[ -f "$YBOT/official-templates/APP-TEMPLATE-0.1/ya-respawn.sh" ]]; then
  cp -f "$YBOT/official-templates/APP-TEMPLATE-0.1/ya-respawn.sh" "$YBOT/ya-respawn.sh"
  chmod +x "$YBOT/ya-respawn.sh"
fi

# merge index notes if python available
python3 - <<'PY'
import json, pathlib
note = "HARDCODE: USER-MANUAL.pdf (+ USER-MANUAL.md) always rides every transfer/upgrade/offload/handoff/pack. Living cover — fold INTO it, never beside. ya-respawn restores manuals from most_recent official template. Я KOMMAND 0 = RESPAWN."
um = {"pdf": "USER-MANUAL.pdf", "md": "USER-MANUAL.md", "always_rides": True}
index = {
  "updated": "2026-09-15",
  "timezone": "America/Denver",
  "notes": note,
  "user_manual": um,
  "templates": [
    {"id": "AESTHETIC-TEMPLATE-CLAY-2026-09-15", "path": "AESTHETIC-TEMPLATE-CLAY-2026-09-15", "official": True},
    {"id": "APP-TEMPLATE-0.1", "path": "APP-TEMPLATE-0.1", "official": True, "most_recent": True},
  ],
}
for p in [
  pathlib.Path("/Users/rizal/Documents/ЯBOT/official-templates/index.json"),
  pathlib.Path("/Users/rizal/Documents/PROJECTRXCODE/official-templates/index.json"),
]:
  p.parent.mkdir(parents=True, exist_ok=True)
  p.write_text(json.dumps(index, indent=2) + "\n")
  print("wrote", p)
PY

ls -la "$YBOT/USER-MANUAL.pdf" "$YBOT/USER-MANUAL.md" "$YBOT/ya-respawn.sh" "$YBOT/official-templates/APP-TEMPLATE-0.1/USER-MANUAL.pdf"
echo OK USER-MANUAL Mac seat
