import Foundation

/// Decider-gated self-repair: clay authors Swift (or shell recipes), never silent-applies.
enum SelfFix {
    private static var homeURL: URL {
        #if os(macOS)
        FileManager.default.homeDirectoryForCurrentUser
        #else
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        #endif
    }

    static var labRoot: URL {
        homeURL
            .appendingPathComponent("Documents/ЯBOT/courses/ROBOT-EVOLUTION-680/CODE-LAB/SELF-FIX", isDirectory: true)
    }

    static var localbuildRoot: URL {
        homeURL
            .appendingPathComponent("Library/Developer/ЯBOT-localbuild/ЯBOT", isDirectory: true)
    }

    static var documentsSourceRoot: URL {
        homeURL
            .appendingPathComponent("Documents/ЯBOT/ЯBOT", isDirectory: true)
    }

    @discardableResult
    static func ensureLab() -> URL {
        let fm = FileManager.default
        try? fm.createDirectory(at: labRoot, withIntermediateDirectories: true)
        return labRoot
    }

    /// Author a proposed fix into CODE-LAB (does not mutate app sources).
    static func propose(brief: String, source: String, name: String? = nil) -> String {
        ensureLab()
        let stamp = ISO8601DateFormatter().string(from: Date()).replacingOccurrences(of: ":", with: "-")
        let base = (name?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false)
            ? name!.trimmingCharacters(in: .whitespacesAndNewlines)
            : "Fix-\(stamp)"
        let safe = base.replacingOccurrences(of: "/", with: "-")
        let swiftURL = labRoot.appendingPathComponent("\(safe).swift")
        let metaURL = labRoot.appendingPathComponent("\(safe).md")
        let body = source.trimmingCharacters(in: .whitespacesAndNewlines)
        let meta = """
        # SELF-FIX proposal — \(safe)
        brief: \(brief)
        law: NonNuclear — Decider must `fix apply \(safe)` before sources change.
        written: \(Date())
        """
        do {
            try body.write(to: swiftURL, atomically: true, encoding: .utf8)
            try meta.write(to: metaURL, atomically: true, encoding: .utf8)
        } catch {
            return "SELF-FIX write failed: \(error.localizedDescription)"
        }
        return """
        SELF-FIX proposed · \(safe)
        brief: \(brief)
        file: \(swiftURL.path)
        next: review the Swift, then say: fix apply \(safe)
        (or rebuild yourself after copying). I do not grant myself evolve.
        """
    }

    /// Heart or starter authors a Swift helper for the brief, then proposes it.
    static func authorAndPropose(brief: String) -> String {
        let b = brief.trimmingCharacters(in: .whitespacesAndNewlines)
        let prompt = """
        You are ЯBOT SelfFix (Swift, offline, NonNuclear).
        Acknowledge CODE OS: CompanionRouter, NativeHeart, Mind, TeachStore, YaCode, SelfFix.
        Task: \(b.isEmpty ? "Write a tiny Swift helper that demos digit→number parsing for clay." : b)
        Rules: one complete Swift snippet only; no network; enum/static clay style; under 60 lines; no invented genotypes; do not mutate CompanionRouter unless brief names it.
        """
        let raw: String
        if NativeHeart.seated {
            raw = NativeHeart.generate(prompt: prompt)
        } else {
            raw = starter(for: b)
        }
        let swift = extractSwift(raw) ?? raw
        let name = slug(from: b.isEmpty ? "DigitNumberLab" : b)
        return propose(brief: b.isEmpty ? "digit→number literacy lab" : b, source: swift, name: name)
            + "\n\n--- draft ---\n```swift\n\(swift)\n```"
    }

    /// Copy a proposed .swift into localbuild + Documents source trees (Decider-gated).
    static func apply(name: String) -> String {
        ensureLab()
        let safe = name.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: ".swift", with: "")
            .replacingOccurrences(of: "/", with: "-")
        guard !safe.isEmpty else { return "HOW: fix apply <name>" }
        let src = labRoot.appendingPathComponent("\(safe).swift")
        guard FileManager.default.fileExists(atPath: src.path) else {
            return "No proposal named \(safe). List with: self fix list"
        }
        let fm = FileManager.default
        let dests = [
            localbuildRoot.appendingPathComponent("\(safe).swift"),
            documentsSourceRoot.appendingPathComponent("\(safe).swift"),
        ]
        var lines = ["SELF-FIX apply · \(safe)"]
        for d in dests {
            do {
                try fm.createDirectory(at: d.deletingLastPathComponent(), withIntermediateDirectories: true)
                if fm.fileExists(atPath: d.path) { try fm.removeItem(at: d) }
                try fm.copyItem(at: src, to: d)
                lines.append("copied → \(d.path)")
            } catch {
                lines.append("fail \(d.lastPathComponent): \(error.localizedDescription)")
            }
        }
        lines.append("OS note: new file is seated in source trees. Xcode synchronized root picks it up on next build.")
        lines.append("I still cannot rebuild myself. You (or your builder) run the rebuild. NonNuclear stands.")
        _ = TeachStore.remember(
            "SelfFix applied \(safe) — Decider ordered fix apply. Clay wrote; Decider applies.",
            kind: "lock"
        )
        return lines.joined(separator: "\n")
    }

    static func list() -> String {
        ensureLab()
        let fm = FileManager.default
        let files = (try? fm.contentsOfDirectory(atPath: labRoot.path)) ?? []
        let swifts = files.filter { $0.hasSuffix(".swift") }.sorted()
        if swifts.isEmpty { return "SELF-FIX lab empty. Try: self fix: parse digits to Int" }
        return "SELF-FIX lab:\n" + swifts.map { "· \($0.replacingOccurrences(of: ".swift", with: ""))" }.joined(separator: "\n")
    }

    /// Optional Decider-gated shell recipe (write only — run only if Decider says fix shell <name>).
    static func proposeShell(brief: String, script: String, name: String) -> String {
        ensureLab()
        let safe = name.replacingOccurrences(of: "/", with: "-")
        let url = labRoot.appendingPathComponent("\(safe).sh")
        let body = "#!/bin/zsh\n# NonNuclear SelfFix shell — Decider runs with: fix shell \(safe)\nset -euo pipefail\n\(script)\n"
        do {
            try body.write(to: url, atomically: true, encoding: .utf8)
            try FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: url.path)
        } catch {
            return "shell propose failed: \(error.localizedDescription)"
        }
        return """
        SELF-FIX shell proposed · \(safe)
        file: \(url.path)
        brief: \(brief)
        next: review, then: fix shell \(safe)
        """
    }

    /// Run a proposed shell script under lab only (Decider-gated). No arbitrary paths.
    #if os(macOS)
    static func runShell(name: String) -> String {
        ensureLab()
        let safe = name.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: ".sh", with: "")
            .replacingOccurrences(of: "/", with: "-")
        let url = labRoot.appendingPathComponent("\(safe).sh")
        guard FileManager.default.fileExists(atPath: url.path) else {
            return "No shell named \(safe). List lab, or propose first."
        }
        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: "/bin/zsh")
        proc.arguments = [url.path]
        proc.currentDirectoryURL = labRoot
        let out = Pipe()
        let err = Pipe()
        proc.standardOutput = out
        proc.standardError = err
        do {
            try proc.run()
            proc.waitUntilExit()
        } catch {
            return "shell spawn failed: \(error.localizedDescription)"
        }
        let o = String(data: out.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let e = String(data: err.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        return """
        SELF-FIX shell · \(safe) · exit \(proc.terminationStatus)
        \(o)\(e.isEmpty ? "" : "\nERR:\n\(e)")
        """
    }
    #else
    static func runShell(name: String) -> String { "SelfFix shell is Mac-only." }
    #endif

    // MARK: - helpers

    private static func extractSwift(_ raw: String) -> String? {
        if let start = raw.range(of: "```swift"),
           let end = raw.range(of: "```", range: start.upperBound..<raw.endIndex) {
            return String(raw[start.upperBound..<end.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if raw.contains("import Foundation") || raw.contains("enum ") || raw.contains("struct ") {
            return raw.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return nil
    }

    private static func slug(from brief: String) -> String {
        let cleaned = brief.lowercased()
            .map { c -> Character in
                if c.isLetter || c.isNumber { return c }
                return "-"
            }
        var s = String(cleaned)
        while s.contains("--") { s = s.replacingOccurrences(of: "--", with: "-") }
        s = s.trimmingCharacters(in: CharacterSet(charactersIn: "-"))
        if s.isEmpty { return "Fix-\(Int(Date().timeIntervalSince1970))" }
        return String(s.prefix(48))
    }

    private static func starter(for brief: String) -> String {
        let tip = brief.isEmpty ? "digit literacy" : brief
        return """
        import Foundation
        /// SELF-FIX starter for: \(tip)
        /// Law: Decider applies; clay only proposes.
        enum DigitNumberLab {
            /// Glyph digits → number value (literacy demo).
            static func parseDigits(_ glyphs: String) -> Int? {
                Int(glyphs.filter({ $0.isNumber }))
            }
            static func describe(_ glyphs: String) -> String {
                let n = parseDigits(glyphs)
                return "glyphs=\\(glyphs) digits-only=\\(glyphs.filter({ $0.isNumber })) number=\\(n.map(String.init) ?? "nil")"
            }
        }
        """
    }
}
