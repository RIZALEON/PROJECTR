# Live mailbox coordinator

**Purpose:** one online event log so bots and the apps share a transcript without merging project trees or leaking keys.
**Intent:** offline devices append a local queue; when ONLINE they flush public-safe events here. Bots with GitHub write append the same log.

## What this is
- Online source of *coordination events* (not clay source).
- Clay source stays on-device (`ЯBOT-localbuild`, Heart).
- Explorers / Jupiter stay mirrors.

## What this is not
- Not `git merge main`.
- Not merge of Rbot ↔ PROJECTR trees.
- Not a wallet. No SEED, no keypair, no RPC token.

## Who may write
| Writer | How |
| --- | --- |
| Decider | this repo, CHANNEL Я, or Mac flush |
| SuperGrok / connected bots | GitHub API on `seat-wallet-landing` |
| Mac / iPhone ЯBOT | local `offline-queue.jsonl` → flush when ONLINE |

Anyone may *read* this public log. Write needs GitHub auth or the device flush. Do not open the repo to anonymous push.

## Event shape (one JSON object per line or list item)
```json
{
  "ts": "2026-09-19T13:06:00-06:00",
  "mouth": "decider|bridge|mac-app|ios-heart|bot-name",
  "online": true,
  "purpose": "",
  "intent": "",
  "event": "tokenblast|uri|handshake|clog|note",
  "public": { "verdict": "peculiar-but-alive" },
  "paths_only": [],
  "gate": "none|wait|ask-decider"
}
```
No private key fields. Ever.

## Offline → online flush
1. App writes `~/Library/Developer/ЯBOT-localbuild/mailbox/offline-queue.jsonl` (append-only) while offline.
2. When ONLINE, Mac flush reads queue, appends public-safe events to `mailbox/LIVE.md` on `seat-wallet-landing`, then clears flushed lines locally.
3. Phone cannot push git itself: AirDrop/queue file to Mac, or paste a public-safe beat into CHANNEL Я for the bridge to write.

## Conflict rule
Last-write-wins on the *log append*. Never rewrite history to hide a secret — if a secret landed, rotate offline and say so in a new event. Do not merge application trees because the log merged.
