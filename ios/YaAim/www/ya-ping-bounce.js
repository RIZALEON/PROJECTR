/*! ya-ping-bounce.js — seated RIZALBOT ping never answers bare "here"
 * Seat LAST after ya-compass-race.js + ya-compass-br.js
 * Airplane: local-seat line only. Green bare ping / Ping / ping bounce: full race board.
 * Denver/CoS never substitutes for closest bounce.
 */
(function () {
  "use strict";

  var BOUNCE = {
    local: "local-seat",
    br: "S-BR-registro.br",
    brUrl: "https://registro.br/"
  };

  function seatPlace() {
    try {
      if (typeof window.yaRaceSeatPlace === "function") return window.yaRaceSeatPlace();
    } catch (e) {}
    return "phone (Utah)";
  }

  function stamp() {
    try {
      if (typeof window.yaRaceSeatPlace === "function" && typeof Intl !== "undefined") {
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Denver";
        var place = seatPlace();
        var use = place.indexOf("Utah") >= 0 ? "America/Denver" : tz;
        return new Date().toLocaleString("en-US", { timeZone: use });
      }
    } catch (e) {}
    try {
      return new Date().toLocaleString("en-US", { timeZone: "America/Denver" });
    } catch (e2) {
      return new Date().toString();
    }
  }

  function isAirplane() {
    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
    } catch (e) {}
    try {
      if (typeof signal === "function" && !signal()) return true;
    } catch (e) {}
    return false;
  }

  function pongLine(host) {
    return "Pong · closest bounce · " + host + " · " + seatPlace() + " · " + stamp() + " · RIZALBOT🤖";
  }

  function handlePing(raw) {
    var q = String(raw || "").trim();
    var low = q.toLowerCase();
    // leave ping status / ping chief / ping interact to app.js
    if (/^ping\s+(status|chief|interact|reconnect)\b/i.test(q)) return null;
    if (low === "ping status" || low === "mind status" || low === "status") return null;
    if (!(low === "ping" || q === "Ping" || low === "ping bounce")) return null;

    // Airplane lowercase ping → local-seat RIZALBOT line only (not green closest+board)
    if (isAirplane()) {
      var lineA = pongLine(BOUNCE.local);
      try { if (typeof remember === "function") remember(lineA); } catch (e) {}
      return lineA;
    }

    // Green bare ping / capital Ping / ping bounce → full race + board via compass
    // Always handle here so app.js pingChief never sees bare ping when bounce is loaded.
    if (typeof window.yaHandleCompassChat === "function") {
      return window.yaHandleCompassChat("Ping");
    }

    // No compass handler: re-race closest only — never invent Denver/CoS
    if (typeof window.yaRunCompassRace === "function") {
      return window.yaRunCompassRace().then(function (b) {
        var host = (b && b.closest && b.closest.id) || BOUNCE.local;
        var line = pongLine(host);
        try { if (typeof remember === "function") remember(line); } catch (e) {}
        try {
          if (typeof state !== "undefined" && state) {
            state.lastBounce = host;
            state.lastPong = line;
            state.lastRacePlace = (b && b.place) || seatPlace();
            if (typeof save === "function") save();
          }
        } catch (e2) {}
        return line;
      });
    }

    var line = pongLine(BOUNCE.local);
    try { if (typeof remember === "function") remember(line); } catch (e) {}
    return line;
  }

  if (typeof window !== "undefined") {
    window.yaPongLine = pongLine;
    window.yaHandlePing = handlePing;
    window.BOUNCE = Object.assign(window.BOUNCE || {}, BOUNCE);
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-ping-bounce] green ping→full board · airplane local-seat · Denver≠closest");
  } catch (e) {}
})();
