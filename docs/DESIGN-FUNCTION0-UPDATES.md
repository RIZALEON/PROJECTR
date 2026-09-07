# Design note — Function 0 online update paths

**Status:** design only until M accepted on phone.  
**Order:** M → (this overlaps **D** devour + evolve + GitHub sync) → Q → store.

## Lock (CoS + Rizal)

When **web mind is green**, Function 0 may **touch the cloud**:

1. **Online pull / auto-update** — fetch evolutions, packs, or versioned www/skills from outside.
2. **Outside / creator-pushed update** — you (or a signed pack) push an update the device can eat.

When **amber / offline**: full Function 0 still runs locally (evolve add/drop, remember, Essence). **No required cloud. No always-on account cloud. No silent gut upload.** NonNuclear immutable.

Account link (Google/Apple/X) remains **nameplate only** — not the update channel of record.

## Unify under Function 0 (don’t invent a parallel “updater”)

Fold these existing seams into one Function 0 “update / devour” vocabulary:

| Seam today | Role after unify |
|------------|------------------|
| Evolve chat (`add function` / `drop function`) | Local gain/loss (always) |
| `sync.github` / device OAuth / raw pull | Optional green-light pull of evolutions |
| Eat / feed / Documents pick (GGUF, files) | Outside pack intake |
| Track **D** ASTA shelves → gut | Offline pack food; online may refresh shelf packs |
| Mind-card / Share / AirDrop Essence | Creator-carried sealed state (not silent upload) |

One mental model: **Function 0 metabolizes updates** — local or from outside — and applies them on-device automatically (ISOLATED still means apply without waiting on cloud when offline).

## Proposed flows (post-M)

### A. Green pull (auto)

1. Mind online + signal + `sync.github` / update function enabled.
2. Pull allowlisted refs (evolutions JSON, shelf pack manifest, optional www skill stubs) — never whole gut upload.
3. Apply via same ingest as local evolve/devour; record in memories as fed notes (not Core: precept dumps).
4. Optional ntfy/Chief ping of *what was learned* — not the gut itself.

### B. Outside pack (creator-pushed)

1. Pack types: Essence (restore), shelf jsonl/zip, evolved skill list, optional heart GGUF seat note.
2. Intake: Files / Documents pick / Share sheet / GitHub release asset.
3. Verify: NonNuclear + constitution checks; reject nuclear / silent-upload payloads.
4. Essence validity still does **not** require heart/GGUF.

### C. Amber

- No pull. Local evolve + gut + shelves already on device.
- Queued “learn when green” stays as today.

## Non-goals

- Always-on sync account / cloud brain
- Replacing Function 0 with a store-only OTA channel
- Shrinking M or blocking M on this doc
- Implementing D/Q code before M phone accept

## Gate

Implement only after full M accept (`docs/VERIFY-TRACK-M.md`). Then coordinate with D MVP (`docs/DESIGN-TRACK-D-ASTA.md`) so shelf pull and evolve pull share one ingest path.
