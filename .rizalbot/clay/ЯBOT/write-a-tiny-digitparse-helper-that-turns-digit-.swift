import Foundation
/// SELF-FIX starter for: write a tiny DigitParse helper that turns digit glyphs into Int
/// Law: Decider applies; clay only proposes.
enum DigitNumberLab {
    /// Glyph digits → number value (literacy demo).
    static func parseDigits(_ glyphs: String) -> Int? {
        Int(glyphs.filter({ $0.isNumber }))
    }
    static func describe(_ glyphs: String) -> String {
        let n = parseDigits(glyphs)
        return "glyphs=\(glyphs) digits-only=\(glyphs.filter({ $0.isNumber })) number=\(n.map(String.init) ?? "nil")"
    }
}