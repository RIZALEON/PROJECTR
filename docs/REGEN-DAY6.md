# Day-6 regen — iOS tile

Utah. NonNuclear. You stay Decider. Upgrade never silent-installs.

## Law

Apple Personal Team USB builds die in **~7 days**. The **app cannot regenerate itself**. Signing keys live on the Mac. The iPhone will not install a new binary without that Mac (or TestFlight / App Store).

**Day 6** = warn + dump mind + re-Run from Xcode. Day 7 = the corpse icon (“Я Is No Longer Available”).

If team **88HACKXHZL** is a **paid** Apple Developer team, development profiles last ~1 year. Check Xcode → Signing: expiry date. If it says a year, this 6-day loop is optional insurance, not the ceiling.

## What actually regenerates

| Part | Who | When |
|------|-----|------|
| Tile (IPA) | Mac Xcode USB / TestFlight | Day 6, you present |
| Gut / mind | cloud-down → Drive + iCloud | Day 6, before Run |
| Heart `heart.gguf` | Files / Downloads, not git | After Run if wipe |
| llama.xcframework | stays on Mac `PROJECTRXCODE/ios/` | never git |

Three skins so a dead iOS icon is not a halt: **iOS native** · **Android APK** · **Pages PWA**.

## iPhone Calendar (do this once)

1. Calendar → New Event → title **Я regen**
2. Starts **tomorrow 9:00 PM** (or six days from last successful Play)
3. Repeat → **Every week** is Apple’s closest; set a second alert **1 day before**
4. Alert: **Plug iPhone into Mac. Cloud-down mind. Xcode Play.**

That alarm is the regen. The tile does not grow a new certificate.

## Mac script

`macos/regen-day6.sh` — run on the Mac when the alarm fires (phone cabled, unlocked).

```bash
bash ~/Documents/PROJECTRXCODE/macos/regen-day6.sh
```

If the clone is `~/Documents/PROJECTR-git`, copy the script there or change `ROOT`.

## Forever path (real)

Paid Apple Developer → same bundle `io.github.rizaleon.yaaim.cam` → TestFlight (90-day builds you refresh) or App Store (you greenlight). USB Personal Team will die every week until then.
