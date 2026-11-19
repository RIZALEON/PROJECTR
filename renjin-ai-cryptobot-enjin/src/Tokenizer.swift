// Tokenizer.swift — tok.v1, pure RZL
// Matches tokenizer.js byte-for-byte in ids.
// ids 0..255 = raw bytes · 256.. = SPECIALS in table order.
// Matching runs on UTF-8 bytes (longest special first);
// command tokens only match at a word start (start / space / tab / newline),
// and only as a whole command word (next byte must be a boundary or end).
// No external model, no external tokenizer, no other AI company's code.
// Pure RZL, from scratch, ground up.

import Foundation

public enum RZLTokenKind: String, Codable {
    case byte, glyph, command, action
}

public struct RZLSpecial: Codable, Equatable {
    public let id: Int
    public let kind: RZLTokenKind
    public let text: String
    public var bytes: [UInt8] { Array(text.utf8) }
}

public enum RZLTokenizerError: Error, Equatable {
    case unknownId(Int)
}

public struct RZLTokenizer {
    public static let version = "tok.v1"

    public static let glyphs: [String] = [
        "Я", "ЯID", "ЯVM", "ЯSEED", "ЯENJIN", "ЯMINT", "ЯACCESS",
        "ЯBOT", "ЯBOWZR", "ЯLAB", "ЯKLASSROOM", "ЯOS", "Я-"
    ]
    public static let commands: [String] = [
        "/rseed", "/rvm", "/eggs", "/update", "/help", "/home", "/bot", "/open", "/go",
        "/rseed loop", "/rseed confirm", "/rseed mint", "/rseed rid", "/rseed drill", "/rseed consent",
        "/rseed status", "/rseed chain", "/rseed grow", "/rseed train", "/rseed evolve", "/rseed tok", "/rseed mind",
        "/eggs install", "/eggs rollback", "/rvm run"
    ]
    public static let actions: [String] = [
        "<act:chain.verify>", "<act:chain.tail>", "<act:seed.status>", "<act:mind.recall>",
        "<act:rid.mint>", "<act:rid.verify>", "<act:mint.balance>", "<act:gcco.status>",
        "<act:access.read>", "<act:rvm.run>", "<act:fs.read>",
        "<say>", "</say>", "<quote>", "</quote>", "<heart>", "</heart>", "<law:ok>", "<law:block>"
    ]

    public let table: [RZLSpecial]
    public let size: Int
    private let byId: [Int: RZLSpecial]
    private let order: [RZLSpecial] // longest first, then lowest id

    public init(extra: [(text: String, kind: RZLTokenKind)] = []) {
        var t: [RZLSpecial] = []
        for g in Self.glyphs { t.append(RZLSpecial(id: 256 + t.count, kind: .glyph, text: g)) }
        for c in Self.commands { t.append(RZLSpecial(id: 256 + t.count, kind: .command, text: c)) }
        for a in Self.actions { t.append(RZLSpecial(id: 256 + t.count, kind: .action, text: a)) }
        for e in extra { t.append(RZLSpecial(id: 256 + t.count, kind: e.kind, text: e.text)) }
        self.table = t
        self.size = 256 + t.count
        var m: [Int: RZLSpecial] = [:]
        for e in t { m[e.id] = e }
        self.byId = m
        self.order = t.sorted { a, b in
            if a.bytes.count != b.bytes.count { return a.bytes.count > b.bytes.count }
            return a.id < b.id
        }
    }

    private static func isBoundary(_ bytes: [UInt8], _ i: Int) -> Bool {
        if i == 0 { return true }
        let p = bytes[i - 1]
        return p == 32 || p == 10 || p == 9 || p == 13
    }

    public func encodeBytes(_ bytes: [UInt8]) -> [Int] {
        var out: [Int] = []
        var i = 0
        let n = bytes.count
        outer: while i < n {
            for e in order {
                let L = e.bytes.count
                if L > n - i { continue }
                if e.kind == .command && !Self.isBoundary(bytes, i) { continue }
                var j = 0
                while j < L && bytes[i + j] == e.bytes[j] { j += 1 }
                if j == L {
                    if e.kind == .command && i + L < n {
                        let nx = bytes[i + L]
                        if !(nx == 32 || nx == 10 || nx == 9 || nx == 13) { continue }
                    }
                    out.append(e.id); i += L; continue outer
                }
            }
            out.append(Int(bytes[i])); i += 1
        }
        return out
    }

    public func encode(_ text: String) -> [Int] {
        encodeBytes(Array(text.utf8))
    }

    public func decodeBytes(_ ids: [Int]) throws -> [UInt8] {
        var out: [UInt8] = []
        for id in ids {
            if id < 256 { out.append(UInt8(id)) }
            else {
                guard let e = byId[id] else { throw RZLTokenizerError.unknownId(id) }
                out.append(contentsOf: e.bytes)
            }
        }
        return out
    }

    public func decode(_ ids: [Int]) throws -> String {
        String(decoding: try decodeBytes(ids), as: UTF8.self)
    }

    public func label(_ id: Int) -> String {
        if id < 256 { return "b\(id)" }
        return byId[id]?.text ?? "unknown:\(id)"
    }

    public func kinds(_ ids: [Int]) -> [RZLTokenKind: Int] {
        var c: [RZLTokenKind: Int] = [.byte: 0, .glyph: 0, .command: 0, .action: 0]
        for id in ids {
            let k: RZLTokenKind = id < 256 ? .byte : (byId[id]?.kind ?? .byte)
            c[k, default: 0] += 1
        }
        return c
    }

    public func vocabJSON() throws -> String {
        // Keep the JSON shape identical to tokenizer.js: {version, bytes, specials: [[id, kind, text], ...]}
        var parts: [String] = []
        for s in table {
            let esc = s.text.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"")
            parts.append("[\(s.id),\"\(s.kind.rawValue)\",\"\(esc)\"]")
        }
        return "{\"version\":\"\(Self.version)\",\"bytes\":256,\"specials\":[\(parts.joined(separator: ","))]}"
    }
}
