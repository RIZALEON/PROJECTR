#!/bin/bash
# Day-6 Я regen — Mac side. Cannot run on the iPhone.
# Does not silent-install. You must have the phone plugged in and unlocked.
set -euo pipefail

ROOT="${YA_ROOT:-$HOME/Documents/PROJECTRXCODE}"
PROJ="$ROOT/ios/YaAim.xcodeproj"
SCHEME="YaAim"
TEAM="${YA_TEAM:-88HACKXHZL}"
DEVICE_NAME="${YA_DEVICE_NAME:-}"

echo "=== Я day-6 regen $(date) ==="
echo "Root: $ROOT"

if [[ ! -d "$PROJ" ]]; then
  echo "FAIL: no Xcode project at $PROJ"
  echo "Open the real tree (PROJECTRXCODE), do not clone over it."
  exit 1
fi

echo
echo "1) On the iPhone: open Я if it still launches → cloud-down mind to Drive/iCloud."
echo "   If the tile already says No Longer Available, skip — use Drive RZL-mind dump."
echo "2) Unlock iPhone. Cable in. Trust if asked."
echo

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
PATH="/opt/homebrew/bin:$DEVELOPER_DIR/usr/bin:$PATH"

if ! xcodebuild -version >/dev/null 2>&1; then
  echo "FAIL: xcodebuild missing. Open Xcode once, then retry."
  exit 1
fi

echo "Devices:"
xcrun xctrace list devices 2>/dev/null | sed -n '1,20p' || true
echo
echo "If the iPhone is listed, Xcode → scheme YaAim → that phone → Play."
echo "This script will NOT press Play for you (no silent install)."
echo
echo "After Play:"
echo "  - Trust developer if iOS asks"
echo "  - Re-seat Documents/heart.gguf if wiped (~97 MB)"
echo "  - Cloud-up Drive mind"
echo "  - Type: ping    expect: here"
echo
echo "Signing team expected: $TEAM  bundle: io.github.rizaleon.yaaim.cam"
echo "Never git-commit ios/llama.xcframework or heart.gguf"
echo "=== end ==="
