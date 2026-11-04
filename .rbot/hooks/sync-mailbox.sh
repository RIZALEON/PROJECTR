#!/bin/sh
# Copy mailbox files to the twin clone and Documents/Я. Never git add/commit/push.
# Airplane-safe. No ping.

if [ "${RIZAL_AUTOSYNC:-1}" = "0" ]; then
  exit 0
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$ROOT" || exit 0

HERE=$(basename "$ROOT")
if [ "$HERE" = "RIZALBOT" ] || [ "$HERE" = "Rbot" ]; then
  TWIN="${HOME}/Desktop/PROJECTR"
else
  TWIN="${HOME}/Desktop/RIZALBOT"
fi

copy_if() {
  src=$1
  dest=$2
  if [ -f "$src" ]; then
    mkdir -p "$(dirname "$dest")"
    cp -f "$src" "$dest"
  fi
}

GUT="${HOME}/Documents/Я"
mkdir -p "$GUT" 2>/dev/null || true

copy_if "handoff/ONLINE-MIND.md" "$GUT/ONLINE-MIND.md"
copy_if "LINKS.md" "$GUT/LINKS.md"
copy_if "GROK-MAILBOX.md" "$GUT/GROK-MAILBOX.md"
copy_if "macos/HANDS-MAC.md" "$GUT/HANDS-MAC.md"

if [ -d "$TWIN/.git" ]; then
  mkdir -p "$TWIN/handoff"
  copy_if "handoff/ONLINE-MIND.md" "$TWIN/handoff/ONLINE-MIND.md"
  copy_if "LINKS.md" "$TWIN/LINKS.md"
  copy_if "GROK-MAILBOX.md" "$TWIN/GROK-MAILBOX.md"
fi

exit 0
