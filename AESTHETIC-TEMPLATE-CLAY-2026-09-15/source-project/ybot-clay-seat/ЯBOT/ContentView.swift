import SwiftUI
#if canImport(AppKit)
import AppKit
#endif

struct ContentView: View {
    @State private var messages: [ChatMessage] = [
        ChatMessage(role: .assistant, text: "Here. Clay seat live · offline-first."),
        ChatMessage(role: .user, text: "ping")
    ]
    @State private var draft: String = ""
    @State private var isOnline: Bool = true
    @State private var showJumpToLatest: Bool = false
    @State private var jumpToken: Int = 0
    @FocusState private var composerFocused: Bool

    private let placeholder =
        "Type here · same as CoS — commands · ping · think … Ask anything"

    var body: some View {
        ZStack {
            ClayBackground()

            chatSlab
                .padding(.horizontal, 72)
                .padding(.vertical, 48)
                .frame(maxWidth: 760)

            chromeOverlays
        }
        .frame(minWidth: 720, minHeight: 520)
    }

    // MARK: - Central slab

    private var chatSlab: some View {
        VStack(spacing: 0) {
            headerBar
                .padding(.horizontal, 18)
                .padding(.top, 14)
                .padding(.bottom, 8)

            Divider()
                .overlay(Color.white.opacity(0.08))
                .padding(.horizontal, 12)

            messageList
                .padding(.horizontal, 14)
                .padding(.top, 10)

            composerRow
                .padding(.horizontal, 14)
                .padding(.top, 8)
                .padding(.bottom, 16)
        }
        .background(
            RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [ClayTheme.panelRaised, ClayTheme.panel, ClayTheme.charcoal],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )
                .clayEmboss(radius: ClayTheme.panelRadius, raised: true)
        )
        .clipShape(RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous))
    }

    private var headerBar: some View {
        HStack(spacing: 10) {
            ClayAssetImage("Bolte", system: "bolt.circle.fill", size: 28)
                .clipShape(Circle())
                .shadow(color: ClayTheme.purple.opacity(0.45), radius: 6)

            Text("ЯBOT")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(ClayTheme.offWhite)

            Spacer()

            Button(action: {}) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(ClayTheme.offWhite.opacity(0.9))
                    .frame(width: 32, height: 32)
            }
            .buttonStyle(.plain)
            .help("Share")
        }
    }

    private var messageList: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(messages) { message in
                            bubble(for: message)
                                .id(message.id)
                        }
                        Color.clear.frame(height: 4).id("bottom-anchor")
                    }
                    .padding(.vertical, 8)
                }
                .onAppear {
                    scrollToBottom(proxy: proxy, animated: false)
                }
                .onChange(of: messages.count) { _ in
                    scrollToBottom(proxy: proxy, animated: true)
                    showJumpToLatest = false
                }
                .onChange(of: jumpToken) { _ in
                    scrollToBottom(proxy: proxy, animated: true)
                    showJumpToLatest = false
                }
                .simultaneousGesture(
                    DragGesture().onChanged { _ in
                        if messages.count > 3 { showJumpToLatest = true }
                    }
                )
            }

            if showJumpToLatest {
                Button {
                    jumpToken += 1
                } label: {
                    ZStack {
                        Circle()
                            .fill(ClayTheme.purple)
                            .frame(width: 40, height: 40)
                            .overlay(Circle().stroke(ClayTheme.orangeRim, lineWidth: 2))
                            .clayEmboss(radius: 20)
                        ClayAssetImage("ArrowDown", system: "chevron.down", size: 18)
                            .foregroundStyle(.white)
                    }
                }
                .buttonStyle(.plain)
                .padding(.trailing, 8)
                .padding(.bottom, 8)
            }
        }
        .frame(maxHeight: .infinity)
    }

    private func bubble(for message: ChatMessage) -> some View {
        let isUser = message.role == .user
        return HStack {
            if isUser { Spacer(minLength: 48) }
            Text(message.text)
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .foregroundStyle(isUser ? Color.black.opacity(0.88) : ClayTheme.offWhite.opacity(0.92))
                .padding(.horizontal, 14)
                .padding(.vertical, 11)
                .background(
                    RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous)
                        .fill(isUser ? ClayTheme.bubbleUser : ClayTheme.bubbleAssistant)
                        .clayEmboss(radius: ClayTheme.bubbleRadius, raised: true)
                )
            if !isUser { Spacer(minLength: 48) }
        }
    }

    private var composerRow: some View {
        HStack(alignment: .center, spacing: 10) {
            Button(action: {}) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(ClayTheme.purple)
                        .frame(width: 40, height: 40)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(ClayTheme.orangeRim, lineWidth: 2)
                        )
                        .clayEmboss(radius: 14)
                    ClayAssetImage("PlusAttach", system: "plus", size: 18)
                        .foregroundStyle(.white)
                        .fontWeight(.bold)
                }
            }
            .buttonStyle(.plain)
            .help("Attach")

            HStack(spacing: 10) {
                TextField(placeholder, text: $draft, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundStyle(ClayTheme.offWhite)
                    .lineLimit(1...4)
                    .focused($composerFocused)
                    .padding(.leading, 14)
                    .padding(.vertical, 10)
                    .onSubmit(send)

                Button(action: send) {
                    Text("Send")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundStyle(ClayTheme.purpleDeep)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(ClayTheme.bubbleUser)
                                .clayEmboss(radius: 16)
                        )
                }
                .buttonStyle(.plain)
                .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .opacity(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.55 : 1)
                .padding(.trailing, 8)
            }
            .background(
                Capsule()
                    .fill(ClayTheme.charcoalDeep)
                    .overlay(
                        Capsule()
                            .stroke(ClayTheme.purple, lineWidth: 5)
                    )
                    .clayEmboss(radius: 22)
            )
            .frame(minHeight: 48)
        }
    }

    // MARK: - Overlay chrome

    private var chromeOverlays: some View {
        VStack {
            HStack(alignment: .top) {
                topLeftChrome
                Spacer()
                topRightChrome
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            Spacer()
        }
    }

    private var topLeftChrome: some View {
        HStack(spacing: 10) {
            ClayAssetImage("Bolte", system: "bolt.heart.fill", size: 52)
                .frame(width: ClayTheme.chromeSize, height: ClayTheme.chromeSize)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: ClayTheme.purple.opacity(0.5), radius: 10)

            Button(action: {}) {
                ClayAssetImage("SearchGlass", system: "magnifyingglass", size: 28)
                    .frame(width: 44, height: 44)
                    .background(
                        Circle()
                            .fill(ClayTheme.panel)
                            .clayEmboss(radius: 22)
                    )
            }
            .buttonStyle(.plain)
            .help("Search")
        }
    }

    private var topRightChrome: some View {
        HStack(spacing: 10) {
            Button {
                isOnline.toggle()
            } label: {
                HStack(spacing: 8) {
                    Circle()
                        .fill(isOnline ? ClayTheme.onlineGreen : Color.gray)
                        .frame(width: 8, height: 8)
                        .shadow(color: isOnline ? ClayTheme.onlineGreen.opacity(0.8) : .clear, radius: 4)
                    Text(isOnline ? "ONLINE" : "OFFLINE")
                        .font(.system(size: 10, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                    ClayAssetImage(
                        isOnline ? "ToggleOnline" : "ToggleOffline",
                        system: isOnline ? "link" : "link",
                        size: 22
                    )
                    .frame(width: 28, height: 28)
                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(ClayTheme.purple)
                        .clayEmboss(radius: 14)
                )
            }
            .buttonStyle(.plain)
            .help("Link / online toggle")

            Button(action: {}) {
                ClayAssetImage("MachineMind", system: "brain.head.profile", size: 48)
                    .frame(width: ClayTheme.chromeSize, height: ClayTheme.chromeSize)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(ClayTheme.purple.opacity(0.7), lineWidth: 2)
                    )
                    .clayEmboss(radius: 14)
            }
            .buttonStyle(.plain)
            .help("Machine mind")
        }
    }

    // MARK: - Chat logic

    private func send() {
        let trimmed = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        messages.append(ChatMessage(role: .user, text: trimmed))
        draft = ""

        let reply = (trimmed.lowercased() == "ping") ? "here" : "Here. Clay seat live."
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) {
            messages.append(ChatMessage(role: .assistant, text: reply))
        }
    }

    private func scrollToBottom(proxy: ScrollViewProxy, animated: Bool) {
        if animated {
            withAnimation(.easeOut(duration: 0.25)) {
                proxy.scrollTo("bottom-anchor", anchor: .bottom)
            }
        } else {
            proxy.scrollTo("bottom-anchor", anchor: .bottom)
        }
    }
}

/// Asset image with SF Symbol fallback when imageset is missing.
struct ClayAssetImage: View {
    let name: String
    let system: String
    let size: CGFloat

    init(_ name: String, system: String, size: CGFloat) {
        self.name = name
        self.system = system
        self.size = size
    }

    private var hasAsset: Bool {
        #if canImport(AppKit)
        return NSImage(named: name) != nil
        #else
        return false
        #endif
    }

    var body: some View {
        Group {
            if hasAsset {
                Image(name)
                    .resizable()
                    .interpolation(.high)
                    .scaledToFit()
            } else {
                Image(systemName: system)
                    .resizable()
                    .scaledToFit()
                    .foregroundStyle(ClayTheme.purple)
            }
        }
        .frame(width: size, height: size)
    }
}

#Preview {
    ContentView()
}
