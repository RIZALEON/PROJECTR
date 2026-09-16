# Clay seat → Documents/ЯBOT (macOS native)

## Blocker for executor
This executor's Shell/Read schemas do **not** include `machineId`.
ListMachines / CopyToBox / CopyFromBox are also absent.
All commands ran on Linux box (`hostname=cursor`). Cannot xcodebuild on Mac from here.

## Parent must run (machineId `55d92eb0-0ce0-4959-b297-440d80e59e38`)

### 1) Copy pack onto Mac
CopyFromBox:
- box: `/workspace/ybot-clay-seat.tgz`
- computer: `/Users/rizal/Documents/ЯBOT/ybot-clay-seat.tgz`

Then Shell+machineId:
```bash
cd /Users/rizal/Documents/ЯBOT && tar xzf ybot-clay-seat.tgz && bash ybot-clay-seat/handoff/apply-clay-seat-macos.sh
```

Or CopyFromBox the whole directory `/workspace/ybot-clay-seat` recursively if supported; otherwise use the tgz.

### 2) Decider Run
In Xcode (project already open):
- Destination: **My Mac** (native macOS — NOT "Designed for iPad")
- Scheme: **ЯBOT**
- Product → Run (⌘R)
- Keep Personal Team; leave App Sandbox / network offline as-is

### 3) What apply does
- Writes `MyApp.swift`, `ContentView.swift`, `ClayTheme.swift`, `ChatMessage.swift` into `ЯBOT/`
- Creates imagesets under `Assets.xcassets`: Bolte, MachineMind, ToggleOnline, ToggleOffline, SearchGlass, ArrowDown, PlusAttach
  (prefers Desktop thematics PNG freeform; falls back to pack staging / ChatGPT ios www)
- Ensures `CURRENT_PROJECT_VERSION=1` and `MARKETING_VERSION=0.1` in pbxproj
- Runs `xcodebuild … -destination 'platform=macOS' … build`

### UX contract seated
Dark clay background, centered embossed chat slab, Bolte+ЯBOT+share header, clay bubbles, purple pill composer + Send, floating +, top-left Bolte+search, top-right ONLINE/LINK + MachineMind, purple jump chevron, in-memory chat (`ping`→`here`, else `Here. Clay seat live.`). Native SwiftUI only — no WKWebView.
