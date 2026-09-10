/*! ya-mind-books.js — Decider: books/manuals shelf + mind index/reorg (thin)
 * Path: Я/mind/books/ · Shelf: books · Bookshelf: · rummage books
 * Seeds CoS + Rizalbot manuals/case files for offline/online expedite evolve.
 * Also refreshes YA_SEATED_EMBED_BYTES so mindBytes counts www pack.
 * Load AFTER ya-shelf-pack.js; before body-parts/find preferred.
 */
(function () {
  "use strict";

  var SEED_KEY = "ya-mind-books-seeded-v1";
  var PACK_ID = "books-cos-rizalbot-v1";
  var TAG_KEY = "ya-mind-folder-tags-v1";

  var CATS = ["laws", "books", "chat", "code", "body"];

  /** Hardcoded durable books pack — mirrors senses/shelf-books.jsonl + manuals. */
  var PACK = [
    "Bookshelf: Chief of Staff MANUAL — offline CoS voice: inventory-before-act, Function 0 gain-first, Track B retrieve, NonNuclear, 100% offline, ping law airplane→local-seat, tokensOn=seated-on-device when frameworkLinked+heart. Path: Я/mind/books/COS-MANUAL.md",
    "Bookshelf: Chief of Staff CASE — smoke scorecard: chief/cos, airplane ping local-seat, recall ping law, books/manual cos, mind index, body combine, Heart/status, write-code/xcode, find 🔍, MIND SIZE includes seated www pack. Tip race-nesw-furthest PR#12.",
    "Bookshelf: Rizalbot MANUAL — spoken F2 RIZALBOT EMBEDDED; gut+shelves+continuity; body parts switch/combine; Shelf:/recall/Bookshelf:; keep heart.gguf; no xcframework binary in tip; mindBytes = Documents+LS+seated www pack.",
    "Bookshelf: Rizalbot CASE — evolve expedite offline/online: force-quit Track B recall, manual rizalbot/cos, mind reorg folders laws/books/chat/code/body, MIND SIZE after install, combine hands+nerves, green search optional.",
    "Bookshelf: Laws binder — NonNuclear · Decider 100%-offline · ping law · place law Я/ · gain>drop · agents-to-phone · no silent gut upload · tokensOn seated-on-device.",
    "Bookshelf: PROJECTRXCODE / write-code — xcode: and darwin: offline manifests; NativeHeart Embed&Sign on Mac build path; team 88HACKXHZL · bundle io.github.rizaleon.yaaim.cam; never commit llama.xcframework binary.",
    "Bookshelf: Path — On My iPhone → Я/mind/books/ houses manuals & case files the embed references anytime offline. Chat: books · manual X · Shelf: books · rummage books.",
    "Shelf: books — CoS manual+case and Rizalbot manual+case seated for anytime offline reference (Track B / rummage)."
  ];

  /** Full manual bodies for `manual cos` / `manual rizalbot` (thin excerpts + path). */
  var MANUALS = {
    cos: {
      title: "Chief of Staff MANUAL",
      path: "Я/mind/books/COS-MANUAL.md",
      body:
        "Chief of Staff MANUAL (offline)\n" +
        "Role: inventory-before-act · Function 0 gain-first · Track B retrieve · no cloud brain required.\n" +
        "Laws: 100% offline · NonNuclear · ping law (airplane→local-seat) · place law Я/ · tokensOn=seated-on-device when frameworkLinked+heart.\n" +
        "Hands: chief|cos · recall · Shelf: · books · rummage · body part/combine · write code:|xcode: · Heart/status · 🔍 find.\n" +
        "Metal: keep heart.gguf · no xcframework binary in tip · USB smoke confirms tokensOn.\n" +
        "Case: say manual cos case · books · mind index"
    },
    "cos-case": {
      title: "Chief of Staff CASE",
      path: "Я/mind/books/COS-CASE.md",
      body:
        "CoS CASE / smoke scorecard\n" +
        "1 chief/cos → CoS ON\n" +
        "2 airplane ping → local-seat RIZALBOT\n" +
        "3 recall ping law → lead first\n" +
        "4 books / manual cos → shelf hits\n" +
        "5 mind index → laws/books/chat/code/body\n" +
        "6 body status · combine gut+heart\n" +
        "7 Heart / status/heart → honest tokensOn/Off\n" +
        "8 write code: · xcode: → offline manifest\n" +
        "9 🔍 find-in-chat\n" +
        "10 MIND SIZE = Documents + LS + seated www pack\n" +
        "Do not regress: ping-law · NativeHeart · FAB/cloud · body · heart.gguf · no xcframework binary"
    },
    rizalbot: {
      title: "Rizalbot MANUAL",
      path: "Я/mind/books/RIZALBOT-MANUAL.md",
      body:
        "Rizalbot MANUAL (offline)\n" +
        "Spoken F2 RIZALBOT EMBEDDED — companion in-mind: continuity, gut+shelves, optional Metal heart.\n" +
        "Laws: never cloud-token/usage bound for core · zero-network talk · NonNuclear · agents→phone.\n" +
        "Body: mark skin mouth spine gut heart hands immune passport nerves — body part X · combine A+B.\n" +
        "Memory: Shelf: seat · recall retrieve · Bookshelf:/books/manual · Track B before reply.\n" +
        "Mind size: Documents + localStorage + seated www pack (senses/hardcode/modules).\n" +
        "Case: say manual rizalbot case"
    },
    "rizalbot-case": {
      title: "Rizalbot CASE",
      path: "Я/mind/books/RIZALBOT-CASE.md",
      body:
        "Rizalbot CASE — evolve expedite\n" +
        "Seeded: CoS+Rizalbot manuals/cases under Я/mind/books/ + shelf-books.\n" +
        "Checklist: Track B force-quit recall · manual rizalbot/cos · mind folders · MIND SIZE after install · combine hands+nerves · green optional.\n" +
        "One-liners: books · manual cos · manual rizalbot · Shelf: books · mind index · status · Heart · recall NonNuclear"
    },
    spine: {
      title: "RZL F0–F1–F2 SPINE",
      path: "hardcode/RZL-F0-F1-F2-SPINE.md",
      body:
        "Spine: 0 Evolve · 1 ASTA · 2 RIZALBOT EMBEDDED. GOFLOF locks evolve.self · talk.offline · web.video. NonNuclear law. Ping/pong inside embed. Live seat Я/."
    },
    xcode: {
      title: "PROJECTRXCODE",
      path: "hardcode/PROJECTRXCODE-OFFLINE.md",
      body:
        "PROJECTRXCODE: xcode:/darwin:/write code: → offline manifest. NativeHeart Embed&Sign on Mac build path. tokensOn=seated-on-device when frameworkLinked+heart. No xcframework binary in git."
    }
  };

  var BOOK_DOC_TITLES = [
    "mind/books/",
    "mind/books/COS-MANUAL.md",
    "mind/books/COS-CASE.md",
    "mind/books/RIZALBOT-MANUAL.md",
    "mind/books/RIZALBOT-CASE.md",
    "senses/shelf-books.jsonl",
    "senses/books/COS-MANUAL.md",
    "senses/books/RIZALBOT-MANUAL.md",
    "hardcode/books/COS-MANUAL.md",
    "hardcode/books/RIZALBOT-MANUAL.md"
  ];

  /** Approx seated www pack bytes — JS fallback when native wwwBytes absent. Bumped when this module seats. */
  var EMBED_CATALOG = [
    ["app.js", 260273],
    ["senses.js", 8376],
    ["deadman.js", 9441],
    ["styles.css", 9948],
    ["sw.js", 2058],
    ["ya-hardcode-0.1.css", 6411],
    ["index.html", 8306],
    ["manifest.json", 801],
    ["ya-body-parts.js", 8318],
    ["ya-cloud-mark.js", 20096],
    ["ya-compass-br.js", 953],
    ["ya-compass-race.js", 16447],
    ["ya-cos-mode.js", 12137],
    ["ya-find-chat.js", 7590],
    ["ya-hardcode-0.1.js", 3826],
    ["ya-mind-continuity.js", 9390],
    ["ya-mind-books.js", 21556],
    ["ya-ping-bounce.js", 3725],
    ["ya-search-bots.js", 16590],
    ["ya-shelf-pack.js", 12503],
    ["ya-think-evolve.js", 11616],
    ["ya-write-code.js", 10263],
    ["senses/shelf-books.jsonl", 2561],
    ["senses/shelf-decider-cos.jsonl", 4117],
    ["senses/shelves-asta.jsonl", 6229],
    ["senses/shelves-five.jsonl", 8406],
    ["senses/shelf-freedom.jsonl", 2180],
    ["senses/shelf-anthropology.jsonl", 1615],
    ["senses/shelf-technology.jsonl", 1601],
    ["senses/shelf-science.jsonl", 1469],
    ["senses/shelf-art.jsonl", 1541],
    ["hardcode/RZL-F0-F1-F2-SPINE.md", 4672],
    ["hardcode/PROJECTRXCODE-OFFLINE.md", 1131],
    ["hardcode/books/COS-MANUAL.md", 1860],
    ["hardcode/books/COS-CASE.md", 1522],
    ["hardcode/books/RIZALBOT-MANUAL.md", 1614],
    ["hardcode/books/RIZALBOT-CASE.md", 1382]
  ];

  function scrub(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    try {
      if (typeof nuclearBlocked === "function" && nuclearBlocked(s)) return "";
    } catch (e) {}
    return s.slice(0, 600);
  }

  function alreadyHas(text) {
    try {
      if (typeof state !== "object" || !state || !Array.isArray(state.memories)) return false;
      var needle = String(text || "").slice(0, 72).toLowerCase();
      for (var i = 0; i < state.memories.length; i++) {
        var t = String((state.memories[i] && state.memories[i].text) || "").toLowerCase();
        if (t.indexOf(needle) >= 0) return true;
      }
    } catch (e) {}
    return false;
  }

  function seedPack() {
    var seeded = 0;
    for (var i = 0; i < PACK.length; i++) {
      var line = PACK[i];
      if (alreadyHas(line)) continue;
      try {
        if (typeof remember === "function") {
          remember(line);
          seeded++;
        } else if (typeof state === "object" && state) {
          state.memories = state.memories || [];
          state.memories.unshift({ id: "bk-" + Date.now().toString(36) + "-" + i, text: line, at: Date.now() });
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

  function refreshSeatedEmbedBytes() {
    var sum = 0;
    for (var i = 0; i < EMBED_CATALOG.length; i++) sum += EMBED_CATALOG[i][1] || 0;
    try {
      if (typeof window !== "undefined") {
        window.YA_SEATED_EMBED_BYTES = sum;
        window.YA_SEATED_EMBED_CATALOG = EMBED_CATALOG;
        if (typeof SEATED_EMBED_FALLBACK_BYTES !== "undefined") {
          try { SEATED_EMBED_FALLBACK_BYTES = sum; } catch (e0) {}
        }
      }
    } catch (e) {}
    return sum;
  }

  function packHits(query) {
    var q = String(query || "").toLowerCase().trim();
    var words = q.split(/\W+/).filter(function (w) { return w.length > 2; });
    var out = [];
    PACK.forEach(function (line) {
      var hay = line.toLowerCase();
      var sc = 0;
      words.forEach(function (w) { if (hay.indexOf(w) >= 0) sc += 1; });
      if (q.length >= 4 && hay.indexOf(q) >= 0) sc += 2;
      if (/book|manual|cos|rizalbot|case|shelf|xcode|law/.test(q) && /bookshelf:|shelf: books/i.test(line)) sc += 1;
      if (sc >= 1) out.push({ text: line, score: sc, source: "books-pack" });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 8);
  }

  function resolveManual(raw) {
    var k = String(raw || "").toLowerCase().trim();
    if (!k) return null;
    if (/^cos(\s*case)?$/.test(k) || /^chief(\s*of\s*staff)?(\s*case)?$/.test(k) || /^co\.?s(\s*case)?$/.test(k)) {
      return /case/.test(k) ? MANUALS["cos-case"] : MANUALS.cos;
    }
    if (/rizal/.test(k) && /case/.test(k)) return MANUALS["rizalbot-case"];
    if (/rizal|bot|embed/.test(k)) return MANUALS.rizalbot;
    if (/spine|f0|f1|f2/.test(k)) return MANUALS.spine;
    if (/xcode|darwin|projectrx|write.?code/.test(k)) return MANUALS.xcode;
    if (/case/.test(k) && /cos|chief/.test(k)) return MANUALS["cos-case"];
    // fuzzy title scan
    var keys = Object.keys(MANUALS);
    for (var i = 0; i < keys.length; i++) {
      var m = MANUALS[keys[i]];
      if (m.title.toLowerCase().indexOf(k) >= 0) return m;
    }
    return null;
  }

  function booksCard() {
    var n = seedPack();
    var lines = [
      "Books · Я/mind/books/ · Shelf: books",
      "Seeded manuals: CoS MANUAL + CASE · Rizalbot MANUAL + CASE (+" + n + " gut)",
      "Try: manual cos · manual rizalbot · manual cos case · rummage books · Shelf: books",
      "Also: mind index · mind folders · mind reorg"
    ];
    packHits("manual cos rizalbot").slice(0, 4).forEach(function (h) {
      lines.push("· " + scrub(h.text).slice(0, 160));
    });
    return lines.join("\n");
  }

  function loadTags() {
    try {
      var raw = localStorage.getItem(TAG_KEY);
      if (raw) return JSON.parse(raw) || {};
    } catch (e) {}
    return {};
  }

  function saveTags(tags) {
    try {
      localStorage.setItem(TAG_KEY, JSON.stringify(tags || {}));
    } catch (e) {}
  }

  function guessCat(title) {
    var t = String(title || "").toLowerCase();
    if (/bookshelf:|manual|shelf-books|mind\/books|case file|cos-manual|rizalbot-manual/.test(t)) return "books";
    if (/shelf:|nonnuclear|ping law|place law|decider law|100% offline|immune|law/.test(t)) return "laws";
    if (/xcode|darwin|write code|nativeheart|projectrx|\.js$|pbxproj|swift/.test(t)) return "code";
    if (/body part|combine |gut\/|heart\.gguf|YA_BODY|passport|essence|nerves/.test(t)) return "body";
    if (/continuity|chat|message|recall |rummage/.test(t)) return "chat";
    return null;
  }

  function collectTitles() {
    var titles = [];
    var seen = {};
    function add(t, src) {
      t = scrub(t).slice(0, 120);
      if (!t) return;
      var key = t.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      titles.push({ title: t, src: src || "gut", cat: guessCat(t) });
    }
    try {
      if (typeof state === "object" && state && Array.isArray(state.memories)) {
        state.memories.slice(0, 80).forEach(function (m) {
          add((m && m.text) || "", "gut");
        });
      }
    } catch (e) {}
    try {
      if (typeof window.YA_SHELF_PACK !== "undefined" && Array.isArray(window.YA_SHELF_PACK)) {
        window.YA_SHELF_PACK.forEach(function (l) { add(l, "shelf-pack"); });
      }
    } catch (e2) {}
    PACK.forEach(function (l) { add(l, "books-pack"); });
    try {
      var docs = (window.YA_DOC_TITLES || []).concat(BOOK_DOC_TITLES);
      docs.forEach(function (d) { add(d, "documents"); });
    } catch (e3) {}
    try {
      if (window.YA_BODY_CATALOG) {
        window.YA_BODY_CATALOG.forEach(function (p) {
          add("body/" + ((p && p.id) || p), "body");
        });
      }
    } catch (e4) {}
    try {
      if (typeof window.yaContinuityRecallSnippet === "function") {
        var sn = window.yaContinuityRecallSnippet("recent");
        if (sn) add("continuity: " + String(sn).slice(0, 80), "chat");
      }
    } catch (e5) {}
    var tags = loadTags();
    titles.forEach(function (row) {
      var tag = tags[row.title.slice(0, 80)];
      if (tag && CATS.indexOf(tag) >= 0) row.cat = tag;
      if (!row.cat) row.cat = "chat";
    });
    return titles;
  }

  function mindIndexCard() {
    var titles = collectTitles();
    var buckets = { laws: [], books: [], chat: [], code: [], body: [] };
    titles.forEach(function (row) {
      var c = row.cat || "chat";
      if (!buckets[c]) c = "chat";
      if (buckets[c].length < 8) buckets[c].push(row.title.slice(0, 90));
    });
    var lines = [
      "Mind index · Я/ (gut + Documents titles + shelves)",
      "Categories: laws · books · chat · code · body",
      "Path books: Я/mind/books/ · seated embed bytes ~" + refreshSeatedEmbedBytes()
    ];
    CATS.forEach(function (c) {
      lines.push("");
      lines.push("[" + c + "] " + buckets[c].length + (buckets[c].length ? "" : " · empty"));
      buckets[c].slice(0, 5).forEach(function (t) {
        lines.push("· " + t);
      });
    });
    lines.push("");
    lines.push("Reorg: mind reorg <title fragment> into <category>");
    return lines.join("\n");
  }

  function mindFoldersCard() {
    var titles = collectTitles();
    var counts = { laws: 0, books: 0, chat: 0, code: 0, body: 0 };
    titles.forEach(function (r) { counts[r.cat || "chat"] = (counts[r.cat || "chat"] || 0) + 1; });
    return [
      "Mind folders · On My iPhone → Я/",
      "gut/ · mind/books/ · body/ · heart.gguf · www pack (seated)",
      "Index counts — laws " + counts.laws + " · books " + counts.books + " · chat " + counts.chat + " · code " + counts.code + " · body " + counts.body,
      "Say mind index for titled list · mind reorg … into laws|books|chat|code|body"
    ].join("\n");
  }

  function mindReorg(raw) {
    var m = String(raw || "").match(/^mind\s+reorg\s+(.+?)\s+into\s+(laws|books|chat|code|body)\s*$/i);
    if (!m) {
      return "Usage: mind reorg <title fragment> into laws|books|chat|code|body\n" + mindFoldersCard();
    }
    var frag = m[1].trim().toLowerCase();
    var cat = m[2].toLowerCase();
    var titles = collectTitles();
    var tags = loadTags();
    var hit = null;
    for (var i = 0; i < titles.length; i++) {
      if (titles[i].title.toLowerCase().indexOf(frag) >= 0) {
        hit = titles[i];
        break;
      }
    }
    if (!hit) return "No title matched \"" + m[1].trim() + "\". Try mind index.";
    var key = hit.title.slice(0, 80);
    tags[key] = cat;
    saveTags(tags);
    try {
      if (typeof remember === "function") {
        remember("Shelf: Mind tagged \"" + key.slice(0, 60) + "\" → " + cat);
      }
    } catch (e) {}
    return "Mind reorg · tagged → " + cat + "\n· " + hit.title.slice(0, 120) + "\n" + mindFoldersCard();
  }

  function enrichRetrieveBag(bag, userText) {
    bag = bag || { hits: [], shelfHits: [], continuity: "", direct: "" };
    try {
      var extra = packHits(userText);
      if (!extra.length) return bag;
      var asMem = extra.map(function (h) {
        return { text: h.text, at: 0, id: "book-" + h.score };
      });
      bag.shelfHits = (bag.shelfHits || []).concat(asMem).slice(0, 12);
      bag.hits = (bag.hits || []).concat(asMem).slice(0, 14);
      var low = String(userText || "").toLowerCase();
      if (!bag.direct && /book|manual|cos case|rizalbot|bookshelf|mind\/books/.test(low)) {
        bag.direct = asMem[0].text;
      }
    } catch (e) {}
    return bag;
  }

  function patchRetrieve() {
    try {
      if (typeof retrieveBeforeReply !== "function" || retrieveBeforeReply.__yaMindBooksWrapped) return;
      var orig = retrieveBeforeReply;
      var wrapped = function (userText) {
        var bag = orig(userText);
        return enrichRetrieveBag(bag, userText);
      };
      wrapped.__yaMindBooksWrapped = true;
      try { retrieveBeforeReply = wrapped; } catch (e) {}
      try { window.retrieveBeforeReply = wrapped; } catch (e2) {}
    } catch (e3) {}
  }

  function patchDocTitles() {
    try {
      if (typeof window === "undefined") return;
      var base = Array.isArray(window.YA_DOC_TITLES) ? window.YA_DOC_TITLES.slice() : [];
      BOOK_DOC_TITLES.forEach(function (t) {
        if (base.indexOf(t) < 0) base.push(t);
      });
      window.YA_DOC_TITLES = base;
    } catch (e) {}
  }

  function handleMindBooksChat(raw) {
    var q = String(raw || "").trim();
    if (!q) return null;
    var low = q.toLowerCase();

    if (/^(books|bookshelf|shelf:\s*books|shelf books)$/i.test(low)) {
      return booksCard();
    }

    if (/^manual\s+/i.test(low) || /^guidebook\s+/i.test(low)) {
      var topic = q.replace(/^(manual|guidebook)\s+/i, "").trim();
      var man = resolveManual(topic);
      if (!man) {
        return "Manuals seated: cos · cos case · rizalbot · rizalbot case · spine · xcode\n" + booksCard();
      }
      return man.title + " · " + man.path + "\n" + man.body;
    }

    if (/^(mind index|mind catalogue|mind catalog)$/i.test(low)) {
      return mindIndexCard();
    }
    if (/^(mind folders|mind folder|mind dirs)$/i.test(low)) {
      return mindFoldersCard();
    }
    if (/^mind\s+reorg\b/i.test(low)) {
      return mindReorg(q);
    }
    if (/^mind\s+(size|bytes)$/i.test(low)) {
      try {
        var b = typeof mindBytes === "function" ? mindBytes() : 0;
        var emb = typeof seatedEmbedBytes === "function" ? seatedEmbedBytes() : refreshSeatedEmbedBytes();
        var fmt = typeof formatBytes === "function" ? formatBytes : function (n) { return n + " B"; };
        return "MIND SIZE " + fmt(b) + " · seated www/embed " + fmt(emb) + " · Documents+LS included\nVersion rule 0.1 / 1GB stays honest.";
      } catch (e) {
        return "Mind size · seated embed catalog " + refreshSeatedEmbedBytes() + " B";
      }
    }

    return null;
  }

  var prevAnswer = typeof answer === "function" ? answer : null;
  if (prevAnswer) {
    async function answerMB(userText) {
      var mb = handleMindBooksChat(userText);
      if (mb) return mb;
      return await prevAnswer(userText);
    }
    try { answer = answerMB; } catch (e) {}
    try { window.answer = answerMB; } catch (e2) {}
  }

  if (typeof window !== "undefined") {
    window.YA_BOOKS_PACK = PACK;
    window.YA_MANUALS = MANUALS;
    window.yaSeedMindBooks = seedPack;
    window.yaMindIndex = mindIndexCard;
    window.yaHandleMindBooksChat = handleMindBooksChat;
    window.yaBooksPackRecall = function (q) {
      return packHits(q).map(function (h) { return h.text; });
    };
  }

  refreshSeatedEmbedBytes();
  patchDocTitles();

  setTimeout(function () {
    try { seedPack(); } catch (e) {}
    try { patchRetrieve(); } catch (e2) {}
    try { patchDocTitles(); } catch (e3) {}
    try { refreshSeatedEmbedBytes(); } catch (e4) {}
    try {
      if (typeof scheduleMindSizeRefresh === "function") scheduleMindSizeRefresh();
      else if (typeof renderMind === "function") renderMind();
    } catch (e5) {}
  }, 900);

  try {
    if (typeof state === "object" && state && Array.isArray(state.functions)) {
      var hit = state.functions.find(function (f) { return f && f.id === "fn.mind.books"; });
      if (!hit) state.functions.push({ id: "fn.mind.books", name: "Books · manuals + mind index", enabled: true, version: "0.1" });
      else { hit.enabled = true; }
    }
  } catch (e) {}

  try { console.log("[ya-mind-books] seated — books/manuals + mind index · CoS+Rizalbot manuals"); } catch (e) {}
})();
