# APP FIX — RDRAGON · RKODE · ThundR (ЯBOT) on the 17e — 2026-11-19
## Diagnosis (confirmed by the owner's screenshots)
All three native apps answer **"Is No Longer Available."** Same single cause for all three: they were installed under a development provisioning profile that has **expired** (free Apple ID profile: 7 days · paid developer profile: up to 1 year · TestFlight build: 90 days). iOS keeps the icon and the app's data; it refuses to launch the binary. Nothing in GitHub, Pages, RKLOWD, or the Muse bridge can re-sign an installed app — re-signing happens only on a Mac with Xcode, or via TestFlight/App Store.

## Fix A — tonight, no Mac needed (DONE, pushed with this leaf)
The three seats live as installable web apps on Pages — same code the shells already run (corpus-v2 162 · KB 43 · LIVE · MONITOR · RKLOWD III), and web apps **never expire**:
- RDRAGON seat → https://rizaleon.github.io/RENJIN-CRYPTOBOT-AI/renjin-complete-build/rshell/RSHELL-RENJIN.html
- ThundR seat → https://rizaleon.github.io/RENJIN-CRYPTOBOT-AI/
- RKLOWD III seat → https://rizaleon.github.io/RENJIN-CRYPTOBOT-AI/rklowd-iii/RKLOWD3-TRANSPONDER.html
On the 17e, in **Safari**: open the link → Share → **Add to Home Screen**. (Home-screen install meta seated 2026-11-19: apple-mobile-web-app-capable + titles RENJIN / RDRAGON / RKLOWD III.) Keep the dead native icons until Fix B lands; deleting a native app can delete its local data.

## Fix B — native revival, at Neo (the permanent fix)
1. **RKODE** — source is backed up: private repo **RIZALEON/RCODE** ("RCODE backup", Swift, updated 2026-11-16). Clone on Neo, open in Xcode, sign with the owner's team, run on the 17e (Window → Devices and Simulators, or Run with the 17e selected). Over-installs in place; data survives if the bundle id is unchanged.
2. **RDRAGON** — no GitHub repo exists (searched 2026-11-19); the source seat is Neo-local. Rebuild from the Neo project, same signing, install over the dead seat.
3. **ThundR (ЯBOT)** — same: Neo-local project (ThundR 0.1.11 line), rebuild + over-install.
4. To stop the yearly/weekly death cycle: ship via **TestFlight** (90-day builds, auto-update) or an **Ad Hoc / App Store** profile (1 year / permanent). Free-profile sideloads will keep dying every 7 days — that is Apple policy, not a bug in the apps.

## What did NOT cause this
Not RNETWORK-HARDEN-1 (a policy leaf — it removes no apps and no paired devices), not the RKLOWD III push, not the removal of the RSCALE stack on Neo. The profiles simply reached their expiry date.
