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
            ("token blast", .action), ("blast the token", .action),
            ("blast our token", .action), ("check the token on chain", .action),
            ("fire tokenblast", .action),
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
        // Net-test tree seats as FUNCTION before soft-English / Heart talk
        if PingPongNetTest.looksLikeNetTest(text) { return .function }
        if let soft = softEnglishLane(lower) { return soft }

        // ACTION — side-effecting work (clear, send, mint, flip, reseat, feed…)
        let actionHints = [
            "essence clear", "clear clog", "clog clear", "plumbing clear",
            "mind reseat", "transcript reseat", "reseat mind",
            "coin send", "coin path", "coin bt clear", "coin bt reset",
            "coin lan clear", "coin usb drain", "coin qr eat", "coin nfc eat", "coin share eat",
            "ghost establish", "ghost claim",
            "tokenblast", "token blast", "blast token", "blast twin", "twin blast",
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
            "commands", "functions", "help", "scout", "lab scout", "scout walis", "walis", "shot", "shot macos", "shot ios", "screenshot", "lab shot", "teachings", "teachings forever",
            "yacode", "languages", "write-code", "write code", "self fix", "fix apply", "digits", "code os",
            "tongue", "dual tongue", "cos", "voice", "triangle",
            "pingpong", "ping pong", "nslookup", "dig",
            "bot enter", "bot leave", "bot mint", "bot create", "bot new", "label teach", "label bot", "i am ",
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
            "who", "who am i", "labels", "label", "bots",
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

        // PINGPONG net-test tree (local ICMP/DNS probes) — BEFORE Heart; not companion heartbeat
        if let net = PingPongNetTest.handleClay(text) {
            return net
        }

        if lower == "ping" || lower == "utah ping" {
            return "here"
        }

        // BOT LABELS — in-bot self-serve (U · Я · guest). Clay seat Я never renames.
        if lower == "who" || lower == "who am i" || lower == "labels" || lower == "label" || lower == "bots" {
            return BotLabel.whoStatus()
        }
        if lower == "label teach" || lower == "bot teach" || lower == "labels teach" {
            return """
            BOT LABEL HOW (seat yourself — no Mac needed):
            • U = biological · Я = on-machine clay (not numbered) · joiners MUST be labeled
            • bot mint / bot create / bot new — we-create → ЯBOT#1, ЯBOT#2, … (serial forever)
            • bot enter [Name] — join; empty or bare "bot" → auto-mint next ЯBOT#N; duplicates refused
            • bot leave — assistant stamps = Я again
            • who / labels — triangle + registry + next number
            Example: bot mint → talk → bot leave
            """
        }
        if lower == "bot leave" || lower == "label bot clear" || lower == "label clear" || lower == "leave bot" {
            return BotLabel.leave()
        }
        if lower == "bot mint" || lower == "bot create" || lower == "bot new"
            || lower.hasPrefix("bot mint ") || lower.hasPrefix("bot create ") || lower.hasPrefix("bot new ") {
            var name = ""
            for prefix in ["bot mint ", "Bot mint ", "bot create ", "Bot create ", "bot new ", "Bot new "] {
                if text.lowercased().hasPrefix(prefix.lowercased()) {
                    name = String(text.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            return BotLabel.mint(optionalName: name.isEmpty ? nil : name)
        }
        if lower == "bot enter" {
            return BotLabel.enter("")  // auto-mint next ЯBOT#N — no anonymous join
        }
        if lower.hasPrefix("bot enter ") || lower.hasPrefix("label bot ") || lower.hasPrefix("i am ") || lower.hasPrefix("bot i am ") {
            var name = text
            for prefix in ["bot enter ", "Bot enter ", "label bot ", "Label bot ", "i am ", "I am ", "bot i am ", "Bot i am "] {
                if name.lowercased().hasPrefix(prefix.lowercased()) {
                    name = String(name.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            return BotLabel.enter(name)
        }
        if lower.hasPrefix("label clay") {
            return "clay seat is Я forever — refuse rename. Guests: bot enter <Name>."
        }

        if lower == "commands" || lower == "help" || lower == "functions" {
            return """
            Clay seat · BASE COMMANDS (one word) · Rbot proficiency 0–10
            HARDCODE: base = exactly one word · multi-word = extension under that base.
            Aliases: commands · functions · ? → help
            Contract: contracts/BASE-COMMANDS-ONE-WORD-0.1.md

            BASE (1–45) · word — blurb — N/10
            1  ping — companion heartbeat (bare ≠ ICMP) — 9/10
            2  pong — companion heartbeat reply — 9/10
            3  help — this list + extension hints — 8/10
            4  think — clay meditation stub — 6/10
            5  mind — mind loop / Machine Mind — 6/10
            6  tongue — dual-tongue law — 7/10
            7  teachings — forever teachings + code caution — 7/10
            8  bolte — first RZL Being / Bolte face — 6/10
            9  rzl — .RZL envelope · Digital botbat — 6/10
            10  revert — walk back last bad mod — 5/10
            11  reform — reform after bad mod — 5/10
            12  respawn — restore most recent official template — 6/10
            13  evolve — Decider-gated (never self-granted) — 4/10
            14  snapshot — revision checkpoint note — 5/10
            15  mode — ONLINE / OFFLINE premier status — 8/10
            16  online — online path (bonus only) — 5/10
            17  offline — affirm offline premier — 8/10
            18  search — web search (ONLINE bonus) — 5/10
            19  nearby — closest / closest-best place — 5/10
            20  place — space seat (lat,lon label) — 6/10
            21  research — multi-source digest (ONLINE) — 4/10
            22  read — fetch public page (ONLINE) — 4/10
            23  token — Я TOKEN / RFID unit — 6/10
            24  coin — Я COIN carriers · DNA · path — 6/10
            25  mint — mint unit / twin / bot defaults — 6/10
            26  yacode — three-language foundation — 7/10
            27  cos — CoS communication law — 7/10
            28  voice — CoS→ЯBOT voice seat — 7/10
            29  triangle — Decider · CoS · ЯBOT — 7/10
            30  heart — offline Heart (heart.gguf) — 8/10
            31  ghost — Я GHOST CHAIN tape — 7/10
            32  essence — ESSENCE TRACE — 6/10
            33  teach — seat Decider teaching — 7/10
            34  lock — lock a teaching — 7/10
            35  remember — remember into Heart context — 7/10
            36  transcript — MIND-TRANSCRIPT seat — 7/10
            37  lab — Lab / chamber landing — 6/10
            38  wallet — Wallet landing — 5/10
            39  home — Ghost Heart Home — 7/10
            40  scout — Lab post-mission inventory — 6/10
            41  shot — seat capture → scout shots — 6/10
            42  walis — offline hard comb of scout folders — 5/10
            43  who — U · Я · guests / next ЯBOT#N — 8/10
            44  bot — create / enter / leave labeled bots — 8/10
            45  labels — label law / HOW — 8/10

            EXTENSIONS (examples — not new bases)
            · bot mint|enter|leave · heart status · ghost claim|status|establish
            · pingpong · PING -C 3 host · NSLOOKUP · dig (bare ping stays heartbeat)
            · coin send|dna|carriers|bt|lan|qr|nfc · token blast · twin …
            · place set <lat>,<lon> [label] · scout walis · shot macos|ios
            · essence mint|transfer|settle|clear clog · label teach
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
            // HARDCODE: Bolte face opens sole fixed manual YAMANUAL (no new base command).
            let opened = ManualPDFLocator.openSeatedPDF()
            let openLine = opened ? "Opened YAMANUAL.pdf (sole fixed manual)." : "YAMANUAL.pdf not seated — put living PDF at Documents/ЯBOT/YAMANUAL.pdf"
            return "BOLTE · YAMANUAL sole manual face.\n\(openLine)\nBolte remains the RZL Being clay face (NonNuclear)."
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
        // SCOUT WALIS — offline-only HARD broom + folder tidy (Decider 2026-09-22)
        if let walis = LabScoutWalis.handleClay(text) {
            return walis
        }

        // LAB SCOUT — post-mission inventory readout (Lab function command)
        if lower == "lab manual" || lower == "manual desk" || lower == "open lab manual" {
            let ok = LabManualDesk.openPDF()
            return LabManualDesk.statusLine() + (ok ? "\nOpened desk PDF." : "\nPDF not seated yet — lab/rooms/desk/LAB-MANUAL.pdf")
        }
        if lower == "lab chamber" || lower == "chamber" || lower == "lab room" || lower == "rbits" || lower == "lab void" {
            return "Lab of Creations (cemented): yabot://lab/chamber\nRoot tree (all OS): lab/rooms/LAB-OF-CREATIONS.jpg\nmacOS·iOS·Android·Linux·ЯOS — genetic + technological creations"
        }
        // Scout .01 — 10 commands from ЯBOT APP
        if let baby = NeoBabyScout.handle(text) {
            return baby
        }
        if let evolved = LabFunctionEvolve.handle(text) {
            return evolved
        }
        if lower == "bot rfid" || lower == "rfid registry" || lower == "mint bot rfid" {
            if lower.hasPrefix("mint bot rfid ") {
                let name = String(text.dropFirst("mint bot rfid ".count)).trimmingCharacters(in: .whitespacesAndNewlines)
                if name.isEmpty { return BotRFIDMint.status() }
                return BotRFIDMint.mintBot(callsign: name, kind: name.lowercased().contains("scout") ? "scout" : "bot")
            }
            _ = BotRFIDMint.ensureScout01Minted()
            return BotRFIDMint.status()
        }
        if lower == "scout .01" || lower == "scout.01" || lower == "scout 0.01" || lower == "botbaby" || lower == "neo baby" || lower == "baby" || lower == "leave baby" || lower == "baby leave" {
            return NeoBabyScout.introduce()
        }

        if lower == "scout missing" || lower == "scout miss" || lower == "missing of 40" || lower == "scout teach" {
            return ScoutMissingTeach.readout()
        }
        if lower == "scout" || lower == "lab scout" || lower == "scout inventory" || lower == "command: scout" || lower == "command scout" {
            _ = ScoutMissingTeach.seatIntoHeart()
            return LabScoutCommand.scout().text + "\n\n" + "Tip: scout missing — full missing-of-40 + fix path teach"
        }

        // LAB SHOT relay tags from shared inbox (only target seat runs capture)
        if lower.hasPrefix("relay-macos:") || lower.hasPrefix("relay-ios:") {
            let tag = lower.hasPrefix("relay-macos:") ? "macos" : "ios"
            let parts = lower.split(separator: ":", maxSplits: 1)
            let body = (parts.count > 1 ? String(parts[1]) : "shot")
                .trimmingCharacters(in: .whitespacesAndNewlines)
            let here = LabShotCommand.localTarget().label
            if tag != here {
                return "SHOT RELAY · armed for \(tag) · this seat is \(here) · waiting on target"
            }
            let mode = body.hasPrefix("shot ") ? String(body.dropFirst(5)) : (body == "shot" ? "full" : body)
            return LabShotCommand.dispatch(mode.isEmpty ? "full" : mode).text
        }

        // LAB SHOT — local or remote seat capture into scout/shots
        if lower == "shot" || lower == "screenshot" || lower == "lab shot" || lower == "command shot" || lower == "command: shot"
            || lower == "shot macos" || lower == "shot mac" || lower == "shot ios" || lower == "shot iphone"
            || lower == "shot macos full" || lower == "shot ios full"
            || lower.hasPrefix("shot ") || lower.hasPrefix("screenshot ")
            || lower.hasPrefix("lab shot ") || lower.hasPrefix("command shot ") {
            var mode = "full"
            if lower.hasPrefix("shot ") {
                mode = String(lower.dropFirst(5)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else if lower.hasPrefix("screenshot ") {
                mode = String(lower.dropFirst(11)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else if lower.hasPrefix("lab shot ") {
                mode = String(lower.dropFirst(9)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else if lower.hasPrefix("command shot ") {
                mode = String(lower.dropFirst(13)).trimmingCharacters(in: .whitespacesAndNewlines)
            } else if lower == "shot macos" || lower == "shot mac" {
                mode = "macos"
            } else if lower == "shot ios" || lower == "shot iphone" {
                mode = "ios"
            } else if lower == "shot macos full" {
                mode = "macos full"
            } else if lower == "shot ios full" {
                mode = "ios full"
            }
            if mode.isEmpty { mode = "full" }
            return LabShotCommand.dispatch(mode).text
        }

        // TOKENBLAST — live pipe probe + report
        if lower == "tokenblast" || lower == "token blast" || lower == "blast token" || lower == "blast twin" || lower == "twin blast" || lower.hasPrefix("tokenblast ") || lower.hasPrefix("token blast ") || lower.hasPrefix("blast token ") {
            var arg: String? = nil
            for prefix in ["tokenblast ", "token blast ", "blast token ", "blast twin ", "twin blast "] {
                if lower.hasPrefix(prefix) {
                    arg = String(text.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
                    break
                }
            }
            return TokenBlast.run(mintArg: arg)
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

        if lower == "grant evolve lab functions" || lower == "grant evolve functions" || lower == "you can evolve new functions" {
            return LabFunctionEvolve.grant()
        }
        if let evolved = LabFunctionEvolve.handle(text) {
            return evolved
        }
        if lower.hasPrefix("evolve") {
            if LabFunctionEvolve.isGranted() {
                return "Evolve grant is ON for Lab functions. HOW: evolve function <name>: <spec> · or: new light\nNonNuclear stands. No invented genotypes."
            }
            return "Evolve is Decider-gated. I cannot grant myself permission. Say: grant evolve lab functions — then evolve function <name>: <spec>. NonNuclear stands."
        }

        if lower == "online" || lower == "go online" {
            // US (Decider) only — ONLINE only on the way out.
            return ModeStore.shared.goOnline(by: .decider, context: .wayOut)
                + "\nTry: search Utah capital · or send Scout .01 with bScout"
        }
        if lower == "offline" || lower == "go offline" {
            return ModeStore.shared.goOffline(reason: "decider")
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
