# RENJIN — Instructions

## 1. Open the shell

Open `rshell/index.html` in a browser. No server, no install, no network needed.
Type at the `R:\>` prompt and hit Enter. Try `help`, `status`, `rzl`, `version`, `clear`, or ask e.g. "what is the ghost chain?".
Drag it by the RENJIN header to move it. Pull any corner or edge to resize it (min 240×170). Double-click the header to maximise / restore.
The live shared version is at the public link Chase shared on 2026-11-19 — the file in this ZIP is the same shell, exported as one self-contained HTML file.

## 2. Run the model (Node)

You need Node.js (v24 was used for the tests). No other install.

```bash
cd renjin
node build-core-v3.js
```

That boots core v3, trains 60 seconds on corpus-v1, and runs the generation + 10-question grounded test, printing the log. The same log is already saved as `build-log-v3.txt`.

To run the v2 test suite:

```bash
node tests/run-tests.js
```

To run the ask / retrieval test:

```bash
node build-ask-v3.js
```

## 3. What the files are

- `renjin/src/yaseed-core-v3.js` — the v3 core (v2 + `generateSampled()` only).
- `renjin/src/yaseed-core-v2.js` — the v2 core it was patched from.
- `renjin/src/corpus-v1.txt` — 112 RZL-authored lines, the training corpus.
- `renjin/src/rzl-embed.js` — embeddings v1 (DIM 32).
- `renjin/src/rzl-ask.js` — grounded ask / retrieval.
- `renjin/src/model-config-v2.js` — DIM 64 / HID 128 / CTX 32.
- `renjin/src/Tokenizer.swift` — tok.v1 in Swift. **Uncompiled — compile it in Xcode on a Mac; there is no Swift toolchain on the test VM.**
- `renjin/src/egg-version.js` — version 0.1.11, single source of truth.

## 4. Drop it into GitHub / RKLOWD

Copy the `renjin/` folder into the repo (e.g. RSEED / PROJECTR) and the `rshell/` folder where the interface lives. Keep the `.rzl` law in mind: eggs stay `.rzl` only, never `.zip` / `.rzl.zip` — this ZIP is a delivery package, not an egg.
Do not upload anything to a public chain, exchange, or wallet — there is no real wallet, chain, or trading in this build.

## 5. What is next

Generation and retrieval, in that order — not more training seconds. Then re-run the 10-question test and only call the model askable when it passes.
