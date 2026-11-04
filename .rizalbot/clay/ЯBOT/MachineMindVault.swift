import Foundation
#if canImport(AppKit)
import AppKit
#endif

/// MACHINE MIND size law:
///   total = FULL APP PACKAGE SIZE + every additional file fed / seated outside the package.
/// ↑ feed grows mind · ↓ offload · counter shows that total.
enum MachineMindVault {
    enum Unit: String, CaseIterable {
        case mb = "MB"
        case gb = "GB"
        case tb = "TB"

        var next: Unit {
            switch self {
            case .mb: return .gb
            case .gb: return .tb
            case .tb: return .mb
            }
        }
    }

    static var root: URL {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let dir = support.appendingPathComponent("ЯBOT/MACHINE MIND", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    static var feeds: URL {
        let dir = root.appendingPathComponent("feeds", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    /// Base = entire installed app package (the .app / .ipa payload on disk).
    static func appBaseBytes() -> Int64 {
        var sum = directoryBytes(Bundle.main.bundleURL)
        // Some seats expose Resources separately — never double-count paths inside the bundle.
        if let res = Bundle.main.resourceURL {
            let bundlePath = Bundle.main.bundleURL.standardizedFileURL.path
            let resPath = res.standardizedFileURL.path
            if !resPath.hasPrefix(bundlePath) {
                sum += directoryBytes(res)
            }
        }
        return max(sum, 0)
    }

    /// Everything added after install: MACHINE MIND root (feeds+), Mind tree seats, teachings.
    static func additionalBytes() -> Int64 {
        var sum = directoryBytes(root)
        sum += directoryBytes(MindTreeRoot.appSupportMind)
        sum += directoryBytes(MindTreeRoot.documentsMind)
        #if os(macOS)
        sum += directoryBytes(MindTreeRoot.cachesMind)
        #endif
        let teach = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ЯBOT/teachings.jsonl")
        if let vals = try? teach.resourceValues(forKeys: [.fileSizeKey]), let n = vals.fileSize {
            sum += Int64(n)
        }
        return max(sum, 0)
    }

    /// Counter face: app package + all additional Mind files.
    static func mindBytes() -> Int64 {
        appBaseBytes() + additionalBytes()
    }

    static func sizeLabel(unit: Unit? = nil) -> String {
        let bytes = mindBytes()
        let u = unit ?? preferredUnit(forBytes: bytes)
        let b = Double(bytes)
        switch u {
        case .tb:
            return String(format: "%.2f TB", b / 1_099_511_627_776.0)
        case .gb:
            let g = b / 1_073_741_824.0
            return g >= 10 ? String(format: "%.1f GB", g) : String(format: "%.2f GB", g)
        case .mb:
            let m = b / 1_048_576.0
            if m >= 100 { return String(format: "%.0f MB", m) }
            if m >= 10 { return String(format: "%.1f MB", m) }
            return String(format: "%.2f MB", m)
        }
    }

    /// Digits+unit for clay glyph counter.
    static func clayDisplayParts(unit: Unit? = nil) -> (number: String, unit: String) {
        let bytes = mindBytes()
        let u = unit ?? preferredUnit(forBytes: bytes)
        let b = Double(bytes)
        let number: String
        switch u {
        case .tb:
            number = String(format: "%.2f", b / 1_099_511_627_776.0)
        case .gb:
            let g = b / 1_073_741_824.0
            number = g >= 10 ? String(format: "%.1f", g) : String(format: "%.2f", g)
        case .mb:
            let m = b / 1_048_576.0
            if m >= 100 { number = String(format: "%.0f", m) }
            else if m >= 10 { number = String(format: "%.1f", m) }
            else { number = String(format: "%.2f", m) }
        }
        return (number, u.rawValue)
    }

    static func preferredUnit(forBytes bytes: Int64) -> Unit {
        if bytes >= 1_099_511_627_776 { return .tb }
        if bytes >= 1_073_741_824 { return .gb }
        return .mb
    }

    /// Breakdown for flash / status: "app + added = total".
    static func breakdownLabel() -> String {
        let app = appBaseBytes()
        let add = additionalBytes()
        let total = app + add
        func mb(_ n: Int64) -> String { String(format: "%.1f MB", Double(n) / 1_048_576.0) }
        return "app \(mb(app)) + added \(mb(add)) = \(mb(total))"
    }

    private static func directoryBytes(_ url: URL) -> Int64 {
        let fm = FileManager.default
        var isDir: ObjCBool = false
        guard fm.fileExists(atPath: url.path, isDirectory: &isDir) else { return 0 }
        if !isDir.boolValue {
            let vals = try? url.resourceValues(forKeys: [.fileSizeKey, .totalFileAllocatedSizeKey])
            return Int64(vals?.totalFileAllocatedSize ?? vals?.fileSize ?? 0)
        }
        guard let enumerator = fm.enumerator(
            at: url,
            includingPropertiesForKeys: [.fileSizeKey, .totalFileAllocatedSizeKey, .isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else { return 0 }
        var sum: Int64 = 0
        for case let fileURL as URL in enumerator {
            guard let vals = try? fileURL.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey, .totalFileAllocatedSizeKey]),
                  vals.isRegularFile == true else { continue }
            sum += Int64(vals.totalFileAllocatedSize ?? vals.fileSize ?? 0)
        }
        return sum
    }

    @discardableResult
    static func feed(from src: URL) throws -> String {
        let dest = feeds.appendingPathComponent(src.lastPathComponent)
        if FileManager.default.fileExists(atPath: dest.path) {
            try FileManager.default.removeItem(at: dest)
        }
        try FileManager.default.copyItem(at: src, to: dest)
        return "Fed \(src.lastPathComponent) · \(breakdownLabel())"
    }

    @discardableResult
    static func offload() throws -> URL {
        let stamp = ISO8601DateFormatter().string(from: Date()).replacingOccurrences(of: ":", with: "-")
        let out = FileManager.default.temporaryDirectory.appendingPathComponent("YA-MIND-\(stamp).rzl.zip")
        if FileManager.default.fileExists(atPath: out.path) {
            try FileManager.default.removeItem(at: out)
        }
        #if canImport(AppKit)
        let coord = NSFileCoordinator()
        var err: NSError?
        var wrote = false
        coord.coordinate(readingItemAt: root, options: [.forUploading], error: &err) { zipURL in
            do {
                try FileManager.default.copyItem(at: zipURL, to: out)
                wrote = true
            } catch {}
        }
        if let err { throw err }
        if wrote {
            if let downloads = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first {
                let dest = downloads.appendingPathComponent(out.lastPathComponent)
                try? FileManager.default.removeItem(at: dest)
                do {
                    try FileManager.default.copyItem(at: out, to: dest)
                    return dest
                } catch {}
            }
            return out
        }
        #endif
        let note = FileManager.default.temporaryDirectory.appendingPathComponent("YA-MIND-\(stamp).rzl.txt")
        let body = "MACHINE MIND offload\n\(breakdownLabel())\nappBase=\(appBaseBytes())\nadditional=\(additionalBytes())\ntotal=\(mindBytes())\n"
        try body.write(to: note, atomically: true, encoding: .utf8)
        return note
    }
}
