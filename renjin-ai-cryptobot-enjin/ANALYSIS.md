# Analysis — ThundR project + RENJIN Swift/Xcode code

Date: 2026-11-19. Static analysis on this VM (Linux, Node 24).
Honest limit up front: there is no Xcode and no Swift toolchain on this
VM, and none in the uploaded packages, so the Swift code was analysed
statically, line by line — not compiled. Compile it in Xcode on a Mac
before trusting it (see README.md).

## Inventory — what actually exists

- ThundR botcard package: NO code and NO Xcode project. Media (MP4, GIF,
  WebP, JPG), one README, and `ThundR-botcard.json`. There is no separate
  "ThundR project" in Xcode to open — ThundR is a character/botcard, not
  a codebase.
- RENJIN complete build: exactly ONE Swift file,
  `renjin/src/Tokenizer.swift`; the rest is Node JS + HTML. No
  `.xcodeproj`, no `Package.swift`, no plists in either package.
- GitHub code search over RIZALEON/PROJECTR returned no other Swift or
  ThundR code (search reported incomplete results, so this is "none
  found", not "none exists anywhere").

## Tokenizer.swift — analysis (tok.v1)

- Structure: `RZLTokenKind` (byte/glyph/command/action), `RZLSpecial`,
  `RZLTokenizer`. Foundation only, no dependencies — Xcode-friendly.
- Tables verified by count: 13 glyphs + 25 commands + 19 actions =
  57 specials, ids 256-312, vocab size 313. Matches the JS build notes.
- Id spot-check passed: glyph order puts the ENJIN glyph at id 260 and
  the grow command at id 286, matching the documented JS encoding
  example (260, 32, 286, 32, ...).
- Matching: longest-special-first over UTF-8 bytes; commands only match
  at a word start and must end at a boundary or end of input. Encode is
  brute force O(n x specials x length) — fine at this scale.
- Issues found:
  1. `vocabJSON()` declared a `specials` value it never used — an Xcode
     warning. Removed in the merged copy; output unchanged.
  2. `decodeBytes` threw a bridged `NSError`. Replaced with a typed
     `RZLTokenizerError.unknownId(Int)` in the merged copy.
  3. `vocabJSON()` escapes only backslash and quote by hand. Safe for
     today's specials (no control characters), fragile for future
     `extra` tokens — noted, not changed, to keep output identical.
  4. No Swift tests exist. The JS test suite reads the Swift file as
     text only. First Xcode task: add the encode example above as a
     real Swift test.

## Scrub — what was checked, what was found

Checked all text/code in both packages for secrets, keys, passwords,
email addresses, external URLs, absolute local paths, other-AI model
names, and risky JS patterns.

- Secrets / keys / emails / external URLs: NONE found.
- Absolute local VM paths: FOUND in the legacy v2 files (not in v3):
  `renjin/build-model-v2.js` (two places) and `renjin/tests/run-tests.js`
  (one place) hard-code a local audit-workspace path for the original
  core and tokenizer. That leaks the build machine's layout and breaks
  the build anywhere else. The v3 scripts already use relative
  `__dirname` paths — that is the scrubbed pattern. The merged files in
  this folder contain no absolute paths (enforced by test).
- Other-AI model names: appear ONLY in negation lines in the original
  README/SUMMARY ("pure RZL, no other model"). The project's own rule is
  that no other-AI names belong in the build, so the merged files state
  "pure RZL, from scratch" without naming any.
- Risky patterns, reviewed: the core JS loads sandboxed modules with a
  `Function` constructor whose globals are shadowed to null, and
  pre-scans module source for network/eval/process patterns and rejects
  matches. That is an intentional sandbox design — flagged here, kept.
  The shell HTML uses `innerHTML` only to clear its own transcript.
- Embedded media: the shell page background is an embedded base64 JPEG
  (photo-editor metadata inside the image data). Not code, not a leak
  of credentials — left as is.

## Merge decision

Because ThundR had no code, the merge is: ThundR's identity/data merged
INTO the RENJIN ENJIN code, in both languages the ENJIN already uses —
`src/ThundR.swift` (new, Xcode side, Codable mirror of botcard v1.1,
with a tokenizer integration helper) and `src/thundr-botcard.js`
(Node side), plus the cleaned `src/Tokenizer.swift`. Verified by
`tests/run-merge-tests.js`.
