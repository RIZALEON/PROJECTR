# RENJIN — Complete Build Summary
Date: 2026-11-19
Pure RZL, from scratch. No Qwen / llama.cpp / Llama or any other AI company's model.

## What is in this ZIP

- `rshell/index.html` — The R:> Shell, exported from the live shared shell. Floating window, draggable by the RENJIN header, resizable at any corner or edge (min 240×170), double-click header to maximise/restore. Starfield backdrop, black / electric green (#2bff62) / indigo purple (#7c4dff) / white. R:\> prompt with blinking green block cursor. Commands: help, status, rzl, chain verify, version, clear, plus grounded PROJECT R answers. Up/down recalls earlier commands.
- `renjin/` — The current RENJIN / pure RZL model build (core v3, with v2 files kept).
- `renjin-rzl-cryptobot-interface/` — The earlier RENJIN interface package: final mockup, starfield assets, and the v1/v2 iteration images.

## Core v3 — the headline result

- Model: DIM 64 / HID 128 / CTX 32, 49,152 ternary weights.
- Corpus v1: 112 RZL-authored lines (96 train / 16 held-out).
- Train 60s on corpus-v1: 4,762 steps, loss 27.61 → 3.118, held-out 3.138, chain 9 entries, chain_ok true, boot version 0.1.11.
- Only v3 core change: one added method, `generateSampled()` (temperature sampling). The v2 core already accepted a corpus override, so no core patch was needed for the swap.
- Tokenizer tok.v1: vocab 313, ids 256–312. Tokenizer.swift is included but uncompiled — needs Xcode on a Mac.
- Embeddings v1: rzl-embed.js, hash n-gram, DIM 32.

## Honest limits — read this first

- **The model still cannot answer a free question.** Greedy generation returns 30 spaces; sampled at 0.8 returns gibberish fragments, e.g. "er teeen yhee csadto eetrs sa".
- **Grounded 10-question test: 4/10 passed** (lines 3, 9, 33, 95). Misses on 1, 2, 20, 24, 38, 102, with one near-miss (102 vs 103).
- Held-out loss barely moved vs v2 (3.138 vs 3.15), so more training seconds is not the next lever. Next is better generation/retrieval: word-level check against the corpus, BM25 + embeddings combined, more training data, then re-run the 10-question test.
- All results are from a VM copy in Node with an in-memory store, not the on-device ЯENJIN. The shell is not paired to a live device ЯENJIN.
- No wallet, chain, exchange, or background-runner work in this build. ЯMINT is a local signed ledger only — no public blockchain, no real money, no transfer off-device.

## Files that prove it

- `renjin/build-log-v3.txt` — 60s train + generation samples + 10-question test.
- `renjin/build-log-ask-v3.txt` — ask/retrieval log.
- `renjin/build-log.txt` and `renjin/tests/test-log.txt` — v2 build, 12 passed, 0 failed.
- `renjin/README.md` — v2/v3 build notes.
