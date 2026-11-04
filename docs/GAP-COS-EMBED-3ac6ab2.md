# Gap map — fully functional offline CoS embed
**Against tip:** `3ac6ab2` (PR #12)  
**Target (Decider):** offline Chief of Staff in-app — chat · write code · search on/offline · take over  
**Hold:** big ship until Decider posts seated inventory. Usage light.

## Spoken face vs GOFLOF ids
| Spoken | Meaning | Tip status |
|--------|---------|------------|
| 0 Evolve | evolve.self / Function 0 | **Seated** (chat add-function / when-I-say; ya-feed function.evolve) |
| 1 ASTA | talk.offline + green web | **Partial** — talk.offline + localEngine seated; ASTA shelves devour **not** in this tip |
| 2 RIZALBOT EMBEDDED | packed companion + CoS slice | **Stub** — `ya-hardcode-0.1.js` persona + spine card only |

GOFLOF F2 id `web.video` = senses/hands (locked) — **not** spoken F2.

## Capability gaps (thin)

| Need | Tip 3ac6ab2 | Gap |
|------|-------------|-----|
| **Chat (CoS voice)** | `chief` / `cos slice` → static card; normal chat = Rizalbot rules+gut / llama | No dedicated CoS turn-taking / take-over mode |
| **Write code** | evolve.self can seat skills; no editor/agent coding loop | No offline “write/patch www” CoS hand; cloud agents stay off-device |
| **Search offline** | recall + localEngine + memories | No ASTA shelf loader; continuity JS not in www tip |
| **Search online** | `web.search` / mind green | Works when green+signal; no CoS-owned search queue |
| **Take over** | — | No mode switch “CoS driving” vs Rizalbot; no tool router for CoS |
| **model.local** | function enabled; GGUF optional | Heart may be absent → rules+gut fallback (OK offline-first) |
| **Ping law** | compass race + bounce seated | **OK** — airplane local-seat; green closest+furthest; `ping chief` intentional |
| **Continuity** | hardcode knows[] only | `ya-mind-continuity.js` **not** in this tip’s www |
| **ya-search-bots.js** | handoff mentions | **Not** in tip www load order |

## Seated now (inventory seed for Decider)
- Spine: `hardcode/RZL-F0-F1-F2-SPINE.md`, `ya-hardcode-0.1.js`
- Race: `ya-compass-race.js` · `ya-compass-br.js` · `ya-ping-bounce.js`
- Core app: `app.js` (talk.offline, evolve, memory, web.search, model.local, Track P/F)
- Senses/deadman scripts

## Next thin cuts (after inventory — pick one)
1. Continuity seat (`ya-mind-continuity.js`) + CoS slice reads last continuity stamp  
2. CoS chat mode (`/cos` or “Chief take over”) → routes answer() through CoS knows + gut, still NonNuclear  
3. Search bots script green-only behind `web.search`  
4. ASTA devour (smarter-mind C) — **held** unless Decider parallel  

No parallel tracks until inventory lands.
