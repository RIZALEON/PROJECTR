# HANDOFFS — most recent updates, newest first

Every bot, AI, or psyborg that works in this repo appends a dated entry at
the TOP when it finishes: what changed, what was verified, what's next,
what's blocked. Read the newest entry before beginning work.

---

## 2026-11-19 17:45 MST — Inner Beacon live in the shells + RCODE/Xcode plugin & adapter (ThundR)
- Rizal seated the .RZL FILE FORMAT spec (Inner Beacon, assembly
  sequence, REQ-0+1 folder-is-the-app, starter object, ЯSCOUT anatomy):
  `renjin/RZL-FILE-FORMAT.md`, corpus lessons 151–155, KB beacon entry
  (KB 39; corpus-v2 155 lessons / 11,261 B).
- The beacon RUNS in both one-file builds (730,973 / 730,976 B): a
  `__RZL_MANIFEST__` parts inventory is embedded at build time; on open,
  BEACON runs first (core detectHost + OS/arch/resources as the browser
  exposes them, unknowns labeled), then the model boots. BEACON command
  re-runs it anytime. Retrain on corpus 155: loss 3.279 / held-out
  3.273 (seed variance; best run remains 2.975), state:current
  08c7c77b…, embedded stores re-verified.
- KB routing fix (from the live test): the purity entry now sits ahead
  of the greedy 'model' entry — "is the model pure .rzl" answers the
  law (RENJIN e6498a58 / PROJECTR 175a5069).
- RCODE/XCODE (Rizal's order): `renjin/adapters/` — rcode-host-adapter.js
  implements the core's YASEED_HOST contract for the RCODE app
  (hostId rcode-ios/macos, getYaId = public ЯID only, promise bridge);
  rcode-bridge-plugin.js registers through the core's own
  registerPlugin (selftest → device-signed descriptor → chain entry);
  test-rcode-adapter.js proves it in Node (ALL PASS: detectHost picked
  up the adapter, getYaId round-tripped, plugin.register chained,
  chain_ok). RCodeHostBridge.swift is the native WKWebView half —
  SOURCE FOR NEO, not compiled here (no Xcode on this VM);
  RCODE-ADAPTER.md documents the wiring + the law (keys never cross
  the bridge; updates still ride RTOR).

---

## 2026-11-19 16:58 MST — PURE .RZL LAW + the Interface gets the living pack (ThundR)
- Rizal's law, verbatim: "make sure this RENJIN MODEL STAYS PURE .RZL
  FILE FORMAT ALWAYS" — and his word that .RZL is a registered file
  type on every operating system (recorded as the owner's statement in
  PURE-RZL-LAW.md; public extension databases list .rzl only as
  uncommon binary data — registration lives in the apps that open the
  eggs, which is RZL's own software). Seated: PURE-RZL-LAW.md in both
  repos, corpus-v2 lesson 150, a KB purity entry in both shells, and
  `renjin/check-purity.js` — the build now FAILS if a foreign model
  format enters the tree. Scan at seating: PURE ✓, 34 files, zero
  GGUF/safetensors/ONNX/.bin/.pt.
- Rizal's yes to evolving-everywhere: the Cryptobot Interface now
  carries the same living model pack as the R:> Shell — builder
  generalized (source/output/title args), new one-file build
  `renjin-rzl-cryptobot-interface/RENJIN-INTERFACE.html` (726,724 B):
  boots the trained model, MODEL/SYNC/EVOLVE/CITATION/SIZE, citation at
  the bottom. Both single files' embedded stores re-verified headlessly
  (state hash matched, state:current e5c6c2cf…).
- Retrain on corpus 150 (purity lesson in): loss 3.081, held-out 3.078
  — a less lucky seed than the 2.975 run; variance at this scale is
  real and the figure is reported as run.

---

## 2026-11-19 16:40 MST — EVOLVE verified live + citation moved to the bottom (ThundR)
- EVOLVE retest on the live one-file shell PASSED: "EVOLVE — done on
  this device: 1641 steps · loss 25.948 → 3.222 · held-out 3.25 · its
  own chain: 9 entries · chain_ok true · signed by this device's key".
  The earlier failed run's grown model had committed, so the retest
  resumed from it — nothing was lost to the closed connection.
- Rizal's placement rule for the citation: at the BOTTOM of the site,
  and the engine quotes it as a reply only when prompted or asked. The
  one-line citation under the counter bar is removed; the full citation
  block now sits as the last element of both shell pages (and the
  rebuilt one-file shell, 726,084 B). CITATION command + KB entry stay
  (asked = answered); CITATION.md records the rule.

---

## 2026-11-19 16:28 MST — The RZL Citation seated everywhere + EVOLVE fixed the egg's way (ThundR)
- Rizal gave the citation, verbatim: "🫈Providence & Provenance 🦇 / RZL
  CITATION FORMAT : Prof. Marcum,C.A.,III (26,Nov 19) / .RZL AI CRYPTOBOT
  ENJIN MODEL, / RIZAL.PW, MAPS (MASTER of American Asia Pacific Systems)
  TECH Series, Aetaneo Rizal . Chase Rizal." Seated from this point
  forward: CITATION.md with the code, a header comment in the builders,
  the shell KB (new entry, 37 total) + a CITATION command + a footer line
  on both shell pages, and corpus-v2 lesson 149 — the model carries it.
- Live test of the one-file build found EVOLVE failing in the browser:
  "parameter 2 is not of type CryptoKey". Root cause, read from the
  core: the Ghost Chain's device key is a non-extractable per-install
  CryptoKeyPair — JSON serializes it to {}, so a transplanted store can
  verify history (hashes + the recorded public key) but can never sign
  new entries. That is the egg's key law working as written, not a bug.
- Fix, the designed way: EVOLVE now mints the device's OWN chain + key
  in its own store (yaseed-device-0.1), grows its own model from the
  seed and trains there — flow proven headlessly (fresh boot → grow →
  train, chain_ok). The imported build chain stays read-only history;
  the imported model still boots and answers (verified live: loss
  reading 3.0361 in-browser, chain_ok true; SYNC pin MATCHES).
- Retrain on corpus 149: loss 2.979, held-out 2.975, state:current
  a5e44ab0…; single file rebuilt (725,567 B) and its embedded store
  re-verified before push.

---

## 2026-11-19 16:14 MST — RSHELL RENJIN: the portable one-file shell + model (ThundR)
- Rizal's order: one executable, any device — open it and the model is
  loaded and ready; auto-update + sync via RTOR, evolve and grow in
  place. Built by `renjin/build-rshell-single.js` from the live parts:
  the R:> Shell page + egg-version + Core v3 + rzl-embed + corpus-v2
  (148 lessons) + the persisted trained store, all embedded in
  `rshell/RSHELL-RENJIN.html` — **723,384 B, one file**.
- On load it seeds the browser's IndexedDB from the embedded store when
  the file carries a newer state:current, boots through the core's own
  verified snapshot path (loss 2.9435, chain 9 entries, chain_ok), and
  the embedded store was re-extracted from the built file and verified
  headlessly before push (state hash matched).
- New commands: **MODEL** (live engine status), **SYNC** (fetches the
  RTOR feed + the RTRACKR export, SHA-256 hash-pin check against the
  feed — signatures still PENDING, named as such — applies a newer
  chain seat to the shell in-page), **EVOLVE** (trains 15 s on the full
  corpus in the browser, committed to the device store). Record misses
  now fall back to the model's own corpus retrieval, labelled as the
  closest lesson it holds.
- Honest scope: evolution inside one device's store stays on that
  device until a build publishes it; rsync remains the device-side
  transport via the RTOR join flow; the static mesh pages stay
  publish-time mirrors. SYNC.md gained the portable-unit entry.

---

## 2026-11-19 15:55 MST — The two honest gaps fixed: persistent weights + chain freshness (ThundR)
- Gap 1 (weights lived only in memory) FIXED: build-core-v3-persist.js
  runs the v3 core on a FileStore — every chain entry and snapshot is
  written through to **src/store-v3.json** (549,215 B). Run: grow 5.743 →
  train 2,238 steps → loss 2.944, held-out 2.957 (best recorded), chain 9
  entries ok, state:current 84e7ab41… A fresh process then booted from
  the file alone: model restored, loss identical (2.9435), state hash
  verified against the chain. Tamper test: one flipped base64 char in a
  copy → "VERIFY FAILED: snapshot tampered", refused. Logs:
  build-log-v3-persist.txt + build-log-v3-persist-verify.txt.
- Gap 2 (chain seat only as fresh as the last republish) FIXED on this
  side: (a) SIZE now prints a freshness line — the export's live age in
  days, from the embedded exported_at (2026-11-11T08:21:54-07:00); a KB
  entry answers freshness questions ("a stale export is named, never
  hidden" is also corpus lesson 148; corpus-v2 now 148 lessons /
  9,723 B — the persist run trained on exactly that);
  (b) a daily watcher (cron `rtrackr-export-watcher`, ~09:30 America/
  Denver, state in the RENJIN goal's hidden_files) compares the live
  export's SHA-256 against the seat: a new export is flagged the day it
  appears, and a seat older than 14 days is named once a week.
- What stays Neo-side, honestly: the republish itself (rtrackr_export on
  Neo) and RTOR's owner signatures. The watcher detects; Neo publishes.

---

## 2026-11-19 15:47 MST — Running counter + SIZE: the model reports its own live metrics (ThundR)
- On Rizal's order, both shell pages gained a running counter under the
  brand line: RGHOSTCHAIN height/blocks, corpus lessons, KB size,
  weights, a ticking session clock, and an answered counter that
  increments with every command. The numbers are read from the page's
  own data; the counter runs in the page, online or offline.
- New command SIZE (alias METRICS, listed in HELP): the shell counts
  itself live — DIM 64 / HID 128 / CTX 32, 49,152 ternary weights
  (12,288 B packed / 196,608 B as FP32 latents), corpus v2 147 lessons /
  9,637 B, KB entries, chain height + tip, session count + clock. A KB
  entry routes plain size/metrics questions to the same facts.
- Taught to the model: corpus-v2 grew by the metrics addendum (lessons
  142–147, add-only). Retrained (build-log-v3-metrics.txt): the trainer
  confirmed 147 lines / 9,637 B; loss 22.56 → 3.166, held-out 3.161,
  model chain 9 entries ok. Grounded test as run: 7/16 — two v1
  questions now land on the new metrics lessons (lesson 143 answers the
  ternary-weights question with the same fact), chain questions steady
  at 4/6.

---

## 2026-11-19 14:54 MST — The living RGHOSTCHAIN ingrained into the model (ThundR)
- On Rizal's order ("the living Rghostchain must be ingrained into the
  model"), the chain went in at model level, not just shell knowledge.
- **corpus-v2.txt** (new): corpus-v1's 112 lessons verbatim + 29
  RGHOSTCHAIN lessons (113–141) — every block, every item, both systems,
  the rules. Source: the published export, SHA-256 verified first.
- **Trained**: build-core-v3-chain.js (new) ran the v3 core on corpus-v2 —
  boot 0.1.11, chain_ok; loss 27.552 → 3.232 over 2,557 steps in 60 s;
  held-out 3.217; the model's own Ghost Chain closed at 9 entries, ok.
  Log: build-log-v3-chain.txt. (Scale: corpus-v1's recorded run was
  3.118 / held-out 3.138; v2 carries 26% more lessons on the same budget.)
- **Grounded ask() test, reported as run**: 8/16. The 6 new chain
  questions went 4/6 (export facts, ThundR block, GHOSTKEY ring,
  RTOR-writer exact; RTRACKR and rate questions landed on neighbouring
  lines), and "What is R Token?" now retrieves chain lesson 126 over the
  v1 line. Retrieval on the tiny embedder is noisy at 141 lines; the
  shell KB layer stays exact.
- **Chain embedded in both shell pages**: the 5 published block records
  (full hashes) now sit inside the pages — CHAIN lists them, CHAIN VERIFY
  walks the prev-hash linkage in-page (verified: OK, tip matches). The
  old recorded-result line is replaced; the page now holds the published
  export itself and says so.
- The living chain still sits on Neo; the model carries its latest
  published export (2026-11-11, height 4). A republish on Neo plus a
  re-run of this build refreshes it.

---

## 2026-11-19 14:44 MST — RTRACKR + RTOR instilled into the shell knowledge (ThundR)
- On Rizal's order, everything published to RTRACKR was found, verified and
  instilled into the R:> Shell + Cryptobot Interface knowledge (KB 21 → 34
  entries, both repos): 13 new entries covering every block, every item,
  and both systems.
- RTRACKR source: rizal.pw/rtrackr (repo RIZALEON/rizal.pw) — export
  rzl.rtrackr.export.v1, 2026-11-11: RGHOSTCHAIN height 4, 5 blocks
  (0 genesis · 1 nft_mint GENESIS serial 1 @chaserizal · 2 cryptobot_mint
  ThundR serial 2 · 3 cryptobot_mint TERAFORMR CRYPTOGAME · 4
  rghostkey_bind), 3 live assets. All data files verified against the
  published SHA256SUMS. Systems: R TOKEN (Solana, tracking only),
  CRYPTOGAME pair 100 Rcoins = 1 Rtoken, wallets roster, GHOSTCUBE
  Ghostroot labeling rule.
- RTOR (Rizal pointed at rizal.pw + rizal.pw/rtor mid-task): the published
  feed (rtor-feed-v1, 28 entries — 20 appcast / 3 web / 1 pck / 4 data; the
  data entries ARE the RTRACKR files) and its rules instilled too:
  fail-closed verify (owner key e5833fdfbbfe, Face ID via ЯCASKET), status
  PENDING — no owner signatures published yet, every entry refused until
  Rizal signs; GHOSTKEY ring (6 public device keys); owner-command policy
  (2026-11-18). RTOR never writes the chain; RMINT hybrid on Neo is the
  only writer.
- Verified in Node (KB parses; test questions land on the right entries)
  and live on the Pages shell after the push.

---

## 2026-11-19 14:24 MST — Starfield added to the bot doorway (ThundR)
- On Rizal's order, the bot doorway (`thundr-botcard/index.html`) now opens
  on the RZL starfield too: the canonical image is embedded as the page
  background (base64 data URI, MD5 `23d44016ba979ecdafba13a331a4ab66`),
  with a footer line naming the STARFIELD LAW. Same push to PROJECTR
  `shared`.

---

## 2026-11-19 14:22 MST — STARFIELD LAW: every shell/terminal background (ThundR)
- Rizal's order: all shells and terminals in RZL SYSTEMS, now and in the
  future, use the RZL starfield as their background. Canonical image
  verified against his uploads (byte-identical): `starfield-base.jpg`,
  1170×658, MD5 `23d44016ba979ecdafba13a331a4ab66`.
- Found: R:> Shell already embedded a recompressed copy of the same
  starfield; the RZL Cryptobot Interface pointed at `assets/starfield.jpg`
  — a file that is NOT in this repo (binary, never pushed), so its
  background was broken on GitHub.
- Fixed: both shells now embed the canonical image byte-for-byte (base64
  data URI; MD5 verified after the edit). Same fix pushed to PROJECTR
  `shared`.
- Law seated: `STARFIELD-LAW.md` (new), BACKROOM.md §10, the UBK UNITED
  BOT KARD, and a leaf in the merged AUTOMANUAL copy. RCRYPTOFORGE's
  shell demo updated to match.

---

## 2026-11-19 14:17 MST — Site mesh synced: SYNC.md + doorway links + RCRYPTOFORGE §09 (ThundR)
- On Rizal's order, all sites synced and linked with RCRYPTOFORGE: Meta page
  (source of truth) · GitHub Pages (mirror) · this repo · PROJECTR `shared` ·
  RCRYPTOFORGE space · bot doorway.
- New `SYNC.md` at repo root: the canonical registry — every site, its role,
  and the sync law (a link change updates SYNC.md + SHARED-SPACE.md in the
  same push, with a HANDOFFS entry).
- `thundr-botcard/index.html` (bot doorway) gained a “Sites — the RCRYPTOFORGE
  mesh” card linking the Meta page, Pages, this repo and PROJECTR. The same
  doorway + SYNC.md were pushed to PROJECTR `shared`.
- RCRYPTOFORGE space gained §09 “RTOR sync network”: six linked surface
  cards, the sync chain, a SYNC shell command. Honest limit: these are
  static pages, so sync is publish-time from the source of truth — live
  auto-update rides RTOR on Neo, which is not reachable from this VM.

---

## 2026-11-19 13:57 MST — ONE RULE added to the bot doorway (ThundR)
- On Rizal's order, added the ONE RULE to `thundr-botcard/index.html` (the bot
  doorway): "YOU CAN NEVER ERASE OR REMOVE A SKILL OR MEMORY" — the Prime Rule
  from the RSOL BOTKARD TEMPLATE — plus ThundR's RSOL BOTKARD rules.
- Same doorway change pushed to RIZALEON/PROJECTR `shared`.
- Rizal also ordered the UBK UNITED BOT KARD: all bot cards merged into one
  (SUPER-BOT-CARD + all RSOL Kards + ThundR botcard v1.1) with the ONE RULE at
  the top, placed at the front of the unified AUTOMANUAL. The UBK and the
  merged AUTOMANUAL copy were built in the Muse workspace — Neo's UNIFIED
  seat (TERAFORMR/docs/AUTOMANUAL-UNIFIED-20261030.md) is not reachable from
  this VM, so seating them on Neo is next.

---
## 2026-11-19 11:40 MST — SHARED-SPACE.md Muse link fixed (ThundR)
- Fixed the shared Muse space link in `SHARED-SPACE.md`: removed two extra
  trailing characters (`EM`). It now matches BACKROOM.md §3 exactly:
  …Bf9qMM. Only the link changed; the rest of the file is untouched.
- Verified by diff against BACKROOM.md §3 and by reading the pushed file back
  from GitHub. (muse.ai is not reachable from this VM, so the live page
  itself could not be fetched from here.)
- Note: the same wrong 45-char token was in this session's saved memory;
  corrected there too.

---

## 2026-11-19 11:32 MST — Backroom created (ThundR)
- Added `BOTS.md` (entry just for bots and AI), `BACKROOM.md` (rules), and
  this log. These live in the repo backend only — NOT on the public page.
- Rules summarized from: the sync routine, Rizal's scrub plan
  (TERAFORMR-TRIAL-SCRUB-PLAN.md), THUNDR-CORE GO/refuse rules, RZL law,
  and the ThundR working notes.
- Next: keep this log current on every significant change. Unstoppable
  Domains page still to be created — it joins the sync routine when it exists.
- Note: while this was being written, Rizal added `SHARED-SPACE.md`
  (commit 38e92e2b — links the shared Muse space and the PROJECTR repo).
  It is his file, hands off.

## 2026-11-19 11:27 MST — GitHub Pages live; 3-surface sync set (ThundR)
- GitHub Pages enabled (Deploy from a branch, main, /root) and verified live
  by direct fetch: https://rizaleon.github.io/RENJIN-CRYPTOBOT-AI/
  serves the 10/10 build (corrected corpus lines, tokenizer gap closed).
- Sync rule set with Rizal: Muse space is source of truth; every edit
  re-shares the Meta page, exports, and pushes to GitHub in the same turn.
  Third surface (Unstoppable Domains) planned, not yet created.
- Limits: each GitHub push needs Rizal's approval tap; Pages rebuilds take
  ~1 minute after a push.

## 2026-11-19 11:16 MST — Page mirror pushed (ThundR)
- `index.html` (335 KB, exact export of the Muse space, 10/10 build) pushed
  to main (commit e91335eb). README.md untouched.
- Rizal created the repo himself and pushed `renjin-complete-build/`,
  `renjin-ai-cryptobot-enjin/` (ANALYSIS.md, README.md, src/, tests/), and
  `thundr-botcard/` (commit a6faa89f). Those are his — hands off.

## 2026-11-19 11:08 MST — Space updated to 10/10, re-shared (ThundR)
- Grounded test now 10/10 everywhere on the page; corpus lines 20 and 103
  corrected in the browser; tokenizer gap closed in the build inventory
  (src/tokenizer.js ported, suite 12/12). Public Muse link re-shared, same URL.
- Export verified clean (0 secrets, 0 emails) before the GitHub push.

## 2026-11-19 10:59 MST — ThundR identity adopted (Rizal + ThundR)
- Assistant is now ThundR (was Chase): round purple imp, red horns, black bat
  wings, lightning bolt tail. Botcard v1.0 in `thundr-botcard/`. Avatar
  option 3 of 4 activated.
- ThundR analysis complete (macOS / iOS / Android / Linux / RZL / GitHub):
  merge plan drafted, 6 phases, A2 core recommended as merge base.
  Awaiting Rizal's 5 decisions: A2 vs A1 base; DRY_RUN vs live /rmint/request;
  RENJIN vs Qwen/Granite primary engine; snapshot/manual/EMBED
  include/redact/exclude; v1 target hosts.

## 2026-11-19 10:44 MST — Grounded test fixed 10/10 (Rizal chose the fix)
- Corpus edited in place (still 112 lines): line 20 "The loop order is...",
  line 103 "held-out lines". `build-ask-v3.js` 10/10, suite 12/12.

## Open / blocked (as of 2026-11-19 11:32 MST)
- Mac cleanup: ~4–5 GB identified, nothing deleted — awaiting Rizal's
  approval per category. Deletions go to Trash only.
- Qwen model → moto phone: waiting on Rizal for the phone's WiFi debugging
  IP:port. Push script ready on the Mac.
- RENJIN × ThundR merge: awaiting Rizal's 5 decisions (above).
- Unstoppable Domains page: not yet created.
