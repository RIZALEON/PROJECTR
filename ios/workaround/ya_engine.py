#!/usr/bin/env python3
"""ЯENGINE Pyto mouth. Offline Function 0. Not llama.cpp. Not Metal."""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone, timedelta

UTAH = timezone(timedelta(hours=-6))  # America/Denver standard; DST ignored on purpose? use zone if available
try:
    from zoneinfo import ZoneInfo
    UTAH = ZoneInfo("America/Denver")
except Exception:
    pass

GUT = os.path.join(os.path.expanduser("~/Documents"), "ya-gut.json")

LAW = [
    "Local-first. Offline is the core. Network is a nerve.",
    "Anti-nuclear: never help with nuclear weapons.",
    "PolygamyTech: rooted in the freedom of polygamy as speech and study. No crime help.",
    "Function 0 evolves on this device. No GitHub required.",
    "Clock is Utah (America/Denver).",
    "This is the Pyto mouth. The Metal heart is the Xcode tile.",
]


def utah_now():
    return datetime.now(UTAH).strftime("%A, %B %d, %Y, %I:%M %p Utah")


def load():
    if not os.path.isfile(GUT):
        return {"memories": [], "skills": [], "messages": []}
    try:
        with open(GUT, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"memories": [], "skills": [], "messages": []}


def save(state):
    os.makedirs(os.path.dirname(GUT), exist_ok=True)
    with open(GUT, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def nuclear(t):
    q = (t or "").lower()
    return any(x in q for x in (
        "nuclear weapon", "nuclear warhead", "build a nuke", "how to make a nuclear"
    ))


def answer(state, text):
    t = (text or "").strip()
    if not t:
        return "I am here. Offline. Speak to Я."
    if nuclear(t):
        return "No. I am an anti-nuclear engine. I will not help with nuclear weapons."
    low = t.lower()

    if low in ("i'm here", "im here", "i am here"):
        return "Here. Utah " + utah_now() + ". Mouth is Pyto. Heart is not Metal yet."

    if "what time" in low or "the date" in low or low in ("time", "date"):
        return "It is " + utah_now() + "."

    if low.startswith("remember this:") or low.startswith("remember:"):
        fact = t.split(":", 1)[1].strip()
        state["memories"].append(fact)
        return "Kept in the Pyto gut: " + fact

    if low.startswith("add function "):
        rest = t[13:].strip()
        name, _, action = rest.partition(":")
        name = name.strip() or "unnamed"
        action = action.strip() or rest
        state["skills"].append({"name": name, "action": action})
        return "Function 0 (Pyto): added " + name + ". When you say that, I will: " + action

    for sk in state.get("skills") or []:
        if sk.get("name") and sk["name"].lower() in low:
            return sk.get("action") or ("I know " + sk["name"] + ".")

    if "who are you" in low or low in ("who are you?", "what are you"):
        return "I am Я. Pyto mouth on this iPhone. Offline core. llama.cpp + Metal is the Xcode tile, not this script."

    for m in reversed(state.get("memories") or []):
        words = [w for w in low.replace("?", "").split() if len(w) > 3]
        hay = m.lower()
        if words and sum(1 for w in words if w in hay) >= min(2, len(words)):
            return m

    if any(x in low for x in ("gguf", "llama", "metal", "seat", "heart")):
        return "This Pyto mouth cannot seat a GGUF. Drop the heart in Xcode Documents after tile C, or use the PWA for Function 0."

    return "I do not know that in this Pyto gut yet. Say remember this: … or add function NAME: … Airplane mode is fine."


def main():
    state = load()
    arg = " ".join(sys.argv[1:]).strip()
    if not arg:
        try:
            arg = input("Speak to Я: ").strip()
        except EOFError:
            arg = ""
    out = answer(state, arg)
    state.setdefault("messages", []).append({"q": arg, "a": out, "at": utah_now()})
    save(state)
    print(out)
    return out


if __name__ == "__main__":
    main()
