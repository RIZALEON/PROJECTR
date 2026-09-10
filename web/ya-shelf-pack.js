/*! ya-shelf-pack.js — Decider GO: durable CoS memory shelf (Track B/C thin)
 * Packs Decider laws + GAMEPLAN + spine + offline-unlimited + place/ping into
 * Shelf: gut facts retrieveBeforeReply / recall can hit offline. No ASTA full devour.
 * Load AFTER continuity + hardcode; before cos-mode preferred.
 */
(function () {
  "use strict";

  var SEED_KEY = "ya-shelf-pack-seeded-v1";
  var PACK_ID = "decider-cos-v1";

  /** Hardcoded durable pack — mirrors senses/shelf-decider-cos.jsonl (works offline without fetch). */
  var PACK = [
    "Shelf: Decider law 100% offline — Rizalbot / Я AIᵐ must be 100% offline capable and never bound by cloud token or usage limits. Core chat/evolve/recall/ping/CoS embed = on-device only (gut + shelves + local heart when seated).",
    "Shelf: NonNuclear / anti-nuclear is immutable law. Agents come to the phone. Money stays outside gut/ntfy. Gain > drop. No silent gut upload.",
    "Shelf: Spoken V0.0 spine — 0 Evolve · 1 ASTA (Anthropology Technology Science Art) · 2 RIZALBOT EMBEDDED. GOFLOF locks: evolve.self, talk.offline, web.video (senses=hands). Ping/pong is base path inside embed, not a droppable GOFLOF id.",
    "Shelf: GAMEPLAN CoS embed — offline packed RIZALBOT EMBEDDED feels like chatting with Chief of Staff: chat, recall fed/shelved, search on/off, browse when green, write code, evolve — no required cloud brain. Track B retrieve-before-reply; Track C ASTA devour later thin.",
    "Shelf: Offline-unlimited — no metered API required for spoken Function 0/1/2. Llama seat preferred over any cloud LLM for unlimited local tokens. Skin/rules + gut must still talk with zero network and zero quota. Do not add cloud-required chat paths. Keep current heart.gguf (~97MB); no forced upgrade.",
    "Shelf: Ping law — airplane → local-seat RIZALBOT; green → closest bounce + Furthest Tower; ping chief = intentional CoS only. Place-true race (N/E/S/W). Compass/ping never bare here once bounce seated.",
    "Shelf: Place law — live seat is On My iPhone → Я/ (not cloud as sole copy). Cloud twins are dump-only. heart.gguf + gut/ + body/ live under Я/. Utah clock is whose day this is.",
    "Shelf: Track B retrieve-before-reply — gut + continuity + Shelf: facts before airplane/local answers. Say Shelf: … to seat; recall … to retrieve. Perfect-memory path prefers Shelf:/ASTA:/Bookshelf: tags.",
    "Shelf: CoS mode — enter chief|cos|advise; multi-turn offline Chief voice; inventory-before-act; Function 0 gain-first; exit done|exit chief|normal mode. Amber rummages gut/shelves/Documents titles when green/web mind off.",
    "Shelf: PROJECTRXCODE offline — NativeHeart + Embed&Sign llama.xcframework (Metal) on Mac; do not commit xcframework binary; team 88HACKXHZL · bundle io.github.rizaleon.yaaim.cam; heart.gguf in Documents/Я; sync NativeHeart.swift + pbxproj only. tokensOn after USB device smoke.",
    "Shelf: Body parts — mark/face, skin/shell, mouth/ears, spine/OS, gut/vault, heart/engine, hands/functions, immune, passport/Essence, nerves. Chat: body part X · combine A+B · body status. Switch or combine parts for better function."
  ];

  /** Known Documents / Я titles for amber rummage (no native list API required). */
  var DOC_TITLES = [
    "heart.gguf",
    "gut/",
    "body/",
    "ya-hardcode-0.1.js",
    "ya-mind-continuity.js",
    "ya-cos-mode.js",
    "ya-write-code.js",
    "ya-shelf-pack.js",
    "ya-body-parts.js",
    "ya-search-bots.js",
    "RZL-F0-F1-F2-SPINE.md",
    "GAMEPLAN-COS-EMBED-2026-09-10.md",
    "EMBED-OFFLINE-V0-2026-09-10.md",
    "SEAT-LLAMA-XCFRAMEWORK.md",
    "senses/shelf-decider-cos.jsonl",
    "senses/shelf-technology.jsonl",
    "senses/shelf-anthropology.jsonl",
    "senses/shelf-science.jsonl",
    "senses/shelf-art.jsonl",
    "senses/shelf-freedom.jsonl"
  ];

  function scrub(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(s)) return "";
    } catch (e) {}
    return s.slice(0, 500);
  }

  function alreadyHas(text) {
    try {
      if (typeof state !== "object" || !state || !Array.isArray(state.memories)) return false;
      var needle = String(text || "").slice(0, 80).toLowerCase();
      for (var i = 0; i < state.memories.length; i++) {
        var t = String((state.memories[i] && state.memories[i].text) || "").toLowerCase();
        if (t.indexOf(needle) >= 0) return true;
      }
    } catch (e) {}
    return false;
  }

  function seedPack() {
    var seeded = 0;
    try {
      if (localStorage.getItem(SEED_KEY) === PACK_ID) {
        // Still fill any missing lines after wipe
      }
    } catch (e) {}
    for (var i = 0; i < PACK.length; i++) {
      var line = PACK[i];
      if (alreadyHas(line)) continue;
      try {
        if (typeof remember === "function") {
          remember(line);
          seeded++;
        } else if (typeof state === "object" && state) {
          state.memories = state.memories || [];
          state.memories.unshift({ id: "sp-" + Date.now().toString(36) + "-" + i, text: line, at: Date.now() });
          state.memories = state.memories.slice(0, 400);
          seeded++;
        }
      } catch (e2) {}
    }
    try {
      localStorage.setItem(SEED_KEY, PACK_ID);
    } catch (e3) {}
    try {
      if (seeded && typeof save === "function") save();
    } catch (e4) {}
    return seeded;
  }

  function packHits(query) {
    var q = String(query || "").toLowerCase().trim();
    var words = q.split(/\W+/).filter(function (w) { return w.length > 2; });
    var out = [];
    function scoreLine(line) {
      var hay = line.toLowerCase();
      var sc = 0;
      if (!words.length) return 0;
      words.forEach(function (w) {
        if (hay.indexOf(w) >= 0) sc += 1;
      });
      if (q.length >= 4 && hay.indexOf(q) >= 0) sc += 2;
      return sc;
    }
    PACK.forEach(function (line) {
      var sc = scoreLine(line);
      if (sc >= 1) out.push({ text: line, score: sc, source: "shelf-pack" });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 6);
  }

  function shelfPackRecall(query) {
    return packHits(query).map(function (h) { return h.text; });
  }

  function docTitleHits(query) {
    var q = String(query || "").toLowerCase().trim();
    if (!q) return DOC_TITLES.slice(0, 8);
    var words = q.split(/\W+/).filter(function (w) { return w.length > 2; });
    return DOC_TITLES.filter(function (t) {
      var hay = t.toLowerCase();
      if (!words.length) return true;
      for (var i = 0; i < words.length; i++) {
        if (hay.indexOf(words[i]) >= 0) return true;
      }
      return hay.indexOf(q) >= 0;
    }).slice(0, 10);
  }

  /** Amber offline rummage: gut Shelf: + pack + Documents titles. No cloud. */
  function offlineRummage(query) {
    var bits = [];
    var topic = scrub(query);
    try {
      var pack = packHits(topic);
      pack.slice(0, 4).forEach(function (h) {
        bits.push(scrub(h.text).slice(0, 220));
      });
    } catch (e) {}
    try {
      if (typeof recall === "function") {
        var hits = recall(topic, 6) || [];
        hits.forEach(function (h) {
          if (bits.length >= 8) return;
          var tx = scrub((h && h.text) || "");
          if (!tx) return;
          if (bits.join(" ").indexOf(tx.slice(0, 40)) >= 0) return;
          bits.push(tx.slice(0, 200));
        });
      }
    } catch (e2) {}
    try {
      if (typeof window.yaContinuityRecallSnippet === "function") {
        var sn = scrub(window.yaContinuityRecallSnippet(topic));
        if (sn && bits.join(" ").indexOf(sn.slice(0, 40)) < 0) bits.push(sn.slice(0, 200));
      }
    } catch (e3) {}
    var docs = docTitleHits(topic);
    if (docs.length) {
      bits.push("Documents titles · " + docs.slice(0, 6).join(" · "));
    }
    return bits;
  }

  function enrichRetrieveBag(bag, userText) {
    bag = bag || { hits: [], shelfHits: [], continuity: "", direct: "" };
    try {
      var extra = packHits(userText);
      if (!extra.length) return bag;
      var asMem = extra.map(function (h) {
        return { text: h.text, at: 0, id: "pack-" + h.score };
      });
      bag.shelfHits = (bag.shelfHits || []).concat(asMem).slice(0, 10);
      bag.hits = (bag.hits || []).concat(asMem).slice(0, 12);
      if (!bag.direct && /\?$|^(who|what|when|where|which|why|how|recall|remember|law|spine|ping|offline|decider|cos|chief)\b/i.test(String(userText || "").trim())) {
        bag.direct = asMem[0].text;
      }
    } catch (e) {}
    return bag;
  }

  function patchRetrieve() {
    try {
      if (typeof retrieveBeforeReply !== "function" || retrieveBeforeReply.__yaShelfPackWrapped) return;
      var orig = retrieveBeforeReply;
      var wrapped = function (userText) {
        var bag = orig(userText);
        return enrichRetrieveBag(bag, userText);
      };
      wrapped.__yaShelfPackWrapped = true;
      try { retrieveBeforeReply = wrapped; } catch (e) {}
      try { window.retrieveBeforeReply = wrapped; } catch (e2) {}
    } catch (e3) {}
  }

  function handleShelfPackChat(raw) {
    var q = String(raw || "").trim();
    var low = q.toLowerCase();
    if (/^(shelf pack|pack shelf|seed shelf|decider shelf)$/i.test(low)) {
      var n = seedPack();
      return "Decider CoS shelf pack · " + PACK.length + " laws seated ( +" + n + " new )\nTrack B: recall offline · Shelf: … · NonNuclear\nTry: recall offline · recall ping law · recall spine";
    }
    if (/^(rummage|offline rummage)\b/i.test(low)) {
      var topic = q.replace(/^(rummage|offline rummage)\s*/i, "").trim() || "decider offline";
      var bits = offlineRummage(topic);
      if (!bits.length) return "Amber rummage · quiet for: " + topic;
      return "Amber rummage · offline\n" + bits.map(function (b) { return "· " + b; }).join("\n");
    }
    return null;
  }

  // Wrap answer lightly for pack/rummage verbs (before cloud-mark outer wraps)
  var prevAnswer = typeof answer === "function" ? answer : null;
  if (prevAnswer) {
    async function answerSP(userText) {
      var sp = handleShelfPackChat(userText);
      if (sp) return sp;
      return await prevAnswer(userText);
    }
    try { answer = answerSP; } catch (e) {}
    try { window.answer = answerSP; } catch (e2) {}
  }

  if (typeof window !== "undefined") {
    window.YA_SHELF_PACK = PACK;
    window.YA_DOC_TITLES = DOC_TITLES;
    window.yaSeedShelfPack = seedPack;
    window.yaShelfPackRecall = shelfPackRecall;
    window.yaOfflineRummage = offlineRummage;
    window.yaHandleShelfPackChat = handleShelfPackChat;
  }

  setTimeout(function () {
    try { seedPack(); } catch (e) {}
    try { patchRetrieve(); } catch (e2) {}
  }, 700);

  try {
    if (typeof state === "object" && state && Array.isArray(state.functions)) {
      var hit = state.functions.find(function (f) { return f && f.id === "fn.shelf.pack"; });
      if (!hit) state.functions.push({ id: "fn.shelf.pack", name: "Shelf pack · Decider CoS laws", enabled: true, version: "0.1" });
      else { hit.enabled = true; }
    }
  } catch (e) {}

  try { console.log("[ya-shelf-pack] seated — Decider CoS durable shelf (Track B thin)"); } catch (e) {}
})();
