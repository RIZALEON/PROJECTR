# Design note — Track U (cloud touch / update)

**Status:** design only. Implement **after M**, **with D**. No push until Rizal/CoS greenlight.  
**Related:** `DESIGN-FUNCTION0-UPDATES.md`, `DESIGN-TRACK-D-ASTA.md`.

## Cut locked

| Direction | Meaning |
|-----------|---------|
| **Cloud ↓** | Pull **food / update** into the body (evolutions, shelf packs, optional skills/www stubs). |
| **Cloud ↑** | **Export only** — Essence, mind dump, logs, Share/AirDrop. Never silent gut upload. |

- **Auto-update:** **opt-in** (function toggle / mind-card), not always-on.
- **No always-on account cloud** — Google/Apple/X stay nameplate.
- **Amber:** no pull required; local Function 0 + gut + seated shelves still run.
- **NonNuclear immutable.**

## Mind-card copy (align)

Use the same words on the mind panel / light affordances:

- Green / online: “Cloud ↓ pull food or updates (opt-in). Cloud ↑ export Essence or log — gut stays here.”
- Amber / offline: “Local only. Evolve and remember on-device. Tap green to allow pull.”
- Auto-update off by default: “Auto-update: off — turn on in Functions to pull when green.”

Avoid “sync account” / “backup brain to cloud.” Prefer **pull food**, **export**, **Function 0**.

## Implement with D (post-M)

1. Shared ingest path for ↓ packs (shelf jsonl + evolve JSON) — D seeds offline shelves; U refreshes/pulls when green + opt-in.
2. ↑ stays existing Essence mint/download + mind dump + Share; harden copy only.
3. Wire `sync.github` / harvest under Function 0 + Track U naming; don’t add a parallel updater product surface.

## Gate

- Code starts only after M phone accept.
- Ship U alongside or immediately after D MVP, not before.
- Hold git push until Rizal/CoS say go (`659caf7` M code + docs stack).
