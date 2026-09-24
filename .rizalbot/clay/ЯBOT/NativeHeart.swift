import Foundation
import Darwin

/// Mac clay seat: bundled `llama-completion` + `heart.gguf` via Bundle.main.
/// Offline Heart — Process spawn (sandbox must be off). Never invent genotypes.
enum NativeHeart {
    private static let baseSystemPrompt =
        "You are ЯBOT, Decider offline companion. Answer-first like Chief of Staff in one short plain reply. Offline NonNuclear. Never invent genotypes. Do not repeat the user. Obey Standing law below over guesses."

    private static var systemPrompt: String {
        baseSystemPrompt + "\n\n" + TeachStore.heartContextBlock()
    }

    private static var resourceRoot: URL? { Bundle.main.resourceURL }

    private static var engineURL: URL? {
        if let u = Bundle.main.url(forResource: "llama-completion", withExtension: nil, subdirectory: "engine") { return u }
        if let u = Bundle.main.url(forResource: "llama-completion", withExtension: nil) { return u }
        if let root = resourceRoot {
            for rel in ["engine/llama-completion", "llama-completion"] {
                let u = root.appendingPathComponent(rel)
                if FileManager.default.fileExists(atPath: u.path) { return u }
            }
        }
        return nil
    }

    private static var heartURL: URL? {
        if let u = Bundle.main.url(forResource: "heart", withExtension: "gguf", subdirectory: "engine") { return u }
        if let u = Bundle.main.url(forResource: "heart", withExtension: "gguf") { return u }
        if let root = resourceRoot {
            for rel in ["engine/heart.gguf", "heart.gguf"] {
                let u = root.appendingPathComponent(rel)
                if FileManager.default.fileExists(atPath: u.path) { return u }
            }
        }
        return nil
    }

    static var seated: Bool {
        #if os(macOS)
        guard let engine = engineURL, let heart = heartURL else { return false }
        let fm = FileManager.default
        guard fm.fileExists(atPath: engine.path), fm.fileExists(atPath: heart.path) else { return false }
        guard let attrs = try? fm.attributesOfItem(atPath: heart.path),
              let size = attrs[.size] as? NSNumber else { return false }
        return size.int64Value > 1024
        #else
        // iOS: weights + llama.xcframework (canImport). Mac CLI is not an iOS engine.
        guard let heart = heartURL else { return false }
        guard let attrs = try? FileManager.default.attributesOfItem(atPath: heart.path),
              let size = attrs[.size] as? NSNumber, size.int64Value > 1024 else { return false }
        #if canImport(llama)
        return true
        #else
        return false
        #endif
        #endif
    }

    /// Latch so a wedged spawn can be detected + cleared via `essence clear clog heart-spawn-stall`.
    private static let busyKey = "ya.heart.generateBusy"
    static var generateBusy: Bool {
        get { UserDefaults.standard.bool(forKey: busyKey) }
        set { UserDefaults.standard.set(newValue, forKey: busyKey) }
    }

    static func resetGenerateLatch(reason: String = "manual") {
        generateBusy = false
        #if !os(macOS)
        NotificationCenter.default.post(name: Notification.Name("ЯBOT.HeartResetLatch"), object: reason)
        #endif
    }

        static var heartBytes: Int64 {
        guard let heart = heartURL,
              let attrs = try? FileManager.default.attributesOfItem(atPath: heart.path),
              let size = attrs[.size] as? NSNumber else { return 0 }
        return size.int64Value
    }

    static func status() -> [String: Any] {
        [
            "engine": "llama-completion",
            "mode": "conversation-single-turn",
            "seated": seated,
            "heartBytes": heartBytes,
            "metal": seated,
            "ngl": 99,
            "enginePath": engineURL?.path ?? "",
            "heartPath": heartURL?.path ?? ""
        ]
    }

    static func statusLine() -> String {
        let bytes = heartBytes
        let seatedFlag = seated ? "yes" : "no"
        let sandboxed = getenv("APP_SANDBOX_CONTAINER_ID") != nil
        let sandFlag = sandboxed ? "on" : "off"
        #if os(macOS)
        var line = "heart engine=llama-completion seated=\(seatedFlag) heartBytes=\(bytes) sandbox=\(sandFlag) busy=\(generateBusy ? "yes" : "no") mode=cnv-st metal=-ngl 99"
        #else
        #if canImport(llama)
        let eng = "llama.xcframework"
        #else
        let eng = "none"
        #endif
        var line = "heart engine=\(eng) seated=\(seatedFlag) heartBytes=\(bytes) sandbox=\(sandFlag) mode=in-process metal=ios"
        #endif
        if sandboxed {
            line += " · HOW: turn App Sandbox OFF so Process can spawn llama-completion"
        } else if !seated {
            line += " · HOW: bundle llama-completion + heart.gguf (iOS still needs llama.xcframework)"
        }
        return line
    }

    /// Conversation single-turn with chat template. Timeout ~120s.
    static func generate(prompt: String) -> String {
        let user = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if user.isEmpty { return "I am here." }
        #if !os(macOS)
        return generateIOS(user: user)
        #else
        if generateBusy {
            return "Function 0 · Heart spawn stall (generateBusy). HOW: `essence clear clog heart-spawn-stall` then retry."
        }
        guard seated, let engine = engineURL, let heart = heartURL else {
            return "Function 0 · Heart not seated / blocked. HOW: App Sandbox OFF; bundle llama-completion + heart.gguf; on iOS need llama.xcframework. Say MISSING until true."
        }

        generateBusy = true
        defer { generateBusy = false }

        try? FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: engine.path)

        let proc = Process()
        proc.executableURL = engine
        // Chat mode (not raw -no-cnv): stops echo/ramble from coder hearts.
        proc.arguments = [
            "-m", heart.path,
            "-sys", systemPrompt,
            "-p", user,
            "-n", "96",
            "-c", "2048",
            "-ngl", "99",
            "-cnv",
            "-st",
            "--jinja",
            "--chat-template", "chatml",
            "--temp", "0.5",
            "--top-p", "0.9",
            "--repeat-penalty", "1.15"
        ]
        let outPipe = Pipe()
        let errPipe = Pipe()
        proc.standardOutput = outPipe
        proc.standardError = errPipe

        do {
            try proc.run()
        } catch {
            return "Function 0 · Heart spawn failed: \(error.localizedDescription)."
        }

        let deadline = Date().addingTimeInterval(120)
        while proc.isRunning && Date() < deadline {
            Thread.sleep(forTimeInterval: 0.05)
        }
        if proc.isRunning {
            proc.terminate()
            Thread.sleep(forTimeInterval: 0.4)
            if proc.isRunning { Darwin.kill(proc.processIdentifier, SIGKILL) }
            return "Function 0 · Heart timed out (~120s). Try a shorter ask."
        }

        let rawOut = String(data: outPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let rawErr = String(data: errPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let cleaned = cleanModelReply(rawOut, userPrompt: user)
        if !cleaned.isEmpty { return cleaned }

        if proc.terminationStatus != 0 {
            let errBit = cleanModelReply(rawErr, userPrompt: user)
            if !errBit.isEmpty {
                return "Function 0 · Heart exit \(proc.terminationStatus): \(errBit)"
            }
            return "Function 0 · Heart exit \(proc.terminationStatus). No stdout."
        }
        return "Function 0 · Heart returned empty. Engine ran; no usable reply."
        #endif
    }

    /// Keep only the assistant turn; strip llama chatter and role labels.
    private static func cleanModelReply(_ text: String, userPrompt: String) -> String {
        let noisePrefixes = [
            "llama_", "ggml_", "load_", "print_info", "meta:", "system_info",
            "sampler", "generate:", "slot ", "common_", "srv ", "warming up",
            "llama_model", "llama_context", "llama_new", "gguf_", "init:",
            "build:", "Available devices", "load time", "prompt eval",
            "eval time", "total time", "tokens per second", "Exiting",
            "main:", "llm_"
        ]
        let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
        // Prefer content after the last standalone "assistant" role line.
        var start = 0
        for (i, line) in lines.enumerated() {
            if line.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() == "assistant" {
                start = i + 1
            }
        }
        var kept: [String] = []
        for line in lines[start...] {
            let t = line.trimmingCharacters(in: .whitespaces)
            if t.isEmpty {
                if !kept.isEmpty { kept.append("") }
                continue
            }
            let lower = t.lowercased()
            if noisePrefixes.contains(where: { lower.hasPrefix($0.lowercased()) }) { continue }
            if t.hasPrefix("|") && t.contains("GPU") { continue }
            if ["system", "user", "assistant"].contains(lower) { continue }
            if t.hasPrefix("<|") { continue }
            if lower.hasPrefix("[end of text]") { continue }
            kept.append(t)
        }
        var body = kept.joined(separator: " ").trimmingCharacters(in: .whitespacesAndNewlines)
        // Collapse whitespace
        while body.contains("  ") { body = body.replacingOccurrences(of: "  ", with: " ") }
        let up = userPrompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if !up.isEmpty, body.lowercased().hasPrefix(up.lowercased()) {
            body = String(body.dropFirst(up.count)).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if let r = body.range(of: "[end of text]", options: [.caseInsensitive]) {
            body = String(body[..<r.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return body
    }

    // MARK: - iOS in-process Heart (llama.xcframework)
    #if !os(macOS)
    private static func generateIOS(user: String) -> String {
        guard let heart = heartURL else {
            return "MISSING — Heart weights not seated on this iPhone."
        }
        #if canImport(llama)
        let path = heart.path
        let sys = systemPrompt
        let prompt = sys + "\nUser: " + user + "\nAssistant:"
        let lock = NSLock()
        var result = ""
        let sem = DispatchSemaphore(value: 0)
        Task.detached(priority: .userInitiated) {
            do {
                let ctx = try await LlamaContext.create_context(path: path)
                await ctx.completion_init(text: prompt)
                var out = ""
                for _ in 0..<96 {
                    let piece = await ctx.completion_loop()
                    out += piece
                    if await ctx.is_done { break }
                }
                let cleaned = out.trimmingCharacters(in: .whitespacesAndNewlines)
                lock.lock()
                result = cleaned.isEmpty ? "MISSING — Heart returned empty." : cleaned
                lock.unlock()
            } catch {
                lock.lock()
                result = "MISSING — Heart invoke failed: \(error.localizedDescription)"
                lock.unlock()
            }
            sem.signal()
        }
        if sem.wait(timeout: .now() + 180) == .timedOut {
            return "MISSING — Heart timed out (~180s)."
        }
        lock.lock(); defer { lock.unlock() }
        return result.isEmpty ? "MISSING — Heart produced no text." : result
        #else
        return "MISSING — llama.xcframework not linked in this build. Clay mouth + TeachStore still live."
        #endif
    }
    #endif

}
