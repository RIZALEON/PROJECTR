import Foundation

/// Engine RIZAL on iOS: llama.cpp + Metal + Documents/heart.gguf.
/// Not wasm. Not Safari. Function 0 still talks if this is `none`.
final class NativeHeart {
    static let shared = NativeHeart()

    enum Kind: String {
        case none
        case llama = "llama.cpp"
    }

    private let lock = NSLock()
    private var loaded = false

    var seated: Bool {
        FileManager.default.fileExists(atPath: NativeVault.heartURL.path) && NativeVault.heartBytes() > 1024
    }

    var engine: Kind {
        #if canImport(llama)
        return seated ? .llama : .none
        #else
        return .none
        #endif
    }

    func status() -> [String: Any] {
        [
            "engine": engine.rawValue,
            "seated": seated,
            "heartBytes": NativeVault.heartBytes(),
            "n_ctx": 256,
            "metal": engine == .llama
        ]
    }

    func generate(prompt: String) -> String {
        let p = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if p.isEmpty { return "I am here." }
        ConversationStore.append(role: "user", text: p)
        let out: String
        switch engine {
        case .llama:
            out = tokens(for: p)
        case .none:
            if seated {
                out = "GGUF is in Documents (\(NativeVault.heartBytes()) B). NativeHeart has no llama.xcframework in this build, so tokens stay off. Function 0 still talks in the skin. Borrowed Metal: MITHRIL."
            } else {
                out = "NativeHeart is here. No heart.gguf. Cloud-up or Files → On My iPhone → Я. Function 0 still works."
            }
        }
        ConversationStore.append(role: "ya", text: out)
        return out
    }

    private func tokens(for prompt: String) -> String {
        #if canImport(llama)
        lock.lock()
        defer { lock.unlock() }
        if !loaded {
            // llama_backend_init()
            // llama_model_load_from_file(NativeVault.heartURL, n_gpu_layers = 99 Metal)
            // llama_init_from_model(n_ctx = 256, n_threads = 1)
            loaded = true
        }
        // llama_batch + llama_decode + sampler. n_predict ~64.
        return runLlama(prompt)
        #else
        return prompt
        #endif
    }

    #if canImport(llama)
    private func runLlama(_ prompt: String) -> String {
        "NativeHeart/llama.cpp/Metal: \(prompt.prefix(80))"
    }
    #endif
}
