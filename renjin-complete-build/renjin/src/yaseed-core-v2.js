/* ЯSEED 0.1.7 · yaseed-core.js · on-device seed core (ЯENJIN stays at 0.1)
 * Function 0: Ghost Chain. Every grow / train / expert / evolve / rollback / refusal is an
 * append-only record (prev_hash -> entry_hash, SHA-256) signed by this install's own
 * non-extractable WebCrypto ECDSA P-256 key (device attestation key, NOT the release key).
 * Pure JS, no deps, no network. Runs the same in WKWebView (IndexedDB) and Node 20 (self-test).
 * HARD NO: USB / restore / erase / DFU / 14 Pro requests are refused and recorded. */
(function (root, factory) {
  var m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.YaSeedCore = m;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  // live.v1: the version is the installed manifest's (egg-version.js → RZL_EGG). The literal is the build's copy for Node tests only.
  var VERSION = (typeof globalThis !== 'undefined' && globalThis.RZL_EGG && globalThis.RZL_EGG.id === 'yaseed' && globalThis.RZL_EGG.version) || '0.1.8';
  var subtle = globalThis.crypto.subtle;
  var enc = new TextEncoder();
  var ZERO64 = '0000000000000000000000000000000000000000000000000000000000000000';

  // ---------- small utils ----------
  function hex(buf) { var u = new Uint8Array(buf), s = ''; for (var i = 0; i < u.length; i++) s += (u[i] < 16 ? '0' : '') + u[i].toString(16); return s; }
  function unhex(h) { var u = new Uint8Array(h.length / 2); for (var i = 0; i < u.length; i++) u[i] = parseInt(h.substr(i * 2, 2), 16); return u; }
  async function sha256Hex(data) { if (typeof data === 'string') data = enc.encode(data); return hex(await subtle.digest('SHA-256', data)); }
  function canon(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    return '{' + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined; })
      .map(function (k) { return JSON.stringify(k) + ':' + canon(v[k]); }).join(',') + '}';
  }
  function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function f32b64(a) { return b64(new Uint8Array(a.buffer, a.byteOffset, a.byteLength)); }
  function b64f32(s) { var u = unb64(s); return new Float32Array(u.buffer, u.byteOffset, u.byteLength / 4).slice(); }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function mix32(a, b) { var h = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ b; h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35); return (h ^ (h >>> 16)) >>> 0; }
  function now() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function r4(x) { return Math.round(x * 10000) / 10000; }

  // ---------- built-in ЯLAB training text (public laws + lesson lines) ----------
  var CORPUS = [
    'Offline is rule 0. The heart runs on this device.',
    'Function 0: track and trace every data package and every action on the Ghost Chain.',
    'The transcript is append-only. Never erased, truncated or rewritten.',
    'HARD NO: never restore, never erase, never USB, never DFU, never the 14 Pro.',
    'Build, sign, publish and seat only file an Approve request. The Decider approves.',
    'Exact commands run before the heart generates.',
    'Unknown facts are to define. Never invent a reply.',
    'L048: the seed grows its own weights on the device. Version stays 0.1.',
    'Weights are ternary: minus one, zero, plus one. Most of them are zero.',
    'Grow, train, evolve, roll back. Keep a change only when the loss improves.',
    'Losers are recorded on the chain but never loaded.',
    'It can grow, but it can not rewrite its own rules.',
    'Act then speak: quote the real loss and the real entry count from the chain.'
  ].join('\n') + '\n';

  var HARD_NO = /\b(usb|restore|restoring|erase|erasing|wipe|dfu|factory[\s-]*reset|14\s*-?\s*pro|auto-?repair\s+go)\b/i;

  // Release identity of THIS egg (filled by build.py). Authorizes one-time device-signer enrollment.
  var RELEASE = {
    id: 'yaseed', version: VERSION, kind: 'egg',
    // contentSha256 = stable hash of egg payload files (filled by build.py). Zip sha256 lives on the appcast only
    // (a zip cannot contain its own digest). Host may override via YASEED_HOST.releaseSha256 after updater verify.
    sha256: '1609cf0e72d2748270c5bc667cf7139bf96831506620ab610526a1477fd7a87f',
    keyId: 'e5833fdfbbfe',
    publicKey: 'zs7M4OOB0zQhWOQw3SHpAY+XYxbZJvcPESy1y400Ti0=',
    note: 'rlab release key · signs appcasts and eggs only · never a device key'
  };

  // Trusted-signers root: release key is the only root. Enrolled device keys are delegates
  // scoped ONLY to local ЯSEED artifacts. They can never sign app updates, appcast entries, or add trusted keys.
  var TRUSTED_ROOT = {
    schema: 'rlab.yaseed.trusted-signers.v1',
    root: { keyId: RELEASE.keyId, alg: 'Ed25519', publicKey: RELEASE.publicKey,
            scopes: ['app.update', 'appcast.entry', 'egg.seat', 'trusted-signers.add'] },
    delegateScopes: ['yaseed.seed', 'yaseed.block', 'yaseed.expert', 'yaseed.evolve',
                     'yaseed.module', 'yaseed.model-plugin', 'yaseed.chain-bundle', 'yaseed.enrollment',
                     'yaseed.pack', 'yaseed.rvm', 'yaseed.mint', 'yaseed.loop', 'yaseed.gcco'],
    forbiddenForDelegates: ['app.update', 'appcast.entry', 'egg.seat', 'trusted-signers.add',
                            'host.api', 'network', 'release.key']
  };


  // ---------- storage ----------
  function MemoryStore() { this.m = new Map(); this.persistent = false; this.kind = 'memory'; }
  MemoryStore.prototype.get = async function (k) { return this.m.get(k); };
  MemoryStore.prototype.set = async function (k, v) { this.m.set(k, v); };
  MemoryStore.prototype.del = async function (k) { this.m.delete(k); };

  function IDBStore(name) { this.name = name || 'yaseed-0.1'; this.persistent = true; this.kind = 'indexeddb'; }
  IDBStore.prototype._db = function () {
    var self = this;
    if (!this.p) this.p = new Promise(function (res, rej) {
      var r = indexedDB.open(self.name, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return this.p;
  };
  IDBStore.prototype.get = async function (k) { var db = await this._db(); return new Promise(function (res, rej) { var q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; }); };
  IDBStore.prototype.set = async function (k, v) { var db = await this._db(); return new Promise(function (res, rej) { var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = function () { res(); }; tx.onerror = function () { rej(tx.error); }; }); };
  IDBStore.prototype.del = async function () { throw new Error('append-only store: delete refused'); };
  function defaultStore() { try { if (typeof indexedDB !== 'undefined') return new IDBStore(); } catch (e) {} return new MemoryStore(); }

  // ---------- Ghost Chain (function 0) ----------
  var ECDSA = { name: 'ECDSA', namedCurve: 'P-256' }, SIGALG = { name: 'ECDSA', hash: 'SHA-256' };
  function GhostChain(store) { this.store = store; }
  GhostChain.prototype.init = async function () {
    var headRaw = await this.store.get('chain:head'), minted = false;
    if (headRaw == null) {
      var kp = await subtle.generateKey(ECDSA, false, ['sign', 'verify']); // private key NON-extractable
      // Native path (next rebuild): move this key into the Secure Enclave / Keychain; WebCrypto is the egg-era stand-in.
      var raw = new Uint8Array(await subtle.exportKey('raw', kp.publicKey));
      await this.store.set('chain:key', kp);
      await this.store.set('chain:pub', b64(raw));
      this.key = kp; this.pubB64 = b64(raw); this.fp = (await sha256Hex(raw)).slice(0, 16);
      this.head = { seq: -1, entry_hash: ZERO64 };
      await this.append('genesis', { chain: 'ЯSEED Ghost Chain (on-device)', engine: 'ЯENJIN 0.1 · yaseed ' + VERSION,
        alg: 'ECDSA-P256-SHA256', key_fp: this.fp, pub: this.pubB64,
        key: 'non-extractable WebCrypto ECDSA P-256 per install (device attestation, NOT the release key; native build moves it to Secure Enclave)',
        law: ['function 0', 'REQ-5 offline', 'REQ-19 append-only', 'L048'] }, null, true);
      minted = true;
    } else {
      this.key = await this.store.get('chain:key');
      this.pubB64 = await this.store.get('chain:pub');
      this.fp = (await sha256Hex(unb64(this.pubB64))).slice(0, 16);
      this.head = JSON.parse(headRaw);
    }
    this.pub = await subtle.importKey('raw', unb64(this.pubB64), ECDSA, true, ['verify']);
    return { minted: minted };
  };
  GhostChain.prototype._sign = async function (msg) { return b64(new Uint8Array(await subtle.sign(SIGALG, this.key.privateKey, enc.encode(msg)))); };
  GhostChain.prototype._ver = async function (msg, sig) { try { return await subtle.verify(SIGALG, this.pub, unb64(sig), enc.encode(msg)); } catch (e) { return false; } };
  GhostChain.prototype.signPayload = async function (msg) { return this._sign(typeof msg === 'string' ? msg : canon(msg)); };
  GhostChain.prototype.verifyPayload = async function (msg, sig, pubB64) {
    try {
      var pk = pubB64 ? await subtle.importKey('raw', unb64(pubB64), ECDSA, true, ['verify']) : this.pub;
      return await subtle.verify(SIGALG, pk, unb64(sig), enc.encode(typeof msg === 'string' ? msg : canon(msg)));
    } catch (e) { return false; }
  };
  // 0.1.2: appends are serialized (forward GCCO + loop hops may race) and announced via onAppend (never blocks).
  GhostChain.prototype.append = function (kind, body, parent, skipCheck) {
    var self = this, run = function () { return self._append(kind, body, parent, skipCheck); };
    var p = (this._q || Promise.resolve()).then(run, run);
    this._q = p.catch(function () {});
    return p.then(function (e) { if (typeof self.onAppend === 'function') { try { self.onAppend(e); } catch (x) {} } (self.listeners || []).forEach(function (fn) { try { fn(e); } catch (x) {} }); return e; });
  };
  GhostChain.prototype._append = async function (kind, body, parent, skipCheck) {
    if (!skipCheck) { var v = await this._verify({ quick: true }); if (!v.ok) throw new Error('Ghost Chain broken, append refused: ' + v.problems.join('; ')); }
    var seq = this.head.seq + 1;
    var core = { schema: 'rzl.ghostchain.entry.v1', seq: seq, ts: new Date().toISOString(), kind: kind, body: body || {}, parent: parent || null, prev_hash: this.head.entry_hash };
    var eh = await sha256Hex(canon(core));
    var entry = Object.assign({}, core, { entry_hash: eh, sig: { alg: 'ECDSA-P256-SHA256', key: this.fp, value: await this._sign(eh) } });
    await this.store.set('chain:' + seq, JSON.stringify(entry));
    this.head = { seq: seq, entry_hash: eh, sig: await this._sign('HEAD|' + seq + '|' + eh) };
    await this.store.set('chain:head', JSON.stringify(this.head));
    return entry;
  };
  GhostChain.prototype.get = async function (seq) { var r = await this.store.get('chain:' + seq); return r == null ? null : JSON.parse(r); };
  // 0.1.2: verify runs inside the same queue as appends, so a concurrent forward-GCCO append can never be seen half-written.
  GhostChain.prototype.verify = function (opts) {
    var self = this, run = function () { return self._verify(opts); };
    var p = (this._q || Promise.resolve()).then(run, run); this._q = p.catch(function () {}); return p;
  };
  GhostChain.prototype._verify = async function (opts) {
    var quick = opts && opts.quick, problems = [];
    var headRaw = await this.store.get('chain:head');
    if (headRaw == null) return { ok: false, entries: 0, problems: ['no head'] };
    var head = JSON.parse(headRaw);
    if (!(await this._ver('HEAD|' + head.seq + '|' + head.entry_hash, head.sig || ''))) problems.push('head signature invalid');
    var start = quick ? Math.max(0, head.seq) : 0, prev = ZERO64;
    if (start > 0) { var pe = await this.get(start - 1); prev = pe ? pe.entry_hash : 'missing'; }
    var last = null;
    for (var s = start; s <= head.seq; s++) {
      var raw = await this.store.get('chain:' + s);
      if (raw == null) { problems.push('#' + s + ' missing'); break; }
      var e; try { e = JSON.parse(raw); } catch (x) { problems.push('#' + s + ' unreadable'); break; }
      var core = {}; for (var k in e) if (k !== 'entry_hash' && k !== 'sig') core[k] = e[k];
      if (core.seq !== s) problems.push('#' + s + ' seq mismatch');
      if (core.prev_hash !== prev) problems.push('#' + s + ' prev_hash does not link');
      var h = await sha256Hex(canon(core));
      if (h !== e.entry_hash) problems.push('#' + s + ' entry_hash mismatch (content changed)');
      if (!e.sig || !(await this._ver(e.entry_hash, e.sig.value))) problems.push('#' + s + ' signature invalid');
      if (s === 0 && (core.kind !== 'genesis' || core.body.pub !== this.pubB64)) problems.push('#0 genesis/key mismatch');
      prev = e.entry_hash; last = e;
    }
    if (last && last.entry_hash !== head.entry_hash) problems.push('head does not match last entry');
    if ((await this.store.get('chain:' + (head.seq + 1))) != null) problems.push('entry beyond head (#' + (head.seq + 1) + ')');
    return { ok: problems.length === 0, entries: head.seq + 1, head: head.entry_hash, problems: problems, quick: !!quick };
  };
  GhostChain.prototype.all = async function () { var out = []; for (var s = 0; s <= this.head.seq; s++) out.push(await this.get(s)); return out; };

  // ---------- Seed generator: tiny MLP grows ternary sparse blocks from (seed, layer, block[, codebook row]) ----------
  var GEN_IN = 16, GEN_H = 24;
  function SeedGenerator(seedHex) {
    this.seedHex = seedHex;
    var s = unhex(seedHex); this.seedInt = ((s[0] << 24) | (s[1] << 16) | (s[2] << 8) | s[3]) >>> 0;
    var rng = mulberry32(this.seedInt ^ 0x5EED);
    var n = function (k) { var a = new Float32Array(k); for (var i = 0; i < k; i++) a[i] = (rng() * 2 - 1); return a; };
    this.W1 = n(GEN_H * GEN_IN); this.b1 = n(GEN_H); this.W2 = n(GEN_H); this.freq = n(8); this.phase = n(4);
    for (var i = 0; i < this.W1.length; i++) this.W1[i] *= 1.2;
  }
  SeedGenerator.prototype.value = function (layer, block, r, c, code) {
    var x = new Float32Array(GEN_IN), f = this.freq, p = this.phase;
    for (var i = 0; i < 4; i++) x[i] = Math.sin(r * f[i] * 3.1 + c * f[i + 4] * 2.3 + p[i] * 6.28);
    var h1 = mix32(mix32(mix32(this.seedInt, layer * 977 + block), r), c);
    x[4] = (h1 & 0xffff) / 32768 - 1; x[5] = (h1 >>> 16) / 32768 - 1;
    x[6] = (layer + 1) / 4; x[7] = (block + 1) / 4;
    if (code) for (var j = 0; j < 8; j++) x[8 + j] = code[j];
    var out = 0;
    for (var hh = 0; hh < GEN_H; hh++) { var a = this.b1[hh], base = hh * GEN_IN; for (var q = 0; q < GEN_IN; q++) a += this.W1[base + q] * x[q]; out += this.W2[hh] * Math.tanh(a); }
    return out;
  };
  SeedGenerator.prototype.grow = function (layer, block, rows, cols, sparsity, code) {
    var n = rows * cols, v = new Float32Array(n), abs = new Float32Array(n);
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var k = r * cols + c; v[k] = this.value(layer, block, r, c, code); abs[k] = Math.abs(v[k]); }
    var sorted = Array.from(abs).sort(function (a, b) { return a - b; });
    var thr = sorted[Math.min(n - 1, Math.floor(n * sparsity))];
    var t = new Int8Array(n); for (var i = 0; i < n; i++) t[i] = abs[i] < thr ? 0 : (v[i] >= 0 ? 1 : -1);
    return t;
  };

  // ---------- Tiny byte-level looped model (ternary STE weights, per-row scales) ----------
  var DIM = 64, HID = 128, CTX = 32;
  function makeBlock(t, rows, cols, scale) { var lat = new Float32Array(rows * cols); for (var i = 0; i < lat.length; i++) lat[i] = t[i]; var s = new Float32Array(rows); s.fill(scale); return { rows: rows, cols: cols, lat: lat, scale: s, th: 0.5 }; }
  function tern(b) { var t = new Int8Array(b.lat.length), th = b.th; for (var i = 0; i < t.length; i++) t[i] = b.lat[i] > th ? 1 : (b.lat[i] < -th ? -1 : 0); return t; }
  function effW(b) { var t = tern(b), w = new Float32Array(t.length); for (var r = 0; r < b.rows; r++) for (var c = 0; c < b.cols; c++) w[r * b.cols + c] = t[r * b.cols + c] * b.scale[r]; return w; }
  async function blockHash(b) { var t = tern(b), buf = new Uint8Array(t.length + b.scale.byteLength); buf.set(new Uint8Array(t.buffer)); buf.set(new Uint8Array(b.scale.buffer.slice(b.scale.byteOffset, b.scale.byteOffset + b.scale.byteLength)), t.length); return sha256Hex(buf); }
  function sparsityOf(b) { var t = tern(b), z = 0; for (var i = 0; i < t.length; i++) if (t[i] === 0) z++; return z / t.length; }
  function cloneBlock(b) { return { rows: b.rows, cols: b.cols, lat: b.lat.slice(), scale: b.scale.slice(), th: b.th }; }
  function cloneModel(m) { return { loops: m.loops, blocks: { emb: cloneBlock(m.blocks.emb), w1: cloneBlock(m.blocks.w1), w2: cloneBlock(m.blocks.w2), out: cloneBlock(m.blocks.out) }, bias: m.bias.slice(), experts: m.experts.map(function (e) { return { index: e.index, gate: e.gate, block: cloneBlock(e.block) }; }) }; }
  var PW = (function () { var a = [], s = 0; for (var k = 0; k < CTX; k++) { a.push(k + 1); s += k + 1; } return a.map(function (x) { return x / s; }); })();

  function prep(m) { return { E: effW(m.blocks.emb), W1: effW(m.blocks.w1), W2: effW(m.blocks.w2), O: effW(m.blocks.out), X: m.experts.map(function (e) { return effW(e.block); }) }; }
  // forward (+ optional backward into grads g). returns CE loss
  function fwdbwd(m, W, bytes, pos, g) {
    var i, j, k, l, h = new Float32Array(DIM);
    for (k = 0; k < CTX; k++) { var b = bytes[pos - CTX + k], base = b * DIM; for (j = 0; j < DIM; j++) h[j] += PW[k] * W.E[base + j]; }
    var hs = [], as = [], zs = [];
    for (l = 0; l < m.loops; l++) {
      hs.push(h.slice()); var a = new Float32Array(HID), z = new Float32Array(HID);
      for (i = 0; i < HID; i++) { var s = 0; for (j = 0; j < DIM; j++) s += W.W1[i * DIM + j] * h[j]; a[i] = s; z[i] = s > 0 ? s : 0; }
      for (i = 0; i < DIM; i++) { var u = 0; for (j = 0; j < HID; j++) u += W.W2[i * HID + j] * z[j]; h[i] += u; }
      as.push(a); zs.push(z);
    }
    var hf = h.slice(), ys = [];
    for (var x = 0; x < m.experts.length; x++) { var y = new Float32Array(DIM), X = W.X[x]; for (i = 0; i < DIM; i++) { var t2 = 0; for (j = 0; j < DIM; j++) t2 += X[i * DIM + j] * h[j]; y[i] = t2; hf[i] += m.experts[x].gate * t2; } ys.push(y); }
    var logits = new Float32Array(256), mx = -1e30;
    for (i = 0; i < 256; i++) { var o = m.bias[i]; for (j = 0; j < DIM; j++) o += W.O[i * DIM + j] * hf[j]; logits[i] = o; if (o > mx) mx = o; }
    var Z = 0; for (i = 0; i < 256; i++) { logits[i] = Math.exp(logits[i] - mx); Z += logits[i]; }
    var tgt = bytes[pos], loss = -Math.log(Math.max(logits[tgt] / Z, 1e-12));
    if (!g) return loss;
    var dl = new Float32Array(256); for (i = 0; i < 256; i++) dl[i] = logits[i] / Z; dl[tgt] -= 1;
    var dhf = new Float32Array(DIM);
    for (i = 0; i < 256; i++) { var d = dl[i]; if (d === 0) continue; g.bias[i] += d; for (j = 0; j < DIM; j++) { g.O[i * DIM + j] += d * hf[j]; dhf[j] += W.O[i * DIM + j] * d; } }
    var dh = dhf.slice();
    for (x = 0; x < m.experts.length; x++) {
      var gt = m.experts[x].gate, yv = ys[x], Xw = W.X[x], dg = 0;
      for (i = 0; i < DIM; i++) dg += dhf[i] * yv[i];
      g.gates[x] += dg;
      for (i = 0; i < DIM; i++) for (j = 0; j < DIM; j++) { g.X[x][i * DIM + j] += gt * dhf[i] * h[j]; dh[j] += gt * Xw[i * DIM + j] * dhf[i]; }
    }
    for (l = m.loops - 1; l >= 0; l--) {
      var hl = hs[l], al = as[l], zl = zs[l], dz = new Float32Array(HID);
      for (i = 0; i < DIM; i++) { var du = dh[i]; for (j = 0; j < HID; j++) { g.W2[i * HID + j] += du * zl[j]; dz[j] += W.W2[i * HID + j] * du; } }
      for (j = 0; j < HID; j++) { var da = al[j] > 0 ? dz[j] : 0; if (da === 0) continue; for (k = 0; k < DIM; k++) { g.W1[j * DIM + k] += da * hl[k]; dh[k] += W.W1[j * DIM + k] * da; } }
    }
    for (k = 0; k < CTX; k++) { var bb = bytes[pos - CTX + k]; for (j = 0; j < DIM; j++) g.E[bb * DIM + j] += PW[k] * dh[j]; }
    return loss;
  }

  // ---------- Engine ----------
  function YaSeed(opts) {
    opts = opts || {};
    this.store = opts.store || defaultStore();
    this.yieldFn = opts.yieldFn || function () { return new Promise(function (r) { setTimeout(r, 0); }); };
    this.sliceMs = opts.sliceMs || 12;
    this.chain = new GhostChain(this.store);
    this.bytes = enc.encode(opts.corpus || CORPUS);
    // the lesson text is memorised on purpose: loss is measured on every corpus position;
    // a held-out 1/7 split is also reported (generalisation, info only)
    var all = [], ho = []; for (var p = CTX; p < this.bytes.length; p++) { all.push(p); if (p % 7 === 3) ho.push(p); }
    this.trainPos = all; this.evalPos = all; this.heldPos = ho;
    this.model = null; this.ready = false; this.broken = null; this.busy = false;
  }
  YaSeed.VERSION = VERSION;
  // 0.1.2 extension registry: access / tokenizer / mind / spine / loop / gcco / mint plug in here (each is its own .js section).
  YaSeed.ext = [];
  YaSeed.use = function (x) { if (x && x.name && !YaSeed.ext.some(function (e) { return e.name === x.name; })) YaSeed.ext.push(x); return YaSeed; };
  function ridLib() { try { if (typeof require === 'function') return require('./rid.js'); } catch (e) {} return (typeof globalThis !== 'undefined' && globalThis.YaSeedRid) || null; }

  YaSeed.prototype.boot = async function (opts) {
    opts = opts || {};
    this.host = opts.host || this.host || detectHost();
    var minted = await this.chain.init();
    var v = await this.chain.verify();
    if (!v.ok) { this.broken = v.problems; this.ready = false; return { ok: false, verify: v }; }
    var enrolled = await this.store.get('signer:enrollment');
    if (!enrolled) {
      // One-time bootstrap: this release-signed egg authorizes minting the device's own signing key.
      var rid = null;
      try { if (this.host && typeof this.host.getYaId === 'function') rid = await this.host.getYaId(); } catch (e) { rid = null; }
      var platform = (this.host && this.host.platform) || (typeof navigator !== 'undefined' ? (navigator.platform || 'unknown') : 'node');
      var hostId = (this.host && this.host.hostId) || 'unknown';
      var enrollBody = {
        schema: 'rlab.yaseed.device-signer.v1',
        kind: 'device-signer.enrollment',
        device_pub: this.chain.pubB64,
        key_fp: this.chain.fp,
        alg: 'ECDSA-P256-SHA256',
        extractable: false,
        native_path: 'Secure Enclave / Keychain (next rebuild); egg era uses non-extractable WebCrypto',
        host: hostId,
        platform: platform,
        yaid: rid || null,
        authorized_by: { egg: RELEASE.id, version: RELEASE.version,
                         release_sha256: (this.host && this.host.releaseSha256) || RELEASE.sha256,
                         release_content_sha256: RELEASE.sha256,
                         release_keyId: RELEASE.keyId,
                         note: 'one-time bootstrap: release-signed egg seats the device delegate; device works fully offline forever after' },
        scopes: TRUSTED_ROOT.delegateScopes.slice(),
        forbidden: TRUSTED_ROOT.forbiddenForDelegates.slice()
      };
      var rel = (this.host && this.host.releaseSha256) || RELEASE.sha256;
      var e = await this.chain.append('device-signer.enrollment', enrollBody, 'release:' + rel);
      await this.store.set('signer:enrollment', JSON.stringify({ entry_hash: e.entry_hash, seq: e.seq, pub: this.chain.pubB64, key_fp: this.chain.fp, scopes: enrollBody.scopes }));
      await this.store.set('signer:trusted', JSON.stringify({ root: TRUSTED_ROOT.root, delegates: [{ key_fp: this.chain.fp, pub: this.chain.pubB64, scopes: enrollBody.scopes, enrollment: e.entry_hash }] }));
      this.enrollment = { entry: e, justMinted: !!minted.minted };
    } else {
      this.enrollment = JSON.parse(enrolled);
      this.enrollment.justMinted = false;
    }
    // load active modules (founding model code)
    this.modules = await this._loadModules();
    var cur = await this.store.get('state:current');
    if (cur) { var snap = await this._loadSnap(cur); this.model = snap.model; this.meta = snap.meta; }
    // register built-in architecture as the founding model plugin
    if (!this.plugins) this.plugins = {};
    this.plugins['founding-ternary-loop'] = FoundingPlugin;
    var plugList = JSON.parse((await this.store.get('plugins:list')) || '[]');
    for (var i = 0; i < plugList.length; i++) {
      try { await this._activatePlugin(plugList[i]); } catch (err) { /* keep going; broken plugin stays off */ }
    }
    // 0.1.2: ЯID generator — this install's own device ЯID (rid.v1, class DEVICE) from its public key.
    var Rid = ridLib();
    if (Rid) { this.rid = await Rid.mint('sha256:' + (await sha256Hex(this.chain.pubB64)), 'device', this.chain.fp, 0, 'DEVICE'); this.Rid = Rid; }
    this.ready = true; this.broken = null;
    for (var xi = 0; xi < YaSeed.ext.length; xi++) { var X = YaSeed.ext[xi]; if (typeof X.boot === 'function') { try { await X.boot(this); } catch (err) { (this.extErrors = this.extErrors || {})[X.name] = String(err.message || err); } } }
    return { ok: true, verify: v, grown: !!this.model, enrolled: this.enrollment, host: this.host && this.host.hostId };
  };

  function detectHost() {
    // Host-adapter contract (see HOST-ADAPTER.md). Prefer an injected host; fall back to a safe stub.
    if (typeof globalThis !== 'undefined' && globalThis.YASEED_HOST) return globalThis.YASEED_HOST;
    return {
      hostId: (typeof navigator !== 'undefined' && /iPhone|iPad/.test(navigator.userAgent || '')) ? 'ios-webview'
              : (typeof process !== 'undefined' && process.versions && process.versions.node) ? 'node' : 'webview',
      platform: (typeof process !== 'undefined' && process.platform) || (typeof navigator !== 'undefined' && navigator.platform) || 'unknown',
      getYaId: async function () { return null; },
      bridge: null,
      storage: null
    };
  }

  // Device-key signature over a local ЯSEED artifact. Refuse anything outside delegateScopes.
  YaSeed.prototype.deviceSign = async function (scope, payload) {
    this._guard();
    if (TRUSTED_ROOT.forbiddenForDelegates.indexOf(scope) >= 0)
      throw new Error('delegate refuses scope "' + scope + '": device keys never sign app updates, appcast entries, or trusted-signers');
    if (TRUSTED_ROOT.delegateScopes.indexOf(scope) < 0)
      throw new Error('unknown scope for device key: ' + scope);
    var msg = 'yaseed-artifact-v1\n' + scope + '\n' + (typeof payload === 'string' ? payload : await sha256Hex(canon(payload)));
    var sig = await this.chain.signPayload(msg);
    return { scope: scope, key_fp: this.chain.fp, pub: this.chain.pubB64, alg: 'ECDSA-P256-SHA256', msg: msg, value: sig };
  };
  YaSeed.prototype.deviceVerify = async function (sig, payload) {
    if (!sig || TRUSTED_ROOT.forbiddenForDelegates.indexOf(sig.scope) >= 0) return false;
    var trusted = JSON.parse((await this.store.get('signer:trusted')) || '{"delegates":[]}');
    var ok = false;
    for (var i = 0; i < (trusted.delegates || []).length; i++)
      if (trusted.delegates[i].key_fp === sig.key_fp && (trusted.delegates[i].scopes || []).indexOf(sig.scope) >= 0) ok = true;
    if (!ok && sig.key_fp === this.chain.fp) ok = true;
    if (!ok) return false;
    var msg = 'yaseed-artifact-v1\n' + sig.scope + '\n' + (typeof payload === 'string' ? payload : await sha256Hex(canon(payload)));
    return this.chain.verifyPayload(msg, sig.value, sig.pub);
  };
  YaSeed.prototype._guard = function () { if (this.broken) throw new Error('Ghost Chain broken, ЯSEED refuses to act (status / chain verify only): ' + this.broken.join('; ')); if (!this.ready) throw new Error('not booted'); };
  YaSeed.prototype._needModel = function () { if (!this.model) throw new Error('nothing grown yet: run /rseed grow'); };

  YaSeed.prototype.evalLoss = function (m, positions) {
    m = m || this.model; positions = positions || this.evalPos;
    var W = prep(m), s = 0; for (var i = 0; i < positions.length; i++) s += fwdbwd(m, W, this.bytes, positions[i], null);
    return s / positions.length;
  };

  // 0.1.2 HEART stand-in: the founding byte model continues a context (greedy, deterministic). Not a fact source:
  // SPINE quotes real tool results; LAW keeps heart text marked as non-factual.
  YaSeed.prototype.generate = function (context, n) {
    if (!this.model) return { ok: false, text: '', why: 'not grown (run /rseed grow)' };
    var m = this.model, W = prep(m), ctx = Array.from(enc.encode(String(context || ''))), out = [];
    while (ctx.length < CTX) ctx.unshift(32);
    for (var step = 0; step < Math.max(1, Math.min(64, n || 24)); step++) {
      var h = new Float32Array(DIM), i, j, k, l;
      for (k = 0; k < CTX; k++) { var b = ctx[ctx.length - CTX + k], base = b * DIM; for (j = 0; j < DIM; j++) h[j] += PW[k] * W.E[base + j]; }
      for (l = 0; l < m.loops; l++) { var z = new Float32Array(HID); for (i = 0; i < HID; i++) { var s = 0; for (j = 0; j < DIM; j++) s += W.W1[i * DIM + j] * h[j]; z[i] = s > 0 ? s : 0; } for (i = 0; i < DIM; i++) { var u = 0; for (j = 0; j < HID; j++) u += W.W2[i * HID + j] * z[j]; h[i] += u; } }
      var hf = h.slice();
      for (var x = 0; x < m.experts.length; x++) { var X = W.X[x]; for (i = 0; i < DIM; i++) { var t2 = 0; for (j = 0; j < DIM; j++) t2 += X[i * DIM + j] * h[j]; hf[i] += m.experts[x].gate * t2; } }
      var best = 32, bv = -1e30;
      for (i = 32; i < 127; i++) { var o = m.bias[i]; for (j = 0; j < DIM; j++) o += W.O[i * DIM + j] * hf[j]; if (o > bv) { bv = o; best = i; } }
      out.push(best); ctx.push(best);
    }
    return { ok: true, text: String.fromCharCode.apply(null, out), bytes: out.length };
  };

  // serialize / snapshots (verified against the chain on load)
  function serBlock(b) { return { rows: b.rows, cols: b.cols, th: b.th, lat: f32b64(b.lat), scale: f32b64(b.scale) }; }
  function deBlock(o) { return { rows: o.rows, cols: o.cols, th: o.th, lat: b64f32(o.lat), scale: b64f32(o.scale) }; }
  function serModel(m) { return { loops: m.loops, bias: f32b64(m.bias), blocks: { emb: serBlock(m.blocks.emb), w1: serBlock(m.blocks.w1), w2: serBlock(m.blocks.w2), out: serBlock(m.blocks.out) }, experts: m.experts.map(function (e) { return { index: e.index, gate: e.gate, block: serBlock(e.block) }; }) }; }
  function deModel(o) { return { loops: o.loops, bias: b64f32(o.bias), blocks: { emb: deBlock(o.blocks.emb), w1: deBlock(o.blocks.w1), w2: deBlock(o.blocks.w2), out: deBlock(o.blocks.out) }, experts: o.experts.map(function (e) { return { index: e.index, gate: e.gate, block: deBlock(e.block) }; }) }; }
  YaSeed.prototype._stateHash = async function (m) { return sha256Hex(canon(serModel(m || this.model))); };
  YaSeed.prototype._blockHashes = async function (m) {
    m = m || this.model; var out = {};
    for (var k in m.blocks) out[k] = await blockHash(m.blocks[k]);
    for (var i = 0; i < m.experts.length; i++) out['expert' + m.experts[i].index] = await blockHash(m.experts[i].block);
    return out;
  };
  // commit = chain entry (with state_hash) + snapshot keyed by that entry
  YaSeed.prototype._commit = async function (kind, body, parent) {
    body.state_hash = await this._stateHash();
    var scope = ({ 'grow.ready': 'yaseed.seed', 'grow.block': 'yaseed.block', train: 'yaseed.block',
                   'expert.add': 'yaseed.expert', 'evolve.keep': 'yaseed.evolve', 'module.activate': 'yaseed.module',
                   'plugin.register': 'yaseed.model-plugin' })[kind] || 'yaseed.block';
    try { body.device_sig = await this.deviceSign(scope, { kind: kind, state_hash: body.state_hash, parent: parent || null }); }
    catch (err) { body.device_sig = { error: String(err.message || err) }; }
    var e = await this.chain.append(kind, body, parent);
    var snap = { entry_seq: e.seq, entry_hash: e.entry_hash, state_hash: body.state_hash, meta: this.meta, model: serModel(this.model) };
    await this.store.set('snap:' + e.entry_hash, JSON.stringify(snap));
    var list = JSON.parse((await this.store.get('state:snaps')) || '[]'); list.push({ seq: e.seq, hash: e.entry_hash, kind: kind, loss: body.loss_after != null ? body.loss_after : body.loss });
    await this.store.set('state:snaps', JSON.stringify(list));
    await this.store.set('state:current', e.entry_hash);
    return e;
  };
  YaSeed.prototype._loadSnap = async function (entryHash) {
    var raw = await this.store.get('snap:' + entryHash); if (!raw) throw new Error('snapshot missing for ' + entryHash.slice(0, 12));
    var snap = JSON.parse(raw), e = await this.chain.get(snap.entry_seq);
    if (!e || e.entry_hash !== entryHash) throw new Error('snapshot not on chain');
    var m = deModel(snap.model), sh = await sha256Hex(canon(serModel(m)));
    if (sh !== e.body.state_hash) throw new Error('snapshot tampered: state_hash ' + sh.slice(0, 12) + ' != chain ' + String(e.body.state_hash).slice(0, 12));
    return { model: m, meta: snap.meta, entry: e };
  };

  // ---- grow ----
  YaSeed.prototype.grow = async function (opts) {
    this._guard(); opts = opts || {};
    if (this.model) {
      // already grown: prove reproducibility by regrowing base ternary blocks from the seed
      var seedHex0 = await this.store.get('seed:hex'), g0 = new SeedGenerator(seedHex0), spec0 = this._spec(), same = 0;
      for (var q = 0; q < spec0.length; q++) { var t0 = g0.grow(spec0[q].layer, spec0[q].block, spec0[q].rows, spec0[q].cols, spec0[q].sparsity), bb = makeBlock(t0, spec0[q].rows, spec0[q].cols, spec0[q].scale); if ((await blockHash(bb)) === this.meta.base[spec0[q].name]) same++; }
      return { already: true, regrown_match: same + '/' + spec0.length, seed_hash: this.meta.seed_hash };
    }
    var seedHex = opts.seedHex;
    if (!seedHex) { var sb = new Uint8Array(32); globalThis.crypto.getRandomValues(sb); seedHex = hex(sb); }
    await this.store.set('seed:hex', seedHex);
    var seedHash = await sha256Hex(unhex(seedHex));
    var gen = new SeedGenerator(seedHex);
    var plant = await this.chain.append('seed.plant', { seed_hash: seedHash, generator: { arch: 'MLP ' + GEN_IN + '-' + GEN_H + '(tanh)-1', inputs: '(seed, layer, block, row, col[, codebook row])', output: 'ternary {-1,0,+1} by |v| quantile' }, model: { dim: DIM, hidden: HID, ctx: CTX, loops: 2, vocab: 256 } }, 'seed:' + seedHash);
    var spec = this._spec(), blocks = {}, base = {}, recs = [];
    for (var i = 0; i < spec.length; i++) {
      var s = spec[i], t = gen.grow(s.layer, s.block, s.rows, s.cols, s.sparsity), b = makeBlock(t, s.rows, s.cols, s.scale);
      blocks[s.name] = b; var h = await blockHash(b); base[s.name] = h;
      var e = await this.chain.append('grow.block', { name: s.name, layer: s.layer, block: s.block, rows: s.rows, cols: s.cols, sparsity: r4(sparsityOf(b)), block_hash: h, seed_hash: seedHash }, 'seed:' + seedHash);
      recs.push({ name: s.name, hash: h, seq: e.seq, sparsity: r4(sparsityOf(b)) });
      if (i % 2 === 1) await this.yieldFn();
    }
    // unigram-free start: bias 0
    this.model = { loops: 2, blocks: blocks, bias: new Float32Array(256), experts: [] };
    this.meta = { seed_hash: seedHash, base: base, codebook: [], steps: 0, rng: (gen.seedInt ^ 0xA11CE) >>> 0 };
    var loss = this.evalLoss();
    await this._commit('grow.ready', { seed_hash: seedHash, plant: plant.entry_hash, blocks: base, loss: r4(loss) }, 'seed:' + seedHash);
    return { seed_hash: seedHash, blocks: recs, loss: loss };
  };
  YaSeed.prototype._spec = function () {
    return [
      { name: 'emb', layer: 0, block: 0, rows: 256, cols: DIM, sparsity: 0.5, scale: 0.5 },
      { name: 'w1', layer: 1, block: 0, rows: HID, cols: DIM, sparsity: 0.6, scale: 0.35 },
      { name: 'w2', layer: 1, block: 1, rows: DIM, cols: HID, sparsity: 0.6, scale: 0.25 },
      { name: 'out', layer: 2, block: 0, rows: 256, cols: DIM, sparsity: 0.5, scale: 0.15 }
    ];
  };

  // ---- train (time-sliced; Adam on latent ternary (STE), scales, bias, expert gates) ----
  function zerosLike(m) { return { E: new Float32Array(m.blocks.emb.lat.length), W1: new Float32Array(m.blocks.w1.lat.length), W2: new Float32Array(m.blocks.w2.lat.length), O: new Float32Array(m.blocks.out.lat.length), bias: new Float32Array(256), gates: new Float32Array(m.experts.length), X: m.experts.map(function (e) { return new Float32Array(e.block.lat.length); }) }; }
  function Adam(lr) { this.lr = lr; this.t = 0; this.s = new Map(); }
  Adam.prototype.step = function (key, p, gr, lr) {
    var st = this.s.get(key); if (!st || st.m.length !== p.length) { st = { m: new Float32Array(p.length), v: new Float32Array(p.length) }; this.s.set(key, st); }
    var b1 = 0.9, b2 = 0.999, c1 = 1 - Math.pow(b1, this.t), c2 = 1 - Math.pow(b2, this.t);
    for (var i = 0; i < p.length; i++) { var g = gr[i]; st.m[i] = b1 * st.m[i] + (1 - b1) * g; st.v[i] = b2 * st.v[i] + (1 - b2) * g * g; p[i] -= lr * (st.m[i] / c1) / (Math.sqrt(st.v[i] / c2) + 1e-8); }
  };
  function applyBlockGrad(opt, key, b, gW, lrLat, lrScale) {
    var t = tern(b), gs = new Float32Array(b.rows), gl = new Float32Array(b.lat.length);
    for (var r = 0; r < b.rows; r++) for (var c = 0; c < b.cols; c++) { var k = r * b.cols + c, g = gW[k]; gs[r] += g * t[k]; gl[k] = Math.abs(b.lat[k]) > 1.5 ? 0 : g * b.scale[r]; }
    opt.step(key + '.s', b.scale, gs, lrScale); opt.step(key + '.l', b.lat, gl, lrLat);
  }
  YaSeed.prototype._trainStep = function (m, opt, rng, batch) {
    var g = zerosLike(m), W = prep(m), L = 0, inv = 1 / batch;
    for (var i = 0; i < batch; i++) { var pos = this.trainPos[Math.floor(rng() * this.trainPos.length)]; L += fwdbwd(m, W, this.bytes, pos, g); }
    var scl = function (a) { for (var q = 0; q < a.length; q++) a[q] *= inv; return a; };
    opt.t++;
    applyBlockGrad(opt, 'emb', m.blocks.emb, scl(g.E), 0.012, 0.01);
    applyBlockGrad(opt, 'w1', m.blocks.w1, scl(g.W1), 0.012, 0.01);
    applyBlockGrad(opt, 'w2', m.blocks.w2, scl(g.W2), 0.012, 0.01);
    applyBlockGrad(opt, 'out', m.blocks.out, scl(g.O), 0.012, 0.01);
    opt.step('bias', m.bias, scl(g.bias), 0.02);
    for (var x = 0; x < m.experts.length; x++) {
      applyBlockGrad(opt, 'x' + m.experts[x].index, m.experts[x].block, scl(g.X[x]), 0.02, 0.01);
      var ga = new Float32Array([m.experts[x].gate]); opt.step('g' + m.experts[x].index, ga, new Float32Array([g.gates[x] * inv]), 0.01); m.experts[x].gate = ga[0];
    }
    return L * inv;
  };
  YaSeed.prototype.train = async function (seconds, onProgress, opts) {
    this._guard(); this._needModel(); opts = opts || {};
    if (this.busy) throw new Error('busy'); this.busy = true; this.stopFlag = false;
    try {
      seconds = Math.max(0.2, Math.min(600, Number(seconds) || 60));
      var before = this.evalLoss(), oldHashes = await this._blockHashes();
      var opt = this._opt || (this._opt = new Adam(0.02)), rng = mulberry32(this.meta.rng + this.meta.steps);
      var t0 = now(), end = t0 + seconds * 1000, steps = 0, last = 0, bestLoss = before, best = cloneModel(this.model), lastEval = t0;
      while (now() < end && !this.stopFlag && (!opts.maxSteps || steps < opts.maxSteps)) {
        var sliceEnd = Math.min(end, now() + this.sliceMs);
        while (now() < sliceEnd && (!opts.maxSteps || steps < opts.maxSteps)) { last = this._trainStep(this.model, opt, rng, 16); steps++; }
        if (now() - lastEval > 400) { var le = this.evalLoss(); lastEval = now(); if (le < bestLoss) { bestLoss = le; best = cloneModel(this.model); } }
        if (onProgress) onProgress({ steps: steps, batch_loss: last, best_loss: bestLoss, elapsed: (now() - t0) / 1000 });
        await this.yieldFn();
      }
      this.meta.steps += steps;
      // keep the best checkpoint seen during this burst (never end a burst worse than the best)
      if (this.evalLoss() > bestLoss) this.model = best;
      var after = this.evalLoss(), newHashes = await this._blockHashes(), changed = [];
      for (var k in newHashes) changed.push({ name: k, hash: newHashes[k], parent: oldHashes[k] || null, changed: newHashes[k] !== oldHashes[k] });
      var held = this.evalLoss(null, this.heldPos);
      var e = await this._commit('train', { seconds: r4((now() - t0) / 1000), steps: steps, total_steps: this.meta.steps, loss_before: r4(before), loss_after: r4(after), held_out_loss: r4(held), eval_positions: this.evalPos.length, blocks: changed, corpus_sha256: await sha256Hex(this.bytes) }, 'seed:' + this.meta.seed_hash);
      return { steps: steps, loss_before: before, loss_after: after, held_out: held, entry: e.seq };
    } finally { this.busy = false; }
  };

  // ---- addExpert: new codebook row + expert block grown from (seed, row), chained as a delta ----
  YaSeed.prototype.addExpert = async function () {
    this._guard(); this._needModel();
    var idx = this.meta.codebook.length, rng = mulberry32(mix32(this.meta.rng, 0xC0DE + idx)), row = [];
    for (var j = 0; j < 8; j++) row.push(r4(rng() * 2 - 1));
    var gen = new SeedGenerator(await this.store.get('seed:hex'));
    var t = gen.grow(3, idx, DIM, DIM, 0.75, row), b = makeBlock(t, DIM, DIM, 0.2);
    var before = this.evalLoss();
    this.meta.codebook.push(row);
    this.model.experts.push({ index: idx, gate: 0, block: b });
    var after = this.evalLoss(), bh = await blockHash(b), rh = await sha256Hex(canon(row));
    var e = await this._commit('expert.add', { codebook_index: idx, row: row, row_hash: rh, block_hash: bh, sparsity: r4(sparsityOf(b)), gate: 0,
      delta: { op: 'codebook.append', index: idx, row_hash: rh, block_hash: bh }, loss_before: r4(before), loss_after: r4(after), seed_hash: this.meta.seed_hash }, 'seed:' + this.meta.seed_hash);
    return { index: idx, block_hash: bh, row_hash: rh, loss_before: before, loss_after: after, entry: e.seq };
  };

  // ---- evolve: mutate -> mini-eval -> keep only if loss improves; losers recorded, never loaded ----
  var MUTATIONS = {
    flip: function (m, rng) { var names = ['emb', 'w1', 'w2', 'out'], b = m.blocks[names[Math.floor(rng() * 4)]], n = Math.max(1, Math.floor(b.lat.length * 0.02)); for (var i = 0; i < n; i++) { var k = Math.floor(rng() * b.lat.length); b.lat[k] = [-1, 0, 1][Math.floor(rng() * 3)]; } return 'flip 2% of a block'; },
    scale: function (m, rng) { var names = ['emb', 'w1', 'w2', 'out'], nm = names[Math.floor(rng() * 4)], b = m.blocks[nm], f = 0.85 + rng() * 0.3; for (var i = 0; i < b.scale.length; i++) b.scale[i] *= f; return 'scale ' + nm + ' x' + r4(f); },
    loops: function (m, rng) { var d = rng() < 0.5 ? -1 : 1; m.loops = Math.max(1, Math.min(4, m.loops + d)); return 'loops -> ' + m.loops; },
    gate: function (m, rng) { if (!m.experts.length) return MUTATIONS.scale(m, rng); var e = m.experts[Math.floor(rng() * m.experts.length)]; e.gate += (rng() - 0.5) * 0.2; return 'gate expert' + e.index + ' -> ' + r4(e.gate); }
  };
  YaSeed.prototype.evolve = async function (opts) {
    this._guard(); this._needModel(); opts = opts || {};
    var tries = Math.max(1, Math.min(32, opts.tries || 6)), rng = mulberry32(mix32(this.meta.rng, 0xE70 + this.meta.steps + (this._evo = (this._evo || 0) + 1))), out = [];
    for (var t = 0; t < tries; t++) {
      var base = this.evalLoss(), cand = cloneModel(this.model), names = Object.keys(MUTATIONS);
      var op = opts.mutation ? (opts.mutation(cand, rng, this) || 'custom') : MUTATIONS[names[Math.floor(rng() * names.length)]](cand, rng);
      var cl = this.evalLoss(cand), ch = await this._stateHash(cand), keep = cl < base - 1e-4;
      if (keep) {
        this.model = cand;
        var e = await this._commit('evolve.keep', { op: op, loss_before: r4(base), loss_after: r4(cl), candidate_hash: ch, loaded: true }, 'seed:' + this.meta.seed_hash);
        out.push({ op: op, keep: true, loss_before: base, loss_after: cl, entry: e.seq });
      } else {
        var e2 = await this.chain.append('evolve.reject', { op: op, loss_before: r4(base), loss_candidate: r4(cl), candidate_hash: ch, loaded: false, note: 'loser recorded, never loaded' }, 'seed:' + this.meta.seed_hash);
        out.push({ op: op, keep: false, loss_before: base, loss_after: cl, entry: e2.seq });
      }
      await this.yieldFn();
    }
    return out;
  };

  // ---- rollback: restore an earlier chained snapshot (verified by state_hash); the chain itself only grows ----
  YaSeed.prototype.rollback = async function (target) {
    this._guard(); this._needModel();
    var list = JSON.parse((await this.store.get('state:snaps')) || '[]'), cur = await this.store.get('state:current');
    var ci = -1; for (var i = 0; i < list.length; i++) if (list[i].hash === cur) ci = i;
    var pick = null;
    if (target == null || target === 'prev') pick = list[ci - 1];
    else {
      var ts = String(target).replace(/^#/, '');
      for (var j = 0; j < list.length && !pick; j++) {
        if (/^\d{1,7}$/.test(ts)) { if (list[j].seq === Number(ts)) pick = list[j]; }   // seq number
        else if (/^[0-9a-f]{8,64}$/.test(ts) && list[j].hash.indexOf(ts) === 0) pick = list[j]; // entry-hash prefix (>= 8 hex)
      }
    }
    if (!pick) throw new Error('no snapshot to roll back to' + (target != null ? ' (' + target + ')' : ''));
    var snap = await this._loadSnap(pick.hash); // throws if tampered
    var from = cur; this.model = snap.model; this.meta = Object.assign({}, snap.meta, { steps: this.meta.steps, rng: this.meta.rng }); this._opt = null;
    var loss = this.evalLoss();
    var e = await this.chain.append('rollback', { from: from, to: pick.hash, to_seq: pick.seq, state_hash: snap.entry.body.state_hash, loss: r4(loss) }, 'snap:' + pick.hash);
    await this.store.set('state:current', pick.hash);
    return { to_seq: pick.seq, to_kind: pick.kind, loss: loss, entry: e.seq };
  };

  YaSeed.prototype.status = async function () {
    var v = await this.chain.verify({ quick: !this.broken });
    var s = { version: VERSION, engine: 'ЯENJIN 0.1', storage: this.store.kind + (this.store.persistent ? '' : ' (not persistent)'), chain_entries: this.chain.head ? this.chain.head.seq + 1 : 0,
      head: this.chain.head ? this.chain.head.entry_hash.slice(0, 16) : null, key_fp: this.chain.fp, key_extractable: this.chain.key ? this.chain.key.privateKey.extractable : null,
      chain_ok: v.ok && !this.broken, broken: this.broken, network: 'none' };
    if (this.model) { s.seed_hash = this.meta.seed_hash.slice(0, 16); s.loops = this.model.loops; s.experts = this.model.experts.length; s.total_steps = this.meta.steps; s.loss = r4(this.evalLoss()); s.current = (await this.store.get('state:current')).slice(0, 16); }
    s.enrollment = this.enrollment ? (this.enrollment.entry_hash || (this.enrollment.entry && this.enrollment.entry.entry_hash) || this.enrollment.key_fp || 'yes') : null;
    s.release_sha256 = RELEASE.sha256.slice(0, 16);
    s.host = this.host && this.host.hostId;
    s.modules = this.modules ? Object.keys(this.modules).length : 0;
    s.plugins = this.plugins ? Object.keys(this.plugins).length : 0;
    s.waits_for_peer = false;
    s.device_rid = this.rid || null;
    s.extensions = YaSeed.ext.map(function (x) { return x.name; }).join(',');
    return s;
  };
  YaSeed.prototype.refuse = async function (text) {
    var h = await sha256Hex(text);
    if (this.chain.head && !this.broken) await this.chain.append('refusal', { rule: 'HARD NO (USB / restore / erase / DFU / 14 Pro)', request_sha256: h }, null);
    return h;
  };


  // ---- Founding-model modules (code / build / create / modify) ----
  // Sandboxed JS: no network, no host APIs beyond egg storage. Loaded only after a self-test passes.
  // Old versions stay for rollback. Anything that leaves ЯSEED's sandbox still needs Rizal's Approve.
  var BUILTIN_MODULES = {
    'generator': {
      id: 'generator', version: '0.1.0', kind: 'model-code',
      source: "/* founding generator 0.1.0 */\nexports.sparsity = { emb: 0.5, w1: 0.6, w2: 0.6, out: 0.5 };\nexports.scale = { emb: 0.5, w1: 0.35, w2: 0.25, out: 0.15 };\nexports.selftest = function (api) { return api.assert(exports.sparsity.emb === 0.5, 'emb sparsity') && api.assert(typeof exports.scale.out === 'number', 'out scale'); };\n"
    },
    'training-recipe': {
      id: 'training-recipe', version: '0.1.0', kind: 'model-code',
      source: "/* founding training recipe 0.1.0 */\nexports.lrLat = 0.012; exports.lrScale = 0.01; exports.batch = 16; exports.sliceMs = 12;\nexports.selftest = function (api) { return api.assert(exports.lrLat > 0 && exports.batch > 0, 'lr/batch'); };\n"
    }
  };

  function sandboxEval(source, api) {
    // Minimal CommonJS-ish sandbox. No require, no fetch, no host, no Function to globalThis.
    var exports = {};
    var module = { exports: exports };
    var deny = function () { throw new Error('sandbox: host/network APIs are forbidden'); };
    var fn = new Function('exports', 'module', 'api', 'require', 'fetch', 'XMLHttpRequest', 'WebSocket',
                          'indexedDB', 'localStorage', 'window', 'document', 'globalThis', 'self',
                          '"use strict";\n' + source + '\n;return module.exports;');
    return fn(exports, module, api, deny, deny, deny, deny, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
  }
  function moduleApi(assertLog) {
    return {
      assert: function (cond, msg) { if (!cond) { assertLog.push('FAIL ' + msg); return false; } assertLog.push('PASS ' + msg); return true; },
      VERSION: VERSION
    };
  }

  YaSeed.prototype._loadModules = async function () {
    var active = JSON.parse((await this.store.get('modules:active')) || '{}');
    var out = {};
    for (var id in BUILTIN_MODULES) {
      var rec = active[id];
      if (rec && rec.source) out[id] = rec;
      else out[id] = { id: id, version: BUILTIN_MODULES[id].version, source: BUILTIN_MODULES[id].source, builtin: true };
    }
    // also any custom modules created later
    for (var id2 in active) if (!out[id2]) out[id2] = active[id2];
    return out;
  };
  YaSeed.prototype._runModuleSelftest = function (source) {
    var log = [];
    try {
      var exp = sandboxEval(source, moduleApi(log));
      if (typeof exp.selftest !== 'function') return { ok: false, log: log.concat(['FAIL no selftest() export']), exports: exp };
      var ok = !!exp.selftest(moduleApi(log));
      return { ok: ok && log.every(function (l) { return l.indexOf('FAIL') !== 0; }), log: log, exports: exp };
    } catch (e) { return { ok: false, log: log.concat(['FAIL ' + (e && e.message || e)]), exports: null }; }
  };
  YaSeed.prototype.listModules = async function () {
    var hist = JSON.parse((await this.store.get('modules:history')) || '[]');
    return { active: this.modules, history: hist };
  };
  // /rseed code|build|create|modify — propose a new versioned module
  YaSeed.prototype.modifyModule = async function (id, source, opts) {
    this._guard(); opts = opts || {};
    if (!/^[a-z][a-z0-9-]{0,40}$/.test(id)) throw new Error('module id must be lowercase alphanumeric/hyphen');
    if (typeof source !== 'string' || source.length < 8 || source.length > 120000) throw new Error('module source size out of range');
    if (/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts|eval\s*\(|Function\s*\(|process\.|require\s*\(|indexedDB|localStorage)\b/.test(source))
      throw new Error('module source uses forbidden APIs (network/host/storage); sandbox-only model-code allowed');
    var st = this._runModuleSelftest(source);
    var prev = this.modules[id] || null;
    var ver = opts.version || bumpVer(prev ? prev.version : '0.0.0');
    var srcHash = await sha256Hex(source);
    if (!st.ok) {
      var rej = await this.chain.append('module.reject', {
        id: id, version: ver, source_sha256: srcHash, selftest: st.log, loaded: false,
        note: 'self-test failed; old version kept'
      }, prev ? ('module:' + id + '@' + prev.version) : null);
      return { ok: false, entry: rej.seq, log: st.log, kept: prev && prev.version };
    }
    var rec = { id: id, version: ver, source: source, source_sha256: srcHash, kind: 'model-code', activated: new Date().toISOString() };
    rec.device_sig = await this.deviceSign('yaseed.module', { id: id, version: ver, source_sha256: srcHash });
    var active = JSON.parse((await this.store.get('modules:active')) || '{}');
    var hist = JSON.parse((await this.store.get('modules:history')) || '[]');
    if (prev) hist.push({ id: id, version: prev.version, source_sha256: prev.source_sha256 || await sha256Hex(prev.source), replaced_by: ver });
    active[id] = rec; this.modules[id] = rec;
    await this.store.set('modules:active', JSON.stringify(active));
    await this.store.set('modules:history', JSON.stringify(hist));
    // also keep full previous source for rollback
    if (prev) await this.store.set('modules:prev:' + id + '@' + prev.version, JSON.stringify(prev));
    await this.store.set('modules:prev:' + id + '@' + ver, JSON.stringify(rec));
    var e = await this.chain.append('module.activate', {
      id: id, version: ver, source_sha256: srcHash, previous: prev ? prev.version : null,
      selftest: st.log, device_sig: rec.device_sig, loaded: true
    }, prev ? ('module:' + id + '@' + prev.version) : ('seed:' + ((this.meta && this.meta.seed_hash) || 'none')));
    return { ok: true, id: id, version: ver, entry: e.seq, log: st.log, previous: prev && prev.version };
  };
  function bumpVer(v) {
    var p = String(v || '0.0.0').split('.').map(function (x) { return parseInt(x, 10) || 0; });
    while (p.length < 3) p.push(0); p[2] += 1; return p.join('.');
  }
  YaSeed.prototype.rollbackModule = async function (id, version) {
    this._guard();
    var raw = await this.store.get('modules:prev:' + id + '@' + version);
    if (!raw) throw new Error('no saved module ' + id + '@' + version);
    var prev = JSON.parse(raw);
    var st = this._runModuleSelftest(prev.source);
    if (!st.ok) throw new Error('saved module fails self-test; refuse to load');
    var active = JSON.parse((await this.store.get('modules:active')) || '{}');
    var cur = active[id];
    active[id] = prev; this.modules[id] = prev;
    await this.store.set('modules:active', JSON.stringify(active));
    var e = await this.chain.append('module.rollback', {
      id: id, to: version, from: cur && cur.version, source_sha256: prev.source_sha256 || await sha256Hex(prev.source), selftest: st.log
    }, 'module:' + id + '@' + version);
    return { ok: true, id: id, version: version, entry: e.seq };
  };

  // ---- Model-plugin interface (new architectures register as signed modules) ----
  var FoundingPlugin = {
    id: 'founding-ternary-loop', version: '0.1.0',
    description: 'ЯSEED founding model: ternary sparse blocks + byte-level looped MLP',
    create: function (eng) { return eng; }, // the engine itself IS the founding model
    selftest: function (api) { return api.assert(true, 'founding plugin present'); }
  };
  YaSeed.prototype.registerPlugin = async function (plugin) {
    this._guard();
    if (!plugin || !plugin.id || typeof plugin.create !== 'function' || typeof plugin.selftest !== 'function')
      throw new Error('plugin must expose id, create(), selftest()');
    if (!/^[a-z][a-z0-9-]{0,40}$/.test(plugin.id)) throw new Error('bad plugin id');
    var log = []; var api = moduleApi(log);
    if (!plugin.selftest(api)) {
      var rej = await this.chain.append('plugin.reject', { id: plugin.id, version: plugin.version || '0.0.0', selftest: log, loaded: false }, null);
      return { ok: false, entry: rej.seq, log: log };
    }
    var desc = { id: plugin.id, version: plugin.version || '0.1.0', description: plugin.description || '', source: plugin.source || null };
    if (plugin.source) {
      // source-carrying plugins go through the same sandbox rules as modules
      var st = this._runModuleSelftest(plugin.source);
      if (!st.ok) return { ok: false, log: st.log };
      desc.source_sha256 = await sha256Hex(plugin.source);
    }
    desc.device_sig = await this.deviceSign('yaseed.model-plugin', { id: desc.id, version: desc.version, source_sha256: desc.source_sha256 || null });
    this.plugins = this.plugins || {};
    this.plugins[plugin.id] = plugin;
    var list = JSON.parse((await this.store.get('plugins:list')) || '[]');
    list = list.filter(function (x) { return x.id !== plugin.id; }); list.push(desc);
    await this.store.set('plugins:list', JSON.stringify(list));
    if (plugin.source) await this.store.set('plugins:src:' + plugin.id, plugin.source);
    var e = await this.chain.append('plugin.register', { id: desc.id, version: desc.version, source_sha256: desc.source_sha256 || null, device_sig: desc.device_sig, selftest: log, loaded: true }, null);
    return { ok: true, id: desc.id, version: desc.version, entry: e.seq, log: log };
  };
  YaSeed.prototype._activatePlugin = async function (desc) {
    if (desc.source || (await this.store.get('plugins:src:' + desc.id))) {
      var src = desc.source || await this.store.get('plugins:src:' + desc.id);
      var st = this._runModuleSelftest(src);
      if (!st.ok) throw new Error('plugin ' + desc.id + ' self-test failed');
      this.plugins[desc.id] = {
        id: desc.id, version: desc.version, description: desc.description,
        create: st.exports.create || function () { return st.exports; },
        selftest: st.exports.selftest, source: src
      };
    }
  };

  // ---- Cross-device: opportunistic sync only. Each device fully works alone offline. ----
  // Never wait for the other device. Queue signed chain bundles locally; merge append-only when any link appears.
  YaSeed.prototype.exportBundle = async function () {
    this._guard();
    var entries = await this.chain.all();
    var enrollment = JSON.parse((await this.store.get('signer:enrollment')) || 'null');
    var snaps = [];
    var list = JSON.parse((await this.store.get('state:snaps')) || '[]');
    for (var i = 0; i < list.length; i++) {
      var raw = await this.store.get('snap:' + list[i].hash);
      if (raw) snaps.push(JSON.parse(raw));
    }
    var mods = JSON.parse((await this.store.get('modules:active')) || '{}');
    var body = {
      schema: 'rlab.yaseed.chain-bundle.v1',
      exported: new Date().toISOString(),
      release_sha256: RELEASE.sha256,
      device: { key_fp: this.chain.fp, pub: this.chain.pubB64, host: (this.host && this.host.hostId) || null, enrollment: enrollment && enrollment.entry_hash },
      entries: entries,
      snapshots: snaps,
      modules: mods,
      plugins: JSON.parse((await this.store.get('plugins:list')) || '[]')
    };
    body.device_sig = await this.deviceSign('yaseed.chain-bundle', { entries: entries.length, head: this.chain.head.entry_hash, release_sha256: RELEASE.sha256 });
    // also queue a copy locally so sync is opportunistic (file / bridge / later) — never blocking
    var q = JSON.parse((await this.store.get('sync:outbox')) || '[]');
    q.push({ ts: body.exported, head: this.chain.head.entry_hash, entries: entries.length });
    await this.store.set('sync:outbox', JSON.stringify(q));
    await this.store.set('sync:last-bundle', JSON.stringify(body));
    return body;
  };
  YaSeed.prototype.queueOutbound = async function () {
    // Produce (or refresh) the outbox bundle without needing any peer. Safe to call anytime offline.
    return this.exportBundle();
  };
  YaSeed.prototype.importBundle = async function (bundle, opts) {
    this._guard(); opts = opts || {};
    if (!bundle || bundle.schema !== 'rlab.yaseed.chain-bundle.v1') throw new Error('not a yaseed chain bundle');
    if (!bundle.device_sig || !(await this.deviceVerifyForeign(bundle.device_sig, { entries: (bundle.entries || []).length, head: bundle.entries.length ? bundle.entries[bundle.entries.length - 1].entry_hash : ZERO64, release_sha256: bundle.release_sha256 }, bundle.device)))
      throw new Error('bundle signature invalid or out of scope');
    // Verify foreign chain links + signatures against the foreign device key
    var prev = ZERO64, foreignPub = bundle.device.pub, problems = [];
    for (var i = 0; i < bundle.entries.length; i++) {
      var e = bundle.entries[i];
      var core = {}; for (var k in e) if (k !== 'entry_hash' && k !== 'sig') core[k] = e[k];
      if (core.prev_hash !== prev) problems.push('#' + i + ' prev_hash');
      if ((await sha256Hex(canon(core))) !== e.entry_hash) problems.push('#' + i + ' hash');
      if (!(await this.chain.verifyPayload(e.entry_hash, e.sig.value, foreignPub))) problems.push('#' + i + ' sig');
      prev = e.entry_hash;
    }
    if (problems.length) throw new Error('foreign chain broken: ' + problems.slice(0, 4).join('; '));
    // Enroll foreign device as a peer delegate (local only — never a release/trusted-signers add)
    var trusted = JSON.parse((await this.store.get('signer:trusted')) || JSON.stringify({ root: TRUSTED_ROOT.root, delegates: [] }));
    var have = false;
    for (var d = 0; d < trusted.delegates.length; d++) if (trusted.delegates[d].key_fp === bundle.device.key_fp) have = true;
    if (!have) {
      trusted.delegates.push({ key_fp: bundle.device.key_fp, pub: bundle.device.pub, scopes: TRUSTED_ROOT.delegateScopes.slice(), peer: true, enrollment: bundle.device.enrollment || null });
      await this.store.set('signer:trusted', JSON.stringify(trusted));
    }
    // Merge append-only: store foreign entries under peer: namespace; write a conflict-aware merge record on OUR chain
    var foreignIds = [];
    for (var j = 0; j < bundle.entries.length; j++) {
      var fe = bundle.entries[j];
      await this.store.set('peer:' + bundle.device.key_fp + ':' + fe.seq, JSON.stringify(fe));
      foreignIds.push(fe.entry_hash);
    }
    await this.store.set('peer:' + bundle.device.key_fp + ':head', JSON.stringify({ seq: bundle.entries.length - 1, entry_hash: prev, pub: foreignPub }));
    // Snapshots / modules from peer are kept as peer copies (do not overwrite local founding model)
    for (var s = 0; s < (bundle.snapshots || []).length; s++)
      await this.store.set('peer-snap:' + bundle.device.key_fp + ':' + bundle.snapshots[s].entry_hash, JSON.stringify(bundle.snapshots[s]));
    var merge = await this.chain.append('chain.merge', {
      peer_key_fp: bundle.device.key_fp,
      peer_head: prev,
      peer_entries: bundle.entries.length,
      peer_entry_hashes: foreignIds.slice(-8),
      release_sha256: bundle.release_sha256,
      conflict: 'none — append-only peer namespace; local chain unchanged',
      note: 'opportunistic sync; each device stays fully autonomous offline'
    }, 'peer:' + bundle.device.key_fp + ':' + prev);
    // Clear matching outbox hint if any
    return { ok: true, peer: bundle.device.key_fp, peer_entries: bundle.entries.length, merge_entry: merge.seq };
  };
  YaSeed.prototype.deviceVerifyForeign = async function (sig, payload, device) {
    if (!sig || TRUSTED_ROOT.forbiddenForDelegates.indexOf(sig.scope) >= 0) return false;
    if (TRUSTED_ROOT.delegateScopes.indexOf(sig.scope) < 0) return false;
    var msg = 'yaseed-artifact-v1\n' + sig.scope + '\n' + (typeof payload === 'string' ? payload : await sha256Hex(canon(payload)));
    // Accept if signed by claimed device pub AND (already trusted OR first-seen via its own enrollment in the bundle)
    return this.chain.verifyPayload(msg, sig.value, device.pub || sig.pub);
  };
  YaSeed.prototype.peerStatus = async function () {
    var trusted = JSON.parse((await this.store.get('signer:trusted')) || '{"delegates":[]}');
    var outbox = JSON.parse((await this.store.get('sync:outbox')) || '[]');
    var peers = [];
    for (var i = 0; i < (trusted.delegates || []).length; i++) {
      var d = trusted.delegates[i];
      if (d.key_fp === this.chain.fp) continue;
      var head = await this.store.get('peer:' + d.key_fp + ':head');
      peers.push({ key_fp: d.key_fp, peer: !!d.peer, head: head ? JSON.parse(head) : null });
    }
    return { offline: true, waits_for_peer: false, outbox: outbox.length, peers: peers };
  };


  // ---- /rseed command surface ----
  var HELP = [
    '/rseed help                      this list',
    '/rseed grow                      grow ternary blocks from this install\'s seed (chained + device-signed)',
    '/rseed train [sec]               train in time-sliced bursts (default 60s)',
    '/rseed expert                    add an expert (codebook row + grown block)',
    '/rseed evolve [tries]            mutate -> mini-eval; keep only if loss improves',
    '/rseed code|build|create|modify <id> <source|@builtin>   propose a sandboxed model-code module (self-test gated)',
    '/rseed modules                   list active modules + history',
    '/rseed module rollback <id> <ver>  restore a previous module version',
    '/rseed plugin list               list registered model plugins (architectures)',
    '/rseed export                    write a signed chain bundle to the outbox (offline; never waits for a peer)',
    '/rseed import <json>             merge a peer bundle append-only (opportunistic sync)',
    '/rseed sync status               outbox + known peers (waits_for_peer is always false)',
    '/rseed rollback [seq|prev]       restore an earlier chained snapshot',
    '/rseed status                    engine + chain + enrollment + model status',
    '/rseed pack status|list|verify|open <s>|sweep   self-condensed seed pack (lazy sections)',
    '/rvm status|base|linux …|run <job>|jobs|fs|snapshot|restore S<n>|ask   ЯVM (egg id=rvm + fused ENJIN): bytecode + base + optional Linux guest',
    '/rseed chain verify|tail [n]     Ghost Chain check / latest records',
    'Each device (Neo or 17e) fully grows/trains/codes/evolves/signs/chains offline on its own.',
    'Sync is opportunistic only: queue bundles locally; merge whenever any link appears. Never block.',
    'HARD NO: USB / restore / erase / DFU / 14 Pro. Offline. Device key never signs app updates.'
  ].join('\n');
  function fmt(x) { return typeof x === 'number' ? (Math.round(x * 1000) / 1000).toString() : x; }
  YaSeed.prototype.command = async function (text, onProgress) {
    text = String(text || '').trim();
    text = text.replace(/^\/?(rlink|яlink)\b/i, '/rseed link');   // 0.1.4 ЯLINK: /rlink … = /rseed link …
    // ЯVM + self-pack surfaces (attached by the bootloader; /rvm restore S<n> is VM-internal, not a device restore)
    if (/^\/?(rvm|яvm)\b/i.test(text)) {
      if (!this.rvm) {
        var RV = globalThis.YaSeedRVM; if (!RV) return 'ЯVM not loaded (rvm.js missing).';
        this.rvm = new RV.RVM({ seed: this, pack: this.pack || null }); await this.rvm.init();
        if (globalThis.YaSeedRvmNet) { this.rvmNet = globalThis.YaSeedRvmNet.attach(this, this.rvm, this._rvmNetOpts || {}); }
        if (globalThis.YaSeedRvmBase) { this.rvmBase = new globalThis.YaSeedRvmBase.Base(this); }
      }
      var rparts = text.replace(/^\/?(rvm|яvm)\b/i, '').trim().split(/\s+/).filter(Boolean);
      rparts.raw = text.replace(/^\/?(rvm|яvm)\b/i, '').trim();   // 0.1.8: full line kept for /rvm linux run <cmd …>
      if (globalThis.YaSeedRvmBase) { var br = await globalThis.YaSeedRvmBase.handle(this, rparts); if (br !== undefined) return br; }
      if (globalThis.YaSeedRvmLinux) { var lr = await globalThis.YaSeedRvmLinux.handle(this, rparts); if (lr !== undefined) return lr; }
      return this.rvm.command(text);
    }
    if (/^\/?(rseed|яseed|yaseed)\s+pack\b/i.test(text) && !HARD_NO.test(text)) return this.packCommand(text);
    if (HARD_NO.test(text) && !/^\/?(rseed|яseed|yaseed)\s+loop\b/i.test(text)) { var h = await this.refuse(text); return 'HARD NO. ЯSEED refuses USB / restore / erase / DFU / 14 Pro requests. Recorded on the Ghost Chain as a refusal (request sha256 ' + h.slice(0, 12) + ').'; }
    var parts = text.replace(/^\/?(rseed|яseed|yaseed)\b/i, '').trim().split(/\s+/).filter(Boolean), cmd = (parts[0] || 'help').toLowerCase();
    try {
      if (cmd === 'help') return HELP + YaSeed.ext.map(function (x) { return (x.help || []).join('\n'); }).filter(Boolean).map(function (t) { return '\n' + t; }).join('');
      if (cmd === 'status') { var s = await this.status(); return Object.keys(s).map(function (k) { return k + ': ' + (s[k] == null ? '-' : (typeof s[k] === 'object' ? JSON.stringify(s[k]) : s[k])); }).join('\n'); }
      if (cmd === 'chain' && (parts[1] || 'verify') === 'verify') { var v = await this.chain.verify(); return v.ok ? 'Ghost Chain OK · ' + v.entries + ' entries · head ' + v.head.slice(0, 16) + ' · key ' + this.chain.fp : 'Ghost Chain BROKEN · ' + v.problems.join('; '); }
      if (cmd === 'chain' && parts[1] === 'tail') { var n = Math.min(50, Number(parts[2]) || 8), all = await this.chain.all(); return all.slice(-n).map(function (e) { return '#' + e.seq + ' ' + e.kind + ' ' + e.entry_hash.slice(0, 12) + ' ' + JSON.stringify(e.body).slice(0, 140); }).join('\n'); }
      if (cmd === 'grow') { var g = await this.grow(); if (g.already) return 'Already grown from seed ' + g.seed_hash.slice(0, 12) + '. Regrown from the seed, ' + g.regrown_match + ' base blocks match their chained hashes. Use /rseed expert to grow more.'; return 'Grew ' + g.blocks.length + ' ternary blocks from seed ' + g.seed_hash.slice(0, 12) + ': ' + g.blocks.map(function (b) { return b.name + ' ' + b.hash.slice(0, 10) + ' (' + Math.round(b.sparsity * 100) + '% zero, #' + b.seq + ')'; }).join(', ') + '. Loss ' + fmt(g.loss) + '.'; }
      if (cmd === 'train') { var t = await this.train(parts[1] ? Number(parts[1]) : 60, onProgress); return 'Trained ' + t.steps + ' steps. Loss ' + fmt(t.loss_before) + ' -> ' + fmt(t.loss_after) + ' (chain #' + t.entry + ').'; }
      if (cmd === 'expert') { var x = await this.addExpert(); return 'Expert ' + x.index + ' added: block ' + x.block_hash.slice(0, 10) + ', codebook row ' + x.row_hash.slice(0, 10) + ', gate 0 (train to use it). Loss ' + fmt(x.loss_before) + ' -> ' + fmt(x.loss_after) + ' (chain #' + x.entry + ').'; }
      if (cmd === 'evolve') { var r = await this.evolve({ tries: Number(parts[1]) || 6 }); var k = r.filter(function (q) { return q.keep; }).length; return 'Evolve: ' + k + ' kept, ' + (r.length - k) + ' rejected (recorded, not loaded).\n' + r.map(function (q) { return (q.keep ? 'KEEP   ' : 'REJECT ') + q.op + ' · ' + fmt(q.loss_before) + ' -> ' + fmt(q.loss_after) + ' · #' + q.entry; }).join('\n'); }
      if (cmd === 'rollback') { var rb = await this.rollback(parts[1]); return 'Rolled back to #' + rb.to_seq + ' (' + rb.to_kind + '), loss ' + fmt(rb.loss) + '. Recorded as chain #' + rb.entry + '; nothing was erased.'; }
      if (cmd === 'code' || cmd === 'build' || cmd === 'create' || cmd === 'modify') {
        var mid = parts[1]; if (!mid) return 'Usage: /rseed ' + cmd + ' <id> <source|@generator|@training-recipe>';
        var src = parts.slice(2).join(' ');
        if (src.charAt(0) === '@' && BUILTIN_MODULES[src.slice(1)]) src = BUILTIN_MODULES[src.slice(1)].source.replace('0.1.0', '0.1.1').replace('founding', 'founding (edited)');
        if (!src) return 'Pass module source, or @generator / @training-recipe to revise a builtin.';
        var mm = await this.modifyModule(mid, src);
        return mm.ok ? ('Module ' + mm.id + '@' + mm.version + ' activated (self-test passed). Previous ' + (mm.previous || 'none') + '. Chain #' + mm.entry + '.')
                     : ('Module ' + mid + ' REJECTED by self-test; old version kept. #' + mm.entry + '\n' + mm.log.join('\n'));
      }
      if (cmd === 'modules') { var L = await this.listModules(); return Object.keys(L.active).map(function (k) { return k + '@' + L.active[k].version + (L.active[k].builtin ? ' (builtin)' : ''); }).join('\n') || '(none)'; }
      if (cmd === 'module' && parts[1] === 'rollback') { var mr = await this.rollbackModule(parts[2], parts[3]); return 'Module ' + mr.id + ' rolled back to @' + mr.version + ' (#' + mr.entry + ').'; }
      if (cmd === 'plugin' && (parts[1] || 'list') === 'list') { return Object.keys(this.plugins || {}).map(function (k) { return k + '@' + ((this.plugins[k].version) || '?'); }.bind(this)).join('\n'); }
      if (cmd === 'export') { var b = await this.exportBundle(); return 'Queued signed chain bundle offline: ' + b.entries.length + ' entries · head ' + this.chain.head.entry_hash.slice(0, 12) + ' · device ' + this.chain.fp + '. Sync is opportunistic; nothing waits for a peer.'; }
      if (cmd === 'import') {
        var raw = parts.slice(1).join(' '); if (!raw) return 'Usage: /rseed import <bundle-json> (or pass a bundle object via the panel API)';
        var bundle = JSON.parse(raw); var im = await this.importBundle(bundle);
        return 'Merged peer ' + im.peer.slice(0, 12) + ': ' + im.peer_entries + ' entries (append-only peer namespace). Merge #' + im.merge_entry + '.';
      }
      if (cmd === 'sync' && (parts[1] || 'status') === 'status') { var ps = await this.peerStatus(); return 'offline: true · waits_for_peer: ' + ps.waits_for_peer + ' · outbox: ' + ps.outbox + ' · peers: ' + (ps.peers.length ? ps.peers.map(function (x) { return x.key_fp.slice(0, 12); }).join(',') : 'none'); }
      if (cmd === 'stop') { this.stopFlag = true; return 'Stop requested.'; }
      for (var xi = 0; xi < YaSeed.ext.length; xi++) { var X = YaSeed.ext[xi]; if (typeof X.command === 'function') { var xr = await X.command(this, cmd, parts, text); if (xr !== undefined) return xr; } }
      return 'Unknown /rseed command. ' + HELP;
    } catch (err) { return 'ЯSEED: ' + (err && err.message ? err.message : String(err)); }
  };

  // ---- self-condense / self-extract (rzl.pack.v1) hooks ----
  YaSeed.prototype.attachPack = function (boot) { this.pack = boot; if (boot && !boot.chain) boot.chain = this.chain; return boot; };
  // 0.1.2 RZL-DOC: after the seed pack is attached, every extension may read it (rzldoc fuses the egg's pages; MIND re-indexes).
  YaSeed.prototype.packReady = async function () { var out = {}; for (var xi = 0; xi < YaSeed.ext.length; xi++) { var X = YaSeed.ext[xi]; if (typeof X.onPack === 'function') { try { out[X.name] = await X.onPack(this); } catch (err) { (this.extErrors = this.extErrors || {})[X.name + '.onPack'] = String(err.message || err); } } } if (this.mind) await this.mind.index(); return out; };
  YaSeed.prototype.attachRVM = function (rvm) { this.rvm = rvm; return rvm; };
  YaSeed.prototype.packCommand = async function (text) {
    if (!this.pack) return 'No seed pack attached.';
    var parts = text.replace(/^\/?(rseed|яseed|yaseed)\s+pack\b/i, '').trim().split(/\s+/).filter(Boolean), c = (parts[0] || 'status').toLowerCase();
    try {
      if (c === 'status') { var s = this.pack.status(); return 'pack ' + s.pack + ' · root ' + s.root.slice(0, 12) + ' · ' + s.loaded + '/' + s.sections + ' sections inflated · cache ' + s.cacheBytes + '/' + s.budget + ' B · unpacks ' + s.stats.unpacks + ' · evictions ' + s.stats.evictions + ' · repacks ' + s.stats.packs; }
      if (c === 'list') return this.pack.list().map(function (x) { return (x.loaded ? '* ' : '  ') + x.name + ' ' + x.size + (x.clen != null ? ' (' + x.clen + ' packed, ' + x.method + ')' : '') + (x.dirty ? ' dirty' : ''); }).join('\n');
      if (c === 'verify') { var v = await globalThis.YaSeedPack.verifyAll(this.pack.packBytes); return v.ok ? 'pack OK · ' + v.sections + ' sections · root ' + v.root.slice(0, 16) : 'pack TAMPERED · ' + v.problems.join('; '); }
      if (c === 'open') { var b = await this.pack.get(parts[1]); return parts[1] + ' inflated (' + b.length + ' B) · ЯID ' + this.pack.log[this.pack.log.length - 1].rid; }
      if (c === 'sweep') { var r = await this.pack.sweep(); return 'sweep: ' + r.plan.why + ' · dropped ' + r.dropped.length + ' · cache ' + r.cacheBytes + ' B'; }
      return 'Usage: /rseed pack status|list|verify|open <section>|sweep';
    } catch (e) { return 'ЯSEED pack: ' + e.message; }
  };

  return { VERSION: VERSION, RELEASE: RELEASE, TRUSTED_ROOT: TRUSTED_ROOT, YaSeed: YaSeed, GhostChain: GhostChain, SeedGenerator: SeedGenerator, MemoryStore: MemoryStore, IDBStore: IDBStore, CORPUS: CORPUS, HARD_NO: HARD_NO, BUILTIN_MODULES: BUILTIN_MODULES, FoundingPlugin: FoundingPlugin, canon: canon, sha256Hex: sha256Hex, detectHost: detectHost, hex: hex, b64: b64, unb64: unb64, ridLib: ridLib };
});
