# LAW — THE STARFIELD BACKGROUND

Ordered by Rizal, 2026-11-19.

**Every shell and terminal in RZL SYSTEMS — now and in the future — uses
the RZL starfield as its background. No exceptions, no substitutes.**

The image: a black field with sparse stars — white, green, blue.
Canonical file: `starfield-base.jpg` · 1170×658 · 25,314 bytes ·
MD5 `23d44016ba979ecdafba13a331a4ab66`.

## How a shell complies

- **Web shells embed the exact image** — a base64 data URI in the shell
  background, under the green frame, scanlines and vignette. Embed it;
  never point at an external `assets/` file that can go missing. The
  image travels with the shell. (R:> Shell and the RZL Cryptobot
  Interface both comply as of 2026-11-19 — verified byte-for-byte
  against the canonical MD5.)
- **Native shells and terminals** set the same image as the window
  background.
- A new shell or terminal that does not open on this starfield is
  **not finished**.

This law sits with the backroom rules (BACKROOM.md §10) and in the UBK
UNITED BOT KARD. Like the ONE RULE, it is add-only: it can be extended,
never erased.
