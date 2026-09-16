#!/bin/bash
set -euo pipefail
ROOT="/Users/rizal/Documents/ЯBOT"
SRC="$ROOT/ЯBOT"
PACK="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$SRC/Assets.xcassets"
THEMATICS="/Users/rizal/Desktop/RIZALBOT/macos/RIZALBOT/www/thematics"
IOSWWW="/Users/rizal/Documents/ChatGPT/ЯBOT/ios/RIZALBOT/www"

echo "== clay-v2 apply =="
echo "ROOT=$ROOT"
echo "PACK=$PACK"

make_imageset() {
  local name="$1"
  shift
  local dest="$ASSETS/${name}.imageset"
  mkdir -p "$dest"
  local src=""
  for cand in "$@"; do
    if [[ -f "$cand" ]]; then src="$cand"; break; fi
  done
  if [[ -z "$src" ]]; then
    echo "WARN imageset $name — no source; SF Symbol fallback in UI"
    cat > "$dest/Contents.json" << JSON
{
  "images" : [ { "idiom" : "universal", "scale" : "1x" } ],
  "info" : { "author" : "xcode", "version" : 1 }
}
JSON
    return
  fi
  local base
  base="$(basename "$src")"
  local ext="${base##*.}"
  local file="${name}.${ext}"
  cp -f "$src" "$dest/$file"
  cat > "$dest/Contents.json" << JSON
{
  "images" : [
    { "filename" : "$file", "idiom" : "universal", "scale" : "1x" }
  ],
  "info" : { "author" : "xcode", "version" : 1 }
}
JSON
  echo "OK imageset $name <- $src"
}

mkdir -p "$ASSETS"

make_imageset Bolte \
  "$THEMATICS/bolte-freeform.png" \
  "$THEMATICS/underworld-cloud-freeform.png" \
  "$THEMATICS/bolte-still.jpg"

make_imageset MachineMind \
  "$THEMATICS/machine-mind-button.jpg" \
  "$THEMATICS/mind-mechanical.jpg" \
  "$IOSWWW/toolbar-mind.png"

make_imageset ToggleOnline "$THEMATICS/toggle-online.jpg" "$IOSWWW/online-offline-on.png"
make_imageset ToggleOffline "$THEMATICS/toggle-offline.jpg" "$IOSWWW/online-offline-off.png"
make_imageset ToggleLink "$THEMATICS/ui-toggle-online-offline.jpg"
make_imageset SearchGlass "$THEMATICS/ui-search-glass.png" "$IOSWWW/toolbar-search.png"
make_imageset ArrowDown "$THEMATICS/ui-arrow-down.png" "$IOSWWW/button-latest-down.png"
make_imageset PlusAttach "$THEMATICS/ui-plus.jpg" "$IOSWWW/button-add.png"
make_imageset ClayWall \
  "$PACK/assets-staging/ClayWall.jpg" \
  "$ROOT/ybot-clay-v2/assets-staging/ClayWall.jpg"

# Swift sources (PBXFileSystemSynchronizedRootGroup picks them up)
for f in MyApp.swift ContentView.swift ClayTheme.swift ChatMessage.swift CompanionRouter.swift; do
  cp -f "$PACK/ЯBOT/$f" "$SRC/$f"
done
echo "OK Swift sources written to $SRC"

# Versions
python3 "$PACK/handoff/ensure-pbx-versions.py" "$ROOT/ЯBOT.xcodeproj/project.pbxproj"

echo "== xcodebuild =="
xcodebuild -project "$ROOT/ЯBOT.xcodeproj" -scheme ЯBOT -destination 'platform=macOS' -configuration Debug build
echo "BUILD SUCCESS"
