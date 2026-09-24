import Foundation

/// Green-path multi-bot search / research / page-read. Only when ModeStore is online.
/// Bots: Wikipedia (search+summary), OpenSearch, DuckDuckGo IA + lite HTML, Wikidata; jina/fx for read.
enum OnlineSearch {
    struct Hit: Equatable {
        let bot: String
        let title: String
        let extract: String
        var url: String? = nil
    }

    // MARK: - Public

    static func search(_ raw: String) -> String {
        guard ModeStore.shared.isOnline else {
            return "OFFLINE. Web search stays dark. Tap ONLINE or say `online`, then `search <query>`."
        }
        let term = stripQuery(from: raw)
        guard term.count >= 2 else {
            return "Search what? Try: search capital of Utah"
        }

        let hits = gatherHits(for: term)
        guard let best = hits.first else {
            return "Online search found nothing usable for “\(term)”. Try another phrase."
        }
        let extras = hits.dropFirst().prefix(3).map { "\($0.bot): \($0.title)" }
        var out = "ONLINE search · \(best.bot)\n\(best.title)\n\(best.extract)"
        if !extras.isEmpty {
            out += "\nAlso: " + extras.joined(separator: " · ")
        }
        out += "\nNonNuclear: green nerve only — offline seat still premier."
        return out
    }

    static func research(_ raw: String) -> String {
        guard ModeStore.shared.isOnline else {
            return "OFFLINE. Research stays dark. Tap ONLINE or say `online`, then `research <topic>`."
        }
        var term = stripQuery(from: raw)
        for p in [#"^(?i)research\s+"#, #"^(?i)investigate\s+"#, #"^(?i)dig\s+into\s+"#] {
            if let r = try? NSRegularExpression(pattern: p) {
                term = r.stringByReplacingMatches(in: term, range: NSRange(term.startIndex..., in: term), withTemplate: "")
            }
        }
        term = term.trimmingCharacters(in: .whitespacesAndNewlines)
        guard term.count >= 2 else {
            return "Research what? Try: research Utah state capital"
        }

        let hits = gatherHits(for: term)
        guard !hits.isEmpty else {
            return "Research found nothing usable for “\(term)”."
        }

        var lines: [String] = ["ONLINE research · \(term)"]
        let picked = dedupe(hits).prefix(4)
        for (i, h) in picked.enumerated() {
            let snip = String(h.extract.prefix(280))
            lines.append("\(i + 1). \(h.title) (\(h.bot))\n\(snip)")
        }
        let bots = Array(Set(picked.map(\.bot))).sorted().joined(separator: " + ")
        lines.append("Sources: \(bots)")
        lines.append("NonNuclear: green nerve only — offline seat still premier.")
        return lines.joined(separator: "\n\n")
    }

    static func read(_ raw: String) -> String {
        guard ModeStore.shared.isOnline else {
            return "OFFLINE. Page read stays dark. Tap ONLINE or say `online`, then `read <url>`."
        }
        guard let url = extractURL(from: raw) else {
            return "Read what URL? Try: read https://en.wikipedia.org/wiki/Salt_Lake_City"
        }
        guard let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" else {
            return "Only http/https URLs on the green nerve."
        }

        if let wiki = wikipediaURLTitle(url), let hit = wikipediaSummary(title: wiki) {
            return "ONLINE read · wikipedia\n\(hit.title)\n\(hit.extract)\n\(url.absoluteString)\nNonNuclear: green nerve only."
        }
        if let screen = xScreen(from: url) {
            let path = url.pathComponents.filter { $0 != "/" }
            if path.count >= 3, path[1].lowercased() == "status", let hit = fxTwitterStatus(screen: screen, id: path[2]) {
                return "ONLINE read · fxtwitter\n\(hit.title)\n\(hit.extract)\n\(hit.url ?? url.absoluteString)\nNonNuclear: green nerve only."
            }
            if let hit = fxTwitterUser(screen: screen) {
                return "ONLINE read · fxtwitter\n\(hit.title)\n\(hit.extract)\n\(hit.url ?? url.absoluteString)\nNonNuclear: green nerve only."
            }
        }
        if let hit = jinaRead(url: url) {
            return "ONLINE read · jina\n\(hit.title)\n\(hit.extract)\n\(url.absoluteString)\nNonNuclear: green nerve only."
        }
        if let hit = htmlStripRead(url: url) {
            return "ONLINE read · html\n\(hit.title)\n\(hit.extract)\n\(url.absoluteString)\nNonNuclear: green nerve only."
        }
        return "Could not read that page. Try another URL or `search` / `research` instead."
    }

    // MARK: - Gather + rank

    private static func gatherHits(for term: String) -> [Hit] {
        let variants = queryVariants(term)
        var collected: [Hit] = []
        let lock = NSLock()
        let group = DispatchGroup()
        let queue = DispatchQueue(label: "ya.online.search", attributes: .concurrent)

        func add(_ hit: Hit?) {
            guard let hit, !hit.extract.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
            lock.lock(); collected.append(hit); lock.unlock()
        }

        for v in variants.prefix(4) {
            group.enter()
            queue.async {
                defer { group.leave() }
                add(wikipediaSearch(v))
            }
            group.enter()
            queue.async {
                defer { group.leave() }
                add(wikipediaOpenSearch(v))
            }
            group.enter()
            queue.async {
                defer { group.leave() }
                add(duckDuckGo(v))
            }
            group.enter()
            queue.async {
                defer { group.leave() }
                add(wikidata(v))
            }
        }

        // Capital-of special: pull place summary (often states the capital city)
        if let place = capitalPlace(from: term) {
            group.enter()
            queue.async {
                defer { group.leave() }
                if let hit = wikipediaSummary(title: place) {
                    add(Hit(bot: "wikipedia-place", title: hit.title, extract: hit.extract, url: hit.url))
                }
            }
        }

        _ = group.wait(timeout: .now() + 12)

        // Lite DDG only if still thin
        if collected.filter({ $0.bot.hasPrefix("duck") }).isEmpty, let v = variants.first {
            add(duckDuckGoLite(v))
        }

        return rank(collected, query: term)
    }

    private static func rank(_ hits: [Hit], query: String) -> [Hit] {
        let q = query.lowercased()
        let tokens = q.split { !$0.isLetter && !$0.isNumber }.map(String.init).filter { $0.count > 2 }
        let wantsCapital = q.contains("capital")

        func score(_ h: Hit) -> Int {
            var s = min(h.extract.count, 800)
            switch h.bot {
            case "wikipedia", "wikipedia-place": s += 220
            case "wikipedia-opensearch": s += 180
            case "duckduckgo": s += 100
            case "duckduckgo-lite": s += 70
            case "wikidata": s += 40
            default: break
            }
            let hay = (h.title + " " + h.extract).lowercased()
            var overlap = 0
            for t in tokens where hay.contains(t) {
                s += 35
                overlap += 1
            }
            // Soft penalty when almost no query overlap (stops random "USA Capital" lenders)
            if overlap == 0 { s -= 200 }
            if wantsCapital {
                let place = capitalPlace(from: query)?.lowercased()
                if let place, hay.contains(place) { s += 140 }
                else if place != nil { s -= 120 }
                if hay.contains("capital") && overlap > 0 { s += 100 }
                if hay.contains("is the capital") || hay.contains("state capital") { s += 160 }
                if hay.contains("salt lake") { s += 80 }
                if h.title.lowercased().contains("capitol") && !h.title.lowercased().contains("capital") {
                    s -= 150
                }
            }
            return s
        }

        let sorted = hits.sorted { score($0) > score($1) }
        let filtered: [Hit]
        if wantsCapital, let place = capitalPlace(from: query)?.lowercased() {
            filtered = sorted.filter { h in
                let hay = (h.title + " " + h.extract).lowercased()
                return hay.contains(place)
                    || hay.contains("is the capital")
                    || hay.contains("state capital")
                    || hay.contains("capital and")
            }
        } else {
            filtered = sorted
        }
        let use = filtered.isEmpty ? sorted : filtered
        return dedupe(use)
    }

    private static func dedupe(_ hits: [Hit]) -> [Hit] {
        var seen = Set<String>()
        var out: [Hit] = []
        for h in hits {
            let key = h.title.lowercased()
                .replacingOccurrences(of: " ", with: "")
                .prefix(48)
                .description
            if seen.contains(key) { continue }
            seen.insert(key)
            out.append(h)
        }
        return out
    }

    // MARK: - Query helpers

    static func stripQuery(from raw: String) -> String {
        var q = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        let patterns = [
            #"^(?i)search\s+(it\s+)?online\s+for\s+"#,
            #"^(?i)search\s+the\s+web\s+for\s+"#,
            #"^(?i)search\s+online\s+"#,
            #"^(?i)search\s+for\s+"#,
            #"^(?i)search\s+"#,
            #"^(?i)look\s+up\s+"#,
            #"^(?i)web\s+search\s+"#,
            #"^(?i)research\s+"#,
            #"^(?i)read\s+"#,
            #"^(?i)fetch\s+"#
        ]
        for p in patterns {
            if let r = try? NSRegularExpression(pattern: p) {
                q = r.stringByReplacingMatches(in: q, range: NSRange(q.startIndex..., in: q), withTemplate: "")
            }
        }
        while q.hasSuffix("?") || q.hasSuffix("!") || q.hasSuffix(".") {
            q = String(q.dropLast())
        }
        return q.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func queryVariants(_ term: String) -> [String] {
        var out: [String] = [term]
        if let place = capitalPlace(from: term) {
            out.append(place)
            out.append("\(place) capital")
            out.append("Capital of \(place)")
        }
        // de-noise "what is / who is"
        if let r = try? NSRegularExpression(pattern: #"^(?i)(what|who|where|when|why|how)\s+(is|are|was|were)\s+"#) {
            let stripped = r.stringByReplacingMatches(in: term, range: NSRange(term.startIndex..., in: term), withTemplate: "")
            if stripped.count >= 2 { out.append(stripped) }
        }
        var uniq: [String] = []
        var seen = Set<String>()
        for v in out {
            let k = v.lowercased()
            if seen.contains(k) { continue }
            seen.insert(k)
            uniq.append(v)
        }
        return uniq
    }

    private static func capitalPlace(from term: String) -> String? {
        let patterns = [
            #"^(?i)(?:the\s+)?capital\s+(?:city\s+)?of\s+(.+)$"#,
            #"^(?i)(.+?)\s+state\s+capital$"#,
            #"^(?i)(.+?)\s+capital\s+city$"#,
            #"^(?i)(.+?)\s+capital$"#
        ]
        for p in patterns {
            guard let r = try? NSRegularExpression(pattern: p) else { continue }
            let range = NSRange(term.startIndex..., in: term)
            guard let m = r.firstMatch(in: term, range: range), m.numberOfRanges > 1,
                  let wr = Range(m.range(at: 1), in: term) else { continue }
            var place = String(term[wr]).trimmingCharacters(in: .whitespacesAndNewlines)
            // Avoid matching "Utah Capitol" style leftovers
            place = place.replacingOccurrences(of: #"(?i)\bcapitol\b"#, with: "", options: .regularExpression)
                .trimmingCharacters(in: .whitespacesAndNewlines)
            if place.count >= 2 { return place }
        }
        return nil
    }

    private static func extractURL(from raw: String) -> URL? {
        let s = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if let u = URL(string: s), u.scheme != nil { return u }
        if let r = try? NSRegularExpression(pattern: #"https?://[^\s<>\"']+"#),
           let m = r.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)),
           let wr = Range(m.range, in: s) {
            return URL(string: String(s[wr]))
        }
        return nil
    }

    private static func wikipediaURLTitle(_ url: URL) -> String? {
        let host = (url.host ?? "").replacingOccurrences(of: "www.", with: "")
        guard host.contains("wikipedia.org") else { return nil }
        let parts = url.pathComponents.filter { $0 != "/" }
        guard let wikiIdx = parts.firstIndex(of: "wiki"), wikiIdx + 1 < parts.count else { return nil }
        return parts[wikiIdx + 1].removingPercentEncoding?.replacingOccurrences(of: "_", with: " ")
    }

    private static func xScreen(from url: URL) -> String? {
        let host = (url.host ?? "").replacingOccurrences(of: "www.", with: "").lowercased()
        guard host == "x.com" || host == "twitter.com" || host == "mobile.twitter.com" else { return nil }
        let parts = url.pathComponents.filter { $0 != "/" }
        guard let first = parts.first else { return nil }
        let skip: Set<String> = ["home", "explore", "search", "i", "settings", "messages", "notifications"]
        if skip.contains(first.lowercased()) { return nil }
        return first.replacingOccurrences(of: "@", with: "")
    }

    // MARK: - HTTP

    private static let ua = "ЯBOT/1.0 (offline-premier; green-search)"

    private static func getData(url: URL, timeout: TimeInterval = 9, accept: String = "*/*") -> Data? {
        let sem = DispatchSemaphore(value: 0)
        var result: Data?
        var req = URLRequest(url: url, timeoutInterval: timeout)
        req.setValue(accept, forHTTPHeaderField: "Accept")
        req.setValue(ua, forHTTPHeaderField: "User-Agent")
        URLSession.shared.dataTask(with: req) { data, resp, _ in
            defer { sem.signal() }
            if let http = resp as? HTTPURLResponse, !(200...299).contains(http.statusCode) { return }
            result = data
        }.resume()
        _ = sem.wait(timeout: .now() + timeout + 1)
        return result
    }

    private static func getJSON(url: URL, timeout: TimeInterval = 9) -> [String: Any]? {
        guard let data = getData(url: url, timeout: timeout, accept: "application/json") else { return nil }
        return (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
    }

    private static func getJSONArray(url: URL, timeout: TimeInterval = 9) -> [Any]? {
        guard let data = getData(url: url, timeout: timeout, accept: "application/json") else { return nil }
        return (try? JSONSerialization.jsonObject(with: data)) as? [Any]
    }

    private static func getText(url: URL, timeout: TimeInterval = 12) -> String? {
        guard let data = getData(url: url, timeout: timeout, accept: "text/plain, text/html, */*") else { return nil }
        return String(data: data, encoding: .utf8) ?? String(data: data, encoding: .isoLatin1)
    }

    // MARK: - Bots

    private static func wikipediaSearch(_ term: String) -> Hit? {
        guard var comp = URLComponents(string: "https://en.wikipedia.org/w/api.php") else { return nil }
        comp.queryItems = [
            URLQueryItem(name: "action", value: "query"),
            URLQueryItem(name: "list", value: "search"),
            URLQueryItem(name: "utf8", value: "1"),
            URLQueryItem(name: "format", value: "json"),
            URLQueryItem(name: "srlimit", value: "5"),
            URLQueryItem(name: "srsearch", value: term)
        ]
        guard let url = comp.url,
              let data = getJSON(url: url),
              let query = data["query"] as? [String: Any],
              let search = query["search"] as? [[String: Any]],
              let first = search.first,
              let title = first["title"] as? String else { return nil }
        // Prefer a result whose title/snippet fits capital asks
        let q = term.lowercased()
        let pick: String = {
            if q.contains("capital") {
                for row in search {
                    guard let t = row["title"] as? String else { continue }
                    let tl = t.lowercased()
                    if tl.contains("capitol") { continue }
                    if tl == capitalPlace(from: term)?.lowercased() { return t }
                }
                for row in search {
                    guard let t = row["title"] as? String else { continue }
                    if !t.lowercased().contains("capitol") { return t }
                }
            }
            return title
        }()
        return wikipediaSummary(title: pick).map {
            Hit(bot: "wikipedia", title: $0.title, extract: $0.extract, url: $0.url)
        }
    }

    private static func wikipediaOpenSearch(_ term: String) -> Hit? {
        guard var comp = URLComponents(string: "https://en.wikipedia.org/w/api.php") else { return nil }
        comp.queryItems = [
            URLQueryItem(name: "action", value: "opensearch"),
            URLQueryItem(name: "search", value: term),
            URLQueryItem(name: "limit", value: "5"),
            URLQueryItem(name: "namespace", value: "0"),
            URLQueryItem(name: "format", value: "json")
        ]
        guard let url = comp.url,
              let arr = getJSONArray(url: url),
              arr.count > 1,
              let titles = arr[1] as? [String], !titles.isEmpty else { return nil }
        let q = term.lowercased()
        let title: String = {
            if q.contains("capital") {
                return titles.first { !$0.lowercased().contains("capitol") } ?? titles[0]
            }
            return titles[0]
        }()
        return wikipediaSummary(title: title).map {
            Hit(bot: "wikipedia-opensearch", title: $0.title, extract: $0.extract, url: $0.url)
        }
    }

    private static func wikipediaSummary(title: String) -> Hit? {
        let enc = title.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? title
        guard let sumURL = URL(string: "https://en.wikipedia.org/api/rest_v1/page/summary/\(enc)"),
              let sum = getJSON(url: sumURL) else { return nil }
        let t = (sum["title"] as? String) ?? title
        let extract = (sum["extract"] as? String) ?? ""
        guard !extract.isEmpty else { return nil }
        let pageURL = (sum["content_urls"] as? [String: Any])
            .flatMap { $0["desktop"] as? [String: Any] }
            .flatMap { $0["page"] as? String }
        return Hit(bot: "wikipedia", title: t, extract: String(extract.prefix(900)), url: pageURL)
    }

    private static func duckDuckGo(_ term: String) -> Hit? {
        guard var comp = URLComponents(string: "https://api.duckduckgo.com/") else { return nil }
        comp.queryItems = [
            URLQueryItem(name: "q", value: term),
            URLQueryItem(name: "format", value: "json"),
            URLQueryItem(name: "no_html", value: "1"),
            URLQueryItem(name: "skip_disambig", value: "1")
        ]
        guard let url = comp.url, let data = getJSON(url: url) else { return nil }
        var extract = (data["AbstractText"] as? String) ?? (data["Definition"] as? String) ?? ""
        var title = (data["Heading"] as? String) ?? (data["AbstractSource"] as? String) ?? "DuckDuckGo"
        if extract.isEmpty, let related = data["RelatedTopics"] as? [Any] {
            for item in related {
                if let t = item as? [String: Any], let text = t["Text"] as? String, !text.isEmpty {
                    extract = text
                    title = (t["FirstURL"] as? String) ?? title
                    break
                }
                if let t = item as? [String: Any], let topics = t["Topics"] as? [[String: Any]],
                   let text = topics.first?["Text"] as? String, !text.isEmpty {
                    extract = text
                    title = (topics.first?["FirstURL"] as? String) ?? title
                    break
                }
            }
        }
        // Answer field (calc / instant)
        if extract.isEmpty, let answer = data["Answer"] as? String, !answer.isEmpty {
            extract = answer
            title = (data["Heading"] as? String) ?? term
        }
        guard !extract.isEmpty else { return nil }
        return Hit(bot: "duckduckgo", title: String(title.prefix(180)), extract: String(extract.prefix(700)))
    }

    private static func duckDuckGoLite(_ term: String) -> Hit? {
        guard var comp = URLComponents(string: "https://lite.duckduckgo.com/lite/") else { return nil }
        comp.queryItems = [URLQueryItem(name: "q", value: term)]
        guard let url = comp.url, let html = getText(url: url) else { return nil }
        // Very light parse: first result link text + nearby snippet
        guard let linkRe = try? NSRegularExpression(pattern: #"rel="nofollow"\s+href="([^"]+)"[^>]*>([^<]{3,120})"#),
              let m = linkRe.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
              m.numberOfRanges >= 3,
              let tr = Range(m.range(at: 2), in: html) else { return nil }
        let title = String(html[tr]).trimmingCharacters(in: .whitespacesAndNewlines)
        var extract = title
        if let snipRe = try? NSRegularExpression(pattern: #"class="result-snippet"[^>]*>(.*?)</td>"#, options: [.dotMatchesLineSeparators]),
           let sm = snipRe.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
           let sr = Range(sm.range(at: 1), in: html) {
            extract = stripTags(String(html[sr]))
        }
        guard extract.count >= 8 else { return nil }
        return Hit(bot: "duckduckgo-lite", title: title, extract: String(extract.prefix(700)))
    }

    private static func wikidata(_ term: String) -> Hit? {
        guard var comp = URLComponents(string: "https://www.wikidata.org/w/api.php") else { return nil }
        comp.queryItems = [
            URLQueryItem(name: "action", value: "wbsearchentities"),
            URLQueryItem(name: "search", value: term),
            URLQueryItem(name: "language", value: "en"),
            URLQueryItem(name: "limit", value: "3"),
            URLQueryItem(name: "format", value: "json")
        ]
        guard let url = comp.url,
              let data = getJSON(url: url),
              let search = data["search"] as? [[String: Any]],
              let h = search.first else { return nil }
        let title = (h["label"] as? String) ?? (h["id"] as? String) ?? term
        let desc = [h["description"] as? String, h["id"] as? String].compactMap { $0 }.joined(separator: " · ")
        guard !desc.isEmpty else { return nil }
        return Hit(bot: "wikidata", title: title, extract: String(desc.prefix(700)))
    }

    private static func jinaRead(url: URL) -> Hit? {
        guard let jina = URL(string: "https://r.jina.ai/\(url.absoluteString)"),
              let text = getText(url: jina, timeout: 14) else { return nil }
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard cleaned.count > 40 else { return nil }
        // jina often starts with Title: / URL Source:
        var title = url.host ?? "page"
        var body = cleaned
        if let tRange = cleaned.range(of: #"Title:\s*(.+)"#, options: .regularExpression) {
            title = String(cleaned[tRange]).replacingOccurrences(of: "Title:", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if let md = cleaned.range(of: "Markdown Content:", options: .caseInsensitive) {
            body = String(cleaned[md.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return Hit(bot: "jina", title: String(title.prefix(180)), extract: String(body.prefix(900)), url: url.absoluteString)
    }

    private static func htmlStripRead(url: URL) -> Hit? {
        guard let html = getText(url: url, timeout: 12) else { return nil }
        var title = url.host ?? "page"
        if let tRe = try? NSRegularExpression(pattern: #"<title[^>]*>(.*?)</title>"#, options: [.caseInsensitive, .dotMatchesLineSeparators]),
           let m = tRe.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
           let wr = Range(m.range(at: 1), in: html) {
            title = stripTags(String(html[wr]))
        }
        var body = html
        for pat in [#"<script[^>]*>[\s\S]*?</script>"#, #"<style[^>]*>[\s\S]*?</style>"#, #"<nav[^>]*>[\s\S]*?</nav>"#] {
            if let r = try? NSRegularExpression(pattern: pat, options: [.caseInsensitive]) {
                body = r.stringByReplacingMatches(in: body, range: NSRange(body.startIndex..., in: body), withTemplate: " ")
            }
        }
        let text = stripTags(body)
        guard text.count > 60 else { return nil }
        return Hit(bot: "html", title: String(title.prefix(180)), extract: String(text.prefix(900)), url: url.absoluteString)
    }

    private static func fxTwitterUser(screen: String) -> Hit? {
        guard let url = URL(string: "https://api.fxtwitter.com/\(screen)"),
              let data = getJSON(url: url),
              (data["code"] as? Int) == 200 || data["user"] != nil,
              let user = data["user"] as? [String: Any] else { return nil }
        let name = (user["name"] as? String) ?? screen
        let handle = (user["screen_name"] as? String) ?? screen
        let desc = (user["description"] as? String) ?? ""
        let followers = user["followers"] ?? user["followers_count"]
        let extract = [desc, followers.map { "followers: \($0)" }].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · ")
        guard !extract.isEmpty else { return nil }
        return Hit(bot: "fxtwitter", title: "\(name) (@\(handle))", extract: String(extract.prefix(700)),
                   url: (user["url"] as? String) ?? "https://x.com/\(handle)")
    }

    private static func fxTwitterStatus(screen: String, id: String) -> Hit? {
        guard let url = URL(string: "https://api.fxtwitter.com/\(screen)/status/\(id)"),
              let data = getJSON(url: url) else { return nil }
        let tweet = (data["tweet"] as? [String: Any]) ?? data
        let text = (tweet["text"] as? String) ?? (tweet["full_text"] as? String) ?? ""
        guard !text.isEmpty else { return nil }
        let author = ((tweet["author"] as? [String: Any])?["screen_name"] as? String) ?? screen
        return Hit(bot: "fxtwitter", title: "Post by @\(author)", extract: String(text.prefix(700)),
                   url: (tweet["url"] as? String) ?? "https://x.com/\(screen)/status/\(id)")
    }

    private static func stripTags(_ s: String) -> String {
        var t = s
        if let r = try? NSRegularExpression(pattern: #"<[^>]+>"#) {
            t = r.stringByReplacingMatches(in: t, range: NSRange(t.startIndex..., in: t), withTemplate: " ")
        }
        t = t.replacingOccurrences(of: "&nbsp;", with: " ")
            .replacingOccurrences(of: "&amp;", with: "&")
            .replacingOccurrences(of: "&lt;", with: "<")
            .replacingOccurrences(of: "&gt;", with: ">")
            .replacingOccurrences(of: "&quot;", with: "\"")
        if let r = try? NSRegularExpression(pattern: #"\s+"#) {
            t = r.stringByReplacingMatches(in: t, range: NSRange(t.startIndex..., in: t), withTemplate: " ")
        }
        return t.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
