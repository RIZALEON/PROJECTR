// test-linux-seat.js — Node proof for the RCODE Linux seat.
// Run: node adapters/linux/test-linux-seat.js   (from the renjin/ dir)
//
// Two engines, because the core has two truths about a restored store:
//
//  A) Restored seat (temp copy of src/store-v3.json): the shipped store
//     boots, verifies and answers — status, chain verify, ask retrieval.
//     Writes are NOT attempted here: the device chain key is
//     non-extractable by design, and a JSON FileStore cannot carry a
//     CryptoKey across processes (it serialises to {}), so a fresh Node
//     process can verify with the public key but cannot sign a new
//     entry. That is the persist build's own read-only reload limit, not
//     a seat bug — the test asserts registerPlugin fails with exactly
//     that cause, so the limit stays visible instead of silent.
//  B) Fresh seat (MemoryStore, key live in-process — the same shape as
//     test-rcode-adapter.js): the rcode-bridge plugin registers through
//     the core's own path (selftest → device-signed descriptor →
//     plugin.register chain entry), proving the admission path works on
//     the Linux host whenever the device key is live.
const fs = require('fs');
const os = require('os');
const path = require('path');

const RENJIN = path.join(__dirname, '..', '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'rzl-linux-seat-'));
const STORE_COPY = path.join(TMP, 'store-v3.json');
fs.copyFileSync(path.join(RENJIN, 'src', 'store-v3.json'), STORE_COPY);

function FileStore(file) {
  this.file = file; this.persistent = true; this.kind = 'file'; this.m = new Map();
  try { var obj = JSON.parse(fs.readFileSync(file, 'utf8')); for (var k in obj) this.m.set(k, obj[k]); } catch (e) {}
}
FileStore.prototype._flush = function () {
  var obj = {}; this.m.forEach(function (v, k) { obj[k] = v; });
  var tmp = this.file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(obj)); fs.renameSync(tmp, this.file);
};
FileStore.prototype.get = async function (k) { return this.m.get(k); };
FileStore.prototype.set = async function (k, v) { this.m.set(k, v); this._flush(); };
FileStore.prototype.del = async function (k) { this.m.delete(k); this._flush(); };

(async () => {
  require(path.join(RENJIN, 'src', 'egg-version.js'));
  const Core = require(path.join(RENJIN, 'src', 'yaseed-core-v3.js'));
  const LinuxHost = require('./rcode-linux-host.js');
  const Plugin = require(path.join(__dirname, '..', 'rcode-bridge-plugin.js'));
  const E = require(path.join(RENJIN, 'src', 'rzl-embed.js'));

  // 1) adapter installs as YASEED_HOST and the core's detectHost picks it up
  const host = LinuxHost.install({ yaId: 'ЯID-0001-3QQS' });
  const detected = Core.detectHost();
  console.log('detectHost →', detected.hostId, '/', detected.platform);
  if (detected.hostId !== 'rcode-linux' || detected.platform !== 'linux') throw new Error('detectHost did not pick up the Linux seat');

  // 2) getYaId round-trips through the local bridge (public id only)
  const yaId = await host.getYaId();
  console.log('getYaId →', yaId);
  if (yaId !== 'ЯID-0001-3QQS') throw new Error('getYaId round-trip failed');

  // 3) the allowlist refuses unlisted methods, fail-closed
  let refused = false;
  try { await host.callNative('xcode.build.request', { scheme: 'RCODE' }); } catch (e) { refused = /refused by host allowlist/.test(e.message); }
  console.log('unlisted method refused →', refused);
  if (!refused) throw new Error('allowlist did not refuse an unlisted method');

  // 4) A — restored seat boots from disk and answers read commands
  const lines = fs.readFileSync(path.join(RENJIN, 'src', 'corpus-v2.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#'));
  const eng = new Core.YaSeed({ store: new FileStore(STORE_COPY), corpus: lines.join('\n') });
  await eng.boot();
  const st = await eng.status();
  console.log('restored boot → chain_entries', st.chain_entries, '· chain_ok', st.chain_ok, '· loss', st.loss, '· host', st.host);
  if (!st.chain_ok || st.host !== 'rcode-linux') throw new Error('engine did not boot clean on the Linux seat');
  const statusOut = await eng.command('status');
  if (!/chain_ok: true/.test(statusOut)) throw new Error('status did not report chain_ok: true');
  const verifyOut = await eng.command('chain verify');
  console.log('chain verify →', verifyOut);
  if (!/^Ghost Chain OK/.test(verifyOut)) throw new Error('chain verify failed on the Linux seat');
  const idx = E.index(lines.map((t, i) => ({ id: i + 1, text: t })));
  const top = E.search(idx, 'Which block mints ThundR?', 1)[0];
  console.log('ask → lesson', top.id + ':', JSON.stringify(top.text.slice(0, 72)));
  if (!top || !/ThundR/i.test(top.text)) throw new Error('ask retrieval missed the ThundR mint lesson');

  // 5) A — signing on the restored store fails with the documented cause
  let signFailedAsDocumented = false;
  try { await eng.registerPlugin(Plugin); } catch (e) { signFailedAsDocumented = /not of type CryptoKey/.test(e.message); console.log('restored-store sign refused →', e.message); }
  if (!signFailedAsDocumented) throw new Error('expected the restored-store signing refusal (non-extractable key cannot cross a JSON FileStore)');

  // 6) B — fresh seat, key live in-process: the plugin admission path works
  const fresh = new Core.YaSeed(new Core.MemoryStore());
  await fresh.boot();
  const reg = await fresh.registerPlugin(Plugin);
  console.log('fresh-seat registerPlugin →', JSON.stringify({ ok: reg.ok, id: reg.id, version: reg.version, entry: reg.entry }));
  if (!reg.ok) throw new Error('plugin registration refused: ' + JSON.stringify(reg.log));
  const list = JSON.parse(await fresh.store.get('plugins:list'));
  if (!list.some(p => p.id === 'rcode-bridge' && p.device_sig)) throw new Error('plugins:list missing the device-signed rcode-bridge descriptor');
  const fst = await fresh.status();
  console.log('fresh seat → chain_entries', fst.chain_entries, '· chain_ok', fst.chain_ok, '· host', fst.host);

  console.log('RCODE LINUX SEAT TEST — ALL PASS');
  fs.rmSync(TMP, { recursive: true, force: true });
})().catch(e => { console.error('TEST FAILED:', e.message); try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {} process.exit(1); });
