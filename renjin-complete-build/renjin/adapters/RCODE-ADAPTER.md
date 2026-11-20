# RCODE / XCODE ADAPTER — the direct plugin + host bridge

Built 2026-11-19 on Rizal's order: "create a direct plugin and adapter
to Xcode agent and rxcode."

## What was built (and proven here)

| Piece | File | Status |
|---|---|---|
| Host adapter (JS) | `adapters/rcode-host-adapter.js` | ✅ tested in Node |
| Core plugin | `adapters/rcode-bridge-plugin.js` | ✅ registered on a live engine in the test: selftest passed, device-signed descriptor stored, `plugin.register` chained |
| Test | `adapters/test-rcode-adapter.js` | ✅ ALL PASS (`detectHost → rcode-mock`, getYaId round-trip, chain_ok) |
| Native bridge (Swift) | `adapters/RCodeHostBridge.swift` | 📄 source for Neo — no Xcode toolchain on the build VM; static-checked only, compiles in the RCODE target on the Mac |

## How it wires

1. **RCODE** (the Xcode-built app on iPhone 17e / MacBook Neo) attaches
   `RCodeHostBridge` to its shell webview. The bridge injects
   `rcode-host-adapter.js` at document start and calls
   `RCodeHostAdapter.install()`.
2. The adapter sets `globalThis.YASEED_HOST` — the core's own
   host-adapter contract (`detectHost()` prefers an injected host over
   its stub). From that moment the engine knows it is running inside
   RCODE: hostId `rcode-ios` / `rcode-macos`, platform, and a
   promise-based `bridge.call(method, args)` into the native side.
3. The shell/app registers `RCodeBridgePlugin` through
   `engine.registerPlugin(...)` — the core's admission path: plugin
   selftest → device-signed descriptor (`yaseed.model-plugin` scope) →
   `plugins:list` + a `plugin.register` Ghost Chain entry. Nothing is
   admitted silently; a failed selftest is chained as `plugin.reject`.
4. Through the plugin facade, the model side can `getYaId()` (the
   PUBLIC ЯID, answered by RCODE) and `callNative(method, args)` for
   whatever the native side allows (build requests to the Xcode agent
   host, file pickers, share sheets). The Swift handler serves an
   allowlist only (`getYaId`, `hostInfo` today) and refuses the rest.

## Standing law on this bridge

- **Keys never cross the bridge.** No key material, no signatures on
  the model's behalf. Signing stays in RCODE's own Face ID / ЯCASKET
  path; bots never sign (corpus law).
- **Fail-closed.** No native side attached → `callNative` throws a
  plain refusal; `getYaId` returns null. The adapter never fakes a
  native result.
- **Updates still ride RTOR.** This adapter is the runtime bridge, not
  an update channel: RCODE appcasts arrive via RTOR (hash-pinned,
  owner-signed when published), and the native updater may set
  `YASEED_HOST.releaseSha256` after verifying one — the hook the core
  already reads.

## The remaining step (Neo side)

Compile `RCodeHostBridge.swift` into the RCODE target in Xcode, bundle
`rcode-host-adapter.js` + the core + a shell page as webview resources,
and the egg runs inside RCODE with the bridge live. That build happens
on Neo — this VM has no Xcode, and the GHOSTKEY ring already carries
RCODE's device keys (iphone-17e, macbook-neo, approver) for the RTOR
side of the pairing.
