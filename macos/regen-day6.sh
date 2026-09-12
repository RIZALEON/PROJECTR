#!/bin/bash
# Day-6: 1) find mind dump  2) copy to Drive sync folder  3) remind Xcode Play
# Never silent-install. Never git heart.gguf / llama.xcframework.
set -euo pipefail

ROOT="${YA_ROOT:-$HOME/Documents/PROJECTRXCODE}"
PROJ="$ROOT/ios/YaAim.xcodeproj"
TEAM="${YA_TEAM:-88HACKXHZL}"
STAMP="$(date +%Y-%m-%d)"
DRIVE_FOLDER_URL="https://drive.google.com/drive/folders/1nlsYA64RRCxoaidboYS16rd_0KuU60d7"

echo "=== Я day-6 DUMP then regen $(date) ==="

# --- 1. locate newest mind dump on this Mac ---
SEARCH_DIRS=(
  "$HOME/Downloads"
  "$HOME/Desktop"
  "$HOME/Documents"
  "$HOME/Library/Mobile Documents/com~apple~CloudDocs"
)
DUMP=""
DUMP_MTIME=0
shopt -s nullglob
for d in "${SEARCH_DIRS[@]}"; do
  [[ -d "$d" ]] || continue
  for f in "$d"/RZL-mind*.txt "$d"/ya-mind*.json "$d"/*mind*.txt "$d"/*HANDOFF*.md; do
    [[ -f "$f" ]] || continue
    mt=$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f")
    if (( mt > DUMP_MTIME )); then
      DUMP_MTIME=$mt
      DUMP="$f"
    fi
  done
done
shopt -u nullglob

if [[ -z "$DUMP" ]]; then
  echo "STOP: no mind dump on this Mac."
  echo "On the iPhone (if Я still opens): cloud-down → Share → Drive / Files."
  echo "AirDrop or save the .txt/.json into Downloads, then re-run this script."
  echo "Do NOT Xcode Play yet — a reinstall can wipe the gut."
  exit 2
fi

AGE_H=$(( ( $(date +%s) - DUMP_MTIME ) / 3600 ))
echo "Dump: $DUMP"
echo "Age:  ${AGE_H}h"

# --- 2. Drive dest (Google Drive for desktop sync = automatic upload) ---
DRIVE_DIR="${YA_DRIVE_DIR:-}"
if [[ -z "$DRIVE_DIR" ]]; then
  for cand in \
    "$HOME/Library/CloudStorage"/GoogleDrive-*/My\ Drive/*MACHINE* \
    "$HOME/Library/CloudStorage"/GoogleDrive-*/My\ Drive/*MIND* \
    "$HOME/Google Drive"/*MACHINE* \
    "$HOME/Google Drive"/*MIND*
  do
    if [[ -d "$cand" ]]; then DRIVE_DIR="$cand"; break; fi
  done
fi

if [[ -z "${DRIVE_DIR}" || ! -d "${DRIVE_DIR}" ]]; then
  echo "WARN: Drive sync folder not found. Copy the dump by hand to:"
  echo "  $DRIVE_FOLDER_URL"
  echo "Install Google Drive for desktop, sync MACHINE MIND, set YA_DRIVE_DIR, re-run."
  DRIVE_OK=0
else
  echo "Drive: $DRIVE_DIR"
  cp -n "$DUMP" "$DRIVE_DIR/" 2>/dev/null || cp "$DUMP" "$DRIVE_DIR/"
  {
    echo "# HANDOFF DAY6 $STAMP"
    echo
    echo "Utah dump before iOS regen."
    echo "Source: $DUMP"
    echo "Age hours: $AGE_H"
    echo "Next: Xcode Play YaAim · team $TEAM · ping → here"
    echo "Heart: re-seat Documents/heart.gguf if wiped. Never git it."
  } > "$DRIVE_DIR/HANDOFF-DAY6-$STAMP.md"
  echo "Saved stamp HANDOFF-DAY6-$STAMP.md — Drive will upload if this folder is syncing."
  DRIVE_OK=1
fi

# --- 3. iCloud extra twin if present ---
ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Я"
if [[ -d "$HOME/Library/Mobile Documents/com~apple~CloudDocs" ]]; then
  mkdir -p "$ICLOUD"
  cp "$DUMP" "$ICLOUD/" || true
  echo "Also copied dump to iCloud Drive/Я"
fi

echo
if [[ "$DRIVE_OK" != "1" ]]; then
  echo "STOP: Drive copy did not finish. Dump is local only. Upload, then Play."
  exit 3
fi
if (( AGE_H > 48 )); then
  echo "WARN: dump is older than 48h. Prefer a fresh cloud-down from Я before Play."
fi

echo
echo "DUMP OK — now tile regen (you press Play):"
echo "  open $PROJ"
echo "  scheme YaAim · iPhone · team $TEAM · no App Sandbox"
echo "After Play: re-seat heart.gguf · cloud-up this dump · ping → here"
echo "=== end ==="
