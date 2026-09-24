import Foundation

/// Seated mind tape — FULL transcript of ALL parties interacting with the mind:
/// Decider · CoS · Rizalbot · clay ЯBOT · successors · tools/code notes.
/// Documents path is teach site of truth (iOS+macOS learn together via handoff/feeds).
/// App Support path is live runtime append on each device.
enum MindTranscript {
    static let fileName = "MIND-TRANSCRIPT.txt"

    /// Bundled / project teach copy when present (Mac Documents seat).
    static var documentsURL: URL {
        // Prefer Application Support live file; Documents project path is for Mac Decider handoff.
        let home = URL(fileURLWithPath: NSHomeDirectory())
        let docs = home.appendingPathComponent("Documents/ЯBOT/mind", isDirectory: true)
        try? FileManager.default.createDirectory(at: docs, withIntermediateDirectories: true)
        return docs.appendingPathComponent(fileName)
    }

    static var appSupportURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support")
        let dir = base.appendingPathComponent("ЯBOT", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent(fileName)
    }

    static var primaryURL: URL { appSupportURL }

    private static let iso: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static var surfaceTag: String {
        #if os(iOS)
        return "ios"
        #elseif os(macOS)
        return "macos"
        #else
        return "unknown"
        #endif
    }

    @discardableResult
    static func append(role: String, kind: String, body: String, surface: String? = nil, party: String? = nil) -> Bool {
        let cleaned = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else { return false }
        let ts = iso.string(from: Date())
        let surf = surface ?? surfaceTag
        let who = party ?? "clay"
        let block = "---- \(ts) | \(who) | \(role) | \(surf) | \(kind) ----\n\(cleaned)\n\n"
        guard let data = block.data(using: .utf8) else { return false }

        var ok = false
        for url in [appSupportURL, documentsURL] {
            if writeAppend(data, to: url) { ok = true }
        }
        // Feed MACHINE MIND so mind size / offload sees the tape
        let feedURL = MachineMindVault.feeds.appendingPathComponent(fileName)
        _ = writeAppend(data, to: feedURL)
        return ok
    }

    private static func writeAppend(_ data: Data, to url: URL) -> Bool {
        let dir = url.deletingLastPathComponent()
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        if FileManager.default.fileExists(atPath: url.path) {
            guard let handle = try? FileHandle(forWritingTo: url) else { return false }
            defer { try? handle.close() }
            handle.seekToEndOfFile()
            handle.write(data)
            return true
        } else {
            // Seed header once
            let header = """
            # ЯBOT MIND-TRANSCRIPT — seated tape
            # Successors RECALL this file. Teach HOW not WHAT. iOS+macOS learn together.
            # Format: ---- ISO8601 | party | role | surface | kind ----
            # Parties: Decider | CoS | Rizalbot | clay | successor | system

            """.data(using: .utf8) ?? Data()
            var all = header
            all.append(data)
            do {
                try all.write(to: url)
                return true
            } catch {
                return false
            }
        }
    }

    static func status() -> String {
        let urls = [appSupportURL, documentsURL]
        var lines: [String] = []
        for url in urls {
            let n = (try? String(contentsOf: url, encoding: .utf8))?.components(separatedBy: "---- ").count ?? 0
            let entries = max(0, n - 1)
            lines.append("\(url.path) entries~\(entries)")
        }
        return "MIND-TRANSCRIPT seated:\n- " + lines.joined(separator: "\n- ")
    }

    static func tail(maxChars: Int = 2500) -> String {
        let url = FileManager.default.fileExists(atPath: appSupportURL.path) ? appSupportURL : documentsURL
        guard let text = try? String(contentsOf: url, encoding: .utf8), !text.isEmpty else {
            return "MIND-TRANSCRIPT empty or missing — will create on next chat line."
        }
        if text.count <= maxChars { return text }
        return String(text.suffix(maxChars))
    }
}
