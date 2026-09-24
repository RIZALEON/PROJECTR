import Foundation

/// Last-resort TOTAL RECALL: manually reseat chat from an uploaded Mind transcript (.txt)
/// or CHAT-THREAD (.jsonl). Merges into every Mind seat and returns a status line.
enum MindReseat {
    /// Filenames that mean "this is a Mind tape / thread — reseat, don't just attach".

    /// Resolve a path or bare filename against Mind Documents / App Support seats.
    static func resolveMindFile(_ raw: String) -> URL? {
        let cleaned = raw.trimmingCharacters(in: CharacterSet(charactersIn: "\"\'"))
        guard !cleaned.isEmpty else { return nil }
        let expanded = (cleaned as NSString).expandingTildeInPath
        let direct = URL(fileURLWithPath: expanded)
        if FileManager.default.fileExists(atPath: direct.path) { return direct }
        let name = URL(fileURLWithPath: cleaned).lastPathComponent
        let candidates = [
            MindTreeRoot.documentsMind.appendingPathComponent(name),
            MindTreeRoot.appSupportMind.appendingPathComponent(name),
            MindTreeRoot.documentsMind.appendingPathComponent(cleaned),
            MindTreeRoot.appSupportMind.appendingPathComponent(cleaned),
        ]
        for url in candidates where FileManager.default.fileExists(atPath: url.path) {
            return url
        }
        // Last smoke name
        if cleaned == "ios-smoke" || cleaned == "last" {
            let smoke = MindTreeRoot.documentsMind.appendingPathComponent("MIND-TRANSCRIPT-ios-reseat.txt")
            if FileManager.default.fileExists(atPath: smoke.path) { return smoke }
        }
        return nil
    }

    static func looksLikeMindFile(_ url: URL) -> Bool {
        let name = url.lastPathComponent.lowercased()
        if name.contains("mind-transcript") || name.contains("mind_transcript") { return true }
        if name.contains("chat-thread") || name.contains("chat_thread") { return true }
        if name == "mind-transcript.txt" || name.hasSuffix(".mind.txt") { return true }
        if name.hasSuffix(".jsonl") && (name.contains("chat") || name.contains("thread") || name.contains("mind")) {
            return true
        }
        // Content sniff for .txt
        if name.hasSuffix(".txt") || name.hasSuffix(".md") || name.hasSuffix(".log") {
            if let head = headText(url, max: 4000) {
                if head.contains("---- ") && (head.contains("| user |") || head.contains("| assistant |") || head.contains("| prompt ----") || head.contains("| reply ----")) {
                    return true
                }
                if head.contains("MIND-TRANSCRIPT") || head.contains("TOTAL RECALL") { return true }
            }
        }
        return false
    }

    /// Import file → merge into ChatThreadStore seats → return human status.
    @discardableResult
    static func reseat(from url: URL) -> String {
        _ = MindTreeRoot.ensureSeated()
        let accessed = url.startAccessingSecurityScopedResource()
        defer { if accessed { url.stopAccessingSecurityScopedResource() } }

        let parsed: [ChatMessage]
        let ext = url.pathExtension.lowercased()
        let name = url.lastPathComponent.lowercased()
        if ext == "jsonl" || name.contains("chat-thread") {
            parsed = parseJSONL(url)
        } else {
            parsed = parseTranscriptTXT(url)
        }
        guard !parsed.isEmpty else {
            return "mind reseat FAILED — no chat lines parsed from \(url.lastPathComponent)"
        }
        let before = ChatThreadStore.loadAll().count
        let merged = ChatThreadStore.mergeIncoming(parsed)
        return "mind reseat OK file=\(url.lastPathComponent) parsed=\(parsed.count) before=\(before) after=\(merged) seats=\(MindTreeRoot.chatWriteURLs.count) — full thread restored to face + all Mind backups"
    }

    // MARK: - parsers

    private static func parseJSONL(_ url: URL) -> [ChatMessage] {
        guard let data = try? Data(contentsOf: url),
              let text = String(data: data, encoding: .utf8) else { return [] }
        let dec = JSONDecoder()
        dec.dateDecodingStrategy = .iso8601
        var out: [ChatMessage] = []
        for line in text.split(whereSeparator: \.isNewline) {
            let raw = String(line)
            guard !raw.isEmpty, let d = raw.data(using: .utf8),
                  let msg = try? dec.decode(ChatMessage.self, from: d) else { continue }
            out.append(msg)
        }
        return out
    }

    /// MIND-TRANSCRIPT blocks:
    /// ---- ISO8601 | party | role | surface | kind ----
    /// body…
    private static func parseTranscriptTXT(_ url: URL) -> [ChatMessage] {
        guard let text = try? String(contentsOf: url, encoding: .utf8), !text.isEmpty else { return [] }
        var out: [ChatMessage] = []
        let pattern = #"----\s+([^\s|]+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^\s-]+)\s*----"#
        guard let re = try? NSRegularExpression(pattern: pattern, options: []) else {
            return parseLooseLines(text)
        }
        let ns = text as NSString
        let matches = re.matches(in: text, options: [], range: NSRange(location: 0, length: ns.length))
        if matches.isEmpty { return parseLooseLines(text) }

        for (i, m) in matches.enumerated() {
            let headerEnd = m.range.location + m.range.length
            let bodyStart = headerEnd
            let bodyEnd = (i + 1 < matches.count) ? matches[i + 1].range.location : ns.length
            var body = ns.substring(with: NSRange(location: bodyStart, length: max(0, bodyEnd - bodyStart)))
                .trimmingCharacters(in: .whitespacesAndNewlines)
            if body.isEmpty { continue }

            let tsRaw = ns.substring(with: m.range(at: 1))
            let roleRaw = ns.substring(with: m.range(at: 3)).trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let kind = ns.substring(with: m.range(at: 5)).trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

            let role: ChatMessage.Role
            if roleRaw.contains("assistant") || roleRaw == "clay" || kind == "reply" {
                role = .assistant
            } else if roleRaw.contains("system") || kind == "system" {
                role = .system
            } else {
                role = .user
            }
            let created = parseDate(tsRaw) ?? Date()
            out.append(ChatMessage(role: role, text: body, createdAt: created))
        }
        return out
    }

    private static func parseLooseLines(_ text: String) -> [ChatMessage] {
        // Fallback: non-empty lines as alternating user/system if clearly labeled
        var out: [ChatMessage] = []
        for line in text.split(whereSeparator: \.isNewline) {
            let s = String(line).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !s.isEmpty, !s.hasPrefix("#") else { continue }
            if s.hasPrefix("[") && s.contains("SYSTEM") {
                out.append(ChatMessage(role: .system, text: s))
            } else if s.lowercased().hasPrefix("assistant:") || s.lowercased().hasPrefix("clay:") {
                out.append(ChatMessage(role: .assistant, text: s))
            } else {
                out.append(ChatMessage(role: .user, text: s))
            }
        }
        return out
    }

    private static func parseDate(_ raw: String) -> Date? {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = iso.date(from: raw) { return d }
        iso.formatOptions = [.withInternetDateTime]
        return iso.date(from: raw)
    }

    private static func headText(_ url: URL, max: Int) -> String? {
        let accessed = url.startAccessingSecurityScopedResource()
        defer { if accessed { url.stopAccessingSecurityScopedResource() } }
        guard let data = try? Data(contentsOf: url), !data.isEmpty else { return nil }
        let slice = data.prefix(max)
        return String(data: slice, encoding: .utf8)
    }
}
