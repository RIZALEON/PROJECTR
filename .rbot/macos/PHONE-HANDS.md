# Phone Hands

Utah 2026-09-12. Do not paste JS into the phone chat.
This login cannot write RIZALEON/PROJECTR. Patch lives here; you apply it on the phone tree.

## Apply on the Neo

```
cd ~/Desktop/RIZALBOT && git pull --ff-only
python3 macos/patch-enact-evolved.py ~/Desktop/PROJECTR/app.js
```

Expect: `patched /Users/rizal/Desktop/PROJECTR/app.js`
Backup: `app.js.bak-hands`

If PROJECTR is missing:

```
git clone https://github.com/RIZALEON/PROJECTR.git ~/Desktop/PROJECTR
python3 ~/Desktop/RIZALBOT/macos/patch-enact-evolved.py ~/Desktop/PROJECTR/app.js
```

Then rebuild the iOS tile from that www/app.js (same Xcode project you used for V 0.0). Reload the phone app.

## On the phone (green)

Tape should already be seated. If not:

```
add function utah.ping: UTAH | LIGHT | MIND | HEART | PENDING
add function grok.bridge: GET mailbox | KEEP | UTAH | MIND | HEART | PENDING | ACK
```

Then:

```
utah ping
run grok.bridge
```

Pass: numbers + mailbox letter. Fail: recited tape — tile not rebuilt from patched app.js.

Do not merge Rbot into PROJECTR. Commit the patched app.js on RIZALEON/PROJECTR when you are ready.
