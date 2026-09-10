/*! ya-cloud-mark.js — upside-down 3D cloud workmark (iOS WKWebView-safe)
 * Busy = obvious continuous tumble + canvas rain/sparks/thunder.
 * Idle quiet. Offline only. Bottom Speak chrome. Does not block send.
 */
(function () {
  "use strict";

  var ROOT_ID = "ya-cloud-mark";
  var state = "idle";
  var timer = 0;
  var raf = 0;
  var t0 = 0;
  var canvas = null;
  var ctx = null;
  var drops = [];
  var sparks = [];
  var W = 120;
  var H = 72;

  function ensureDom() {
    var el = document.getElementById(ROOT_ID);
    if (el) {
      canvas = el.querySelector("canvas");
      if (canvas) ctx = canvas.getContext("2d");
      return el;
    }
    var host = document.querySelector("form.composer") || document.body;
    el = document.createElement("div");
    el.id = ROOT_ID;
    el.className = "ya-cloud-mark idle";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="ya-cloud-stage">' +
      '<div class="ya-cloud-tumble">' +
      '<canvas class="ya-cloud-canvas" width="120" height="72"></canvas>' +
      '<div class="ya-cloud-ya" aria-hidden="true">Я</div>' +
      "</div></div>";
    if (host && host.parentNode) host.parentNode.insertBefore(el, host);
    else document.body.appendChild(el);
    canvas = el.querySelector("canvas");
    ctx = canvas.getContext("2d");
    return el;
  }

  function seedWeather() {
    drops = [];
    sparks = [];
    var i;
    for (i = 0; i < 14; i++) {
      drops.push({
        x: 28 + Math.random() * 64,
        y: Math.random() * 28,
        len: 6 + Math.random() * 10,
        spd: 0.9 + Math.random() * 1.6,
        ph: Math.random() * 10
      });
    }
    for (i = 0; i < 8; i++) {
      sparks.push({
        x: 36 + Math.random() * 48,
        y: 22 + Math.random() * 20,
        r: 0.8 + Math.random() * 1.6,
        ph: Math.random() * 6
      });
    }
  }

  function drawCloudBody(g, ox, oy, sc, alpha, withEyes) {
    g.save();
    g.translate(ox, oy);
    g.scale(sc, sc);
    g.globalAlpha = alpha;
    // Fluffy purple avatar cloud (bumps = "top" of character; scene is Y-flipped so busy = upside-down)
    g.beginPath();
    g.ellipse(0, 2, 26, 16, 0, 0, Math.PI * 2);
    g.ellipse(-18, 0, 16, 14, 0, 0, Math.PI * 2);
    g.ellipse(18, 0, 16, 14, 0, 0, Math.PI * 2);
    g.ellipse(-8, -10, 14, 12, 0, 0, Math.PI * 2);
    g.ellipse(10, -11, 13, 12, 0, 0, Math.PI * 2);
    g.ellipse(0, -14, 12, 11, 0, 0, Math.PI * 2);
    var grd = g.createLinearGradient(0, -20, 0, 18);
    grd.addColorStop(0, "rgba(230, 210, 255, 0.95)");
    grd.addColorStop(0.45, "rgba(186, 150, 235, 0.92)");
    grd.addColorStop(1, "rgba(130, 95, 190, 0.88)");
    g.fillStyle = grd;
    g.fill();
    g.strokeStyle = "rgba(255, 240, 255, 0.45)";
    g.lineWidth = 1.1;
    g.stroke();
    if (withEyes) {
      // Two dark oval eyes (avatar energy) — drawn in cloud local space
      g.fillStyle = "rgba(28, 22, 40, 0.92)";
      g.beginPath();
      g.ellipse(-7, -2, 3.2, 5.2, 0, 0, Math.PI * 2);
      g.ellipse(7, -2, 3.2, 5.2, 0, 0, Math.PI * 2);
      g.fill();
      // tiny highlight
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.beginPath();
      g.ellipse(-6, -4, 1.1, 1.6, 0, 0, Math.PI * 2);
      g.ellipse(8, -4, 1.1, 1.6, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function frame(now) {
    if (state === "idle" || !ctx) {
      raf = 0;
      return;
    }
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // Scene: flip Y so puff is upside-down (weather toward Speak)
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(1, -1);

    var breath = 1 + 0.08 * Math.sin(t * 2.2);
    var driftB = Math.sin(t * 1.3) * 4;
    var driftF = Math.sin(t * 1.7 + 1) * -5;
    var tumble = state === "spin" ? t * 2.8 : state === "thunder" ? Math.sin(t * 18) * 0.12 : Math.sin(t * 1.1) * 0.15;

    if (state === "spin") {
      ctx.rotate(tumble);
    } else if (state === "thunder") {
      ctx.translate(Math.sin(t * 22) * 2.5, Math.cos(t * 19) * 1.5);
      ctx.rotate(tumble);
    } else {
      ctx.rotate(tumble);
    }

    // back / mid / front parallax — mid has eyes (avatar); Y-flip makes busy UPSIDE-DOWN
    drawCloudBody(ctx, driftB * 0.6, 3, 1.18 * breath, 0.4, false);
    drawCloudBody(ctx, 0, 0, 1.05 * breath, 0.98, true);
    drawCloudBody(ctx, driftF * 0.5, -3, 0.78 * breath, 0.5, false);

    // rain (drawn in flipped space so it falls "up" on screen toward chrome)
    if (state === "rain" || state === "thunder" || state === "spin") {
      ctx.strokeStyle = "rgba(170,210,255,0.95)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        var yy = (d.y + (t * 40 * d.spd + d.ph * 10)) % 36;
        var x = d.x - W / 2;
        var y = yy - 8;
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 3 + d.ph));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 2, y + d.len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // thunder bolt + sparks
    if (state === "thunder" || (state === "spin" && Math.sin(t * 8) > 0.7)) {
      var flash = (Math.sin(t * 25) > 0) ? 1 : 0.15;
      ctx.globalAlpha = flash;
      ctx.strokeStyle = "#cfefff";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.lineTo(-4, 4);
      ctx.lineTo(2, 4);
      ctx.lineTo(-6, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(8, 6);
      ctx.lineTo(12, 6);
      ctx.lineTo(6, 14);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (state === "think" || state === "spin" || state === "thunder") {
      for (var s = 0; s < sparks.length; s++) {
        var sp = sparks[s];
        var a = 0.2 + 0.8 * Math.abs(Math.sin(t * 5 + sp.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#dff";
        ctx.beginPath();
        ctx.arc(sp.x - W / 2 + Math.sin(t * 2 + sp.ph) * 3, sp.y - H / 2, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (raf) return;
    t0 = 0;
    seedWeather();
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (ctx) ctx.clearRect(0, 0, W, H);
  }

  function setState(next) {
    var el = ensureDom();
    state = next || "idle";
    el.className = "ya-cloud-mark " + state;
    el.hidden = state === "idle";
    el.setAttribute("data-state", state);
    if (state === "idle") stopLoop();
    else startLoop();
  }

  function show(mode) {
    clearTimeout(timer);
    var m = mode || "spin";
    if (m === "loading") m = "spin";
    if (m === "thinking") m = "think";
    if (m === "searching") m = "rain";
    if (m === "buffering") m = "thunder";
    if (["spin", "think", "rain", "thunder"].indexOf(m) < 0) m = "spin";
    setState(m);
  }

  function hide() {
    clearTimeout(timer);
    timer = setTimeout(function () { setState("idle"); }, 180);
  }

  function cycleBusy(kind) {
    if (kind === "search" || kind === "lookup") show("rain");
    else if (kind === "compass" || kind === "race") show("thunder");
    else if (kind === "llama" || kind === "ensure") show("think");
    else show("spin");
  }

  function hookThink() {
    try {
      if (typeof window.showThink === "function" && !window.showThink.__yaCloud) {
        var origShow = window.showThink;
        var wrappedShow = function () {
          try { show("think"); } catch (e) {}
          return origShow.apply(this, arguments);
        };
        wrappedShow.__yaCloud = true;
        window.showThink = wrappedShow;
      }
      if (typeof window.hideThink === "function" && !window.hideThink.__yaCloud) {
        var origHide = window.hideThink;
        var wrappedHide = function () {
          try { hide(); } catch (e) {}
          return origHide.apply(this, arguments);
        };
        wrappedHide.__yaCloud = true;
        window.hideThink = wrappedHide;
      }
    } catch (e) {}
  }

  function hookAnswer() {
    try {
      if (typeof window.answer === "function" && !window.answer.__yaCloud) {
        var orig = window.answer;
        var wrapped = async function () {
          try { cycleBusy("spin"); } catch (e) {}
          try { return await orig.apply(this, arguments); }
          finally { try { hide(); } catch (e2) {} }
        };
        wrapped.__yaCloud = true;
        window.answer = wrapped;
      }
    } catch (e) {}
    try {
      if (typeof window.ensureLlama === "function" && !window.ensureLlama.__yaCloud) {
        var el0 = window.ensureLlama;
        var wel = function () {
          try { cycleBusy("llama"); } catch (e) {}
          try { return el0.apply(this, arguments); }
          finally { try { hide(); } catch (e2) {} }
        };
        wel.__yaCloud = true;
        window.ensureLlama = wel;
      }
    } catch (e3) {}
    try {
      if (typeof window.lookUpAndKeep === "function" && !window.lookUpAndKeep.__yaCloud) {
        var lu = window.lookUpAndKeep;
        var wlu = async function () {
          try { cycleBusy("search"); } catch (e) {}
          try { return await lu.apply(this, arguments); }
          finally { try { hide(); } catch (e2) {} }
        };
        wlu.__yaCloud = true;
        window.lookUpAndKeep = wlu;
      }
    } catch (e4) {}
    try {
      if (typeof window.yaRunCompassRace === "function" && !window.yaRunCompassRace.__yaCloud) {
        var rc = window.yaRunCompassRace;
        var wrc = function () {
          try { cycleBusy("compass"); } catch (e) {}
          var p = rc.apply(this, arguments);
          if (p && typeof p.then === "function") {
            return p.then(function (v) { try { hide(); } catch (e) {} return v; },
              function (err) { try { hide(); } catch (e) {} throw err; });
          }
          try { hide(); } catch (e2) {}
          return p;
        };
        wrc.__yaCloud = true;
        window.yaRunCompassRace = wrc;
      }
    } catch (e5) {}
  }

  if (typeof window !== "undefined") {
    window.yaCloudShow = show;
    window.yaCloudHide = hide;
    window.yaCloudCycle = cycleBusy;
    window.yaCloudState = function () { return state; };
  }

  function boot() {
    ensureDom();
    setState("idle");
    hookThink();
    hookAnswer();
    setTimeout(hookThink, 400);
    setTimeout(hookAnswer, 500);
    setTimeout(hookAnswer, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  try {
    if (typeof console !== "undefined") console.log("[ya-cloud-mark] purple avatar cloud · eyes · upside-down busy · tumble/rain/thunder");
  } catch (e) {}
})();
