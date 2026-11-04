#!/bin/sh
# Seat hooks in this clone. Idempotent.
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "not a git repo"
  exit 1
}
cd "$ROOT" || exit 1
chmod +x hooks/post-merge hooks/post-commit hooks/post-checkout hooks/pre-push hooks/sync-mailbox.sh hooks/install.sh 2>/dev/null || true
git config core.hooksPath hooks
echo "hooksPath=$(git config --get core.hooksPath)"
/bin/sh hooks/sync-mailbox.sh
echo "mailbox copy ran once"
