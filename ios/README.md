# Я AIᵐ — iOS native spine

Safari / PWA cannot outgrow WebKit limits (Memory64, wasm RAM, Cache quota). This folder is the **breakout**:

| Organ | Where it lives | Limit |
|---|---|---|
| Mouth / skin | WKWebView (same Я UI) | UI only |
| Gut / vault | App **Documents** (Files, iTunes sharing) | phone storage, 4 GB law |
| Heart | **llama.cpp native + Metal** (not wasm) | device RAM, not Safari |

Unsigned is OK. No jailbreak. Function 0 still talks if the heart is not linked yet.

## On a Mac (your Apple ID)

1. Install Xcode 16+.
2. Optional heart (Metal): clone [llama.cpp](https://github.com/ggml-org/llama.cpp), run `./build-xcframework.sh`, drop `build-apple/llama.xcframework` onto **YaAim** → Frameworks, Embed & Sign.
3. Open `ios/YaAim.xcodeproj`.
4. Signing & Capabilities → your Team (free Apple ID works). Bundle `io.github.rizaleon.yaaim`.
5. Plug in the iPhone → Run. Trust the developer in Settings → General → VPN & Device Management.

The clay Я icon is the app tile. Feed a GGUF with the cloud-up button — native document picker copies **file-to-file** into Documents (does not inflate Safari RAM). Files app → On My iPhone → Я also works.

## What this is not

- Not a TWA. Not “Add to Home Screen.”
- Not WKWebView wasm seating. That path stays the PWA fallback.
- Not a store build until you greenlight TestFlight / App Store (4 GB uncompressed cap; 500 MB start).
