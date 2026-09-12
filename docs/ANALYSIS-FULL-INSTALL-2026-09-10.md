# Full-install analysis — effective offline Rizalbot
**When:** 2026-09-10 · tip `6ac9ec9`+ (this tip: CoS deepen + write-code) · Decider 70% usage · NonNuclear · no cloud brain

## Architecture (what the app actually is)
```
iOS shell (Swift)          www PWA mind (WKWebView)
├─ WebShell.swift  ──────► index.html + app.js + plugins (?v=101)
├─ NativeVault     Documents/ + gut/ + heart.gguf
├─ NativeHeart     llama Metal seat (framework still MISSING)
├─ ModelManager    GGUF discover/download helpers
└─ ConversationStore
```
Live mind = **On My iPhone → Я/** + bundled `ios/YaAim/www/`. Cloud twins = dump only.

Spoken V0.0: **0 Evolve · 1 ASTA · 2 RIZALBOT EMBEDDED**  
GOFLOF ids: F0 evolve.self · F1 talk.offline · F2 web.video (hands)

---

## Decider law — 100% offline (2026-09-10)

Rizalbot / Я AIᵐ must be **100% offline capable** and **never** bound by cloud token or usage limits.

- Core chat / evolve / recall / ping / CoS embed = on-device only (gut + shelves + local heart when seated)
- No metered API required for spoken Function 0/1/2
- Green search / SFSafari = optional when online; degrade clean on airplane
- Llama seat preferred over any cloud LLM for unlimited local tokens
- Skin / rules + gut must still talk with **zero network** and **zero quota**
- Do **not** add cloud-required chat paths

---

## Component map (tip `6ac9ec9`+)

### A. Loaded in index (?v=101) — ACTIVE / SEATED
| File | Role | Status |
|------|------|--------|
| app.js | Core chat, functions[], memory, evolve, webSearch | ACTIVE — godfile |
| senses.js | Senses UI / shelves glue | ACTIVE |
| deadman.js | Deadman lock | ACTIVE |
| ya-search-bots.js | Green DDG/jina second search | ACTIVE |
| ya-hardcode-0.1.js + .css | Spine + CoS **stub** (defers chief → CosMode) | SEATED |
| ya-mind-continuity.js | Gut stamp + chief brief + llama inject | SEATED |
| ya-compass-race.js | Place-true race + Top 3 | SEATED |
| ya-compass-br.js | BR compass helper | SEATED |
| ya-ping-bounce.js | Airplane local-seat / bounce | SEATED |
| **ya-think-evolve.js** | Think/meditate + evolve pathways | **SEATED** (was orphan; wired) |
| **ya-cos-mode.js** | Offline multi-turn CoS deepen | **THIS TIP** |
| **ya-write-code.js** | Offline write-code / evolve manifest | **THIS TIP** |
| ya-cloud-mark.js | Cloud workmark UI | SEATED |
| senses/*.jsonl | ASTA shelves | PRESENT — devour not wired as Track C |

### B. On disk but NOT in index — ORPHAN / later
| File | Role | Action |
|------|------|--------|
| ya-mirror-dump.js | Twin dump helper | Optional; keep out of hot path |
| ya-paths.js | Path helpers | Wire if think/mirror need it |
| body-parts.js / oss-catalog.js | Body/OSS catalog | Decide: seat under body/ or drop |

### C. Native — CRITICAL GAP
| Piece | Status |
|-------|--------|
| WKWebView + YA_NATIVE | OK |
| SFSafariViewController openBrowse | OK |
| Documents vault / mind size bytes | OK |
| heart.gguf path | OK when file present (~100MB) |
| **llama.xcframework / token generate** | **MISSING** — NativeHeart says tokens stay off; Function 0 talks from **rules+gut skin only** |

Without Metal llama, “full effective bot” ≠ GGUF chat — it’s still PWA gut/rules. **Must seat llama framework OR accept rules+gut as V0 brain.** See `docs/SEAT-LLAMA-XCFRAMEWORK.md`.

### D. Size goal
- Floor: 100–150 MB (heart + lean gut)
- **Sweet spot V0: 200–400 MB**
- Soft cap: &lt;1 GB (VERSION 0.0)
- Exclude every-turn: heart, full gut, multi-MB mind txt

---

## Gameplan vs reality

| Step | Plan | Reality |
|------|------|---------|
| 0 Continuity/B/compass | rebuild | Compass/Top3 seated; Track B force-quit recall smoke ongoing |
| 1 Green-web + SFSafari | ship | SFSafari + search-bots seated |
| 2 CoS deepen | **this tip** | **`ya-cos-mode.js`** multi-turn offline CoS |
| 3 Offline search bots | next | File seated green; amber rummage still thin |
| 4 Write-code + ASTA C + D | **write-code this tip** | **`ya-write-code.js`** manifest hand; ASTA C/D later |
| UI cloud workmark | seated | `ya-cloud-mark.js` in index |
| llama.xcframework | Mac Embed&Sign build path (binary not in git) | **seated-on-device when frameworkLinked+heart** |
| Size 200–400 MB | proposed | Not locked by Decider yet |

---

## Load graph (canonical index ?v=101)
1. app.js  
2. senses + deadman  
3. search-bots  
4. hardcode.js + hardcode.css  
5. continuity  
6. compass-race + compass-br + ping-bounce  
7. **think-evolve** (SEATED)  
8. **cos-mode** (this tip)  
9. **write-code** (this tip)  
10. cloud-mark  

Bump `?v=` every ship. Delete or move orphans out of www if unused.

---

## Recommended next sequence (usage light)
1. **Reinstall www** from this tip — smoke spine / chief / cos mode / write-code manifest / evolve / airplane chat  
2. **llama.xcframework Embed&Sign** on Mac (team 88HACKXHZL) — see SEAT-LLAMA doc  
3. Offline search rummage (amber)  
4. ASTA C devour → D reason-scratch  

Parallel only if Decider says so. Money outside gut/ntfy. NonNuclear immutable.

## This tip summary
- `ya-think-evolve.js` already SEATED at prior tip; do not duplicate.
- **Added:** `ya-cos-mode.js` + `ya-write-code.js` (root / web / ios www) · wired after think-evolve · `?v=101`.
- **llama** still **MISSING**.
