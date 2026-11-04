#!/bin/bash
set -euo pipefail
DEST="${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/www"
SRC=""
if [ -d "${SRCROOT}/../ios/YaAim/www" ]; then
  SRC="${SRCROOT}/../ios/YaAim/www"
elif [ -d "${SRCROOT}/YaAimMac/www" ]; then
  SRC="${SRCROOT}/YaAimMac/www"
fi
if [ -z "$SRC" ]; then
  mkdir -p "$DEST"
  exit 0
fi
mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
