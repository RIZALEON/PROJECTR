import Foundation

/// BOT LABELS seat — U (biological) · Я (clay, never numbered) · guests ЯBOT#N / named.
/// Durable: Documents/ЯBOT/seat/BOT-LABELS.json (+ App Support mirror). Schema BotLabels.v2.
enum BotLabel {
    private static let schema = "BotLabels.v2"
    private static let clay = "Я"

    private struct Store: Codable {
        var schema: String
        var claySeatLabel: String
        var bots: [String: String] // label → kind ("created"|"guest")
        var currentGuestLabel: String?
        var nextCreatedSerial: Int
        var updatedAt: String
    }

    private static var documentsURL: URL {
        URL(fileURLWithPath: NSHomeDirectory())
            .appendingPathComponent("Documents/ЯBOT/seat/BOT-LABELS.json")
    }

    private static var supportURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support")
        return base.appendingPathComponent("ЯBOT/seat/BOT-LABELS.json")
    }

    private static func load() -> Store {
        for url in [documentsURL, supportURL] {
            if let data = try? Data(contentsOf: url),
               let s = try? JSONDecoder().decode(Store.self, from: data) {
                return s
            }
        }
        return Store(
            schema: schema,
            claySeatLabel: clay,
            bots: [:],
            currentGuestLabel: nil,
            nextCreatedSerial: 1,
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )
    }

    private static func save(_ store: inout Store) {
        store.schema = schema
        store.claySeatLabel = clay
        store.updatedAt = ISO8601DateFormatter().string(from: Date())
        guard let data = try? JSONEncoder().encode(store) else { return }
        for url in [documentsURL, supportURL] {
            try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
            try? data.write(to: url, options: .atomic)
        }
    }

    static func activeAssistantLabel() -> String {
        let s = load()
        if let g = s.currentGuestLabel, !g.isEmpty { return g }
        return clay
    }

    static func whoStatus() -> String {
        let s = load()
        let guest = s.currentGuestLabel ?? "(none)"
        let registry: String
        if s.bots.isEmpty {
            registry = "(empty)"
        } else {
            registry = s.bots.keys.sorted().joined(separator: ", ")
        }
        return """
        BOT LABELS · triangle
        U = biological source
        Я = clay seat (immutable · not numbered)
        active guest = \(guest)
        registry = \(registry)
        next created = ЯBOT#\(s.nextCreatedSerial)
        store = \(documentsURL.path)
        """
    }

    static func leave() -> String {
        var s = load()
        let was = s.currentGuestLabel ?? "(none)"
        s.currentGuestLabel = nil
        save(&s)
        return "bot leave ok · was \(was) · assistant stamps = Я"
    }

    static func mint(optionalName: String?) -> String {
        var s = load()
        let label: String
        if let raw = optionalName?.trimmingCharacters(in: .whitespacesAndNewlines), !raw.isEmpty {
            if raw == clay || raw.uppercased() == "U" {
                return "bot mint REFUSE — cannot take U or Я"
            }
            if s.bots[raw] != nil || s.currentGuestLabel == raw {
                return "bot mint REFUSE — label '\(raw)' already seated (distinct labels mandatory)"
            }
            label = raw
            s.bots[label] = "created"
        } else {
            label = "ЯBOT#\(s.nextCreatedSerial)"
            s.nextCreatedSerial += 1
            s.bots[label] = "created"
        }
        s.currentGuestLabel = label
        save(&s)
        return "bot mint ok · entered \(label) · next ЯBOT#\(s.nextCreatedSerial)"
    }

    static func enter(_ name: String) -> String {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return mint(optionalName: nil)
        }
        if trimmed == clay || trimmed.uppercased() == "U" {
            return "bot enter REFUSE — clay is Я forever; U is biological"
        }
        var s = load()
        if let cur = s.currentGuestLabel, cur == trimmed {
            return "bot enter ok · already \(trimmed)"
        }
        // Duplicates of another active identity refused only if conflicting with clay/U; registry may re-enter.
        s.bots[trimmed] = s.bots[trimmed] ?? "guest"
        s.currentGuestLabel = trimmed
        save(&s)
        return "bot enter ok · \(trimmed) · assistant stamps = \(trimmed)"
    }
}
