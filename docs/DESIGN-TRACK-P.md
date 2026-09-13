# Design note — Track P (paste-to-bind interact link)

**Status:** MVP implementing on `track-p-interact`. Default URL = existing `CHIEF_INBOX` (`https://ntfy.sh/ya-rizaleon-ae59add8-reconnect`). Optional override mint: `https://ntfy.sh/ya-rizalbot-p-0471a4c3add2` (paste to bind only).  
**Related:** Function 0 online / Track U (`DESIGN-TRACK-U.md`); CHIEF_INBOX reconnect today.

## Cut locked

1. **`CHIEF_INBOX` becomes overridable** — default ntfy (or current const) stays until creator binds a new interact URL.
2. **Paste-to-bind + confirm** — creator pastes an interact URL (ntfy topic or webhook) in chat; Rizalbot asks confirm; on yes, persist binding on-device.
3. **GitHub reconnect is backup** — not the primary interact channel; no always-on account cloud.
4. **No full gut in pings** — reconnect notes stay summary-only (as today).
5. **Airplane / amber** works without a bound link; binding is optional green-path affordance.

## Proposed UX

- Chat: paste `https://ntfy.sh/…` or webhook URL → Rizalbot: “Bind this as my interact / Chief inbox? Reply yes to bind, or no.”
- Functions / mind card: show current bind (masked), “Clear bind” → revert to default `CHIEF_INBOX`.
- Persist key e.g. `ya-aim-interact` via `mindKey` (per-account gut), never upload.

## Proposed code seams (post-battery)

- Replace hard-only `CHIEF_INBOX` reads with `interactInbox()` → bound URL || default const.
- `tryBindInteractCommand(text)` early in reply path (with confirm state in session/local).
- Validate URL allowlist shape (https ntfy / webhook); reject nuclear / file:// / gut payloads.
- Keep ping body: reason + hops only — never Essence/memories dump.

## Out of scope

- Always-on sync account
- Replacing GitHub evolve pull (Track U / F0)
- Shipping before M VERIFY green on phone

## Gate

Start P code only after Product full M accept on iPhone (Android secondary). Then land on a branch from merged M / main as CoS directs.
