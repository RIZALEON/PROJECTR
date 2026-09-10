/*! ya-cloud-mark.js — Rizalbot model cloud workmark (iOS canvas)
 * Purple fluffy body · glowing white eyes · red horns · bat wings · lightning
 * Busy = UPSIDE-DOWN + tumble/rain/thunder. Idle quiet. Offline. Speak chrome.
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
  var W = 140;
  var H = 96;

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
      '<canvas class="ya-cloud-canvas" width="140" height="96"></canvas>' +
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
    for (i = 0; i < 16; i++) {
      drops.push({
        x: 30 + Math.random() * 80,
        y: Math.random() * 30,
        len: 7 + Math.random() * 11,
        spd: 1 + Math.random() * 1.8,
        ph: Math.random() * 10
      });
    }
    for (i = 0; i < 12; i++) {
      sparks.push({
        x: 40 + Math.random() * 60,
        y: 25 + Math.random() * 35,
        r: 0.7 + Math.random() * 1.8,
        ph: Math.random() * 6,
        hue: Math.random() > 0.5 ? "#d9a0ff" : "#7ef"
      });
    }
  }

  /** Draw one fluffy lobe */
  function lobe(g, x, y, rx, ry) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  }

  /** Model Rizalbot cloud character (right-side-up local space; scene flips for busy) */
  function drawCharacter(g, ox, oy, sc, alpha) {
    g.save();
    g.translate(ox, oy);
    g.scale(sc, sc);
    g.globalAlpha = alpha;

    // Wings (behind body)
    g.fillStyle = "rgba(90, 55, 140, 0.92)";
    g.beginPath();
    g.moveTo(-22, 2);
    g.quadraticCurveTo(-48, -18, -52, 8);
    g.quadraticCurveTo(-40, 6, -28, 12);
    g.quadraticCurveTo(-38, 0, -22, 2);
    g.fill();
    g.beginPath();
    g.moveTo(22, 2);
    g.quadraticCurveTo(48, -18, 52, 8);
    g.quadraticCurveTo(40, 6, 28, 12);
    g.quadraticCurveTo(38, 0, 22, 2);
    g.fill();

    // Purple fluffy body — layered lobes with highlight gradient feel
    var bodyGrad = g.createRadialGradient(-4, -8, 4, 0, 2, 34);
    bodyGrad.addColorStop(0, "#e8d4ff");
    bodyGrad.addColorStop(0.35, "#c49aef");
    bodyGrad.addColorStop(0.75, "#9b6ad4");
    bodyGrad.addColorStop(1, "#6a3fa0");
    g.fillStyle = bodyGrad;
    lobe(g, 0, 4, 28, 18);
    lobe(g, -18, 2, 16, 14);
    lobe(g, 18, 2, 16, 14);
    lobe(g, -10, -10, 14, 12);
    lobe(g, 12, -11, 13, 12);
    lobe(g, 0, -15, 12, 11);
    // soft rim
    g.strokeStyle = "rgba(255, 235, 255, 0.35)";
    g.lineWidth = 1.2;
    g.beginPath();
    g.ellipse(0, 2, 27, 17, 0, 0, Math.PI * 2);
    g.stroke();

    // Red horns
    g.fillStyle = "#e23b4a";
    g.beginPath();
    g.moveTo(-8, -18);
    g.quadraticCurveTo(-14, -32, -4, -28);
    g.quadraticCurveTo(-6, -22, -8, -18);
    g.fill();
    g.beginPath();
    g.moveTo(8, -18);
    g.quadraticCurveTo(14, -32, 4, -28);
    g.quadraticCurveTo(6, -22, 8, -18);
    g.fill();
    // horn tips brighter
    g.fillStyle = "#ff6b7a";
    g.beginPath();
    g.ellipse(-7, -27, 2.2, 2.8, -0.4, 0, Math.PI * 2);
    g.ellipse(7, -27, 2.2, 2.8, 0.4, 0, Math.PI * 2);
    g.fill();

    // Glowing white slanted pill eyes (model / flat logo energy)
    g.save();
    g.shadowColor = "rgba(255,255,255,0.85)";
    g.shadowBlur = 8;
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.ellipse(-6.5, -1, 3.4, 6.2, -0.35, 0, Math.PI * 2);
    g.ellipse(6.5, -1, 3.4, 6.2, 0.35, 0, Math.PI * 2);
    g.fill();
    g.restore();
    // optional pupils (cute variant) — small for busy energy
    g.fillStyle = "rgba(20, 12, 35, 0.55)";
    g.beginPath();
    g.ellipse(-6.2, 0.5, 1.1, 2.2, -0.35, 0, Math.PI * 2);
    g.ellipse(6.8, 0.5, 1.1, 2.2, 0.35, 0, Math.PI * 2);
    g.fill();

    // tiny frown (cute model)
    g.strokeStyle = "rgba(40, 25, 60, 0.55)";
    g.lineWidth = 1.1;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(-3, 8);
    g.quadraticCurveTo(0, 6, 3, 8);
    g.stroke();

    // lightning bolt accents at wing roots
    g.fillStyle = "#d8a0ff";
    g.beginPath();
    g.moveTo(-24, 6);
    g.lineTo(-28, 12);
    g.lineTo(-25, 12);
    g.lineTo(-30, 20);
    g.lineTo(-22, 11);
    g.lineTo(-25, 11);
    g.closePath();
    g.fill();
    g.fillStyle = "#7ef0ff";
    g.beginPath();
    g.moveTo(24, 6);
    g.lineTo(28, 12);
    g.lineTo(25, 12);
    g.lineTo(30, 20);
    g.lineTo(22, 11);
    g.lineTo(25, 11);
    g.closePath();
    g.fill();

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

    ctx.save();
    ctx.translate(W / 2, H / 2 + 4);
    // Busy: UPSIDE-DOWN (avatar is right-side-up in Settings)
    ctx.scale(1, -1);

    var breath = 1 + 0.07 * Math.sin(t * 2.4);
    var driftB = Math.sin(t * 1.2) * 3;
    var driftF = Math.sin(t * 1.6 + 1.2) * -4;
    var tumble =
      state === "spin" ? t * 2.6 :
      state === "thunder" ? Math.sin(t * 16) * 0.14 :
      Math.sin(t * 1.15) * 0.12;

    if (state === "spin") ctx.rotate(tumble);
    else if (state === "thunder") {
      ctx.translate(Math.sin(t * 20) * 2.8, Math.cos(t * 17) * 1.6);
      ctx.rotate(tumble);
    } else {
      ctx.rotate(tumble);
    }

    // parallax shadow body + main character + front puff hint
    drawCharacter(ctx, driftB * 0.5, 4, 0.92 * breath, 0.35);
    drawCharacter(ctx, 0, 0, 1.05 * breath, 1);
    // front highlight lobe only
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(driftF * 0.4, -4);
    ctx.scale(0.72 * breath, 0.72 * breath);
    var hg = ctx.createRadialGradient(0, -6, 2, 0, 0, 16);
    hg.addColorStop(0, "rgba(255,245,255,0.7)");
    hg.addColorStop(1, "rgba(180,140,230,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(0, -2, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // rain streaks (toward Speak chrome after flip)
    if (state === "rain" || state === "thunder" || state === "spin") {
      ctx.strokeStyle = "rgba(200, 170, 255, 0.95)";
      ctx.lineWidth = 1.7;
      ctx.lineCap = "round";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        var yy = (d.y + (t * 42 * d.spd + d.ph * 10)) % 40;
        var x = d.x - W / 2;
        var y = yy - 10;
        ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 3.2 + d.ph));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 2.2, y + d.len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // thunder bolts around character
    if (state === "thunder" || (state === "spin" && Math.sin(t * 7) > 0.65)) {
      var flash = Math.sin(t * 22) > 0 ? 1 : 0.2;
      ctx.globalAlpha = flash;
      ctx.strokeStyle = "#e0b0ff";
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(-8, -28);
      ctx.lineTo(-14, -14);
      ctx.lineTo(-8, -14);
      ctx.lineTo(-18, 2);
      ctx.stroke();
      ctx.strokeStyle = "#7ef8ff";
      ctx.beginPath();
      ctx.moveTo(10, -26);
      ctx.lineTo(16, -12);
      ctx.lineTo(10, -12);
      ctx.lineTo(20, 4);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (state === "think" || state === "spin" || state === "thunder") {
      for (var s = 0; s < sparks.length; s++) {
        var sp = sparks[s];
        ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t * 5.5 + sp.ph));
        ctx.fillStyle = sp.hue;
        ctx.beginPath();
        ctx.arc(
          sp.x - W / 2 + Math.sin(t * 2.2 + sp.ph) * 4,
          sp.y - H / 2,
          sp.r,
          0,
          Math.PI * 2
        );
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
    if (typeof console !== "undefined") console.log("[ya-cloud-mark] model Rizalbot cloud · horns/wings/eyes · upside-down busy");
  } catch (e) {}
})();
