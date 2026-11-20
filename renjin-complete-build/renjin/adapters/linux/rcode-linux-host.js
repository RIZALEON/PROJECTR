// rcode-linux-host.js — the Linux host seat for the RCODE project.
// Built 2026-11-20 on Rizal's order: "A Linux seat for the RCODE project,
// published to GitHub + Meta." This is the RENJIN-engine side of that seat:
// the same YASEED_HOST contract the iOS/macOS RCODE adapter implements
// (see ../rcode-host-adapter.js), running on a Linux host instead of inside
// the Xcode-built RCODE app.
//
//   hostId    'rcode-linux'
//   platform  'linux'
//   getYaId() reads the PUBLIC ЯID only — from the RZL_YAID environment
//             variable, or from ~/.rzl/yaid.pub when present. No file is
//             created, no key is read, and null is returned when there is
//             nothing public to report.
//   bridge    a local Node bridge with an allowlist: 'getYaId' and
//             'hostInfo' only. Everything else is refused, fail-closed.
//   storage   null — the core falls back to its own store. On Linux the
//             seat boots from the FileStore (src/store-v3.json), the same
//             persistent store the persist build already proved.
//
// 🫈 Providence & Provenance 🦇 — RZL CITATION: Prof. Marcum, C.A., III (26, Nov 19),
// .RZL AI CRYPTOBOT ENJIN MODEL, RIZAL.PW, MAPS TECH Series, Aetaneo Rizal. Chase Rizal.
//
// Standing law on this bridge (same as the iOS/macOS adapter):
// - Keys never cross the bridge. No key material, no signatures on the
//   model's behalf. Signing stays the owner's act; bots never sign.
// - Fail-closed. No public id on file → getYaId returns null. An
//   unlisted native method → a plain refusal. Never fakes a result.
// - Updates still ride RTOR. This adapter is the runtime bridge, not an
//   update channel. The host may set YASEED_HOST.releaseSha256 only after
//   it has verified an RTOR update (the core reads it at release check).
//
// Usage in Node (from the renjin/ dir):
//   const LinuxHost = require('./adapters/linux/rcode-linux-host.js');
//   LinuxHost.install();                       // sets globalThis.YASEED_HOST
//   const host = LinuxHost.createLinuxHost();  // or with { yaId, bridge }
//   const eng = new Core.YaSeed({ store: new FileStore(STORE_FILE) });
//   await eng.boot();                          // detectHost() picks up rcode-linux
(function (global) {
  'use strict';

  var ALLOWED_METHODS = { getYaId: true, hostInfo: true };

  function readPublicYaId(opts) {
    opts = opts || {};
    if (opts.yaId) return String(opts.yaId);
    try {
      if (typeof process !== 'undefined' && process.env && process.env.RZL_YAID) {
        return String(process.env.RZL_YAID).trim() || null;
      }
    } catch (e) {}
    try {
      var fs = require('fs');
      var os = require('os');
      var p = require('path').join(os.homedir(), '.rzl', 'yaid.pub');
      if (fs.existsSync(p)) {
        var v = fs.readFileSync(p, 'utf8').trim().split(/\s+/)[0];
        return v || null;
      }
    } catch (e) {}
    return null;
  }

  function hostInfo() {
    var os = null;
    try { os = require('os'); } catch (e) {}
    return {
      hostId: 'rcode-linux',
      platform: 'linux',
      arch: os ? os.arch() : (typeof process !== 'undefined' ? process.arch : null),
      node: typeof process !== 'undefined' ? process.version : null,
      os: os ? (os.type() + ' ' + os.release()) : null,
      cwd: typeof process !== 'undefined' ? process.cwd() : null
    };
  }

  // A Linux bridge is any object with call(method, args) -> Promise.
  // The default local bridge answers the allowlist from this process and
  // refuses everything else. A caller may inject its own bridge (for
  // example a Meta-side host) as long as it keeps the same shape.
  function createLinuxBridge(opts) {
    opts = opts || {};
    var injected = opts.bridge || null;
    return {
      call: async function (method, args) {
        if (!ALLOWED_METHODS[method]) {
          throw new Error('rcode-linux: method refused by host allowlist: ' + method);
        }
        if (injected) return injected.call(method, args || {});
        if (method === 'getYaId') return { yaId: readPublicYaId(opts) };
        if (method === 'hostInfo') return hostInfo();
        throw new Error('rcode-linux: method refused by host allowlist: ' + method);
      }
    };
  }

  function createLinuxHost(opts) {
    opts = opts || {};
    var bridge = createLinuxBridge(opts);
    var host = {
      hostId: 'rcode-linux',
      platform: 'linux',
      bridge: bridge,
      storage: null,
      getYaId: async function () {
        try { var r = await bridge.call('getYaId', {}); return (r && r.yaId) || null; } catch (e) { return null; }
      },
      hostInfo: async function () {
        try { return await bridge.call('hostInfo', {}); } catch (e) { return hostInfo(); }
      },
      callNative: async function (method, args) {
        return bridge.call(method, args || {});
      }
    };
    return host;
  }

  function install(opts) {
    var host = createLinuxHost(opts);
    global.YASEED_HOST = host;
    return host;
  }

  var api = { createLinuxHost: createLinuxHost, createLinuxBridge: createLinuxBridge, install: install, hostInfo: hostInfo, ALLOWED_METHODS: Object.keys(ALLOWED_METHODS) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.RCodeLinuxHost = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
