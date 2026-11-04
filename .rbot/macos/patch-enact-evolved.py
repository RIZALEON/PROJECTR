#!/usr/bin/env python3
"""Hands: enactEvolved into PROJECTR app.js. Run on ~/Desktop/PROJECTR. Decider greenlight."""
from pathlib import Path
import sys

ROOT = Path.home() / "Desktop" / "PROJECTR"
APP = ROOT / "app.js"
if len(sys.argv) > 1:
    APP = Path(sys.argv[1]).expanduser().resolve()

if not APP.is_file():
    sys.exit("missing " + str(APP))

src = APP.read_text(encoding="utf-8")
if "function enactEvolved(" in src:
    sys.exit("already patched: " + str(APP))

OLD_MATCH = '''function matchEvolved(userText) {
  const q = userText.toLowerCase();
  const list = state.evolved || [];
  for (const s of list) {
    if (!s || s.enabled === false) continue;
    if (!s.trigger) continue;
    if (q.includes(s.trigger.toLowerCase())) return s;
  }
  return null;
}'''

NEW_MATCH = r'''async function enactEvolved(skill, userText) {
  const tape = String(skill.action || "");
  const green = !!state.mindOnline;
  const hasTape = /UTAH|MIND|HEART|LIGHT|PENDING|KEEP|OPEN|GET|ACK/.test(tape);
  if (!hasTape) return tape;
  const out = [];
  const utah = new Date().toLocaleString("en-US", { timeZone: "America/Denver" });
  const mind = state.lastMindBytes ? (state.lastMindBytes / 1024).toFixed(1) + " KB" : "unknown";
  const heart = state.heart ? "seated" : "empty-or-rules";
  const light = green ? "green" : "amber/isolated";
  const pending = (state.evolved || []).length;
  const verbs = tape.split("|").map(function (s) { return s.trim(); }).filter(Boolean);
  const MAIL = "https://raw.githubusercontent.com/rizalward/Rbot/main/GROK-MAILBOX.md";
  for (var i = 0; i < verbs.length; i++) {
    var v = verbs[i];
    if (/^UTAH/i.test(v)) out.push("Utah: " + utah);
    else if (/^LIGHT/i.test(v)) out.push("Light: " + light);
    else if (/^MIND/i.test(v)) out.push("Mind: " + mind);
    else if (/^HEART/i.test(v)) out.push("Heart: " + heart);
    else if (/^PENDING/i.test(v)) out.push("Pending/seated skills: " + pending);
    else if (/^KEEP/i.test(v)) remember("Grok line kept " + utah);
    else if (/^ACK/i.test(v)) out.push("ACK { seated: " + skill.name + ", mind: " + mind + ", heart: " + heart + ", utah: " + utah + " }");
    else if (/^OPEN|^GET/i.test(v)) {
      if (!green) out.push("GET/OPEN skipped — amber. Airplane is truth.");
      else if (typeof fetchTextLoose === "function") {
        const raw = await fetchTextLoose(MAIL + "?t=" + Date.now());
        if (raw && raw.length > 20) {
          const clip = raw.length > 1800 ? raw.slice(0, 1800) + "\n…" : raw;
          remember("Mailbox GET " + utah);
          out.push("Hands grok.bridge GET (green). Grok lines kept.\n\n" + clip);
        } else out.push("GET failed. Gut only.");
      } else out.push("GREEN_FETCH " + MAIL);
    }
  }
  remember("Used evolved function " + skill.name);
  return out.join("\n");
}

function matchEvolved(userText) {
  const q = String(userText || "").toLowerCase().replace(/^run\s+/, "");
  function fold(s) {
    return String(s || "").toLowerCase().replace(/[._-]+/g, " ").trim();
  }
  const list = state.evolved || [];
  for (const s of list) {
    if (!s || s.enabled === false) continue;
    if (s.trigger && q.includes(String(s.trigger).toLowerCase())) return s;
    if (fold(q) === fold(s.trigger) || fold(q) === fold(s.name)) return s;
  }
  return null;
}'''

OLD_HOOK = '''  const evolvedHit = matchEvolved(userText);
  if (evolvedHit) {
    remember("Used evolved function " + evolvedHit.name);
    return evolvedHit.action;
  }'''

NEW_HOOK = '''  const evolvedHit = matchEvolved(userText);
  if (evolvedHit) return await enactEvolved(evolvedHit, userText);'''

if OLD_MATCH not in src:
    sys.exit("matchEvolved block not found — app.js moved. Open the file and patch by hand.")
if OLD_HOOK not in src:
    sys.exit("evolvedHit hook not found — app.js moved. Open the file and patch by hand.")

out = src.replace(OLD_MATCH, NEW_MATCH, 1).replace(OLD_HOOK, NEW_HOOK, 1)
bak = APP.with_suffix(".js.bak-hands")
bak.write_text(src, encoding="utf-8")
APP.write_text(out, encoding="utf-8")
print("patched", APP)
print("backup ", bak)
