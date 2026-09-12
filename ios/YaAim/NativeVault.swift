import Foundation

/// Gut on the phone, not in Safari Cache.
enum NativeVault {
    static var root: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    static var heartURL: URL { root.appendingPathComponent("heart.gguf") }
    static var gutURL: URL { root.appendingPathComponent("gut", isDirectory: true) }
    /// Offline books & manuals (Documents/mind/books/).
    static var mindURL: URL { root.appendingPathComponent("mind", isDirectory: true) }
    static var booksURL: URL { mindURL.appendingPathComponent("books", isDirectory: true) }
    /// On-device Я folder (Files → On My iPhone → Я). Seeded on first launch from the bundle.
    static var yaURL: URL { root.appendingPathComponent("Я", isDirectory: true) }

    static func prepare() {
        let fm = FileManager.default
        try? fm.createDirectory(at: gutURL, withIntermediateDirectories: true)
        try? fm.createDirectory(at: booksURL, withIntermediateDirectories: true)
        try? fm.createDirectory(at: yaURL.appendingPathComponent("mind/books", isDirectory: true), withIntermediateDirectories: true)
        try? fm.createDirectory(at: yaURL.appendingPathComponent("gut", isDirectory: true), withIntermediateDirectories: true)
        seedYaFolderFromBundle()
    }

    /// Copy hardcoded www/hardcode + www/senses into Documents/Я once so Files shows the organ.
    static func seedYaFolderFromBundle() {
        let fm = FileManager.default
        let stamp = yaURL.appendingPathComponent(".seeded")
        if fm.fileExists(atPath: stamp.path) { return }
        guard let www = Bundle.main.resourceURL?.appendingPathComponent("www", isDirectory: true) else { return }
        let pairs = [("hardcode", "hardcode"), ("senses", "senses")]
        for (srcName, destName) in pairs {
            let src = www.appendingPathComponent(srcName, isDirectory: true)
            let dest = yaURL.appendingPathComponent(destName, isDirectory: true)
            if fm.fileExists(atPath: src.path), !fm.fileExists(atPath: dest.path) {
                try? fm.copyItem(at: src, to: dest)
            }
        }
        let readme = """
        Я — on-device folder. Hardcoded at install from the app bundle.
        Heart: Documents/heart.gguf
        Gut: Documents/gut and Я/gut
        Base app size is the .app itself (binary + www + frameworks).
        """
        try? readme.write(to: yaURL.appendingPathComponent("README.txt"), atomically: true, encoding: .utf8)
        try? "seeded".write(to: stamp, atomically: true, encoding: .utf8)
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

    static func folderBytes(_ url: URL) -> Int {
        let fm = FileManager.default
        guard fm.fileExists(atPath: url.path) else { return 0 }
        var isDir: ObjCBool = false
        if fm.fileExists(atPath: url.path, isDirectory: &isDir), !isDir.boolValue {
            return (try? fm.attributesOfItem(atPath: url.path)[.size] as? Int) ?? 0
        }
        var total = 0
        guard let enumerator = fm.enumerator(
            at: url,
            includingPropertiesForKeys: [.isRegularFileKey, .fileSizeKey],
            options: [.skipsHiddenFiles]
        ) else { return 0 }
        for case let item as URL in enumerator {
            let vals = try? item.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey])
            if vals?.isRegularFile == true {
                total += vals?.fileSize ?? 0
            }
        }
        return total
    }

    static func heartBytes() -> Int { folderBytes(heartURL) }
    static func gutBytes() -> Int { folderBytes(gutURL) }
    static func booksBytes() -> Int {
        prepare()
        return folderBytes(booksURL)
    }
    static func yaFolderBytes() -> Int {
        prepare()
        return folderBytes(yaURL)
    }
    /// Entire installed .app — BASE mind on first launch (binary, www, frameworks, hardcoded parts).
    static func appBundleBytes() -> Int {
        guard let url = Bundle.main.bundleURL as URL? else { return wwwBundleBytes() }
        return folderBytes(url)
    }
    static func documentsBytes() -> Int {
        prepare()
        return folderBytes(root)
    }
    static func wwwBundleBytes() -> Int {
        guard let www = Bundle.main.resourceURL?.appendingPathComponent("www", isDirectory: true) else { return 0 }
        return folderBytes(www)
    }
}
