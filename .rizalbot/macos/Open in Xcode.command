#!/bin/bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
/usr/bin/xattr -cr "$HERE" 2>/dev/null || true
if [ -d "/Applications/Xcode.app" ]; then
  open -a Xcode "$HERE/RIZALBOT.xcodeproj"
else
  open "$HERE/RIZALBOT.xcodeproj"
fi
