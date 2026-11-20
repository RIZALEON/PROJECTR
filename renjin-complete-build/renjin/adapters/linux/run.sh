#!/bin/sh
# run.sh — launch the R:> shell for the RCODE Linux seat.
# Usage: ./run.sh            (boots from src/store-v3.json, the shipped seat)
#        RZL_STORE=/path/to/store-v3.json ./run.sh
#        RZL_YAID=ЯID-0001-3QQS ./run.sh   (publish the public ЯID to the seat)
# Needs Node.js on PATH (the same Node that trains Core v3). No network,
# no install step, nothing leaves the machine. chmod +x per the Inner
# Beacon Linux rule (Linux files run by permission, not extension).
set -e
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if ! command -v node >/dev/null 2>&1; then
  echo "rcode-linux: node is not on PATH — install Node.js, then ./run.sh" >&2
  exit 1
fi
exec node "$DIR/rcode-linux-shell.js" "$@"
