# Seat llama.xcframework (Metal) into YaAim

**Goal:** real offline token generate from `Documents/heart.gguf` via NativeHeart — not wasm, not cloud.

MITHRIL (App Store *Local LLM: MITHRIL*) is a **borrow lab only** — never rename their tile to Я. Same GGUF can later land in our Documents.

## Law

- 100% offline for core chat. **No cloud LLM fallback.**
- Framework binary is built on **Mac** (this Linux box cannot emit `llama.xcframework`).
- Signing team: **88HACKXHZL** · bundle `io.github.rizaleon.yaaim.cam` (see ANALYSIS notes). Empty `DEVELOPMENT_TEAM` in pbxproj until Mac fills it.

## Build (borrow from llama.cpp)

```bash
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp
./build-xcframework.sh
# → build-apple/llama.xcframework
```

Or borrow a known-good xcframework from a prior Mac archive / CI artifact. Keep **Metal** enabled.

## Link in Xcode (Mac)

1. Open `ios/YaAim.xcodeproj`.
2. Drag `llama.xcframework` into the **YaAim** target.
3. Target → General → Frameworks: **Embed & Sign**.
4. Signing & Capabilities → Team **88HACKXHZL**.
5. Build & run on device (USB). Not Simulator-only for Metal heart smoke.

`NativeHeart.swift` already has `#if canImport(llama)` — once the module is visible, real load/generate compiles. If your llama.cpp tree renamed symbols (`llama_model_load_from_file` vs `llama_load_model_from_file`, etc.), adjust the two load calls — comments in NativeHeart mark the aliases.

## Seat heart.gguf

1. Copy SmolLM2 (or Decider’s heart) to **Files → On My iPhone → Я → heart.gguf**, **or**
2. In-app pick a `.gguf` (WebShell → NativeVault.seatHeart).

## Smoke (after force-quit)

1. Force-quit Я · relaunch.
2. From www / chat: native `status` (or say **ping status** / mind status) — expect:
   - `frameworkLinked: true`
   - `seated: true`
   - `tokensOff: false` / `tokensOn: true`
   - `metal: true`
3. Chat a short prompt that routes to native generate (iOS spine + `engine === "llama.cpp"`).
4. Expect real tokens — not the `tokensOff · … mithrilBorrow` stub string.

Without the framework, status must stay honest: **`tokensOff` + `mithrilBorrow` hint**. Function 0 (rules+gut) still talks.

## Verify doc

See `docs/VERIFY-HEART-TOKENS.md`.
