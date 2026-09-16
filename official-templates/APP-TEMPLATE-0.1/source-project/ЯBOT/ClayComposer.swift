import SwiftUI
import UniformTypeIdentifiers

/// Unified clay composer from Decider mock: + adds files, Send ships text + files.
struct ClayComposerBar: View {
    @Binding var draft: String
    @Binding var attachments: [ClayAttachment]
    var placeholder: String
    var focused: FocusState<Bool>.Binding
    var onSend: () -> Void
    var onAddFiles: () -> Void

    var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !attachments.isEmpty
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if !attachments.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(attachments) { item in
                            HStack(spacing: 6) {
                                Image(systemName: "doc.fill")
                                    .font(.system(size: 11, weight: .bold))
                                Text(item.name)
                                    .font(ClayTheme.clayFont(size: 11, weight: .bold))
                                    .lineLimit(1)
                                Button {
                                    attachments.removeAll { $0.id == item.id }
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 12))
                                }
                                .buttonStyle(.plain)
                            }
                            .foregroundStyle(ClayTheme.offWhite)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(ClayTheme.purpleDeep.opacity(0.85))
                                    .overlay(Capsule().stroke(ClayTheme.gold.opacity(0.4), lineWidth: 1))
                                    .clayEmboss()
                            )
                        }
                    }
                }
            }

            HStack(spacing: 0) {
                // + add files (left, inside clay frame)
                Button(action: onAddFiles) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(ClayTheme.purple)
                            .frame(width: 28, height: 28)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(ClayTheme.orangeBolt, lineWidth: 2)
                            )
                            .clayEmboss()
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .heavy))
                            .foregroundStyle(.white)
                    }
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .help("Add files")
                .padding(.leading, 10)

                TextField(placeholder, text: $draft, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(ClayTheme.clayFont(size: 14, weight: .semibold))
                    .foregroundStyle(ClayTheme.offWhite)
                    .lineLimit(1...4)
                    .focused(focused)
                    .padding(.vertical, 12)
                    .padding(.trailing, 8)
                    .onSubmit(onSend)

                Button(action: onSend) {
                    Text("Send")
                        .clayText(size: 14, weight: .heavy, color: .white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 9)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [ClayTheme.purple, ClayTheme.purpleDeep],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                                )
                                .clayEmboss()
                        )
                }
                .buttonStyle(.plain)
                .disabled(!canSend)
                .opacity(canSend ? 1 : 0.5)
                .help("Send text and files")
                .padding(.trailing, 10)
            }
            .frame(minHeight: 56)
            .background(composerClayFrame)
        }
    }

    private var composerClayFrame: some View {
        ZStack {
            if ClayImage.exists("BtnComposer") {
                Image("BtnComposer")
                    .resizable()
                    .interpolation(.high)
                    .scaledToFill()
                    .clipped()
                    .opacity(0.92)
            }
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(ClayTheme.purpleClay.opacity(ClayImage.exists("BtnComposer") ? 0.35 : 1))
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(ClayTheme.purple, lineWidth: 5)
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(ClayTheme.charcoalDeep.opacity(0.94))
                .padding(8)
            ClayNoiseOverlay(opacity: 0.22)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        }
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .clayEmboss()
    }
}

struct ClayAttachment: Identifiable, Equatable {
    let id: UUID
    let name: String
    let url: URL

    init(id: UUID = UUID(), name: String, url: URL) {
        self.id = id
        self.name = name
        self.url = url
    }
}
