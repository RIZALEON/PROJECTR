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
    var m = q.match(/^(?:write code|manifest|code this|evolve code|patch www|xcode|darwin|darwin code|ios manifest|pbxproj)(?:\s*[:=]\s*|\s+)(.+)$/i);
    if (m) return scrub(m[1]);
    if (/^(write code|manifest|code this|evolve code|patch www|xcode|darwin|darwin code|ios manifest|pbxproj)$/i.test(q)) return "";
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
    } else if (/xcode|darwin|pbxproj|nativeheart|llama|embed|metal|swift/.test(g)) {
      files = [
        "ios/YaAim/NativeHeart.swift",
        "ios/YaAim/WebShell.swift",
        "ios/YaAim/NativeVault.swift",
        "ios/YaAim.xcodeproj/project.pbxproj",
        "docs/SEAT-LLAMA-XCFRAMEWORK.md",
        "hardcode/PROJECTRXCODE-OFFLINE.md",
        "ios/llama.xcframework (local Mac only — NEVER git commit binary)"
      ];
    } else if (/body|parts/.test(g)) {
      files = ["ya-body-parts.js", "web/ya-body-parts.js", "ios/YaAim/www/ya-body-parts.js", "index.html (?v= bump)"];
    } else if (/shelf|pack|decider/.test(g)) {
      files = ["ya-shelf-pack.js", "senses/shelf-decider-cos.jsonl", "web/ + ios www mirrors"];
    }
    return files;
  }

  function snippetFor(goal) {
    var g = String(goal || "helper");
    var id = slug(g);
    var gl = g.toLowerCase();
    if (/ping/.test(gl)) {
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
    if (/xcode|darwin|pbxproj|nativeheart|llama|embed|metal/.test(gl)) {
      return [
        "// PROJECTRXCODE offline checklist (no cloud)",
        "// 1) Mac: open ios/YaAim.xcodeproj · Team 88HACKXHZL · bundle io.github.rizaleon.yaaim.cam",
        "// 2) Embed & Sign ios/llama.xcframework (Metal) — DO NOT git-add the binary",
        "// 3) NativeHeart.swift: #if canImport(llama) load Documents/heart.gguf",
        "// 4) USB device Run · force-quit · status/heart → tokensOn + metal",
        "// 5) Mirror www changes to web/ + ios/YaAim/www/ · bump ?v=",
        "window.yaManifest_xcode_darwin = { goal: " + JSON.stringify(g.slice(0, 120)) + ", seated: \"docs-only\" };"
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
    } else if (/xcode|darwin|pbxproj|nativeheart|llama|embed|metal/.test(g)) {
      lines.unshift("xcode: " + (goal || "Embed&Sign") + " → Darwin manifest");
      lines.push("Heart / status/heart → NativeHeart (not APK eat)");
      lines.push("Do NOT commit ios/llama.xcframework binary");
      lines.push("USB tokensOn smoke after Embed&Sign");
    } else {
      lines.unshift("write code: " + (goal || "…") + " → manifest only");
    }
    lines.push("evolve: when …, you …");
    lines.push("tokensOn = seated-on-device when frameworkLinked+heart (NativeHeart); USB smoke confirms");
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
      "Write-code · offline manifest hand (+ Xcode/Darwin)",
      "Say: write code: <goal>",
      "Also: manifest · code this · evolve code · patch www · xcode · darwin",
      "Example: write code: offline ping helper",
      "Example: xcode: Embed&Sign NativeHeart Metal",
      "Produces files-to-touch + snippet + smoke. No cloud. PROJECTRXCODE patterns are docs/hardcode knowledge."
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

  try { console.log("[ya-write-code] seated — offline write-code / manifest + Xcode/Darwin"); } catch (e) {}
})();
