# Handoff — Native X write / RBOT pin ask door
**Stamp:** 2026-09-17 · America/Denver (MT)  
**Branch tip:** `race-nesw-furthest` · PR https://github.com/RIZALEON/PROJECTR/pull/12  
**Face:** `@RizaltheBot` · `#RBOT` · pin `2100475587387347030`  
**Smoke ask:** `2100476375895519660`  
**Law:** NonNuclear · offline core unbroken · no Zernio/Postiz/Zapier · no ntfy-for-X · usage-light · draft_then_confirm default

## What landed

Native OAuth **tweet.write** pipe inside YaAim (Swift Keychain + `POST /2/tweets` with `reply.in_reply_to_tweet_id`).

| Layer | File | Role |
|---|---|---|
| Swift | `ios/YaAim/NativeX.swift` | PKCE connect · Keychain tokens · postTweet / reply · optional search pull |
| Bridge | `ios/YaAim/WebShell.swift` | ops: `xConnect` `xDisconnect` `xStatus` `xPost` `xReply` `xPull` `xSetClient` |
| Chat | `ya-rbot-x.js` (+ www/web mirrors) | connect x · rbot monitor · draft · publish · always reply · smoke rbot |
| Contract | `handoff/rbot-pin-contract.json` + `*/books/rbot-pin-contract.json` | one truth seat |
| URL | `Info.plist` | callback scheme `yaaim://oauth/x` |

Android parity: skipped (no cheap spine in this tip).

## Decider — create X app + paste Client ID

1. Open https://developer.x.com/en/portal/dashboard → **Create Project + App** (or use existing).
2. **User authentication settings** → On  
   - App type: **Native App** (public client, PKCE; leave Client Secret empty in app)  
   - Callback URI / Redirect URL: **`yaaim://oauth/x`** (exact)  
   - Website URL: `https://x.com/rizalthebot` (or GitHub pages)  
   - Permissions: **Read and write**  
   - Scopes used by pipe: `tweet.read` `tweet.write` `users.read` `offline.access`
3. Copy **Client ID** only. Never paste Client Secret into chat/gut/git. Placeholders in `NativeXConfig` stay empty in tip.
4. On device (USB YaAim rebuild with this tip):  
   - Chat: `set x client YOUR_CLIENT_ID`  
   - Chat: `connect x` → ASWebAuthenticationSession → approve  
   - Chat: `x status` / `rbot status` → Connected yes · @RizaltheBot

## Smoke (from app)

1. Mind green optional for monitor pull; **write works once connected** (network for API only).  
2. `smoke rbot` → drafts reply to ask `2100476375895519660`.  
3. `publish` (or `yes publish`) → public reply on X.  
4. Confirm live: https://x.com/RizaltheBot/status/2100476375895519660 (replies thread).  
5. Optional: `rbot monitor` pulls `conversation_id:2100475587387347030` (Elevated search may be required; fails soft).  
6. Safety: `always reply off` (default). `always reply on` only when Decider wants auto-publish.

## Chat verbs

| Say | Does |
|---|---|
| `set x client <id>` | Seats Client ID (UserDefaults + LS oauth config) |
| `connect x` | OAuth PKCE → Keychain |
| `disconnect x` | Clears Keychain tokens |
| `x status` / `rbot status` | Connection + pin door |
| `smoke rbot` | Draft to smoke ask |
| `rbot monitor` | Green pull + draft (confirm) |
| `rbot draft …` | Seat draft text |
| `publish` | POST reply |
| `always reply on\|off` | Auto vs confirm |
| `post tweet …` | Root post (no reply) |

## Blockers for Decider

- **Need Client ID** from developer.x.com (not in tip — by design).  
- Rebuild + USB install YaAim so `NativeX.swift` + `yaaim://` scheme ship.  
- X API write access / project tier must allow `POST /2/tweets`.  
- Recent search (`rbot monitor`) may need Elevated access — write/smoke reply does not.

## Forbidden

Zernio · Postiz · Zapier · social MCPs · Cursor Cloud Agents for this pipe · vault dump of tokens · ntfy as X transport.
