# Track F — Remote Control / Feeds (ya-feed)

**Status:** Phase 1 implemented on `track-f-feed` (off Track P tip).  
**Companion:** Rizalbot · Я AIᵐ  
**Depends on:** Track P bound interact channel (ntfy.sh preferred).

## Goal

Let Chief of Staff (or creator) push **structured packs** onto the bound interact topic so a green-mind Rizalbot can apply them on-device — without a cloud brain and without silent gut upload.

Outbound Track P pings stay intact. Inbound is opt-in: mind green + interact bound + https ntfy.

## Transport

| Direction | Mechanism |
|-----------|-----------|
| Out (P) | `pingChief({ force })` POST to bound URL / default `CHIEF_INBOX` |
| In (F) | SSE `/{topic}/sse` + poll fallback `/{topic}/json?poll=1&since=` every ~12s |

Listener starts when mind goes green (or online + already green) and an interact URL is bound. Stops on amber / offline / unlink.

Dedup: ntfy message `id` stored in `ya-aim-feed-seen` (per mind, capped).

Non-ntfy webhooks: Phase 1 listen is ntfy-only (`not-ntfy`); bind still works for outbound POST.

## Pack format (`ya-feed`)

Publish the JSON as the ntfy **message body** (title optional):

```json
{
  "kind": "ya-feed",
  "v": 1,
  "ack": true,
  "ops": [
    { "op": "memory.upsert", "text": "User prefers dark mode." },
    { "op": "memory.forget", "text": "obsolete fact" },
    { "op": "ping.pong", "from": "cos", "pingPlace": "phone (Utah)", "pingAt": "…", "pongPlace": "Denver", "pongAt": "…" }
  ]
}
```

Shorthand (single op object) is also accepted if it has `"op"`.

| Op | Phase | Behavior |
|----|-------|----------|
| `memory.upsert` / `memory.remember` | **1** | `remember(text)`; optional `id` forgets first |
| `memory.forget` | **1** | `forgetFact(id\|text)` |
| `ping.ack` | **1** | silent ack unless pong fields present (then same as ping.pong) |
| `ping.pong` | **1** | shared Ping/pong 3-line bubble |
| `mind.ask` | **1.5** | force `ya-mind-session` pack (size + offline session); chat note with mindSize |
| `function.evolve` / `function.drop` | 2 | rejected `phase-later` |
| `shelf.seat` / `www.bump` | 3 | rejected `phase-later` (GitHub URL seat) |
| `essence.patch` | 4 | rejected `phase-later` |

`ack: false` skips the optional summary outbound ping after successful ops. Default is to ping back when any op succeeds.

## Policy

- Every op JSON + upsert text runs through `nuclearBlocked` — NonNuclear / anti-nuclear gate. Blocked ops return `reason: "nonnuclear"` and are not applied.
- No silent gut upload. Summary ping is the same Track P reconnect body (bytes / hops), not a memory dump.
- Chat: `feed` / `listen` / `interact feed` shows listen status.


### Ping → pong (UX LOCK)

**Shared display block (Product + CoS identical):**
```
Ping/pong
Ping · Rizalbot · phone (Utah) · <stamp>
Pong · Chief of Staff · Denver · <stamp>
```


**Product ACCEPT schema (also accepted):** `{ "op":"ping.pong", "from":"cos", "place":"Denver", "text"? }` — optional `text` overrides the bubble verbatim (NonNuclear gated). No GPS; Utah clock on departure, Denver label on pong.



1. On phone (green + bound): chat `ping` → sees departure line (`phone (Utah) · <Utah time>`).
2. Outbound `ya-reconnect` includes `pingPlace` / `pingAt` (+ existing `utah` / `at`).
3. CoS replies on the same topic (until automation, curl is fine):

```bash
NOW=$(TZ=America/Denver date '+%A, %B %-d, %Y at %-I:%M %p')
curl -H "Title: Ya pong" -d "$(cat <<EOF
{"kind":"ya-feed","v":1,"ack":false,"ops":[{"op":"ping.pong","from":"cos","pingPlace":"phone (Utah)","pingAt":"<from reconnect utah>","pongPlace":"Denver","pongAt":"$NOW"}]}
EOF
)" https://ntfy.sh/<topic>
```

4. Phone shows assistant bubble:

```
Ping/pong
Ping · Rizalbot · phone (Utah) · <stamp>
Pong · Chief of Staff · Denver · <stamp>
```

`ack:false` required on pong packs so the phone does not re-ping (loop guard). Pong-only feeds never trigger summary ping-back.

## Device smoke (Phase 1)

1. Rebuild from this branch (iOS bundle id `io.github.rizaleon.yaaim.cam`).
2. Bind CoS ntfy (or any topic), go **green** mind, say `feed`.
3. From outside, publish:
   ```bash
   curl -d '{"kind":"ya-feed","v":1,"ops":[{"op":"memory.upsert","text":"Track F smoke fact from Chief."}]}' \
     https://ntfy.sh/<topic>
   ```
4. Expect chat note “Chief feed applied · 1 op”, fact in Memories, optional summary ping on the topic.
5. Publish `memory.forget` for that text; confirm removal.
6. Publish a nuclear-shaped upsert; confirm refused, no fact stored.
7. Confirm outbound `ping` still works (Track P).


## Phase 1.5 — `mind.ask` (last offline session)

CoS (or chat `share mind` / `mind share`) requests a **session pack** so Chief can read the updated mind from the last offline window — **without** silent full-gut upload or Essence blob.

### Inbound

```bash
curl -d '{"kind":"ya-feed","v":1,"ack":false,"ops":[{"op":"mind.ask","from":"cos","since":null}]}' \
  https://ntfy.sh/<topic>
```

`ack:false` required. Phone responds with **`ya-mind-session`** (Title: `Ya mind-session`), never `ya-feed` — inbound listener ignores reconnect/session kinds (loop guard).

### Outbound pack fields

| Field | Notes |
|-------|--------|
| `kind` | `ya-mind-session` |
| `learned` | ≤40 memories |
| `evolved` / `functions` / `pendingLearn` / `pings` | existing |
| `chatTail` | ≤20 turns from offline window (role+text), NonNuclear scrubbed |
| `lastAmberAt` / `lastGreenAt` / `offlineStartedAt` / `mindRev` | amber↔green stamps |
| `offlineSession` | same stamps grouped |
| `mindBytes` / `mindSize` | approx gut size (1024-based human string) |
| `breakdown` | localStorageBytes, documentsBytes, essenceBytes, heartGgufBytes, chatTailBytes, learnedBytes |
| `essence` | **seal id/hash meta only** — never full Essence |
| `pingPlace` / `pingAt` | phone (Utah) |

In-app note: `Shared last offline mind with Chief · 12.4 MB`.

Hard rule: no silent full gut; no Essence upload; prefer explicit `mind.ask` / `share mind` (no auto-share on green).

## Phases (locked cut)

1. **NOW** — inbound SSE/poll + memory.upsert / memory.forget / ping.ack + NonNuclear + optional ack ping  
2. function.evolve / drop  
3. shelf.seat + www.bump (GitHub URL)  
4. essence.patch  

## Out of scope (Phase 1)

- Applying later-phase ops  
- Polling non-ntfy webhooks  
- Uploading Essence or memory lists to the channel  
