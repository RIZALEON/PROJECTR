import Foundation

/// Native llama.cpp / Metal heart. Not wasm. Link llama.xcframework to think from GGUF.
enum NativeHeart {
    static var seated: Bool {
        FileManager.default.fileExists(atPath: NativeVault.heartURL.path) && NativeVault.heartBytes() > 1024
    }

    static func generate(prompt: String) -> String {
        let p = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if p.isEmpty { return "I am here." }
        ConversationStore.append(role: "user", text: p)
        let out: String
        #if canImport(llama)
        out = runLlama(p)
        #else
        if seated {
            out = "Heart is in Documents (\(NativeVault.heartBytes()) bytes). llama.xcframework is not linked, so this process cannot emit tokens yet. Function 0 still talks in the skin. Borrowed Metal tonight: App Store MITHRIL + the same SmolLM2 GGUF."
        } else {
            out = "Native spine is on. No GGUF in Documents. Cloud-up a heart, or drop one in Files → On My iPhone → Я. Function 0 still works."
        }
        #endif
        ConversationStore.append(role: "ya", text: out)
        return out
    }

    #if canImport(llama)
    static func runLlama(_ prompt: String) -> String {
        // llama.cpp C API when xcframework is embedded:
        // llama_backend_init(); llama_model_load_from_file(heart); llama_init_from_model; llama_decode.
        // n_ctx 256 on iPhone, n_gpu_layers Metal, n_threads 1.
        "Native llama.cpp received: \(prompt.prefix(80))"
    }
    #endif
}
