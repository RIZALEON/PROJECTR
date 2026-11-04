# SOURCECLAIM 0.1 — living being · ghostchain · biostats
**Stamp:** 2026-09-16 · America/Denver · ЯOS · ЯKRYPTOCODE · NonNuclear  
**Rev:** ghostchain established by biostats; being owns all contribution value

## Law
**OS GIVES SOURCE VALUE.**  
One **living being** owns **their** ghostchain.  
The ghostchain is **established from their biostats**.  
They receive **citation · monetization · value** for **all they contribute** — off the chain or on.  
Device is only a link. Platform never owns the chain.

---

## Ownership HARDCODE

```
living being (bio)
  └── owns ghostchain
        ├── established by biostats (root)
        ├── many device / wallet links (rebindable)
        └── every contribution → citation + value to this bio
```

- **One living being → one ghostchain** (theirs).
- Ghostchain **birth** = verifiable biostats binding (not device enrollment, not email, not corp KYC as root).
- Lose device → prove biostats → **relink** → same ghostchain continues.
- Every SEND IT / cite / ping-participation / settle credits **this bio**.

---

## Biostats (integrable factors)

Decider may integrate any combination; factors are modular. Examples:

| Factor | Role |
|---|---|
| Facial recognition | Living presence / match |
| DNA haplogroups | Lineage / continuity signal |
| Blood type | Stable biological marker |
| Fingerprints | Classic biometric match |
| (future) | Other Decider-gated living proofs |

### Privacy / NonNuclear (HARDCODE)
- **Raw biometrics never sit on a public chain.** Seat on-device under the being’s control (`Я/gut/essence/bios/{bioId}/biostats/`).
- Ledger / optional green twin store only **proof hashes** (or zero-knowledge attestations later) — enough to verify “same living being,” not enough to steal the body print.
- Being consents which factors are enrolled. Relink requires Decider-gated threshold (e.g. N of M factors).
- Citation and cashout point at **bio**, not at a raw face file.

---

## Identity fields (events)

| Field | Meaning |
|---|---|
| **bio** | Living being who owns the ghostchain |
| **device** | Optional link (many per bio) |
| **source** | Contribution (work hash / tip / participation) |
| **origin** | Birth seat of this event (geo/ping when allowed) |
| **biostatsRoot** | Hash of the biostats bundle that established / last verified this ghostchain |

Plus: `traceId` · `kind` · `ts` · `ref`

---

## Ops

| Op | When |
|---|---|
| `establish` | First biostats bind → ghostchain born under bio |
| `claim` | SEND IT — contribution birth; citation+value to bio |
| `cite` | Attribution to another bio’s contribution |
| `ping` / `pong` | Presence via a linked device; still credits bio |
| `transfer` | Contribution custody bio→bio (rare; both living beings) |
| `settle` | Monetize / cashout to bio |
| `attest` | Linked device re-signs |
| `relink` | Biostats re-verify → new device on same ghostchain |
| `evolve` | Function 0 — Decider-gated gain (mind/tip/skill/pack) on the ghostchain |

---

## Offline seat (premier)
```
On My iPhone → Я/gut/essence/bios/{bioId}/
  biostats/          # enrolled factors (device-private)
  ghost-chain.jsonl  # immortal under bio — all contributions
  links.jsonl        # devices / wallets
```

Replay by **bio** = full citation + value history.

---

## On-chain twin (optional, later)
`Claimed` / `Relinked` / `Established` events index **bio** + `biostatsProof` hash. No raw face/DNA/fingerprint bytes on-ledger.

## Non-goals
No platform-owned identity. No metering Heart / Function 0–2. No selling raw biostats.

## Offline via frequency (HARDCODE)
Я Ghost Claim · evolve · ping · tokens must work **without internet**.
Medium is plural — any Decider-allowed **frequency / carrier**:

| Carrier | Role |
|---|---|
| Local seat | Same device (always works) |
| Bluetooth / BLE | Near-field LINK ↔ LINK sync |
| NFC | Tap establish / claim / relink |
| Wi‑Fi Direct / AirDrop-class | Package / .RZL / ghost-chain handoff |
| Mesh / LoRa / radio | Village / distance when Decider seats radio |
| Ultrasonic / optical (optional later) | Side-channel when RF quiet |
| Hardline / USB | Wire seat |
| Satellite / cell / Wi‑Fi IP | Green path — optional, never required |

**Law:** airplane mode ≠ dead. Local seat + non-IP frequencies keep **Я GHOST CHAIN** alive. Green IP only amplifies. No usage limits on any carrier.
