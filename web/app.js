const STORE_KEY = "ya-aim-v0";
const CREATOR_KEY = "ya-aim-creator";
const VAULT_KEY = "ya-aim-vault";
const GH_KEY = "ya-aim-github";
const UTAH_TZ = "America/Denver";
const GH_REPO_DEFAULT = "RIZALEON/PROJECTR";
const CHIEF_INBOX = "https://ntfy.sh/ya-rizaleon-ae59add8-reconnect";
const PING_KEY = "ya-aim-last-ping";
const ACCOUNT_KEY = "ya-aim-account";
const YATECH_DIR_KEY = "ya-aim-yatech-dir";
const OAUTH_LS = "ya-aim-oauth";
const MIND_BASES = [STORE_KEY, VAULT_KEY, CREATOR_KEY, GH_KEY, PING_KEY];
const YA_OAUTH = {
  xClientId: "",
  githubClientId: ""
};

function oauthConfig() {
  try {
    const extra = JSON.parse(localStorage.getItem(OAUTH_LS) || "{}") || {};
    return {
      xClientId: String(extra.xClientId || YA_OAUTH.xClientId || "").trim(),
      githubClientId: String(extra.githubClientId || YA_OAUTH.githubClientId || "").trim()
    };
  } catch (e) {
    return { ...YA_OAUTH };
  }
}

function guestAccount() {
  return { provider: "guest", sub: "", label: "Guest", linkedAt: 0 };
}

function loadAccount() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
    if (!parsed || !parsed.provider) return guestAccount();
    const known = { guest: 1, x: 1, github: 1, yatech: 1, google: 1, apple: 1 };
    const provider = known[parsed.provider] ? parsed.provider : "guest";
    if (provider === "guest") return guestAccount();
    return {
      provider,
      sub: String(parsed.sub || ""),
      label: String(parsed.label || "Guest"),
      picture: parsed.picture || undefined,
      linkedAt: Number(parsed.linkedAt) || Date.now()
    };
  } catch (e) {
    return guestAccount();
  }
}

function saveAccount() {
  const rec = {
    provider: account.provider,
    sub: account.sub || "",
    label: account.label || "Guest",
    linkedAt: account.linkedAt || Date.now()
  };
  if (account.picture) rec.picture = account.picture;
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(rec));
}

function nsSuffix(acc) {
  if (!acc || acc.provider === "guest" || !acc.sub) return "";
  return "::" + acc.provider + ":" + acc.sub;
}

function mindKey(base, acc) {
  return base + nsSuffix(acc || account);
}

function nameplate() {
  return {
    provider: account.provider || "guest",
    sub: account.sub || "",
    label: account.label || "Guest"
  };
}

function anyNamespacedMind() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(STORE_KEY + "::") === 0) return true;
    }
  } catch (e) {}
  return false;
}

function mindExistsFor(provider, sub) {
  return localStorage.getItem(STORE_KEY + "::" + provider + ":" + sub) != null;
}

function copyGuestKeysTo(suffix) {
  MIND_BASES.forEach((b) => {
    const v = localStorage.getItem(b);
    if (v != null) localStorage.setItem(b + suffix, v);
  });
}

function persistActiveMind() {
  save();
  saveVault();
  saveGithub();
  if (creator && creator.privateJwk) {
    localStorage.setItem(mindKey(CREATOR_KEY), JSON.stringify({
      id: creator.id,
      createdAt: creator.createdAt,
      publicJwk: creator.publicJwk,
      privateJwk: creator.privateJwk
    }));
  }
}

function hydrateActiveMind() {
  state = load();
  try { scrubWikiJunk(); } catch (e) {}
  vault = loadVault();
  github = loadGithub();
  creator = null;
  ensureCreator().then(() => { renderPanel(); }).catch(() => {});
  render();
  renderPanel();
  renderMind();
}

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
  pings: [],
  lastMindBytes: 0,
  messages: [],
  functions: [
    { id: "evolve.self", name: "0. Evolve (foundational)", enabled: true, version: "0.0" },
    { id: "account.link", name: "Link account (X, GitHub, or Я Technologies)", enabled: true, version: "0.0" },
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
    { id: "web.link", name: "Follow and describe links", enabled: true, version: "0.3.0" },
    { id: "model.remote", name: "Remote model", enabled: false, version: "stub" },
    { id: "voice.listen", name: "Voice in", enabled: false, version: "stub" },
    { id: "voice.speak", name: "Voice out", enabled: false, version: "stub" }
  ]
});

let account = loadAccount();
let state = load();
try { scrubWikiJunk(); } catch (e) {}
let creator = null;
let vault = loadVault();
let github = loadGithub();

function load() {
  try {
    const raw = localStorage.getItem(mindKey(STORE_KEY));
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      mindOnline: !!parsed.mindOnline,
      evolved: Array.isArray(parsed.evolved) ? parsed.evolved : [],
      pendingLearn: Array.isArray(parsed.pendingLearn) ? parsed.pendingLearn : [],
      pings: Array.isArray(parsed.pings) ? parsed.pings : [],
      lastMindBytes: Number(parsed.lastMindBytes) || 0,
      model: { ...base.model, ...(parsed.model || {}) },
      functions: mergeFunctions(base.functions, parsed.functions || [])
    };
  } catch {
    return defaultState();
  }
}

function mergeFunctions(base, saved) {
  const map = new Map(saved.map((f) => [f.id, f]));
  const merged = base.map((f) => {
    const s = map.get(f.id);
    if (!s) return { ...f };
    const out = { ...f, ...s };
    if (f.id === "account.link") out.name = f.name;
    return out;
  });
  for (const f of saved) {
    if (!merged.some((x) => x.id === f.id)) merged.push(f);
  }
  return merged;
}

function save() {
  localStorage.setItem(mindKey(STORE_KEY), JSON.stringify(state));
}

function loadVault() {
  try {
    return JSON.parse(localStorage.getItem(mindKey(VAULT_KEY)) || "[]");
  } catch {
    return [];
  }
}

function saveVault() {
  localStorage.setItem(mindKey(VAULT_KEY), JSON.stringify(vault));
}

function loadGithub() {
  try {
    const parsed = JSON.parse(localStorage.getItem(mindKey(GH_KEY)) || "{}");
    return {
      repo: (parsed.repo || GH_REPO_DEFAULT).trim() || GH_REPO_DEFAULT,
      token: typeof parsed.token === "string" ? parsed.token : "",
      hookUrl: typeof parsed.hookUrl === "string" ? parsed.hookUrl : "",
      hookKey: typeof parsed.hookKey === "string" ? parsed.hookKey : ""
    };
  } catch {
    return { repo: GH_REPO_DEFAULT, token: "", hookUrl: "", hookKey: "" };
  }
}

function saveGithub() {
  localStorage.setItem(mindKey(GH_KEY), JSON.stringify({
    repo: github.repo,
    token: github.token,
    hookUrl: github.hookUrl,
    hookKey: github.hookKey
  }));
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
  const saved = localStorage.getItem(mindKey(CREATOR_KEY));
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
  localStorage.setItem(mindKey(CREATOR_KEY), JSON.stringify(record));
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


function wikiJunk(title, extract) {
  const t = String(title || "").trim();
  const x = String(extract || "");
  if (/^(why|dating|what time is it)\??$/i.test(t)) return true;
  if (/may refer to/i.test(t) || /may refer to/i.test(x)) return true;
  if (/\bdisambiguation\b/i.test(t) || /\bdisambiguation\b/i.test(x)) return true;
  return false;
}

function isWikiJunkMemory(text) {
  const s = String(text || "");
  if (/^(why|dating|what time is it)\s*:/i.test(s)) return true;
  if (/may refer to/i.test(s)) return true;
  if (/\bdisambiguation\b/i.test(s) && /^(why|dating|what time is it)\b/i.test(s)) return true;
  return false;
}

function scrubWikiJunk() {
  const before = (state.memories || []).length;
  state.memories = (state.memories || []).filter((m) => !isWikiJunkMemory(m && m.text));
  if (state.memories.length !== before) save();
}

function remember(text) {
  if (!fnEnabled("memory.remember")) return;
  const clean = text.trim();
  if (clean.length < 2) return;
  if (isWikiJunkMemory(clean)) return;
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
    if (isWikiJunkMemory(m.text)) return { m, score: 0 };
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
  if (!worthLearning(query)) return null;
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
  if (wikiJunk(title, extract)) return null;
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



function pingLocations(extra) {
  const hops = ["phone (Utah)", "reconnect inbox", "Chief of Staff chat"];
  (extra || []).forEach((h) => { if (h && hops.indexOf(h) < 0) hops.push(h); });
  return hops;
}

function pingReason(learned, pulled, evolvedCount, deltaBytes) {
  const parts = [];
  if (evolvedCount) parts.push(evolvedCount === 1 ? "new function" : evolvedCount + " new functions");
  if (deltaBytes > 256) parts.push(formatBytes(deltaBytes) + " of new wisdom");
  if (learned && learned.length) parts.push("harvested " + learned.join(", "));
  if (pulled) parts.push("pulled " + pulled + " evolution(s) from GitHub");
  if (!parts.length) parts.push("reconnect");
  return parts.join("; ");
}

function formatPingNote(rec) {
  const locNow = (rec.locations || []).join(" → ");
  const past = (state.pings || []).map((p, i) =>
    (i + 1) + ". " + p.utah + " · " + p.reason + " · " + (p.locations || []).join(" → ")
  );
  return [
    "Ping · " + rec.utah,
    "Reason: " + rec.reason,
    "This hop: " + locNow,
    "All ping locations:",
    past.length ? past.join("\n") : "(this is the first)"
  ].join("\n");
}

function recordPing(rec) {
  state.pings = state.pings || [];
  state.pings.unshift(rec);
  state.pings = state.pings.slice(0, 40);
  save();
}

function reconnectPack() {
  return {
    kind: "ya-reconnect",
    tz: "Utah",
    at: Date.now(),
    utah: utahNow(),
    account: nameplate(),
    learned: (state.memories || []).slice(0, 40).map((m) => ({ text: m.text, at: m.at })),
    evolved: state.evolved || [],
    functions: (state.functions || []).map((f) => ({ id: f.id, name: f.name, enabled: !!f.enabled, version: f.version })),
    pendingLearn: state.pendingLearn || [],
    pings: (state.pings || []).slice(0, 12)
  };
}

function pingSignature(pack) {
  return JSON.stringify({
    learned: (pack.learned || []).map((m) => m.text),
    evolved: (pack.evolved || []).map((s) => s.id),
    pending: pack.pendingLearn || [],
    fn: (pack.functions || []).map((f) => f.id + ":" + f.version)
  });
}

async function pingChief() {
  if (!signal()) return { ok: false, reason: "offline" };
  const pack = reconnectPack();
  const sig = pingSignature(pack);
  if (localStorage.getItem(mindKey(PING_KEY)) === sig) return { ok: true, skipped: true };
  const body = JSON.stringify(pack);
  try {
    const res = await fetch(CHIEF_INBOX, {
      method: "POST",
      headers: { "Content-Type": "application/json", Title: "Ya reconnect", Tags: "brain" },
      body: body
    });
    if (res.ok) {
      localStorage.setItem(mindKey(PING_KEY), sig);
      return { ok: true };
    }
  } catch (e) {}
  try {
    await fetch(CHIEF_INBOX, { method: "POST", mode: "no-cors", body: body });
    localStorage.setItem(mindKey(PING_KEY), sig);
    return { ok: true, opaque: true };
  } catch (e2) {
    return { ok: false, reason: "net" };
  }
}

async function pushInbox() {
  if (!(github.token || "").trim()) return { ok: false, reason: "token" };
  const repo = (github.repo || GH_REPO_DEFAULT).replace(/^https:\/\/github.com\//, "");
  const path = "reconnect-inbox.json";
  const api = "https://api.github.com/repos/" + repo + "/contents/" + path;
  const body = JSON.stringify(reconnectPack(), null, 2);
  let sha;
  try {
    const get = await fetch(api, { headers: { Authorization: "Bearer " + github.token, Accept: "application/vnd.github+json" } });
    if (get.ok) sha = (await get.json()).sha;
  } catch (e) {}
  const put = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + github.token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Object.assign(
      { message: "Ya reconnect inbox (Utah) " + new Date().toISOString(), content: utf8ToB64(body) },
      sha ? { sha: sha } : {}
    ))
  });
  if (!put.ok) return { ok: false, reason: "http " + put.status };
  return { ok: true };
}

async function onCommsBack() {
  renderNet();
  const beforeBytes = state.lastMindBytes || 0;
  const evolvedBefore = (state.evolved || []).length;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.update();
    }
  } catch (e) {}
  let learned = [];
  if (state.mindOnline) {
    try { learned = (await harvestOnline()) || []; } catch (e) {}
  }
  let pulled = 0;
  try { pulled = await pullRemoteEvolutions(); } catch (e) {}
  let up = { ok: false };
  try { up = await pushEvolutions(); } catch (e) { up = { ok: false, reason: "error" }; }
  let inbox = { ok: false };
  try { inbox = await pushInbox(); } catch (e) {}
  const extraHops = [];
  if (up && up.ok) extraHops.push("GitHub " + (up.repo || GH_REPO_DEFAULT) + "/evolutions.json");
  if (inbox && inbox.ok) extraHops.push("GitHub " + GH_REPO_DEFAULT + "/reconnect-inbox.json");
  const nowBytes = mindBytes();
  const delta = Math.max(0, nowBytes - beforeBytes);
  const evolvedCount = Math.max(0, (state.evolved || []).length - evolvedBefore);
  const rec = {
    at: Date.now(),
    utah: utahNow(),
    reason: pingReason(learned, pulled, evolvedCount, delta),
    locations: pingLocations(extraHops),
    bytes: nowBytes,
    learned: learned
  };
  let chief = { ok: false };
  try { chief = await pingChief(); } catch (e) {}
  if (chief && chief.skipped) {
    state.lastMindBytes = nowBytes;
    save();
    return;
  }
  recordPing(rec);
  state.lastMindBytes = nowBytes;
  save();
  push("ya", formatPingNote(rec));
  renderMind();
}

function extractHttpUrls(text) {
  const found = String(text).match(/https?:\/\/[^\s<>"']+/gi) || [];
  const out = [];
  found.forEach((raw) => {
    const u = raw.replace(/[),.;]+$/, "");
    if (out.indexOf(u) < 0) out.push(u);
  });
  return out.slice(0, 3);
}

function extractHttpUrl(text) {
  const all = extractHttpUrls(text);
  return all.length ? all[0] : null;
}

function outlineFromText(raw) {
  const heads = [];
  String(raw).split(/\n/).forEach((line) => {
    const h = line.match(/^#{1,3}\s+(.+)/) || line.match(/^[A-Z][A-Za-z0-9 ,:'\-]{12,80}$/);
    if (h) heads.push(String(h[1] || h[0]).trim());
  });
  const uniq = [];
  heads.forEach((h) => { if (uniq.indexOf(h) < 0) uniq.push(h); });
  return uniq.slice(0, 14);
}

async function fetchLinkRaw(url) {
  const tries = [
    "https://r.jina.ai/" + url,
    "https://r.jina.ai/http://" + url.replace(/^https?:\/\//i, "")
  ];
  let lastErr = null;
  for (const reader of tries) {
    try {
      const res = await fetch(reader, { headers: { Accept: "text/plain" } });
      if (!res.ok) { lastErr = new Error("http " + res.status); continue; }
      const raw = await res.text();
      if (raw && raw.trim().length > 40) return raw;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("link fetch failed");
}

function linkNote(d) {
  const bits = [d.url, d.title || ""];
  if (d.outline && d.outline.length) bits.push(d.outline.slice(0, 8).join("; "));
  bits.push((d.body || "").slice(0, 900));
  return bits.filter(Boolean).join("\n");
}

async function describeLink(url) {
  if (nuclearBlocked(url)) return null;
  const raw = await fetchLinkRaw(url);
  const titleMatch = raw.match(/^Title:\s*(.+)$/m) || raw.match(/<title>([^<]+)<\/title>/i);
  const title = (titleMatch ? titleMatch[1].trim() : url).slice(0, 180);
  const clean = raw.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const outline = outlineFromText(raw);
  const preview = clean.slice(0, 3500);
  const d = { title, body: preview, url, outline, chars: clean.length, more: clean.length > 3500 };
  remember("Link note:\n" + linkNote(d));
  return d;
}

function formatLinkRead(d) {
  const bits = [d.title, d.url, ""];
  if (d.outline && d.outline.length) {
    bits.push("Contents:");
    d.outline.forEach((h) => bits.push("- " + h));
    bits.push("");
  }
  bits.push(d.body);
  bits.push("\nNotes keep this link and this summary.");
  return bits.join("\n");
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

function worthLearning(text) {
  if (extractHttpUrl(text)) return true;
  const s = foldQ(text).replace(/[?!.]+/g, " ").trim();
  if (s.length < 12) return false;
  if (/^(who|what|when|where|why|how|which|is|are|can|does|do)(\s+is\s+it)?$/.test(s)) return false;
  if (isDateAsk(s)) return false;
  return true;
}

async function harvestOnline() {
  if (!state.mindOnline || !signal()) return;
  const seen = new Set();
  const queue = [];
  for (const item of (state.pendingLearn || [])) {
    if (!worthLearning(item)) continue;
    const k = String(item).toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    queue.push(item);
  }
  const take = queue.slice(0, 3);
  const learned = [];
  for (const q of take) {
    if (nuclearBlocked(q)) continue;
    try {
      const href = extractHttpUrl(q);
      if (href) {
        const d = await describeLink(href);
        if (d) learned.push(d.title);
        continue;
      }
      const web = await webSearch(q);
      if (web && web.title && !wikiJunk(web.title, web.extract)) learned.push(web.title);
    } catch (e) {}
  }
  state.pendingLearn = [];
  save();
  return learned;
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
  const links = extractHttpUrls(userText);
  if (links.length) {
    if (!mindWantsWeb()) {
      links.forEach((u) => queueLearn(u));
      return "Mind is offline. Tap the light green. I will open " + (links.length === 1 ? "that link" : "those links") + ", read the content, and keep it in the offline mind.";
    }
    const parts = [];
    for (const link of links) {
      try {
        const d = await describeLink(link);
        if (!d) {
          parts.push("I will not open " + link + ".");
          continue;
        }
        parts.push(formatLinkRead(d));
      } catch (e) {
        parts.push("I could not open that link from here: " + link);
      }
    }
    return parts.join("\n\n——\n\n");
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


function formatMindDump() {
  const stamp = utahNow();
  const lines = [];
  lines.push("Я AIᵐ mind dump");
  lines.push("Utah time: " + stamp);
  lines.push("Version: " + mindVersion(mindBytes()) + " · size " + formatBytes(mindBytes()));
  lines.push("Engine: " + (state.model && state.model.engine ? state.model.engine : "local"));
  lines.push("");
  lines.push("=== Functions ===");
  (state.functions || []).forEach((f) => {
    lines.push("- " + f.name + " [" + f.id + "] " + (f.enabled ? "on" : "off") + " v" + (f.version || ""));
  });
  lines.push("");
  lines.push("=== Evolved (Function 0) ===");
  const ev = state.evolved || [];
  if (!ev.length) lines.push("(none yet)");
  ev.forEach((s) => {
    lines.push("- " + (s.name || s.id));
    lines.push("  when: " + (s.trigger || ""));
    lines.push("  do: " + (s.action || ""));
  });
  lines.push("");
  lines.push("=== Links (URL + chat summary only) ===");
  const linkNotes = (state.memories || []).filter((m) => m && /^Link note:/i.test(m.text));
  if (!linkNotes.length) lines.push("(none yet)");
  linkNotes.forEach((m) => {
    lines.push(m.text.replace(/^Link note:\s*/i, "").trim());
    lines.push("");
  });
  lines.push("=== Learned (offline mind) ===");
  const mem = (state.memories || []).filter((m) => {
    if (!m || !m.text || /^user said:/i.test(m.text)) return false;
    if (/^Link note:/i.test(m.text)) return false;
    if (/^Link .+ \[\d+\]:/i.test(m.text)) return false;
    if (/chars read$/i.test(m.text)) return false;
    return true;
  });
  if (!mem.length) lines.push("(none yet)");
  mem.forEach((m) => {
    const when = m.at ? new Date(m.at).toLocaleString("en-US", { timeZone: UTAH_TZ }) : "";
    lines.push("- " + (when ? when + " · " : "") + m.text);
  });
  lines.push("");
  lines.push("=== Pings (Я ↔ Chief of Staff) ===");
  const pings = state.pings || [];
  if (!pings.length) lines.push("(none yet)");
  pings.forEach((p) => {
    lines.push("- " + p.utah + " · " + p.reason);
    lines.push("  " + (p.locations || []).join(" → "));
  });
  lines.push("");
  lines.push("=== Conversations ===");
  const msgs = state.messages || [];
  if (!msgs.length) lines.push("(none yet)");
  msgs.forEach((m) => {
    const who = m.role === "user" ? (state.profile.name || "You") : "Я";
    const when = m.at ? new Date(m.at).toLocaleString("en-US", { timeZone: UTAH_TZ }) : "";
    lines.push(who + " (" + when + ")");
    lines.push(m.text);
    lines.push("");
  });
  return lines.join("\n");
}

function downloadMindDump() {
  const name = "ya-mind-" + new Date().toISOString().slice(0, 10) + ".txt";
  saveFile(name, formatMindDump(), "text/plain");
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
    account: nameplate(),
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
  const locked = ["evolve.self", "account.link", "learn.offline", "sync.github", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download"];
  if (locked.includes(id)) return;
  f.enabled = !f.enabled;
  save();
  renderPanel();
}

function mindBytes() {
  let n = 0;
  const suffix = nsSuffix(account);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      let mine = false;
      if (suffix) {
        mine = MIND_BASES.some((b) => k === b + suffix);
      } else {
        mine = MIND_BASES.some((b) => k === b);
      }
      if (!mine) continue;
      const v = localStorage.getItem(k) || "";
      n += k.length + v.length;
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
  renderAccount();
}

function providerTitle(p) {
  if (p === "x") return "X";
  if (p === "github") return "GitHub";
  if (p === "yatech") return "Я Technologies";
  if (p === "google") return "Google";
  if (p === "apple") return "Apple";
  return "Guest";
}

function renderAccount() {
  const lab = document.getElementById("account-label");
  const unlink = document.getElementById("unlink-account");
  const linked = account && account.provider && account.provider !== "guest" && account.sub;
  if (lab) {
    lab.textContent = linked
      ? ("Linked · " + providerTitle(account.provider) + " · " + (account.label || providerTitle(account.provider)))
      : "Guest";
  }
  if (unlink) unlink.hidden = !linked;
}

function accountNote(msg) {
  const el = document.getElementById("account-booth");
  if (el) el.textContent = msg;
}

function boothClosed(provider) {
  const msg = "Login booth for " + provider + " is not open yet. Your Я still lives on this phone as a guest.";
  accountNote(msg);
  push("ya", msg);
}

function finishLink(next, reason) {
  const prev = account;
  persistActiveMind();
  const suffix = "::" + next.provider + ":" + next.sub;
  const existed = mindExistsFor(next.provider, next.sub);
  const first = !anyNamespacedMind();
  account = {
    provider: next.provider,
    sub: String(next.sub),
    label: String(next.label || providerTitle(next.provider)),
    picture: next.picture || undefined,
    linkedAt: next.linkedAt || Date.now()
  };
  saveAccount();
  if (existed) {
    hydrateActiveMind();
  } else if (first && prev && prev.provider === "guest") {
    copyGuestKeysTo(suffix);
    persistActiveMind();
    hydrateActiveMind();
  } else {
    state = defaultState();
    vault = [];
    github = { repo: GH_REPO_DEFAULT, token: "", hookUrl: "", hookKey: "" };
    creator = null;
    try { localStorage.removeItem(mindKey(PING_KEY)); } catch (e) {}
    persistActiveMind();
    hydrateActiveMind();
  }
  const rec = {
    at: Date.now(),
    utah: utahNow(),
    reason: reason || ("linked " + providerTitle(account.provider)),
    locations: pingLocations(),
    bytes: mindBytes()
  };
  recordPing(rec);
  if (signal()) pingChief().catch(function () {});
  accountNote("The brain stays on this phone. Login only names it.");
  push("ya", "Linked · " + providerTitle(account.provider) + " · " + account.label + ". The brain stays on this phone.");
}

function unlinkAccount() {
  if (!account || account.provider === "guest") return;
  persistActiveMind();
  account = guestAccount();
  saveAccount();
  hydrateActiveMind();
  accountNote("Unlinked. That mind is still on this phone. You are viewing Guest.");
}

function bufToHex(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

function yatechNormalize(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function loadYatechDir() {
  try {
    const parsed = JSON.parse(localStorage.getItem(YATECH_DIR_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveYatechDir(dir) {
  localStorage.setItem(YATECH_DIR_KEY, JSON.stringify(dir));
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return bufToHex(digest);
}

async function yatechHash(pass, saltB64) {
  const salt = new Uint8Array(b64ToBuf(saltB64));
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: 100000 },
      key,
      256
    );
    return bufToHex(bits);
  } catch (e) {
    const mixed = new Uint8Array(salt.length + new TextEncoder().encode(pass).length);
    mixed.set(salt, 0);
    mixed.set(new TextEncoder().encode(pass), salt.length);
    const digest = await crypto.subtle.digest("SHA-256", mixed);
    return bufToHex(digest);
  }
}

function hashesMatch(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

async function startYatechLink() {
  const nameEl = document.getElementById("yatech-name");
  const passEl = document.getElementById("yatech-pass");
  const label = nameEl ? String(nameEl.value || "").trim() : "";
  const pass = passEl ? String(passEl.value || "") : "";
  if (!label || !pass) {
    const msg = "Name and passphrase are required. Nothing left this phone.";
    accountNote(msg);
    return;
  }
  const key = yatechNormalize(label);
  if (!key) {
    accountNote("Name and passphrase are required. Nothing left this phone.");
    return;
  }
  const dir = loadYatechDir();
  const existing = dir[key];
  if (existing && existing.hash && existing.salt) {
    const got = await yatechHash(pass, existing.salt);
    if (!hashesMatch(got, existing.hash)) {
      accountNote("Wrong passphrase. Still Guest. The brain stays on this phone.");
      if (passEl) passEl.value = "";
      return;
    }
    if (passEl) passEl.value = "";
    finishLink({
      provider: "yatech",
      sub: String(existing.sub),
      label: label
    }, "linked Я Technologies");
    return;
  }
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = bufToB64(saltBytes.buffer);
  const hash = await yatechHash(pass, salt);
  const sub = await sha256Hex(key);
  dir[key] = { sub: sub, salt: salt, hash: hash };
  saveYatechDir(dir);
  if (passEl) passEl.value = "";
  finishLink({
    provider: "yatech",
    sub: sub,
    label: label
  }, "created Я Technologies");
}

function b64urlBytes(buf) {
  return bufToB64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomB64url(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return b64urlBytes(a.buffer);
}

async function pkceChallenge(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return b64urlBytes(digest);
}

function oauthRedirectURI() {
  return location.origin + location.pathname;
}

let ghDevicePoll = 0;

function startGitHubLink() {
  const cfg = oauthConfig();
  if (!cfg.githubClientId) { boothClosed("GitHub"); return; }
  ghDevicePoll += 1;
  accountNote("Opening GitHub booth…");
  const body = new URLSearchParams({
    client_id: cfg.githubClientId,
    scope: "read:user"
  });
  fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  }).then(function (res) {
    if (!res.ok) throw new Error("device " + res.status);
    return res.json();
  }).then(function (dev) {
    if (!dev || !dev.device_code || !dev.user_code) throw new Error("device");
    const uri = dev.verification_uri || "https://github.com/login/device";
    accountNote("GitHub · go to " + uri + "\nCode " + dev.user_code);
    pollGitHubDevice(cfg.githubClientId, dev);
  }).catch(function () {
    const msg = "GitHub would not open the device booth in the browser. Your Я still lives on this phone as a guest.";
    accountNote(msg);
    push("ya", msg);
  });
}

function pollGitHubDevice(clientId, dev) {
  const started = Date.now();
  const expires = (Number(dev.expires_in) || 900) * 1000;
  let interval = Math.max(5, Number(dev.interval) || 5) * 1000;
  const deviceCode = dev.device_code;
  const tick = ++ghDevicePoll;
  function once() {
    if (tick !== ghDevicePoll) return;
    if (Date.now() - started > expires) {
      accountNote("GitHub code expired. Your Я still lives on this phone as a guest.");
      return;
    }
    const body = new URLSearchParams({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code"
    });
    fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) { return j; });
    }).then(function (j) {
      if (tick !== ghDevicePoll) return;
      j = j || {};
      const err = j.error;
      if (err === "authorization_pending") {
        setTimeout(once, interval);
        return;
      }
      if (err === "slow_down") {
        interval += 5000;
        setTimeout(once, interval);
        return;
      }
      if (err === "expired_token" || err === "access_denied") {
        accountNote("GitHub login did not finish. Your Я still lives on this phone as a guest.");
        return;
      }
      if (err) {
        accountNote("GitHub login did not finish. Your Я still lives on this phone as a guest.");
        return;
      }
      const token = j.access_token;
      if (!token) {
        setTimeout(once, interval);
        return;
      }
      return fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + token
        }
      }).then(function (res) {
        if (!res.ok) throw new Error("user");
        return res.json();
      }).then(function (u) {
        if (!u || u.id == null) throw new Error("user");
        finishLink({
          provider: "github",
          sub: String(u.id),
          label: String(u.login || "GitHub"),
          linkedAt: Date.now()
        }, "linked GitHub");
      });
    }).catch(function () {
      if (tick !== ghDevicePoll) return;
      const msg = "GitHub would not finish login in the browser. Your Я still lives on this phone as a guest.";
      accountNote(msg);
      push("ya", msg);
    });
  }
  setTimeout(once, interval);
}

function startXLink() {
  const cfg = oauthConfig();
  if (!cfg.xClientId) { boothClosed("X"); return; }
  const verifier = randomB64url(32);
  const stateTok = randomB64url(16);
  sessionStorage.setItem("ya-aim-x-verifier", verifier);
  sessionStorage.setItem("ya-aim-x-state", stateTok);
  pkceChallenge(verifier).then(function (challenge) {
    const redirect = oauthRedirectURI();
    const url = "https://twitter.com/i/oauth2/authorize"
      + "?response_type=code"
      + "&client_id=" + encodeURIComponent(cfg.xClientId)
      + "&redirect_uri=" + encodeURIComponent(redirect)
      + "&scope=" + encodeURIComponent("users.read")
      + "&state=" + encodeURIComponent(stateTok)
      + "&code_challenge=" + encodeURIComponent(challenge)
      + "&code_challenge_method=S256";
    location.href = url;
  });
}

async function finishXReturn() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const stateTok = params.get("state");
  const err = params.get("error");
  if (!code && !err) return;
  const expect = sessionStorage.getItem("ya-aim-x-state");
  const verifier = sessionStorage.getItem("ya-aim-x-verifier");
  try {
    history.replaceState({}, "", location.pathname);
  } catch (e) {}
  if (err) {
    accountNote("X login did not finish.");
    return;
  }
  if (!verifier || !expect || stateTok !== expect) return;
  sessionStorage.removeItem("ya-aim-x-verifier");
  sessionStorage.removeItem("ya-aim-x-state");
  const cfg = oauthConfig();
  const body = new URLSearchParams({
    code: code,
    grant_type: "authorization_code",
    client_id: cfg.xClientId,
    redirect_uri: oauthRedirectURI(),
    code_verifier: verifier
  });
  try {
    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
    if (!res.ok) throw new Error("token " + res.status);
    const tok = await res.json();
    const access = tok.access_token;
    if (!access) throw new Error("token");
    const me = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: "Bearer " + access }
    });
    if (!me.ok) throw new Error("me");
    const data = await me.json();
    const u = data.data || {};
    if (!u.id) throw new Error("me");
    finishLink({
      provider: "x",
      sub: String(u.id),
      label: u.name || u.username || "X",
      linkedAt: Date.now()
    }, "linked X");
  } catch (e) {
    const msg = "X would not finish login in the browser (token booth blocked). Your Я still lives on this phone as a guest.";
    accountNote(msg);
    push("ya", msg);
  }
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
    const guestHint = (!account || account.provider === "guest")
      ? "<br>Name this Я with X, GitHub, or a Я Technologies Account — still on this device."
      : "";
    logEl.innerHTML = `<div class="empty"><div class="big">Я</div><div>Runs offline from the start.<br>Mint the Essence. Download it whenever you want.${guestHint}</div></div>`;
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
    const locked = ["evolve.self", "account.link", "learn.offline", "sync.github", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download"];
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
const dlMind = document.getElementById("dl-mind");
if (dlMind) dlMind.addEventListener("click", (e) => {
  e.stopPropagation();
  downloadMindDump();
});
const linkX = document.getElementById("link-x");
const linkGh = document.getElementById("link-github");
const linkYa = document.getElementById("link-yatech");
const unlinkB = document.getElementById("unlink-account");
if (linkX) linkX.addEventListener("click", (e) => { e.stopPropagation(); startXLink(); });
if (linkGh) linkGh.addEventListener("click", (e) => { e.stopPropagation(); startGitHubLink(); });
if (linkYa) linkYa.addEventListener("click", (e) => { e.stopPropagation(); startYatechLink(); });
if (unlinkB) unlinkB.addEventListener("click", (e) => { e.stopPropagation(); unlinkAccount(); });
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
  finishXReturn();
  if (signal()) setTimeout(() => { onCommsBack(); }, 800);
});
render();
renderMind();
