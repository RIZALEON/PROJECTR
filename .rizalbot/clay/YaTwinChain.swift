import Foundation

/// Hardcoded public Solana twin for crown **Я** — explorer-verified mainnet mirror.
/// Clay remains source. Pipes cite only. NonNuclear — no silent chain sends from this face.
/// Crown law: try Я first; R only by Decider order.
enum YaTwinChain {
    static let crownName = "Я"
    static let crownSymbol = "Я"
    static let asciiFallback = "R" // Decider-gated only
    static let cluster = "mainnet-beta"
    static let chain = "solana"
    static let decimals = 9
    static let supplyUI = "1000000"
    static let mint = "BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv"
    static let ownerATA = "8bCnr63CTdC2YbELK3x4vxJYNt6cueGBbEvRURFZc9Q1"
    static let mintAuthority = "BwpVNk1Rtncpv5HMTLwxB4Yfjkfv6mFaBQUTpjneH1F9"
    static let freezeAuthority = "BwpVNk1Rtncpv5HMTLwxB4Yfjkfv6mFaBQUTpjneH1F9"
    static let feePayer = "BwpVNk1Rtncpv5HMTLwxB4Yfjkfv6mFaBQUTpjneH1F9"
    static let metadataAccount = "Ci9V7hLbsGJPnrWTN5pvT5H5JPoi6EAiF1b2KVZwr5M9"
    static let mintSignature = "2Lxr2mEZnFnwwBMQjCgRt8EJLaJbwEp61K51mdx16z8oncWg2JCXzCKnisMi78V3L4w7w2pizQ8P1p2H5XMLvx94"
    static let metadataSignature = "2jRr6staQgpyAYDHRS5gasVu57j6qDaZ6VtPAYoCPq2eHUkf3d3zUNQ3FmNYdorqAWVzuVnNaFPwnrm3HkNiRe8H"
    static let slot: UInt64 = 448281123
    static let blockTimeUnix: Int = 1789787259
    static let status = "finalized"
    static let solscanToken = "https://solscan.io/token/BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv"
    static let solscanTx = "https://solscan.io/tx/2Lxr2mEZnFnwwBMQjCgRt8EJLaJbwEp61K51mdx16z8oncWg2JCXzCKnisMi78V3L4w7w2pizQ8P1p2H5XMLvx94"
    static let explorerTx = "https://explorer.solana.com/tx/2Lxr2mEZnFnwwBMQjCgRt8EJLaJbwEp61K51mdx16z8oncWg2JCXzCKnisMi78V3L4w7w2pizQ8P1p2H5XMLvx94"
    static let explorerAddress = "https://explorer.solana.com/address/BB9uA5BuacDnWyDf5Npc9nMb9yFbyThsNrQPBYJ5Q1Lv"
    static let law = "Crown Я. Try Я first; R only by Decider order. Explorers are mirrors — clay owns source."
    static let utilities = ["cite", "clear_clog", "tip_settle", "seat_twin", "evolve"]

    static var summaryLines: [(String, String)] {
        [
            ("Name", "\(crownName)  ·  symbol \(crownSymbol)"),
            ("Mint", mint),
            ("Cluster", cluster),
            ("Supply", "\(supplyUI) (decimals \(decimals))"),
            ("ATA", ownerATA),
            ("Mint authority", mintAuthority),
            ("Freeze authority", freezeAuthority),
            ("Mint tx", mintSignature),
            ("Slot", "\(slot)"),
            ("Status", status),
            ("Law", law),
            ("Utilities", utilities.joined(separator: " · ")),
        ]
    }
}
