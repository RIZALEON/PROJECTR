#!/bin/zsh
set -e
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH"
ROOT="$HOME/Documents/ЯBOT"
DD="/tmp/ya-dd-wallet-seat"
echo "=== seat wallet + landing into /Applications (one tile) ==="
killall -9 ЯBOT 2>/dev/null || true
pkill -9 -f 'ЯBOT.app/Contents/MacOS/ЯBOT' 2>/dev/null || true
sleep 1
rm -rf "$DD"
xcodebuild -project "$ROOT/ЯBOT.xcodeproj" -scheme ЯBOT -configuration Debug \
  -derivedDataPath "$DD" -destination 'platform=macOS' build
APP="$DD/Build/Products/Debug/ЯBOT.app"
test -d "$APP"
rm -rf /Applications/ЯBOT.app
cp -R "$APP" /Applications/ЯBOT.app
xattr -cr /Applications/ЯBOT.app 2>/dev/null || true
# Seed offline wallet card
mkdir -p "$HOME/Library/Application Support/ЯBOT/twin"
cp -f "$ROOT/ЯBOT/WalletCard.json" "$HOME/Library/Application Support/ЯBOT/twin/wallet-card.json"
open /Applications/ЯBOT.app
echo "=== DONE — tap vault tile left of on/off for wallet landing ==="
