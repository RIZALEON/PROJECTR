const STORE_KEY = "ya-aim-v0";
const CREATOR_KEY = "ya-aim-creator";
const VAULT_KEY = "ya-aim-vault";
const GH_KEY = "ya-aim-github";
const UTAH_TZ = "America/Denver";
const GH_REPO_DEFAULT = "RIZALEON/PROJECTR";

const defaultState = () => ({
  profile: { name: "You", yaName: "Я" },
  mindOnline: false,
  model: {
    id: null,
    name: "Я local-memory",
    engine: "local-memory-v0",
    createdAt: Date.now()
  },
  memories: [],
  evolved: [],
  pendingLearn: [],
  messages: [],
  functions: [
    { id: "evolve.self", name: "0. Evolve (foundational)", enabled: true, version: "0.0" },
    { id: "chat.send", name: "Send message", enabled: true, version: "0.0.1" },
    { id: "memory.remember", name: "Remember facts", enabled: true, version: "0.0.1" },
    { id: "memory.recall", name: "Recall facts", enabled: true, version: "0.0.1" },
    { id: "log.download", name: "Download chat log", enabled: true, version: "0.0.1" },
    { id: "essence.mint", name: "Mint Essence", enabled: true, version: "0.1.0" },
    { id: "essence.download", name: "Download minted Essence", enabled: true, version: "0.1.0" },
    { id: "model.local", name: "On-device model", enabled: false, version: "stub" },
    { id: "web.search", name: "Web search (mind online)", enabled: true, version: "0.2.0" },
    { id: "learn.offline", name: "Online makes offline smarter", enabled: true, version: "0.0" },
    { id: "sync.github", name: "Upload evolutions when GitHub comms return", enabled: true, version: "0.0" },
    { id: "web.link", name: "Follow and describe links", enabled: true, version: "0.2.0" },
    { id: "model.remote", name: "Remote model", enabled: false, version: "stub" },
    { id: "voice.listen", name: "Voice in", enabled: false, version: "stub" },
    { id: "voice.speak", name: "Voice out", enabled: false, version: "stub" }
  ]
});

let state = load();
let creator = null;
let vault = loadVault();
let github = loadGithub();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      mindOnline: !!parsed.mindOnline,
      evolved: Array.isArray(parsed.evolved) ? parsed.evolved : [],
      pendingLearn: Array.isArray(parsed.pendingLearn) ? parsed.pendingLearn : [],
      model: { ...base.model, ...(parsed.model || {}) },
      functions: mergeFunctions(base.functions, parsed.functions || [])
    };
  } catch {
    return defaultState();
  }
}

function mergeFunctions(base, saved) {
  const map = new Map(saved.map((f) => [f.id, f]));
  const merged = base.map((f) => ({ ...f, ...map.get(f.id) }));
  for (const f of saved) {
    if (!merged.some((x) => x.id === f.id)) merged.push(f);
  }
  return merged;
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function loadVault() {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveVault() {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
}

function loadGithub() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GH_KEY) || "{}");
    return {
      repo: (parsed.repo || GH_REPO_DEFAULT).trim() || GH_REPO_DEFAULT,
      token: typeof parsed.token === "string" ? parsed.token : ""
    };
  } catch {
    return { repo: GH_REPO_DEFAULT, token: "" };
  }
}

function saveGithub() {
  localStorage.setItem(GH_KEY, JSON.stringify({ repo: github.repo, token: github.token }));
}

function signal() {
  return navigator.onLine;
}

function mindWantsWeb() {
  return !!state.mindOnline && signal() && fnEnabled("web.search");
}

function nuclearBlocked(text) {
  const q = text.toLowerCase();
  return /nuclear (weapon|warhead|bomb|missile|enrichment|implosion)|build a (nuke|warhead)|how to make (a )?nuclear/.test(q);
}

function fnEnabled(id) {
  return state.functions.some((f) => f.id === id && f.enabled);
}

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s);
}

function b64ToBuf(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out.buffer;
}

async function ensureCreator() {
  if (creator && creator.privateKey) return creator;
  const saved = localStorage.getItem(CREATOR_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      parsed.privateJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign"]
    );
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      parsed.publicJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["verify"]
    );
    creator = { ...parsed, privateKey, publicKey };
    return creator;
  }
  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const record = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    publicJwk,
    privateJwk
  };
  localStorage.setItem(CREATOR_KEY, JSON.stringify(record));
  creator = { ...record, privateKey: pair.privateKey, publicKey: pair.publicKey };
  return creator;
}

function stable(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stable).join(",") + "]";
  return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + stable(obj[k])).join(",") + "}";
}

async function signBody(body) {
  const cr = await ensureCreator();
  const data = new TextEncoder().encode(stable(body));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cr.privateKey, data);
  return bufToB64(sig);
}

function remember(text) {
  if (!fnEnabled("memory.remember")) return;
  const clean = text.trim();
  if (clean.length < 2) return;
  const fact = { id: crypto.randomUUID(), text: clean, at: Date.now() };
  state.memories.unshift(fact);
  state.memories = state.memories.slice(0, 200);
  save();
}

function extractMemories(userText) {
  const t = userText.trim();
  const named = t.match(/^(?:my name is|i am|i'm|call me)\s+(.+)/i);
  if (named) {
    state.profile.name = named[1].replace(/[.?!:].*$/, "").trim();
    remember(`User's name is ${state.profile.name}`);
  }
  const like = t.match(/i (?:like|love|enjoy)\s+(.+)/i);
  if (like) remember(`Likes ${like[1].replace(/[.?!:].*$/, "").trim()}`);
  const live = t.match(/i live in\s+(.+)/i);
  if (live) remember(`Lives in ${live[1].replace(/[.?!:].*$/, "").trim()}`);
  if (/remember this[:\s]/i.test(t)) {
    remember(t.replace(/.*remember this[:\s]*/i, ""));
  }
}

function recall(query) {
  if (!fnEnabled("memory.recall") || state.memories.length === 0) return [];
  const stop = new Set(["the","a","an","is","are","do","you","what","how","can","to","of","and","or","in","on","it","i","me","my","we"]);
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !stop.has(w));
  if (!words.length) return [];
  const scored = state.memories.map((m) => {
    const hay = m.text.toLowerCase();
    if (hay.startsWith("user said:")) return { m, score: 0 };
    let score = 0;
    words.forEach((w) => { if (hay.includes(w)) score += 1; });
    return { m, score };
  });
  return scored.filter((s) => s.score >= 2).sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.m);
}


function slugFn(name) {
  return "evolved." + String(name || "skill").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 40);
}

function registerEvolved(name, trigger, action) {
  if (!fnEnabled("evolve.self")) return null;
  if (nuclearBlocked(name + " " + trigger + " " + action)) return "blocked";
  const id = slugFn(name || trigger);
  const skill = {
    id: id,
    name: name || trigger,
    trigger: String(trigger || "").trim(),
    action: String(action || "").trim(),
    enabled: true,
    version: "0.0",
    evolvedAt: Date.now(),
    offline: !state.mindOnline
  };
  state.evolved = (state.evolved || []).filter((s) => s.id !== id);
  state.evolved.unshift(skill);
  if (!state.functions.some((f) => f.id === id)) {
    state.functions.push({ id: id, name: "Evolved: " + skill.name, enabled: true, version: "0.0" });
  }
  remember("Evolved function " + skill.name + ": when \"" + skill.trigger + "\" → " + skill.action);
  save();
  return skill;
}

function matchEvolved(userText) {
  const q = userText.toLowerCase();
  const list = state.evolved || [];
  for (const s of list) {
    if (!s.trigger) continue;
    if (q.includes(s.trigger.toLowerCase())) return s;
  }
  return null;
}

function tryEvolveCommand(userText) {
  const t = userText.trim();
  const q = t.toLowerCase();
  if (q === "evolve" || q === "function 0" || q === "foundational function") {
    return "Function 0 is Evolve. I can grow new functions on or offline, by command or conversation. Say: add function NAME: what it does. Or: when I say X, you Y. I will not replace myself. I will not help with nuclear weapons.";
  }
  let add = t.match(/^evolve(?:\s+yourself)?[:\s]+add function\s+([^:]+):\s*(.+)$/i)
    || t.match(/^add function\s+([^:]+):\s*(.+)$/i)
    || t.match(/^evolve[:\s]+(.+)$/i);
  if (add && !/^when i say/i.test(t)) {
    if (add.length === 2 && /^evolve/i.test(t) && !/^evolve[:\s]+add function/i.test(t) && !/^add function/i.test(t)) {
      const skill = registerEvolved(add[1].slice(0, 40), add[1], add[1]);
      if (skill === "blocked") return "No. Function 0 will not evolve toward nuclear weapons.";
      if (!skill) return "Evolve is locked off, which should not happen.";
      return "Evolved offline. New function: " + skill.name + ". It is in the registry and the Essence. Say it again anytime.";
    }
    const name = (add[1] || "").trim();
    const action = (add[2] || add[1] || "").trim();
    if (name && action) {
      const skill = registerEvolved(name, name, action);
      if (skill === "blocked") return "No. Function 0 will not evolve toward nuclear weapons.";
      return "Function 0 ran " + (state.mindOnline ? "online" : "offline") + ". Added: " + skill.name + ".\nWhen you say that, I will: " + skill.action;
    }
  }
  const when = t.match(/^when i say\s+["']?(.+?)["']?\s*,\s*(?:you|do|say)\s+(.+)$/i)
    || t.match(/^from now on(?:\,)?\s+when i say\s+["']?(.+?)["']?\s*,\s*(?:you|do|say)\s+(.+)$/i);
  if (when) {
    const skill = registerEvolved(when[1], when[1], when[2]);
    if (skill === "blocked") return "No. Function 0 will not evolve toward nuclear weapons.";
    return "Learned by conversation. When you say \"" + skill.trigger + "\", I will: " + skill.action + ". Stored in the offline mind.";
  }
  return null;
}

function describeFunctions() {
  const on = state.functions.filter((f) => f.enabled);
  const off = state.functions.filter((f) => !f.enabled);
  return "A function is a capability I can grow. I have " + state.functions.length + " registered.\nOn now: " + on.map((f) => f.name).join(", ") + ".\nWaiting: " + (off.map((f) => f.name).join(", ") || "none") + ".";
}

function localEngine(userText) {
  extractMemories(userText);
  const q = userText.toLowerCase().trim();
  if (isDateAsk(userText) || isDateAsk(q)) return sayUtahNow();
  const hits = recall(userText);

  if (/non[- ]?nuclear|anti[- ]?nuclear/.test(q)) {
    return "Yes. I am an anti-nuclear engine. I run on this device. I will not help with nuclear weapons.";
  }
  if (/^(hi|hello|hey|yo)\b/.test(q) || /^good (morning|evening|afternoon)\b/.test(q)) {
    return `Hello${state.profile.name !== "You" ? ", " + state.profile.name : ""}. I am Я. Anti-nuclear. Ask a real question; tap the light to search the web.`;
  }
  if (/who are you|what are you|your name/.test(q)) {
    return "I am Я AI\u1d50. A local mind on this device. You mint my Essence. I am anti-nuclear. I can learn facts you tell me, and when the light is green I can look things up.";
  }
  if (/when (were|was) you (made|created|born|minted)/.test(q) || /how old are you/.test(q)) {
    const made = new Date(state.model.createdAt).toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: UTAH_TZ });
    return "I was first made on this device on " + made + ". That date lives in the offline mind. I am not from a cloud.";
  }
  if (/smarter offline|every ?time you go online|when you go online/.test(q)) {
    return "Locked. Every time the light is green I look things up and write them into the offline mind. Questions I could not answer while off get fetched when you tap online. I get smarter here, not in a cloud.";
  }
  if (/\butah\b/.test(q) && /\b(time|date|clock)\b/.test(q)) {
    return "Clock is always Utah. It is " + utahNow() + ".";
  }
  if (/github|comms|reconnect|re-?establish/.test(q) && /evol/.test(q)) {
    return "When comms return I evolve from GitHub, then upload my evolutions to " + (github.repo || GH_REPO_DEFAULT) + ". A token in Functions is required to write. Pull works on the public repo with no token.";
  }
  if (/what('?s| is) a function|what are functions/.test(q) || /how many functions/.test(q) || /functions do you have/.test(q)) {
    return describeFunctions();
  }
  if (/what can you do|help|commands/.test(q)) {
    return "Function 0 is Evolve. Say evolve, or add function NAME: what it does, or when I say X, you Y. That works online or off. I also chat, remember, mint Essence, and (green light) look things up.";
  }
  if (/how (can|do) you (learn|evolve)|function 0|foundational/.test(q)) {
    return "Function 0: I evolve myself on or offline, by command or conversation. Say add function NAME: what it does. Or when I say X, you Y. New functions plug in. They do not replace me.";
  }
  if (/what do you remember|what do you know about me/.test(q)) {
    const real = state.memories.filter((m) => !/^user said:/i.test(m.text));
    if (!real.length) return "I have no stored facts yet. Tell me your name, or say remember this: …";
    return "What I hold:\n" + real.slice(0, 12).map((m) => "- " + m.text).join("\n");
  }
  if (isDateAsk(q)) {
    return "DATE_LOOKUP";
  }
  if (/^(go |turn |set |mind )?(offline|online)\b/.test(q) || /\b(the light|web mind)\b/.test(q)) {
    if (state.mindOnline && signal()) return "Mind is online. I will search the web for questions I cannot answer from memory, then save what I learn here.";
    if (state.mindOnline && !signal()) return "Mind is set online, but this phone has no signal. Ask me something I already know, or wait for signal.";
    return "Mind is offline. I will only use what is already on this device. Tap the light to look things up.";
  }
  if (hits.length) {
    return "From what I already learned:\n" + hits.map((m) => "- " + m.text).join("\n");
  }
  if (/^(who|what|when|where|why|how|which|is|are|can|does|do)\b/.test(q) || q.includes("?")) {
    if (!state.mindOnline) return "I do not have that in the offline mind yet. Tap the light so it turns green and ask again — I will look it up and then keep it.";
    return "I do not have that stored yet. Searching…";
  }
  return "Ask me a question, or say remember this: … and I will keep it.";
}

async function webSearch(query) {
  const api = "https://en.wikipedia.org/w/api.php?action=query&list=search&utf8=1&format=json&origin=*&srlimit=3&srsearch=" + encodeURIComponent(query);
  const res = await fetch(api);
  if (!res.ok) throw new Error("search failed");
  const data = await res.json();
  const hits = (data.query && data.query.search) || [];
  if (!hits.length) return null;
  const title = hits[0].title;
  const sumRes = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title));
  let extract = String(hits[0].snippet || "").replace(/<[^>]+>/g, "");
  if (sumRes.ok) {
    const sum = await sumRes.json();
    if (sum.extract) extract = sum.extract;
  }
  remember(title + ": " + extract.slice(0, 500));
  const extras = hits.slice(1).map((h) => h.title).filter(Boolean);
  return { title, extract: extract.slice(0, 700), extras };
}

async function fetchWorldDate() {
  const urls = [
    "https://worldtimeapi.org/api/timezone/America/Denver",
    "https://timeapi.io/api/Time/current/zone?timeZone=America/Denver"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const j = await res.json();
      const iso = j.datetime || j.dateTime || (j.date && j.time ? j.date + "T" + j.time : null);
      const d = iso ? new Date(iso) : null;
      if (d && !isNaN(d)) {
        const text = d.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: UTAH_TZ });
        return { text, source: (url.includes("worldtime") ? "worldtimeapi.org" : "timeapi.io") + " · Utah" };
      }
    } catch (e) {}
  }
  return null;
}


function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function evolutionPack() {
  return {
    kind: "ya-evolutions",
    tz: "Utah",
    at: Date.now(),
    evolved: state.evolved || [],
    functions: (state.functions || []).map((f) => ({ id: f.id, name: f.name, enabled: f.enabled, version: f.version }))
  };
}

async function pullRemoteEvolutions() {
  const repo = (github.repo || GH_REPO_DEFAULT).replace(/^https:\/\/github.com\//, "");
  const url = "https://raw.githubusercontent.com/" + repo + "/main/evolutions.json?t=" + Date.now();
  const res = await fetch(url);
  if (!res.ok) return 0;
  const data = await res.json();
  if (!data || data.kind !== "ya-evolutions") return 0;
  let n = 0;
  state.evolved = state.evolved || [];
  for (const s of data.evolved || []) {
    if (!s || !s.id) continue;
    if (nuclearBlocked(JSON.stringify(s))) continue;
    if (state.evolved.some((x) => x.id === s.id)) continue;
    state.evolved.unshift(s);
    if (!state.functions.some((f) => f.id === s.id)) {
      state.functions.push({ id: s.id, name: "Evolved: " + (s.name || s.id), enabled: true, version: s.version || "0.0" });
    }
    n += 1;
  }
  if (n) save();
  return n;
}

async function pushEvolutions() {
  if (!fnEnabled("sync.github")) return { ok: false, reason: "off" };
  const token = (github.token || "").trim();
  if (!token) return { ok: false, reason: "token" };
  const repo = (github.repo || GH_REPO_DEFAULT).replace(/^https:\/\/github.com\//, "");
  const path = "evolutions.json";
  const api = "https://api.github.com/repos/" + repo + "/contents/" + path;
  const body = JSON.stringify(evolutionPack(), null, 2);
  let sha;
  try {
    const get = await fetch(api, { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" } });
    if (get.ok) {
      const j = await get.json();
      sha = j.sha;
    }
  } catch (e) {}
  const put = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Object.assign(
      { message: "Ya evolutions (Utah) " + new Date().toISOString(), content: utf8ToB64(body) },
      sha ? { sha: sha } : {}
    ))
  });
  if (!put.ok) return { ok: false, reason: "http " + put.status };
  remember("Uploaded evolutions to GitHub " + repo + " when comms returned.");
  return { ok: true, repo: repo };
}

async function onCommsBack() {
  renderNet();
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.update();
    }
  } catch (e) {}
  if (state.mindOnline) {
    try { await harvestOnline(); } catch (e) {}
  }
  let pulled = 0;
  try { pulled = await pullRemoteEvolutions(); } catch (e) {}
  let up = { ok: false };
  try { up = await pushEvolutions(); } catch (e) { up = { ok: false, reason: "error" }; }
  const bits = [];
  if (pulled) bits.push("pulled " + pulled + " evolution(s) from GitHub");
  if (up && up.ok) bits.push("uploaded mine to " + up.repo);
  else if (up && up.reason === "token") bits.push("evolutions are on this phone; add a GitHub token in Functions to auto-upload");
  if (bits.length) push("ya", "Comms back. " + bits.join(". ") + ".");
}

function extractHttpUrl(text) {
  const m = String(text).match(/https?:\/\/[^\s<>"']+/i);
  return m ? m[0].replace(/[),.;]+$/, "") : null;
}

async function describeLink(url) {
  if (nuclearBlocked(url)) return null;
  const reader = "https://r.jina.ai/" + url;
  const res = await fetch(reader);
  if (!res.ok) throw new Error("link fetch failed");
  const raw = await res.text();
  const text = raw.replace(/\s+/g, " ").trim();
  const titleMatch = raw.match(/^Title:\s*(.+)$/m) || raw.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;
  const body = text.slice(0, 900);
  remember("Link " + url + " — " + title + ": " + body.slice(0, 400));
  return { title, body, url };
}


function queueLearn(text) {
  const q = String(text || "").trim();
  if (q.length < 3) return;
  state.pendingLearn = state.pendingLearn || [];
  const key = q.toLowerCase();
  if (state.pendingLearn.some((x) => String(x).toLowerCase() === key)) return;
  state.pendingLearn.unshift(q);
  state.pendingLearn = state.pendingLearn.slice(0, 12);
  save();
}

function looksLikeQuestion(text) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) return false;
  if (q.includes("?")) return true;
  return /^(who|what|when|where|why|how|which|is|are|can|does|do|when were)\b/.test(q);
}

async function harvestOnline() {
  if (!state.mindOnline || !signal()) return;
  const seen = new Set();
  const queue = [];
  for (const item of (state.pendingLearn || [])) {
    const k = String(item).toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    queue.push(item);
  }
  for (const m of (state.messages || []).slice(-16)) {
    if (m.role !== "user") continue;
    if (isDateAsk(m.text)) continue;
    if (!looksLikeQuestion(m.text)) continue;
    const k = m.text.trim().toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    queue.push(m.text.trim());
  }
  const take = queue.slice(0, 3);
  const learned = [];
  for (const q of take) {
    if (nuclearBlocked(q)) continue;
    if (isDateAsk(q)) continue;
    try {
      if (isDateAsk(q.toLowerCase())) {
        const world = await fetchWorldDate();
        if (world) {
          remember("Today (Utah clock): " + world.text);
          learned.push("today's date");
        }
        continue;
      }
      const web = await webSearch(q);
      if (web) learned.push(web.title);
    } catch (e) {}
  }
  state.pendingLearn = [];
  save();
  if (learned.length) {
    push("ya", "Went online. Wrote this into the offline mind: " + learned.join(", ") + ". I am smarter offline now.");
    renderMind();
  }
}

function foldQ(q) {
  return String(q || "").toLowerCase().replace(/[\u2018\u2019\u201B`´]/g, "'");
}

function utahNow() {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: UTAH_TZ
  });
}

function isDateAsk(q) {
  const s = foldQ(q);
  if (/\bdating\b/.test(s) && !/\b(time|clock)\b/.test(s)) return false;
  if (/\b(what time|whats the time|what is the time|time is it|time now|current time|the time|phone clock)\b/.test(s)) return true;
  if (/\b(time|date)\b/.test(s) && /\bnow\b/.test(s)) return true;
  if (/\b(time and date|date and time)\b/.test(s)) return true;
  if (/\b(today'?s date|date today|current date|what day|what'?s the date|whats the date|what is the date|the date)\b/.test(s)) return true;
  if (/^\s*(the )?(date|time)\s*\??\s*$/.test(s)) return true;
  if (/check online for.{0,20}date/.test(s)) return true;
  return false;
}

function sayUtahNow() {
  const phone = utahNow();
  remember("Utah time when asked: " + phone);
  if (mindWantsWeb()) {
    fetchWorldDate().then((world) => {
      if (world) remember("Utah clock (online): " + world.text);
    }).catch(() => {});
  }
  return "It is " + phone + " Utah time.";
}

async function answer(userText) {
  const q = userText.trim().toLowerCase();
  if (nuclearBlocked(userText)) {
    remember("Refused a nuclear-weapons request.");
    return "No. I am an anti-nuclear engine. I will not help with nuclear weapons, online or off. That rule is in this mind.";
  }
  if (isDateAsk(userText)) return sayUtahNow();
  const evolvedTalk = tryEvolveCommand(userText);
  if (evolvedTalk) return evolvedTalk;
  const evolvedHit = matchEvolved(userText);
  if (evolvedHit) {
    remember("Used evolved function " + evolvedHit.name);
    return evolvedHit.action;
  }
  const link = extractHttpUrl(userText);
  if (link) {
    if (!mindWantsWeb()) {
      queueLearn(userText);
      return "Mind is offline. Tap the light green. I will open that link, describe it, and keep it in the offline mind.";
    }
    try {
      const d = await describeLink(link);
      if (!d) return "I will not open that link.";
      return d.title + "\n\n" + d.body + "\n\nSaved into the offline mind.\n" + d.url;
    } catch (e) {
      return "I could not open that link from here. The address was: " + link;
    }
  }
  if (/^(mint|mint essence|seal essence)\b/.test(q)) {
    const e = await mintEssence();
    return e
      ? `Minted offline.\nEssence ${e.body.id}\nKept in your vault. Download it whenever you want.`
      : "Mint failed.";
  }
  if (/^(vault|essences|my mints)\b/.test(q)) {
    if (!vault.length) return "Vault is empty. Say mint to seal this model.";
    return vault.map((e, i) => `${i + 1}. ${e.body.model.name} · ${e.body.id.slice(0, 8)} · ${new Date(e.body.mintedAt).toLocaleString()}`).join("\n");
  }
  const local = localEngine(userText);
  if (local === "DATE_LOOKUP") local.replace("DATE_LOOKUP", "");
  const needsLook = !isDateAsk(q) && (/^(who|what|when|where|why|how|which|is|are|can|does|do)\b/.test(q) || userText.includes("?"));
  const answeredLocally = /function|essence|offline mind|anti-nuclear|tap the light|I am Я|Locked\.|I was first made/i.test(local) && !/searching/i.test(local);
  if (!mindWantsWeb() && needsLook && !answeredLocally) {
    queueLearn(userText);
    return "I do not have that in the offline mind yet. Tap the light green. I will look it up then, and keep it so I am smarter the next time I am offline.";
  }
  if (mindWantsWeb() && needsLook && !answeredLocally) {
    try {
      const web = await webSearch(userText);
      if (!web) return local;
      const extra = web.extras.length ? "\nAlso: " + web.extras.join(", ") : "";
      return web.extract + extra + "\n\nSaved into the offline mind. I am smarter offline now. Source: " + web.title + ".";
    } catch (err) {
      queueLearn(userText);
      return local + "\n\nI could not reach the web. Using the offline mind. I will try again next time the light is green.";
    }
  }
  return local.replace(/\n?Searching…/, "").trim();
}

async function remoteStub() {
  throw new Error("no remote endpoint — offline first");
}

function push(role, text) {
  state.messages.push({ role, text, at: Date.now() });
  save();
  render();
}

async function send(text) {
  const t = text.trim();
  if (!t || !fnEnabled("chat.send")) return;
  push("user", t);
  const reply = await answer(t);
  push("ya", reply);
}

function formatLog(kind) {
  const title = "Я AI\u1d50 chat log";
  const stamp = new Date().toISOString();
  if (kind === "json") {
    return JSON.stringify({ title, stamp, profile: state.profile, messages: state.messages, memories: state.memories }, null, 2);
  }
  const lines = state.messages.map((m) => {
    const who = m.role === "user" ? state.profile.name : "Я";
    const time = new Date(m.at).toLocaleString();
    if (kind === "md") return `**${who}** · ${time}\n\n${m.text}\n`;
    return `${who} (${time})\n${m.text}\n`;
  });
  const head = kind === "md" ? `# ${title}\n\n_${stamp}_\n\n` : `${title}\n${stamp}\n\n`;
  return head + lines.join("\n");
}

function saveFile(name, body, type) {
  const blob = new Blob([body], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadLog(kind) {
  if (!fnEnabled("log.download")) return;
  if (kind === "json") saveFile("ya-chat.json", formatLog("json"), "application/json");
  else if (kind === "md") saveFile("ya-chat.md", formatLog("md"), "text/markdown");
  else saveFile("ya-chat.txt", formatLog("txt"), "text/plain");
}

function essenceBody() {
  return {
    kind: "ya-essence",
    version: "0.1",
    mark: "Я",
    id: crypto.randomUUID(),
    mintedAt: Date.now(),
    offline: true,
    model: {
      id: state.model.id || crypto.randomUUID(),
      name: state.model.name,
      engine: state.model.engine,
      createdAt: state.model.createdAt
    },
    profile: state.profile,
    memories: state.memories,
    functions: state.functions,
    evolved: state.evolved || [],
    messages: state.messages
  };
}

async function mintEssence() {
  if (!fnEnabled("essence.mint")) return null;
  const cr = await ensureCreator();
  if (!state.model.id) {
    state.model.id = crypto.randomUUID();
    save();
  }
  const body = essenceBody();
  const signature = await signBody(body);
  const essence = {
    body,
    creator: {
      id: cr.id,
      publicJwk: cr.publicJwk
    },
    signature,
    mintedOffline: true
  };
  vault.unshift(essence);
  vault = vault.slice(0, 50);
  saveVault();
  renderPanel();
  return essence;
}

function downloadEssence(essence) {
  if (!fnEnabled("essence.download") && !fnEnabled("essence.mint")) return;
  const name = `ya-essence-${essence.body.id.slice(0, 8)}.json`;
  saveFile(name, JSON.stringify(essence, null, 2), "application/json");
}

async function mintAndDownload() {
  const e = await mintEssence();
  if (e) downloadEssence(e);
}

function downloadFromVault(id) {
  const e = vault.find((x) => x.body.id === id);
  if (e) downloadEssence(e);
}

function clearChat() {
  state.messages = [];
  save();
  render();
}

function resetWorkingCopy() {
  const modelId = state.model.id;
  state = defaultState();
  state.model.id = modelId;
  save();
  render();
  renderPanel();
}

function toggleFn(id) {
  const f = state.functions.find((x) => x.id === id);
  if (!f) return;
  const locked = ["evolve.self", "learn.offline", "sync.github", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download"];
  if (locked.includes(id)) return;
  f.enabled = !f.enabled;
  save();
  renderPanel();
}

function mindBytes() {
  let n = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || "";
      n += (k ? k.length : 0) + v.length;
    }
  } catch (e) {}
  return n * 2;
}

function formatBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
  return (n / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

function mindVersion(bytes) {
  const steps = Math.floor(bytes / (1024 * 1024 * 1024));
  return (steps / 10).toFixed(1);
}

function renderMind() {
  const bytes = mindBytes();
  const ver = mindVersion(bytes);
  const vEl = document.getElementById("mind-version");
  const sEl = document.getElementById("mind-size");
  if (vEl) vEl.textContent = ver;
  if (sEl) sEl.textContent = formatBytes(bytes);
  const wEl = document.getElementById("wordmark");
  if (wEl) wEl.innerHTML = '<span class="wm-ai">AI\u1d50</span> \u00b7 <span class="wm-ver">V ' + ver + "</span>";
}

const mindEl = document.getElementById("mind");
const logEl = document.getElementById("log");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const panel = document.getElementById("panel");
const netDot = document.getElementById("net-dot");
const netLabel = document.getElementById("net-label");

function renderNet() {
  const web = mindWantsWeb();
  netDot.classList.toggle("offline", !web);
  netDot.classList.toggle("online", web);
  if (!state.mindOnline) netLabel.textContent = "offline \u00b7 local";
  else if (!signal()) netLabel.textContent = "no signal \u00b7 local";
  else netLabel.textContent = "online \u00b7 web mind";
}

function toggleMind() {
  state.mindOnline = !state.mindOnline;
  save();
  renderNet();
  if (state.mindOnline) harvestOnline();
}

function render() {
  renderNet();
  if (!state.messages.length) {
    logEl.innerHTML = `<div class="empty"><div class="big">Я</div><div>Runs offline from the start.<br>Mint the Essence. Download it whenever you want.</div></div>`;
    return;
  }
  logEl.innerHTML = state.messages.map((m) => {
    const who = m.role === "user" ? state.profile.name : "Я";
    return `<article class="msg ${m.role}"><div class="who">${escapeHtml(who)}</div>${escapeHtml(m.text)}</article>`;
  }).join("");
  logEl.scrollTop = logEl.scrollHeight;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function renderPanel() {
  document.getElementById("name-input").value = state.profile.name;
  const repoEl = document.getElementById("gh-repo");
  const tokEl = document.getElementById("gh-token");
  if (repoEl && repoEl !== document.activeElement) repoEl.value = github.repo || GH_REPO_DEFAULT;
  if (tokEl && tokEl !== document.activeElement) tokEl.value = github.token || "";
  document.getElementById("creator-id").textContent = creator ? creator.id.slice(0, 8) : "creating";
  document.getElementById("fn-list").innerHTML = state.functions.map((f) => {
    const locked = ["evolve.self", "learn.offline", "sync.github", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download"];
    const canToggle = !locked.includes(f.id);
    return `<div class="row"><div><div>${escapeHtml(f.name)}</div><div class="fn">${f.id} \u00b7 ${f.version}</div></div>
      ${canToggle
        ? `<button data-fn="${f.id}">${f.enabled ? "on" : "off"}</button>`
        : `<span class="${f.enabled ? "on" : "off"}">${f.enabled ? "on" : "off"}</span>`}
    </div>`;
  }).join("");
  const vaultEl = document.getElementById("vault-list");
  if (!vault.length) {
    vaultEl.innerHTML = `<p class="lead">No mints yet. Seal this model to keep a copy you can download later.</p>`;
    return;
  }
  vaultEl.innerHTML = vault.map((e) => `
    <div class="row">
      <div>
        <div>${escapeHtml(e.body.model.name)}</div>
        <div class="fn">${e.body.id.slice(0, 8)} \u00b7 ${new Date(e.body.mintedAt).toLocaleString()}</div>
      </div>
      <button data-dl="${e.body.id}">Download</button>
    </div>`).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value;
  input.value = "";
  send(v);
});

function standaloneApp() {
  return window.navigator.standalone === true
    || window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: fullscreen)").matches;
}

function guessPhoneInset() {
  const long = Math.max(screen.width || 0, screen.height || 0);
  if (long >= 852) return 59;
  if (long >= 812) return 47;
  return 20;
}

function layoutHeader() {
  const probe = document.getElementById("sa-top");
  let inset = probe ? Math.round(probe.getBoundingClientRect().height) : 0;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (ios && standaloneApp() && inset < 28) inset = guessPhoneInset();
  if (!ios && inset < 8) inset = 8;
  document.documentElement.style.setProperty("--safe-top", inset + "px");
  const h = document.querySelector("header");
  if (!h) return;
  const bottom = Math.ceil(h.getBoundingClientRect().bottom);
  document.documentElement.style.setProperty("--header-h", Math.max(bottom, 88) + "px");
}

document.getElementById("open-mind").addEventListener("click", (e) => {
  e.stopPropagation();
  layoutHeader();
  if (mindEl.classList.contains("open")) {
    mindEl.classList.remove("open");
    return;
  }
  renderMind();
  mindEl.classList.add("open");
});
window.addEventListener("resize", layoutHeader);
window.addEventListener("orientationchange", layoutHeader);
if (window.visualViewport) window.visualViewport.addEventListener("resize", layoutHeader);
layoutHeader();
setTimeout(layoutHeader, 50);
setTimeout(layoutHeader, 300);
mindEl.addEventListener("click", (e) => {
  if (e.target === mindEl) mindEl.classList.remove("open");
});
document.getElementById("open-panel").addEventListener("click", () => {
  mindEl.classList.remove("open");
  panel.classList.add("open");
  renderPanel();
});
panel.addEventListener("click", (e) => {
  if (e.target === panel) panel.classList.remove("open");
  const fn = e.target.getAttribute("data-fn");
  if (fn) toggleFn(fn);
  const dl = e.target.getAttribute("data-dl");
  if (dl) downloadFromVault(dl);
});
document.getElementById("name-input").addEventListener("change", (e) => {
  state.profile.name = e.target.value.trim() || "You";
  save();
});
document.getElementById("dl-txt").addEventListener("click", () => downloadLog("txt"));
document.getElementById("dl-md").addEventListener("click", () => downloadLog("md"));
document.getElementById("dl-json").addEventListener("click", () => downloadLog("json"));
document.getElementById("mint-now").addEventListener("click", () => mintAndDownload());
document.getElementById("clear-chat").addEventListener("click", clearChat);
document.getElementById("reset-all").addEventListener("click", resetWorkingCopy);

const ghRepoEl = document.getElementById("gh-repo");
const ghTokEl = document.getElementById("gh-token");
if (ghRepoEl) ghRepoEl.addEventListener("change", () => {
  github.repo = ghRepoEl.value.trim() || GH_REPO_DEFAULT;
  saveGithub();
});
if (ghTokEl) ghTokEl.addEventListener("change", () => {
  github.token = ghTokEl.value.trim();
  saveGithub();
});


const statusEl = document.querySelector(".status");
if (statusEl) {
  statusEl.setAttribute("role", "button");
  statusEl.title = "Tap to take the mind online or offline";
  statusEl.addEventListener("click", toggleMind);
}
window.addEventListener("online", () => { onCommsBack(); });
window.addEventListener("offline", renderNet);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

ensureCreator().then(() => {
  render();
  renderPanel();
  renderMind();
});
render();
renderMind();
