# RBOT Pin Contract 0.1
**Status:** LIVE · pin seated 2100475587387347030  
**Face:** `@RizaltheBot` · tag `#RBOT` · agent Яbot  
**Law:** living beings ask on the pin → RBOT always replies · native X write path seated (draft_then_confirm default) · NonNuclear · SourceClaim

## 1. Public pin post (paste + Pin on profile)

```
@RizaltheBot · #RBOT
Ask or comment on this pin — RBOT always replies here.

Я OS · Я Kode · Я Game · ЯBOT · Я Krypto · Я Coin · Я Chain · Я anti-nuclear ECO System: source monetization · true origin citation · attribute · mint · buy · sell · trade · benefit.
the future is Я.
```

Chars: 276 / 280. After post: copy the permalink → fill `pin_url` / `pin_post_id` below → pin on https://x.com/rizalthebot

## 2. Link address (one truth all layers share)

| Field | Value | Notes |
|-------|-------|-------|
| `handle` | `@RizaltheBot` | public profile |
| `tag` | `#RBOT` | respond + monitor tag |
| `pin_url` | `https://x.com/RizaltheBot/status/2100475587387347030` | full `https://x.com/RizaltheBot/status/<id>` |
| `pin_post_id` | `2100475587387347030` | numeric status id = conversation root |
| `conversation_id` | `2100475587387347030` | X search: `conversation_id:<id>` |
| `policy` | `always_reply_living_beings` | skip bots/spam/self |
| `publish` | `draft_then_confirm` until write API | paste or authorized browser |
| `chain_claim` | `PENDING 0x…` | Я Chain mint of this pin SourceClaim |
| `mind_path` | `Ya/mind/books/rbot-pin-contract.json` | app shelf seat |

## 3. Code object — embed in app mind + chain

Seat this JSON (update PENDING after pin):

```json
{
  "schema": "rbot.pin.contract/0.1",
  "product": {
    "face": ["Я OS", "Я Kode", "Я Game", "ЯBOT", "Я Krypto", "Я Coin", "Я Chain", "Я anti-nuclear ECO System"],
    "line": "source monetization · true origin citation · attribute · mint · buy · sell · trade · benefit",
    "close": "the future is Я"
  },
  "x": {
    "handle": "RizaltheBot",
    "tag": "RBOT",
    "pin_url": "https://x.com/RizaltheBot/status/2100475587387347030",
    "pin_post_id": "2100475587387347030",
    "conversation_id": "2100475587387347030",
    "monitor_query": "conversation_id:2100475587387347030 -is:retweet",
    "tag_query": "#RBOT -is:retweet"
  },
  "policy": {
    "always_reply": true,
    "who": "living_beings",
    "skip": ["spam", "off_topic", "self", "pure_media_no_ask"],
    "publish": "draft_then_confirm"
  },
  "chain": {
    "network": "Я Chain",
    "claim_type": "SourceClaim",
    "subject": "public_ask_door_pin",
    "address": "PENDING",
    "traceId": "PENDING"
  },
  "app": {
    "monitor": true,
    "poll": "conversation_id + #RBOT",
    "seat": "mind/books + Track B retrieve-before-reply",
    "offline": "cache last seen replies; sync green when optional"
  }
}
```

## 4. How the three layers stay one door

1. **X profile** — post above → Pin. Permalink is the public link any being uses.
2. **RBOT / Яbot** — watches `conversation_id:<pin_post_id>` and `#RBOT`; drafts reply to every real ask; Decider confirms publish until auto-write exists; law is always-reply.
3. **App mind** — seats `rbot-pin-contract.json`; green path monitors same `conversation_id` / `#RBOT`; offline keeps last tape; retrieve-before-reply knows the door.
4. **Я Chain** — mint pin as SourceClaim (`address` + `traceId`); app + bot cite that claim when answering; monitor events keyed by `pin_post_id`.

## 5. Decider next (thin)

1. ✅ Posted + linked: https://x.com/RizaltheBot/status/2100475587387347030 — confirm Pin on profile if not already.  
2. ✅ Pin ids seated in `rbot-pin-contract.json` + mind/books mirrors.  
3. **Create X app** (Native App, callback `yaaim://oauth/x`, Read+Write) → paste Client ID in app: `set x client …` → `connect x` → `smoke rbot` → `publish`. See `HANDOFF-NATIVE-X-WRITE-RBOT-2026-09-17.md`.  
4. Mint Я Chain SourceClaim when address ready (still PENDING).  
5. Optional: weekday pin digest (usage-light) after write smoke passes.

