#!/bin/bash
# RIZALBOT — clone (if needed), clear quarantine, point xcode-select, open workspace in Xcode.
set -euo pipefail

REPO_URL="https://github.com/rizalward/Rbot.git"
DEST="${RIZALBOT_HOME:-$HOME/Desktop/RIZALBOT}"

if [ ! -d "$DEST/.git" ]; then
  echo "Cloning $REPO_URL → $DEST"
  git clone "$REPO_URL" "$DEST"
else
  echo "Repo already at $DEST — pulling main"
  git -C "$DEST" pull --ff-only origin main || true
fi

cd "$DEST"
/usr/bin/xattr -cr "$DEST" 2>/dev/null || true
chmod +x macos/Open\ in\ Xcode.command link-xcode.sh 2>/dev/null || true

XCODE_APP="/Applications/Xcode.app"
if [ -d "$XCODE_APP" ]; then
  DEVELOPER="$XCODE_APP/Contents/Developer"
  CURRENT="$(xcode-select -p 2>/dev/null || true)"
  if [ "$CURRENT" != "$DEVELOPER" ]; then
    echo "Linking xcode-select → $DEVELOPER"
    if [ "$(id -u)" -eq 0 ]; then
      xcode-select -s "$DEVELOPER"
    else
      sudo xcode-select -s "$DEVELOPER"
    fi
  fi
  echo "Xcode: $(xcodebuild -version 2>/dev/null | head -1 || echo present)"
else
  echo "Xcode.app not in /Applications — opening with default handler"
fi

WORK="$DEST/macos/YaAim.xcworkspace"
PROJ_MAC="$DEST/macos/YaAimMac.xcodeproj"
PROJ_BOT="$DEST/macos/RIZALBOT.xcodeproj"

if [ -d "$WORK" ]; then
  TARGET="$WORK"
elif [ -d "$PROJ_MAC" ]; then
  TARGET="$PROJ_MAC"
elif [ -d "$PROJ_BOT" ]; then
  TARGET="$PROJ_BOT"
else
  echo "No Xcode project found under $DEST/macos" >&2
  exit 1
fi

echo "Opening $TARGET"
if [ -d "$XCODE_APP" ]; then
  open -a Xcode "$TARGET"
else
  open "$TARGET"
fi

echo
echo "In Xcode:"
echo "  1. Scheme YaAimMac  (or RIZALBOT)"
echo "  2. Destination: My Mac"
echo "  3. Signing & Capabilities → Team → your Apple ID"
echo "  4. Product → Run  (⌘R)"
