# Gap map — green / online web mind (browse clamps)

**Against tip:** `b3c0163` (`race-nesw-furthest`)  
**Target (Decider):** green mind browsing feels immaculate / broad — any legitimate site, social, video, audio.  
**Law:** legitimate browse only. **Out of scope forever this track:** credential theft, paywall bypass, TOS-violating scrape, silent upload, nuclear help.

---

## Clamp inventory (what gates green web today)

| Gate | Where | Behavior |
|------|-------|----------|
| `mindWantsWeb()` | `app.js` (+ `web/app.js`, `ios/YaAim/www/app.js`) | True only when `state.mindOnline` **and** `navigator.onLine` **and** `fnEnabled("web.search")` **and** immune not tripped. Single master green-web gate for search / link / unknown-lookup / video ask. |
| `web.search` | `functions[]` id, enabled by default | Required by `mindWantsWeb`. Not in immune-locked drop list (can be disabled). |
| `web.link` | `functions[]` id, enabled | Declared; **not** consulted by `describeLink` / link paste path (only `mindWantsWeb` / `web.search`). |
| `web.video` | GOFLOF F2 senses id (locked) | Hands/senses label — **not** the browse allow gate. Green nerves still open sites/videos via mind online. |
| Wikipedia-only search | `webSearch()` → `en.wikipedia.org` API + REST summary | Green “look it up” / harvest / person-unknown = Wikipedia stub, not open web search. |
| Link fetch | `fetchLinkRaw` → `r.jina.ai/` reader | Any `http(s)` URL when green; no domain allowlist. Junk/wall filter refuses CAPTCHA / sign-in / robot walls (`WALL_MSG`). |
| YouTube path | `youtubeId` host allowlist + `describeYoutube` | Hosts: youtu.be / youtube.com (+ m/music/nocookie). Metadata via noembed / oembed / Invidious instances; captions when available. |
| Amber stub | `answer()` when `!mindWantsWeb()` | Queues via `queueLearn`; replies “tap the light green…” — no live fetch. |
| `ISOLATED = true` | top of `app.js` | Skips GitHub evolution pull/push, unbound ambient reconnect, HF heart download when no packed/native seat. **Does not** block Wikipedia / jina / YouTube fetches when green. |
| iOS ATS | `ios/YaAim/Info.plist` | `NSAppTransportSecurity` → `NSAllowsLocalNetworking` only. No `NSAllowsArbitraryLoads`. Default ATS = HTTPS for remote. |
| iOS shell | `WebShell.swift` | Local `www` file URL; `allowsInlineMediaPlayback = true`; no `WKNavigationDelegate` / no `SFSafariViewController` / no external openURL policy. |
| `ya-search-bots.js` | spine / handoff only | **Missing** from tip load order (not in repo root / www). |
| Android NSC | — | **No** Android project / `network_security_config` in this tip. |

Mirrors of the JS clamps: root `app.js` ≡ `web/app.js` ≡ `ios/YaAim/www/app.js` (same `mindWantsWeb` / `webSearch` / `describeLink` / `WALL_MSG`).

---

## Open vs blocked (feel of green today)

**Open when green + signal + `web.search` on**
- Wikipedia search + summary keep-to-gut (`lookUpAndKeep` / `harvestOnline`).
- Paste any http(s) link → jina reader → outline/body keep (unless junk/wall/nuclear).
- YouTube URLs → title/channel/description/captions note (best-effort public metadata).
- World time APIs (Utah) as a side path.

**Blocked / stubby / missing**
- General web / social / news search (not Wikipedia) — **no** DuckDuckGo / Brave / Bing / Google path; `ya-search-bots.js` absent.
- Amber: all live browse queued, not fetched.
- Login walls, CAPTCHA, consent shells → `WALL_MSG` (intentionally not saved).
- Immune tripped → nerves cut (`mindWantsWeb` false).
- `ISOLATED` still blocks cloud GitHub sync / unbound ambient ping paths (orthogonal to browse).
- No in-app SFSafari / system browser handoff for “open this site for me to watch.”
- No Android NSC story in-repo.

---

## Proposed thin first unlock (concrete, small)

**Seat a green-only second search backend behind `web.search` — document + one script, no paywall work.**

1. Add `ya-search-bots.js` (as spine already names) loaded only when `mindWantsWeb()` is true.  
2. Keep Wikipedia as primary; add **one** public, ToS-friendly HTML/JSON endpoint for non-wiki queries (e.g. DuckDuckGo Instant Answer / lite HTML summary — public results only).  
3. Wire `webSearch(query)` → try wiki → if null/junk, try bot → remember extract; still run `wikiJunk` / `isLinkJunk` / `WALL_MSG` / `nuclearBlocked`.  
4. Do **not** change amber queue behavior; do **not** enable unbound cloud under `ISOLATED`.  
5. Optional micro-fix (same PR or next): gate paste-link path with `fnEnabled("web.link")` so the declared function matches reality.

This widens “look it up” beyond Wikipedia without claiming any-site scrape, login, or media DRM.

---

## Stays out of scope

- Credential capture, cookie/session theft, autofill of logins.  
- Paywall / soft-paywall bypass, archive-of-paywalled-text as a feature.  
- TOS-violating bulk scrape; captcha farming; “I’m not a robot” defeat.  
- Silent gut upload; nuclear assistance.  
- ASTA shelf devour / write-code CoS tracks (separate gaps — see `GAP-COS-EMBED-*.md`).

---

## Unlock shipped this turn?

**No.** Audit + this gap doc only. No browse unlock code (not a one-line document-only fix beyond this file).

**Tip note:** Commit lands on `race-nesw-furthest`; SHA reported after push.
