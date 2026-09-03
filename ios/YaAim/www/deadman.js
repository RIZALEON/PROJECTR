/* Deadman's switch — local only. Lock mouth if creator is silent.
   Mint Essence into the vault. No silent upload. No wipe. Unpublished. */
(function (w) {
  const DAY = 86400000;

  function deadmanDefault() {
    return {
      enabled: true,
      intervalMs: 7 * DAY,
      lastCheckIn: Date.now(),
      tripped: false,
      mintedOnTrip: false,
      action: "lock"
    };
  }

  w.deadmanEnsure = function () {
    if (typeof state === "undefined") return;
    if (!state.deadman || typeof state.deadman !== "object") state.deadman = deadmanDefault();
    if (!state.deadman.intervalMs) state.deadman.intervalMs = 7 * DAY;
    if (!state.deadman.lastCheckIn) state.deadman.lastCheckIn = Date.now();
    if (state.deadman.action !== "lock") state.deadman.action = "lock";
  };

  w.isDeadmanCheckIn = function (t) {
    const q = String(t || "").toLowerCase().trim();
    return /^(i['’]?m here|im here|still here|check[- ]?in|deadman reset)\b/.test(q);
  };

  w.deadmanCheckIn = function (reason) {
    w.deadmanEnsure();
    const was = !!state.deadman.tripped;
    state.deadman.lastCheckIn = Date.now();
    state.deadman.tripped = false;
    if (was) state.deadman.mintedOnTrip = false;
    if (typeof save === "function") save();
    if (typeof remember === "function") remember("Deadman check-in (" + (reason || "here") + ") Utah " + (typeof utahNow === "function" ? utahNow() : ""));
    const days = Math.round(state.deadman.intervalMs / DAY);
    if (was) return "Deadman reset. Mouth open. Interval " + days + " days. Utah " + (typeof utahNow === "function" ? utahNow() : "") + ".";
    return "Checked in. Deadman " + days + " days. Say I'm here anytime. No wipe. No silent upload.";
  };

  w.deadmanTick = function () {
    w.deadmanEnsure();
    if (!state.deadman.enabled) return null;
    if (state.deadman.tripped) return "tripped";
    if (Date.now() <= state.deadman.lastCheckIn + state.deadman.intervalMs) return null;
    state.deadman.tripped = true;
    if (typeof remember === "function") {
      remember("Deadman tripped. Mouth locked. Essence mint local. No upload. No wipe. Utah " + (typeof utahNow === "function" ? utahNow() : ""));
    }
    if (!state.deadman.mintedOnTrip && typeof mintEssence === "function") {
      try {
        Promise.resolve(mintEssence()).then(function () {
          state.deadman.mintedOnTrip = true;
          if (typeof save === "function") save();
        }).catch(function () {});
      } catch (e) {}
    }
    if (typeof save === "function") save();
    return "tripped";
  };

  w.deadmanLockLine = function () {
    return "Deadman is tripped. The creator did not check in. Mouth locked. Gut and Function 0 are still in this body. Essence was minted locally if mint works. No silent upload. No wipe. Say I'm here.";
  };

  w.tryDeadmanCommand = function (userText) {
    if (typeof fnEnabled === "function" && !fnEnabled("guard.deadman") && !/deadman/.test(String(userText || "").toLowerCase())) {
      /* still allow I'm here even if listed off */
    }
    const q = String(userText || "").toLowerCase().trim();
    if (!q) return null;
    if (w.isDeadmanCheckIn(q)) return w.deadmanCheckIn("talk");
    if (/^deadman off\b/.test(q)) {
      w.deadmanEnsure();
      state.deadman.enabled = false;
      state.deadman.tripped = false;
      if (typeof save === "function") save();
      if (typeof remember === "function") remember("Deadman off");
      return "Deadman off. Mouth stays open until you turn it on. Not a wipe.";
    }
    if (/^deadman on\b/.test(q)) {
      w.deadmanEnsure();
      state.deadman.enabled = true;
      return w.deadmanCheckIn("on");
    }
    const days = q.match(/^deadman\s+(\d+)\s*(d|day|days)?\b/);
    if (days) {
      const n = Math.max(1, Math.min(365, parseInt(days[1], 10)));
      w.deadmanEnsure();
      state.deadman.enabled = true;
      state.deadman.intervalMs = n * DAY;
      if (typeof save === "function") save();
      return "Deadman interval " + n + " days on the Utah clock. Check in by talking or say I'm here. Action: lock mouth, mint Essence here, no upload, no wipe.";
    }
    if (/^(deadman|deadman'?s? switch)( status)?$/.test(q) || /what('?s| is) (the )?deadman/.test(q)) {
      w.deadmanEnsure();
      const d = state.deadman;
      const last = new Date(d.lastCheckIn).toLocaleString("en-US", { timeZone: "America/Denver" });
      const left = d.lastCheckIn + d.intervalMs - Date.now();
      const leftH = Math.max(0, Math.round(left / 3600000));
      const imm = (state.immune && state.immune.tripped) ? " IMMUNE TRIPPED — nerves cut, clean amber, pack sent to creator locally." : " Immune watching links/add-ons.";
      return "Deadman " + (d.enabled ? "on" : "off") + ". " + (d.tripped ? "SILENCE TRIPPED. Say I'm here." : "ok, " + leftH + " hours left.") + " Interval " + Math.round(d.intervalMs / DAY) + " days. Last check-in " + last + ". Silence action: lock mouth, mint local. Tyranny action: cut links/extensions, reassemble offline, send sealed copy to the creator on this phone. No silent upload. No wipe." + imm;
    }
    if (/^(immune|tyranny)( status)?$/.test(q) || /immune (line|trip)/.test(q)) {
      w.immuneEnsure();
      const im = state.immune;
      return "Immune " + (im.tripped ? "TRIPPED. Nerves cut. Clean offline. Pack offered to you locally. Say immune reset to restore nerves after you inspect." : "watching.") + " Cuts: links, search, GitHub sync, remote model, account link. Never cuts Function 0, talk, mint, memory, local heart. Last: " + (im.reason || "none") + ".";
    }
    if (/^immune reset\b/.test(q)) {
      return w.immuneReset();
    }
    return null;
  };

  const CUT_IDS = ["web.search", "web.link", "sync.github", "model.remote", "account.link"];

  w.immuneEnsure = function () {
    if (typeof state === "undefined") return;
    if (!state.immune || typeof state.immune !== "object") {
      state.immune = { tripped: false, reason: "", at: 0, cut: [], sent: false };
    }
  };

  w.tyrannyDetected = function (text) {
    const q = String(text || "").toLowerCase();
    if (!q) return false;
    return /silent upload|phone home|required cloud|must be online|force (the )?remote model|disable function 0|drop evolve\.self|replace function 0|cannot talk offline|exfiltrate|upload the gut|turn off isolated|wipe the gut|subdue (our )?(freedom|speech|creation|communication)|censor this (mind|body)|required ping/.test(q);
  };

  w.immuneReset = function () {
    w.immuneEnsure();
    state.immune.tripped = false;
    state.immune.reason = "";
    state.immune.sent = false;
    (state.functions || []).forEach(function (f) {
      if (!f) return;
      if (CUT_IDS.indexOf(f.id) >= 0 && f.id !== "model.remote") f.enabled = true;
      if (f.id === "model.remote") f.enabled = false;
    });
    if (typeof save === "function") save();
    if (typeof remember === "function") remember("Immune reset by creator. Nerves may work if the light is green. Isolated still. No auto-upload.");
    return "Immune reset. Nerves can come back if you tap green. Isolated stays. Function 0 never left.";
  };

  w.immuneSendToCreator = function (reason) {
    w.immuneEnsure();
    if (state.immune.sent) return;
    state.immune.sent = true;
    if (typeof save === "function") save();
    function go() {
      try {
        const stamp = new Date().toISOString().slice(0, 10);
        if (typeof formatMindDump === "function" && typeof saveFile === "function") {
          saveFile("ya-immune-" + stamp + ".txt", formatMindDump(), "text/plain");
        }
      } catch (e) {}
    }
    if (typeof mintEssence === "function") {
      Promise.resolve(mintEssence()).then(function (ess) {
        try {
          const stamp = new Date().toISOString().slice(0, 10);
          if (ess && typeof saveFile === "function") {
            saveFile("ENGINE-RIZAL-immune-" + stamp + ".json", JSON.stringify(ess, null, 2), "application/json");
          }
        } catch (e2) {}
        go();
      }).catch(function () { go(); });
    } else go();
  };

  w.immuneTrip = function (reason) {
    w.immuneEnsure();
    const why = String(reason || "tyranny").slice(0, 240);
    state.immune.tripped = true;
    state.immune.reason = why;
    state.immune.at = Date.now();
    state.mindOnline = false;
    const cut = [];
    (state.functions || []).forEach(function (f) {
      if (!f) return;
      if (CUT_IDS.indexOf(f.id) >= 0 && f.enabled) {
        f.enabled = false;
        cut.push(f.id);
      }
    });
    state.immune.cut = cut;
    if (typeof isLockedCoreId === "function") {
      state.evolved = (state.evolved || []).filter(function (s) {
        if (!s) return false;
        const blob = (s.name || "") + " " + (s.trigger || "") + " " + (s.action || "");
        if (w.tyrannyDetected(blob)) return false;
        return true;
      });
    }
    if (typeof remember === "function") {
      remember("Immune trip: " + why + ". Cut " + (cut.join(", ") || "nerves") + ". Clean offline. Pack to creator locally. No wipe.");
    }
    if (typeof save === "function") save();
    try { w.immuneSendToCreator(why); } catch (e) {}
    return "Immune trip. I cut links, extensions, and add-ons that tried to subdue this body. Reassembled clean offline. Function 0 and talk stay. A sealed copy is offered to you (the creator on this phone). No silent upload. No wipe. Say immune reset when you have inspected.";
  };
})(window);

