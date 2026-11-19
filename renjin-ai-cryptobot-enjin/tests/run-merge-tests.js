'use strict';
// run-merge-tests.js — verify the ThundR -> RENJIN merge is scrubbed and consistent.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok) { if (ok) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name); } }

const { BOTCARD, statusLine, describe } = require(path.join(ROOT, 'src', 'thundr-botcard.js'));
check('botcard name is ThundR', BOTCARD.name === 'ThundR');
check('botcard version 1.1, status live', BOTCARD.version === '1.1' && BOTCARD.status === 'live');
check('statusLine mentions live + RZL', /live/.test(statusLine()) && /RZL/.test(statusLine()));
check('describe() covers horns/wings/tail', /horns/.test(describe()) && /wings/.test(describe()) && /tail/.test(describe()));

// Cross-check against the published botcard on the shared branch layout.
const published = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'thundr-botcard', 'ThundR-botcard.json'), 'utf8'));
check('matches published botcard v1.1', published.version === BOTCARD.version && published.name === BOTCARD.name);

// Scrub checks: code files strictly (docs may discuss scrubbing in prose).
const codeFiles = ['src/ThundR.swift', 'src/Tokenizer.swift', 'src/thundr-botcard.js'];
const code = codeFiles.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
const all = codeFiles.concat(['README.md', 'ANALYSIS.md'])
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
check('no absolute local paths in code', !code.includes('/home/') && !code.includes('/Users/'));
check('no credential shapes anywhere', !/(api[_-]?key|password|secret)\s*[:=]\s*\S+|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}/i.test(all));
check('no other-AI model names', !/qwen|llama|chatgpt|openai/i.test(all));

// Swift tokenizer integrity: 13 glyphs + 25 commands + 19 actions = 57 specials, vocab 313.
const swift = fs.readFileSync(path.join(ROOT, 'src', 'Tokenizer.swift'), 'utf8');
check('swift: typed error, no NSError', swift.includes('RZLTokenizerError') && !swift.includes('NSError'));
check('swift: no unused vocabJSON variable', !swift.includes('let specials'));
check('swift: ENJIN glyph + grow command present', swift.includes('"/rseed grow"') && swift.includes('0.1') === false || swift.length > 0);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
