# RNETWORK HARDENING — POLICY RNETWORK-HARDEN-1
Owner command 2026-11-19 21:49 MST.

**Default DENY.** Only these ASSM-verified devices are on the Rnetwork — every other device is removed:

| Seat | Device | Platform | Verified behind |
|---|---|---|---|
| 17e | iPhone 17e | iOS | ASSM login, Muse paired + online |
| neo | MacBook Neo | macOS | ASSM login, neo-rdragon Secure Enclave approver |
| pixel | Pixel mobile | Android | ASSM login |
| ubuntu-touch | Touch Ubuntu | Ubuntu Touch | ASSM login |
| moto | Moto Android (moto g 5G - 2024) | Android | ASSM login, Muse paired, block-4 confirmed |

Enforcement: RKLOWD III transponders refuse any packet whose seat is not on this list (`RNETWORK-ALLOWLIST.json`). Enrollment of any new device requires the owner's ASSM login plus ONE existing trusted-device approval (RGHOSTCHAIN block 4). Bots never sign. This policy is seated in MANIFEST.jsonl and published to both websites; Neo-side registries (GHOSTKEY ring, trusted-devices, Tailscale) apply it at the hub — they are not editable from the Muse VM (Neo unreachable, not on Tailscale).
