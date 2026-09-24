import Foundation

/// TOKENBLAST — fire crown twin (or a pasted mint) through live public pipes and report
/// what returns: perfection, peculiarity, or strangeness. NonNuclear · cite-only · no sends.
enum TokenBlast {
    private static let rpcURL = URL(string: "https://api.mainnet-beta.solana.com")!

    /// ACT: `tokenblast` · `token blast` · `blast token` [optional mint]
    static func run(mintArg: String? = nil) -> String {
        let purpose = "Purpose: shove the twin through live digital plumbing and read every mirror."
        let intent = "Intent: track·trace·verify — report perfection / peculiarity / strangeness on the way back. No spend."

        let trimmed = mintArg?.trimmingCharacters(in: .whitespacesAndNewlines)
        let mint = (trimmed?.isEmpty == false ? trimmed! : YaTwinChain.mint)

        guard mint.count >= 32, mint.count <= 44 else {
            return """
            TOKENBLAST FAIL
            \(purpose)
            \(intent)
            Mint looks wrong: \(mint)
            HOW: tokenblast   OR   tokenblast <mintAddress>
            """
        }

        let online = ModeStore.shared.isOnline
        var lines: [String] = [
            "TOKENBLAST · Solana mainnet",
            purpose,
            intent,
            "Target mint: \(mint)",
            "Crown seat: \(YaTwinChain.crownName) / \(YaTwinChain.crownSymbol)",
            "Mode: \(online ? "ONLINE (live pipes)" : "OFFLINE (hardcoded twin + local seats only)")",
            ""
        ]

        var perfect: [String] = []
        var peculiar: [String] = []
        var strange: [String] = []

        if mint == YaTwinChain.mint {
            perfect.append("Mint matches hardcoded YaTwinChain crown seat.")
        } else {
            peculiar.append("Blast mint ≠ seated crown twin. Citing Decider-pasted mint.")
        }

        if !online {
            lines.append("PIPE · offline")
            lines.append("  Skipped live RPC/Dex/Jupiter — flip ONLINE to blast the rails.")
            lines.append("  Local twin: supply \(YaTwinChain.supplyUI) · decimals \(YaTwinChain.decimals) · status \(YaTwinChain.status)")
            lines.append("  ATA \(YaTwinChain.ownerATA)")
            lines.append("  Mint tx \(YaTwinChain.mintSignature)")
            strange.append("Blast ran offline — mirrors not queried this turn.")
            return finish(lines: lines, perfect: perfect, peculiar: peculiar, strange: strange)
        }

        // RPC account
        let acct = rpc("getAccountInfo", params: [mint, ["encoding": "jsonParsed"]])
        if let value = ((acct?["result"] as? [String: Any])?["value"] as? [String: Any]) {
            let owner = value["owner"] as? String ?? "?"
            if owner.contains("Token") {
                perfect.append("RPC: mint account live under SPL Token program.")
            } else {
                strange.append("RPC: account owner is not Token program (\(owner.prefix(16))…).")
            }
            if let info = ((value["data"] as? [String: Any])?["parsed"] as? [String: Any])?["info"] as? [String: Any] {
                let dec = info["decimals"] as? Int ?? -1
                let supply = info["supply"] as? String ?? "?"
                let mintAuth = stringish(info["mintAuthority"])
                let freeze = stringish(info["freezeAuthority"])
                lines.append("PIPE · Solana RPC (getAccountInfo)")
                lines.append("  decimals \(dec) · supply_raw \(supply)")
                lines.append("  mintAuthority \(mintAuth)")
                lines.append("  freezeAuthority \(freeze)")
                if dec == YaTwinChain.decimals {
                    perfect.append("RPC decimals match crown seat (\(dec)).")
                } else {
                    peculiar.append("RPC decimals \(dec) ≠ crown \(YaTwinChain.decimals).")
                }
                if mintAuth == YaTwinChain.mintAuthority {
                    perfect.append("Mint authority matches crown seat.")
                } else if mintAuth == "null" {
                    peculiar.append("Mint authority renounced (null) — supply locked.")
                } else {
                    peculiar.append("Mint authority differs from crown seat.")
                }
                if freeze != "null" {
                    peculiar.append("Freeze authority still set.")
                } else {
                    perfect.append("Freeze authority null.")
                }
            }
        } else if let err = acct?["error"] {
            strange.append("RPC getAccountInfo error: \(err)")
            lines.append("PIPE · Solana RPC — FAIL")
        } else {
            strange.append("RPC returned no mint account — explorers may say not found.")
            lines.append("PIPE · Solana RPC — account NULL")
        }

        if let val = ((rpc("getTokenSupply", params: [mint])?["result"] as? [String: Any])?["value"] as? [String: Any]) {
            let ui = val["uiAmountString"] as? String ?? "\(val["uiAmount"] ?? "?")"
            lines.append("PIPE · Solana RPC (getTokenSupply) → \(ui)")
            if ui == YaTwinChain.supplyUI || ui.hasPrefix(YaTwinChain.supplyUI) {
                perfect.append("Supply \(ui) matches crown seat.")
            } else {
                peculiar.append("Supply \(ui) ≠ crown \(YaTwinChain.supplyUI).")
            }
        } else {
            strange.append("getTokenSupply empty/fail.")
        }

        lines.append("PIPE · Jupiter lite search")
        if let arr = getArray("https://lite-api.jup.ag/tokens/v2/search?query=\(mint)") {
            if let hit = arr.first(where: { ($0["id"] as? String) == mint }) ?? arr.first {
                let name = hit["name"] as? String ?? ""
                let sym = hit["symbol"] as? String ?? ""
                let circ = hit["circSupply"] ?? hit["totalSupply"] ?? "?"
                let holders = hit["holderCount"] ?? "?"
                let organic = hit["organicScore"] ?? "?"
                let tags = (hit["tags"] as? [String])?.joined(separator: ",") ?? ""
                lines.append("  name '\(name)' · symbol '\(sym)' · supply \(circ) · holders \(holders)")
                lines.append("  organicScore \(organic) · tags \(tags)")
                if name == "Я" || name == YaTwinChain.crownName {
                    perfect.append("Jupiter shows crown name Я.")
                } else if name.isEmpty {
                    peculiar.append("Jupiter indexes mint but name/symbol blank (URI empty or lag).")
                } else {
                    strange.append("Jupiter name '\(name)' ≠ crown Я.")
                }
                if let h = holders as? Int {
                    if h == 1 { perfect.append("Single holder — full supply on seat ATA (pre-pool).") }
                    else if h > 1 { peculiar.append("Holder count \(h) — twin moved beyond single seat.") }
                }
            } else {
                peculiar.append("Jupiter returned no exact mint hit yet.")
                lines.append("  (no exact hit)")
            }
        } else {
            strange.append("Jupiter lite unreachable from this seat.")
            lines.append("  unreachable")
        }

        lines.append("PIPE · Dexscreener")
        if let dex = getDict("https://api.dexscreener.com/latest/dex/tokens/\(mint)") {
            let pairs = dex["pairs"] as? [Any]
            if pairs == nil || pairs?.isEmpty == true {
                lines.append("  pairs: null/empty")
                perfect.append("Dexscreener quiet — no pool yet (expected).")
            } else {
                lines.append("  pairs: \(pairs!.count)")
                peculiar.append("Dexscreener has \(pairs!.count) pair(s) — market plumbing awake.")
            }
        } else {
            strange.append("Dexscreener unreachable.")
            lines.append("  unreachable")
        }

        lines.append("PIPE · GeckoTerminal")
        if let gecko = getDict("https://api.geckoterminal.com/api/v2/networks/solana/tokens/\(mint)") {
            if gecko["errors"] != nil {
                lines.append("  not listed / errors")
                perfect.append("GeckoTerminal unlisted — fine pre-pool.")
            } else {
                lines.append("  listed")
                peculiar.append("GeckoTerminal already lists this mint.")
            }
        } else {
            lines.append("  no clean payload (often 404)")
            peculiar.append("GeckoTerminal did not return a clean token payload.")
        }

        lines.append("PIPE · Clay seat (YaTwinChain)")
        lines.append("  ATA \(YaTwinChain.ownerATA)")
        lines.append("  mint tx \(YaTwinChain.mintSignature)")
        lines.append("  slot \(YaTwinChain.slot) · status \(YaTwinChain.status)")

        return finish(lines: lines, perfect: perfect, peculiar: peculiar, strange: strange)
    }

    private static func finish(lines: [String], perfect: [String], peculiar: [String], strange: [String]) -> String {
        var out = lines
        out.append("")
        out.append("ALONG THE WAY")
        out.append("  PERFECTION (\(perfect.count))")
        if perfect.isEmpty { out.append("    — none noted") }
        else { for p in perfect { out.append("    ✓ \(p)") } }
        out.append("  PECULIARITY (\(peculiar.count))")
        if peculiar.isEmpty { out.append("    — none noted") }
        else { for p in peculiar { out.append("    ~ \(p)") } }
        out.append("  STRANGENESS (\(strange.count))")
        if strange.isEmpty { out.append("    — none noted") }
        else { for s in strange { out.append("    ! \(s)") } }

        let verdict: String
        if !strange.isEmpty && perfect.isEmpty {
            verdict = "VERDICT: strange — twin may be missing or pipes clogged."
        } else if !strange.isEmpty {
            verdict = "VERDICT: mixed — live on rail, some mirrors clogged or lagging."
        } else if !peculiar.isEmpty {
            verdict = "VERDICT: peculiar-but-alive — on rail; oddities mostly index/pool lag."
        } else {
            verdict = "VERDICT: perfection path — mint live, seats agree, quiet markets as expected."
        }
        out.append("")
        out.append(verdict)
        out.append("Law: explorers are mirrors — clay owns source. Crown Я.")
        return out.joined(separator: "\n")
    }

    private static func stringish(_ any: Any?) -> String {
        if any == nil || any is NSNull { return "null" }
        if let s = any as? String { return s }
        return "\(any!)"
    }

    private static func rpc(_ method: String, params: [Any]) -> [String: Any]? {
        let body: [String: Any] = ["jsonrpc": "2.0", "id": 1, "method": method, "params": params]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else { return nil }
        var req = URLRequest(url: rpcURL, timeoutInterval: 12)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = data
        return sendDict(req)
    }

    private static func getDict(_ urlString: String) -> [String: Any]? {
        guard let url = URL(string: urlString) else { return nil }
        var req = URLRequest(url: url, timeoutInterval: 12)
        req.setValue("YaBOT-TOKENBLAST/1.0", forHTTPHeaderField: "User-Agent")
        return sendDict(req)
    }

    private static func getArray(_ urlString: String) -> [[String: Any]]? {
        guard let url = URL(string: urlString) else { return nil }
        var req = URLRequest(url: url, timeoutInterval: 12)
        req.setValue("YaBOT-TOKENBLAST/1.0", forHTTPHeaderField: "User-Agent")
        let sem = DispatchSemaphore(value: 0)
        var out: [[String: Any]]?
        URLSession.shared.dataTask(with: req) { data, _, _ in
            defer { sem.signal() }
            guard let data,
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { return }
            out = obj
        }.resume()
        _ = sem.wait(timeout: .now() + 14)
        return out
    }

    private static func sendDict(_ req: URLRequest) -> [String: Any]? {
        let sem = DispatchSemaphore(value: 0)
        var out: [String: Any]?
        URLSession.shared.dataTask(with: req) { data, _, _ in
            defer { sem.signal() }
            guard let data,
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
            out = obj
        }.resume()
        _ = sem.wait(timeout: .now() + 14)
        return out
    }
}
