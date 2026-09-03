# Я iPhone launcher (tonight)

```
        ┌─────────────────────┐
        │      Я HOME TILE     │
        │   custom Я artwork   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   SHORTCUT / PWA     │
        │   Я Launcher Shell   │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
 Pyto          a-Shell        Safari/PWA
 Python/UI      Unix/CLI        Web UI
    │              │              │
    └──────────────┼──────────────┘
                   ▼
          LOCAL Я ENGINE
          models / files /
          inference logic
```

Core is **offline**. These mouths share files, not Safari RAM. llama.cpp + Metal is still Xcode tile C.

## 1. Home tile

Shortcuts → New Shortcut named `Я` → Share → **Add to Home Screen** → choose the clay Я image (Files / Photos).

Menu (four buttons):

1. **Skin** — Open URL `https://rizaleon.github.io/PROJECTR/` (or the Home Screen PWA)
2. **Mouth** — Pyto Run Script `ios/workaround/ya_engine.py`
3. **Hands** — Open App **a-Shell**
4. **Borrowed heart** — Open App **Local LLM: MITHRIL** (not Я — see `MITHRIL.md`)

Airplane mode. Skin and mouth still work.

## 2. Shared gut (one engine, three mouths)

Put files in **Files → On My iPhone → Я** (create the folder):

| File | Who writes it |
|---|---|
| `ya-gut.json` | Pyto `ya_engine.py` (copy/move from Pyto Documents if needed) |
| `heart.gguf` | You. Not seated in Pyto/a-Shell. For MITHRIL or later tile C |
| `shelves-*.jsonl` | Cloud-up / Working Copy |

Safari PWA gut is still its own Cache until native C. Do not expect the PWA and Pyto to share localStorage.

## 3. What each mouth is

| Mouth | Does | Does not |
|---|---|---|
| Safari/PWA | Function 0 UI, evolve, people-search when green | Metal llama |
| Pyto | Offline talk, remember, add function | GGUF tokens |
| a-Shell | Unix, git, files | Engine RIZAL |

## 4. Inference

- **Now:** rules + gut (PWA and/or Pyto).
- **Borrowed Metal (Phase 1):** App Store **MITHRIL**. Import SmolLM2 GGUF. Airplane. Their tile. Steps: `MITHRIL.md`.
- **Ours (Phase 2):** `ios/YaAim.xcodeproj` — same llama.cpp + Metal pattern, clay Я, our Documents.
