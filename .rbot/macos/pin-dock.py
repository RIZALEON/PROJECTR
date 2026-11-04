#!/usr/bin/env python3
"""Point Dock at /Applications/RIZALBOT.app. Drop Desktop/DerivedData copies."""
import os, plistlib, subprocess, tempfile

URL = "file:///Applications/RIZALBOT.app/"
BID = "io.github.rizaleon.rizalbot.mac"


def is_rizal(tile):
    td = tile.get("tile-data") or {}
    label = str(td.get("file-label") or td.get("file-display-name") or "")
    bid = str(td.get("bundle-identifier") or "")
    fd = td.get("file-data") or {}
    u = str(fd.get("_CFURLString") or "")
    blob = " ".join([label, bid, u]).lower()
    return "rizalbot" in blob or "deriveddata" in blob and "rizal" in blob


try:
    raw = subprocess.check_output(["defaults", "export", "com.apple.dock", "-"])
    data = plistlib.loads(raw)
except Exception:
    raise SystemExit(0)

kept = [t for t in data.get("persistent-apps", []) if not is_rizal(t)]
kept.append(
    {
        "tile-type": "file-tile",
        "tile-data": {
            "file-data": {"_CFURLString": URL, "_CFURLStringType": 15},
            "file-label": "RIZALBOT",
            "bundle-identifier": BID,
        },
    }
)
data["persistent-apps"] = kept
fd, path = tempfile.mkstemp(suffix=".plist")
os.close(fd)
with open(path, "wb") as f:
    plistlib.dump(data, f)
subprocess.run(["defaults", "import", "com.apple.dock", path], check=False)
os.unlink(path)
