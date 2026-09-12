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
    if (/^(write code|manifest|code this|evolve code|patch www|xcode|darwin|pbxproj)\b/i.test(l)) return true;
    if (/^(body status|body parts|body part|combine|shelf pack|rummage|offline rummage)\b/i.test(l)) return true;
    if (/^recall\b/i.test(l)) return true;
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

  function mindIsGreen() {
    try {
      if (typeof state === "object" && state && state.mindOnline) return true;
    } catch (e) {}
    try {
      if (typeof mindWantsWeb === "function" && mindWantsWeb()) return true;
    } catch (e2) {}
    return false;
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

  /** Amber offline rummage — gut / Decider shelves / Documents titles when green/web mind off. */
  function amberRummage(topic) {
    var bits = [];
    try {
      if (typeof window.yaOfflineRummage === "function") {
        var rum = window.yaOfflineRummage(topic) || [];
        rum.forEach(function (r) {
          var line = scrub(r);
          if (line && bits.join(" ").indexOf(line.slice(0, 36)) < 0) bits.push(line.slice(0, 200));
        });
      }
    } catch (e) {}
    try {
      if (typeof window.yaShelfPackRecall === "function") {
        var pack = window.yaShelfPackRecall(topic) || [];
        pack.slice(0, 3).forEach(function (r) {
          var line = scrub(r);
          if (line && bits.join(" ").indexOf(line.slice(0, 36)) < 0) bits.push(line.slice(0, 200));
        });
      }
    } catch (e2) {}
    if (!bits.length) bits = gutRecall(topic);
    return bits.slice(0, 6);
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
    try {
      if (typeof window.YA_BODY_PARTS === "object" && window.YA_BODY_PARTS) {
        var bp = window.YA_BODY_PARTS;
        parts.push("body " + (bp.mode || "switch") + ":" + ((bp.active || []).slice(0, 4).join("+") || "—"));
      }
    } catch (e3) {}
    try {
      if (typeof window !== "undefined" && window.YA_NATIVE) {
        var n = window.YA_NATIVE;
        var seated = n.seated === true || (Number(n.heartBytes) || 0) > 1024;
        if (n.tokensOn && n.tokensOff !== true) parts.push("heart tokensOn · seated-on-device");
        else if (n.frameworkLinked && seated) parts.push("frameworkLinked+heart · seated-on-device · tokensOff");
        else if (n.frameworkLinked) parts.push("llama linked · tokensOff until heart.gguf seated");
        else parts.push("llama framework not linked · NativeHeart status via Heart");
      } else {
        parts.push("heart path · NativeHeart status via Heart / status/heart");
      }
    } catch (e4) {
      parts.push("heart path · NativeHeart status via Heart / status/heart");
    }
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
      "Follow-ups stay in CoS voice (multi-turn). Amber: rummage gut/shelves/Documents titles.",
      "Exit: done · exit chief · normal mode. No cloud brain · agents come to the phone."
    ];
    return lines.join("\n");
  }

  function exitBrief() {
    setOn(false);
    return "Chief-of-Staff mode · OFF\nNormal mode. Spine / ASTA / ping still on-device. Say chief or cos mode to return.";
  }

  var PING_LAW_LEAD = "Airplane · local-seat / here · RIZALBOT. Green Ping · closest+furthest race.";

  function isPingLawAsk(q) {
    var l = String(q || "").toLowerCase();
    if (/ping\s*law/.test(l)) return true;
    if (/airplane/.test(l) && /ping|local-?seat|law/.test(l)) return true;
    if (/what.*ping/.test(l) && /airplane|offline|local/.test(l)) return true;
    if (/when airplane/.test(l) && /ping|law|seat/.test(l)) return true;
    return false;
  }

  function pingLawLeadLine() {
    try {
      if (typeof window.yaPingLawLead === "function") {
        var lead = String(window.yaPingLawLead() || "").trim();
        if (lead) return lead;
      }
    } catch (e) {}
    return PING_LAW_LEAD;
  }

  function cosReply(userText) {
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(userText)) {
        return "No. NonNuclear. I will not help with nuclear weapons. CoS mode stays on — ask something else, or say done.";
      }
    } catch (e) {}

    var topic = scrub(userText);
    var green = mindIsGreen();
    var pingAsk = isPingLawAsk(topic);
    var bits = green ? gutRecall(topic) : amberRummage(topic);
    var gut = "";
    try {
      if (typeof localEngine === "function") {
        gut = String(localEngine(topic) || "");
        if (/^SEARCH_NOW$|^I do not know that\b|^Compass race/i.test(gut)) gut = "";
        gut = scrub(gut).slice(0, 360);
      }
    } catch (e2) {}

    var lines = [];
    // Ping-law / airplane asks: crisp law FIRST (1–2 lines) before any shelf dump.
    if (pingAsk) {
      lines.push(pingLawLeadLine());
      lines.push("");
    }
    lines.push("CoS · " + (green ? "green-aware" : "amber offline rummage") + " · Decider seat · multi-turn");
    lines.push("Inventory: " + inventoryLine());
    if (bits.length) {
      lines.push(green ? "Gut recall:" : "Amber rummage (gut / shelves / Documents titles):");
      // Keep shelf dump short when we already led with ping law.
      bits.slice(0, pingAsk ? 2 : 5).forEach(function (b) {
        String(b).split("\n").forEach(function (row) {
          if (row) lines.push("· " + row.slice(0, 180));
        });
      });
    } else if (!pingAsk) {
      lines.push("Rummage · quiet — Shelf: … or remember this: … to seat; recall … to retrieve.");
    }
    lines.push("");
    if (gut) {
      lines.push(gut);
    } else {
      lines.push("Hold: " + (topic.slice(0, 200) || "the ask"));
      lines.push("Gain-first next: one smaller offline step, body part switch/combine, or evolve: when <trigger>, you <action>.");
      if (!green) {
        lines.push("Web mind off — staying on-device. shelf pack · rummage <topic> · write code: <goal> still work.");
      } else {
        lines.push("If needed: search online for " + (topic.slice(0, 60) || "the topic") + " — optional.");
      }
    }
    lines.push("");
    lines.push("NonNuclear · offline-first · unlimited local · say done to exit chief.");
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
    window.yaIsPingLawAsk = isPingLawAsk;
    window.yaPingLawLeadLine = pingLawLeadLine;
    try {
      window.YA_COS_MODE = isOn();
    } catch (e) {}
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-cos-mode] seated — offline CoS multi-turn + amber rummage");
  } catch (e) {}
})();
