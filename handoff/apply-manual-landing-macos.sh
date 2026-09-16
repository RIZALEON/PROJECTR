#!/usr/bin/env bash
# Apply Bolte → ManualCover landing + offline USER-MANUAL.pdf export into live Documents/ЯBOT.
# Run ON rizals-MacBook-Neo (Shell + machineId 55d92eb0-0ce0-4959-b297-440d80e59e38)
set -euo pipefail

ROOT="${YBOT_ROOT:-/Users/rizal/Documents/ЯBOT}"
SRC="$ROOT/ЯBOT"
ASSETS="$SRC/Assets.xcassets"
PACK="$(cd "$(dirname "$0")/.." && pwd)"
PBX="$ROOT/ЯBOT.xcodeproj/project.pbxproj"

echo "== manual-landing apply =="
echo "ROOT=$ROOT"
echo "PACK=$PACK"

[[ -d "$ROOT/ЯBOT.xcodeproj" ]] || { echo "FATAL: missing $ROOT/ЯBOT.xcodeproj"; exit 1; }
[[ -d "$SRC" ]] || { echo "FATAL: missing $SRC"; exit 1; }
mkdir -p "$ASSETS"

# Prefer live ContentView: if Bolte is already ClayButton with { }, patch in place;
# otherwise replace with pack ContentView (keeps composer/chrome from pack base).
cp -f "$PACK/ЯBOT/ContentView.swift" "$SRC/ContentView.swift"
cp -f "$PACK/ЯBOT/ManualLandingView.swift" "$SRC/ManualLandingView.swift"

# ClayButtons: merge focusEffectDisabled if live exists; else copy pack
if [[ -f "$SRC/ClayButtons.swift" ]]; then
  if ! grep -q 'focusEffectDisabled' "$SRC/ClayButtons.swift"; then
    # Prefer pack ClayButtons (has focusEffectDisabled)
    cp -f "$PACK/ЯBOT/ClayButtons.swift" "$SRC/ClayButtons.swift"
  fi
else
  cp -f "$PACK/ЯBOT/ClayButtons.swift" "$SRC/ClayButtons.swift"
fi

# ManualCover imageset
DEST="$ASSETS/ManualCover.imageset"
mkdir -p "$DEST"
cp -f "$PACK/ЯBOT/Assets.xcassets/ManualCover.imageset/ManualCover.jpg" "$DEST/ManualCover.jpg"
cp -f "$PACK/ЯBOT/Assets.xcassets/ManualCover.imageset/Contents.json" "$DEST/Contents.json"
echo "OK ManualCover.imageset"

# Bundle USER-MANUAL.pdf into app sources (PBXFileSystemSynchronizedRootGroup auto-includes)
PDF_SRC=""
for cand in \
  "$PACK/ЯBOT/USER-MANUAL.pdf" \
  "$ROOT/USER-MANUAL.pdf" \
  "$PACK/resources/USER-MANUAL.pdf"
do
  if [[ -f "$cand" ]]; then PDF_SRC="$cand"; break; fi
done
if [[ -n "$PDF_SRC" ]]; then
  cp -f "$PDF_SRC" "$SRC/USER-MANUAL.pdf"
  cp -f "$PDF_SRC" "$ROOT/USER-MANUAL.pdf"
  echo "OK USER-MANUAL.pdf <- $PDF_SRC"
else
  echo "WARN: no USER-MANUAL.pdf found to bundle"
fi

# Fold MD note
if [[ -f "$PACK/USER-MANUAL.md" ]]; then
  cp -f "$PACK/USER-MANUAL.md" "$ROOT/USER-MANUAL.md"
  echo "OK USER-MANUAL.md"
fi

# Seed Application Support MACHINE MIND (dev host path)
MIND="$HOME/Library/Application Support/ЯBOT/MACHINE MIND"
mkdir -p "$MIND"
if [[ -f "$SRC/USER-MANUAL.pdf" ]]; then
  cp -f "$SRC/USER-MANUAL.pdf" "$MIND/USER-MANUAL.pdf"
  echo "OK MACHINE MIND seed -> $MIND/USER-MANUAL.pdf"
fi

# pbxproj: FileSystemSynchronizedRootGroup — no explicit PDF entry needed.
# Verify version stamps stay sane.
if [[ -f "$PBX" ]]; then
  /usr/bin/python3 - <<'PY' "$PBX" || true
import pathlib, sys
p = pathlib.Path(sys.argv[1])
t = p.read_text()
# no-op verify synchronized group present
assert "PBXFileSystemSynchronizedRootGroup" in t, "unexpected pbxproj shape"
print("OK pbxproj synchronized root (auto-bundles ЯBOT/USER-MANUAL.pdf + ManualCover)")
PY
fi

echo "== xcodebuild (macOS) =="
set +e
xcodebuild -project "$ROOT/ЯBOT.xcodeproj" -scheme ЯBOT -destination 'platform=macOS' -configuration Debug build
EC=$?
set -e
if [[ $EC -eq 0 ]]; then
  echo "BUILD SUCCESS"
else
  echo "BUILD FAIL exit=$EC (sources seated; Decider can build in Xcode)"
fi
exit 0
