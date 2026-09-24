#!/bin/bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
/usr/bin/xattr -cr "$ROOT" 2>/dev/null || true

XCODE_APP="/Applications/Xcode.app"
if [ -d "$XCODE_APP" ]; then
  CURRENT="$(xcode-select -p 2>/dev/null || true)"
  if [ "$CURRENT" != "$XCODE_APP/Contents/Developer" ]; then
    sudo xcode-select -s "$XCODE_APP/Contents/Developer" || true
  fi
fi

if [ -d "$HERE/YaAim.xcworkspace" ]; then
  TARGET="$HERE/YaAim.xcworkspace"
elif [ -d "$HERE/YaAimMac.xcodeproj" ]; then
  TARGET="$HERE/YaAimMac.xcodeproj"
else
  TARGET="$HERE/RIZALBOT.xcodeproj"
fi

if [ -d "$XCODE_APP" ]; then
  open -a Xcode "$TARGET"
else
  open "$TARGET"
fi
