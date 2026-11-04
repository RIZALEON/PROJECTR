/*! ya-rbot-x.js — Native X write/reply pipe for #RBOT pin ask door.
 * Chat: connect x · disconnect x · x status · rbot monitor · rbot draft …
 *       publish / yes publish · always reply on|off · set x client <id>
 *       smoke rbot / reply smoke
 * Native ops via WK bridge (Keychain). No Zernio. Default = confirm before publish.
 * Load AFTER app.js (needs nativeAsk / push / answer hooks).
 */
(function () {
  "use strict";

  var CONTRACT = {
    handle: "RizaltheBot",
    tag: "RBOT",
    pinId: "2100475587387347030",
    pinUrl: "https://x.com/RizaltheBot/status/2100475587387347030",
    smokeAskId: "2100476375895519660",
    monitorQuery: "conversation_id:2100475587387347030 -is:retweet",
    tagQuery: "#RBOT -is:retweet"
  };

  var LS_PENDING = "ya-rbot-pending-draft";
  var LS_ALWAYS = "ya-rbot-always-reply";
  var LS_SEEN = "ya-rbot-seen-ids";
  var LS_OAUTH = "ya-aim-oauth";

  function alwaysReply() {
    try { return localStorage.getItem(LS_ALWAYS) === "1"; } catch (e) { return false; }
  }
  function setAlwaysReply(on) {
    try { localStorage.setItem(LS_ALWAYS, on ? "1" : "0"); } catch (e) {}
  }

  function loadPending() {
    try { return JSON.parse(localStorage.getItem(LS_PENDING) || "null"); } catch (e) { return null; }
  }
  function savePending(p) {
    try {
      if (!p) localStorage.removeItem(LS_PENDING);
      else localStorage.setItem(LS_PENDING, JSON.stringify(p));
    } catch (e) {}
  }

  function seenIds() {
    try { return JSON.parse(localStorage.getItem(LS_SEEN) || "[]") || []; } catch (e) { return []; }
  }
  function markSeen(id) {
    var list = seenIds();
    if (list.indexOf(id) >= 0) return;
    list.push(id);
    if (list.length > 80) list = list.slice(-80);
    try { localStorage.setItem(LS_SEEN, JSON.stringify(list)); } catch (e) {}
  }

  function oauthClientId() {
    try {
      var extra = JSON.parse(localStorage.getItem(LS_OAUTH) || "{}") || {};
      return String(extra.xClientId || "").trim();
    } catch (e) { return ""; }
  }

  function setOauthClientId(id) {
    var trimmed = String(id || "").trim();
    try {
      var extra = JSON.parse(localStorage.getItem(LS_OAUTH) || "{}") || {};
      extra.xClientId = trimmed;
      localStorage.setItem(LS_OAUTH, JSON.stringify(extra));
    } catch (e) {}
  }

  function hasNativeX() {
    return !!(typeof isNativeSpine === "function" && isNativeSpine()
      && window.YA_NATIVE && window.YA_NATIVE.xWrite
      && typeof nativeAsk === "function");
  }

  function draftVoice(askText, askId) {
    var body = String(askText || "").trim().replace(/\s+/g, " ");
    if (body.length > 160) body = body.slice(0, 157) + "…";
    var line = "ЯBOT · #" + CONTRACT.tag + " — heard. "
      + (body ? ("Re: " + body + " ") : "")
      + "Door: " + CONTRACT.pinUrl + " · NonNuclear · the future is Я.";
    if (line.length > 280) line = line.slice(0, 277) + "…";
    return { text: line, inReplyToId: String(askId || CONTRACT.smokeAskId), askText: body };
  }

  async function xStatus() {
    if (!hasNativeX()) {
      return {
        connected: false,
        native: false,
        hint: "Native X pipe needs iOS spine (YA_NATIVE.xWrite). Rebuild YaAim with NativeX.swift."
      };
    }
    var st = await nativeAsk("xStatus", {});
    return st || { connected: false, reason: "no-reply" };
  }

  async function publishDraft(draft) {
    if (!draft || !draft.text || !draft.inReplyToId) return { ok: false, reason: "no-draft" };
    if (!hasNativeX()) return { ok: false, reason: "no-native" };
    var r = await nativeAsk("xReply", { text: draft.text, inReplyToId: draft.inReplyToId });
    if (r && r.ok) {
      markSeen(draft.inReplyToId);
      savePending(null);
    }
    return r || { ok: false, reason: "no-reply" };
  }

  /**
   * Chat verb handler. Return string to short-circuit answer(); null to fall through.
   */
  window.yaHandleRbotXChat = async function (userText) {
    var t = String(userText || "").trim();
    var low = t.toLowerCase();

    // set x client <id>
    var setClient = t.match(/^set\s+x\s+client(?:\s+id)?\s+(\S+)/i);
    if (setClient) {
      var cid = setClient[1].replace(/[.,;]+$/, "");
      setOauthClientId(cid);
      if (hasNativeX()) {
        await nativeAsk("xSetClient", { clientId: cid });
      }
      return "X Client ID seated (placeholder store — not a vault dump). Say connect x to authorize tweet.write. Redirect URI for the X app: yaaim://oauth/x";
    }

    if (/^(connect\s+x|x\s+connect|link\s+x\s+write|x\s+write\s+connect)\b/i.test(t)) {
      if (!hasNativeX()) {
        return "Native X write needs the iOS app spine. Open Я on device (not Safari-only) after rebuild with NativeX.";
      }
      var client = oauthClientId();
      var st0 = await xStatus();
      if (st0 && st0.connected) {
        return "X already connected" + (st0.username ? (" · @" + st0.username) : "") + ". Say disconnect x to clear Keychain tokens. Say rbot status for pin door.";
      }
      if (!client && !(st0 && st0.clientIdSet)) {
        return "No X Client ID yet. Decider: create app at developer.x.com → User authentication → OAuth 2.0 → Type Native App → Callback yaaim://oauth/x → scopes tweet.read tweet.write users.read offline.access. Then: set x client YOUR_CLIENT_ID";
      }
      var res = await nativeAsk("xConnect", { clientId: client || undefined });
      if (res && res.ok) {
        return "X write connected" + (res.username ? (" · @" + res.username) : "") + ". Scopes: tweet.write. Say smoke rbot to reply the test ask, or rbot monitor.";
      }
      return "X connect failed · " + ((res && res.reason) || "unknown") + (res && res.hint ? (" — " + res.hint) : "") + ". Check Client ID + callback yaaim://oauth/x.";
    }

    if (/^(disconnect\s+x|x\s+disconnect|unlink\s+x\s+write)\b/i.test(t)) {
      if (hasNativeX()) await nativeAsk("xDisconnect", {});
      savePending(null);
      return "X write disconnected. Keychain tokens cleared. Offline core unchanged.";
    }

    if (/^(x\s+status|rbot\s+status|status\s+x|status\s+rbot)\b/i.test(t)) {
      var st = await xStatus();
      var lines = [
        "RBOT / X write · pin " + CONTRACT.pinId,
        "Handle @" + CONTRACT.handle + " · #" + CONTRACT.tag,
        "Pin " + CONTRACT.pinUrl,
        "Smoke ask " + CONTRACT.smokeAskId,
        "Connected: " + (st.connected ? ("yes" + (st.username ? (" · @" + st.username) : "")) : "no"),
        "Client ID set: " + (st.clientIdSet || !!oauthClientId() ? "yes" : "no"),
        "Always-reply: " + (alwaysReply() ? "ON (auto publish)" : "OFF (confirm — default)"),
        "Publish: draft_then_confirm until always-reply on",
        "Native pipe: " + (hasNativeX() ? "yes" : "no")
      ];
      var pend = loadPending();
      if (pend) lines.push("Pending draft → " + pend.inReplyToId + " · " + String(pend.text || "").slice(0, 80));
      return lines.join("\n");
    }

    if (/^always\s+reply\s+on\b/i.test(t)) {
      setAlwaysReply(true);
      return "Always-reply ON. RBOT will publish drafts without confirm. Say always reply off for safety.";
    }
    if (/^always\s+reply\s+off\b/i.test(t)) {
      setAlwaysReply(false);
      return "Always-reply OFF (default). Drafts wait for publish / yes publish.";
    }

    if (/^(rbot\s+monitor|monitor\s+rbot|pull\s+rbot|rbot\s+pull)\b/i.test(t)) {
      if (!hasNativeX()) return "rbot monitor needs native X connect first.";
      var stM = await xStatus();
      if (!stM || !stM.connected) return "Not connected. Say connect x first.";
      if (typeof mindWantsWeb === "function" && !mindWantsWeb()) {
        return "Mind is amber. Tap green for optional pull, or stay offline — last seen cache only.";
      }
      var pull = await nativeAsk("xPull", { query: CONTRACT.monitorQuery });
      if (!pull || !pull.ok) {
        return "Pull failed · " + ((pull && pull.reason) || "unknown") + ". Usage-light search may need Elevated access on the X app.";
      }
      var tweets = pull.tweets || [];
      var seen = seenIds();
      var fresh = tweets.filter(function (tw) {
        return tw && tw.id && seen.indexOf(tw.id) < 0 && tw.id !== CONTRACT.pinId;
      });
      if (!fresh.length) {
        return "RBOT monitor · " + (pull.count || 0) + " recent · no new asks. Query: " + CONTRACT.monitorQuery;
      }
      var first = fresh[0];
      var draft = draftVoice(first.text, first.id);
      savePending(draft);
      if (alwaysReply()) {
        var pub = await publishDraft(draft);
        if (pub && pub.ok) {
          return "RBOT always-reply published · " + (pub.url || pub.id) + "\nDraft was: " + draft.text;
        }
        return "Draft ready but publish failed · " + ((pub && pub.reason) || "?") + "\n" + draft.text + "\nSay publish to retry.";
      }
      return "RBOT draft (confirm to publish):\n" + draft.text + "\n→ reply to " + draft.inReplyToId + "\nSay publish or yes publish. always reply on to skip confirm.";
    }

    if (/^(smoke\s+rbot|rbot\s+smoke|reply\s+smoke|smoke\s+ask)\b/i.test(t)) {
      var d = draftVoice("smoke ask door", CONTRACT.smokeAskId);
      savePending(d);
      if (alwaysReply()) {
        var p = await publishDraft(d);
        if (p && p.ok) return "Smoke reply live · " + (p.url || p.id) + "\n" + d.text;
        return "Smoke draft seated; publish failed · " + ((p && p.reason) || "connect x first") + "\n" + d.text;
      }
      return "Smoke draft for ask " + CONTRACT.smokeAskId + ":\n" + d.text + "\nSay publish to POST /2/tweets in_reply_to_tweet_id (needs connect x).";
    }

    if (/^(rbot\s+draft)\b/i.test(t)) {
      var rest = t.replace(/^rbot\s+draft\s*/i, "").trim();
      var askId = CONTRACT.smokeAskId;
      var mId = rest.match(/\b(\d{15,22})\b/);
      if (mId) {
        askId = mId[1];
        rest = rest.replace(mId[1], "").trim();
      }
      var d2 = draftVoice(rest || "pin ask", askId);
      savePending(d2);
      return "Draft seated:\n" + d2.text + "\n→ " + d2.inReplyToId + "\nSay publish when ready.";
    }

    if (/^(publish|yes\s+publish|confirm\s+reply|publish\s+reply|rbot\s+publish)\b/i.test(t)) {
      var pend = loadPending();
      if (!pend) return "No pending RBOT draft. Say rbot monitor, smoke rbot, or rbot draft <text>.";
      var out = await publishDraft(pend);
      if (out && out.ok) {
        return "Published · " + (out.url || ("https://x.com/" + CONTRACT.handle + "/status/" + out.id)) + "\n" + (out.text || pend.text);
      }
      return "Publish failed · " + ((out && out.reason) || "unknown") + (out && out.detail ? (" · " + out.detail) : "") + ". Need connect x + tweet.write. Draft kept.";
    }

    if (/^(post\s+tweet|x\s+post)\s+(.+)/i.test(t)) {
      var m = t.match(/^(?:post\s+tweet|x\s+post)\s+(.+)/i);
      var text = (m && m[1] || "").trim();
      if (!hasNativeX()) return "x post needs native spine.";
      var pr = await nativeAsk("xPost", { text: text });
      if (pr && pr.ok) return "Posted · " + (pr.url || pr.id);
      return "Post failed · " + ((pr && pr.reason) || "?");
    }

    return null;
  };

  window.YA_RBOT_X = {
    contract: CONTRACT,
    draftVoice: draftVoice,
    alwaysReply: alwaysReply,
    status: xStatus
  };
})();
