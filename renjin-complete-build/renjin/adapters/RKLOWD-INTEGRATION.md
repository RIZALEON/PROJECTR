# RKLOWD + RSCALE — found, and the RKLOWD ability integrated

On Rizal's word (2026-11-19): "RSCALE and RTOR is like iSH running its
own SSH server with a network path to it. Find those and integrate the
RKLOWD ability."

## What was found

**RKLOWD** (repo RIZALEON/RKLOWD — README.md + ARCHITECTURE.md, drawn
from AUTOMANUAL rev 6): "the offline under cryptocloud" — a
store-and-forward hub for the ЯLAB. Neo is the hub; iPhone 17e, the
Motorola and the TP-Link LAN are the connected devices. Each device
keeps a node folder (`drop`, `inbox`, `sent`, `node.json`, `STATUS.json`).
Queue law: a file is delivered into `inbox/` under a unique name,
**never executed and never overwritten**; no deletes in the record of
truth — a withdrawal is a later manifest record. The record of truth
is an append-only hash chain (`MANIFEST.jsonl`: seq, prev, sha);
objects are stored once, addressed by SHA-256. RPIPE is the hub
contract (loopback = local trust; cross-device = short-lived session
tokens, never printed). RMAIL rides the same queues. Devices join the
ЯLAB Reticulum mesh via BRIDGE-LANDING kits (home LAN; away = public
Reticulum testnet or an owner port-forward — **no Cloudflare tunnels,
no outside hosts**). GHOSTROOT is a separate unsigned local ledger,
never a substitute for the signed GHOSTCHAIN. RSOL carries the same
doctrine as standing rules (Nov 5–10 2026): devices must function
without each other; no single relay or host is a required dependency;
each keeps its own local queue and syncs when peers are reachable.

**RSCALE** (AUTOMANUAL / lab-infra notes): the mesh map layer —
network maps, failover, ts.net / Funnel zones. Standing state in the
owner's own record: **RSCALE is not running; its Moto job is installed
but stopped** (LaunchAgent `info.rizal.rscale-moto`, §U33.11; ThundR
commands `activate rscale-moto confirm` / `stop` / `status`).

**RTOR** is the signed-update layer that rides the path (rizal.pw/rtor,
feed 20261118-5, fail-closed, owner signatures pending) — the "SSH
server with a network path" pattern Rizal named: a device-local
service, reachable because the mesh gives it a path.

## What was integrated (2026-11-19)

The RKLOWD ability — **offline store-and-forward with a hash-chained
record of truth** — now lives inside the portable RENJIN shells:

- **OUTBOX \<text\>** queues a message in the device store the model
  boots with: the object is stored once, addressed by its SHA-256
  (`rklowd:obj:<sha>`), and a manifest record (seq, kind, sha, prev,
  bytes, ts, entry hash) is appended to `rklowd:manifest` — a
  MANIFEST.jsonl in miniature, following RKLOWD's own rules: never
  executed, never overwritten, no deletes.
- **QUEUE** reports the local manifest state and head hash.
- **NET** reports the mesh as it honestly stands: RSCALE (not running,
  Moto job stopped — the owner's word starts it), RTOR (feed state,
  fail-closed), RKLOWD (Neo hub, this device's queue count, RPIPE).
- The model itself learned it: corpus-v2 lessons 156–158; both shells'
  KB carries RKLOWD and RSCALE entries (KB 41).

Delivery honesty: a queued item forwards when the device joins the
mesh and the Neo hub takes it — the browser page holds no hub keys and
delivers nothing by itself, and says so. Starting `rscale-moto`,
running the hub, and the Reticulum landings are Neo/device-side acts,
each under the owner's GO, unchanged by this integration.
