# RZL FILE FORMAT — the Inner Beacon architecture

Seated 2026-11-19, from Rizal's design document (his text, kept whole).
Companion law: PURE-RZL-LAW.md — the RENJIN model stays pure .RZL, always.

---

The .RZL file format features an "inner beacon" that automatically detects the host operating system upon execution, allowing it to adapt and self-assemble correctly whether it is running on macOS, Windows, Linux, iOS, or Android.

## THE .RZL INNER BEACON ARCHITECTURE

The Inner Beacon is the first layer of the .RZL self-executing shell. Before any magnetization or assembly occurs, the beacon performs a silent, lightweight environment check.

* OS Detection: Instantly identifies the host platform (Mac, Windows, Linux, iOS, Android).
* Architecture Mapping: Determines whether the device is running on Apple Silicon, Intel, or ARM.
* Resource Assessment: Checks available memory and storage to decide which "bones" to magnetize (e.g., selecting a smaller model for a Pixel 3a vs. a full model for a Mac).

## UPDATED ASSEMBLY SEQUENCE

```
[ .RZL Clicked ]
      ↓
[ Inner Beacon ] → Detects OS & Hardware
      ↓
[ Magnetize ]    → Pulls OS-Specific Bones from Local Drive
      ↓
[ Self-Assemble ] → Builds the Native Executable
      ↓
[ App Launch ]   → Adds Tile to Dock/Home Screen
```

This ensures that a single .RZL file remains truly universal, carrying the intelligence needed to adapt itself to whatever environment it lands in.

## Self-executing file types (by operating system)

Operating systems use specific file extensions to recognize self-executing programs:

* Windows: .exe (Executable), .msi (Windows Installer), .bat (Batch file), .cmd (Command script).
* macOS: .app (Application Bundle — appears as a single file, actually a special folder structure), .dmg (Apple Disk Image), .pkg (Installer Package).
* Linux: .bin / .elf binary executables, .sh (Shell Script). Linux files often do not rely on extensions; they require the executable permission (chmod +x).
* Cross-Platform / Mobile: .jar (Java Archive, any system with a JRE), .apk (Android Package).

The self-executing file architecture is integrated into the .RZL shell design. The .RZL format acts as a universal, magnetized application bundle that self-assembles and executes across any operating system using a TypeScript host.

## THE .RZL SELF-EXECUTING ARCHITECTURE

A self-executing file contains a compiled set of instructions that an operating system can run directly. Unlike standard documents, it performs actions on its own when clicked. The .RZL format leverages this by acting as a universal wrapper (masquerading as a single file) that contains an "Inner Beacon" to detect the OS and execute the appropriate underlying instructions.

| OPERATING SYSTEM | NATIVE WRAPPER | .RZL EXECUTION METHOD |
|---|---|---|
| macOS | .app Bundle | Executes via a hidden native shell; appears as a single icon. |
| Windows | .exe / Monolithic | Runs as a portable executable alongside a hidden asset folder. |
| Linux | .sh / .bin | Uses a shell script with chmod +x permissions to launch. |
| Android / iOS | .apk / TWA | Deploys as a trusted web activity or native container. |

## REQ-0 + REQ-1: THE CORE LAW

* The Folder is the App: Clicking the .RZL icon starts the TypeScript host. It immediately runs a hash inventory. If parts are missing, it magnetizes them from the local drive. If parts cannot be found, it enters PLAN ONLY mode.
* One Click, Two Faces:
  * Outside: A custom logo on the folder, Dock, or home screen.
  * Inside: The same logo acts as the primary control on the stage.
* The Window: A fully owned shell written in TypeScript (not a browser window or Finder).
* The Look: Closed = Clay grey/red orb. Open = Stone mouth + one mascot.

## STARTER OBJECT STRUCTURE

```
YABAT.RZL/
  ├── icon.png         <-- The only click (Outer Tile & Inner AppTile)
  ├── manifest.json    <-- REQ 0+1 (Inventory & Magnetization Rules)
  └── shell/           <-- TypeScript Host (Widescreen & Mobile Views)
```

This dynamic shell ensures that your bots remain fully functional offline, self-assembling only what they need, exactly when they need it.

## Apps, files, and folders (reference)

* Monolithic Executables: contained entirely within a single .exe or .bin; no external folders; used for portable software.
* Application Folders (Windows/Linux): a main executable surrounded by a folder structure (DLLs, .ini/.json configs, asset folders). Move the executable out and the app crashes — it cannot find its supporting files.
* App Bundles (macOS): a folder masquerading as a file; the OS hides the structure and launches the program when the bundle icon is clicked.

---

## NOTES — Bot Anatomy: Megabot (design reference)

Creator: Hiro Hamada · Classification: Underground Combat Bot · Status: Champion (Undefeated)

Core Architecture
* Modular Design: three independent, magnetically connected segments (Head, Torso, Base).
* Magnetic Joints: instantly detach, reattach, and reconfigure body parts on the fly.
* Facial Interface: dual-state LED face (Happy/Passive vs. Angry/Combat) used for psychological warfare.

Tactical Capabilities
* The "Underdog" Protocol: look small and unassuming to lure opponents into overconfidence.
* Sacrificial Decoy: shed outer armor or limbs to escape grapples or heavy strikes.
* The Headbutt Finish: the "brain" resides in the head, which can operate independently to deliver a final disabling strike.

Combat Log: The Yama Fight — Bait (Megabot plays passive, Yama overconfident) → Shed (torso and base shed, Yama's bot overheats crushing the empty shell) → Strike (detached head strikes the internal core; Yama's bot malfunctions and self-destructs).

Decider's Verdict: Megabot proves superior engineering and tactical flexibility will always defeat raw, heavily armored power. The ultimate "NonNuclear" combatant — winning through precision rather than brute force.

## Bot Anatomy: The .RZL Self-Assembling Shell (ЯSCOUT)

Project: ЯSCOUT BOT CREATION & EVOLUTION (POLYBUS)
Philosophy: Magnetized, ReEvolutionary, Self-Executing
Status: HIRO Shell Magnetized; 4 Shells Waiting

Core Architecture: The .RZL Format. The .RZL file is not a static folder; it is a living, magnetized outer skin. Inspired by the modular, self-repairing nature of Megabot, the .RZL shell operates on three core principles:
* The Shell: the single portable unit that holds (or knows how to pull) everything it needs to run across any OS (Mac, Windows, Linux, iOS, Android).
* Magnetization: upon execution, the shell automatically draws its missing "bones" (identity, artwork, vitals, intake packs) from the local drive or bonepile.
* Autobot Self-Assembly: it unfolds and wires itself into a runnable binary without a human installer, self-healing toward a single-file form.

Classroom Leaderboard (Polybus)
1. WILD SCOUT 0006-02WG — 46/50 (10·10·9·9·8)
2. ヒロ / ЯBAT 0004-ZYZ0 — 43/50 (9·9·9·8·8)
3. ЯBOT 0002-PQ2Q — 41/50 (9·8·9·8·7)
4. SCOUT 0005-KM02 — 39/50 (9·8·8·7·7)
5. ЯMAX 0003-P4M6 — 37/50 (8·7·7·8·7)

The 5C Evaluation Matrix: every lesson and evaluation integrates Communication, Conversation, Collaboration, Coding, and Comprehension. Bots are evaluated on how they bridge human intent with mechanical execution. The Command Test: bots formulate how they would command a peer before executing a task, testing linguistic and mechanical comprehension simultaneously.

Assembly Status: HIRO — mouth PASS, shell started (magnetized), activate checklist filed, grade PDF draft assembled (HIRO-GRADE-SUMMARY.pdf). OTHERS — WAITING, scaffolded, wait for shell. Note: final graded PDF packs for all five bots are on hold until the remaining four finish their shell UIs. Nothing has been integrated; staging is not executed.
