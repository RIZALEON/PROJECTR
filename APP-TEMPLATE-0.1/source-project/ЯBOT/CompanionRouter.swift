import Foundation

/// Local short-order mouth: Decider tongue in, CoS answer-first out.
/// Seats chat-law components without claiming cloud or genotype powers.
enum CompanionRouter {
    /// Mind loop (teachings): comprehension → reasoning → memory → response → contemplation → action
    static let mindLoop = "comprehension → reasoning → memory → response → contemplation → action"

    static let dualTongue = """
    Dual tongue (forever):
    • Decider: short orders (ping, think, commands, revert, reform, evolve…)
    • CoS: answer-first plain talk, then only what you need next
    """

    static let teachingsForever = """
    Teachings forever + code caution:
    Every taught function is retained. Only change what was asked.
    Never strip unrelated chrome (especially machine-mind). Prefer hide over delete.
    NonNuclear. Offline seat wins. Decider owns evolve / model fate.
    """

    static func reply(to raw: String, isOnline: Bool) -> String {
        let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return "Listening." }
        let lower = text.lowercased()

        if lower == "ping" || lower == "utah ping" {
            return "here"
        }

        if lower == "commands" || lower == "help" || lower == "functions" {
            return """
            Clay seat commands (offline-first):
            1 ping → here
            2 think — longer meditation stub
            3 commands / functions / help — this list
            4 mind — mind loop
            5 tongue — dual tongue law
            6 teachings — forever + code caution
            7 bolte / being — first RZL Being
            8 rzl — .RZL envelope + Digital botbat note
            9 revert / reform — walk back last bad mod (snapshot engine next)
            10 evolve — Decider-gated; not self-granted
            11 snapshot — revision checkpoint note
            12 mode — online/offline status
            Online is optional bonus. Network sandbox stays Decider-controlled.
            """
        }

        if lower == "mind" || lower == "mind loop" {
            return "Mind loop seated: \(mindLoop)."
        }

        if lower == "tongue" || lower == "dual tongue" {
            return dualTongue
        }

        if lower == "teachings" || lower == "teachings forever" {
            return teachingsForever
        }

        if lower == "think" {
            return """
            Thinking (clay seat)…
            Comprehension: short order received.
            Reasoning: stay offline-first; answer plain.
            Memory: teachings forever; NonNuclear.
            Response: ready.
            Contemplation: next gain is lanes + revision snapshots on this Mac seat.
            Action: waiting your next order.
            """
        }

        if lower == "bolte" || lower == "being" || lower == "rzl being" {
            return "BOLTE is the first RZL Being face — freeform claymation underworld cloud + lightning. Can evolve forms/emotions when Decider grants. Still NonNuclear."
        }

        if lower == "rzl" || lower == ".rzl" {
            return ".RZL is the offline evidence envelope and the Digital botbat being format. Never invent genotype calls. Decider-gated evolve."
        }

        if lower == "revert" || lower == "reform" {
            return "\(lower) noted. Clay foundation will hook revision snapshots next (rev folders / ya-revision). Say snapshot first before a risky mod."
        }

        if lower == "snapshot" {
            return "Snapshot intent logged. Wire Application Support revisions on next pass (rev-00N labels)."
        }

        if lower.hasPrefix("evolve") {
            return "Evolve is Decider-gated. I cannot grant myself permission. Propose clearly; you approve. NonNuclear stands."
        }

        if lower == "mode" || lower == "online" || lower == "offline" {
            return isOnline
                ? "Mode: ONLINE link allowed as bonus. Offline seat still premier."
                : "Mode: OFFLINE. Premier path. Local mouth only."
        }

        if lower == "who are you" || lower == "who are you?" {
            return "ЯBOT clay seat — offline companion mouth for PROJECT Я. Answer-first like CoS. Decider owns fate."
        }

        // Default CoS-style answer-first for free text
        let mode = isOnline ? "online-bonus" : "offline"
        return "Here. Clay seat live (\(mode)). Type commands for the lane list, or ping."
    }
}
