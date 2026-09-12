/*! ya-hardcode-0.1.js — Machine Brain V0.0 spine + offline Chief-of-Staff slice
 * Spoken: 0 Evolve · 1 ASTA · 2 RIZALBOT EMBEDDED
 * GOFLOF F2 id remains web.video (senses/hands). Ping/compass = base path inside embed.
 * No cloud brain. No heart.gguf dump.
 */
(function () {
  "use strict";

  var SPINE = {
    version: "0.0",
    seated: "2026-09-10",
    spoken: [
      { n: 0, name: "Evolve", blurb: "Evolve on/offline + auto-update (Function 0 / evolve.self)." },
      { n: 1, name: "ASTA", blurb: "Intelligent offline & online talk — Anthropology · Technology · Science · Art." },
      { n: 2, name: "RIZALBOT EMBEDDED", blurb: "Packed on-device companion + offline Chief-of-Staff slice. Ping/pong+compass are base path inside — not a droppable GOFLOF id." }
    ],
    goflofLocked: ["evolve.self", "talk.offline", "web.video"],
    law: ["NonNuclear", "Decider", "100%-offline", "no-cloud-token-quota", "agents-come-to-phone", "gain>drop", "no-silent-gut-upload"]
  };

  /** Offline CoS persona stub — not a cloud brain; local continuity only. */
  var COS_SLICE = {
    id: "chief-of-staff-slice",
    name: "Chief-of-Staff-slice",
    voice: "Rizalbot",
    knows: [
      "Decider is ultimate authority on this phone seat.",
      "NonNuclear / anti-nuclear is immutable law.",
      "100% offline capable — never bound by cloud token or usage limits. Core chat/evolve/recall/ping on-device; green web optional.",
      "Spoken V0.0: 0 Evolve · 1 ASTA · 2 RIZALBOT EMBEDDED.",
      "GOFLOF locked ids: evolve.self, talk.offline, web.video (senses=hands, not spoken F2).",
      "Ping law: airplane → local-seat; green → closest bounce + Furthest Tower; ping chief = intentional CoS only.",
      "Agents come to the phone. Usage light — no spam ntfy.",
      "Cloud twins are dump-only backup; live seat is On My iPhone Я/."
    ]
  };

  function spineCard() {
    var lines = ["Machine Brain V" + SPINE.version + " · " + SPINE.seated];
    SPINE.spoken.forEach(function (s) {
      lines.push(s.n + ". " + s.name + " — " + s.blurb);
    });
    lines.push("GOFLOF locks: " + SPINE.goflofLocked.join(" · "));
    lines.push("Law: " + SPINE.law.join(" · "));
    return lines.join("\n");
  }

  function cosSliceCard() {
    var lines = [
      "Chief-of-Staff-slice · offline · inside RIZALBOT EMBEDDED",
      "Voice: " + COS_SLICE.voice + " (no required cloud brain)"
    ];
    COS_SLICE.knows.forEach(function (k) { lines.push("· " + k); });
    return lines.join("\n");
  }

  function handleHardcodeChat(raw) {
    var q = String(raw || "").trim().toLowerCase();
    if (!q) return null;
    if (/^(spine|machine brain|f0[–-]f2|foundational|spoken f2|rizalbot embedded)$/i.test(q) ||
        q === "what is spoken f2" || q === "v0.0" || q === "v0") {
      return spineCard();
    }
    if (/^(chief|cos slice|chief of staff slice|offline chief|embedded chief)$/i.test(q) ||
        /chief-of-staff-slice/i.test(q)) {
      return cosSliceCard();
    }
    // Light continuity nudges — do not steal normal chat
    if (/who is (the )?decider/.test(q)) {
      return "The Decider is you on this phone. Agents come to the phone. NonNuclear stays.";
    }
    return null;
  }

  if (typeof window !== "undefined") {
    window.YA_SPINE = SPINE;
    window.YA_COS_SLICE = COS_SLICE;
    window.yaSpineCard = spineCard;
    window.yaCosSliceCard = cosSliceCard;
    window.yaHandleHardcodeChat = handleHardcodeChat;
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-hardcode-0.1] spine + CoS slice seated (RIZALBOT EMBEDDED)");
  } catch (e) {}
})();
