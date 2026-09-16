#!/usr/bin/env bash
# Run ON rizals-MacBook-Neo (Shell + machineId 55d92eb0-0ce0-4959-b297-440d80e59e38)
# After parent CopyFromBox of APP-TEMPLATE-0.1.tgz to ~/Documents/
set -euo pipefail
TGZ="${1:-/Users/rizal/Documents/APP-TEMPLATE-0.1.tgz}"
NAME="APP-TEMPLATE-0.1"
YBOT="/Users/rizal/Documents/ЯBOT"
PRX="/Users/rizal/Documents/PROJECTRXCODE"
ICLOUD="/Users/rizal/Library/Mobile Documents/com~apple~CloudDocs/Я"

tmpdir=$(mktemp -d)
tar -xzf "$TGZ" -C "$tmpdir"
SRC="$tmpdir/$NAME"
[[ -d "$SRC" ]] || { echo "FATAL: pack missing in tgz"; exit 1; }

# Prefer refresh FROM live ЯBOT into pack if live exists
if [[ -d "$YBOT/ЯBOT" ]]; then
  echo "== refreshing pack from live ЯBOT =="
  mkdir -p "$SRC/source" "$SRC/Fonts" "$SRC/Assets.xcassets" "$SRC/source-project/ЯBOT"
  for f in "$YBOT/ЯBOT"/*.swift "$YBOT/ЯBOT/Info.plist"; do
    [[ -f "$f" ]] && cp -f "$f" "$SRC/source/" && cp -f "$f" "$SRC/source-project/ЯBOT/"
  done
  [[ -d "$YBOT/ЯBOT/Fonts" ]] && rsync -a "$YBOT/ЯBOT/Fonts/" "$SRC/Fonts/" && rsync -a "$YBOT/ЯBOT/Fonts/" "$SRC/source-project/ЯBOT/Fonts/"
  [[ -d "$YBOT/ЯBOT/Assets.xcassets" ]] && rsync -a --delete "$YBOT/ЯBOT/Assets.xcassets/" "$SRC/Assets.xcassets/" && rsync -a --delete "$YBOT/ЯBOT/Assets.xcassets/" "$SRC/source-project/ЯBOT/Assets.xcassets/"
fi

mkdir -p "$YBOT/official-templates" "$PRX/official-templates"
rm -rf "$YBOT/official-templates/$NAME" "$PRX/official-templates/$NAME" "$YBOT/$NAME" "$PRX/$NAME"
rsync -a "$SRC/" "$YBOT/official-templates/$NAME/"
rsync -a "$SRC/" "$PRX/official-templates/$NAME/"
rsync -a "$SRC/" "$YBOT/$NAME/"
rsync -a "$SRC/" "$PRX/$NAME/"

# registry
if [[ -f "$tmpdir/$NAME/../index.json" ]]; then
  :
fi
# write/merge index on Mac
python3 - <<'PY'
import json, pathlib
paths = [
  pathlib.Path("/Users/rizal/Documents/ЯBOT/official-templates/index.json"),
  pathlib.Path("/Users/rizal/Documents/PROJECTRXCODE/official-templates/index.json"),
]
index = {
  "updated": "2026-09-15",
  "timezone": "America/Denver",
  "templates": [
    {"id": "AESTHETIC-TEMPLATE-CLAY-2026-09-15", "path": "AESTHETIC-TEMPLATE-CLAY-2026-09-15", "official": True},
    {"id": "APP-TEMPLATE-0.1", "path": "APP-TEMPLATE-0.1", "official": True, "most_recent": True},
  ],
}
for p in paths:
  p.parent.mkdir(parents=True, exist_ok=True)
  p.write_text(json.dumps(index, indent=2) + "\n")
  print("wrote", p)
PY

# ensure aesthetic present under official-templates if available
if [[ -d "$YBOT/AESTHETIC-TEMPLATE-CLAY-2026-09-15" && ! -d "$YBOT/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15" ]]; then
  rsync -a "$YBOT/AESTHETIC-TEMPLATE-CLAY-2026-09-15/" "$YBOT/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15/"
fi
if [[ -d "$PRX/AESTHETIC-TEMPLATE-CLAY-2026-09-15" && ! -d "$PRX/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15" ]]; then
  rsync -a "$PRX/AESTHETIC-TEMPLATE-CLAY-2026-09-15/" "$PRX/official-templates/AESTHETIC-TEMPLATE-CLAY-2026-09-15/"
fi

cp -f "$SRC/ya-respawn.sh" "$YBOT/ya-respawn.sh"

# HARDCODE — living cover USER MANUAL always rides
for root in "$YBOT" "$PRX" "$YBOT/official-templates/$NAME" "$PRX/official-templates/$NAME" "$YBOT/$NAME" "$PRX/$NAME"; do
  mkdir -p "$root"
  [[ -f "$SRC/USER-MANUAL.pdf" ]] && cp -f "$SRC/USER-MANUAL.pdf" "$root/USER-MANUAL.pdf"
  [[ -f "$SRC/USER-MANUAL.md" ]] && cp -f "$SRC/USER-MANUAL.md" "$root/USER-MANUAL.md"
done
# also aesthetic pack if present
for aes in AESTHETIC-TEMPLATE-CLAY-2026-09-15; do
  for root in "$YBOT/official-templates/$aes" "$PRX/official-templates/$aes" "$YBOT/$aes" "$PRX/$aes"; do
    if [[ -d "$root" || -d "$(dirname "$root")" ]]; then
      mkdir -p "$root" 2>/dev/null || true
      [[ -f "$SRC/USER-MANUAL.pdf" ]] && cp -f "$SRC/USER-MANUAL.pdf" "$root/USER-MANUAL.pdf" 2>/dev/null || true
      [[ -f "$SRC/USER-MANUAL.md" ]] && cp -f "$SRC/USER-MANUAL.md" "$root/USER-MANUAL.md" 2>/dev/null || true
    fi
  done
done

chmod +x "$YBOT/ya-respawn.sh" "$YBOT/official-templates/$NAME/ya-respawn.sh"

OUT_TGZ="$YBOT/${NAME}.tgz"
tar -czf "$OUT_TGZ" -C "$(dirname "$SRC")" "$NAME"
cp -f "$OUT_TGZ" "$PRX/${NAME}.tgz"

if [[ -d "$(dirname "$ICLOUD")" ]]; then
  mkdir -p "$ICLOUD"
  rsync -a "$SRC/" "$ICLOUD/$NAME/" || true
  cp -f "$OUT_TGZ" "$ICLOUD/${NAME}.tgz" || true
fi

ls -la "$YBOT/official-templates/$NAME" "$YBOT/$NAME" "$PRX/$NAME" "$OUT_TGZ" "$YBOT/ya-respawn.sh" "$YBOT/official-templates/index.json"
echo "OK mac seats + twins for APP-TEMPLATE-0.1"
rm -rf "$tmpdir"
