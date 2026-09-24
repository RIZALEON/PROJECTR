import Foundation

/// Real recovery hooks for digital plumbing clogs.
/// Called by EssenceTrace.clearClog so TOKEN utility unblocks stuck pipes, not only receipts.
enum PlumbingClear {
    struct Report {
        let clog: String
        let before: String
        let after: String
        let actions: [String]
        var text: String {
            """
            recovery clog=\(clog)
            before: \(before)
            actions: \(actions.joined(separator: " · "))
            after: \(after)
            """
        }
    }

    /// Normalize aliases to canonical clog ids.
    static func canonical(_ name: String) -> String {
        let n = name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            .replacingOccurrences(of: "_", with: "-")
            .replacingOccurrences(of: " ", with: "-")
        switch n {
        case "inbox", "inbox-stall", "inbox-drain", "inbox-drain-stall", "inboxdrainstall":
            return "inbox-drain-stall"
        case "mind", "mind-feed", "mind-drift", "mind-feed-drift", "tape-drift", "transcript-drift":
            return "mind-feed-drift"
        case "heart", "heart-stall", "heart-spawn", "heart-spawn-stall", "generate-stall":
            return "heart-spawn-stall"
        default:
            return n
        }
    }

    @discardableResult
    static func recover(_ name: String) -> Report {
        let clog = canonical(name)
        switch clog {
        case "inbox-drain-stall":
            return recoverInboxDrainStall()
        case "mind-feed-drift":
            return recoverMindFeedDrift()
        case "heart-spawn-stall":
            return recoverHeartSpawnStall()
        default:
            return Report(
                clog: clog,
                before: "unknown clog",
                after: "no hook",
                actions: ["logged-only (no recovery hook for this name yet)"]
            )
        }
    }

    // MARK: - inbox-drain-stall

    private static func recoverInboxDrainStall() -> Report {
        let url = ClayCommandInbox.url
        let beforeRaw = (try? String(contentsOf: url, encoding: .utf8)) ?? ""
        let beforeLines = beforeRaw.split(whereSeparator: \.isNewline).filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }.count
        let beforeBytes = beforeRaw.utf8.count

        var actions: [String] = []
        // Restart poller (idempotent)
        ClayCommandInbox.restart()
        actions.append("inbox-timer-restart")

        // Force-drain up to N pending lines immediately
        let drained = ClayCommandInbox.forceDrain(max: 32)
        actions.append("force-drain=\(drained)")

        let afterRaw = (try? String(contentsOf: url, encoding: .utf8)) ?? ""
        let afterLines = afterRaw.split(whereSeparator: \.isNewline).filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }.count
        let afterBytes = afterRaw.utf8.count

        return Report(
            clog: "inbox-drain-stall",
            before: "lines=\(beforeLines) bytes=\(beforeBytes) path=\(url.path)",
            after: "lines=\(afterLines) bytes=\(afterBytes) path=\(url.path)",
            actions: actions
        )
    }

    // MARK: - mind-feed-drift

    private static func recoverMindFeedDrift() -> Report {
        let docs = MindTranscript.documentsURL
        let app = MindTranscript.appSupportURL
        let feed = MachineMindVault.feeds.appendingPathComponent(MindTranscript.fileName)

        func size(_ url: URL) -> Int {
            (try? Data(contentsOf: url))?.count ?? 0
        }
        let bDocs = size(docs), bApp = size(app), bFeed = size(feed)
        let before = "docs=\(bDocs) appSupport=\(bApp) feeds=\(bFeed)"

        // Canonical = longest mirror (most complete tape)
        let candidates: [(URL, Int)] = [(docs, bDocs), (app, bApp), (feed, bFeed)]
        guard let canon = candidates.max(by: { $0.1 < $1.1 }), canon.1 > 0,
              let data = try? Data(contentsOf: canon.0) else {
            return Report(
                clog: "mind-feed-drift",
                before: before,
                after: before,
                actions: ["no-canonical-tape"]
            )
        }

        var actions = ["canonical=\(canon.0.lastPathComponent) bytes=\(canon.1)"]
        for (url, sz) in candidates where url != canon.0 {
            do {
                try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
                try data.write(to: url, options: .atomic)
                actions.append("synced→\(url.path) from=\(sz) to=\(data.count)")
            } catch {
                actions.append("sync-fail \(url.lastPathComponent): \(error.localizedDescription)")
            }
        }

        let after = "docs=\(size(docs)) appSupport=\(size(app)) feeds=\(size(feed))"
        return Report(clog: "mind-feed-drift", before: before, after: after, actions: actions)
    }

    // MARK: - heart-spawn-stall

    private static func recoverHeartSpawnStall() -> Report {
        var actions: [String] = []
        var before = "heart-spawn-unknown"
        var after = before
        #if os(macOS)
        // Kill stuck llama-completion children only (never the clay app itself)
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/bin/ps")
        task.arguments = ["-axo", "pid=,command="]
        let pipe = Pipe()
        task.standardOutput = pipe
        try? task.run()
        task.waitUntilExit()
        let out = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let lines = out.split(whereSeparator: \.isNewline)
        var pids: [String] = []
        for line in lines {
            let s = String(line)
            if s.contains("llama-completion") {
                let pid = s.trimmingCharacters(in: .whitespaces).split(separator: " ").first.map(String.init)
                if let pid { pids.append(pid) }
            }
        }
        before = "llama-completion-pids=\(pids.joined(separator: ","))"
        for pid in pids {
            let k = Process()
            k.executableURL = URL(fileURLWithPath: "/bin/kill")
            k.arguments = ["-9", pid]
            try? k.run()
            k.waitUntilExit()
            actions.append("kill-llama-completion pid=\(pid)")
        }
        if pids.isEmpty { actions.append("no-stuck-llama-completion") }
        // Reset any UserDefaults generate latch if present
        UserDefaults.standard.set(false, forKey: "ya.heart.generateBusy")
        actions.append("generateBusy=false")
        after = "llama-completion-cleared latch-reset"
        #else
        before = "ios-in-process-latch"
        UserDefaults.standard.set(false, forKey: "ya.heart.generateBusy")
        NotificationCenter.default.post(name: Notification.Name("ЯBOT.HeartResetLatch"), object: nil)
        actions.append("generateBusy=false")
        actions.append("posted HeartResetLatch")
        after = "ios-latch-reset"
        #endif
        return Report(clog: "heart-spawn-stall", before: before, after: after, actions: actions)
    }

}
