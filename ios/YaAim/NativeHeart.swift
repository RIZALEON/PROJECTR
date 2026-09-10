import Foundation

#if canImport(llama)
import llama
#endif

/// Engine RIZAL on iOS: llama.cpp + Metal + Documents/heart.gguf.
/// Not wasm. Not Safari. Function 0 still talks if this is `none`.
///
/// Metal seat: ios/llama.xcframework Embed & Sign (team 88HACKXHZL).
/// Unlimited local tokens — no cloud meter. MITHRIL = borrow lab only.
final class NativeHeart {
    static let shared = NativeHeart()

    enum Kind: String {
        case none
        case llama = "llama.cpp"
    }

    private let lock = NSLock()
    private var loaded = false
    private var loadError: String?

    #if canImport(llama)
    private var modelPtr: OpaquePointer?
    private var ctxPtr: OpaquePointer?
    #endif

    var seated: Bool {
        FileManager.default.fileExists(atPath: NativeVault.heartURL.path) && NativeVault.heartBytes() > 1024
    }

    var frameworkLinked: Bool {
        #if canImport(llama)
        true
        #else
        false
        #endif
    }

    var engine: Kind {
        #if canImport(llama)
        seated ? .llama : .none
        #else
        .none
        #endif
    }

    /// Bridge `status` — www can show heart line. Honest tokensOff when framework absent.
    func status() -> [String: Any] {
        let tokensOn = frameworkLinked && seated && (loadError == nil)
        var st: [String: Any] = [
            "engine": engine.rawValue,
            "seated": seated,
            "heartBytes": NativeVault.heartBytes(),
            "heartURL": NativeVault.heartURL.path,
            "n_ctx": 256,
            "n_gpu_layers": frameworkLinked ? 99 : 0,
            "metal": frameworkLinked && seated,
            "frameworkLinked": frameworkLinked,
            "tokensOn": tokensOn,
            "tokensOff": !tokensOn,
            "loaded": loaded
        ]
        if !frameworkLinked {
            st["mithrilBorrow"] =
                "App Store → Local LLM: MITHRIL — lab only, not Я rename. ios/workaround/MITHRIL.md"
            st["hint"] =
                "Mac: build/borrow llama.xcframework (Metal), Embed & Sign into YaAim, team 88HACKXHZL. docs/SEAT-LLAMA-XCFRAMEWORK.md"
        } else if !seated {
            st["hint"] = "No heart.gguf. Files → On My iPhone → Я / heart.gguf (or in-app pick)."
        } else if let err = loadError {
            st["loadError"] = err
            st["tokensOff"] = true
            st["tokensOn"] = false
        }
        return st
    }

    func generate(prompt: String) -> String {
        let p = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if p.isEmpty { return "I am here." }
        ConversationStore.append(role: "user", text: p)
        let out: String
        #if canImport(llama)
        if seated {
            out = tokens(for: p)
        } else {
            out = "NativeHeart linked llama.xcframework but no heart.gguf. Seat GGUF first. tokensOff."
        }
        #else
        if seated {
            out = "tokensOff · GGUF seated (\(NativeVault.heartBytes()) B) · llama.xcframework missing in this build. Function 0 still talks. mithrilBorrow: App Store Local LLM MITHRIL (lab only — not product rename). Mac: Embed & Sign llama.xcframework — docs/SEAT-LLAMA-XCFRAMEWORK.md."
        } else {
            out = "tokensOff · NativeHeart here · no heart.gguf · no llama.xcframework. Seat GGUF via Files → On My iPhone → Я. Function 0 still works. mithrilBorrow hint in status."
        }
        #endif
        ConversationStore.append(role: "ya", text: out)
        return out
    }

    #if canImport(llama)
    private func tokens(for prompt: String) -> String {
        lock.lock()
        defer { lock.unlock() }
        if !loaded { ensureLoaded() }
        if let err = loadError { return "tokensOff · \(err)" }
        return runLlama(prompt)
    }

    /// Load Documents/heart.gguf with Metal n_gpu_layers=99.
    /// Symbol names match current ggml-org/llama.cpp C API — if an xcframework
    /// build renames one, adjust on Mac (see SEAT-LLAMA-XCFRAMEWORK.md).
    private func ensureLoaded() {
        loadError = nil
        let path = NativeVault.heartURL.path
        guard FileManager.default.fileExists(atPath: path) else {
            loadError = "heart.gguf missing"
            loaded = false
            return
        }

        llama_backend_init()

        var mparams = llama_model_default_params()
        mparams.n_gpu_layers = 99 // Metal

        guard let model = llama_model_load_from_file(path, mparams) else {
            loadError = "llama_model_load_from_file failed"
            loaded = false
            return
        }
        modelPtr = model

        var cparams = llama_context_default_params()
        cparams.n_ctx = 256
        cparams.n_threads = 1

        guard let ctx = llama_init_from_model(model, cparams) else {
            loadError = "llama_init_from_model failed"
            llama_model_free(model)
            modelPtr = nil
            loaded = false
            return
        }
        ctxPtr = ctx
        loaded = true
    }

    /// Greedy decode scaffold — n_predict ~64. Mac may swap in llama_sampler_chain.
    private func runLlama(_ prompt: String) -> String {
        guard let ctx = ctxPtr, let model = modelPtr else {
            return "tokensOff · model not loaded"
        }
        guard let vocab = llama_model_get_vocab(model) else {
            return "tokensOff · vocab missing"
        }

        let nPromptMax: Int32 = 256
        var tokens = [llama_token](repeating: 0, count: Int(nPromptMax))
        let nTok = prompt.withCString { cstr -> Int32 in
            llama_tokenize(vocab, cstr, Int32(prompt.utf8.count), &tokens, nPromptMax, true, true)
        }
        guard nTok > 0 else { return "tokensOff · tokenize failed" }

        // Feed prompt
        for i in 0..<Int(nTok) {
            var batch = llama_batch_get_one(&tokens[i], 1)
            if llama_decode(ctx, batch) != 0 {
                return "tokensOff · decode prompt failed"
            }
        }

        var out = ""
        let nPredict = 64
        let nVocab = llama_vocab_n_tokens(vocab)
        for _ in 0..<nPredict {
            guard let logits = llama_get_logits_ith(ctx, -1) else { break }
            var best: llama_token = 0
            var bestVal = logits[0]
            var t: Int32 = 1
            while t < nVocab {
                let v = logits[Int(t)]
                if v > bestVal { bestVal = v; best = t }
                t += 1
            }
            if best == llama_vocab_eos(vocab) { break }

            var buf = [CChar](repeating: 0, count: 128)
            let n = llama_token_to_piece(vocab, best, &buf, Int32(buf.count), 0, false)
            if n > 0 {
                buf[min(Int(n), buf.count - 1)] = 0
                out += String(cString: buf)
            }
            var tok = best
            var batch = llama_batch_get_one(&tok, 1)
            if llama_decode(ctx, batch) != 0 { break }
        }

        let trimmed = out.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "I am here. (Metal heart seated.)" : trimmed
    }

    deinit {
        if let ctx = ctxPtr { llama_free(ctx) }
        if let model = modelPtr { llama_model_free(model) }
        if loaded { llama_backend_free() }
    }
    #endif
}
