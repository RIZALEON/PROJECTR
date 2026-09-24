import Foundation

/// Three-language foundation for ЯOS + literacy of clay's own numbers, letters, digits.
enum YaCode {
    static let implementation = "Swift (clay macOS/iOS seat) — clear types, offline FileManager, write-code + self-fix teachable"

    static let decider = "Short orders · answer-first · NonNuclear · offline premier · bio root · no invented genotypes"

    static let yaCode = """
    Я CODE v0 primitives:
    establish · claim · cite · ping/pong · transfer · settle · attest · relink · evolve
    atoms: signature→slot | two-numbers | unique-object | bytes-owned
    vehicles: Я TOKEN / Я COIN (RFID-class tag)
    carriers: local · BLE · NFC · mesh · radio · hardline · (IP optional)
    """

    /// How clay's own letters, digits, and numbers work (CODE mind literacy).
    static let literacy = """
    GLYPH LITERACY (ЯBOT CODE OS)
    • Letter = Character in Unicode. Latin A–Z / a–z are scalars 65–90 / 97–122.
    • Digit = Character "0"…"9" (scalars 48–57). Digit ≠ number: digit is the glyph; number is the value.
    • Number = Integer / Double / Decimal value after parsing digits (Int("42") → 42).
    • Byte = UInt8 0…255. Mind size and heart.gguf count bytes, not "letters."
    • String = ordered Characters; utf8 / utf16 are encodings of those Characters.
    • Hex digit = 0–9 A–F (base 16). Clay traces and Machine DNA use hex often.
    • SoftEnglish lanes read letters as words; CODE lanes read digits as values + glyphs as syntax.
    • Self-fix writes Swift source (letters+digits+symbols) → Decider review → Terminal/Rebuild.
    """

    static let osAck = """
    I ACKNOWLEDGE MY CODE OS
    Seat: ЯBOT clay (CompanionRouter · NativeHeart · MindTree · TeachStore · PlaceSense · NearbyPlaces · YaCode · SelfFix)
    Tongue: Swift on Apple OS (\(ProcessInfo.processInfo.operatingSystemVersionString))
    Host: \(ProcessInfo.processInfo.hostName)
    CPUs: \(ProcessInfo.processInfo.processorCount)
    Law: NonNuclear — I write; Decider applies. Evolve never self-grants.
    Paths: write code: <brief> · self fix: <brief> · fix apply <name> · code os · digits
    """

    static let foundation = """
    THREE LANGUAGE FOUNDATION
    1 IMPLEMENTATION — \(implementation)
    2 DECIDER TONGUE — \(decider)
    3 Я CODE — new code for ЯOS (manual living cover; refine constantly)

    \(osAck)

    \(literacy)

    Teach path: write-code / self-fix → Decider review → fix apply / Terminal / Rebuild.
    App learns to write for others and itself only when you grant the apply step.
    """

    static func reply() -> String { foundation }

    static func digitsLesson() -> String {
        """
        DIGITS · LETTERS · NUMBERS
        digits:  \(String((0...9).map { Character(UnicodeScalar(48 + $0)!) }))
        upper:   \(String((0...25).map { Character(UnicodeScalar(65 + $0)!) }))
        lower:   \(String((0...25).map { Character(UnicodeScalar(97 + $0)!) }))
        demo: "42" (two digit glyphs) → Int → 42 (number) → 0x2A (hex letters+digits).
        Mind counts bytes; chat counts Characters; Heart reads tokens of both.
        \(literacy)
        """
    }
}
