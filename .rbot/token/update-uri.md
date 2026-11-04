# UPDATE METADATA URI

Standard: **Metaplex Token Metadata** (legacy) on SPL Token program.
Not Metaplex Core. Not Token-2022 (`spl-token update-metadata` is wrong).

| | |
|---|---|
| Mint | `BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv` |
| Metadata PDA | `CI9V7HLBSGJPNRWTN5PVT5H5JPOI6EAIF1B2KVZWR5M9` |
| Update authority | `BwpVNk1Rtncpv5HMTLwxB4Yfjkfv6mFaBQUTpjneH1F9` |
| New URI | https://raw.githubusercontent.com/rizalward/Rbot/main/token/crown.json |

Clay `CITE` / `UPDATE METADATA URI` talk strings do **not** send a tx. This script does.

## Metaboss (exact function)

```
metaboss update uri \\
  --account BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv \\
  --new-uri "https://raw.githubusercontent.com/rizalward/Rbot/main/token/crown.json"
```

## Metaplex CLI

```
npx @metaplex-foundation/cli toolbox token update BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv --name "Я" --symbol "Я"
```
