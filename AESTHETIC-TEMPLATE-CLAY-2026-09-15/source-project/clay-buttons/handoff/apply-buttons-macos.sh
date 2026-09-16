#!/bin/bash
set -euo pipefail
ROOT="/Users/rizal/Documents/ЯBOT"
SRC="$ROOT/ЯBOT"
ASSETS="$SRC/Assets.xcassets"
PACK="$(cd "$(dirname "$0")/.." && pwd)"

echo "== clay buttons apply =="
make_imageset() {
  local name="$1" file="$2"
  local dest="$ASSETS/${name}.imageset"
  mkdir -p "$dest"
  local base="$(basename "$file")"
  cp -f "$file" "$dest/$base"
  cat > "$dest/Contents.json" << JSON
{
  "images" : [ { "filename" : "$base", "idiom" : "universal", "scale" : "1x" } ],
  "info" : { "author" : "xcode", "version" : 1 }
}
JSON
  echo "OK $name <- $file"
}

make_imageset BtnSearch "$PACK/BtnSearch.png"
make_imageset BtnOnline "$PACK/BtnOnline.png"
make_imageset BtnOffline "$PACK/BtnOffline.png"
make_imageset BtnMind "$PACK/BtnMind.png"
make_imageset BtnArrowDown "$PACK/BtnArrowDown.png"
make_imageset BtnPlus "$PACK/BtnPlus.png"

cp -f "$PACK/ЯBOT/ClayButtons.swift" "$SRC/ClayButtons.swift"
cp -f "$PACK/ЯBOT/ContentView.swift" "$SRC/ContentView.swift"

echo "== xcodebuild =="
xcodebuild -project "$ROOT/ЯBOT.xcodeproj" -scheme ЯBOT -destination 'platform=macOS' -configuration Debug build
echo "BUILD SUCCESS"
