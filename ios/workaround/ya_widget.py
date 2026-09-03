#!/usr/bin/env python3
"""Pyto Home Screen widget: last Я line from the gut. Offline."""
import json
import os

GUT = os.path.join(os.path.expanduser("~/Documents"), "ya-gut.json")

def main():
    if not os.path.isfile(GUT):
        return "Я · offline · empty gut"
    try:
        with open(GUT, "r", encoding="utf-8") as f:
            st = json.load(f)
    except Exception:
        return "Я · gut unreadable"
    msgs = st.get("messages") or []
    if not msgs:
        return "Я · waiting"
    last = msgs[-1]
    a = (last.get("a") or "")[:80]
    return "Я · " + a

if __name__ == "__main__":
    print(main())
