# Design note — iOS Documents gut mirror (optional post-battery)

**Status:** design only. No Mac/Xcode work until phone battery fails #1–2 or CoS opens scope.  
**Branch context:** `track-m-memory` (M code + hygiene). Do not block M accept on this.

## Problem

WKWebView `localStorage` (`ya-aim-v0` / vault keys) can be evicted on iOS force-quit / storage pressure. Product bar: after force-quit on airplane, the app must still *be* the Rizal bot (Essence/persona sticky, prefs recalled, GGUF-off gut talk). Android WebView has been more durable; iOS is the risk.

Native already has Documents vault plumbing:

- `NativeVault.gutURL` → `Documents/gut/`
- `ConversationStore` → `gut/conversations.json` (append-only chat rows; **not** wired to www `state`)
- `YA_NATIVE` boot: `{ spine: 'ios-native', vault: 'documents', maxBytes: 4GiB }`
- Bridge ops today: `pick`, `share`, `generate`, `status` (no gut read/write for mind JSON)

## Goal

Mirror the www mind gut (at least `STORE_KEY` state + `VAULT_KEY` Essence list) into Documents so reload after eviction restores the same Rizal bot. GGUF/heart stays separate (`Documents/heart.gguf`).

## Proposed bridge ops (Swift `WebShell`)

| op | direction | payload |
|----|-----------|---------|
| `gut.write` | JS → native | `{ key, json }` write atomic file under `gut/` (e.g. `mind-ya-aim-v0.json`, `vault-ya-aim-vault.json`) |
| `gut.read` | JS → native | `{ key }` → reply `{ json }` or empty |
| `gut.clear` | JS → native | optional; align with Reset Essence |

Files stay offline, no iCloud, File Sharing already enabled for user visibility.

## Proposed www behavior (`app.js`, iOS spine only)

1. **On `save()` / `saveVault()`:** if `isNativeSpine()`, also `nativeAsk('gut.write', { key, json })` (debounce ~250ms).
2. **On boot `load()`:** if localStorage empty/corrupt and native spine, `gut.read` → hydrate `state` / vault, then write back to localStorage.
3. **Conflict rule:** newer `at` / `coreSeeded` / message tail wins; never drop Essence vault silently.
4. **GGUF-off / memory I/O:** unchanged — still must not depend on llama seated.
5. **Anti-nuclear / CORE_PRECEPTS:** stay in code; mirrored gut may omit re-seeded `Core:` spam (hygiene `forget core echoes` remains).

## Out of scope for first mirror

- Full IndexedDB migration
- Android SAF mirror (only if Android battery fails quit tests)
- Auto-push / Play-Apple login from assistant computers
- Devour/Q shelf→gut loader

## Verify (when built)

Re-run `docs/VERIFY-TRACK-M.md` items **1–2** on iPhone airplane mode after this ships. If they pass without mirror, shelve this design.

## Rebuild

Mac + Xcode: bump `ios/YaAim` www + `WebShell.swift` ops; USB install. No store login from box.
