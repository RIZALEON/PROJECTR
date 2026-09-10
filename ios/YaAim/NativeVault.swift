import Foundation

/// Gut on the phone, not in Safari Cache.
enum NativeVault {
    static var root: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    static var heartURL: URL { root.appendingPathComponent("heart.gguf") }
    static var gutURL: URL { root.appendingPathComponent("gut", isDirectory: true) }
    /// Offline books & manuals the embed can reference anytime (Documents/Я/mind/books/).
    static var mindURL: URL { root.appendingPathComponent("mind", isDirectory: true) }
    static var booksURL: URL { mindURL.appendingPathComponent("books", isDirectory: true) }

    static func prepare() {
        try? FileManager.default.createDirectory(at: gutURL, withIntermediateDirectories: true)
        try? FileManager.default.createDirectory(at: booksURL, withIntermediateDirectories: true)
    }

    static func copyIntoGut(from src: URL) throws -> URL {
        prepare()
        let name = src.lastPathComponent
        let dest = gutURL.appendingPathComponent(name)
        if FileManager.default.fileExists(atPath: dest.path) {
            try FileManager.default.removeItem(at: dest)
        }
        try FileManager.default.copyItem(at: src, to: dest)
        return dest
    }

    static func seatHeart(from src: URL) throws -> URL {
        prepare()
        if FileManager.default.fileExists(atPath: heartURL.path) {
            try FileManager.default.removeItem(at: heartURL)
        }
        try FileManager.default.copyItem(at: src, to: heartURL)
        return heartURL
    }

    /// Copy a manual into Я/mind/books/ (offline books shelf).
    static func copyIntoBooks(from src: URL) throws -> URL {
        prepare()
        let name = src.lastPathComponent
        let dest = booksURL.appendingPathComponent(name)
        if FileManager.default.fileExists(atPath: dest.path) {
            try FileManager.default.removeItem(at: dest)
        }
        try FileManager.default.copyItem(at: src, to: dest)
        return dest
    }

    static func heartBytes() -> Int {
        (try? FileManager.default.attributesOfItem(atPath: heartURL.path)[.size] as? Int) ?? 0
    }

    static func gutBytes() -> Int {
        let fm = FileManager.default
        guard let files = try? fm.contentsOfDirectory(at: gutURL, includingPropertiesForKeys: [.fileSizeKey]) else { return 0 }
        return files.reduce(0) { acc, u in
            acc + ((try? u.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0)
        }
    }

    static func booksBytes() -> Int {
        let fm = FileManager.default
        prepare()
        guard let files = try? fm.contentsOfDirectory(at: booksURL, includingPropertiesForKeys: [.fileSizeKey]) else { return 0 }
        return files.reduce(0) { acc, u in
            acc + ((try? u.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0)
        }
    }

    /// All regular files under Documents (root + gut + mind/books + heart) — offline mind size substrate.
    static func documentsBytes() -> Int {
        let fm = FileManager.default
        prepare()
        var total = 0
        guard let enumerator = fm.enumerator(
            at: root,
            includingPropertiesForKeys: [.isRegularFileKey, .fileSizeKey],
            options: [.skipsHiddenFiles]
        ) else { return heartBytes() + gutBytes() + booksBytes() }
        for case let url as URL in enumerator {
            let vals = try? url.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey])
            if vals?.isRegularFile == true {
                total += vals?.fileSize ?? 0
            }
        }
        return total
    }

    /// Packaged www embed (shelf packs, hardcode, senses, modules) seated in the app bundle — not Documents.
    static func wwwBundleBytes() -> Int {
        let fm = FileManager.default
        guard let www = Bundle.main.resourceURL?.appendingPathComponent("www", isDirectory: true),
              fm.fileExists(atPath: www.path) else { return 0 }
        var total = 0
        guard let enumerator = fm.enumerator(
            at: www,
            includingPropertiesForKeys: [.isRegularFileKey, .fileSizeKey],
            options: [.skipsHiddenFiles]
        ) else { return 0 }
        for case let url as URL in enumerator {
            let vals = try? url.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey])
            if vals?.isRegularFile == true {
                total += vals?.fileSize ?? 0
            }
        }
        return total
    }
}
