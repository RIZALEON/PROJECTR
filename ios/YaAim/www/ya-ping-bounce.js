/*! ya-ping-bounce.js — seated RIZALBOT ping never answers bare "here"
 * Seat LAST after ya-compass-race.js + ya-compass-br.js
 * Airplane: local-seat. Green: race closest (or lastBounce).
 */
(function () {
  "use strict";

  var BOUNCE = {
    local: "local-seat",
    br: "S-BR-registro.br",
    brUrl: "https://registro.br/"
  };

  function stamp() {
    try {
      return new Date().toLocaleString("en-US", { timeZone: "America/Denver" });
    } catch (e) {
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
    return "Pong · first bounce · " + host + " · " + stamp() + " · RIZALBOT🤖";
  }

  function handlePing(raw) {
    var q = String(raw || "").trim();
    var low = q.toLowerCase();
    // leave ping status / ping chief / ping interact to app.js
    if (/^ping\s+(status|chief|interact|reconnect)\b/i.test(q)) return null;
    if (low === "ping status" || low === "mind status" || low === "status") return null;
    if (!(low === "ping" || q === "Ping" || low === "ping bounce")) return null;

    if (isAirplane()) {
      var lineA = pongLine(BOUNCE.local);
      try { if (typeof remember === "function") remember(lineA); } catch (e) {}
      return lineA;
    }

    // Capital Ping / ping bounce → full race then closest (+ board via compass handler preferred)
    if (q === "Ping" || low === "ping bounce") {
      if (typeof window.yaHandleCompassChat === "function") {
        return window.yaHandleCompassChat("Ping");
      }
    }

    // bare ping: race for closest if possible
    if (typeof window.yaRunCompassRace === "function") {
      return window.yaRunCompassRace().then(function (b) {
        var host = (b && b.closest && b.closest.id) || BOUNCE.local;
        var line = pongLine(host);
        try { if (typeof remember === "function") remember(line); } catch (e) {}
        try {
          if (typeof state !== "undefined" && state) {
            state.lastBounce = host;
            state.lastPong = line;
            if (typeof save === "function") save();
          }
        } catch (e2) {}
        return line;
      });
    }

    var host = BOUNCE.local;
    try {
      if (typeof state !== "undefined" && state && state.lastBounce) host = String(state.lastBounce);
    } catch (e) {}
    var line = pongLine(host);
    try { if (typeof remember === "function") remember(line); } catch (e) {}
    return line;
  }

  if (typeof window !== "undefined") {
    window.yaPongLine = pongLine;
    window.yaHandlePing = handlePing;
    window.BOUNCE = Object.assign(window.BOUNCE || {}, BOUNCE);
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-ping-bounce] seated — never bare here · race-aware");
  } catch (e) {}
})();
