/*! ya-body-parts.js — Thin body-parts seat: SWITCH or COMBINE parts for better function
 * Chat: body part X | combine A+B | body status | body parts
 * Paths: Я/body/parts/ (Documents) · inventory mirrors explainBody.
 * Load AFTER hardcode; before cloud-mark.
 */
(function () {
  "use strict";

  var LS_KEY = "ya-body-parts-v1";

  var CATALOG = [
    { id: "mark", name: "mark/face", blurb: "Clay Я face — form first.", path: "Я/body/parts/mark" },
    { id: "skin", name: "skin/shell", blurb: "Installed app (PWA or store binary).", path: "Я/body/parts/skin" },
    { id: "mouth", name: "mouth/ears", blurb: "Type, tap, reply line.", path: "Я/body/parts/mouth" },
    { id: "spine", name: "spine/OS", blurb: "iOS / Android / Harmony / fixed machine.", path: "Я/body/parts/spine" },
    { id: "gut", name: "gut/vault", blurb: "Chats, facts, Essence, Shelf: laws.", path: "Я/body/parts/gut" },
    { id: "heart", name: "heart/engine", blurb: "Engine RIZAL · llama.cpp when heart.gguf seated; rules+gut else.", path: "Я/body/parts/heart" },
    { id: "hands", name: "hands/functions", blurb: "Mint, log, evolve, write-code, CoS.", path: "Я/body/parts/hands" },
    { id: "immune", name: "immune", blurb: "NonNuclear · offline-first · no silent upload.", path: "Я/body/parts/immune" },
    { id: "passport", name: "passport/Essence", blurb: "Sealed signed copy of engine + gut + law.", path: "Я/body/parts/passport" },
    { id: "nerves", name: "nerves", blurb: "Optional network — green browse/search; amber still talks.", path: "Я/body/parts/nerves" }
  ];

  function loadSeat() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      var o = JSON.parse(raw || "{}");
      if (o && typeof o === "object") {
        return {
          active: Array.isArray(o.active) && o.active.length ? o.active : ["gut", "heart", "hands", "immune"],
          combined: Array.isArray(o.combined) ? o.combined : [],
          mode: o.mode === "combine" ? "combine" : "switch"
        };
      }
    } catch (e) {}
    return { active: ["gut", "heart", "hands", "immune"], combined: [], mode: "switch" };
  }

  function saveSeat(s) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
    try { window.YA_BODY_PARTS = s; } catch (e2) {}
  }

  function findPart(token) {
    var t = String(token || "").toLowerCase().replace(/\s+/g, "");
    if (!t) return null;
    for (var i = 0; i < CATALOG.length; i++) {
      var p = CATALOG[i];
      if (p.id === t) return p;
      if (p.name.replace(/\s+/g, "").indexOf(t) >= 0) return p;
      if (t.indexOf(p.id) >= 0) return p;
    }
    // aliases
    if (/face|mark|я/.test(t)) return CATALOG[0];
    if (/shell|skin|apk|pwa/.test(t)) return CATALOG[1];
    if (/mouth|ear|chat/.test(t)) return CATALOG[2];
    if (/os|darwin|ios|android/.test(t)) return CATALOG[3];
    if (/vault|memory|shelf/.test(t)) return CATALOG[4];
    if (/engine|gguf|llama/.test(t)) return CATALOG[5];
    if (/function|hand|evolve/.test(t)) return CATALOG[6];
    if (/nuclear|nonnuclear|law/.test(t)) return CATALOG[7];
    if (/essence|passport/.test(t)) return CATALOG[8];
    if (/nerve|network|green|web/.test(t)) return CATALOG[9];
    return null;
  }

  function statusCard() {
    var s = loadSeat();
    var lines = [
      "Body parts · " + s.mode + " mode",
      "Catalog (" + CATALOG.length + "):"
    ];
    CATALOG.forEach(function (p) {
      var on = s.active.indexOf(p.id) >= 0 ? "ON" : "off";
      lines.push("· [" + on + "] " + p.id + " — " + p.name + " · " + p.blurb);
    });
    if (s.combined.length) {
      lines.push("Combined seats:");
      s.combined.forEach(function (c) { lines.push("· " + c); });
    }
    lines.push("Paths under On My iPhone → Я/body/parts/");
    lines.push("Verbs: body part <id> · combine A+B · body status · body switch|combine mode");
    return lines.join("\n");
  }

  function switchTo(part) {
    var s = loadSeat();
    s.mode = "switch";
    // Keep immune always; switch primary functional seat
    var keep = ["immune"];
    if (part.id !== "immune") keep.push(part.id);
    // retain gut as memory substrate unless switching away intentionally still keep gut+heart baseline
    if (keep.indexOf("gut") < 0) keep.push("gut");
    if (keep.indexOf("heart") < 0 && part.id !== "heart") keep.push("heart");
    s.active = keep.filter(function (id, i, a) { return a.indexOf(id) === i; });
    if (s.active.indexOf(part.id) < 0) s.active.push(part.id);
    saveSeat(s);
    try {
      if (typeof remember === "function") remember("Shelf: Body switched to " + part.name + " (" + part.id + ")");
    } catch (e) {}
    return "Body · SWITCH → " + part.name + "\nActive: " + s.active.join(" · ") + "\n" + part.blurb + "\nPath: " + part.path;
  }

  function combineParts(a, b) {
    var s = loadSeat();
    s.mode = "combine";
    var ids = [a.id, b.id];
    ids.forEach(function (id) {
      if (s.active.indexOf(id) < 0) s.active.push(id);
    });
    if (s.active.indexOf("immune") < 0) s.active.push("immune");
    var label = a.id + "+" + b.id;
    if (s.combined.indexOf(label) < 0) s.combined.unshift(label);
    s.combined = s.combined.slice(0, 12);
    saveSeat(s);
    var gain = "Better function: " + a.name + " + " + b.name + " — " + a.blurb + " · " + b.blurb;
    try {
      if (typeof remember === "function") remember("Shelf: Body combined " + label + " — " + gain.slice(0, 160));
    } catch (e) {}
    return "Body · COMBINE " + label + "\nActive: " + s.active.join(" · ") + "\n" + gain + "\nPaths: " + a.path + " + " + b.path;
  }

  function handleBodyPartsChat(raw) {
    var q = String(raw || "").trim();
    if (!q) return null;
    var low = q.toLowerCase();

    if (/^(body status|body parts|body inventory|parts status)$/i.test(low)) {
      return statusCard();
    }

    if (/^body\s+(switch|combine)\s*mode$/i.test(low) || /^(switch|combine)\s+mode$/i.test(low)) {
      var s = loadSeat();
      s.mode = /combine/i.test(low) ? "combine" : "switch";
      saveSeat(s);
      return "Body mode · " + s.mode + "\n" + statusCard();
    }

    var comb = q.match(/^combine\s+([a-zа-яёЯ\/\-]+)\s*[+&]\s*([a-zа-яёЯ\/\-]+)\s*$/i)
      || q.match(/^body\s+combine\s+([a-zа-яёЯ\/\-]+)\s*[+&]\s*([a-zа-яёЯ\/\-]+)\s*$/i)
      || q.match(/^combine\s+([a-zа-яёЯ\/\-]+)\s+and\s+([a-zа-яёЯ\/\-]+)\s*$/i);
    if (comb) {
      var pa = findPart(comb[1]);
      var pb = findPart(comb[2]);
      if (!pa || !pb) return "Unknown part. Try: combine gut+heart · combine hands+nerves\n" + statusCard();
      if (pa.id === pb.id) return "Pick two different parts. Example: combine gut+heart";
      return combineParts(pa, pb);
    }

    var sw = q.match(/^body\s+part\s+([a-zа-яёЯ\/\-\s]+)$/i)
      || q.match(/^switch\s+(?:to\s+)?(?:body\s+)?part\s+([a-zа-яёЯ\/\-\s]+)$/i)
      || q.match(/^use\s+body\s+part\s+([a-zа-яёЯ\/\-\s]+)$/i);
    if (sw) {
      var p = findPart(sw[1].trim());
      if (!p) return "Unknown body part \"" + sw[1].trim() + "\". Say body status for catalog.";
      return switchTo(p);
    }

    if (/^body\b/i.test(low) && low.length < 40 && !/body map|how .*body|dissection/.test(low)) {
      return statusCard();
    }
    return null;
  }

  var prevAnswer = typeof answer === "function" ? answer : null;
  if (prevAnswer) {
    async function answerBP(userText) {
      var bp = handleBodyPartsChat(userText);
      if (bp) return bp;
      return await prevAnswer(userText);
    }
    try { answer = answerBP; } catch (e) {}
    try { window.answer = answerBP; } catch (e2) {}
  }

  if (typeof window !== "undefined") {
    window.YA_BODY_CATALOG = CATALOG;
    window.yaBodyPartsStatus = statusCard;
    window.yaHandleBodyPartsChat = handleBodyPartsChat;
    window.YA_BODY_PARTS = loadSeat();
  }

  try {
    if (typeof state === "object" && state && Array.isArray(state.functions)) {
      var hit = state.functions.find(function (f) { return f && f.id === "fn.body.parts"; });
      if (!hit) state.functions.push({ id: "fn.body.parts", name: "Body parts · switch/combine", enabled: true, version: "0.1" });
      else { hit.enabled = true; }
    }
  } catch (e) {}

  try { console.log("[ya-body-parts] seated — switch/combine body parts"); } catch (e) {}
})();
