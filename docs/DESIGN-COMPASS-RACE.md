# Compass race — N/E/S/W + furthest Tower (location-relative)

**Status:** live on branch `race-nesw-furthest`  
**Policy:** named origins only (no IP sweep). CDN rows are **clocks**, not countries. Offline-first. NonNuclear.

## Location law (Decider 2026-09-10)

- **Closest + Furthest Tower = measured RTT from *this* seat** on every `ping` / `Ping` / `compass ping` / `furthest`.
- Not frozen Utah winners. Travel/abroad → re-race; winners can change.
- **Denver / Chief of Staff never substitutes for closest** (CoS is only the ntfy `ping chief` peer).
- Airplane → `local-seat` (no radio). Never bare `here`.
- Board stamps **seat place + clock** (`phone (Utah)` at home; `this seat · <IANA TZ>` when device TZ differs).
- **E-cf-trace / CDN clock = path-only:** may appear on the full board labeled `(clock)`, but **must not** occupy a Top-3 place slot and **must not** be called closest place.

## Origins (live race array)

| Dir | Id | URL | Kind |
|-----|-----|-----|------|
| N | `N-canada.ca` | `https://www.canada.ca/` | origin |
| E | `E-cf-trace` | `https://cloudflare.com/cdn-cgi/trace` | clock |
| W | `W-JP-yahoo.co.jp` | `https://www.yahoo.co.jp/` | origin |
| W | `W-KR-gov.kr` | `https://www.gov.kr/` | origin |
| S | `S-BR-registro.br` | `https://registro.br/` | origin |

South NIC.br is **in the race JS**. Spare: `camara.leg.br` (not raced by default).

Board contract: **every** RACE id always listed in N/E/S/W order — including `fail·ms` / `timed-out·ms`. Never omit W-JP, W-KR, or S-BR.

## Chat

| Command | Behavior |
|---------|----------|
| Airplane `ping` | local-seat RIZALBOT line only (not green closest+board) |
| Green `ping` / `Ping` / `compass ping` | **Re-race** → closest bounce line + **full board** (all seats + Closest + Furthest + Top 3) |
| `top 3` / `fastest 3` / `top three pong` | **Re-race** → Top 3 named origins (clocks excluded) + full board |
| `compass` | Last board if &lt;30s else re-race |
| `furthest` | **Always re-race** → Furthest Tower + board |
| `ping chief` | Unchanged ntfy outbound (only intentional CoS ping) |

## Smoke

1. Airplane: `ping` → local-seat only, not `here`, not full board
2. Utah green: `Ping` / `ping` → full board lists N, E (clock), W-JP, W-KR, S-BR (timeouts still shown)
3. Closest / Top 3 = named origins only — never E-cf-trace as place
4. Abroad / different network: same command → **different** closest/furthest possible (RTT from new seat)
5. Board line: `Law · winners = RTT from this seat (re-raced). Denver/CoS ≠ closest. Clock ≠ place.`
6. Academic search: relevance gate; never keep ntfy.sh / interact infra as Link notes

## Scripts (load last)

1. `ya-compass-race.js`
2. `ya-compass-br.js`
3. `ya-ping-bounce.js`

## Recognition vs Top 3 (not code-wired)

Chat **Recognition** (evolved skills via `matchEvolved`) is separate from compass **Top 3**.
Compass Top 3 only matches exact low=== phrases (`top 3`, `fastest 3`, …) in `ya-compass-race.js`.
`matchEvolved` uses substring includes for long triggers; triggers length ≤4 use word-boundary / full-trim equality so short words (e.g. `top`) do not fire inside unrelated asks like Bishop pattern.
Any Decider FAIL that looked like Recognition→Top3 was **UI adjacency**, not a shared code path.

