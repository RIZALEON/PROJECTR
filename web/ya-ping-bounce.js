/*! ya-ping-bounce.js — seated RIZALBOT ping never answers bare "here"
 * Seat LAST after ya-hardcode-0.1.js
 * Airplane: local-seat stamp. Green: last honest bounce host.
 */
(function () {
  "use strict";

  var BOUNCE = {
    ph: "W-PH-philhealth.gov.ph",
    phSpare: "W-PH-afp.mil.ph",
    us: "W-US-treasurydirect.gov",
    usSpare: "W-US-va.gov",
    local: "local-seat"
  };

  function stamp() {
    try { return new Date().toString(); } catch (e) { return ""; }
  }

  function lastBounce() {
    try {
      if (typeof state !== "undefined" && state && state.lastBounce) return String(state.lastBounce);
    } catch (e) {}
    return BOUNCE.local;
  }

  function pongLine(host) {
    return "Pong · first bounce · " + host + " · " + stamp() + " · RIZALBOT🤖";
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

  function handlePing(raw) {
    var q = String(raw || "").trim();
    if (!/^(ping|Ping|PING|ping status|heart status)$/.test(q) && q.toLowerCase() !== "ping") return null;
    var host = isAirplane() ? BOUNCE.local : lastBounce();
    if (host === BOUNCE.local && !isAirplane()) host = BOUNCE.us;
    var line = pongLine(host);
    try {
      if (typeof remember === "function") remember(line);
    } catch (e) {}
    try {
      if (typeof state !== "undefined") {
        state.lastPong = line;
        if (typeof save === "function") save();
      }
    } catch (e) {}
    return line;
  }

  if (typeof window !== "undefined") {
    window.yaPongLine = pongLine;
    window.yaHandlePing = handlePing;
    window.BOUNCE = BOUNCE;
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-ping-bounce] seated — never bare here");
  } catch (e) {}
})();
