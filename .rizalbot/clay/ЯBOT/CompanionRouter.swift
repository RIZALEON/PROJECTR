import Foundation

/// Local short-order mouth: Decider tongue in, CoS answer-first out.
/// Seats chat-law components without claiming cloud or genotype powers.
enum CompanionRouter {
    struct Turn {
        let reply: String
        /// Lane for both the Decider prompt and clay reply.
        let lane: ChatLane
    }

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
        handle(to: raw, isOnline: isOnline).reply
    }

    /// Classified turn: work lane (CMD/FN/ACT) or conversation (TALK).
    static func handle(to raw: String, isOnline: Bool) -> Turn {
        let lane = classify(raw)
        let reply = replyText(to: raw, isOnline: isOnline)
        return Turn(reply: reply, lane: lane)
    }

    /// Decide lane from Decider tongue BEFORE clay answers.
    
    

    private static func placeSet(_ text: String) -> String {
        var rest = text
        if let r = rest.range(of: "place set ", options: [.caseInsensitive, .anchored]) {
            rest = String(rest[r.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        // place set 40.76,-111.89 Salt Lake City
        let parts = rest.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true)
        guard let coordPart = parts.first else {
            return "HOW: place set <lat>,<lon> [label]"
        }
        let nums = coordPart.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        guard nums.count == 2, let lat = Double(nums[0]), let lon = Double(nums[1]) else {
            return "HOW: place set <lat>,<lon> [label]  e.g. place set 40.7608,-111.8910 Salt Lake City"
        }
        let label = parts.count > 1 ? String(parts[1]) : nil
        PlaceSense.shared.refresh()
        return PlaceSense.shared.setManual(lat: lat, lon: lon, label: label)
    }

    /// Map polite English onto seated verbs so ACT/FN/CMD actually fire.
    private static func canonicalizeSoftEnglish(_ raw: String) -> String {
        let lower = raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let map: [(String, String)] = [
            ("hey are you there", "ping"), ("are you there", "ping"), ("you there", "ping"),
            ("you up", "ping"), ("ping me", "ping"),
            ("what's the mode", "mode"), ("whats the mode", "mode"), ("what mode", "mode"),
            ("status please", "mode"), ("heart status please", "heart"),
            ("can you show me the commands", "commands"), ("show me the commands", "commands"),
            ("show commands please", "commands"), ("what can you do", "commands"),
            ("list commands", "commands"), ("help me with commands", "commands"),
            ("please clear the clog", "essence clear clog heart-spawn-stall"),
            ("clear the clog", "essence clear clog heart-spawn-stall"),
            ("clear if stuck", "essence clear clog heart-spawn-stall"),
            ("unclog please", "essence clear clog heart-spawn-stall"),
            ("please go offline", "offline"), ("please go online", "online"),
            ("switch to offline", "offline"), ("switch to online", "online"),
        ]
        for (pat, canon) in map {
            if lower == pat { return canon }
            if lower.hasPrefix(pat) {
                let rest = lower.dropFirst(pat.count)
                if rest.isEmpty || rest.first!.isWhitespace || rest.first == ":" || rest.first == "," || rest.first == "." {
                    return canon
                }
            }
        }
        return raw
    }

    /// Polite / full-sentence English → work lane (closes TALK false-negatives).
    private static func softEnglishLane(_ lower: String) -> ChatLane? {
        let pairs: [(String, ChatLane)] = [
            ("hey are you there", .command), ("are you there", .command), ("you there", .command),
            ("you up", .command), ("ping me", .command),
            ("what's the mode", .command), ("whats the mode", .command), ("what mode", .command),
            ("status please", .command), ("heart status please", .command),
            ("can you show me the commands", .function), ("show me the commands", .function),
            ("show commands please", .function), ("what can you do", .function),
            ("list commands", .function), ("help me with commands", .function),
            ("please clear the clog", .action), ("clear the clog", .action),
            ("clear if stuck", .action), ("unclog please", .action),
            ("please go offline", .action), ("please go online", .action),
            ("switch to offline", .action), ("switch to online", .action),
        ]
        for (pat, lane) in pairs {
            if lower == pat { return lane }
            if lower.hasPrefix(pat) {
                let rest = lower.dropFirst(pat.count)
                if rest.isEmpty || rest.first!.isWhitespace || rest.first == ":" || rest.first == "," || rest.first == "." {
                    return lane
                }
            }
        }
        return nil
    }

static func classify(_ raw: String) -> ChatLane {
        let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return .conversation }
        let lower = text.lowercased()
        if let soft = softEnglishLane(lower) { return soft }

        // ACTION — side-effecting work (clear, send, mint, flip, reseat, feed…)
        let actionHints = [
            "essence clear", "clear clog", "clog clear", "plumbing clear",
            "mind reseat", "transcript reseat", "reseat mind",
            "coin send", "coin path", "coin bt clear", "coin bt reset",
            "coin lan clear", "coin usb drain", "coin qr eat", "coin nfc eat", "coin share eat",
            "ghost establish", "ghost claim",
            "essence mint", "essence transfer", "essence settle",
            "go online", "go offline", "feed ", "offload",
            "place set ", "place clear",
        ]
        for h in actionHints {
            if lower.hasPrefix(h) { return .action }
        }
        if lower == "online" || lower == "offline" { return .action }
        if lower.hasPrefix("mint ") || lower == "mint" { return .action }

        // FUNCTION — teach/lock/remember, help lists, code/language seats
        let functionHints = [
            "teach:", "teach ", "lock:", "lock ", "remember this:", "remember:",
            "commands", "functions", "help", "teachings", "teachings forever",
            "yacode", "languages", "write-code", "write code", "self fix", "fix apply", "digits", "code os",
            "tongue", "dual tongue", "cos", "voice", "triangle",
        ]
        for h in functionHints {
            if lower == h || lower.hasPrefix(h) { return .function }
        }

        // COMMAND — short status / query verbs
        let commandExact = [
            "ping", "utah ping", "think", "mind", "mind loop", "bolte", "being", "rzl being",
            "rzl", ".rzl", "mode", "heart", "heart status", "ghost", "ghost status",
            "essence", "token", "coin", "coin carriers", "coin mysteries", "coin dna",
            "transcript", "mind tape", "mind transcript", "tape", "snapshot",
        ]
        if commandExact.contains(lower) { return .command }
        let commandPrefixes = [
            "heart ", "ghost ", "essence ", "coin ", "token ", "search ", "search:", "nearby ", "near me ",
            "research ", "research:", "read ", "read:", "look up ", "web search ",
            "fetch ", "investigate ", "dig into ", "respawn", "revert", "reform",
            "evolve", "snapshot ",
        ]
        for h in commandPrefixes {
            if lower.hasPrefix(h) { return .command }
        }

        // Free talk / Heart / Cos
        return .conversation
    }

    private static func replyText(to raw: String, isOnline: Bool) -> String {
        let raw = canonicalizeSoftEnglish(raw)

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
            13c2 nearby / search chinese restaurant — closest + closest-best (time+place)
            13c3 place / place set <lat>,<lon> [label] — space seat
            13d research <topic> — multi-source digest when ONLINE
            13e read <url> — fetch public page when ONLINE
            14 token / coin / mint / unit mint / twin prepare solana / twin paste / twin status — Я TOKEN·COIN RFID UNIT + Solana twin pipe
            14b coin send / coin path begin|note|report|clear|status — path-scout mystery (detect→retain→report→resolve→clear)
            14c coin dna / coin dna touch <kind> <id> [role] — Machine DNA (seat|tower|repeater|hub|storage|relay|…)
            14d coin mysteries — open path mysteries report
            14e coin bt on|off|status|clear|reset — Bluetooth near-link; clear wipes connected line + rediscovers
            14f coin send <to> via bluetooth|lan|usb|qr|nfc|share — multi-carrier path hop + DNA
            14g coin carriers / coin lan on|off|clear / coin usb drain
            14h coin qr eat <json|path> · coin nfc eat · coin share eat
            15 yacode / languages — three-language foundation
            16 cos / voice / triangle — CoS→ЯBOT communication law (like CoS, better)
            17 heart / heart status — offline Heart (llama-completion + heart.gguf)
            18 ghost / ghost status / ghost establish / ghost claim — Я GHOST CHAIN jsonl tape
            18b essence / essence mint / essence transfer / essence settle / essence clear clog — ESSENCE TRACE + plumbing clear
            19 teach / lock / remember — Decider teachings into Heart context
            20 teachings — list seated teachings status
            21 transcript / mind tape — seated MIND-TRANSCRIPT.txt (prompts+replies+code notes)
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


        
        // Bluetooth near-link for coin hops

        // Multi-carrier spine (lan/usb/qr/nfc/share + status)
        if lower == "coin carriers" || lower == "coin carrier" || lower == "coin carrier status" {
            return CoinCarrierHub.status()
        }
        if lower == "coin lan" || lower == "coin lan status" {
            if Thread.isMainThread { return CoinLANCarrier.shared.statusLine }
            return DispatchQueue.main.sync { CoinLANCarrier.shared.statusLine }
        }
        if lower == "coin lan on" {
            if Thread.isMainThread { return CoinLANCarrier.shared.start() }
            return DispatchQueue.main.sync { CoinLANCarrier.shared.start() }
        }
        if lower == "coin lan off" {
            if Thread.isMainThread { return CoinLANCarrier.shared.stop() }
            return DispatchQueue.main.sync { CoinLANCarrier.shared.stop() }
        }
        if lower == "coin lan clear" {
            if Thread.isMainThread { return CoinLANCarrier.shared.clear() }
            return DispatchQueue.main.sync { CoinLANCarrier.shared.clear() }
        }
        if lower == "coin usb" || lower == "coin usb status" {
            return CoinUSBCarrier.statusLine()
        }
        if lower == "coin usb drain" || lower == "coin usb clear" {
            return CoinUSBCarrier.drain()
        }
        if lower.hasPrefix("coin qr eat ") {
            let rest = String(text.dropFirst("coin qr eat ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return CoinQRCarrier.eat(rest)
        }
        if lower.hasPrefix("coin nfc eat ") {
            let rest = String(text.dropFirst("coin nfc eat ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return CoinNFCCarrier.eat(rest)
        }
        if lower.hasPrefix("coin share eat ") {
            let rest = String(text.dropFirst("coin share eat ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return CoinShareCarrier.eat(path: rest)
        }

        if lower == "coin bt" || lower == "coin bt status" || lower == "coin bluetooth" || lower == "coin bluetooth status" {
            return NearLinkBluetooth.shared.statusLine
        }
        if lower == "coin bt on" || lower == "coin bluetooth on" || lower == "coin near on" {
            return NearLinkBluetooth.shared.start()
        }
        if lower == "coin bt off" || lower == "coin bluetooth off" || lower == "coin near off" {
            return NearLinkBluetooth.shared.stop()
        }
        if lower == "coin bt clear" || lower == "coin bluetooth clear" {
            return NearLinkBluetooth.shared.clear()
        }
        if lower == "coin bt reset" || lower == "coin bluetooth reset" {
            return NearLinkBluetooth.shared.reset()
        }

        // Path-scout + Machine DNA (before bare coin/token status)
        if lower.hasPrefix("coin send ") || lower == "coin send" || lower.hasPrefix("token send ") {
            let rest: String
            if lower.hasPrefix("coin send") {
                rest = String(text.dropFirst("coin send".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else {
                rest = String(text.dropFirst("token send".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            }
            // Support: coin send <dest> | coin send <dest> via bluetooth
            var dest = rest
            var via = "auto"
            if let r = rest.range(of: " via ", options: .caseInsensitive) {
                dest = String(rest[..<r.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
                via = String(rest[r.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
            } else {
                let parts = rest.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true).map(String.init)
                dest = parts.first ?? ""
                if parts.count > 1 {
                    let second = parts[1].lowercased()
                    if second.hasPrefix("via ") {
                        via = String(parts[1].dropFirst(4)).trimmingCharacters(in: .whitespacesAndNewlines)
                    } else if ["bluetooth", "ble", "near", "lan", "bonjour", "usb", "wire", "qr", "nfc", "share", "airdrop", "local", "infra", "internet", "auto"].contains(second) {
                        via = second
                    } else {
                        via = parts[1]
                    }
                }
            }
            return CoinPathScout.send(to: dest, via: via.isEmpty ? "auto" : via)
        }
        if lower == "coin mysteries" || lower.hasPrefix("coin mysteries ") || lower == "coin path report" || lower.hasPrefix("coin path report ") {
            let rest = lower.hasPrefix("coin mysteries")
                ? String(lower.dropFirst("coin mysteries".count)).trimmingCharacters(in: .whitespacesAndNewlines)
                : String(lower.dropFirst("coin path report".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return CoinPathScout.report(pathId: rest.isEmpty ? nil : rest)
        }
        if lower == "coin path status" || lower == "coin path-scout" || lower == "coin pathscout" {
            return CoinPathScout.status()
        }
        if lower.hasPrefix("coin path begin ") || lower == "coin path begin" {
            let rest = String(text.dropFirst("coin path begin".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            let parts = rest.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true).map(String.init)
            let dest = parts.first ?? ""
            let via = parts.count > 1 ? parts[1] : "local"
            return CoinPathScout.begin(to: dest, via: via)
        }
        if lower.hasPrefix("coin path note ") || lower.hasPrefix("coin path strange ") {
            let prefix = lower.hasPrefix("coin path note") ? "coin path note" : "coin path strange"
            let rest = String(text.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return CoinPathScout.noteStrange(rest)
        }
        if lower.hasPrefix("coin path clear ") {
            let rest = String(text.dropFirst("coin path clear".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return CoinPathScout.clearObstruction(rest)
        }
        if lower.hasPrefix("coin path ") {
            return "coin path: begin <to> [via] | note <strange> | report [pathId] | clear <clog> | status"
        }
        if lower.hasPrefix("coin dna touch ") {
            let rest = String(text.dropFirst("coin dna touch".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            let parts = rest.split(separator: " ", maxSplits: 2, omittingEmptySubsequences: true).map(String.init)
            guard parts.count >= 2 else {
                return "HOW: coin dna touch <kind> <identity> [role…] · kinds: seat tower repeater hub storage relay path-node"
            }
            let role = parts.count > 2 ? parts[2] : nil
            return CoinPathScout.dnaTouch(kind: parts[0], identity: parts[1], role: role)
        }
        if lower == "coin dna" || lower.hasPrefix("coin dna ") {
            let rest = String(lower.dropFirst("coin dna".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            if rest.isEmpty { return CoinPathScout.dnaReport() }
            return CoinPathScout.dnaReport(pathId: rest)
        }

        if lower == "token" || lower == "coin" || lower == "ya token" || lower == "ya coin" || lower == "я token" || lower == "я coin" {
            return YaToken.status()
        }

        if lower == "mint" || lower == "mint token" || lower == "mint coin" || lower == "mint ya" {
            return YaToken.ensureGenesisMinted()
        }
        if lower == "unit mint" || lower.hasPrefix("unit mint ") {
            let rest = String(lower.dropFirst("unit mint".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            if rest.isEmpty { return YaToken.mintUnit() }
            // unit mint cite ... | unit mint clear_clog ... | unit mint <brief>
            let parts = rest.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true).map(String.init)
            let utilities = ["cite", "clear_clog", "tip", "seat", "evolve", "origin"]
            if utilities.contains(parts[0]) {
                let brief = parts.count > 1 ? parts[1] : ""
                return YaToken.mintUnit(brief: brief, utility: parts[0])
            }
            return YaToken.mintUnit(brief: rest)
        }
        if lower == "twin push" || lower == "twin push devnet" || lower.hasPrefix("twin push ") {
            return TwinPipe.pushDevnet()
        }
        if lower == "twin status" || lower == "twin" {
            return TwinPipe.status() + "\n\n" + YaToken.status()
        }
        if lower == "twin prepare" || lower == "twin prepare solana" || lower.hasPrefix("twin prepare ") {
            var cluster = "devnet"
            if lower.hasPrefix("twin prepare ") {
                let rest = String(lower.dropFirst("twin prepare ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
                if rest == "mainnet" || rest == "mainnet-beta" { cluster = "mainnet-beta" }
                else if rest == "devnet" || rest == "solana" || rest == "solana devnet" { cluster = "devnet" }
                else if rest == "solana mainnet" { cluster = "mainnet-beta" }
            }
            return TwinPipe.prepareSolana(cluster: cluster)
        }
        if lower.hasPrefix("twin paste ") {
            let rest = String(text.dropFirst("twin paste ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            let parts = rest.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true).map(String.init)
            guard parts.count == 2 else { return "HOW: twin paste <tagId> <mintAddress>" }
            return YaToken.pasteTwin(tagId: parts[0], address: parts[1])
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
        if lower == "ghost establish" || lower.hasPrefix("ghost establish ") {
            let bio = String(lower.dropFirst("ghost establish".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return GhostChainLedger.clayWrite(op: "establish", bio: bio)
        }
        if lower == "ghost claim" || lower.hasPrefix("ghost claim ") {
            let bio = String(lower.dropFirst("ghost claim".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return GhostChainLedger.clayWrite(op: "claim", bio: bio)
        }
        if lower == "ghost ping" || lower.hasPrefix("ghost ping ") {
            let bio = String(lower.dropFirst("ghost ping".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return GhostChainLedger.clayWrite(op: "ping", bio: bio)
        }

        if lower == "essence" || lower == "essence status" || lower == "essence trace" {
            return EssenceTrace.status()
        }
        if lower.hasPrefix("essence status ") {
            let tid = String(lower.dropFirst("essence status".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return EssenceTrace.status(traceId: tid)
        }
        if lower == "essence mint" || lower.hasPrefix("essence mint ") {
            let rest = String(lower.dropFirst("essence mint".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            if rest.isEmpty { return EssenceTrace.mint() }
            let parts = rest.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true).map(String.init)
            if parts.count == 1 { return EssenceTrace.mint(amount: parts[0]) }
            return EssenceTrace.mint(amount: parts[0], ref: parts[1])
        }
        if lower.hasPrefix("essence transfer ") {
            let rest = String(lower.dropFirst("essence transfer".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            let parts = rest.split(separator: " ", maxSplits: 2, omittingEmptySubsequences: true).map(String.init)
            guard let dest = parts.first, !dest.isEmpty else {
                return "essence transfer needs destination. HOW: essence transfer <to> [amount] [ref]"
            }
            let amount = parts.count > 1 ? parts[1] : "1"
            let ref = parts.count > 2 ? parts[2] : "essence.transfer"
            return EssenceTrace.transfer(to: dest, amount: amount, ref: ref)
        }
        if lower == "essence settle" || lower.hasPrefix("essence settle ") {
            let tid = String(lower.dropFirst("essence settle".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return EssenceTrace.settle(traceId: tid.isEmpty ? nil : tid)
        }
        if lower.hasPrefix("essence clear clog ") || lower.hasPrefix("clog clear ") || lower.hasPrefix("token clear clog ") {
            let name: String
            if lower.hasPrefix("essence clear clog ") {
                name = String(lower.dropFirst("essence clear clog".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else if lower.hasPrefix("clog clear ") {
                name = String(lower.dropFirst("clog clear".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else {
                name = String(lower.dropFirst("token clear clog".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            }
            return EssenceTrace.clearClog(name: name)
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
        // PLACE seat first — never let proximity ear steal place / place set / teach locks
        if lower == "place" || lower == "time" || lower == "where am i" || lower == "when" {
            return PlaceSense.shared.statusLine()
        }
        if lower.hasPrefix("place set ") {
            return placeSet(text)
        }
        if lower == "place clear" {
            return PlaceSense.shared.clearManual()
        }
        // PROXIMITY EAR — natural "best X around" / cuisine / grocery / school (HOW: closest + closest-best)
        if NearbyPlaces.looksLikeProximitySearch(text) {
            return NearbyPlaces.answer(query: text)
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


        if lower == "transcript" || lower == "mind tape" || lower == "mind transcript" || lower == "tape" {
            return MindTranscript.status() + "\n\n--- tail ---\n" + MindTranscript.tail()
        }

        if lower == "teachings" || lower == "teach status" {
            return TeachStore.status() + "\n" + TeachStore.heartContextBlock()
        }

        // Decider teach / lock / remember → persist then confirm
        
        // Last-resort TOTAL RECALL from a Mind .txt / CHAT-THREAD.jsonl path on disk
        if lower.hasPrefix("mind reseat ") || lower.hasPrefix("transcript reseat ") || lower.hasPrefix("reseat mind ") {
            let path = text.split(separator: " ", maxSplits: 2, omittingEmptySubsequences: true).last.map(String.init) ?? ""
            let cleaned = path.trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
            guard !cleaned.isEmpty else { return "mind reseat HOW: mind reseat /full/path/to/MIND-TRANSCRIPT.txt" }
            guard let url = MindReseat.resolveMindFile(cleaned) else {
                return "mind reseat MISSING — put file in Documents/ЯBOT/mind/ or pass full path. try: mind reseat ios-smoke"
            }
            return MindReseat.reseat(from: url)
        }

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



        // CODE OS / literacy
        if lower == "yacode" || lower == "languages" || lower == "code os" || lower == "codeos" || lower == "who are you code" {
            return YaCode.reply()
        }
        if lower == "digits" || lower == "letters" || lower == "numbers" || lower == "glyph literacy" {
            return YaCode.digitsLesson()
        }

        // SELF-FIX — Decider-gated write + apply (terminal or source seat)
        if lower == "self fix list" || lower == "selffix list" || lower == "fix list" {
            return SelfFix.list()
        }
        if lower.hasPrefix("self fix:") || lower.hasPrefix("self fix ") || lower.hasPrefix("selffix:") || lower.hasPrefix("selffix ") || lower.hasPrefix("fix me:") || lower.hasPrefix("fix me ") {
            var brief = text
            for prefix in ["Self fix:", "self fix:", "Self fix ", "self fix ", "Selffix:", "selffix:", "Selffix ", "selffix ", "Fix me:", "fix me:", "Fix me ", "fix me "] {
                if brief.lowercased().hasPrefix(prefix.lowercased()) {
                    brief = String(brief.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            return SelfFix.authorAndPropose(brief: brief)
        }
        if lower.hasPrefix("fix apply ") || lower.hasPrefix("selffix apply ") || lower.hasPrefix("self fix apply ") {
            var name = text
            for prefix in ["fix apply ", "Fix apply ", "selffix apply ", "Selffix apply ", "self fix apply ", "Self fix apply "] {
                if name.lowercased().hasPrefix(prefix.lowercased()) {
                    name = String(name.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            return SelfFix.apply(name: name)
        }
        if lower.hasPrefix("fix shell ") {
            let name = String(text.dropFirst("fix shell ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
            return SelfFix.runShell(name: name)
        }

        // WRITE-CODE — Decider asks clay to author Swift / Я CODE (Heart when seated)
        if lower.hasPrefix("write code:") || lower.hasPrefix("write code ") || lower.hasPrefix("writecode:") || lower.hasPrefix("writecode ") || lower == "write code" {
            var brief = text
            for prefix in ["Write code:", "write code:", "Write code ", "write code ", "Writecode:", "writecode:", "Writecode ", "writecode "] {
                if brief.lowercased().hasPrefix(prefix.lowercased()) {
                    brief = String(brief.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            let prompt = """
            You are ЯBOT write-code seat (Swift, offline, NonNuclear).
            APP CODE MIND: CompanionRouter, NativeHeart, MindTreeRoot, TeachStore, EssenceTrace, PlumbingClear.
            Task: \(brief.isEmpty ? "Write a tiny useful Swift helper for clay." : brief)
            Rules: one complete Swift snippet only in a ```swift fence; no network; match enum/static clay style; under 50 lines; no invented genotypes.
            """
            if NativeHeart.seated {
                return NativeHeart.generate(prompt: prompt)
            }
            // Offline stub so Decider still gets a real starter when Heart cold
            return """
            Heart cold — starter from WRITE-CODE LAW (rebuild with Heart for fuller authoring):
            ```swift
            import Foundation
            enum SoftEnglishLab {
                static func laneHint(_ text: String) -> String {
                    let t = text.lowercased()
                    if t.hasPrefix("are you there") || t == "ping" { return "command" }
                    if t.hasPrefix("show") && t.contains("command") { return "function" }
                    if t.contains("clear") && (t.contains("clog") || t.contains("clog")) { return "action" }
                    return "conversation"
                }
            }
            ```
            Seat Heart, then retry: write code: <brief>
            """
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
