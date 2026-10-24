# AUTOMANUAL — §U28 RDRAGON ANDROID FOUNDATIONAL MODEL (public mirror of the entry)

## §U28 · RDRAGON ANDROID — FOUNDATIONAL MODEL (2.1.9 r2, 2026-10-24)

**What it is.** RDRAGON Android 2.1.9 r2 is the foundational RDRAGON ANDROID MODEL. It starts from the Oct 22 DRAGOSKUL 0.2.2 foundation (the Granite heart plus RISC-V Linux) and fuses in:
- BATIBABOX
- MACHINE MIND, in auto and manual modes (AUTO never bypasses the approval gate)
- ThundR Live
- RDOS
- RGENERATOR
- shot-sense
- the scrolls
- the 370-command index (COMMANDS-INDEX.md)
- SELF-MAP (.md/.json)
- the Mouthpiece
- the official RDRAGON tile

The heart runs on-device as llama.cpp on 127.0.0.1:4979, and `/health` returns ok.

**Identity.**
- Package: `com.rzl.dragonskull`, versionCode 4, versionName 2.1.9
- Signing: schemes v2 and v3. Cert SHA-256 `1a47a997f356184ee75356af0e9ff4bb855b545bb1bf14c529319605f325015d` (hashCode `3fda71f5`), the same key as the installed 1.0.2 line.
- Signed r2 APK: sha256 `564ce08e60d74a61f801eee4e550dc9a6179bdca07abc6ffdaaf542d270a9281`, 1,208,096,937 bytes
- Unsigned r2: sha256 `b0b2551a…238c3`, 1,207,978,193 bytes
- Installed on the moto g 5G (2024) with `adb install -r` on 2026-10-24, 17:15–17:16 MDT (47 s). The phone reports 2.1.9, vc4, signer 3fda71f5.

**Copies.**
- Neo, build: `ЯLAB/RFORGE/RDRAGON/ANDROID-BUILD-20261024/`
- Neo, foundation: `ЯLAB/RFORGE/RDRAGON/FOUNDATION-ANDROID/`. These are hardlinks to the build files, so the APK isn't stored twice.
- Phone: `/sdcard/RFORGE/EGGS/` (the APK and SHA256SUMS)
- Drive account 1: RFORGE/RDRAGON/ANDROID-2.1.9. The APK is in 13 parts in `RDRAGON-Android-2.1.9-SIGNED-r2.apk.parts/`; the parts total 1,208,096,937 B and REASSEMBLE.txt explains how to join them.
- Drive account 2: RFORGE/RDRAGON/ANDROID-2.1.9, with the APK split the same way.
- GitHub RIZALEON/RFORGE (private):
  - Docs and tile in `RDRAGON/ANDROID-2.1.9/`, commit ff64888
  - Release https://github.com/RIZALEON/RFORGE/releases/tag/rdragon-android-2.1.9-r2 has the APK as 13 part assets. GitHub reports a sha256 for each part, and each one matches PARTS.SHA256SUMS. The single 1.2 GB asset upload failed with EOF three times.
- GitHub rizalward: no copy. The account isn't reachable: the API returns 404 and there's no valid token.

**Install or upgrade.** Run `adb install -r RDRAGON-Android-2.1.9-SIGNED-r2.apk`. After you join the parts, check that the sha256 matches before installing. `resources.arsc` must be stored uncompressed, because a compressed one fails on Android 11+ with error -124.

**Lessons.**
1. Never use `adb backup`. To keep the old version, pull its base.apk instead.
2. On Android 11+, `resources.arsc` must be stored uncompressed and 4-byte aligned. Repack by raw-copying every other entry so the CRCs and sizes stay identical.
3. Sign with the RDRAGONSKULL project keystore, which is the same key as 1.0.2. Don't use `~/.android/debug.keystore`, which is a different key and breaks `install -r`. Never publish a keystore.

**Rule.** Every future RDRAGON Android build derives from this foundation: same package, same signing key, and a higher versionCode than 4.

Nothing removed or rewritten.

— BOTLATCH · 2026-10-24 17:30 MT
