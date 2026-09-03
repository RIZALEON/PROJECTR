# ЯENGINE — native iOS tile

```
┌─────────────────────────────┐
│          ЯENGINE             │
│                             │
│  WKWebView = SKIN           │
│           ↓                 │
│  Native Core = ENGINE       │
│           ↓                 │
│  llama.cpp + Metal          │
│           ↓                 │
│  Local Model                │
└─────────────────────────────┘
             ↑
             │
      Home Screen icon
```

**Core is offline.** Network is a nerve. Tile and skin stay replaceable. No jailbreak. Unsigned OK.

| Layer | File | What |
|---|---|---|
| Home Screen icon | `YaAim/Assets.xcassets/AppIcon` | clay serif **Я** |
| WKWebView = SKIN | `YaAim/WebShell.swift` + `YaAim/www/` | same mouth as the PWA |
| Native Core = ENGINE | `YaAim/NativeVault.swift` | Documents gut, 4 GB law |
| llama.cpp + Metal | `YaAim/NativeHeart.swift` + `llama.xcframework` | not wasm, not Safari RAM |
| Local Model | `Documents/heart.gguf` | cloud-up or Files → On My iPhone → Я |

Function 0 talks even if the heart is not linked yet.

## On a Mac (your Apple ID)

1. Xcode 16+ → open `ios/YaAim.xcodeproj`
2. Signing → your Team. Bundle `io.github.rizaleon.yaaim`
3. Heart: clone [llama.cpp](https://github.com/ggml-org/llama.cpp), `./build-xcframework.sh`, drop `build-apple/llama.xcframework` onto YaAim → Embed & Sign
4. Run on the iPhone. Trust the developer in Settings → General → VPN & Device Management

That Run **is** the Home Screen icon in the diagram.

## What this is not

- Not Safari Add to Home Screen (that is tile A, PWA fallback)
- Not a-Shell / Pyto / Shortcuts (those are launchers, not Engine RIZAL)
- Not Play/App Store until you greenlight
