/*! ya-compass-race.js — N/E/S/W + closest + furthest Tower + Top 3
 * Named origins only for place slots. CDN clocks labeled (clock) — path-only, never top-3/closest place.
 * South: S-BR-registro.br always in race + board (fail/timed-out still listed).
 * Location-relative: every Ping/compass ping/furthest RE-RACES from this seat.
 * Seat stamp = precise GPS city/neighborhood (same stack as place search), not Utah TZ.
 * Denver/CoS never substitutes for closest. Airplane → local-seat honest (no fake GPS).
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
  var PROBE_MS = 8000;

  function deviceTz() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || UTAH_TZ;
    } catch (e) {
      return UTAH_TZ;
    }
  }

  /** Seat label — prefer precise GPS city/neighborhood; TZ Utah only as last resort. */
  function seatPlace() {
    try {
      if (typeof state !== "undefined" && state && state.pingPlace) {
        return String(state.pingPlace);
      }
    } catch (e) {}
    try {
      if (typeof window !== "undefined" && typeof window.yaLoadLastKnownGeo === "function") {
        var g = window.yaLoadLastKnownGeo();
        if (g && g.label) return String(g.label);
      }
    } catch (e2) {}
    try {
      if (typeof state !== "undefined" && state && state.lastRacePlace) {
        return String(state.lastRacePlace);
      }
    } catch (e3) {}
    var tz = deviceTz();
    if (tz === UTAH_TZ || tz === "America/Boise" || tz === "America/Phoenix") {
      return "phone (Utah · TZ — allow Location for GPS)";
    }
    return "this seat · " + tz + " (TZ — allow Location for GPS)";
  }

  /** Precise GPS seat for board stamp (same stack as place search). */
  function refreshGpsSeat() {
    return new Promise(function (resolve) {
      if (isAirplane()) {
        try {
          if (typeof window !== "undefined" && typeof window.yaLoadLastKnownGeo === "function") {
            var last = window.yaLoadLastKnownGeo();
            if (last && last.label) {
              var lab = String(last.label) + " (last known · airplane)";
              try {
                if (typeof state !== "undefined" && state) {
                  state.pingPlace = lab;
                  state.lastRacePlace = lab;
                  if (typeof save === "function") save();
                }
              } catch (e0) {}
              return resolve(lab);
            }
          }
        } catch (e1) {}
        return resolve("local-seat · no live GPS");
      }
      if (typeof window === "undefined" || typeof window.yaResolveDeviceGeo !== "function") {
        return resolve(seatPlace());
      }
      window.yaResolveDeviceGeo().then(function (geo) {
        if (!geo || !geo.ok) {
          return resolve(seatPlace());
        }
        function finish(label) {
          try {
            if (typeof state !== "undefined" && state) {
              state.pingPlace = label;
              state.lastRacePlace = label;
              if (typeof save === "function") save();
            }
          } catch (e2) {}
          resolve(label);
        }
        if (geo.label && !geo.live) {
          return finish(String(geo.label));
        }
        if (typeof window.yaReverseGeocode === "function" && typeof geo.lat === "number") {
          return window.yaReverseGeocode(geo.lat, geo.lon).then(function (rev) {
            var short = (rev && rev.label) || (geo.lat.toFixed(4) + ", " + geo.lon.toFixed(4));
            try {
              if (typeof window.yaSaveLastKnownGeo === "function") {
                window.yaSaveLastKnownGeo({
                  lat: geo.lat,
                  lon: geo.lon,
                  label: short,
                  city: (rev && rev.city) || "",
                  neighborhood: (rev && rev.neighborhood) || "",
                  source: geo.source || "device",
                  accuracy: geo.accuracy
                });
              }
            } catch (e3) {}
            finish(short);
          }).catch(function () {
            finish(geo.lat.toFixed(4) + ", " + geo.lon.toFixed(4));
          });
        }
        finish(geo.label || (geo.lat.toFixed(4) + ", " + geo.lon.toFixed(4)));
      }).catch(function () {
        resolve(seatPlace());
      });
    });
  }

  function seatStamp() {
    var tz = deviceTz();
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
    var limit = timeoutMs || PROBE_MS;
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
        }, limit);
      }
    } catch (e) {}
    // Hard timeout wrapper so a hung fetch never drops a race seat from the board
    var hard = new Promise(function (resolve) {
      setTimeout(function () {
        var ms = Math.round(((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()) - t0);
        resolve({ ok: false, id: entry.id, dir: entry.dir, kind: entry.kind, url: entry.url, ms: ms, timedOut: true });
      }, limit + 250);
    });
    var fetchP = fetch(entry.url, opts)
      .then(function () {
        var ms = Math.round(((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()) - t0);
        return { ok: true, id: entry.id, dir: entry.dir, kind: entry.kind, url: entry.url, ms: ms, timedOut: false };
      })
      .catch(function () {
        var ms = Math.round(((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()) - t0);
        var timedOut = ms >= (limit - 50);
        return { ok: false, id: entry.id, dir: entry.dir, kind: entry.kind, url: entry.url, ms: ms, timedOut: timedOut };
      })
      .then(function (row) {
        if (timer) clearTimeout(timer);
        return row;
      });
    return Promise.race([fetchP, hard]).then(function (row) {
      if (timer) clearTimeout(timer);
      return row;
    });
  }

  /** Merge probe results onto full RACE template — never drop W-JP / W-KR / S-BR. */
  function ensureAllRows(rows) {
    var byId = {};
    (rows || []).forEach(function (r) {
      if (r && r.id) byId[r.id] = r;
    });
    return RACE.map(function (e) {
      if (byId[e.id]) {
        var r = byId[e.id];
        return {
          ok: !!r.ok,
          id: e.id,
          dir: e.dir,
          kind: e.kind,
          url: e.url,
          ms: typeof r.ms === "number" ? r.ms : PROBE_MS,
          timedOut: !!r.timedOut || (!r.ok && (r.ms >= PROBE_MS - 50))
        };
      }
      return { ok: false, id: e.id, dir: e.dir, kind: e.kind, url: e.url, ms: PROBE_MS, timedOut: true };
    });
  }

  /** Top 3 fastest named origins only — clocks never occupy place slots. */
  function top3Origins(rows) {
    var origins = (rows || []).filter(function (r) {
      return r && r.kind === "origin";
    });
    // Prefer successful probes; then by ms ascending. Failed/timed-out still eligible after oks.
    origins.sort(function (a, b) {
      if (!!a.ok !== !!b.ok) return a.ok ? -1 : 1;
      return (a.ms || 0) - (b.ms || 0);
    });
    return origins.slice(0, 3);
  }

  function rowTag(r) {
    if (r.ok) return r.ms + "ms";
    if (r.timedOut) return "timed-out·" + r.ms + "ms";
    return "fail·" + r.ms + "ms";
  }

  function top3Text(board) {
    var top = (board && board.top3) || [];
    if (!top.length) return "Top 3 · —";
    var parts = top.map(function (r, i) {
      return (i + 1) + ". " + r.id + " · " + rowTag(r);
    });
    return "Top 3 · " + parts.join(" · ");
  }

  /** Always fresh RTT from this seat — never frozen Utah winners. Seat place = GPS. */
  function runRace() {
    return refreshGpsSeat().then(function (place) {
      var st = seatStamp();
      if (isAirplane()) {
        lastBoard = {
          at: Date.now(),
          stamp: st,
          place: place,
          airplane: true,
          rows: ensureAllRows([]).map(function (r) {
            return { ok: false, id: r.id, dir: r.dir, kind: r.kind, url: r.url, ms: 0, timedOut: false, airplane: true };
          }),
          closest: null,
          furthest: null,
          top3: []
        };
        return lastBoard;
      }
      // Race RTT in parallel with seat already GPS-stamped
      return Promise.all(RACE.map(function (e) { return probe(e, PROBE_MS); })).then(function (rawRows) {
        var rows = ensureAllRows(rawRows);
        // Closest / furthest / top3 = named origins only (never clock as place)
        var originsOk = rows.filter(function (r) { return r.ok && r.kind === "origin"; });
        var closest = null;
        var furthest = null;
        for (var i = 0; i < originsOk.length; i++) {
          var r = originsOk[i];
          if (!closest || r.ms < closest.ms) closest = r;
          if (!furthest || r.ms > furthest.ms) furthest = r;
        }
        var top3 = top3Origins(rows);
        if (!closest && top3.length && top3[0].ok) closest = top3[0];
        lastBoard = {
          at: Date.now(),
          stamp: st,
          place: place,
          airplane: false,
          rows: rows,
          closest: closest,
          furthest: furthest,
          top3: top3
        };
        try {
          if (typeof state !== "undefined" && state) {
            if (closest) state.lastBounce = closest.id;
            if (furthest) state.lastFurthest = furthest.id;
            state.lastRacePlace = place;
            state.pingPlace = place;
            state.lastRaceAt = lastBoard.at;
            state.lastTop3 = top3.map(function (t) { return t.id; });
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
    });
  }

  function boardText(board) {
    board = board || lastBoard;
    if (!board) return "Compass · no race yet. Say compass ping (green).";
    var place = board.place || seatPlace();
    var lines = [
      "Compass race · " + place + " · " + board.stamp,
      "Law · winners = RTT from this seat (re-raced). Denver/CoS ≠ closest. Clock ≠ place."
    ];
    if (board.airplane) {
      lines.push("Airplane · local-seat (no radio)");
      lines.push("Closest · local-seat");
      lines.push("Furthest Tower · local-seat");
      lines.push("Top 3 · local-seat");
      return lines.join("\n");
    }
    // ALWAYS render every RACE id in N/E/S/W order — merge by id so missing probes still show
    var byId = {};
    (board.rows || []).forEach(function (r) {
      if (r && r.id) byId[r.id] = r;
    });
    var byDir = { N: [], E: [], S: [], W: [] };
    RACE.forEach(function (e) {
      var r = byId[e.id] || { ok: false, id: e.id, dir: e.dir, kind: e.kind, url: e.url, ms: PROBE_MS, timedOut: true };
      var clock = e.kind === "clock" ? " (clock)" : "";
      var line = e.dir + " · " + e.id + clock + " · " + rowTag(r);
      if (byDir[e.dir]) byDir[e.dir].push(line);
      else lines.push(line);
    });
    ["N", "E", "S", "W"].forEach(function (d) {
      (byDir[d] || []).forEach(function (l) { lines.push(l); });
    });
    lines.push("Closest · " + (board.closest ? (board.closest.id + " · " + board.closest.ms + "ms") : "—"));
    lines.push("Furthest Tower · " + (board.furthest ? (board.furthest.id + " · " + board.furthest.ms + "ms") : "—"));
    lines.push(top3Text(board));
    return lines.join("\n");
  }

  function pongClosest(board) {
    var st = (board && board.stamp) || seatStamp();
    var place = (board && board.place) || seatPlace();
    if (!board || board.airplane || !board.closest) {
      return "Pong · closest bounce · local-seat · " + place + " · " + st + " · RIZALBOT🤖";
    }
    return "Pong · closest bounce · " + board.closest.id + " · " + place + " · " + st + " · RIZALBOT🤖";
  }

  function pongFurthest(board) {
    var st = (board && board.stamp) || seatStamp();
    var place = (board && board.place) || seatPlace();
    if (!board || board.airplane || !board.furthest) {
      return "Pong · Furthest Tower · local-seat · " + place + " · " + st + " · RIZALBOT🤖";
    }
    return "Pong · Furthest Tower · " + board.furthest.id + " · " + place + " · " + st + " · RIZALBOT🤖";
  }

  function pongTop3(board) {
    var st = (board && board.stamp) || seatStamp();
    var place = (board && board.place) || seatPlace();
    if (!board || board.airplane) {
      return "Pong · Top 3 · local-seat · " + place + " · " + st + " · RIZALBOT🤖";
    }
    return "Pong · " + top3Text(board) + " · " + place + " · " + st + " · RIZALBOT🤖";
  }

  function raceThenBoard(extraLineFn) {
    return runRace().then(function (b) {
      var head = typeof extraLineFn === "function" ? extraLineFn(b) : pongClosest(b);
      var board = boardText(b);
      try {
        if (typeof remember === "function") remember(head);
      } catch (e) {}
      return head + "\n\n" + board;
    });
  }

  /** Chat entry: compass / ping / Ping / top 3 — always re-race + full board */
  function handleCompassChat(raw) {
    var q = String(raw || "").trim();
    var low = q.toLowerCase();
    // Exact race phrases only — never substring of "Bishop pattern recognition" / "Recognition"
    var wordCountRace = low.split(/\s+/).filter(Boolean).length;
    if (wordCountRace > 4) return null;
    if (low === "compass" || low === "compass board" || low === "race board") {
      if (lastBoard && (Date.now() - (lastBoard.at || 0) < 30000)) return boardText(lastBoard);
      return runRace().then(boardText);
    }
    // Green bare ping → full race+board. Airplane bare ping left to bounce (local-seat only).
    if (low === "ping") {
      if (isAirplane()) return null;
      return raceThenBoard(pongClosest);
    }
    if (low === "compass ping" || low === "race ping" || q === "Ping" || low === "ping race" || low === "ping bounce") {
      return raceThenBoard(pongClosest);
    }
    if (low === "top 3" || low === "fastest 3" || low === "top three" || low === "top three pong" || low === "fastest three" || low === "top3") {
      return raceThenBoard(pongTop3);
    }
    if (low === "furthest" || low === "furthest tower" || low === "ping furthest") {
      return raceThenBoard(pongFurthest);
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
    window.yaPongTop3 = pongTop3;
    window.yaRaceSeatPlace = seatPlace;
    window.yaRaceTop3 = function () { return (lastBoard && lastBoard.top3) || []; };
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-compass-race] full board always · Top3 origins · clock≠place · S-BR · Denver≠closest");
  } catch (e) {}
})();
