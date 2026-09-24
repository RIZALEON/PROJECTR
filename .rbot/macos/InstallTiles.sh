#!/bin/sh
# Every Play: signed app → /Applications, Desktop alias, Dock pin.
# iCloud Desktop must never hold a real .app. Xcode Run must not keep the Dock.
set +e
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP="${BUILT_PRODUCTS_DIR}/${FULL_PRODUCT_NAME}"
if [ ! -d "$APP" ]; then
  APP=$(ls -dt "$HOME/Library/Developer/Xcode/DerivedData/RIZALBOT-"*/Build/Products/Debug/RIZALBOT.app 2>/dev/null | head -1)
fi
if [ ! -d "$APP" ]; then
  echo "No RIZALBOT.app. Press Play in Xcode first."
  exit 0
fi

DEST="/Applications/RIZALBOT.app"
BIN="$DEST/Contents/MacOS/RIZALBOT"

plant() {
  /bin/rm -rf "$DEST"
  /usr/bin/ditto "$APP" "$DEST"
  /bin/chmod 755 "$BIN" 2>/dev/null
  /bin/rm -f "$DEST/Contents/MacOS/"*.debug.dylib "$DEST/Contents/Frameworks/"*.debug.dylib 2>/dev/null
  /usr/bin/xattr -dr com.apple.quarantine "$DEST" 2>/dev/null
  /usr/bin/touch "$DEST"

  /bin/rm -rf "$HOME/Desktop/RIZALBOT.app"
  /usr/bin/osascript >/dev/null 2>&1 <<'APPLESCRIPT'
tell application "Finder"
  set desk to path to desktop folder
  try
    delete (every application file of desk whose name contains "RIZALBOT")
  end try
  try
    delete (every alias file of desk whose name contains "RIZALBOT")
  end try
  make alias file to POSIX file "/Applications/RIZALBOT.app" at desk with properties {name:"RIZALBOT"}
end tell
APPLESCRIPT

  LS=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
  [ -x "$LS" ] && "$LS" -f "$DEST" >/dev/null 2>&1
  /usr/bin/python3 "$HERE/pin-dock.py"
  /usr/bin/killall Dock >/dev/null 2>&1
}

plant
echo "Seated $DEST"

# Re-pin only. Do not killall RIZALBOT — that SIGTERMs Xcode's debugger.
(
  sleep 8
  /usr/bin/python3 "$HERE/pin-dock.py"
  /usr/bin/killall Dock >/dev/null 2>&1
) >/tmp/rizal-tiles.log 2>&1 &
exit 0
