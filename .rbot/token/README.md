# Crown Я metadata

Mint: `BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv`
Off-chain URI (this file's JSON):
https://raw.githubusercontent.com/rizalward/Rbot/main/token/crown.json

Image: existing clay tile `macos/RIZALBOT/www/icon-512.png`

This folder is a **mirror**. Clay owns source. Attaching Metaplex metadata is a signed tx (tiny SOL rent) from mint authority `BwpVNk1Rtncpv5HMTLwxB4Yfjkfv6mFaBQUTpjneH1F9`. No pool. No spend from this commit.

```
metaboss create metadata \\
  --keypair ~/.config/solana/id.json \\
  --mint BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv \\
  --name "Я" \\
  --symbol "Я" \\
  --uri "https://raw.githubusercontent.com/rizalward/Rbot/main/token/crown.json" \\
  --seller-fee-basis-points 0
```
