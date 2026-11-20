// rcode-bridge-plugin.js — the direct RENJIN core plugin for the
// RCODE / Xcode agent host. Registered through the core's own
// registerPlugin(): selftest first, then a device-signed descriptor on
// the Ghost Chain (plugin.register) and a plugins:list store entry —
// the same admission path as the founding plugin. Bots never sign for
// the owner; the device signature here is the model's own plugin scope
// ('yaseed.model-plugin'), exactly as the core defines it.
// 🫈 Providence & Provenance 🦇 — RZL CITATION: Prof. Marcum, C.A., III (26, Nov 19),
// .RZL AI CRYPTOBOT ENJIN MODEL, RIZAL.PW, MAPS TECH Series, Aetaneo Rizal. Chase Rizal.
(function (global) {
  'use strict';

  function adapterApi() {
    if (typeof module !== 'undefined' && typeof require === 'function') {
      try { return require('./rcode-host-adapter.js'); } catch (e) {}
    }
    return global.RCodeHostAdapter || null;
  }

  var RCodeBridgePlugin = {
    id: 'rcode-bridge',
    version: '0.1.0',
    description: 'Direct bridge to the RCODE host app (Xcode-built, iOS/macOS): host detect, public ЯID lookup, and a promise-based native call channel. Carries public identifiers and messages only — keys never cross the bridge.',
    create: function (eng) {
      var host = (typeof global.YASEED_HOST !== 'undefined' && global.YASEED_HOST) || null;
      return {
        engine: eng,
        host: host,
        installed: !!host,
        hostId: host ? host.hostId : null,
        getYaId: async function () { return host && host.getYaId ? host.getYaId() : null; },
        callNative: async function (method, args) {
          if (!host || typeof host.callNative !== 'function') throw new Error('rcode-bridge: no RCODE host attached');
          return host.callNative(method, args);
        }
      };
    },
    selftest: function (api) {
      var A = adapterApi();
      if (!api.assert(!!A, 'rcode host adapter module present')) return false;
      var mock = { __mock: true, call: async function (m) { return m === 'getYaId' ? { yaId: 'RID-SELFTEST' } : { ok: true }; } };
      var host = A.createRCodeHostAdapter(mock, { platform: 'ios' });
      if (!api.assert(host.hostId === 'rcode-mock', 'adapter builds an rcode host')) return false;
      return api.assert(typeof host.getYaId === 'function' && typeof host.callNative === 'function', 'adapter exposes getYaId + callNative');
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = RCodeBridgePlugin;
  global.RCodeBridgePlugin = RCodeBridgePlugin;
})(typeof globalThis !== 'undefined' ? globalThis : this);
