# Seat llama.xcframework (Metal) into YaAim


## Status 2026-09-10 (Mac)

- `llama.xcframework` **BUILT** (ios-arm64 Metal) via llama.cpp `build-xcframework.sh`
- **Embed & Sign** wired in `ios/YaAim.xcodeproj` → path `ios/llama.xcframework`
- `NativeHeart.swift` uses current C API: `import llama`, `llama_model_load_from_file`, `llama_init_from_model`, vocab tokenize/eos, `llama_model_free`
- Mac **BUILD SUCCEEDED** with `llama.framework` inside YaAim.app/Frameworks
- **Do not commit** the multi‑MB xcframework binary — keep local under `ios/llama.xcframework` (gitignored); sync only NativeHeart + pbxproj
- Device smoke still needs: USB install + `heart.gguf` seated → `frameworkLinked` / `tokensOn`


**Goal:** real offline token generate from `Documents/heart.gguf` via NativeHeart — not wasm, not cloud.

MITHRIL (App Store *Local LLM: MITHRIL*) is a **borrow lab only** — never rename their tile to Я. Same GGUF can later land in our Documents.

## Law

- 100% offline for core chat. **No cloud LLM fallback.**
- Framework binary is built on **Mac** (this Linux box cannot emit `llama.xcframework`).
- Signing team: **88HACKXHZL** · bundle `io.github.rizaleon.yaaim.cam`.
- Empty `DEVELOPMENT_TEAM` in pbxproj until Mac fills it.

---

## Exact Embed & Sign checklist (Mac)

1. **Open** `ios/YaAim.xcodeproj` in Xcode.app (not CLI-only Simulator).
2. **Team** → Signing & Capabilities → Team **88HACKXHZL** (not 7D3P5F4V9M).
3. **Bundle ID** → `io.github.rizaleon.yaaim.cam`.
4. **Build llama.xcframework** (or borrow known-good Metal build):
   ```bash
   git clone https://github.com/ggml-org/llama.cpp
   cd llama.cpp
   ./build-xcframework.sh
   # → build-apple/llama.xcframework
   ```
5. **Drag** `llama.xcframework` into the **YaAim** target in the Project Navigator.
6. Target → **General** → **Frameworks, Libraries, and Embedded Content**:
   - `llama.xcframework` → **Embed & Sign** (not Do Not Embed).
7. Confirm **Metal** is enabled in the framework build (device GPU path).
8. **heart.gguf path** (pick one):
   - Files → **On My iPhone → Я → heart.gguf**, or
   - In-app seat via WebShell → NativeVault.seatHeart (pick `.gguf`).
9. **Run on physical device (USB)** — **no Simulator-only** for Metal heart smoke.
10. Force-quit Я · relaunch · smoke tokens (below).

`NativeHeart.swift` already has `#if canImport(llama)` — once the module is visible, real load/generate compiles. If your llama.cpp tree renamed symbols (`llama_model_load_from_file` vs `llama_load_model_from_file`, etc.), adjust the two load calls — comments in NativeHeart mark the aliases.

---

## Seat heart.gguf

1. Copy SmolLM2 (or Decider’s heart) to **Files → On My iPhone → Я → heart.gguf**, **or**
2. In-app pick a `.gguf` (WebShell → NativeVault.seatHeart).

Path expectation: app Documents / vault root · filename **`heart.gguf`**.

---

## Smoke (after force-quit · device · Embed & Sign)

1. Force-quit Я · relaunch.
2. From www / chat: native `status` (or **ping status** / mind status) — expect:
   - `frameworkLinked: true`
   - `seated: true`
   - `tokensOff: false` / **`tokensOn: true`**
   - **`metal: true`**
3. Chat a short prompt that routes to native generate (iOS spine + `engine === "llama.cpp"`).
4. Expect real tokens — not the `tokensOff · … mithrilBorrow` stub string.

Without the framework, status must stay honest: **`tokensOff` + `mithrilBorrow` hint**. Function 0 (rules+gut) + offline CoS mode still talk.

**tokensOn still requires Mac Embed & Sign** — Linux tip cannot flip this.

---

## Verify doc

See `docs/VERIFY-HEART-TOKENS.md` and `docs/EMBED-OFFLINE-V0-2026-09-10.md`.
