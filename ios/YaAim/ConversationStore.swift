import Foundation

/// Gut conversations on disk. Offline. Not iCloud.
enum ConversationStore {
    static var url: URL {
        NativeVault.prepare()
        return NativeVault.gutURL.appendingPathComponent("conversations.json")
    }

    static func load() -> [[String: Any]] {
        guard let data = try? Data(contentsOf: url),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { return [] }
        return arr
    }

    static func append(role: String, text: String) {
        var rows = load()
        rows.append(["role": role, "text": text, "at": Date().timeIntervalSince1970])
        if let data = try? JSONSerialization.data(withJSONObject: rows, options: [.prettyPrinted]) {
            try? data.write(to: url, options: .atomic)
        }
    }
}
