# PROJECTRXCODE — offline Darwin / Xcode knowledge (no cloud)

**Seat:** 2026-09-10 · Decider GO · NonNuclear · do not commit `ios/llama.xcframework` binary

## Patterns (reason on-device)
- **NativeHeart.swift** — llama.cpp + Metal + `Documents/heart.gguf`; `#if canImport(llama)`; honest `tokensOff` when framework absent.
- **Embed & Sign** — Xcode → YaAim target → Frameworks → `llama.xcframework` → Embed & Sign (not Do Not Embed).
- **pbxproj** — path `ios/llama.xcframework`; empty `DEVELOPMENT_TEAM` until Mac fills **88HACKXHZL**; bundle `io.github.rizaleon.yaaim.cam`.
- **NativeVault** — `heart.gguf` under Documents / Я/; gut under `gut/`; body parts under `body/parts/`.
- **WebShell** — bridges `generate` / `status` / pick; www talks via `YA_NATIVE`.
- **www mirror** — root → `web/` + `ios/YaAim/www/`; bump `?v=` every ship.

## Chat verbs
`xcode: <goal>` · `darwin: <goal>` · `write code: NativeHeart Embed&Sign` → offline manifest (files + checklist + smoke).

## Law
Keep current `heart.gguf` (~97MB). No cloud LLM fallback. Status/heart → NativeHeart (never Android APK eat).
