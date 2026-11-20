# RCODE LINUX SEAT — the Linux host seat for the RCODE project

Built 2026-11-20 on Rizal's order: "A Linux seat for the RCODE project,
published to GitHub + Meta." Status: **built and proven on Linux here** —
the GitHub push and the Meta space seat still wait on his GO.

## What this seat is

The RENJIN engine under the RCODE adapter contract, running on a Linux
host — the same `YASEED_HOST` contract the iOS/macOS adapter implements
(`../rcode-host-adapter.js`), with `hostId rcode-linux` and platform
`linux`. It is the Linux half of the RCODE project: the Xcode-built RCODE
app stays the iOS/macOS host; this seat is the host that runs the same
engine, the same core, the same corpus and the same persisted store on
Linux — including this build VM, which is Linux.

## What it is not (honest limit)

This is **not** the Swift/Xcode RCODE project ported to Linux — Swift
UI code does not run on Linux, and the RCODE repo itself (private,
`RIZALEON/RCODE`) is not cloned on this VM. The native RCODE app still
needs Neo + Xcode for its own build, and `RCodeHostBridge.swift` still
waits for its Neo-side drop-in (see `../RCODE-ADAPTER.md`). What this
seat proves is the engine side: the adapter contract, the plugin
admission path, the persisted store, and the shell all run on Linux.

## Files

| File | What it does |
|---|---|
| `rcode-linux-host.js` | The Linux host adapter: `hostId rcode-linux`, public ЯID only (env `RZL_YAID` or `~/.rzl/yaid.pub`), allowlist bridge (`getYaId`, `hostInfo`), storage null. Keys never cross; unlisted methods refused fail-closed. |
| `rcode-linux-shell.js` | The `R:\>` terminal shell: boots Core v3 from the persistent FileStore, registers `rcode-bridge` once per store (never duplicates the chain entry), answers `help · status · chain verify · chain tail · host · ask <question>`, plus the engine's own `/rseed` commands. |
| `test-linux-seat.js` | Node proof: detectHost, getYaId round-trip, allowlist refusal, boot from a temp store copy, plugin registration, status + chain verify, ask retrieval. Run from `renjin/`: `node adapters/linux/test-linux-seat.js` |
| `run.sh` | Launcher (`chmod +x`, per the Inner Beacon Linux rule). `./run.sh` — no install, no network. |

## Proven here (2026-11-20, this Linux VM, Node v24.22.1)

```
detectHost → rcode-linux / linux
getYaId → ЯID-0001-3QQS
unlisted method refused → true
restored boot → chain_entries 9 · chain_ok true · loss 3.1201 · host rcode-linux
chain verify → Ghost Chain OK · 9 entries · head 19234a4a145ba6d3 · key dba05c070151004f
ask → lesson 118: Block 2 mints the cryptobot ThundR, serial 2, ЯID-0014-KREH …
fresh-seat registerPlugin → ok · rcode-bridge 0.1.0 · entry 2
RCODE LINUX SEAT TEST — ALL PASS
```

The live shell was also driven end to end over piped stdin (`status ·
chain verify · ask · host · exit`, exit 0): status prints the full
engine state (9 entries, loss 3.1201, host rcode-linux), chain verify
answers OK, ask quotes lesson 118. The shipped `src/store-v3.json`
was never mutated by testing — same MD5 before and after
(`1541336b…c1a1`); the test boots from a temp copy and the shell test
ran on a temp copy.

## Known limit — restored stores are read-only for signing

The device chain key is non-extractable by design, and a JSON
FileStore cannot carry a CryptoKey across processes (it serialises to
`{}`), so a fresh Node process can verify with the public key but
cannot sign a new entry. Every chain append signs, so on a restored
store `train`, `evolve`, `grow` and plugin registration all refuse
with `Failed to execute 'sign' on 'SubtleCrypto': 2nd argument is not
of type CryptoKey` — the shell prints that plainly and keeps running
in read mode. This is the persist build's own read-only reload limit
(its verify mode never signs), not a seat bug; the test asserts the
refusal so the limit stays visible. The fix is a fresh seat mint: a
store created in-process (or a key store that can carry a CryptoKey,
like the phone's IndexedDB) mints its own chain+key per the EVOLVE
law, and the plugin admission path is proven on exactly that shape
(test engine B, entry 2).

## Run it

```sh
cd renjin/adapters/linux
./run.sh
R:\> status
R:\> chain verify
R:\> ask Which block mints ThundR?
R:\> exit
```

## Publish (waits on Rizal's GO)

1. **GitHub** — push `renjin/adapters/linux/` to `RIZALEON/RENJIN-CRYPTOBOT-AI`
   `main` and mirror to `RIZALEON/PROJECTR` `shared`, paired, per the
   push-update method (skill `push-update-rdragon-17e`). Needs his tap on
   the approval card.
2. **Meta** — the seat belongs on the RCRYPTOFORGE space alongside the
   iOS/macOS adapter seats. A Muse space cannot be edited from this VM;
   that publish is a space build, same as the forge itself.

## Laws carried

- ONE RULE: nothing erased — the chain only grows; training writes to
  the device's own store, rollback restores, never deletes.
- Pure .RZL: no foreign model formats; the seat runs the pure JS core
  and the persisted `.rzl` store only.
- Starfield law: every shell and terminal opens on the RZL starfield.
  A text terminal cannot embed the image, so this seat is the one open
  gap against that law — recorded here, not faked. The seat's boot line
  names the starfield seat; a Linux GUI seat (or a terminal that sets
  its background image) is the follow-up that closes it.
- Authorization is the owner's recorded command; bots never sign.
  This seat signs nothing and touches no keys.
