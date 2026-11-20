# LIVE — the live stats board in the RENJIN ThundR shell

The method, integrated 2026-11-19 on Rizal's order: ThundR displays
the live GHOSTCHAIN, RTOR and the integrated ENJIN in the RENJIN
ThundR crypto shell window, on command.

## The command

Type `LIVE` (aliases: `LIVE STATS`, `BOARD`) at the `R:\>` prompt in
either shell — the R:> Shell or the Cryptobot Interface, plain page
or one-file build. The board is read **at call time**, never baked:

- **GHOSTCHAIN (via RTRACKR)** — fetches the published export
  (`rizal.pw/rtrackr/data/rghostchain.json`), hashes it (SHA-256),
  and prints height, block count, live assets, tip, the prev-hash
  linkage walk (OK / BROKEN), the export timestamp, and whether the
  hash matches this shell's seat.
- **RTOR** — fetches the feed (`rizal.pw/rtor/feed.json`) and prints
  its version, entry count and signature status. PENDING is named
  plainly, never hidden: signed: false means every entry is refused
  until its `.sig.json` verifies against owner key `e5833fdfbbfe`.
- **R TOKEN (via RTRACKR)** — fetches the three small tracker files
  (`rtoken.json`, `economy-rates.json`, `token-pool.json`, ~17 KB
  total) and prints supply, mint, crown authority, the watched
  holder's balance and share, the CRYPTOGAME pair rate and cap, and
  the Orca Я/SOL pool vaults, TVL and FDV. These are **snapshots,
  not a live RPC poll** — every figure carries its snapshot date
  (holder 2026-11-07; rates and pool 2026-11-14), and the line says
  so. Tracking only: no swaps, no liquidity actions, no keys.
- **ENJIN (this shell)** — the integrated engine's own stats, counted
  in the page: egg version, loss, model chain entries, store kind,
  corpus lessons, KB entries, 49,152 ternary weights, the RKLOWD
  queue count, and the session's answered count.

Each section fails independently: an unreachable source prints its
fallback line (the embedded seat for the chain, the last known feed
state for RTOR) and the rest of the board still renders.

## Authorization

Display is read-only: nothing is signed, nothing is written, no keys
are touched. Authorization in RZL SYSTEMS is the owner's recorded
command — **the Face ID necessity was removed by the owner's ruling
(2026-11-19)**. ThundR acts on the command, and ThundR still never
signs.

## Teaching

The model itself knows the board: corpus-v2 lessons 159–160, the
shell KB entry ("live stats"), and the HELP line. Retrains carry it
like every other lesson — add-only, never erased.

## Seats

- Builder: `renjin/build-rshell-single.js` (`liveNow()` in the model
  pack; handler `live` / `live stats` / `board`).
- Built into both one-file builds; the plain shell pages carry the
  KB entry and counters.
- Recorded in the AUTOMANUAL botcard section (RTHUNDR card leaf,
  2026-11-19) and kept as the reusable skill `renjin-live-stats`.

## MONITOR — the live GHOSTCHAIN watch (added 2026-11-19, Rizal's order)

`MONITOR` starts a standing watch in the shell; `MONITOR OFF` stops it; `MONITOR STATUS` reports it. Every 60 s a tick runs **hash-first**: it fetches only the RTOR feed (~13.5 KB), reads the `rtrackr.rghostchain` pin, and compares it to the shell's seat (`__RZL_EXPORT_SHA__`). The ~6.6 MB chain file is pulled **only** when the pin moves — then the tick prints `CHAIN MOVED` with the new export date, height and tip, and points at SYNC. When the pin matches, the tick prints the seat as current (feed pin · chain file size · height · tip).

Each tick also keeps the **RTOR send/receive systematics**: feed version and entry count, total payload moved per full sync (sum of entry sizes), bytes received per check and per session, and the send side — the RKLOWD outbox's waiting records and bytes (the shell itself sends nothing else and signs nothing). Changes print as they land; unchanged ticks stay silent.

The monitor rides in **every RENJIN seat**: both shell pages, both one-file builds, the model (corpus-v2 lesson 162), and by this spec every app and device seat. Taught as corpus-v2 lessons 161–162 together with the mint-law amendment (below).

## Law amendment seated the same round (2026-11-19, Rizal's recorded command)

Player-command mints write the real RGHOSTCHAIN automatically through RMINT on Neo — no per-mint sign, no Face ID — priced by the Rtoken ↔ Rcoin pair, shown live on RTRACKR and RWALLET. Corpus-v2 lesson 161; the shell's mint KB entry carries the amendment; bots still never hold keys and never sign releases.
