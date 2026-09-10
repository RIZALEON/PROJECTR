/*! ya-cloud-mark.js — electrified Rizalbot model workmark (iOS canvas)
 * Purple fluff · eyes · horns · wings · mouth/fangs · expressions
 * Busy UPSIDE-DOWN: spin=vortex tumble · think=yellow bolt · rain · thunderbolts+sparks
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
  var W = 150;
  var H = 110;

  function ensureDom() {
    var el = document.getElementById(ROOT_ID);
    if (el) {
      canvas = el.querySelector("canvas");
      if (canvas) {
        canvas.width = W;
        canvas.height = H;
        ctx = canvas.getContext("2d");
      }
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
      '<canvas class="ya-cloud-canvas" width="150" height="110"></canvas>' +
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
    for (i = 0; i < 18; i++) {
      drops.push({ x: 35 + Math.random() * 80, y: Math.random() * 36, len: 7 + Math.random() * 12, spd: 1 + Math.random() * 2, ph: Math.random() * 10 });
    }
    for (i = 0; i < 16; i++) {
      sparks.push({
        x: 40 + Math.random() * 70,
        y: 30 + Math.random() * 40,
        r: 0.6 + Math.random() * 2,
        ph: Math.random() * 6,
        hue: Math.random() > 0.45 ? "#e0a0ff" : (Math.random() > 0.5 ? "#7ef8ff" : "#ffc86b")
      });
    }
  }

  function lobe(g, x, y, rx, ry) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  }

  /** face: calm | think | fierce | grin */
  function drawFace(g, face) {
    // Eyes — glowing white ovals; slant by mood
    var slant = face === "fierce" ? 0.45 : face === "think" ? 0.15 : face === "grin" ? 0.25 : 0.35;
    g.save();
    g.shadowColor = "rgba(255,255,255,0.9)";
    g.shadowBlur = 10;
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.ellipse(-7, face === "think" ? -3 : -1, 3.6, 6.4, -slant, 0, Math.PI * 2);
    g.ellipse(7, face === "think" ? -3 : -1, 3.6, 6.4, slant, 0, Math.PI * 2);
    g.fill();
    g.restore();

    if (face === "think") {
      // look up toward think-bolt
      g.fillStyle = "rgba(40, 20, 70, 0.5)";
      g.beginPath();
      g.ellipse(-7, -5, 1.2, 2, -slant, 0, Math.PI * 2);
      g.ellipse(7, -5, 1.2, 2, slant, 0, Math.PI * 2);
      g.fill();
      // brows worried
      g.strokeStyle = "rgba(50, 30, 80, 0.7)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(-12, -10);
      g.quadraticCurveTo(-7, -12, -2, -9);
      g.moveTo(12, -10);
      g.quadraticCurveTo(7, -12, 2, -9);
      g.stroke();
      // small frown
      g.beginPath();
      g.moveTo(-3, 7);
      g.quadraticCurveTo(0, 5, 3, 7);
      g.stroke();
      // tiny fangs
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(-3, 7); g.lineTo(-1.5, 11); g.lineTo(0, 7);
      g.moveTo(3, 7); g.lineTo(1.5, 11); g.lineTo(0, 7);
      g.fill();
    } else if (face === "fierce") {
      // angry brow ridge
      g.fillStyle = "rgba(40, 15, 70, 0.55)";
      g.beginPath();
      g.moveTo(-14, -9);
      g.lineTo(-2, -6);
      g.lineTo(-14, -4);
      g.closePath();
      g.moveTo(14, -9);
      g.lineTo(2, -6);
      g.lineTo(14, -4);
      g.closePath();
      g.fill();
      // open mouth + fangs
      g.fillStyle = "#1a0a28";
      g.beginPath();
      g.ellipse(0, 10, 9, 6, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(-5, 6); g.lineTo(-3, 13); g.lineTo(-1, 6);
      g.moveTo(5, 6); g.lineTo(3, 13); g.lineTo(1, 6);
      g.moveTo(-2, 14); g.lineTo(0, 18); g.lineTo(2, 14);
      g.fill();
    } else if (face === "grin") {
      g.fillStyle = "#1a0a28";
      g.beginPath();
      g.ellipse(0, 9, 10, 5.5, 0, 0.15, Math.PI - 0.15);
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(-4, 7); g.lineTo(-2.5, 12); g.lineTo(-1, 7);
      g.moveTo(4, 7); g.lineTo(2.5, 12); g.lineTo(1, 7);
      g.fill();
    } else {
      // calm slight frown
      g.strokeStyle = "rgba(40, 25, 60, 0.5)";
      g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(-3, 8);
      g.quadraticCurveTo(0, 6.5, 3, 8);
      g.stroke();
    }
  }

  function drawVortex(g, t) {
    g.save();
    g.translate(0, 22);
    for (var i = 5; i >= 1; i--) {
      g.strokeStyle = i % 2 ? "rgba(160, 80, 255, 0.45)" : "rgba(80, 200, 255, 0.4)";
      g.lineWidth = 2;
      g.beginPath();
      var r = 6 + i * 5;
      g.ellipse(0, i * 2.2, r * (0.55 + 0.08 * Math.sin(t * 6 + i)), r * 0.35, t * 2.5, 0, Math.PI * 2);
      g.stroke();
    }
    // electric ring
    g.strokeStyle = "rgba(120, 240, 255, 0.85)";
    g.lineWidth = 2.2;
    g.beginPath();
    g.ellipse(0, 4, 18 + Math.sin(t * 8) * 2, 5, -t * 3, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }

  function drawThinkBolt(g, t) {
    g.save();
    g.translate(0, -36 + Math.sin(t * 3) * 1.5);
    g.shadowColor = "rgba(255, 220, 80, 0.9)";
    g.shadowBlur = 12;
    g.fillStyle = "#ffe566";
    g.beginPath();
    g.moveTo(2, -10);
    g.lineTo(-4, 0);
    g.lineTo(1, 0);
    g.lineTo(-3, 12);
    g.lineTo(6, -2);
    g.lineTo(1, -2);
    g.closePath();
    g.fill();
    g.restore();
  }

  function drawThunderbolts(g, t) {
    var flash = Math.sin(t * 20) > 0 ? 1 : 0.25;
    g.globalAlpha = flash;
    // magenta left
    g.strokeStyle = "#e070ff";
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(-20, 8);
    g.lineTo(-32, 22);
    g.lineTo(-24, 22);
    g.lineTo(-40, 40);
    g.stroke();
    // cyan right
    g.strokeStyle = "#6ef0ff";
    g.beginPath();
    g.moveTo(18, 6);
    g.lineTo(30, 20);
    g.lineTo(22, 20);
    g.lineTo(38, 38);
    g.stroke();
    // top strikes
    g.strokeStyle = "#d9a0ff";
    g.beginPath();
    g.moveTo(-6, -30);
    g.lineTo(-16, -12);
    g.lineTo(-8, -12);
    g.lineTo(-20, 4);
    g.stroke();
    g.globalAlpha = 1;
  }

  function drawCharacter(g, ox, oy, sc, alpha, face) {
    g.save();
    g.translate(ox, oy);
    g.scale(sc, sc);
    g.globalAlpha = alpha;

    // Wings
    g.fillStyle = "rgba(85, 45, 130, 0.95)";
    g.beginPath();
    g.moveTo(-22, 2);
    g.quadraticCurveTo(-52, -20, -56, 10);
    g.quadraticCurveTo(-42, 8, -30, 14);
    g.quadraticCurveTo(-42, -2, -22, 2);
    g.fill();
    g.beginPath();
    g.moveTo(22, 2);
    g.quadraticCurveTo(52, -20, 56, 10);
    g.quadraticCurveTo(42, 8, 30, 14);
    g.quadraticCurveTo(42, -2, 22, 2);
    g.fill();
    // wing membrane glow
    g.fillStyle = "rgba(220, 80, 200, 0.35)";
    g.beginPath();
    g.moveTo(-28, 0);
    g.quadraticCurveTo(-46, -10, -48, 6);
    g.quadraticCurveTo(-36, 4, -28, 0);
    g.fill();
    g.beginPath();
    g.moveTo(28, 0);
    g.quadraticCurveTo(46, -10, 48, 6);
    g.quadraticCurveTo(36, 4, 28, 0);
    g.fill();

    // Body fluff
    var bodyGrad = g.createRadialGradient(-4, -10, 4, 0, 2, 36);
    bodyGrad.addColorStop(0, "#edd8ff");
    bodyGrad.addColorStop(0.4, "#c090ef");
    bodyGrad.addColorStop(0.8, "#8b58c8");
    bodyGrad.addColorStop(1, "#5a2f96");
    g.fillStyle = bodyGrad;
    lobe(g, 0, 4, 28, 18);
    lobe(g, -18, 2, 16, 14);
    lobe(g, 18, 2, 16, 14);
    lobe(g, -10, -10, 14, 12);
    lobe(g, 12, -11, 13, 12);
    lobe(g, 0, -15, 12, 11);

    // Horns
    g.fillStyle = "#e23b4a";
    g.beginPath();
    g.moveTo(-8, -18);
    g.quadraticCurveTo(-15, -34, -3, -29);
    g.quadraticCurveTo(-6, -22, -8, -18);
    g.fill();
    g.beginPath();
    g.moveTo(8, -18);
    g.quadraticCurveTo(15, -34, 3, -29);
    g.quadraticCurveTo(6, -22, 8, -18);
    g.fill();
    g.fillStyle = "#ff6b7a";
    g.beginPath();
    g.ellipse(-7.5, -28, 2.3, 2.8, -0.45, 0, Math.PI * 2);
    g.ellipse(7.5, -28, 2.3, 2.8, 0.45, 0, Math.PI * 2);
    g.fill();

    drawFace(g, face || "calm");

    // wing-root bolt badges
    g.fillStyle = "#d8a0ff";
    g.beginPath();
    g.moveTo(-24, 5); g.lineTo(-28, 11); g.lineTo(-25, 11); g.lineTo(-30, 18); g.lineTo(-22, 10); g.lineTo(-25, 10);
    g.closePath();
    g.fill();
    g.fillStyle = "#7ef0ff";
    g.beginPath();
    g.moveTo(24, 5); g.lineTo(28, 11); g.lineTo(25, 11); g.lineTo(30, 18); g.lineTo(22, 10); g.lineTo(25, 10);
    g.closePath();
    g.fill();

    g.restore();
  }

  function faceForState() {
    if (state === "think") return "think";
    if (state === "thunder") return "fierce";
    if (state === "spin") return "grin";
    if (state === "rain") return "calm";
    return "calm";
  }

  function frame(now) {
    if (state === "idle" || !ctx) { raf = 0; return; }
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2 + 6);
    ctx.scale(1, -1); // busy UPSIDE-DOWN

    var breath = 1 + 0.07 * Math.sin(t * 2.5);
    var tumble =
      state === "spin" ? t * 2.8 :
      state === "thunder" ? Math.sin(t * 16) * 0.16 :
      Math.sin(t * 1.2) * 0.12;

    if (state === "spin") {
      drawVortex(ctx, t);
      ctx.rotate(tumble);
    } else if (state === "thunder") {
      ctx.translate(Math.sin(t * 21) * 3, Math.cos(t * 18) * 1.8);
      ctx.rotate(tumble);
    } else {
      ctx.rotate(tumble);
    }

    var face = faceForState();
    drawCharacter(ctx, Math.sin(t * 1.3) * 2, 0, 1.02 * breath, 1, face);

    if (state === "think") drawThinkBolt(ctx, t);
    if (state === "thunder" || state === "spin") drawThunderbolts(ctx, t);

    // rain
    if (state === "rain" || state === "thunder") {
      ctx.strokeStyle = "rgba(200, 170, 255, 0.95)";
      ctx.lineWidth = 1.7;
      ctx.lineCap = "round";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        var yy = (d.y + (t * 44 * d.spd + d.ph * 10)) % 42;
        ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 3.2 + d.ph));
        ctx.beginPath();
        ctx.moveTo(d.x - W / 2, yy - 12);
        ctx.lineTo(d.x - W / 2 - 2.2, yy - 12 + d.len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // sparks always when electrified states
    if (state !== "idle") {
      for (var s = 0; s < sparks.length; s++) {
        var sp = sparks[s];
        if (state === "rain" && s > 6) continue;
        ctx.globalAlpha = 0.2 + 0.8 * Math.abs(Math.sin(t * 6 + sp.ph));
        ctx.fillStyle = sp.hue;
        ctx.beginPath();
        ctx.arc(sp.x - W / 2 + Math.sin(t * 2.4 + sp.ph) * 5, sp.y - H / 2, sp.r, 0, Math.PI * 2);
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
        var wrappedShow = function () { try { show("think"); } catch (e) {} return origShow.apply(this, arguments); };
        wrappedShow.__yaCloud = true;
        window.showThink = wrappedShow;
      }
      if (typeof window.hideThink === "function" && !window.hideThink.__yaCloud) {
        var origHide = window.hideThink;
        var wrappedHide = function () { try { hide(); } catch (e) {} return origHide.apply(this, arguments); };
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


  function ensureJumpFab() {
    var btn = document.getElementById("ya-jump-bottom");
    if (btn) return btn;
    btn = document.createElement("button");
    btn.id = "ya-jump-bottom";
    btn.type = "button";
    btn.title = "Jump to bottom";
    btn.setAttribute("aria-label", "Jump to bottom of chat");
    btn.innerHTML = "↓";
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      var log = document.getElementById("log");
      if (log) {
        log.scrollTop = log.scrollHeight;
        try { log.scrollTo({ top: log.scrollHeight, behavior: "smooth" }); } catch (e) {}
      } else {
        try { window.scrollTo(0, document.body.scrollHeight); } catch (e2) {}
      }
    });
    document.body.appendChild(btn);
    return btn;
  }

  function hookComposerBusy() {
    try {
      var form = document.getElementById("composer") || document.querySelector("form.composer");
      if (form && !form.__yaCloud) {
        form.__yaCloud = true;
        form.addEventListener("submit", function () {
          try { cycleBusy("spin"); } catch (e) {}
        }, true);
      }
      var input = document.getElementById("input");
      if (input && !input.__yaCloudBusy) {
        input.__yaCloudBusy = true;
        // keep cloud alive while reply pending via answer hook
      }
    } catch (e) {}
  }

  function hookBusyExtras() {
    // webSearch / harvest / describeLink / interact feed when present
    var names = [
      ["webSearch", "search"],
      ["harvestOnline", "search"],
      ["describeLink", "search"],
      ["shareMindSession", "spin"],
      ["pingChief", "spin"],
      ["applyYaFeed", "spin"],
      ["refreshInteractFeed", "spin"]
    ];
    names.forEach(function (pair) {
      try {
        var fn = window[pair[0]];
        if (typeof fn !== "function" || fn.__yaCloud) return;
        var kind = pair[1];
        var wrapped = function () {
          try { cycleBusy(kind); } catch (e) {}
          var ret = fn.apply(this, arguments);
          if (ret && typeof ret.then === "function") {
            return ret.then(function (v) { try { hide(); } catch (e) {} return v; },
              function (err) { try { hide(); } catch (e) {} throw err; });
          }
          try { hide(); } catch (e2) {}
          return ret;
        };
        wrapped.__yaCloud = true;
        window[pair[0]] = wrapped;
      } catch (e) {}
    });
  }

  if (typeof window !== "undefined") {
    window.yaCloudShow = show;
    window.yaCloudHide = hide;
    window.yaCloudCycle = cycleBusy;
    window.yaCloudState = function () { return state; };
  }

  function boot() {
    ensureDom();
    ensureJumpFab();
    setState("idle");
    hookThink();
    hookAnswer();
    hookComposerBusy();
    hookBusyExtras();
    setTimeout(hookThink, 400);
    setTimeout(hookAnswer, 500);
    setTimeout(hookAnswer, 1500);
    setTimeout(hookBusyExtras, 800);
    setTimeout(hookBusyExtras, 2000);
    setTimeout(ensureJumpFab, 300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  try { console.log("[ya-cloud-mark] electrified · fangs/expressions · vortex/think-bolt/thunder"); } catch (e) {}
})();
