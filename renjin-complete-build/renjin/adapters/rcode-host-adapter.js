// rcode-host-adapter.js — the direct adapter between the RENJIN core
// (YaSeed / yaseed-core-v3) and the RCODE host app (Xcode-built, iOS/macOS).
// 🫈 Providence & Provenance 🦇 — RZL CITATION: Prof. Marcum, C.A., III (26, Nov 19),
// .RZL AI CRYPTOBOT ENJIN MODEL, RIZAL.PW, MAPS TECH Series, Aetaneo Rizal. Chase Rizal.
//
// The core's detectHost() prefers an injected globalThis.YASEED_HOST over
// its safe stub (see yaseed-core-v3.js, "Host-adapter contract"). This
// adapter implements that contract for RCODE:
//
//   hostId    'rcode-ios' | 'rcode-macos' | 'rcode-mock' (tests)
//   platform  'ios' | 'macos'
//   getYaId() asks the NATIVE side for the public ЯID (RCODE answers from
//             its own store; keys never cross this bridge — the adapter
//             carries public identifiers and messages only)
//   bridge    promise-based call(method, args) into the native side via
//             WKWebView's message handler ('yaseedHost'), or an injected
//             native bridge object in tests / other hosts
//   storage   null — the core falls back to its own IDBStore/MemoryStore
//   releaseSha256  unset here; the native updater may set it after it has
//             verified an RTOR update (the core reads it at release check)
//
// Usage in RCODE's webview (after RCodeHostBridge.swift injects this file
// at document start, before the core):
//   RCodeHostAdapter.install();            // sets globalThis.YASEED_HOST
// In Node / tests:
//   const host = RCodeHostAdapter.createRCodeHostAdapter(mockBridge);
//   globalThis.YASEED_HOST = host;
(function (global) {
  'use strict';

  function webkitBridge() {
    // WKScriptMessageHandlerWithReply (RCodeHostBridge.swift): in JS,
    // messageHandlers.yaseedHost.postMessage({method, args}) returns a
    // Promise that resolves with the native reply. Wrap it in the
    // bridge.call(method, args) shape the adapter speaks everywhere.
    try {
      var h = global.webkit && global.webkit.messageHandlers && global.webkit.messageHandlers.yaseedHost;
      if (!h || typeof h.postMessage !== 'function') return null;
      return { call: function (method, args) { return h.postMessage({ method: method, args: args || {} }); } };
    } catch (e) {}
    return null;
  }

  // A native bridge is any object with call(method, args) -> Promise.
  // The Swift side (RCodeHostBridge.swift) exposes exactly that through
  // WKScriptMessageHandlerWithReply; tests inject a mock with the same shape.
  function createRCodeHostAdapter(nativeBridge, opts) {
    opts = opts || {};
    var bridge = nativeBridge || webkitBridge();
    var platform = opts.platform || (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent || '') ? 'ios' : 'macos');
    var host = {
      hostId: opts.hostId || (bridge && bridge.__mock ? 'rcode-mock' : 'rcode-' + platform),
      platform: platform,
      bridge: bridge,
      storage: null,
      getYaId: async function () {
        if (!bridge) return null;
        try { var r = await bridge.call('getYaId', {}); return (r && r.yaId) || null; } catch (e) { return null; }
      },
      // Direct line to the native side (Xcode agent host): build requests,
      // file picks, share sheets — whatever RCODE exposes. Refuses cleanly
      // when no native side is attached; never fakes a result.
      callNative: async function (method, args) {
        if (!bridge) throw new Error('rcode adapter: no native bridge attached (not running inside RCODE)');
        return bridge.call(method, args || {});
      }
    };
    return host;
  }

  function install(nativeBridge, opts) {
    var host = createRCodeHostAdapter(nativeBridge, opts);
    global.YASEED_HOST = host;
    return host;
  }

  var api = { createRCodeHostAdapter: createRCodeHostAdapter, install: install };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.RCodeHostAdapter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
