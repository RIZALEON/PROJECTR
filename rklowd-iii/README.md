# RKLOWD III — folder + transponder
Owner command 2026-11-19 21:40 MST. Successor seat to RKLOWD (pink folder, 11 items on the 17e).

- `RKLOWD3-TRANSPONDER.html` — the transponder page. Open it on the iPhone (any browser):
  SCAN collects every signal the device gives a page (battery, network, screen/touch,
  timezone, geolocation with your permission, online state), hashes the packet (SHA-256),
  queues it in OUTBOX (localStorage, store-and-forward), SEND exports it as a JSON file
  you can save **anywhere into the iPhone** (Files → RKLOWD III/outbox, iCloud, AirDrop).
  MONITOR fetches the RTOR feed and hashes it; packets are never lost offline.
- `rklowd3-transponder.js` — Node seat (Neo/VM): polls RTOR feed + RTRACKR GHOSTCHAIN
  export, appends hash-chained ticks to MANIFEST.jsonl.
- `MANIFEST.jsonl` — append-only hash chain, record of truth. Never edited or deleted.
  Seeded with the REAL 17e signals Muse pulled live on 2026-11-19 21:38 MST
  (presence online, Bluetooth scan 42 devices / strongest −66 dBm, HomeKit granted…).
- Folders: drop/ inbox/ sent/ outbox/ queue/ nodes/{17e,neo,moto,pw}/
- Signal types with NO path (honest): iOS Files contents, app install/launch state,
  device shell — the Muse bridge exposes no such command. Everything else is wired.

TRANSFER ANYWHERE INTO THE iPHONE: the zip of this folder is delivered in chat —
tap it → Save to Files → pick ANY location (On My iPhone → RKLOWD, iCloud Drive, …).
The transponder page also runs straight from Pages/GitHub once pushed.
STARFIELD LAW: the transponder page embeds the canonical starfield (MD5 23d44016…).
