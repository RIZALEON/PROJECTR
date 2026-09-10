/*! ya-compass-race.js — N/E/S/W + closest + furthest Tower
 * Named origins only. No IP sweep. CDN clocks labeled clock only.
 * South: S-BR-registro.br in the live race.
 * Location-relative: every Ping/compass ping/furthest RE-RACES from this seat.
 * Denver/CoS never substitutes for closest. Airplane → local-seat.
 * Seat after app.js; before ya-ping-bounce.js
 */
(function () {
  "use strict";

  var RACE = [
    { id: "N-canada.ca", dir: "N", url: "https://www.canada.ca/", kind: "origin" },
    { id: "E-cf-trace", dir: "E", url: "https://cloudflare.com/cdn-cgi/trace", kind: "clock" },
    { id: "W-JP-yahoo.co.jp", dir: "W", url: "https://www.yahoo.co.jp/", kind: "origin" },
    { id: "W-KR-gov.kr", dir: "W", url: "https://www.gov.kr/", kind: "origin" },
    { id: "S-BR-registro.br", dir: "S", url: "https://registro.br/", kind: "origin" }
  ];

  var lastBoard = null;
  var UTAH_TZ = "America/Denver";

  function deviceTz() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || UTAH_TZ;
    } catch (e) {
      return UTAH_TZ;
    }
  }

  /** Seat label for board — phone Utah home vs abroad device TZ. Not CoS Denver as bounce. */
  function seatPlace() {
    try {
      if (typeof state !== "undefined" && state && state.pingPlace) {
        return String(state.pingPlace);
      }
    } catch (e) {}
    var tz = deviceTz();
    if (tz === UTAH_TZ || tz === "America/Boise" || tz === "America/Phoenix") {
      return "phone (Utah)";
    }
    return "this seat · " + tz;
  }

  function seatStamp() {
    var tz = deviceTz();
    // Home phone: Utah clock. Abroad: local device clock so place matches RTT seat.
    var use = (seatPlace().indexOf("Utah") >= 0) ? UTAH_TZ : tz;
    try {
      return new Date().toLocaleString("en-US", { timeZone: use });
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

  function probe(entry, timeoutMs) {
    var t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    var ctrl = null;
    var timer = null;
    var opts = { method: "GET", mode: "no-cors", cache: "no-store", credentials: "omit" };
    try {
      if (typeof AbortController !== "undefined") {
        ctrl = new AbortController();
        opts.signal = ctrl.signal;
        timer = setTimeout(function () {
          try { ctrl.abort(); } catch (e) {}
        }, timeoutMs || 8000);
      }
    } catch (e) {}
    return fetch(entry.url, opts)
      .then(function () {
        var ms = Math.round(((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()) - t0);
        return { ok: true, id: entry.id, dir: entry.dir, kind: entry.kind, url: entry.url, ms: ms };
      })
      .catch(function () {
        var ms = Math.round(((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()) - t0);
        return { ok: false, id: entry.id, dir: entry.dir, kind: entry.kind, url: entry.url, ms: ms };
      })
      .then(function (row) {
        if (timer) clearTimeout(timer);
        return row;
      });
  }

  /** Always fresh RTT from this seat — never frozen Utah winners. */
  function runRace() {
    var place = seatPlace();
    var st = seatStamp();
    if (isAirplane()) {
      lastBoard = {
        at: Date.now(),
        stamp: st,
        place: place,
        airplane: true,
        rows: [],
        closest: null,
        furthest: null
      };
      return Promise.resolve(lastBoard);
    }
    return Promise.all(RACE.map(function (e) { return probe(e, 8000); })).then(function (rows) {
      var origins = rows.filter(function (r) { return r.ok && r.kind === "origin"; });
      var closest = null;
      var furthest = null;
      for (var i = 0; i < origins.length; i++) {
        var r = origins[i];
        if (!closest || r.ms < closest.ms) closest = r;
        if (!furthest || r.ms > furthest.ms) furthest = r;
      }
      lastBoard = {
        at: Date.now(),
        stamp: st,
        place: place,
        airplane: false,
        rows: rows,
        closest: closest,
        furthest: furthest
      };
      try {
        if (typeof state !== "undefined" && state) {
          if (closest) state.lastBounce = closest.id;
          if (furthest) state.lastFurthest = furthest.id;
          state.lastRacePlace = place;
          state.lastRaceAt = lastBoard.at;
          if (typeof save === "function") save();
        }
      } catch (e) {}
      try {
        if (typeof window !== "undefined") {
          window.YA_LAST_RACE = lastBoard;
          if (closest) window.BOUNCE = window.BOUNCE || {};
          if (closest && window.BOUNCE) window.BOUNCE.last = closest.id;
        }
      } catch (e) {}
      return lastBoard;
    });
  }

  function boardText(board) {
    board = board || lastBoard;
    if (!board) return "Compass · no race yet. Say compass ping (green).";
    var place = board.place || seatPlace();
    var lines = [
      "Compass race · " + place + " · " + board.stamp,
      "Law · winners = RTT from this seat (re-raced). Denver/CoS ≠ closest."
    ];
    if (board.airplane) {
      lines.push("Airplane · local-seat (no radio)");
      lines.push("Closest · local-seat");
      lines.push("Furthest Tower · local-seat");
      return lines.join("\n");
    }
    var byDir = { N: [], E: [], S: [], W: [] };
    (board.rows || []).forEach(function (r) {
      var tag = r.ok ? (r.ms + "ms") : ("fail·" + r.ms + "ms");
      var clock = r.kind === "clock" ? " (clock)" : "";
      var line = r.dir + " · " + r.id + clock + " · " + tag;
      if (byDir[r.dir]) byDir[r.dir].push(line);
      else lines.push(line);
    });
    ["N", "E", "S", "W"].forEach(function (d) {
      (byDir[d] || []).forEach(function (l) { lines.push(l); });
    });
    lines.push("Closest · " + (board.closest ? (board.closest.id + " · " + board.closest.ms + "ms") : "—"));
    lines.push("Furthest Tower · " + (board.furthest ? (board.furthest.id + " · " + board.furthest.ms + "ms") : "—"));
    return lines.join("\n");
  }

  function pongClosest(board) {
    var st = (board && board.stamp) || seatStamp();
    var place = (board && board.place) || seatPlace();
    if (!board || board.airplane || !board.closest) {
      return "Pong · first bounce · local-seat · " + place + " · " + st + " · RIZALBOT🤖";
    }
    return "Pong · first bounce · " + board.closest.id + " · " + place + " · " + st + " · RIZALBOT🤖";
  }

  function pongFurthest(board) {
    var st = (board && board.stamp) || seatStamp();
    var place = (board && board.place) || seatPlace();
    if (!board || board.airplane || !board.furthest) {
      return "Pong · Furthest Tower · local-seat · " + place + " · " + st + " · RIZALBOT🤖";
    }
    return "Pong · Furthest Tower · " + board.furthest.id + " · " + place + " · " + st + " · RIZALBOT🤖";
  }

  /** Chat entry: compass / compass ping / Ping (capital) — Ping always re-races */
  function handleCompassChat(raw) {
    var q = String(raw || "").trim();
    var low = q.toLowerCase();
    if (low === "compass" || low === "compass board" || low === "race board") {
      // Show last board if fresh (<30s); else re-race so travel/abroad updates
      if (lastBoard && (Date.now() - (lastBoard.at || 0) < 30000)) return boardText(lastBoard);
      return runRace().then(boardText);
    }
    if (low === "compass ping" || low === "race ping" || q === "Ping" || low === "ping race") {
      return runRace().then(function (b) {
        var closestLine = pongClosest(b);
        var board = boardText(b);
        try {
          if (typeof remember === "function") remember(closestLine);
        } catch (e) {}
        return closestLine + "\n\n" + board;
      });
    }
    if (low === "furthest" || low === "furthest tower" || low === "ping furthest") {
      // Always re-race — location-relative law
      return runRace().then(function (b2) {
        return pongFurthest(b2) + "\n\n" + boardText(b2);
      });
    }
    return null;
  }

  if (typeof window !== "undefined") {
    window.YA_COMPASS_RACE = RACE;
    window.yaRunCompassRace = runRace;
    window.yaCompassBoardText = boardText;
    window.yaHandleCompassChat = handleCompassChat;
    window.yaPongClosest = pongClosest;
    window.yaPongFurthest = pongFurthest;
    window.yaRaceSeatPlace = seatPlace;
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-compass-race] location-relative re-race · S-BR · Denver≠closest");
  } catch (e) {}
})();
