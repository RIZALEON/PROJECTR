import SwiftUI
import UniformTypeIdentifiers

/// Clay text chat command bar — purple molded well, dark field only (no plus/Send in art).
struct ClayComposerBar: View {
    @Binding var draft: String
    @Binding var attachments: [ClayAttachment]
    var placeholder: String = ""
    var focused: FocusState<Bool>.Binding
    var onSend: () -> Void
    var onAddFiles: () -> Void

    /// Short clay field — natural aspect of Decider text-window art (~9.7:1).
    private let barHeight: CGFloat = 52
    private let barWidth: CGFloat = 580 // Decider: a bit longer

    var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !attachments.isEmpty
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !attachments.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(attachments) { item in
                            Text(item.name)
                                .font(ClayTheme.clayFont(size: 11, weight: .bold))
                                .foregroundStyle(ClayTheme.offWhite)
                                .lineLimit(1)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .onTapGesture { attachments.removeAll { $0.id == item.id } }
                        }
                    }
                }
            }

            ZStack {
                Image("BtnComposer")
                    .renderingMode(.original)
                    .resizable()
                    .interpolation(.high)
                    .frame(width: barWidth, height: barHeight)
                    .shadow(color: Color.black.opacity(0.3), radius: 4, y: 2)

                TextField("", text: $draft, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(ClayTheme.clayFont(size: 14, weight: .semibold))
                    .foregroundStyle(ClayTheme.offWhite)
                    .lineLimit(1...2)
                    .focused(focused)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 8)
                    .frame(width: barWidth, height: barHeight)
                    .background(Color.clear)
                    .onSubmit { if canSend { onSend() } }
            }
            .frame(width: barWidth, height: barHeight)
            .frame(maxWidth: .infinity) // center
            .accessibilityElement(children: .contain)
            .accessibilityLabel("Chat command")
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 24)
    }
}

/// Chat search well — same BtnComposer clay as the command bar, shorter, sits beside search.
struct ClaySearchBar: View {
    @Binding var text: String
    var focused: FocusState<Bool>.Binding
    var onClose: () -> Void

    private let barHeight: CGFloat = 36
    private let barWidth: CGFloat = 340

    var body: some View {
        ZStack {
            Image("BtnComposer")
                .renderingMode(.original)
                .resizable()
                .interpolation(.high)
                .frame(width: barWidth, height: barHeight)
                .shadow(color: Color.black.opacity(0.3), radius: 4, y: 2)

            TextField("", text: $text)
                .textFieldStyle(.plain)
                .font(ClayTheme.clayFont(size: 13, weight: .semibold))
                .foregroundStyle(ClayTheme.offWhite)
                .focused(focused)
                .padding(.horizontal, 18)
                .padding(.vertical, 6)
                .frame(width: barWidth, height: barHeight)
                .background(Color.clear)
                .onSubmit { /* live filter — keep open */ }
        }
        .frame(width: barWidth, height: barHeight)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Search chat")
        .help("Search chat for words and phrases")
    }
}

struct ClayAttachment: Identifiable, Equatable {
    let id: UUID
    let name: String
    let url: URL
    init(id: UUID = UUID(), name: String, url: URL) {
        self.id = id; self.name = name; self.url = url
    }
}
