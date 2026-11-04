import Foundation

/// Permanent clay chat thread. Append-only. Never deletes written lines.
/// Writes to MANY Mind seats; on load hunts every seat (offline + optional iCloud) and merges.
enum ChatThreadStore {
    private static let queue = DispatchQueue(label: "ya.chat-thread", qos: .utility)

    static var primaryURL: URL { MindTreeRoot.chatThreadURL }

    /// TOTAL RECALL load: hunt every known seat, merge by id, reseat primary + all write mirrors.
    static func loadAll() -> [ChatMessage] {
        _ = MindTreeRoot.ensureSeated()
        let merged = huntAndMerge()
        if !merged.isEmpty {
            // Reseat survivors into every write mirror so one failure never orphans the thread.
            for url in MindTreeRoot.chatWriteURLs {
                rewriteCanonical(merged, to: url)
            }
        }
        return merged
    }

    /// Append one message to every write seat (offline mirrors + optional iCloud).
    static func append(_ message: ChatMessage) {
        queue.async {
            _ = MindTreeRoot.ensureSeated()
            let enc = JSONEncoder()
            enc.dateEncodingStrategy = .iso8601
            guard var data = try? enc.encode(message) else { return }
            data.append(0x0A)
            for url in MindTreeRoot.chatWriteURLs {
                appendBytes(data, to: url)
            }
        }
    }

    
    /// Merge external messages (upload reseat) into all seats; returns final count.
    @discardableResult
    static func mergeIncoming(_ incoming: [ChatMessage]) -> Int {
        _ = MindTreeRoot.ensureSeated()
        var known = Set(huntAndMerge().map(\.id))
        var extra: [ChatMessage] = []
        for msg in incoming where !known.contains(msg.id) {
            known.insert(msg.id)
            extra.append(msg)
        }
        let merged = (huntAndMerge() + extra).sorted { $0.createdAt < $1.createdAt }
        // Dedup by id preserving order
        var seen = Set<UUID>()
        var unique: [ChatMessage] = []
        for m in merged {
            if seen.insert(m.id).inserted { unique.append(m) }
        }
        for url in MindTreeRoot.chatWriteURLs {
            rewriteCanonical(unique, to: url)
        }
        return unique.count
    }

    // MARK: - Hunt / merge

    private static func huntAndMerge() -> [ChatMessage] {
        var known = Set<UUID>()
        var merged: [ChatMessage] = []
        for url in MindTreeRoot.chatHuntURLs {
            for msg in decodeFile(url) where !known.contains(msg.id) {
                known.insert(msg.id)
                merged.append(msg)
            }
        }
        return merged.sorted { $0.createdAt < $1.createdAt }
    }

    private static func decodeFile(_ url: URL) -> [ChatMessage] {
        guard let data = try? Data(contentsOf: url), !data.isEmpty,
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

    private static func rewriteCanonical(_ messages: [ChatMessage], to url: URL) {
        let enc = JSONEncoder()
        enc.dateEncodingStrategy = .iso8601
        var blob = Data()
        for msg in messages {
            guard let d = try? enc.encode(msg) else { continue }
            blob.append(d)
            blob.append(0x0A)
        }
        let dir = url.deletingLastPathComponent()
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try? blob.write(to: url, options: [.atomic])
    }

    private static func appendBytes(_ data: Data, to url: URL) {
        let dir = url.deletingLastPathComponent()
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        if FileManager.default.fileExists(atPath: url.path),
           let handle = try? FileHandle(forWritingTo: url) {
            defer { try? handle.close() }
            _ = try? handle.seekToEnd()
            try? handle.write(contentsOf: data)
            return
        }
        try? data.write(to: url, options: [.atomic])
    }
}
