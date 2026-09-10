/*! ya-cos-mode.js — Offline multi-turn Chief-of-Staff mode
 * Load AFTER hardcode + continuity; hook from answer() after hardcode (before compass).
 * NonNuclear · Decider CoS · inventory-aware · Function 0 gain-first · no cloud brain.
 *
 * Enter: chief | cos | cos mode | chief mode | offline chief | as chief | advise | decide with me
 * Exit:  done | exit chief | normal mode
 */
(function () {
  "use strict";

  var LS_KEY = "ya-cos-mode";

  function scrub(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(s)) return "";
    } catch (e) {}
    return s.slice(0, 900);
  }

  function isOn() {
    try {
      if (typeof state === "object" && state && state.cosMode) return true;
    } catch (e) {}
    try {
      return localStorage.getItem(LS_KEY) === "1";
    } catch (e2) {}
    return false;
  }

  function setOn(on) {
    on = !!on;
    try {
      if (typeof state === "object" && state) {
        state.cosMode = on;
        if (typeof save === "function") save();
      }
    } catch (e) {}
    try {
      localStorage.setItem(LS_KEY, on ? "1" : "0");
    } catch (e2) {}
    try {
      if (typeof window !== "undefined") window.YA_COS_MODE = on;
    } catch (e3) {}
  }

  function low(raw) {
    return String(raw || "").trim().toLowerCase();
  }

  function isEnter(q) {
    q = String(q || "").trim();
    var l = q.toLowerCase();
    if (/^(chief|cos|cos mode|chief mode|offline chief|embedded chief|as chief)$/i.test(l)) return true;
    if (/^(advise|decide with me)$/i.test(l)) return true;
    if (/\bas chief\b/i.test(l) && l.length < 80) return true;
    if (/^(chief of staff|go chief|enter chief)$/i.test(l)) return true;
    return false;
  }

  function isExit(q) {
    var l = String(q || "").trim().toLowerCase();
    return /^(done|exit chief|exit cos|leave chief|normal mode|cos off|chief off)$/i.test(l);
  }

  function passThrough(q) {
    var l = String(q || "").trim().toLowerCase();
    if (/^(ping|compass|status|mind status|ping status|pong)\b/i.test(l)) return true;
    if (/^(browse|open)\s+https?:\/\//i.test(l)) return true;
    if (/^(spine|machine brain|v0\.0|v0|continuity|touch continuity|commands)$/i.test(l)) return true;
    if (/^(write code|manifest|code this|evolve code|patch www)\b/i.test(l)) return true;
    return false;
  }

  function continuityBrief() {
    try {
      if (typeof window.yaCosContinuityBrief === "function") return window.yaCosContinuityBrief();
    } catch (e) {}
    try {
      if (typeof window.yaContinuityBrief === "function") return window.yaContinuityBrief();
    } catch (e2) {}
    try {
      if (typeof window.yaContinuityCard === "function") return window.yaContinuityCard();
    } catch (e3) {}
    return "Continuity · unset — say touch continuity";
  }

  function sliceCard() {
    try {
      if (typeof window.yaCosSliceCard === "function") return window.yaCosSliceCard();
    } catch (e) {}
    return "Chief-of-Staff-slice · offline · Decider seat · NonNuclear";
  }

  function gutRecall(topic) {
    var bits = [];
    try {
      if (typeof window.yaContinuityRecallSnippet === "function") {
        var sn = scrub(window.yaContinuityRecallSnippet(topic));
        if (sn) bits.push(sn);
      }
    } catch (e) {}
    try {
      if (typeof recall === "function") {
        var hits = recall(topic) || [];
        for (var i = 0; i < Math.min(hits.length, 4); i++) {
          var h = hits[i];
          var line = scrub((h && (h.text || h)) || "");
          if (line && bits.join(" ").indexOf(line.slice(0, 40)) < 0) bits.push(line.slice(0, 180));
        }
      }
    } catch (e2) {}
    try {
      if ((!bits.length) && typeof state === "object" && state && Array.isArray(state.memories)) {
        var t = String(topic || "").toLowerCase();
        var first = t.split(/\s+/).filter(Boolean)[0] || "";
        state.memories.forEach(function (m) {
          if (bits.length >= 4) return;
          var tx = String(m && m.text || "");
          if (first.length >= 4 && tx.toLowerCase().indexOf(first) >= 0) bits.push(scrub(tx).slice(0, 180));
        });
      }
    } catch (e3) {}
    return bits;
  }

  function inventoryLine() {
    var parts = [];
    try {
      if (typeof window.YA_SPINE === "object" && window.YA_SPINE) {
        parts.push("Spoken V" + (window.YA_SPINE.version || "0.0") + " seated");
      }
    } catch (e) {}
    try {
      if (typeof state === "object" && state) {
        var memN = Array.isArray(state.memories) ? state.memories.length : 0;
        var evN = Array.isArray(state.evolved) ? state.evolved.length : 0;
        var fnN = Array.isArray(state.functions) ? state.functions.length : 0;
        parts.push("gut " + memN + " · evolved " + evN + " · functions " + fnN);
        parts.push(state.mindOnline ? "mind green" : "mind amber/offline");
      }
    } catch (e2) {}
    parts.push("llama heart still MISSING until Embed&Sign");
    return parts.join(" · ");
  }

  function entryBrief() {
    setOn(true);
    try {
      if (typeof window.yaTouchContinuity === "function") window.yaTouchContinuity();
    } catch (e) {}
    var lines = [
      "Chief-of-Staff mode · ON (offline)",
      "Persona: Decider's CoS — concise, inventory-aware, Function 0 gain-first, NonNuclear, offline-first.",
      "Inventory: " + inventoryLine(),
      "",
      sliceCard(),
      "",
      continuityBrief(),
      "",
      "Follow-ups stay in CoS voice. Exit: done · exit chief · normal mode.",
      "No cloud brain · agents come to the phone."
    ];
    return lines.join("\n");
  }

  function exitBrief() {
    setOn(false);
    return "Chief-of-Staff mode · OFF\nNormal mode. Spine / ASTA / ping still on-device. Say chief or cos mode to return.";
  }

  function cosReply(userText) {
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(userText)) {
        return "No. NonNuclear. I will not help with nuclear weapons. CoS mode stays on — ask something else, or say done.";
      }
    } catch (e) {}

    var topic = scrub(userText);
    var bits = gutRecall(topic);
    var gut = "";
    try {
      if (typeof localEngine === "function") {
        gut = String(localEngine(topic) || "");
        if (/^SEARCH_NOW$|^I do not know that\b|^Compass race/i.test(gut)) gut = "";
        gut = scrub(gut).slice(0, 360);
      }
    } catch (e2) {}

    var lines = [];
    lines.push("CoS · offline · Decider seat");
    lines.push("Inventory: " + inventoryLine());
    if (bits.length) {
      lines.push("Gut recall:");
      bits.slice(0, 4).forEach(function (b) {
        String(b).split("\n").forEach(function (row) {
          if (row) lines.push("· " + row.slice(0, 180));
        });
      });
    } else {
      lines.push("Gut recall · quiet — remember this: … to seat a fact.");
    }
    lines.push("");
    if (gut) {
      lines.push(gut);
    } else {
      lines.push("Hold: " + (topic.slice(0, 200) || "the ask"));
      lines.push("Gain-first next: one smaller offline step, or evolve: when <trigger>, you <action>.");
      lines.push("If green later: search online for " + (topic.slice(0, 60) || "the topic") + " — not required.");
    }
    lines.push("");
    lines.push("NonNuclear · offline-first · say done to exit chief.");
    try {
      if (typeof remember === "function") remember("CoS turn: " + topic.slice(0, 140));
    } catch (e3) {}
    return lines.join("\n");
  }

  function handleCosModeChat(raw) {
    var q = String(raw || "").trim();
    if (!q) return null;
    var l = low(q);

    if (isEnter(q)) return entryBrief();

    if (!isOn()) return null;

    if (isExit(q)) return exitBrief();

    if (passThrough(q)) return null;

    return cosReply(q);
  }

  if (typeof window !== "undefined") {
    window.yaHandleCosModeChat = handleCosModeChat;
    window.yaCosModeOn = isOn;
    window.yaSetCosMode = setOn;
    try {
      window.YA_COS_MODE = isOn();
    } catch (e) {}
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-cos-mode] seated — offline CoS multi-turn");
  } catch (e) {}
})();
