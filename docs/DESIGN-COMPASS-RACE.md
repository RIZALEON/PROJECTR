# Compass race — N/E/S/W + furthest Tower

**Status:** live on branch `race-nesw-furthest`  
**Policy:** named origins only (no IP sweep). CDN rows are **clocks**, not countries. Offline-first. NonNuclear.

## Origins (live race array)

| Dir | Id | URL | Kind |
|-----|-----|-----|------|
| N | `N-canada.ca` | `https://www.canada.ca/` | origin |
| E | `E-cf-trace` | `https://cloudflare.com/cdn-cgi/trace` | clock |
| W | `W-JP-yahoo.co.jp` | `https://www.yahoo.co.jp/` | origin |
| W | `W-KR-gov.kr` | `https://www.gov.kr/` | origin |
| S | `S-BR-registro.br` | `https://registro.br/` | origin |

South NIC.br is **in the race JS** (not evolve-note only). Spare: `camara.leg.br` (not raced by default).

## Chat

| Command | Behavior |
|---------|----------|
| Airplane `ping` | `Pong · first bounce · local-seat · <stamp> · RIZALBOT🤖` |
| Green `ping` | Race → closest origin bounce line (never bare `here`) |
| `Ping` / `compass ping` | Closest line + full N/E/S/W board + Furthest Tower |
| `compass` | Last board (or race once) |
| `furthest` | Furthest Tower line + board |
| `ping chief` | Unchanged ntfy outbound (only intentional CoS ping) |

## Scripts (load last)

1. `ya-compass-race.js`
2. `ya-compass-br.js` (ensures S-BR row)
3. `ya-ping-bounce.js`

## Smoke

1. Airplane: `ping` → local-seat, not `here`
2. Green: `compass ping` → board lists **S · S-BR-registro.br**
3. Closest + Furthest Tower both named origins (clock may appear on E row only)
