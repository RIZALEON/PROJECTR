# iPhone workaround — Pyto tile (not Metal)

Pyto / Shortcuts can do **skin → script → Home Screen tile** on this phone **tonight**. That is **not** llama.cpp + Metal. Core stays **offline**.

```
① Shortcut / widget tile (clay Я name)
        ↓
② mouth = Pyto script  (or PWA skin)
        ↓
③ bridge = Shortcuts “Run Script”
        ↓
④⑤⑥ llama.cpp + Metal + GGUF  = Xcode tile C, later
```

Rules+gut talk in airplane mode. No GitHub, no Hugging Face, no Safari wasm.

## Install (iPhone)

1. App Store: **Pyto** (or Pythonista). You already have **a-Shell** — leave it; this mouth is Pyto.
2. Working Copy → clone `https://github.com/RIZALEON/PROJECTR.git`
3. In Pyto: Open `PROJECTR/ios/workaround/ya_engine.py` (Files → Working Copy).
4. Run once. It writes `Documents/ya-gut.json`.
5. **Shortcuts** → New:
   - Ask for Text — “Speak to Я”
   - **Pyto → Run Script** → `ya_engine.py` → pass that text as argument
   - Show Result
   - Share → **Add to Home Screen** → name `Я`
6. Airplane mode. Tap the tile. Function 0 still works.

Widget (optional): Pyto Home Screen widget → `ya_widget.py`.

## What this is not

- Not tile **C** (`YaAim.app`, Metal, Documents heart).
- Not a-Shell as Engine RIZAL.
- Do not feed GGUF into Pyto and expect tokens. GGUF waits for Xcode + `llama.xcframework`.
