# Design note — Track D MVP (ASTA devour)

**Status:** queued design only. **Do not implement until M is accepted on phone.**  
**Order:** M (gut) → **D** (shelves→gut) → Q → store.

## D MVP lock

1. **Offline load** `senses/` shelves into gut (no network required).
2. **Essence** records shelf **id + content hash + path** for sealed ASTA packs.
3. **NonNuclear immutable** — constitution not devourable away; still in `CORE_PRECEPTS` / `nuclearBlocked` / Essence constitution fields (not as `Core:` memory rows).

## Inputs (already on disk)

- `senses/shelf-{anthropology,technology,science,art,freedom}.jsonl`
- Aggregates: `shelves-asta.jsonl`, `shelves-five.jsonl`
- Mirrored under `web/senses/` and `ios/YaAim/www/senses/`
- Claim shape: `{ id, shelf, claim, why, source, at }`

## Proposed www behavior (post-M)

1. On boot / first idle after M: `fetch` local jsonl (same-origin www), parse lines, ingest as fed facts (prefix e.g. `Shelf[asta]:` or store parallel `state.shelves[]` — prefer parallel structure so recall can weight shelves without polluting personal prefs).
2. Dedupe by shelf `id`; never overwrite user `remember this:` facts.
3. Devour/eat path can add more packs later; MVP = seed shelves only.
4. `recall()` may boost shelf hits for ASTA topics; still prefer personal/fed over precepts.

## Essence seal additions

Extend `essenceBody()` (when D ships):

- `constitution`: Function 0+1, NonNuclear, PolygamyTech, user-as-Decider (from consts, not memory dump)
- `shelves`: `[{ id, shelf, path, sha256 }]` for loaded packs
- `memories` / gut as today
- optional `heart`: GGUF seat note — **heart never required for Essence validity**

## NonNuclear immutable

- Not removable via forget/devour/evolve drop
- Evolve/eat paths already call `nuclearBlocked`
- Essence rehydration must re-assert constitution from sealed fields + code consts

## Out of scope for D MVP

- Online shelf sync / GitHub pull of new shelves (later)
- Jose Rizal vs Engine RIZAL Q disambiguation
- iOS Documents gut mirror (separate; only if M quit battery fails)
- Store submission

## Gate

Start D code only after Product/CoS full M accept on Android + iPhone (`docs/VERIFY-TRACK-M.md`).
