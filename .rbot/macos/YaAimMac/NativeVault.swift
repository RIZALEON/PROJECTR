import Foundation

enum NativeVault {
    static var root: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("YaAim", isDirectory: true)
    }

    static var heartURL: URL { root.appendingPathComponent("heart.gguf") }
    static var gutURL: URL { root.appendingPathComponent("gut", isDirectory: true) }

    static func prepare() {
        try? FileManager.default.createDirectory(at: gutURL, withIntermediateDirectories: true)
    }

    static func copyIntoGut(from src: URL) throws -> URL {
        prepare()
        let dest = gutURL.appendingPathComponent(src.lastPathComponent)
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
}
