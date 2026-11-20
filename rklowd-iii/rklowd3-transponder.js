// RKLOWD III transponder (Node seat) — polls RTOR feed + RTRACKR chain export,
// appends hash-chained entries to MANIFEST.jsonl, never overwrites/deletes.
// Run: node rklowd3-transponder.js once   |   RKLOWD3_LOOP=60 node rklowd3-transponder.js
const fs=require('fs'),crypto=require('crypto'),path=require('path');
const DIR=__dirname, MAN=path.join(DIR,'MANIFEST.jsonl');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function tip(){try{const ls=fs.readFileSync(MAN,'utf8').trim().split('\n');const e=JSON.parse(ls[ls.length-1]);return{seq:e.seq,sha256:e.sha256}}catch{return{seq:-1,sha256:'0'.repeat(64)}}}
async function get(u){const r=await fetch(u,{cache:'no-store'});const t=await r.text();return{status:r.status,bytes:Buffer.byteLength(t),sha256:sha(t)}}
async function tick(){
  const out={type:'RTOR-TICK',ts:new Date().toISOString()};
  try{out.rtor_feed=await get('https://rizal.pw/rtor/feed.json')}catch(e){out.rtor_feed={error:String(e.message||e)}}
  try{out.ghostchain_export=await get('https://rizal.pw/rtrackr/data/rghostchain.json')}catch(e){out.ghostchain_export={error:String(e.message||e)}}
  const t=tip(); const e={seq:t.seq+1,prev:t.sha256,...out}; e.sha256=sha(JSON.stringify(e));
  fs.appendFileSync(MAN,JSON.stringify(e)+'\n'); console.log('RKLOWD3 tick seq',e.seq,'rtor',out.rtor_feed.status||'err','chain',out.ghostchain_export.status||'err');
}
(async()=>{await tick(); const loop=parseInt(process.env.RKLOWD3_LOOP||'0'); if(loop>0) setInterval(tick,loop*1000);})();
