/* Green mind: native URLSession fetch (no CORS) + Safari sheet for pasted links. */
(function () {
  var prevFetch = window.fetchLinkRaw;
  window.fetchLinkRaw = async function (url) {
    var u = String(url || "").trim();
    try {
      if (typeof isNativeSpine === "function" && isNativeSpine() && typeof nativeAsk === "function") {
        var r = await nativeAsk("fetch", { url: u });
        if (r && r.ok && r.text && String(r.text).trim().length > 40) return String(r.text);
      }
    } catch (e) {}
    if (typeof prevFetch === "function") return prevFetch(u);
    throw new Error("link fetch failed");
  };

  var prevDescribe = window.describeLink;
  window.describeLink = async function (url, forQuery) {
    try {
      if (typeof openBrowse === "function") openBrowse(url);
    } catch (e) {}
    if (typeof prevDescribe === "function") return prevDescribe(url, forQuery);
    return null;
  };
})();
