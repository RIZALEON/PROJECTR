// build-core-v3-persist.js — core v3 PERSISTENT build (2026-11-19).
// Fixes gap 1: the earlier builds used MemoryStore, so the trained weights
// died with the process. This build runs the same v3 core on a FileStore —
// every chain entry and snapshot lands in src/store-v3.json on disk.
// boot() restores state:current through _loadSnap(), which recomputes the
// model state hash and throws "snapshot tampered" if a single byte moved.
//
// Usage:
//   node build-core-v3-persist.js train    fresh store, grow + train 60s on corpus-v2
//   node build-core-v3-persist.js verify   fresh process: boot from the store file,
//                                          prove the learned state survived + verifies
//   RZL_STORE=<file> node build-core-v3-persist.js verify   (tamper tests)
// Pure RZL, no external model, no network.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

require('./src/egg-version.js'); // core reports 0.1.11

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

const STORE_FILE = process.env.RZL_STORE || path.join(ROOT, 'src', 'store-v3.json');

async function main() {
  const mode = process.argv[2] || 'verify';
  const Core = require('./src/yaseed-core-v3.js');
  const lines = fs.readFileSync(path.join(ROOT, 'src', 'corpus-v2.txt'), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#'));
  const corpusText = lines.join('\n');

  if (mode === 'train') {
    try { fs.unlinkSync(STORE_FILE); } catch (e) {}
    const seed = new Core.YaSeed({ store: new FileStore(STORE_FILE), corpus: corpusText });
    await seed.boot();
    const grow = await seed.grow();
    console.log('grow:', grow.already ? 'already grown' : 'grown', 'loss:', grow.loss != null ? +grow.loss.toFixed(3) : grow.loss);
    const tr = await seed.train(60);
    console.log('train 60s:', JSON.stringify({ steps: tr.steps, loss_before: +tr.loss_before.toFixed(3), loss_after: +tr.loss_after.toFixed(3), held_out: +tr.held_out.toFixed(3) }));
    const st = await seed.status();
    const cur = await seed.store.get('state:current');
    console.log('status:', JSON.stringify({ version: st.version, loss: st.loss, chain_entries: st.chain_entries, chain_ok: st.chain_ok }));
    console.log('persisted: store file', STORE_FILE, fs.statSync(STORE_FILE).size, 'bytes; state:current =', cur);
    console.log('PERSIST TRAIN OK — the learned state is on disk, keyed and hashed on the model chain');
    return;
  }

  if (mode === 'verify') {
    if (!fs.existsSync(STORE_FILE)) { console.error('VERIFY FAILED: no store file at ' + STORE_FILE); process.exit(1); }
    const seed = new Core.YaSeed({ store: new FileStore(STORE_FILE), corpus: corpusText });
    await seed.boot(); // restores state:current via _loadSnap — throws on tamper
    const st = await seed.status();
    console.log('boot from disk:', JSON.stringify({ version: st.version, loss: st.loss, steps: st.steps, chain_entries: st.chain_entries, chain_ok: st.chain_ok, model_loaded: !!seed.model }));
    if (!seed.model) { console.error('VERIFY FAILED: no model restored from the store'); process.exit(1); }
    const s = seed.generateSampled('What is the RGHOSTCHAIN?', 24, 0.8);
    console.log('generateSampled after reload:', JSON.stringify(s.text));
    const E = require('./src/rzl-embed.js');
    const idx = E.index(lines.map((t, i) => ({ id: i + 1, text: t })));
    for (const q of ['Which block mints ThundR?', 'What is the GHOSTKEY ring?', 'Does RTOR write the chain?']) {
      const top = E.search(idx, q, 1)[0];
      console.log('ask:', JSON.stringify(q), '-> lesson', top.id + ':', JSON.stringify(top.text.slice(0, 72)));
    }
    console.log('VERIFY OK — learned state reloaded from disk and verified against the chain (state hash matched)');
    return;
  }

  console.error('unknown mode: ' + mode + ' (use train | verify)');
  process.exit(1);
}
main().catch(e => { console.error((process.argv[2] === 'verify' ? 'VERIFY' : 'BUILD') + ' FAILED:', e.message); process.exit(1); });
