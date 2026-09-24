import SwiftUI
import UniformTypeIdentifiers

/// Three-part Decider command bar: long bar window with add (left) + Send (inside right).
struct ClayComposerBar: View {
    @Binding var draft: String
    @Binding var attachments: [ClayAttachment]
    var placeholder: String = ""
    var focused: FocusState<Bool>.Binding
    var onSend: () -> Void
    var onAddFiles: () -> Void

    /// Longer bar — fills slate inner width with a little side air.
    private let barHeight: CGFloat = 64
    private var barWidth: CGFloat { ClayTheme.slateInnerWidth - 8 }
    private let plusSize: CGFloat = 36
    /// Send sits inside the bar; same height as the well, solid (never transparent).
    private var sendWidth: CGFloat { barHeight * (800.0 / 618.0) }

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

            // One long bar: plus inside left · text · Send inside right (solid)
            ZStack {
                if ClayImage.exists("BtnComposer") {
                    Image("BtnComposer")
                        .renderingMode(.original)
                        .resizable()
                        .interpolation(.high)
                        .frame(width: barWidth, height: barHeight)
                        .shadow(color: Color.black.opacity(0.35), radius: 5, y: 3)
                } else {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(ClayTheme.purpleClay)
                        .frame(width: barWidth, height: barHeight)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(ClayTheme.charcoalDeep)
                                .padding(8)
                        )
                }

                HStack(spacing: 6) {
                    Button(action: onAddFiles) {
                        Group {
                            if ClayImage.exists("BtnPlus") {
                                Image("BtnPlus")
                                    .renderingMode(.original)
                                    .resizable()
                                    .interpolation(.high)
                                    .aspectRatio(contentMode: .fit)
                            } else {
                                Image(systemName: "plus")
                                    .font(.system(size: 16, weight: .heavy))
                                    .foregroundStyle(ClayTheme.gold)
                            }
                        }
                        .frame(width: plusSize, height: plusSize)
                        .opacity(1) // HARDCODE: transparency 0
                        .compositingGroup()
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .focusEffectDisabled()
                    .help("Add files")
                    .padding(.leading, 14)

                    TextField("", text: $draft, axis: .vertical)
                        .textFieldStyle(.plain)
                        .font(ClayTheme.clayFont(size: 14, weight: .semibold))
                        .foregroundStyle(ClayTheme.offWhite)
                        .lineLimit(1...2)
                        .focused(focused)
                        .onSubmit { if canSend { onSend() } }

                    // Send flush to the RIGHT EDGE of the command bar (lined up with rim)
                    Button(action: { if canSend { onSend() } }) {
                        Group {
                            if ClayImage.exists("BtnSend") {
                                Image("BtnSend")
                                    .renderingMode(.original)
                                    .resizable()
                                    .interpolation(.high)
                                    .scaledToFit()
                            } else {
                                Text("Send")
                                    .font(ClayTheme.clayFont(size: 15, weight: .bold))
                                    .foregroundStyle(ClayTheme.offWhite)
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                    .background(
                                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                                            .fill(ClayTheme.purpleClay)
                                    )
                            }
                        }
                        .frame(width: sendWidth, height: barHeight)
                        .opacity(1) // HARDCODE: transparency 0 — never dim
                        .compositingGroup()
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .focusEffectDisabled()
                    .help("Send text and files")
                    // Do not .disabled — macOS dims disabled buttons (breaks solid clay).
                    .padding(.trailing, 0)
                }
                .frame(width: barWidth, height: barHeight)
            }
            .frame(width: barWidth, height: barHeight)
            .frame(maxWidth: .infinity)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 4)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Chat command")
    }
}

/// Chat search well — same BtnComposer clay as the command bar, shorter, sits beside search.
struct ClaySearchBar: View {
    @Binding var text: String
    var focused: FocusState<Bool>.Binding
    var onClose: () -> Void

    private let barHeight: CGFloat = 36
    #if os(iOS)
    private let barWidth: CGFloat = 220
    #else
    private let barWidth: CGFloat = 280
    #endif

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
