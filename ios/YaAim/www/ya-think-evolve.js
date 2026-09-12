/*! ya-think-evolve.js — Think (meditate longer) + Evolve (new pathways/functions)
 * Load AFTER app.js / hardcode. NonNuclear. Offline-first. Agents come to the phone.
 *
 * think <topic> | meditate <topic> | think on <topic>
 * evolve <goal> | evolve: when X, you Y | add function NAME: does Z
 */
(function () {
  "use strict";

  function stamp() {
    try { if (typeof utahNow === "function") return utahNow(); } catch (e) {}
    try {
      return new Date().toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "numeric", minute: "2-digit", timeZone: "America/Denver", timeZoneName: "short"
      });
    } catch (e2) { return new Date().toISOString(); }
  }

  function scrub(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(s)) return "";
    } catch (e) {}
    return s.slice(0, 800);
  }

  function recallBits(topic) {
    var bits = [];
    try {
      if (typeof recall === "function") {
        var hits = recall(topic) || [];
        for (var i = 0; i < Math.min(hits.length, 5); i++) {
          var h = hits[i];
          var line = scrub((h && (h.text || h)) || "");
          if (line) bits.push(line.slice(0, 180));
        }
      }
    } catch (e) {}
    try {
      if ((!bits.length) && state && Array.isArray(state.memories)) {
        var t = String(topic || "").toLowerCase();
        state.memories.forEach(function (m) {
          if (bits.length >= 5) return;
          var tx = String(m && m.text || "");
          if (t && tx.toLowerCase().indexOf(t.slice(0, 24)) >= 0) bits.push(scrub(tx).slice(0, 180));
        });
      }
    } catch (e2) {}
    return bits;
  }

  function parseThink(userText) {
    var q = String(userText || "").trim();
    var m = q.match(/^(think|meditate)(?:\s+on|\s+about|\s+through)?\s+(.+)$/i);
    if (m) return scrub(m[2]);
    if (/^(think|meditate)$/i.test(q)) return "";
    return null;
  }

  function parseEvolve(userText) {
    var q = String(userText || "").trim();
    // evolve: when X, you Y
    var when = q.match(/^evolve\s*:?\s*when\s+(.+?)[,;]?\s+you\s+(.+)$/i);
    if (when) return { kind: "when", trigger: scrub(when[1]), action: scrub(when[2]) };
    // add function NAME: does Z
    var add = q.match(/^(?:evolve\s+)?add\s+function\s+([^:]+):\s*(.+)$/i);
    if (add) return { kind: "fn", name: scrub(add[1]), action: scrub(add[2]) };
    // evolve <goal>
    var m = q.match(/^evolve(?:\s+on|\s+for|\s+to)?\s+(.+)$/i);
    if (m) return { kind: "goal", goal: scrub(m[1]) };
    if (/^evolve$/i.test(q)) return { kind: "goal", goal: "" };
    return null;
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function doThink(topic) {
    try { if (typeof showThink === "function") showThink(); } catch (e) {}
    // meditate longer than normal hologram min
    await sleep(2800);
    var topicLine = topic || "what is in front of us right now";
    var bits = recallBits(topicLine);
    var local = "";
    try {
      if (typeof localEngine === "function") {
        // avoid recurse: ask bare topic without think prefix
        local = String(localEngine(topicLine) || "");
        if (/^SEARCH_NOW$|^I do not know that\b|^Compass race/i.test(local)) local = "";
      }
    } catch (e2) {}

    var lines = [];
    lines.push("Think · meditation");
    lines.push("Topic: " + topicLine);
    lines.push("Utah: " + stamp());
    lines.push("");
    lines.push("1) Hold — what this is");
    lines.push(local ? ("Gut says: " + local.slice(0, 320)) : "Gut is quiet — stay with the question without forcing an answer.");
    lines.push("");
    lines.push("2) Gut recall");
    if (bits.length) bits.forEach(function (b, i) { lines.push("- (" + (i + 1) + ") " + b); });
    else lines.push("- (no close memories yet — remember this: … after you decide)");
    lines.push("");
    lines.push("3) Other ways to move");
    lines.push("- Change the frame: cure vs patch vs wait vs ask one sharper question.");
    lines.push("- Change the tool: local gut · search online for <topic> · compass ping · sign note.");
    lines.push("- Change the body: smaller step in 10 minutes · one function to evolve · one fact to remember.");
    lines.push("");
    lines.push("4) Next breath");
    lines.push("Name one concrete next act. Or say: evolve " + topicLine.slice(0, 80));
    lines.push("");
    lines.push("NonNuclear · offline gut first · agents come to the phone.");

    try {
      if (typeof remember === "function") remember("Think meditation on: " + topicLine.slice(0, 160));
    } catch (e3) {}
    try { if (typeof hideThink === "function") hideThink(); } catch (e4) {}
    return lines.join("\n");
  }

  function seatWhen(trigger, action) {
    try {
      if (typeof nuclearBlocked === "function" && (nuclearBlocked(trigger) || nuclearBlocked(action))) {
        return "No. NonNuclear blocked that pathway.";
      }
    } catch (e) {}
    try {
      if (typeof registerEvolved === "function") {
        var skill = registerEvolved(trigger.slice(0, 40), trigger, action);
        if (skill === "blocked") return "No. NonNuclear blocked that pathway.";
        try { if (typeof save === "function") save(); } catch (e2) {}
        return "Evolved pathway seated.\nWhen: " + trigger + "\nDo: " + action + "\nFunction 0 gain · works offline.\nSay commands to see the prompt list.";
      }
    } catch (e3) {}
    // fallback: store in state.evolved manually
    try {
      if (typeof state === "object" && state) {
        state.evolved = state.evolved || [];
        var id = "ev-" + Date.now().toString(36);
        state.evolved.unshift({
          id: id,
          name: trigger.slice(0, 40),
          trigger: trigger,
          action: action,
          evolvedAt: Date.now()
        });
        state.evolved = state.evolved.slice(0, 80);
        if (typeof save === "function") save();
        return "Evolved pathway seated (local).\nWhen: " + trigger + "\nDo: " + action;
      }
    } catch (e4) {}
    return "Evolve engine not ready — try: evolve: when ping test, you here from evolve";
  }

  function seatFunction(name, action) {
    try {
      if (typeof nuclearBlocked === "function" && (nuclearBlocked(name) || nuclearBlocked(action))) {
        return "No. NonNuclear blocked that function.";
      }
    } catch (e) {}
    var id = "fn." + String(name || "custom").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "").slice(0, 40);
    try {
      if (typeof state === "object" && state && Array.isArray(state.functions)) {
        var hit = state.functions.find(function (f) { return f && f.id === id; });
        if (hit) {
          hit.name = name;
          hit.enabled = true;
          hit.version = String(Number(hit.version || 0) + 0.1);
          hit.detail = action;
        } else {
          state.functions.push({ id: id, name: name, enabled: true, version: "0.1", detail: action });
        }
        if (typeof save === "function") save();
      }
    } catch (e2) {}
    // also seat as evolved trigger on the function name
    seatWhen("run " + name, action);
    return "Function gained.\nName: " + name + "\nId: " + id + "\nDoes: " + action + "\nSay: run " + name + " · or evolve more pathways.";
  }

  async function doEvolve(spec) {
    try { if (typeof showThink === "function") showThink(); } catch (e) {}
    await sleep(1200);
    var out = "";
    if (!spec || (spec.kind === "goal" && !spec.goal)) {
      out = [
        "Evolve · Function 0 gain",
        "Become more dynamic on this device.",
        "",
        "Ways to evolve:",
        "1. evolve: when <trigger>, you <action>",
        "2. add function <name>: <what it does>",
        "3. evolve <problem> — propose a pathway then seat it",
        "4. eat / seat code or heart when the body is ready",
        "",
        "Example: evolve: when I say stand ready, you reply standing ready on-device",
        "Example: add function night watch: remind Decider to ping status",
        "Law: NonNuclear · offline premier · agents come to the phone."
      ].join("\n");
    } else if (spec.kind === "when") {
      out = seatWhen(spec.trigger, spec.action);
    } else if (spec.kind === "fn") {
      out = seatFunction(spec.name, spec.action);
    } else if (spec.kind === "goal") {
      var goal = spec.goal;
      var bits = recallBits(goal);
      var trigger = "solve " + goal.slice(0, 48);
      var action = "Hold the problem \"" + goal.slice(0, 120) + "\". Offer one smaller next step from the gut. If green, suggest search online for " + goal.slice(0, 60) + ".";
      var seated = seatWhen(trigger, action);
      out = [
        "Evolve · pathway for a problem",
        "Goal: " + goal,
        "Utah: " + stamp(),
        "",
        "Gut nearby:",
        bits.length ? bits.map(function (b) { return "- " + b; }).join("\n") : "- (empty — feed it with remember this: …)",
        "",
        "Proposed dynamic pathway:",
        "When you say: " + trigger,
        "I will: " + action,
        "",
        seated,
        "",
        "To lock a custom one: evolve: when <words>, you <reply>",
        "To add an ability: add function <name>: <does>"
      ].join("\n");
    } else {
      out = "Evolve did not parse. Try: evolve <goal> · or evolve: when X, you Y";
    }
    try { if (typeof hideThink === "function") hideThink(); } catch (e2) {}
    return out;
  }

  try { window.yaDoThink = doThink; window.yaDoEvolve = doEvolve; } catch (e) {}

  // Patch commands menu if present
  try {
    var prevMenu = window.yaCommandsMenu;
    window.yaCommandsMenu = function () {
      var base = typeof prevMenu === "function" ? prevMenu() : "";
      var extra = [
        "19. think <topic> — meditate longer (also: meditate <topic>)",
        "20. evolve <goal> — new pathway to solve / become better",
        "21. evolve: when <trigger>, you <action> — seat Function 0 gain",
        "22. add function <name>: <does> — add an ability in-app"
      ].join("\n");
      if (base && base.indexOf("think <topic>") >= 0) return base;
      if (base) {
        // insert before the trailing Light: line if present
        if (base.indexOf("\nLight:") >= 0) return base.replace("\nLight:", "\n" + extra + "\n\nLight:");
        return base + "\n" + extra;
      }
      return extra;
    };
  } catch (e) {}

  var prevAnswer = typeof answer === "function" ? answer : null;
  if (prevAnswer) {
    async function answerTE(userText) {
      var th = parseThink(userText);
      if (th !== null) return await doThink(th);
      var ev = parseEvolve(userText);
      if (ev) return await doEvolve(ev);
      return await prevAnswer(userText);
    }
    try { answer = answerTE; } catch (e) {}
    try { window.answer = answerTE; } catch (e) {}
  }

  try {
    if (typeof state === "object" && state && Array.isArray(state.functions)) {
      function ens(id, name) {
        var hit = state.functions.find(function (f) { return f && f.id === id; });
        if (!hit) state.functions.push({ id: id, name: name, enabled: true, version: "0.1" });
        else { hit.enabled = true; hit.name = name; }
      }
      ens("think.meditate", "Think · meditate longer on a problem");
      ens("evolve.self", "Evolve · new pathways / functions (Function 0 gain)");
      try { if (typeof save === "function") save(); } catch (e) {}
    }
  } catch (e) {}

  try { console.log("[ya-think-evolve] seated — think / evolve"); } catch (e) {}
})();
