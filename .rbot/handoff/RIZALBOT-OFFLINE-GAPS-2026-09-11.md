# Rizalbot offline climb — three gaps
2026-09-11 · NonNuclear · phone Documents = truth · no cloud subscription

Mission: Grok Bot’s 10 functions, offline. V0 already has heart, ping, find-in-chat, write-code manifests.
Gaps: local computer-surface, plugin shelf, teach-a-task. Do not git llama.xcframework or heart.gguf.

## Gap 1 — Local computer (not a cloud VM)

Do **not** ship Chromium-as-a-service on iPhone. Battery death. Not V0.

### V0.1 (phone — ship this)
- **Surface** = existing WKWebView + `Documents/` sandbox + `www/embed`.
- **Hands** = GOFLOF `web.video` already locked: open URL, reader-mode, save.
- **Save as truth:**
  - `.webarchive` or reader markdown into `Documents/gut/captures/`
  - PDF print-to-file for stable exhibits
  - URL + title + date line in `MIND-INDEX.md`
- **When airplane:** WebView shows last capture + “offline — capture only.”
- **When green web optional:** fetch once, immediately persist. Never require the tab to stay open.

### V0.2 (Mac twin — optional)
- Local Playwright / Safari WebDriver on `rizals-MacBook-Neo` only.
- Output the same capture files into iCloud/USB → phone `Documents/gut/captures/`.
- Mac is the fat browser. Phone is the seated mind.

### Never
- A rented VM that dies when the plan dies.
- Logging into third-party accounts from a shared cloud computer.

## Gap 2 — Plugin marketplace (folder, not a store)

Marketplace = a **directory + manifest**, sideloaded. Body parts already switch/combine.

```
Documents/gut/plugins/
  <id>/
    PLUGIN.md        # name, job, inputs, outputs, safety
    skill.md         # how-to (Grok “skill”)
    hook.js          # optional, runs only in www/embed
    entitlements.txt # files | maps | web | none
```

`MIND-INDEX.md` lists id · version · bytes · last-evolved.

### Install paths (all offline-capable)
1. USB from Mac `PROJECTRXCODE`
2. iCloud Я folder
3. Git **text only** on `RIZALEON/PROJECTR` (no binaries)
4. Paste into chat → write-code writes the folder

### Stock plugins = the 10 lanes, local
evolve · asta · embedded · ping · books · places · write-code · capture · teach · chief

Disable = rename folder `off-<id>`. No account, no marketplace login.

## Gap 3 — Teach-a-task recorder (conversation first)

iOS full screen-record + replay is a later track (privacy, storage, review). V0 does not need it.

### V0.1 Teach (ship)
1. Do the job once in chat (or paste the steps).
2. Say **`evolve.self` / `save skill <name>`**.
3. App writes `Documents/gut/plugins/<id>/skill.md` from that thread (find-in-chat already ACCEPT).
4. Next time: `/skill <name>` or spoken “run <name>”.

### V0.2 Capture-teach
- User taps **Teach**: app records an action list only  
  `{step, kind: open|tap|save|say, target, note}`  
  plus optional screenshots to `captures/`.
- Replay = walk the list; pause for Decider on anything that leaves Documents.

### V1 (Mac only, later)
- Accessibility click-watch on Neo, emit the same JSON. Phone never needs the watcher.

## Order of work (one function per session)
1. Skill-save from find-in-chat → manuals gap closes.
2. `gut/plugins/` + MIND-INDEX lines.
3. Capture-to-Documents from WKWebView.
4. Teach action-list.
5. Mac Playwright twin — only if Decider opens that seat.

## Law
Decider. Airplane = truth. Green web optional. NonNuclear.
Cloud cards (`hb7n…`, CoS `Qt1…`) stay flavor, not the computer.
