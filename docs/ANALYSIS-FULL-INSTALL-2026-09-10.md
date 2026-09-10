# Full-install analysis — effective offline Rizalbot
**When:** 2026-09-10 · Mac tip `08d493c` · Decider asked before next reinstall

## Architecture (what the app actually is)
```
iOS shell (Swift)          www PWA mind (WKWebView)
├─ WebShell.swift  ──────► index.html + app.js (~196KB) + plugins
├─ NativeVault     Documents/ + gut/ + heart.gguf
├─ NativeHeart     llama Metal seat (framework MISSING in this build)
├─ ModelManager    GGUF discover/download helpers
└─ ConversationStore
```
Live mind = **On My iPhone → Я/** + bundled `ios/YaAim/www/`. Cloud twins = dump only.

Spoken V0.0: **0 Evolve · 1 ASTA · 2 RIZALBOT EMBEDDED**  
GOFLOF ids: F0 evolve.self · F1 talk.offline · F2 web.video (hands)

---

## Component map

### A. Loaded in index (?v=77) — ACTIVE
| File | ~size | Role | Status |
|------|-------|------|--------|
| app.js | 196K | Core chat, functions[], memory, evolve, webSearch | ACTIVE — godfile |
| senses.js | 12K | Senses UI / shelves glue | ACTIVE |
| deadman.js | 12K | Deadman lock | ACTIVE |
| ya-search-bots.js | 12K | Green DDG/jina second search | ACTIVE — ntfy hard-fix on 08d493c (unsmoked) |
| ya-hardcode-0.1.js | 4K | Spine + CoS **stub** | ACTIVE — too thin for “like CoS” |
| ya-mind-continuity.js | 12K | Gut stamp + chief brief + llama inject | ACTIVE |
| ya-compass-race.js | 16K | Place-true race + Top 3 | ACTIVE — device ACCEPT |
| ya-compass-br.js | 1K | BR compass helper | ACTIVE |
| ya-ping-bounce.js | 4K | Airplane local-seat / bounce | ACTIVE |
| senses/*.jsonl | ~60K | ASTA shelves | PRESENT — devour not wired as Track C |

### B. On disk but NOT in index — ORPHAN / half-seated
| File | Role | Action |
|------|------|--------|
| ya-think-evolve.js | Think/meditate + evolve pathways | **Wire or fold into app** — needed for evolve feel |
| ya-mirror-dump.js | Twin dump helper | Optional; keep out of hot path |
| ya-paths.js | Path helpers | Wire if think/mirror need it |
| ya-hardcode-0.1.css | CoS/hardcode chrome | **Load** with hardcode |
| body-parts.js / oss-catalog.js | Body/OSS catalog | Decide: seat under body/ or drop from www noise |

### C. Native — CRITICAL GAP
| Piece | Status |
|-------|--------|
| WKWebView + YA_NATIVE | OK |
| SFSafariViewController openBrowse | OK (shipped) |
| Documents vault / mind size bytes | OK |
| heart.gguf path | OK when file present (~100MB) |
| **llama.xcframework / token generate** | **MISSING** — NativeHeart says tokens stay off; Function 0 talks from **rules+gut skin only** |

Without Metal llama, “full effective bot” ≠ GGUF chat — it’s still PWA gut/rules. **Must seat llama framework OR accept rules+gut as V0 brain.**

### D. Size goal (locked recommendation)
- Floor: 100–150 MB (heart + lean gut)
- **Sweet spot V0: 200–400 MB**
- Soft cap: &lt;1 GB (VERSION 0.0)
- Exclude every-turn: heart, full gut, multi-MB mind txt

---

## Gameplan vs reality

| Step | Plan | Reality |
|------|------|---------|
| 0 Continuity/B/compass | rebuild | Compass/Top3 **ACCEPT** on e872e61; Track B force-quit recall **not fully smoked** |
| 1 Green-web + SFSafari | ship | SFSafari OK; search **FAIL** (ntfy) → tip **08d493c** waiting reinstall smoke |
| 2 CoS deepen | next | Still **stub** (~3.4KB) — biggest product gap for “like this chat” |
| 3 Offline search bots | next | File present; green path only — **amber/offline rummage** thin |
| 4 Write-code + ASTA C + D | later | Not started |
| UI cloud workmark | queued | Not started |
| Size 200–400 MB | proposed | Not locked by Decider yet |

---

## Restructuring (do this for full effective install)

### R1 — One mind pack (load graph)
Canonical index order:
1. app.js  
2. senses + deadman  
3. hardcode.js + **hardcode.css**  
4. continuity  
5. search-bots  
6. compass-race + compass-br + ping-bounce  
7. **think-evolve** (stop orphaning)  
8. optional paths/mirror behind flag  

Bump `?v=` every ship. Delete or move orphans out of www if unused.

### R2 — Heart that actually thinks
- Add **llama.xcframework** (or documented MITHRIL borrow) into NativeHeart  
- Smoke: `heart status` after force-quit → tokens on  
- Until then: label UI honestly — “rules+gut Rizalbot” vs “heart seated”

### R3 — CoS pack (not stub)
Expand hardcode/continuity into offline CoS mode:
- inventory-before-act  
- retrieve-before-reply always  
- Decider / NonNuclear / spoken 0/1/2 / ping law  
- multi-turn chief voice on airplane  

Target: +tens of KB hardcode, not another 196K godfile — prefer `ya-cos-mode.js` new thin module.

### R4 — Memory truth
- Boot scrub ntfy junk (08d493c)  
- Track B force-quit battery ACCEPT  
- Then Track C ASTA devour (shelves → durable)  
- Gut cap/hygiene so size stays in 200–400 MB band

### R5 — Green + amber search
- Green: wiki → DDG → relevant keep only (smoke Bishop after 08d493c)  
- Amber: offline rummage gut + shelves + Documents titles (search-bots offline mode)  
- SFSafari for any https when green

### R6 — Signing / install ops
- Bundle id owned by team **88HACKXHZL** (not 7D3P5F4V9M)  
- CLI: DEVELOPER_DIR=Xcode.app, DEVELOPMENT_TEAM=88HACKXHZL  
- Clean install required when www changes (WKWebView stale)

---

## Recommended next sequence (usage light)
1. **Smoke 08d493c** (Bishop / no ntfy) — ACCEPT green search  
2. **Wire orphans**: hardcode.css + think-evolve into index  
3. **CoS mode module** (Step 2) — biggest leap to “like CoS now”  
4. **llama.xcframework seat** — or Decider ACCEPT rules+gut-only V0  
5. Cloud workmark UI  
6. Offline search rummage  
7. Write-code hand → ASTA C → D  

Parallel only if Decider says so. Money outside gut/ntfy. NonNuclear immutable.
