/*! ya-cloud-mark.js — upside-down offline CSS/SVG cloud workmark under Speak-to-Rizalbot
 * States while busy: spin · think · rain · thunder (loading/thinking/searching/buffering)
 * No network assets. Dark Я aesthetic. Does not block send.
 */
(function () {
  "use strict";

  var ROOT_ID = "ya-cloud-mark";
  var state = "idle"; // idle | spin | think | rain | thunder
  var timer = 0;

  function ensureDom() {
    var el = document.getElementById(ROOT_ID);
    if (el) return el;
    var host = document.querySelector("form.composer") || document.body;
    el = document.createElement("div");
    el.id = ROOT_ID;
    el.className = "ya-cloud-mark idle";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<svg class="ya-cloud-svg" viewBox="0 0 80 52" width="72" height="48" focusable="false" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="yaCloudGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(220,235,255,0.55)"/>' +
      '<stop offset="55%" stop-color="rgba(140,180,255,0.28)"/>' +
      '<stop offset="100%" stop-color="rgba(60,90,140,0.35)"/>' +
      '</linearGradient>' +
      '<filter id="yaCloudGlow" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur stdDeviation="1.4" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '</defs>' +
      '<g class="ya-cloud-scene">' +
      '<g class="ya-cloud-flip">' +
      '<g class="ya-cloud-layer ya-cloud-back">' +
      '<ellipse cx="28" cy="28" rx="16" ry="10"/>' +
      '<ellipse cx="42" cy="30" rx="14" ry="9"/>' +
      '</g>' +
      '<g class="ya-cloud-layer ya-cloud-mid">' +
      '<path class="ya-cloud-body" d="M18 30c-7 0-12-5-12-11s6-11 13-10c2-6 8-10 14-10 8 0 14 6 15 13 6 1 10 6 10 12 0 7-6 12-13 12H18z" fill="url(#yaCloudGrad)" filter="url(#yaCloudGlow)"/>' +
      '</g>' +
      '<g class="ya-cloud-layer ya-cloud-front">' +
      '<ellipse cx="34" cy="34" rx="11" ry="7"/>' +
      '<ellipse cx="48" cy="33" rx="9" ry="6"/>' +
      '</g>' +
      '<g class="ya-cloud-rain">' +
      '<line class="d1" x1="24" y1="6" x2="21" y2="16"/>' +
      '<line class="d2" x1="32" y1="3" x2="29" y2="15"/>' +
      '<line class="d3" x1="40" y1="5" x2="37" y2="17"/>' +
      '<line class="d1" x1="48" y1="4" x2="45" y2="14"/>' +
      '<line class="d2" x1="56" y1="7" x2="53" y2="16"/>' +
      '</g>' +
      '<g class="ya-cloud-bolt">' +
      '<polyline points="42,6 35,16 40,16 32,28"/>' +
      '<polyline class="bolt2" points="50,8 46,14 49,14 44,22"/>' +
      '</g>' +
      '<g class="ya-cloud-spark">' +
      '<circle cx="26" cy="22" r="1.2"/><circle cx="54" cy="24" r="1"/><circle cx="40" cy="18" r="0.9"/>' +
      '</g>' +
      '</g></g></svg>';
    // Sit just above the composer (bottom chrome) — upside-down cloud = flip via CSS
    if (host && host.parentNode) {
      host.parentNode.insertBefore(el, host);
    } else {
      document.body.appendChild(el);
    }
    return el;
  }

  function setState(next) {
    var el = ensureDom();
    state = next || "idle";
    el.className = "ya-cloud-mark " + state;
    el.hidden = state === "idle";
    el.setAttribute("data-state", state);
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
    timer = setTimeout(function () { setState("idle"); }, 120);
  }

  function cycleBusy(kind) {
    // Map app busy contexts → animation
    if (kind === "search" || kind === "lookup") show("rain");
    else if (kind === "compass" || kind === "race") show("thunder");
    else if (kind === "llama" || kind === "ensure") show("think");
    else show("spin");
  }

  // Wrap showThink / hideThink without breaking callers
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

  // Patch answer busy / ensureLlama / search / compass if present later
  function hookAnswer() {
    try {
      if (typeof window.answer === "function" && !window.answer.__yaCloud) {
        var orig = window.answer;
        var wrapped = async function () {
          try { cycleBusy("spin"); } catch (e) {}
          try {
            return await orig.apply(this, arguments);
          } finally {
            try { hide(); } catch (e2) {}
          }
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
    // Re-hook after late script seats (compass / llama)
    setTimeout(hookThink, 400);
    setTimeout(hookAnswer, 500);
    setTimeout(hookAnswer, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-cloud-mark] 3D upside-down cloud · spin/think/rain/thunder");
  } catch (e) {}
})();
