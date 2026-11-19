// ThundR.swift — ThundR CRYPTOBOT identity for the RENJIN AI CRYPTOBOT ENJIN
// Pure RZL, from scratch. Foundation only — drop into any Xcode target
// alongside Tokenizer.swift. Data matches thundr-botcard/ThundR-botcard.json v1.1.

import Foundation

public struct ThundRAppearance: Codable, Equatable {
    public let color: String
    public let face: String
    public let horns: String
    public let tail: String
    public let wings: String
}

public struct ThundRBotcard: Codable, Equatable {
    public let name: String
    public let creator: String
    public let kind: String
    public let role: String
    public let engine: String
    public let version: String
    public let status: String
    public let appearance: ThundRAppearance
    public let description: String

    public static let live = ThundRBotcard(
        name: "ThundR",
        creator: "Chase Rizal",
        kind: "animated CRYPTOBOT",
        role: "Muse assistant avatar and PROJECT R / RENJIN cryptobot",
        engine: "RENJIN 0.1, pure RZL, offline-first",
        version: "1.1",
        status: "live",
        appearance: ThundRAppearance(
            color: "purple",
            face: "angry grin, large eyes, prominent fangs",
            horns: "red, curved",
            tail: "yellow lightning bolt",
            wings: "black bat wings"
        ),
        description: "ThundR is Chase Rizal's animated cryptobot, created for TerraformR. A round purple cartoon imp with red curved horns, black bat wings, a yellow lightning bolt tail, and an angry grinning face with large eyes and prominent fangs."
    )

    /// One-line status for the R:> Shell / RENJIN status output.
    public func statusLine() -> String {
        "\(name) \(version) — \(status) — \(engine)"
    }

    /// Tokenize the botcard name + a command with the pure RZL tokenizer.
    public func tokenizedStatus(_ tokenizer: RZLTokenizer = RZLTokenizer()) -> [Int] {
        tokenizer.encode("\(name) /rseed status")
    }
}
