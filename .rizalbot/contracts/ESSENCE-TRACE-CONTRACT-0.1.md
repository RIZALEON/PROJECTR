# ESSENCE TRACE CONTRACT 0.1
**Stamp:** 2026-09-16 · America/Denver · NonNuclear · offline-first  
**Product:** Я AIᵐ / Rizalbot  
**Purpose:** One simple monetization + end-to-end tracking contract.

## Why this shape (crypto basics)

The earliest useful on-chain pattern for **end-to-end tracking** is not DeFi — it is:

1. **Mint** — create a unit of value (token / receipt / essence).
2. **Transfer** — move custody (every hop logged).
3. **Settle** — mark consumed / paid / closed (final state).

ERC-20’s `Transfer(from, to, value)` event (2015) is the ancestor: every movement is an indexed log you can rebuild a full chain from. NFTs (ERC-721) add unique IDs for one-of-one assets. We use the **receipt + transfer log** pattern — smallest contract that still gives full provenance.

## Law (Я)

- Offline premier: live ledger seats on device (`Documents/Я/gut/essence/`).
- Optional green twin: same events can be mirrored on-chain later (no cloud required for core).
- NonNuclear · Decider-gated mint · no paywall on Function 0/1/2 core.
- Monetization is **Essence** (already in spine: `essence.mint` / `essence.download`) — this contract is the formal schema.

## End-to-end track fields (every event)

| Field | Meaning |
|---|---|
| `traceId` | UUID / bytes32 — one lineage for the whole life of a unit |
| `from` / `to` | Custody hop (device id, wallet, or `0x0` for mint/burn) |
| `amount` | Units (1e18 style or integer essence units) |
| `ref` | Human/product ref (tip SHA, order id, session id) |
| `kind` | `mint` · `transfer` · `settle` · `burn` |
| `ts` | Unix seconds (device clock; on-chain = block time) |

Rebuild any story: filter logs by `traceId` → ordered hops → settle.

## Offline seat (phone / Mac)

```
On My iPhone → Я/gut/essence/
  ledger.jsonl     # one JSON line per event (append-only)
  receipts/        # optional settled blobs
```

Append-only JSONL = same semantics as chain events without a node.

## On-chain twin (optional)

File: `EssenceTrace.sol` — Solidity ^0.8, no owner admin beyond minter role Decider assigns. Deploy only when Decider says (Base / Ethereum L2 preferred for cheap logs).

## Map to existing Rizalbot hands

| App hand | Contract op |
|---|---|
| `essence.mint` | `mint(to, amount, traceId, ref)` |
| transfer / tip / gift | `transfer(to, amount, traceId, ref)` |
| consume / redeem / paid | `settle(traceId, ref)` |
| `essence.download` | export ledger.jsonl / receipt |

## Monetization modes (simple)

1. **Tip / gift** — mint → transfer to creator (tracked).
2. **Pack unlock (optional green)** — settle against a pack `ref` (never gates offline core).
3. **Provenance** — every seat/tip SHA as `ref` so mind growth is auditable.

## ACCEPT smoke

1. Offline: mint 1 essence → see ledger line with `traceId`.
2. Transfer to another seat id → second line same `traceId`.
3. Settle → third line `kind=settle`; query by `traceId` returns full path.
4. (Optional) same three txs on deployed `EssenceTrace`.

## Non-goals (v0.1)

No AMM, staking, bridging, or cloud metering of chat tokens. Heart Metal stays unlimited offline.
