# RENJIN AI CRYPTOBOT ENJIN — ThundR Merge

Pure RZL, from scratch. ThundR (botcard v1.1, live) merged into the
RENJIN ENJIN, scrubbed. Full findings: `ANALYSIS.md`.

## Files

- `src/Tokenizer.swift` — tok.v1 tokenizer, cleaned for Xcode
  (typed error, no unused variable; ids and behaviour unchanged).
- `src/ThundR.swift` — NEW. ThundR botcard as a Swift `Codable` type,
  with `statusLine()` and a tokenizer helper. Foundation only.
- `src/thundr-botcard.js` — NEW. Same botcard for the Node side:
  `BOTCARD`, `statusLine()`, `describe()`. No dependencies.
- `tests/run-merge-tests.js` — Node tests: botcard consistency with
  the published `thundr-botcard/ThundR-botcard.json`, plus scrub
  checks (no absolute paths, no secrets, no other-AI model names).

## Use in Xcode

No Xcode project existed in the source packages, so create one on a Mac:
new App / Package target, then add `src/Tokenizer.swift` and
`src/ThundR.swift` to the target. Both are Foundation-only.
First test to add: encoding the ENJIN glyph + grow command example
from `ANALYSIS.md` (ids 260 and 286).
Note: the Swift files were statically analysed, not compiled, on the
build VM used for this merge — there is no Swift toolchain there.

## Run the merge tests (Node)

```bash
node tests/run-merge-tests.js
```
