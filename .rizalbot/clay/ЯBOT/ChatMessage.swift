import Foundation

/// How a turn should be read on the face and in Mind tape.
/// Work lanes (command / function / action) vs talk (conversation).
enum ChatLane: String, Codable, Equatable, CaseIterable {
    case command
    case function
    case action
    case conversation

    var chip: String {
        switch self {
        case .command: return "CMD"
        case .function: return "FN"
        case .action: return "ACT"
        case .conversation: return "TALK"
        }
    }

    var transcriptKindPrefix: String {
        rawValue
    }
}

struct ChatMessage: Identifiable, Equatable, Codable {
    enum Role: String, Equatable, Codable {
        case user
        case assistant
        case system
    }

    let id: UUID
    let role: Role
    let text: String
    let createdAt: Date
    /// Work vs talk. Missing in old jsonl → conversation.
    var lane: ChatLane

    init(
        id: UUID = UUID(),
        role: Role,
        text: String,
        createdAt: Date = Date(),
        lane: ChatLane = .conversation
    ) {
        self.id = id
        self.role = role
        self.text = text
        self.createdAt = createdAt
        self.lane = lane
    }

    enum CodingKeys: String, CodingKey {
        case id, role, text, createdAt, lane
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(UUID.self, forKey: .id)
        role = try c.decode(Role.self, forKey: .role)
        text = try c.decode(String.self, forKey: .text)
        createdAt = try c.decode(Date.self, forKey: .createdAt)
        lane = try c.decodeIfPresent(ChatLane.self, forKey: .lane) ?? .conversation
    }
}
