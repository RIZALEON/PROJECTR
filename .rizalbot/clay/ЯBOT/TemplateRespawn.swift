import Foundation

/// COMMAND: RESPAWN — restore the most recent official app template into the live seat.
/// Official packs live beside the Xcode project under `official-templates/`.
enum TemplateRespawn {
    static let registryRelative = "official-templates/index.json"

    /// Runs `ya-respawn.sh` from Documents/ЯBOT (or PROJECTRXCODE twin).
    static func runMostRecentOfficial() -> String {
        #if !os(macOS)
        return "RESPAWN is Mac clay only for now. On iPhone the official template seat still ships with the app; Mac run Documents/ЯBOT/ya-respawn.sh."
        #else
        let candidates: [URL] = [
            URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents/ЯBOT/ya-respawn.sh"),
            URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents/PROJECTRXCODE/ya-respawn.sh"),
            URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents/ЯBOT/official-templates/APP-TEMPLATE-0.1/ya-respawn.sh")
        ]
        guard let script = candidates.first(where: { FileManager.default.isExecutableFile(atPath: $0.path) || FileManager.default.fileExists(atPath: $0.path) }) else {
            return "RESPAWN armed. Official pack APP-TEMPLATE-0.1 not seated yet — CoS will finish the waypoint. After seat: Documents/ЯBOT/ya-respawn.sh restores most recent official template."
        }

        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/bash")
        process.arguments = [script.path]
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe
        do {
            try process.run()
            process.waitUntilExit()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let out = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            if process.terminationStatus == 0 {
                let tail = out.split(separator: "\n").suffix(6).joined(separator: "\n")
                return "RESPAWN complete → most recent official template restored.\n\(tail)\nRebuild with ⌘R to load."
            }
            return "RESPAWN tried \(script.lastPathComponent) but exited \(process.terminationStatus).\n\(out)"
        } catch {
            return "RESPAWN could not launch script (\(error.localizedDescription)). Run Documents/ЯBOT/ya-respawn.sh from Terminal, then ⌘R."
        }
        #endif
    }
}
