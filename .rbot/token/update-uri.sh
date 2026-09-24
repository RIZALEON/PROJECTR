#!/bin/zsh
set -euo pipefail
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.local/bin:$PATH"

MINT=BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv
URI=https://raw.githubusercontent.com/rizalward/Rbot/main/token/crown.json
AUTH=BwpVNk1Rtncpv5HMTLwxB4Yfjkfv6mFaBQUTpjneH1F9

solana config set --url https://api.mainnet-beta.solana.com >/dev/null
ADDR=$(solana address)
echo "wallet: $ADDR"
echo "need:   $AUTH"
if [ "$ADDR" != "$AUTH" ]; then
  echo "STOP: not mint/update authority. Recover the crown seed first. Do not solana-keygen new."
  exit 1
fi
solana balance
curl -fsS "$URI" | head

command -v metaboss >/dev/null || bash -c "$(curl -sSf https://raw.githubusercontent.com/samuelvanderwaal/metaboss/main/scripts/install.sh)"
export PATH="$HOME/.local/bin:$PATH"

echo "=== decode before ==="
metaboss decode mint -a "$MINT" || true

echo "=== update uri ==="
metaboss update uri --account "$MINT" --new-uri "$URI"

echo "=== decode after ==="
metaboss decode mint -a "$MINT" || true
echo "solscan https://solscan.io/token/$MINT"
