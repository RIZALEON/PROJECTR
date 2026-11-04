import Foundation

/// Local short-order mouth: Decider tongue in, CoS answer-first out.
/// Seats chat-law components without claiming cloud or genotype powers.
enum CompanionRouter {
    /// Mind loop (teachings): comprehension → reasoning → memory → response → contemplation → action
    static let mindLoop = "comprehension → reasoning → memory → response → contemplation → action"

    static let dualTongue = """
    Dual tongue (forever):
    • Decider: short orders (ping, think, commands, revert, reform, respawn, evolve, mint, yacode…)
    • write-code: teach seat to write for others + itself (Decider-gated)
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
            9 revert / reform — walk back last bad mod
            10 RESPAWN — restore most recent official app template (APP-TEMPLATE-0.1 → prior officials)
            11 evolve — Decider-gated; not self-granted
            12 snapshot — revision checkpoint note
            13 mode — online/offline status
            13b online / offline — flip green nerve
            13c search <query> — web search when ONLINE only
            13d research <topic> — multi-source digest when ONLINE
            13e read <url> — fetch public page when ONLINE
            14 token / coin / mint — Я TOKEN · Я COIN (RFID-class)
            15 yacode / languages — three-language foundation
            16 cos / voice / triangle — CoS→ЯBOT communication law (like CoS, better)
            17 heart / heart status — offline Heart (llama-completion + heart.gguf)
            18 ghost / ghost status — Я GHOST CHAIN jsonl tape
            19 teach / lock / remember — Decider teachings into Heart context
            20 teachings — list seated teachings status
            Online is optional bonus. Network sandbox stays Decider-controlled.
            """
        }

        if lower == "mind" || lower == "mind loop" {
            return "Mind loop seated: \(mindLoop)."
        }

        if lower == "tongue" || lower == "dual tongue" {
            return dualTongue
        }

        if lower == "teachings forever" {
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
            return "\(lower) noted. For a full official restore use RESPAWN (most recent APP-TEMPLATE). Snapshot first before a risky mod."
        }

        if lower == "respawn" || lower == "command: respawn" || lower == "command respawn" {
            let result = TemplateRespawn.runMostRecentOfficial()
            return result
        }

        if lower == "snapshot" {
            return "Snapshot intent logged. Official templates live under official-templates/ (APP-TEMPLATE-0.1 is current)."
        }


        if lower == "token" || lower == "coin" || lower == "ya token" || lower == "ya coin" || lower == "я token" || lower == "я coin" {
            return YaToken.status()
        }

        if lower == "mint" || lower == "mint token" || lower == "mint coin" || lower == "mint ya" {
            return YaToken.ensureGenesisMinted()
        }


        if lower == "cos" || lower == "voice" || lower == "triangle" || lower == "communicate" || lower == "like cos" {
            return YaCosVoice.doctrine()
        }

        if lower == "yacode" || lower == "ya code" || lower == "languages" || lower == "three languages" || lower == "я code" {
            return YaCode.reply()
        }


        if lower == "heart" || lower == "heart status" {
            return NativeHeart.statusLine()
        }

        if lower == "ghost" || lower == "ghost status" {
            return GhostChainLedger.status()
        }

        if lower.hasPrefix("evolve") {
            return "Evolve is Decider-gated. I cannot grant myself permission. Propose clearly; you approve. NonNuclear stands."
        }

        if lower == "online" || lower == "go online" {
            ModeStore.shared.goOnline()
            return ModeStore.shared.label + "\nGreen nerve on. Try: search Utah capital"
        }
        if lower == "offline" || lower == "go offline" {
            ModeStore.shared.goOffline()
            return ModeStore.shared.label
        }
        if lower == "mode" {
            return ModeStore.shared.label
        }
        if lower.hasPrefix("search ") || lower.hasPrefix("search:") || lower.hasPrefix("look up ") || lower.hasPrefix("web search ") {
            return OnlineSearch.search(text)
        }
        if lower.hasPrefix("research ") || lower.hasPrefix("research:") || lower.hasPrefix("investigate ") || lower.hasPrefix("dig into ") {
            return OnlineSearch.research(text)
        }
        if lower.hasPrefix("read ") || lower.hasPrefix("read:") || lower.hasPrefix("fetch ") {
            return OnlineSearch.read(text)
        }
        // Bare http(s) URL when online → page read
        if ModeStore.shared.isOnline, lower.hasPrefix("http://") || lower.hasPrefix("https://") {
            return OnlineSearch.read(text)
        }

        if lower == "who are you" || lower == "who are you?" {
            return "ЯBOT clay seat — offline companion mouth for PROJECT Я. Answer-first like CoS. Decider owns fate."
        }


        if lower == "teachings" || lower == "teach status" {
            return TeachStore.status() + "\n" + TeachStore.heartContextBlock()
        }

        // Decider teach / lock / remember → persist then confirm
        if lower.hasPrefix("teach:") || lower.hasPrefix("teach ") || lower.hasPrefix("lock:") || lower.hasPrefix("lock ") || lower.hasPrefix("remember this:") || lower.hasPrefix("remember:") {
            var body = text
            for prefix in ["Teach:", "teach:", "Teach ", "teach ", "LOCK:", "Lock:", "lock:", "LOCK ", "lock ", "Remember this:", "remember this:", "Remember:", "remember:"] {
                if body.lowercased().hasPrefix(prefix.lowercased()) {
                    body = String(body.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            let kind = lower.hasPrefix("lock") ? "lock" : (lower.hasPrefix("remember") ? "remember" : "teach")
            let tid = TeachStore.remember(body, kind: kind)
            return "Seated (\(kind)) trace=\(tid). Heart will carry this in Standing law.\n\(body)"
        }

        // Kernel law short-circuit before Heart guesses
        if let law = TeachStore.lawAnswer(for: text) {
            return law
        }

        // Default: Heart when seated; else CoS voice (triangle: Decider · CoS · ЯBOT)
        if NativeHeart.seated {
            return NativeHeart.generate(prompt: text)
        }
        return YaCosVoice.shape(userText: text, isOnline: isOnline)
    }
}
