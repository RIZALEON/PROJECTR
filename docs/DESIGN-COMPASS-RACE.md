# Compass race — N/E/S/W + furthest Tower (location-relative)

**Status:** live on branch `race-nesw-furthest`  
**Policy:** named origins only (no IP sweep). CDN rows are **clocks**, not countries. Offline-first. NonNuclear.

## Location law (Decider 2026-09-10)

- **Closest + Furthest Tower = measured RTT from *this* seat** on every `ping` / `Ping` / `compass ping` / `furthest`.
- Not frozen Utah winners. Travel/abroad → re-race; winners can change.
- **Denver / Chief of Staff never substitutes for closest** (CoS is only the ntfy `ping chief` peer).
- Airplane → `local-seat` (no radio). Never bare `here`.
- Board stamps **seat place + clock** (`phone (Utah)` at home; `this seat · <IANA TZ>` when device TZ differs).

## Origins (live race array)

| Dir | Id | URL | Kind |
|-----|-----|-----|------|
| N | `N-canada.ca` | `https://www.canada.ca/` | origin |
| E | `E-cf-trace` | `https://cloudflare.com/cdn-cgi/trace` | clock |
| W | `W-JP-yahoo.co.jp` | `https://www.yahoo.co.jp/` | origin |
| W | `W-KR-gov.kr` | `https://www.gov.kr/` | origin |
| S | `S-BR-registro.br` | `https://registro.br/` | origin |

South NIC.br is **in the race JS**. Spare: `camara.leg.br` (not raced by default).

## Chat

| Command | Behavior |
|---------|----------|
| Airplane `ping` | `Pong · first bounce · local-seat · <place> · <stamp> · RIZALBOT🤖` |
| Green `ping` | **Re-race** → closest origin from this seat |
| `Ping` / `compass ping` | **Re-race** → closest line + full board + Furthest Tower |
| `compass` | Last board if &lt;30s else re-race |
| `furthest` | **Always re-race** → Furthest Tower + board |
| `ping chief` | Unchanged ntfy outbound (only intentional CoS ping) |

## Smoke

1. Airplane: `ping` → local-seat, not `here`
2. Utah green: `compass ping` → board shows Seat · phone (Utah); Closest often N-canada.ca (not guaranteed)
3. Abroad / different network: same command → **different** closest/furthest possible (RTT from new seat)
4. Board line: `Law · winners = RTT from this seat (re-raced). Denver/CoS ≠ closest.`
5. S-BR-registro.br listed on board

## Scripts (load last)

1. `ya-compass-race.js`
2. `ya-compass-br.js`
3. `ya-ping-bounce.js`
