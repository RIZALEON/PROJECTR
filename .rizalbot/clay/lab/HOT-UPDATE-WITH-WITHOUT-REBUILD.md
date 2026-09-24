# ЯBOT Lab / chrome HOT-UPDATE — with & without rebuild

Crown Я · machineId `55d92eb0-0ce0-4959-b297-440d80e59e38` · branch `seat-wallet-landing` · **PR #1 DO NOT MERGE**

## Lanes

### (A) Without rebuild — hot path live

1. Drop PNG art into:
   `~/Documents/ЯBOT/hot-assets/<AssetName>.png`
   plus optional `grace.l@example.com` / `oscar.d@example.net`.
2. ClayImage.exists / ClayButton art check **hot-assets BEFORE** bundle `Assets.car`.
3. Relaunch `/Applications/ЯBOT.app` (no xcodebuild). New assets appear immediately.
4. Also seed scaffolds / www Documents drops when Lab data changes:
   - `~/Documents/ЯBOT/lab/scaffolds/`
   - `~/Desktop/ЯTOOLBOX/PROJECTR/ios/YaAim/www/` (gnome-pins, manifests)
5. Lab chrome button asset name: **`LabIcon`**.

### (B) With rebuild — bundled Assets.car + install

```bash
DERIVED=~/Library/Developer/Xcode/DerivedData/ЯBOT-hot
xcodebuild \
  -project ~/Documents/ЯBOT/ЯBOT.xcodeproj \
  -scheme ЯBOT \
  -configuration Debug \
  -derivedDataPath "$DERIVED" \
  build

APP=$(find "$DERIVED/Build/Products" -name 'ЯBOT.app' -type d | head -1)
# install
rm -rf /Applications/ЯBOT.app
cp -R "$APP" /Applications/ЯBOT.app
pkill -x ЯBOT || true
open /Applications/ЯBOT.app
```

Ensure `LabIcon.imageset` is in:
- `~/Documents/ЯBOT/ЯBOT/Assets.xcassets/LabIcon.imageset`
- localbuild twin Assets if present

### (C) Always twin when Xcode / GitHub are not the active mouth

When you are not actively editing in Xcode or not treating GitHub as the live mouth, **still twin**:

1. **Documents tree** ↔ **localbuild tree**
   - `~/Documents/ЯBOT/ЯBOT/` ↔ `~/Library/Developer/ЯBOT-localbuild/ЯBOT/`
   - xcodeproj both sides
2. **GitHub** `RIZALEON/RIZALBOT` branch **`seat-wallet-landing`**
   - Commit + push Lab / ClayImage / chrome patches
   - Keep **PR #1 open — DO NOT MERGE**

## Lab button contract

- Top-left chrome leftmost: **LabIcon** ClayButton → then Bolte → BtnSearch
- Tap: system note `"Lab — Function 11"` (Gnome port pending)
- Do **not** break Bolte / Manual landing

## Quick verify

```bash
ls ~/Documents/ЯBOT/hot-assets/LabIcon*.png
rg -n 'LabIcon|hot-assets' ~/Documents/ЯBOT/ЯBOT/ClayTheme.swift ~/Documents/ЯBOT/ЯBOT/ContentView.swift
rg -n 'LabIcon|hot-assets' ~/Library/Developer/ЯBOT-localbuild/ЯBOT/ClayTheme.swift ~/Library/Developer/ЯBOT-localbuild/ЯBOT/ContentView.swift
```
