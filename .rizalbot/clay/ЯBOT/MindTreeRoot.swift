import Foundation

/// Standing law: Mind lives under relative root `ЯBOT/mind` in MANY seats.
/// Primary + offline mirrors + optional online (iCloud) so TOTAL RECALL can hunt and reload
/// the full transcript if one seat fails. Never delete written Mind files.
enum MindTreeRoot {
    static let lawPath = "ЯBOT/mind"
    static let chatFile = "CHAT-THREAD.jsonl"
    static let transcriptFile = "MIND-TRANSCRIPT.txt"
    static let inboxFile = "INBOX-COMMANDS.txt"

    // MARK: - Core seats (always)

    static var appSupportMind: URL {
        seat(FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
             ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support"))
    }

    static var documentsMind: URL {
        seat(FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
             ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents"))
    }

    static var cachesMind: URL {
        seat(FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first
             ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Caches"))
    }

    /// Machine Mind feeds — another offline copy beside vault feeds.
    static var machineMindFeedChat: URL {
        MachineMindVault.feeds.appendingPathComponent(chatFile)
    }

    /// Optional online amplifier: iCloud ubiquity container (survives app delete when iCloud on).
    /// Offline-premier: absence is fine; presence is extra backup.
    static var iCloudMind: URL? {
        guard let ubi = FileManager.default.url(forUbiquityContainerIdentifier: nil) else { return nil }
        let dir = ubi.appendingPathComponent("Documents", isDirectory: true)
            .appendingPathComponent(lawPath, isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    #if os(macOS)
    /// Mac home seats outside any future sandbox — extra offline recovery.
    static var homeDocumentsMind: URL {
        seat(URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents"))
    }
    static var homeAppSupportMind: URL {
        seat(URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support"))
    }
    #endif

    // MARK: - File URLs (primary names)

    static var chatThreadURL: URL { appSupportMind.appendingPathComponent(chatFile) }
    static var chatThreadDocumentsURL: URL { documentsMind.appendingPathComponent(chatFile) }
    static var mindTranscriptURL: URL { appSupportMind.appendingPathComponent(transcriptFile) }
    static var mindTranscriptDocumentsURL: URL { documentsMind.appendingPathComponent(transcriptFile) }
    static var inboxURL: URL { documentsMind.appendingPathComponent(inboxFile) }

    /// Every seat we WRITE chat into (append-only mirrors).
    static var chatWriteURLs: [URL] {
        var urls: [URL] = [
            chatThreadURL,
            chatThreadDocumentsURL,
            cachesMind.appendingPathComponent(chatFile),
            machineMindFeedChat,
        ]
        #if os(macOS)
        urls.append(homeDocumentsMind.appendingPathComponent(chatFile))
        urls.append(homeAppSupportMind.appendingPathComponent(chatFile))
        #endif
        if let cloud = iCloudMind {
            urls.append(cloud.appendingPathComponent(chatFile))
        }
        return uniqueURLs(urls)
    }

    /// Every seat we HUNT on restore (writes + legacy spellings).
    static var chatHuntURLs: [URL] {
        var urls = chatWriteURLs
        let home = URL(fileURLWithPath: NSHomeDirectory())
        urls += [
            documentsMind.appendingPathComponent("chat-thread.jsonl"),
            appSupportMind.appendingPathComponent("chat-thread.jsonl"),
            cachesMind.appendingPathComponent("chat-thread.jsonl"),
            home.appendingPathComponent("Documents/ЯBOT/mind/CHAT-THREAD.jsonl"),
            home.appendingPathComponent("Library/Application Support/ЯBOT/CHAT-THREAD.jsonl"),
            home.appendingPathComponent("Library/Caches/ЯBOT/mind/CHAT-THREAD.jsonl"),
            home.appendingPathComponent("Library/Application Support/ЯBOT/mind/CHAT-THREAD.jsonl"),
        ]
        if let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            urls.append(support.appendingPathComponent("ЯBOT/CHAT-THREAD.jsonl"))
            urls.append(support.appendingPathComponent("mind/CHAT-THREAD.jsonl"))
        }
        if let cloud = iCloudMind {
            urls.append(cloud.appendingPathComponent("chat-thread.jsonl"))
        }
        // Shared tmp backup (last-chance offline)
        urls.append(FileManager.default.temporaryDirectory
            .appendingPathComponent("ЯBOT-mind-backup", isDirectory: true)
            .appendingPathComponent(chatFile))
        return uniqueURLs(urls)
    }

    /// Transcript write mirrors (same multi-seat law).
    static var transcriptWriteURLs: [URL] {
        var urls: [URL] = [
            mindTranscriptURL,
            mindTranscriptDocumentsURL,
            cachesMind.appendingPathComponent(transcriptFile),
            MachineMindVault.feeds.appendingPathComponent(transcriptFile),
        ]
        #if os(macOS)
        urls.append(homeDocumentsMind.appendingPathComponent(transcriptFile))
        urls.append(homeAppSupportMind.appendingPathComponent(transcriptFile))
        #endif
        if let cloud = iCloudMind {
            urls.append(cloud.appendingPathComponent(transcriptFile))
        }
        return uniqueURLs(urls)
    }

    /// Backward-compatible alias.
    static var legacyChatCandidates: [URL] { chatHuntURLs }

    @discardableResult
    static func ensureSeated() -> String {
        let roots = [
            appSupportMind,
            documentsMind,
            cachesMind,
        ] + {
            #if os(macOS)
            return [homeDocumentsMind, homeAppSupportMind]
            #else
            return [] as [URL]
            #endif
        }()
        for r in roots { _ = r }
        _ = MachineMindVault.feeds
        if let cloud = iCloudMind { _ = cloud }
        let tmp = FileManager.default.temporaryDirectory.appendingPathComponent("ЯBOT-mind-backup", isDirectory: true)
        try? FileManager.default.createDirectory(at: tmp, withIntermediateDirectories: true)
        if !FileManager.default.fileExists(atPath: inboxURL.path) {
            try? "".write(to: inboxURL, atomically: true, encoding: .utf8)
        }
        let cloudNote = iCloudMind == nil ? "icloud=off" : "icloud=on"
        return "mind-tree seated root=\(lawPath) seats=\(chatWriteURLs.count) hunt=\(chatHuntURLs.count) \(cloudNote)"
    }

    // MARK: - helpers

    private static func seat(_ base: URL) -> URL {
        let dir = base.appendingPathComponent(lawPath, isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    private static func uniqueURLs(_ urls: [URL]) -> [URL] {
        var seen = Set<String>()
        var out: [URL] = []
        for u in urls {
            let key = u.standardizedFileURL.path
            if seen.insert(key).inserted { out.append(u) }
        }
        return out
    }
}
