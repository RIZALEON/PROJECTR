# Day-6 regen — dump first, then tile

Utah. NonNuclear. You stay Decider. Upgrade never silent-installs.

## Order (locked)

1. **Dump** the mind (handoff) off the phone.
2. **Upload / save** that file to Google Drive MACHINE MIND (and iCloud if present).
3. **Then** Mac Xcode Play (tile regen).

Never regen before the dump. A new install can wipe Documents. Drive is the twin.

## Law

The iPhone **cannot** push Drive by itself after the tile is dead, and it **cannot** re-sign the IPA. Automatic = **Mac copy into a synced Drive folder** + a weekly alarm. You still plug the phone and press Play.

Apple Personal Team ~7 days. Paid team **88HACKXHZL** may already be ~1 year — check Xcode Signing expiry.

## Drive (MACHINE MIND)

https://drive.google.com/drive/folders/1nlsYA64RRCxoaidboYS16rd_0KuU60d7

On the Mac, install **Google Drive for desktop** and sync that folder. Day-6 script copies the newest mind dump into it → Drive uploads **without** a browser.

Files it looks for (newest wins):

- `RZL-mind*.txt`
- `ya-mind*.json`
- `*mind*.txt` in Downloads / Desktop / iCloud Drive

It writes a stamp: `HANDOFF-DAY6-YYYY-MM-DD.md` next to the dump.

## iPhone (while the tile still opens)

1. Open Я → **cloud-down** (mind dump).
2. Share Sheet → **Save to Files** *and* **Drive** (folder MACHINE MIND).
3. Calendar event **Я regen** weekly, alert 1 day before: *Dump mind to Drive. Then plug Mac. Play.*

If the tile already says No Longer Available: use the last Drive file [RZL-mind-2026-09-07.txt](https://drive.google.com/file/d/1driuf80twKojTobNLSRr0FJ6WI8TSBbx/view) after the new Play, then cloud-up.

## Mac script

```bash
bash ~/Documents/PROJECTRXCODE/macos/regen-day6.sh
```

Set if Drive desktop uses a custom path:

```bash
export YA_DRIVE_DIR="$HOME/Library/CloudStorage/GoogleDrive-YOUR/My Drive/Я MACHINE MIND"
```

Exit 2 = dump missing. **Do not Play** until a mind file is in Drive.

## Grok weekly nag

Automation **Я day-6 dump+regen** (America/Denver, weekly). It lists Drive MACHINE MIND and tells you if a fresh dump is missing. It cannot read the iPhone sandbox. It does not press Play.
