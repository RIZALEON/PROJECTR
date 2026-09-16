#!/usr/bin/env bash
# PROJECT Я — restore live seat from official template registry
# Signature: RIZALBOT🤖 / CoS
set -euo pipefail

YBOT_ROOT="${YBOT_ROOT:-/Users/rizal/Documents/ЯBOT}"
INDEX="${YBOT_ROOT}/official-templates/index.json"
LIVE="${YBOT_ROOT}/ЯBOT"
REQUESTED_ID="${1:-}"

if [[ ! -f "$INDEX" ]]; then
  echo "FATAL: missing registry $INDEX" >&2
  exit 1
fi

pick_template() {
  local id="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$INDEX" "$id" <<'PY'
import json,sys
index_path, wanted = sys.argv[1], sys.argv[2]
data = json.load(open(index_path))
templates = data.get("templates") or data.get("official") or data
if not isinstance(templates, list):
    raise SystemExit("index.json: expected templates list")
chosen = None
if wanted:
    for t in templates:
        if t.get("id") == wanted:
            chosen = t
            break
    if not chosen:
        raise SystemExit(f"template id not found: {wanted}")
else:
    official = [t for t in templates if t.get("official")]
    recent = [t for t in official if t.get("most_recent")]
    if recent:
        chosen = recent[-1]
    elif official:
        chosen = official[-1]
    else:
        chosen = templates[-1]
path = chosen.get("path") or chosen["id"]
print(chosen["id"])
print(path)
PY
  else
    echo "FATAL: python3 required to read index.json" >&2
    exit 1
  fi
}

mapfile -t PICK < <(pick_template "$REQUESTED_ID")
TID="${PICK[0]}"
TPATH="${PICK[1]}"

if [[ "$TPATH" = /* ]]; then
  PACK="$TPATH"
elif [[ -d "${YBOT_ROOT}/official-templates/${TPATH}" ]]; then
  PACK="${YBOT_ROOT}/official-templates/${TPATH}"
elif [[ -d "${YBOT_ROOT}/${TPATH}" ]]; then
  PACK="${YBOT_ROOT}/${TPATH}"
else
  PACK="${YBOT_ROOT}/official-templates/${TID}"
fi

SRC="${PACK}/source-project/ЯBOT"
if [[ ! -d "$SRC" ]]; then
  echo "FATAL: restore mirror missing: $SRC" >&2
  exit 1
fi

mkdir -p "$LIVE"
echo "== RESPAWN restoring template: $TID =="
echo "    from: $SRC"
echo "    to:   $LIVE"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude DerivedData \
    --exclude .git \
    --exclude build \
    --exclude '*.xcuserstate' \
    "$SRC/" "$LIVE/"
else
  # fallback without rsync
  find "$LIVE" -mindepth 1 -maxdepth 1 ! -name DerivedData ! -name .git ! -name build -exec rm -rf {} +
  cp -a "$SRC"/. "$LIVE"/
fi

echo "== Restored into live seat =="
ls -la "$LIVE" | head -40
echo "OK ya-respawn $TID → $LIVE"
exit 0
