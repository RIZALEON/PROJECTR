import Foundation

/// Catalog + seat. GGUF lives in Documents, not Safari Cache.
enum ModelManager {
    static let smolHF = "https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_K_S.gguf"
    static let smolName = "SmolLM2-135M-Instruct-Q4_K_S.gguf"

    static func listGGUF() -> [URL] {
        NativeVault.prepare()
        let fm = FileManager.default
        let roots = [NativeVault.root, NativeVault.gutURL]
        var out: [URL] = []
        for r in roots {
            guard let files = try? fm.contentsOfDirectory(at: r, includingPropertiesForKeys: [.fileSizeKey]) else { continue }
            out.append(contentsOf: files.filter { $0.pathExtension.lowercased() == "gguf" })
        }
        return out
    }

    static func seat(_ url: URL) throws -> URL {
        try NativeVault.seatHeart(from: url)
    }

    static func status() -> [String: Any] {
        [
            "heartBytes": NativeVault.heartBytes(),
            "seated": NativeHeart.shared.seated,
            "catalog": smolName,
            "files": listGGUF().map { $0.lastPathComponent }
        ]
    }
}
