#!/usr/bin/env bash
# Apply claymation digital-base UX into Documents/ЯBOT macOS Xcode project.
# Run ON rizals-MacBook-Neo (not the Linux box).
set -euo pipefail

ROOT="${YBOT_ROOT:-/Users/rizal/Documents/ЯBOT}"
SRC_APP="$ROOT/ЯBOT"
ASSETS="$SRC_APP/Assets.xcassets"
PBX="$ROOT/ЯBOT.xcodeproj/project.pbxproj"
PACK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PACK_SWIFT="$PACK_DIR/ЯBOT"
STAGING="$PACK_DIR/assets-staging"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

THEMATICS_A="/Users/rizal/Desktop/RIZALBOT/macos/RIZALBOT/www/thematics"
THEMATICS_B="/Users/rizal/Documents/ChatGPT/ЯBOT/ios/RIZALBOT/www"

echo "== clay-seat apply =="
echo "ROOT=$ROOT"
echo "PACK=$PACK_DIR"

[[ -d "$ROOT/ЯBOT.xcodeproj" ]] || { echo "FATAL: missing $ROOT/ЯBOT.xcodeproj"; exit 1; }
[[ -d "$SRC_APP" ]] || { echo "FATAL: missing $SRC_APP"; exit 1; }
mkdir -p "$ASSETS"

pick_first() {
  local f
  for f in "$@"; do
    if [[ -f "$f" ]]; then
      echo "$f"
      return 0
    fi
  done
  return 1
}

make_imageset() {
  local name="$1"
  shift
  local src=""
  src="$(pick_first "$@" 2>/dev/null || true)"
  if [[ -z "$src" ]]; then
    echo "WARN: no source for imageset $name — skipping (SF Symbol fallback in UI)"
    return 0
  fi
  local ext="${src##*.}"
  local dest_dir="$ASSETS/${name}.imageset"
  mkdir -p "$dest_dir"
  local dest_file="$dest_dir/${name}.${ext}"
  cp -f "$src" "$dest_file"
  cat > "$dest_dir/Contents.json" <<JSON
{
  "images" : [
    {
      "filename" : "${name}.${ext}",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
JSON
  echo "OK imageset $name <- $src"
}

make_imageset "Bolte" \
  "$THEMATICS_A/bolte-freeform.png" \
  "$THEMATICS_A/bolte-still.jpg" \
  "$THEMATICS_B/bolte-freeform.png" \
  "$THEMATICS_B/bolte-still.jpg"

make_imageset "MachineMind" \
  "$THEMATICS_A/machine-mind-button.jpg" \
  "$THEMATICS_A/mind-mechanical.jpg" \
  "$STAGING/MachineMind.jpg" \
  "$THEMATICS_B/toolbar-mind.png"

make_imageset "ToggleOnline" \
  "$THEMATICS_A/toggle-online.jpg" \
  "$STAGING/ToggleOnline.jpg" \
  "$THEMATICS_B/online-offline-on.png"

make_imageset "ToggleOffline" \
  "$THEMATICS_A/toggle-offline.jpg" \
  "$STAGING/ToggleOffline.jpg" \
  "$THEMATICS_B/online-offline-off.png"

make_imageset "SearchGlass" \
  "$THEMATICS_A/ui-search-glass.png" \
  "$THEMATICS_B/ui-search-glass.png"

make_imageset "ArrowDown" \
  "$THEMATICS_A/ui-arrow-down.png" \
  "$THEMATICS_A/button-latest-down.png" \
  "$THEMATICS_B/button-latest-down.png" \
  "$THEMATICS_B/ui-arrow-down.png"

make_imageset "PlusAttach" \
  "$THEMATICS_A/ui-plus.jpg" \
  "$THEMATICS_A/button-add.png" \
  "$THEMATICS_B/button-add.png" \
  "$THEMATICS_B/ui-plus.jpg"

if [[ ! -f "$ASSETS/Contents.json" ]]; then
  cat > "$ASSETS/Contents.json" <<'JSON'
{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
JSON
fi

cp -f "$PACK_SWIFT/MyApp.swift" "$SRC_APP/MyApp.swift"
cp -f "$PACK_SWIFT/ContentView.swift" "$SRC_APP/ContentView.swift"
cp -f "$PACK_SWIFT/ClayTheme.swift" "$SRC_APP/ClayTheme.swift"
cp -f "$PACK_SWIFT/ChatMessage.swift" "$SRC_APP/ChatMessage.swift"
echo "OK Swift sources written to $SRC_APP"

if [[ -f "$PBX" ]]; then
  python3 "$SCRIPT_DIR/ensure-pbx-versions.py" "$PBX"
else
  echo "WARN: no pbxproj at $PBX"
fi

echo "== xcodebuild =="
set +e
xcodebuild -project "$ROOT/ЯBOT.xcodeproj" -scheme "ЯBOT" \
  -destination 'platform=macOS' -configuration Debug build 2>&1 | tee /tmp/ybot-clay-build.log | tail -n 80
BUILD_RC=${PIPESTATUS[0]}
set -e
if [[ $BUILD_RC -eq 0 ]]; then
  echo "BUILD SUCCESS"
else
  echo "BUILD FAILED rc=$BUILD_RC"
  echo "--- last errors ---"
  grep -E "error:|fatal error|CODE_SIGN|Provisioning" /tmp/ybot-clay-build.log | tail -n 40 || true
fi
exit $BUILD_RC
