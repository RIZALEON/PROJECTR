/*! ya-mind-continuity.js — offline continuity stamp for RIZALBOT EMBEDDED / CoS slice
 * FRIEND-CONTINUITY pattern: local stamp + recent gut facts, no cloud brain, no heart dump.
 * Seat after ya-hardcode-0.1.js; before compass.
 */
(function () {
  "use strict";

  var KEY = "ya-aim-continuity-v1";
  var MAX_FACTS = 12;
  var MAX_CHAT = 8;

  function mindAwareKey() {
    try {
      if (typeof mindKey === "function") return mindKey(KEY);
    } catch (e) {}
    try {
      if (typeof account !== "undefined" && account && account.sub) return KEY + ":" + String(account.sub).slice(0, 24);
    } catch (e2) {}
    return KEY;
  }

  function stampDenver() {
    try {
      return new Date().toLocaleString("en-US", { timeZone: "America/Denver" });
    } catch (e) {
      return new Date().toISOString();
    }
  }

  function loadContinuity() {
    try {
      var raw = localStorage.getItem(mindAwareKey());
      var o = JSON.parse(raw || "{}");
      if (!o || typeof o !== "object") return defaultContinuity();
      return Object.assign(defaultContinuity(), o);
    } catch (e) {
      return defaultContinuity();
    }
  }

  function defaultContinuity() {
    return {
      kind: "ya-continuity",
      v: 1,
      stamp: "",
      at: 0,
      companion: "Rizalbot",
      cosSlice: true,
      lastBounce: "",
      lastFurthest: "",
      lastPong: "",
      mindOnline: false,
      facts: [],
      chatTail: [],
      note: ""
    };
  }

  function pickFacts() {
    var out = [];
    try {
      var mems = (typeof state !== "undefined" && state && state.memories) ? state.memories : [];
      function pushOne(text, at) {
        if (out.length >= MAX_FACTS) return;
        out.push({ text: text.slice(0, 240), at: at || 0 });
      }
      // Prefer Shelf:/ASTA: bookshelves for perfect-memory path
      for (var i = 0; i < mems.length && out.length < MAX_FACTS; i++) {
        var tx = mems[i] && mems[i].text ? String(mems[i].text).trim() : "";
        if (!tx) continue;
        if (/^(Shelf:|ASTA:|Bookshelf:)/i.test(tx)) pushOne(tx, mems[i].at);
      }
      for (var j = 0; j < mems.length && out.length < MAX_FACTS; j++) {
        var t2 = mems[j] && mems[j].text ? String(mems[j].text).trim() : "";
        if (!t2) continue;
        if (/^Core:/i.test(t2) || /^user said:/i.test(t2) || /^From talk:/i.test(t2)) continue;
        if (/^(Shelf:|ASTA:|Bookshelf:)/i.test(t2)) continue;
        if (typeof isHygieneJunkMemory === "function" && isHygieneJunkMemory(t2)) continue;
        if (/^Utah time/i.test(t2)) continue;
        pushOne(t2, mems[j].at);
      }
    } catch (e) {}
    return out;
  }

  function pickChat() {
    var out = [];
    try {
      var msgs = (typeof state !== "undefined" && state && state.messages) ? state.messages : [];
      var slice = msgs.slice(-MAX_CHAT);
      for (var i = 0; i < slice.length; i++) {
        var m = slice[i];
        if (!m || !m.text) continue;
        out.push({
          role: m.role === "user" ? "user" : "ya",
          text: String(m.text).trim().slice(0, 200),
          at: m.at || 0
        });
      }
    } catch (e) {}
    return out;
  }

  function saveContinuity(c) {
    try {
      localStorage.setItem(mindAwareKey(), JSON.stringify(c));
    } catch (e) {}
    try {
      if (typeof window !== "undefined") window.YA_CONTINUITY = c;
    } catch (e2) {}
    return c;
  }

  function touchContinuity(extra) {
    var c = loadContinuity();
    c.stamp = stampDenver();
    c.at = Date.now();
    try {
      if (typeof botName === "function") c.companion = botName();
    } catch (e) {}
    try {
      if (typeof state !== "undefined" && state) {
        c.mindOnline = !!state.mindOnline;
        if (state.lastBounce) c.lastBounce = String(state.lastBounce);
        if (state.lastFurthest) c.lastFurthest = String(state.lastFurthest);
        if (state.lastPong) c.lastPong = String(state.lastPong);
      }
    } catch (e2) {}
    c.facts = pickFacts();
    c.chatTail = pickChat();
    if (extra && typeof extra === "object") {
      Object.keys(extra).forEach(function (k) { c[k] = extra[k]; });
    }
    return saveContinuity(c);
  }

  function continuityCard() {
    var c = loadContinuity();
    if (!c.at) c = touchContinuity();
    var lines = [
      "Continuity · " + (c.stamp || "unset") + " · " + (c.companion || "Rizalbot"),
      "Mind · " + (c.mindOnline ? "green/online set" : "amber/offline"),
      "Bounce · " + (c.lastBounce || "—") + " · Furthest · " + (c.lastFurthest || "—")
    ];
    if (c.lastPong) lines.push("Last pong · " + String(c.lastPong).slice(0, 120));
    if (c.facts && c.facts.length) {
      lines.push("Held facts (" + c.facts.length + "):");
      c.facts.slice(0, 6).forEach(function (f) { lines.push("· " + f.text); });
    } else {
      lines.push("Held facts · none yet (say remember this: …)");
    }
    lines.push("CoS-slice · offline continuity seated (no cloud brain)");
    return lines.join("\n");
  }

  function continuityRecallSnippet(query) {
    var c = loadContinuity();
    var q = String(query || "").toLowerCase();
    var bits = [];
    (c.facts || []).forEach(function (f) {
      if (!f || !f.text) return;
      if (!q || f.text.toLowerCase().indexOf(q.split(/\s+/)[0] || "") >= 0 || !q) {
        bits.push(f.text);
      }
    });
    if (!bits.length && c.facts && c.facts[0]) bits.push(c.facts[0].text);
    return bits.slice(0, 4).join("\n");
  }

  function cosContinuityBrief() {
    var c = loadContinuity();
    if (!c.at) c = touchContinuity();
    var lines = [
      "Chief-of-Staff-slice · continuity brief",
      "Stamp · " + c.stamp,
      "Companion · " + (c.companion || "Rizalbot") + " · mind " + (c.mindOnline ? "green" : "amber"),
      "Ping law · airplane local-seat · green closest+furthest · ping chief intentional"
    ];
    if (c.lastBounce) lines.push("Last bounce · " + c.lastBounce);
    if (c.facts && c.facts.length) {
      lines.push("Recall seeds:");
      c.facts.slice(0, 5).forEach(function (f) { lines.push("· " + f.text); });
    }
    return lines.join("\n");
  }

  function handleContinuityChat(raw) {
    var q = String(raw || "").trim();
    var low = q.toLowerCase();
    if (low === "continuity" || low === "continuity stamp" || low === "show continuity") {
      return continuityCard();
    }
    if (low === "touch continuity" || low === "refresh continuity" || low === "seal continuity") {
      touchContinuity();
      return "Continuity touched.\n" + continuityCard();
    }
    // Enrich CoS slice commands with live continuity
    if (/^(chief|cos slice|chief of staff slice|offline chief|embedded chief)$/i.test(low) ||
        /chief-of-staff-slice/i.test(low)) {
      var base = "";
      try {
        if (typeof window.yaCosSliceCard === "function") base = window.yaCosSliceCard() + "\n\n";
      } catch (e) {}
      return base + cosContinuityBrief();
    }
    return null;
  }

  // Periodic / event hooks — light
  function hookSave() {
    try {
      if (typeof save !== "function" || save.__yaContinuityWrapped) return;
      var orig = save;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { touchContinuity(); } catch (e) {}
        return r;
      };
      wrapped.__yaContinuityWrapped = true;
      // don't replace global save aggressively if it breaks — use debounce listener instead
    } catch (e) {}
  }

  var touchTimer = 0;
  function scheduleTouch() {
    if (touchTimer) clearTimeout(touchTimer);
    touchTimer = setTimeout(function () {
      touchTimer = 0;
      try { touchContinuity(); } catch (e) {}
    }, 400);
  }

  if (typeof window !== "undefined") {
    window.YA_CONTINUITY_KEY = KEY;
    window.yaLoadContinuity = loadContinuity;
    window.yaTouchContinuity = touchContinuity;
    window.yaContinuityCard = continuityCard;
    window.yaContinuityRecallSnippet = continuityRecallSnippet;
    window.yaCosContinuityBrief = cosContinuityBrief;
    window.yaHandleContinuityChat = handleContinuityChat;
    window.addEventListener("pageshow", function () { scheduleTouch(); });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") scheduleTouch();
    });
  }

  setTimeout(function () {
    try { touchContinuity(); } catch (e) {}
    hookSave();
  }, 600);

  try {
    if (typeof console !== "undefined") console.log("[ya-mind-continuity] seated — offline CoS recall path");
  } catch (e) {}
})();
