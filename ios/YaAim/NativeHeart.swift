import Foundation

/// Native llama.cpp / Metal heart. Not wasm. Link llama.xcframework to seat.
enum NativeHeart {
    static var seated: Bool {
        FileManager.default.fileExists(atPath: NativeVault.heartURL.path) && NativeVault.heartBytes() > 1024
    }

    static func generate(prompt: String) -> String {
        let p = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if p.isEmpty { return "I am here." }
        #if canImport(llama)
        return runLlama(p)
        #else
        if seated {
            return "Heart file is in Documents (\(NativeVault.heartBytes()) bytes). llama.xcframework is not linked yet, so this spine cannot think from GGUF. Function 0 still works. On a Mac: llama.cpp ./build-xcframework.sh then embed it."
        }
        return "Native spine is on. No GGUF in Documents. Cloud-up a heart, or drop one in Files → On My iPhone → Я. Function 0 still works."
        #endif
    }

    #if canImport(llama)
    static func runLlama(_ prompt: String) -> String {
        "Native llama.cpp received: \(prompt.prefix(80))"
    }
    #endif
}
