import Foundation

/// Seated mind tape — FULL transcript of ALL parties interacting with the mind:
/// Decider · CoS · Rizalbot · clay ЯBOT · successors · tools/code notes.
/// Documents path is teach site of truth (iOS+macOS learn together via handoff/feeds).
/// App Support path is live runtime append on each device.
enum MindTranscript {
    static let fileName = "MIND-TRANSCRIPT.txt"

    /// Bundled / project teach copy when present (Mac Documents seat).
    static var documentsURL: URL { MindTreeRoot.mindTranscriptDocumentsURL }

    static var appSupportURL: URL { MindTreeRoot.mindTranscriptURL }

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
        for url in MindTreeRoot.transcriptWriteURLs {
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
        let urls = MindTreeRoot.transcriptWriteURLs
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


/// CoS/device-smoke inject: drop lines into Documents/ЯBOT/mind/INBOX-COMMANDS.txt
/// (one command per line). Clay drains the file and posts each line for ContentView to send.

/// CoS/device-smoke inject: drop lines into Documents/ЯBOT/mind/INBOX-COMMANDS.txt
/// (one command per line). Clay drains the file and posts each line for ContentView to send.
enum ClayCommandInbox {
    static let fileName = "INBOX-COMMANDS.txt"
    static let notificationName = Notification.Name("ЯBOT.ClayCommandInbox")
    private static var timer: Timer?

    static var url: URL { MindTreeRoot.inboxURL }

    private static var dispatchTimer: DispatchSourceTimer?

    static func start() {
        if dispatchTimer != nil || timer != nil { return }
        // Dispatch timer: fires even when SwiftUI WindowGroup has not appeared yet
        // (devicectl launch / locked screen / first-paint delay).
        let dt = DispatchSource.makeTimerSource(queue: .main)
        dt.schedule(deadline: .now() + 0.5, repeating: 2.0)
        dt.setEventHandler { drain() }
        dt.resume()
        dispatchTimer = dt
        // Keep RunLoop timer as a backup once UI is alive.
        timer = Timer.scheduledTimer(withTimeInterval: 4.0, repeats: true) { _ in
            drain()
        }
        if let t = timer { RunLoop.main.add(t, forMode: .common) }
        drain()
    }

    static func enqueue(_ line: String) {
        let cleaned = line.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else { return }
        let url = Self.url
        let prev = (try? String(contentsOf: url, encoding: .utf8)) ?? ""
        let next = prev.isEmpty ? (cleaned + "\n") : (prev + cleaned + "\n")
        try? next.write(to: url, atomically: true, encoding: .utf8)
    }

    static func drain() {
        let url = Self.url
        guard let raw = try? String(contentsOf: url, encoding: .utf8),
              !raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        var lines = raw.split(whereSeparator: \.isNewline).map { String($0).trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        guard let first = lines.first else {
            try? "".write(to: url, atomically: true, encoding: .utf8)
            return
        }
        lines.removeFirst()
        let remainder = lines.isEmpty ? "" : lines.joined(separator: "\n") + "\n"
        try? remainder.write(to: url, atomically: true, encoding: .utf8)
        NotificationCenter.default.post(name: notificationName, object: nil, userInfo: ["text": first])
    }

    static func restart() {
        timer?.invalidate()
        timer = nil
        dispatchTimer?.cancel()
        dispatchTimer = nil
        start()
    }

    /// Immediately drain up to `max` pending inbox lines (posts notifications).
    @discardableResult
    static func forceDrain(max: Int = 32) -> Int {
        var n = 0
        for _ in 0..<max {
            let url = Self.url
            guard let raw = try? String(contentsOf: url, encoding: .utf8),
                  !raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { break }
            drain()
            n += 1
        }
        return n
    }

}