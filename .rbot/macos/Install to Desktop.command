#!/bin/bash
set -euo pipefail
APP=$(ls -dt "$HOME"/Library/Developer/Xcode/DerivedData/RIZALBOT-*/Build/Products/Debug/RIZALBOT.app 2>/dev/null | head -1 || true)
if [ -z "${APP:-}" ]; then
  echo "Press Play in Xcode first, then run this again."
  exit 1
fi
DEST="$HOME/Desktop/RIZALBOT.app"
rm -rf "$DEST"
cp -R "$APP" "$DEST"
/usr/bin/xattr -cr "$DEST" || true
open "$DEST"
echo "Desktop: $DEST"
