#!/bin/zsh
# Build → /Applications → open by PATH only (one Dock tile). Fixes LSOpen -600.
set -e
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH"
ROOT="$HOME/Documents/ЯBOT"
DD="$ROOT/DerivedData/mac-one-tile"
echo "[1/4] stop ЯBOT…"
killall -9 ЯBOT 2>/dev/null || true
pkill -9 -f 'ЯBOT.app/Contents/MacOS/ЯBOT' 2>/dev/null || true
sleep 1
echo "[2/4] build…"
xcodebuild -project "$ROOT/ЯBOT.xcodeproj" -scheme ЯBOT -configuration Debug \
  -derivedDataPath "$DD" -destination 'platform=macOS' build
APP="$DD/Build/Products/Debug/ЯBOT.app"
test -d "$APP"
echo "[3/4] install…"
rm -rf /Applications/ЯBOT.app
cp -R "$APP" /Applications/ЯBOT.app
xattr -cr /Applications/ЯBOT.app 2>/dev/null || true
sleep 0.5
echo "[4/4] open…"
open /Applications/ЯBOT.app
echo "DONE — left pinned tile only."
