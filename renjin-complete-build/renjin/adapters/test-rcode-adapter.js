// test-rcode-adapter.js — Node proof for the RCODE/Xcode plugin + adapter.
// Run: node adapters/test-rcode-adapter.js   (from the renjin/ dir)
const fs = require('fs');
const vm = require('vm');
global.window = global;
for (const f of ['../src/egg-version.js', '../src/yaseed-core-v3.js']) {
  vm.runInThisContext(fs.readFileSync(require('path').join(__dirname, f), 'utf8'), { filename: f });
}
const Adapter = require('./rcode-host-adapter.js');
const Plugin = require('./rcode-bridge-plugin.js');
const Core = global.YaSeedCore;

(async () => {
  const calls = [];
  const mockBridge = { __mock: true, call: async (method, args) => { calls.push(method); return method === 'getYaId' ? { yaId: 'ЯID-0001-3QQS' } : { ok: true, method }; } };

  // 1) adapter installs as YASEED_HOST and the core's detectHost picks it up
  const host = Adapter.install(mockBridge, { platform: 'ios' });
  const detected = Core.detectHost();
  console.log('detectHost →', detected.hostId, '/', detected.platform);
  if (detected.hostId !== 'rcode-mock') throw new Error('detectHost did not pick up the RCODE adapter');

  // 2) getYaId round-trips through the native bridge (public id only)
  const yaId = await host.getYaId();
  console.log('getYaId →', yaId);
  if (yaId !== 'ЯID-0001-3QQS') throw new Error('getYaId round-trip failed');

  // 3) boot the engine and register the plugin through the core's own path
  const eng = new Core.YaSeed(new Core.MemoryStore());
  await eng.boot();
  const reg = await eng.registerPlugin(Plugin);
  console.log('registerPlugin →', JSON.stringify({ ok: reg.ok, id: reg.id, version: reg.version, entry: reg.entry }));
  if (!reg.ok) throw new Error('plugin registration refused: ' + JSON.stringify(reg.log));
  const list = JSON.parse(await eng.store.get('plugins:list'));
  if (!list.some(p => p.id === 'rcode-bridge' && p.device_sig)) throw new Error('plugins:list missing the device-signed rcode-bridge descriptor');
  const st = await eng.status();
  console.log('plugins on chain ✓ · engine chain_ok', st.chain_ok, '· entries', st.chain_entries);

  // 4) the plugin facade reaches the native side
  const facade = Plugin.create(eng);
  const r = await facade.callNative('xcode.build.request', { scheme: 'RCODE' });
  console.log('callNative →', JSON.stringify(r), '· bridge calls:', calls.join(', '));
  console.log('RCODE ADAPTER TEST — ALL PASS');
})().catch(e => { console.error('TEST FAILED:', e.message); process.exit(1); });
