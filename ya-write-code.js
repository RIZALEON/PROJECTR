/*! ya-write-code.js — Thin offline write-code / evolve manifest
 * Load AFTER ya-think-evolve.js. No cloud. Manifest only — files/snippet/smoke.
 * Triggers: write code | manifest | code this | evolve code | patch www
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
    return s.slice(0, 600);
  }

  function parseWrite(userText) {
    var q = String(userText || "").trim();
    var m = q.match(/^(?:write code|manifest|code this|evolve code|patch www)(?:\s*[:=]\s*|\s+)(.+)$/i);
    if (m) return scrub(m[1]);
    if (/^(write code|manifest|code this|evolve code|patch www)$/i.test(q)) return "";
    return null;
  }

  function slug(goal) {
    var s = String(goal || "helper").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    return s || "helper";
  }

  function suggestFiles(goal) {
    var g = String(goal || "").toLowerCase();
    var base = slug(goal);
    var files = [
      "web/ya-" + base + ".js",
      "ios/YaAim/www/ya-" + base + ".js",
      "ya-" + base + ".js",
      "index.html",
      "web/index.html",
      "ios/YaAim/www/index.html"
    ];
    if (/ping/.test(g)) {
      files = [
        "web/ya-ping-helper.js",
        "ios/YaAim/www/ya-ping-helper.js",
        "ya-ping-helper.js",
        "ya-ping-bounce.js (extend)",
        "index.html (?v= bump)"
      ];
    } else if (/cos|chief/.test(g)) {
      files = ["web/ya-cos-mode.js", "ios/YaAim/www/ya-cos-mode.js", "ya-cos-mode.js", "app.js answer() hook"];
    } else if (/compass|race/.test(g)) {
      files = ["ya-compass-race.js", "web/ya-compass-race.js", "ios/YaAim/www/ya-compass-race.js"];
    }
    return files;
  }

  function snippetFor(goal) {
    var g = String(goal || "helper");
    var id = slug(g);
    if (/ping/.test(g.toLowerCase())) {
      return [
        "(function(){",
        "  function handle(raw){",
        "    var q=String(raw||\"\").trim();",
        "    if(!/^offline ping helper$/i.test(q)) return null;",
        "    return \"Ping helper · offline local-seat ready\";",
        "  }",
        "  window.yaHandlePingHelperChat=handle;",
        "})();"
      ].join("\n");
    }
    return [
      "(function(){",
      "  /* offline manifest stub for: " + g.slice(0, 80) + " */",
      "  window.yaManifest_" + id.replace(/-/g, "_") + " = { goal: " + JSON.stringify(g.slice(0, 120)) + ", seated: false };",
      "})();"
    ].join("\n");
  }

  function smokeFor(goal) {
    var g = String(goal || "").toLowerCase();
    var lines = [
      "spine",
      "chief / cos mode → brief; follow-up stays CoS",
      "airplane chat still works"
    ];
    if (/ping/.test(g)) {
      lines.unshift("write code: offline ping helper → this manifest");
      lines.push("ping → local-seat on airplane");
    } else {
      lines.unshift("write code: " + (goal || "…") + " → manifest only");
    }
    lines.push("evolve: when …, you …");
    lines.push("tokensOn still Mac Embed&Sign (llama MISSING until seated)");
    return lines;
  }

  function seatManifest(goal, manifestText) {
    var g = scrub(goal) || "write-code helper";
    var trigger = "run write " + slug(g);
    var action = "Show stored write-code manifest for: " + g.slice(0, 120);
    try {
      if (typeof remember === "function") {
        remember("Write-code manifest: " + g.slice(0, 160));
        remember(manifestText.slice(0, 400));
      }
    } catch (e) {}
    try {
      if (typeof registerEvolved === "function") {
        var skill = registerEvolved("write-" + slug(g), trigger, action);
        if (skill !== "blocked") {
          try { if (typeof save === "function") save(); } catch (e2) {}
        }
      } else if (typeof state === "object" && state) {
        state.evolved = state.evolved || [];
        state.evolved.unshift({
          id: "ev-wc-" + Date.now().toString(36),
          name: "write-" + slug(g),
          trigger: trigger,
          action: action,
          evolvedAt: Date.now()
        });
        state.evolved = state.evolved.slice(0, 80);
      }
    } catch (e3) {}
    try {
      if (typeof state === "object" && state && Array.isArray(state.functions)) {
        var id = "fn.write." + slug(g).replace(/-/g, ".").slice(0, 36);
        var hit = state.functions.find(function (f) { return f && f.id === id; });
        if (hit) {
          hit.enabled = true;
          hit.detail = action;
          hit.version = String(Number(hit.version || 0) + 0.1);
        } else {
          state.functions.push({
            id: id,
            name: "Write-code · " + g.slice(0, 40),
            enabled: true,
            version: "0.1",
            detail: action
          });
        }
        if (typeof save === "function") save();
      }
    } catch (e4) {}
  }

  function buildManifest(goal) {
    var g = scrub(goal) || "offline helper";
    var files = suggestFiles(g);
    var snip = snippetFor(g);
    var smoke = smokeFor(g);
    var lines = [
      "Write-code · offline manifest (no cloud)",
      "Goal: " + g,
      "Utah: " + stamp(),
      "",
      "Files to touch:",
      files.map(function (f) { return "· " + f; }).join("\n"),
      "",
      "Snippet:",
      snip,
      "",
      "Smoke:",
      smoke.map(function (s) { return "· " + s; }).join("\n"),
      "",
      "Seated via remember + state.evolved/functions.",
      "Integrate: evolve: when " + triggerHint(g) + ", you apply this manifest offline.",
      "Law: NonNuclear · Function 0 gain · agents come to the phone."
    ];
    return lines.join("\n");
  }

  function triggerHint(goal) {
    return "need " + slug(goal).replace(/-/g, " ");
  }

  function helpCard() {
    return [
      "Write-code · offline manifest hand",
      "Say: write code: <goal>",
      "Also: manifest · code this · evolve code · patch www",
      "Example: write code: offline ping helper",
      "Produces files-to-touch + snippet + smoke. No cloud. Seat with evolve pathways when ready."
    ].join("\n");
  }

  function handleWriteCodeChat(raw) {
    var goal = parseWrite(raw);
    if (goal === null) return null;
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(raw)) {
        return "No. NonNuclear blocked that write-code ask.";
      }
    } catch (e) {}
    if (!goal) return helpCard();
    var text = buildManifest(goal);
    seatManifest(goal, text);
    return text;
  }

  // Wrap answer so write-code runs before think-evolve body still via chain;
  // load AFTER think-evolve → we are outer relative to TE, inner to cloud-mark.
  var prevAnswer = typeof answer === "function" ? answer : null;
  if (prevAnswer) {
    async function answerWC(userText) {
      var wc = handleWriteCodeChat(userText);
      if (wc) return wc;
      return await prevAnswer(userText);
    }
    try { answer = answerWC; } catch (e) {}
    try { window.answer = answerWC; } catch (e2) {}
  }

  if (typeof window !== "undefined") {
    window.yaHandleWriteCodeChat = handleWriteCodeChat;
    window.yaBuildWriteManifest = buildManifest;
  }

  try {
    if (typeof state === "object" && state && Array.isArray(state.functions)) {
      var hit = state.functions.find(function (f) { return f && f.id === "fn.write.code"; });
      if (!hit) state.functions.push({ id: "fn.write.code", name: "Write-code · offline manifest", enabled: true, version: "0.1" });
      else { hit.enabled = true; hit.name = "Write-code · offline manifest"; }
      try { if (typeof save === "function") save(); } catch (e) {}
    }
  } catch (e2) {}

  try { console.log("[ya-write-code] seated — offline write-code / manifest"); } catch (e) {}
})();
