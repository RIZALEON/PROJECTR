// build-rshell-single.js — assemble RSHELL-RENJIN.html (2026-11-19).
// The portable unit Rizal ordered: ONE file — double-click or open it on any
// device and the shell + the trained RENJIN Core v3 model load together.
// Contents: the R:> Shell page (starfield, KB, counter, CHAIN, SIZE) +
// egg-version + yaseed-core-v3 + rzl-embed + corpus-v2 + the persisted
// trained store (store-v3.json) embedded. On load the page seeds its
// IndexedDB from the embedded store (when the file carries a newer
// state:current), boots the model through the core's own verified
// _loadSnap path, and gains three commands: MODEL, SYNC (RTOR/RTRACKR
// hash-pin check + newer chain seat applied in-page), EVOLVE (in-browser
// training on the full corpus, committed to the device store).
// Usage: node build-rshell-single.js
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const SHELL = path.join(ROOT, '..', 'rshell', 'index.html');
const OUT = path.join(ROOT, '..', 'rshell', 'RSHELL-RENJIN.html');
const EXPORT_SHA = '72fdf4a69a784e22124eabe9ae8b41a60972a83834280947311fff1196732e70'; // sha256 of the published rghostchain.json seat

function must(s, anchor, label) { if (!s.includes(anchor)) throw new Error('anchor not found: ' + label); }

let html = fs.readFileSync(SHELL, 'utf8');
const egg = fs.readFileSync(path.join(ROOT, 'src', 'egg-version.js'), 'utf8');
const core = fs.readFileSync(path.join(ROOT, 'src', 'yaseed-core-v3.js'), 'utf8');
const embed = fs.readFileSync(path.join(ROOT, 'src', 'rzl-embed.js'), 'utf8');
const corpus = fs.readFileSync(path.join(ROOT, 'src', 'corpus-v2.txt'), 'utf8');
const store = fs.readFileSync(path.join(ROOT, 'src', 'store-v3.json'), 'utf8');
for (const [name, src] of [['core', core], ['embed', embed], ['egg', egg], ['store', store], ['corpus', corpus]]) {
  if (src.includes('</script')) throw new Error(name + ' contains </script — cannot inline safely');
}

// title
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>RSHELL RENJIN · one-file shell + model</title>');

// libraries + data, injected before the shell's own script
const libs =
  '    <script>\n' + egg + '\n    </script>\n' +
  '    <script>\n' + core + '\n    </script>\n' +
  '    <script>\n' + embed + '\n    </script>\n' +
  '    <script>\n' +
  '      window.__RZL_EMBED_STORE__ = ' + store + ';\n' +
  '      window.__RZL_EMBED_CORPUS__ = ' + JSON.stringify(corpus) + ';\n' +
  '      window.__RZL_EXPORT_SHA__ = ' + JSON.stringify(EXPORT_SHA) + ';\n' +
  '    </script>\n';
const scriptTag = '    <script>\n';
if (html.split(scriptTag).length - 1 !== 1) throw new Error('expected exactly one shell script tag');
html = html.replace(scriptTag, libs + scriptTag);

// HELP lines
const helpAnchor = "          '  SIZE ............... live size + metrics (running counter)',";
must(html, helpAnchor, 'HELP SIZE line');
html = html.replace(helpAnchor, helpAnchor + "\n          '  MODEL .............. the trained model, alive in this file',\n          '  SYNC ............... check RTOR + RTRACKR, apply a newer chain seat',\n          '  EVOLVE ............. train on the full corpus, here in this device',", 1);

// MODEL / SYNC / EVOLVE handlers, before the SIZE handler
const sizeAnchor = "          if (lower === 'size' || lower === 'metrics') {";
must(html, sizeAnchor, 'SIZE handler');
const handlers = `          if (lower === 'model') {
            if (!MODEL.ready) { print('MODEL — not booted yet (still loading, or this browser blocked the store). The shell knowledge answers meanwhile.'); return; }
            print('MODEL — RENJIN Core v3 alive in this one file: egg 0.1.11 · loss ' + MODEL.loss + ' · model chain ' + MODEL.entries + ' entries · store: ' + MODEL.storeKind + ' · corpus ' + CORPUS_V2.lessons + ' lessons. When the record has no exact entry it answers from its own corpus; EVOLVE trains it here; SYNC refreshes its chain seat.');
            return;
          }
          if (lower === 'sync') { syncNow(); return; }
          if (lower === 'evolve') { evolveNow(); return; }
`;
html = html.replace(sizeAnchor, handlers + sizeAnchor, 1);

// model fallback on a record miss
const missAnchor = `          if (lower.indexOf('ask ') === 0 || /^(what|who|how|why|when|where|is|does|can)\\b/.test(lower)) {
            print('No grounded answer for that in the PROJECT R record I hold. Try: ghost chain, tokenizer, corpus, model, mint, ЯVM, ЯLINK, gameplan.');
            return;
          }`;
must(html, missAnchor, 'miss path');
const missNew = `          if (lower.indexOf('ask ') === 0 || /^(what|who|how|why|when|where|is|does|can)\\b/.test(lower)) {
            if (MODEL.ready && MODEL.askIndex && window.RzlEmbed) { var topHit = window.RzlEmbed.search(MODEL.askIndex, q, 1)[0]; if (topHit && topHit.score > 0.3) { print('No exact record for that; the closest lesson the model itself holds is #' + topHit.id + ': "' + topHit.text + '"'); return; } }
            print('No grounded answer for that in the PROJECT R record I hold. Try: ghost chain, tokenizer, corpus, model, mint, ЯVM, ЯLINK, gameplan.');
            return;
          }`;
html = html.replace(missAnchor, missNew, 1);

// model boot + sync + evolve, appended inside the shell IIFE
const tailAnchor = '        rzlCounterRender();\n\n      })();';
must(html, tailAnchor, 'IIFE tail');
const modelBlock = `        rzlCounterRender();

        /* ---- RSHELL RENJIN model pack (generated by build-rshell-single.js) ---- */
        var MODEL = { ready: false, seed: null, storeKind: 'none', loss: null, entries: 0, askIndex: null };
        async function modelBoot() {
          try {
            var Core = window.YaSeedCore;
            if (!Core) { print('MODEL — the engine did not load in this file. The shell knowledge still answers.'); return; }
            var emb = window.__RZL_EMBED_STORE__;
            var store, cur = null;
            try {
              store = new Core.IDBStore('yaseed-0.1');
              cur = await store.get('state:current');
              if (cur !== emb['state:current']) { for (var k in emb) await store.set(k, emb[k]); MODEL.storeKind = 'IndexedDB (seat updated from this file)'; }
              else MODEL.storeKind = 'IndexedDB';
            } catch (e) {
              store = new Core.MemoryStore();
              for (var k2 in emb) await store.set(k2, emb[k2]);
              MODEL.storeKind = 'memory (IndexedDB unavailable in this browser)';
            }
            var sd = new Core.YaSeed({ store: store, corpus: window.__RZL_EMBED_CORPUS__ });
            await sd.boot();
            var st = await sd.status();
            MODEL.seed = sd; MODEL.ready = true; MODEL.loss = st.loss; MODEL.entries = st.chain_entries;
            if (window.RzlEmbed) { var ls = window.__RZL_EMBED_CORPUS__.split('\\n').filter(function (l) { return l && l.charAt(0) !== '#'; }); MODEL.askIndex = window.RzlEmbed.index(ls.map(function (t, i) { return { id: i + 1, text: t }; })); }
            print('MODEL — booted from this one file: egg ' + st.version + ' · loss ' + st.loss + ' · chain ' + st.chain_entries + ' entries · chain_ok ' + st.chain_ok + ' · store: ' + MODEL.storeKind + '. Type MODEL, SYNC or EVOLVE.');
          } catch (e) { print('MODEL — boot failed in this browser: ' + e.message + ' · the shell knowledge still answers.'); }
        }
        async function syncNow() {
          print('SYNC — checking RTOR + RTRACKR…');
          try {
            var feed = await (await fetch('https://rizal.pw/rtor/feed.json', { cache: 'no-store' })).json();
            var entry = null; for (var i = 0; i < feed.entries.length; i++) if (feed.entries[i].id === 'rtrackr.rghostchain') entry = feed.entries[i];
            print('  RTOR feed ' + feed.version + ' · ' + feed.entries.length + ' entries · signed: ' + feed.signed + (feed.signed ? '' : ' — owner signatures PENDING, so this check is hash-pin only, fail-closed as published'));
            var buf = await (await fetch('https://rizal.pw/rtrackr/data/rghostchain.json', { cache: 'no-store' })).arrayBuffer();
            var digest = await crypto.subtle.digest('SHA-256', buf);
            var hex = Array.from(new Uint8Array(digest)).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
            if (!entry || hex.indexOf(entry.sha256) !== 0) { print('  export sha256 ' + hex.slice(0, 16) + '… does NOT match the RTOR pin — seat update refused.'); return; }
            print('  export sha256 ' + hex.slice(0, 16) + '… · RTOR pin MATCHES');
            if (hex === window.__RZL_EXPORT_SHA__) { print('  chain seat is current — height ' + (RGHOSTCHAIN.length - 1) + ', export ' + RGHOSTCHAIN_EXPORTED + '.'); return; }
            var data = JSON.parse(new TextDecoder().decode(buf));
            RGHOSTCHAIN.length = 0;
            data.blocks.forEach(function (b) { var p = b.payload || {}; RGHOSTCHAIN.push({ n: b.index, type: b.type, ts: String(b.ts).slice(0, 10), label: p.label || p.kind || b.type, hash: b.hash, prev: b.prev_hash }); });
            RGHOSTCHAIN_TIP = data.tip; RGHOSTCHAIN_EXPORTED = data.exported_at; window.__RZL_EXPORT_SHA__ = hex;
            rzlCounterRender();
            print('  NEWER export applied to this shell: height ' + data.height + ' (export ' + data.exported_at + '). Corpus + weights refresh on the next published build.');
          } catch (e) { print('  SYNC — unreachable (' + e.message + '). Running on the embedded seat: export ' + RGHOSTCHAIN_EXPORTED + ', height ' + (RGHOSTCHAIN.length - 1) + '. Nothing needed from the network.'); }
        }
        function evolveNow() {
          if (!MODEL.ready) { print('EVOLVE — the model is not booted in this browser; the shell knowledge still answers.'); return; }
          print('EVOLVE — training on the full corpus in this browser (15 seconds)…');
          MODEL.seed.train(15).then(function (tr) {
            MODEL.loss = tr.loss_after;
            print('EVOLVE — done: ' + tr.steps + ' steps · loss ' + (+tr.loss_before.toFixed(3)) + ' → ' + (+tr.loss_after.toFixed(3)) + ' · held-out ' + (+tr.held_out.toFixed(3)) + ' · committed to this device store — its chain grew here. The file itself is unchanged; a published build carries evolution to every device.');
          }).catch(function (e) { print('EVOLVE — failed: ' + e.message); });
        }
        modelBoot();

      })();`;
html = html.replace(tailAnchor, modelBlock, 1);

fs.writeFileSync(OUT, html);
console.log('RSHELL-RENJIN.html written:', OUT, fs.statSync(OUT).size, 'bytes');
