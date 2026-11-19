# Pure RZL Build — Framework Components (v2, 2026-11-19)

Pure RZL, from scratch, ground up. No other AI companies' names/models.
No Qwen, no Llama, no llama.cpp in this build.

## What was built today

| Component | File | Status |
|---|---|---|
| Tokenizer.swift | src/Tokenizer.swift | ✅ Written, tok.v1 ids 256–312, size 313, matching tokenizer.js exactly. **Not compiled here** — no Swift on this VM, needs Xcode / Mac to compile. |
| Tokenizer (JS, verified) | via yaseed-core / tokenizer.js | ✅ Tested: size 313, encode `ЯENJIN /rseed grow hello` → 260,32,286,32,104,101,108,108,111, round-trip OK |
| Corpus v1 | src/corpus-v1.txt | ✅ 112 RZL-authored lines, held-out every 7th line (16 held-out, 96 train) |
| Embeddings v1 | src/rzl-embed.js | ✅ Tested: hash n-gram embeddings, DIM 32, cosine search. "Ghost Chain append-only" → top hit line 31, score 0.506 |
| Model v2 config | src/model-config-v2.js | ✅ DIM 64, HID 128, CTX 32, 49,152 ternary weights (was DIM 16, HID 32, CTX 6, ~9,216) |
| Model v2 core | src/yaseed-core-v2.js | ✅ Patched copy of yaseed-core.js, only the DIM/HID/CTX line changed |
| Version fix | src/egg-version.js | ✅ Populated, version 0.1.11, one source of truth. Core still reports 0.1.8 internally — that drift is in the core VERSION constant, next fix. |
| Build + test | build-model-v2.js, build-log.txt | ✅ Ran in Node 24, see results below |

## Test results (Node 24, 2026-11-19)

```
patched core -> yaseed-core-v2.js, DIM 64 HID 128 CTX 32 params 49152
boot: version 0.1.8, chain_ok true, modules 2
corpus lines: 112 train: 96 held-out: 16
grow: grown
train 5s: steps 691, loss_before 23.87, loss_after 3.135, held_out 3.15, entry 8
status after train: loss 3.1353, chain_entries 9, chain_ok true
tokenizer size: 313, round-trip OK
embed search: top hit line 31, 0.506
version file contains 0.1.11: OK
BUILD OK
```

## Honest limits — what is NOT done yet

1. **Train still uses the built-in 14-line CORPUS**, not corpus-v1.txt. The v2 model grows and trains, loss falls 23.87 → 3.14, but it is learning the old 14 lines. Swapping CORPUS for corpus-v1 is the next step (core v3).
2. **Generation is still spaces.** Greedy sample after 5s train was 40 spaces. The model is not yet producing text — it needs corpus-v1 training + more train time.
3. **Tokenizer.swift is not compiled.** No Swift toolchain on this VM. Compile it in Xcode on Neo / Mac before trusting it.
4. **Core version still says 0.1.8.** egg-version.js is 0.1.11, but yaseed-core.js VERSION is 0.1.8. Fix that constant in core v3.
5. **No wallet / chain / background runner yet.** Those are Phase 3–4 in the gameplan. This build is Phase 0–1 only.

## How to run

```
cd rzl-build
node build-model-v2.js
node tests/run-tests.js
```

## Next step (tomorrow)

Core v3: swap the built-in CORPUS for corpus-v1.txt, train 60s, check held-out loss and generation, then fix the core VERSION to 0.1.11.

## Core v3 — built 2026-11-19 (run: `node build-core-v3.js`, log: `build-log-v3.txt`)

What changed vs v2: the v3 core is the v2 core plus one method, `generateSampled()`
(temperature sampling — stock `generate()` is greedy argmax only). No core patch was
needed for the corpus swap: `YaSeed({corpus})` already accepts an override, and the
version fix was load order — `egg-version.js` is now required before the core, so the
core reports **0.1.11**, not 0.1.8.

Test results (Node 24, 2026-11-19):

```
boot: version 0.1.11, chain_ok true, modules 2
corpus lines: 112, bytes: 6502
grow: grown, loss 27.61
train 60s: steps 4762, loss_before 27.61, loss_after 3.118, held_out 3.138, entry 8
status after train: loss 3.1178, chain_entries 9, chain_ok true
```

Honest limits — what is STILL not done:

1. **Free generation still produces no real text.** Greedy generation for the same 3
   questions now returns 30 spaces (was 30 'e's on v2); sampled generation at temp 0.8
   returns gibberish fragments (`"er teeen yhee csadto eetrs sa"`). The real-words
   check fails. Loss fell, but the byte model still cannot answer a free question.
2. **The 10-question grounded test FAILED: 4/10.** `ask()` (RZL-embed retrieval over
   corpus-v1, answer = quoted top line) passed on lines 3, 9, 33, 95 and missed on
   1, 2, 20, 24, 38, 102 — hash n-gram embeddings (DIM 32) miss on short or
   paraphrased questions. Retrieval is usable for distinctive phrasing, not yet
   reliable enough to call the model askable.
3. Held-out loss barely moved vs v2 (3.138 vs 3.15) — training longer on corpus-v1
   did not make it generalise better. The next step is not more seconds; it is
   better generation/retrieval (e.g. a word-level check against the corpus, BM25 +
   embeddings combined, more train data), then re-run the 10-question test.

## v3.1 retrieval — built 2026-11-19 (run: `node build-ask-v3.js`, log: `build-log-ask-v3.txt`)

New module `src/rzl-ask.js` (MIND v2): BM25 + RZL embeddings combined
(0.3 embed + 0.7 BM25), BM25 with stopwords removed, light stemming
(`recalls` → `recall`) and number-word normalisation (`zero` → `0`).
`ask()` answers by quoting the best corpus line; `answer()` returns
"Unknown." when the top score is below 0.5 instead of quoting a wrong line.

Test results (Node 24, 2026-11-19):

```
10-question grounded test: 8/10 passed (was 4/10 with embed-only ask in v3)
```

Free-question probes: "What is the Ghost Chain?" → line 76 (quoted),
"What is offline?" → line 1 (quoted), "Who is ThundR?" → Unknown (score 0.3;
ThundR is not in corpus-v1 — the honest answer, not a guessed line).
Existing suite still passes: `node tests/run-tests.js` → 12 passed, 0 failed.

Still failing, honestly: "What is the order of the loop?" → line 79, expected 20
(the word "order" is in neither line — fix is corpus growth, a line stating the
loop order with the word "order"); "What is the held-out set?" → line 103,
expected 102 (both lines are about it; 102 defines it, 103 is about its loss).
Free byte generation is still NOT fixed — greedy gives spaces, sampled gives
gibberish. Retrieval-first quoting is the askable path for now; the model itself
still cannot answer in its own words.
