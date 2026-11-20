// rcode-linux-shell.js — the R:> terminal shell for the RCODE Linux seat.
// Run: ./run.sh  (or: node adapters/linux/rcode-linux-shell.js)
// Boots the RENJIN Core v3 engine from the persistent FileStore
// (src/store-v3.json — the same store the persist build proved reloads
// with its state hash intact), installs the Linux host adapter
// (hostId rcode-linux), and offers a readline R:\> prompt.
//
// Commands: help · status · chain verify · chain tail [n] · host ·
// ask <question> (retrieval over corpus-v2, quotes the best lesson —
// never free generation) · exit / quit. Anything else goes to the
// engine's own /rseed command handler. Training commands (train, grow,
// evolve) write to the device's own store, exactly as EVOLVE does on
// the phone — the chain only grows, nothing is erased.
//
// The rcode-bridge plugin is registered once per store: the shell reads
// plugins:list first and skips registration when rcode-bridge is already
// there, so a relaunch never chains a duplicate plugin.register entry.
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const RENJIN = path.join(__dirname, '..', '..');
const STORE_FILE = process.env.RZL_STORE || path.join(RENJIN, 'src', 'store-v3.json');
const CORPUS_FILE = path.join(RENJIN, 'src', 'corpus-v2.txt');

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

async function main() {
  require(path.join(RENJIN, 'src', 'egg-version.js'));
  const Core = require(path.join(RENJIN, 'src', 'yaseed-core-v3.js'));
  const LinuxHost = require('./rcode-linux-host.js');
  const Plugin = require(path.join(__dirname, '..', 'rcode-bridge-plugin.js'));
  const E = require(path.join(RENJIN, 'src', 'rzl-embed.js'));

  const host = LinuxHost.install();
  const lines = fs.readFileSync(CORPUS_FILE, 'utf8').split('\n').filter(l => l && !l.startsWith('#'));
  const idx = E.index(lines.map((t, i) => ({ id: i + 1, text: t })));

  const eng = new Core.YaSeed({ store: new FileStore(STORE_FILE), corpus: lines.join('\n') });
  await eng.boot();
  const st = await eng.status();
  if (!st.chain_ok) { console.error('Linux seat refused to start: Ghost Chain BROKEN — status / chain verify only.'); process.exit(1); }

  const list = JSON.parse((await eng.store.get('plugins:list')) || '[]');
  if (!list.some(p => p.id === 'rcode-bridge')) {
    try {
      const reg = await eng.registerPlugin(Plugin);
      if (!reg.ok) { console.log('rcode-bridge plugin refused: ' + JSON.stringify(reg.log)); }
      else console.log('rcode-bridge registered on this Linux seat · chain #' + reg.entry);
    } catch (e) {
      // Honest limit, same as the persist build's read-only reload: the
      // device chain key is non-extractable, and a JSON FileStore cannot
      // carry a CryptoKey across processes, so a restored store can
      // verify (public key) but cannot sign a new entry. The seat stays
      // up in read mode — status / chain verify / ask all work. Plugin
      // admission happens on a fresh seat, where the key is live
      // in-process (see test-linux-seat.js, engine B).
      console.log('rcode-bridge not registered on this restored store: ' + (e && e.message ? e.message : e));
      console.log('Seat runs read-only until a fresh seat mints its own key (EVOLVE law).');
    }
  }

  const yaId = await host.getYaId();
  console.log('R:\\> RENJIN Core v3 — Linux seat (rcode-linux) · ' + st.chain_entries + ' chain entries · chain_ok ' + st.chain_ok + ' · loss ' + st.loss);
  console.log('host: ' + JSON.stringify(await host.hostInfo()) + (yaId ? ' · ЯID ' + yaId : ' · ЯID (none on file)'));
  console.log('Type help · status · chain verify · ask <question> · exit');

  // Lines are handled through a chain so a piped stdin (all lines at
  // once, EOF right behind them) cannot close the shell before an
  // awaited command has printed: 'close' waits for the chain to drain.
  let pending = Promise.resolve();
  async function handleLine(line) {
    const text = String(line || '').trim();
    if (!text) return;
    if (/^(exit|quit)$/i.test(text)) { rl.close(); return; }
    try {
      if (/^host$/i.test(text)) { console.log(JSON.stringify(await host.hostInfo(), null, 2)); return; }
      if (/^ask\s+/i.test(text)) {
        const q = text.replace(/^ask\s+/i, '');
        const top = E.search(idx, q, 1)[0];
        console.log(top ? ('lesson ' + top.id + ': ' + top.text) : 'Unknown — the corpus has no line about that.');
        return;
      }
      console.log(await eng.command(text));
    } catch (e) { console.log('error: ' + (e && e.message ? e.message : e)); }
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'R:\\> ' });
  rl.prompt();
  rl.on('line', (line) => { pending = pending.then(() => handleLine(line)).then(() => { if (!rl.closed) rl.prompt(); }); });
  rl.on('close', () => { pending.then(() => { console.log('Linux seat closed. Nothing erased; the chain only grows.'); process.exit(0); }); });
}

main().catch(e => { console.error('LINUX SEAT FAILED:', e && e.message ? e.message : e); process.exit(1); });
