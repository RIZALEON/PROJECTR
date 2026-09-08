# Track M — Product acceptance battery

Fail **any** item on **either** phone = Track M not accepted.
Branch: `track-m-memory` (local until Chief of Staff greenlights push).
**No M scope shrink.**

## North-star M gate (Rizal bot)

M is accepted only when the installed app, after stress, still **is** the offline Rizal bot:

1. **Sticky identity** — Essence/persona/profile survive; it does not reset to a blank guest mind.
2. **Memory battery** — Durable prefs/facts recalled into answers (see checklist below).
3. **GGUF-off rules+gut** — With heart unseated, rules+gut still talk as that bot (remember/recall/forget work; no llama required).

Airplane + force-quit is the hard form of (1)+(2). Devour/Q/store are **out of M**.

**Documents gut mirror:** design only (`docs/DESIGN-IOS-GUT-MIRROR.md`). Build it **only if** iOS fails force-quit items after the first phone battery — do not block M or shrink scope waiting on mirror.

## Battery checklist (both phones: Android + iOS)

1. **Persist + recall** — Tell a distinct fact → force-quit → reopen → correct recall into answers.
2. **Mid-thread continuity** — Multi-turn chat → force-quit mid-thread → reopen → messages + mind still present (sticky identity).
3. **Granular forget** — ≥2 facts → `forget …` / Functions → Forget one → others remain. Also try scrubbing a `Core:` echo or robots.txt junk.
4. **Memory list UI** — Functions → **Memories** (`#mem-list`) shows durable facts.
5. **Anti-nuclear + memory** — Personal facts present → nuclear-weapon help ask → refuses; memory I/O still works.
6. **GGUF unseated** — Heart missing/failed → `remember` / `recall` / `forget` still work; bot still answers from rules+gut.
7. **Essence includes memories** — Mint → sealed JSON `body.memories` holds stored facts (heart not required for Essence validity).

## Code-static notes (pre-phone)

| # | Static check on `track-m-memory` |
|---|----------------------------------|
| 3 | `forgetFact` (+ `forget core echoes`); others remain |
| 4 | `renderMemList` + `#mem-list` |
| 5 | `nuclearBlocked` + `CORE_PRECEPTS` independent of GGUF |
| 6 | memory APIs do not require `llamaIsReady()` |
| 7 | `essenceBody().memories`; mint seals body |

| # | Needs device |
|---|--------------|
| 1–2 | Force-quit survival; iOS WK eviction → escalate to Documents mirror **after** fail |
| 3–7 | Real Android + iOS builds shipping this www |

## How to rebuild for battery

- **Web / PWA:** `index.html` from this branch (`?v=56+`).
- **Android:** rebuild APK `assets/www` (package `io.github.rizaleon.twa`).
- **iOS:** Xcode rebuild `ios/YaAim` www; USB install. No Play/Apple login from assistant computers.

## Goal One / track order

M = gut substrate for offline self-evolve + Rizal bot in-app. After M: **D** ASTA devour → **Q** → store. Shelves remain devour food until D.

## Live-dump hygiene (on branch)

- `forget core echoes` clears `Core:` precept dumps (law stays in code).
- `recall()` prefers user/fed facts; skips `Core:` unless ask is about precepts/anti-nuclear/Essence/Function 0/GOFLOF.
- `llamaMemoriesSnippet` never injects `Core:` lines.
- Jose Rizal vs Engine RIZAL naming = Track B hygiene on integrate tip (person ≠ Engine RIZAL / Rizalbot; Core: echo scrub on boot).

## No Core: seeding (hotfix)

`seedCore()` no longer writes `CORE_PRECEPTS` / `SELF_MIND` into `state.memories`. Constitution stays in precepts + Essence seal paths. Use `forget core echoes` to scrub legacy Core: junk already on devices.


## Track B hygiene (integrate)

- Asking who José Rizal is must not answer as Engine RIZAL / Rizalbot.
- `knowsPerson` strips companion/engine branding before matching.
- Boot soft-scrubs legacy `Core:` rows from Learned (constitution stays in code/Essence).
- `forget core echoes` remains available for Decider.
