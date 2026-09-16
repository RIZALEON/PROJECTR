import SwiftUI

struct ContentView: View {
    @State private var messages: [ChatMessage] = [
        ChatMessage(role: .assistant, text: "Here. Clay seat live · offline-first · claymation base."),
        ChatMessage(role: .system, text: "Laws seated: NonNuclear · teachings forever · dual tongue · BOLTE · mind loop.")
    ]
    @State private var draft: String = ""
    @State private var isOnline: Bool = false
    @State private var showJumpToLatest: Bool = false
    @State private var jumpToken: Int = 0
    @State private var showSearch: Bool = false
    @State private var searchText: String = ""
    @State private var mindPulse: Bool = false
    @FocusState private var composerFocused: Bool

    private let placeholder =
        "Type here · same as CoS — commands · ping · think … Ask anything"

    var body: some View {
        ZStack {
            ClayBackground()

            chatSlab
                .padding(.horizontal, 88)
                .padding(.vertical, 56)
                .frame(maxWidth: 780)

            chromeOverlays
        }
        .frame(minWidth: 760, minHeight: 560)
        .preferredColorScheme(.dark)
    }

    // MARK: - Central clay chat slab

    private var chatSlab: some View {
        VStack(spacing: 0) {
            headerBar
                .padding(.horizontal, 18)
                .padding(.top, 14)
                .padding(.bottom, 8)

            Rectangle()
                .fill(Color.white.opacity(0.07))
                .frame(height: 1)
                .padding(.horizontal, 12)

            messageList
                .padding(.horizontal, 14)
                .padding(.top, 10)

            if showSearch {
                searchBar
                    .padding(.horizontal, 14)
                    .padding(.bottom, 6)
            }

            composerRow
                .padding(.horizontal, 14)
                .padding(.top, 8)
                .padding(.bottom, 16)
        }
        .background(
            RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            ClayTheme.panelRaised.opacity(0.92),
                            ClayTheme.panel.opacity(0.94),
                            ClayTheme.charcoal.opacity(0.96)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous)
                        .stroke(
                            LinearGradient(
                                colors: [Color.white.opacity(0.14), ClayTheme.gold.opacity(0.25), Color.black.opacity(0.4)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1.5
                        )
                )
                .clayEmboss(raised: true)
        )
        .clipShape(RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous))
    }

    private var headerBar: some View {
        HStack(spacing: 10) {
            ClayAssetImage("Bolte", system: "bolt.circle.fill", size: 30)
                .clipShape(Circle())
                .shadow(color: ClayTheme.purple.opacity(0.5), radius: 8)

            VStack(alignment: .leading, spacing: 1) {
                Text("ЯBOT")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(ClayTheme.offWhite)
                Text(isOnline ? "clay · link bonus" : "clay · offline premier")
                    .font(.system(size: 10, weight: .semibold, design: .rounded))
                    .foregroundStyle(ClayTheme.muted)
            }

            Spacer()

            Button(action: {}) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(ClayTheme.offWhite.opacity(0.9))
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(ClayTheme.panel).clayEmboss())
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
                        ForEach(filteredMessages) { message in
                            bubble(for: message)
                                .id(message.id)
                        }
                        Color.clear.frame(height: 4).id("bottom-anchor")
                    }
                    .padding(.vertical, 8)
                }
                .onAppear { scrollToBottom(proxy: proxy, animated: false) }
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
                Button { jumpToken += 1 } label: {
                    ZStack {
                        Circle()
                            .fill(ClayTheme.purple)
                            .frame(width: 40, height: 40)
                            .overlay(Circle().stroke(ClayTheme.gold, lineWidth: 2))
                            .clayEmboss()
                        ClayAssetImage("ArrowDown", system: "chevron.down", size: 18)
                    }
                }
                .buttonStyle(.plain)
                .padding(8)
            }
        }
        .frame(maxHeight: .infinity)
    }

    private var filteredMessages: [ChatMessage] {
        let q = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard showSearch, !q.isEmpty else { return messages }
        return messages.filter { $0.text.localizedCaseInsensitiveContains(q) }
    }

    private func bubble(for message: ChatMessage) -> some View {
        let isUser = message.role == .user
        let isSystem = message.role == .system
        return HStack {
            if isUser { Spacer(minLength: 48) }
            Text(message.text)
                .font(.system(size: isSystem ? 12 : 14, weight: isSystem ? .regular : .medium, design: .rounded))
                .foregroundStyle(
                    isUser ? Color.black.opacity(0.88)
                        : isSystem ? ClayTheme.gold.opacity(0.9)
                        : ClayTheme.offWhite.opacity(0.92)
                )
                .padding(.horizontal, 14)
                .padding(.vertical, isSystem ? 8 : 11)
                .background(
                    RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous)
                        .fill(
                            isUser ? ClayTheme.bubbleUser
                                : isSystem ? ClayTheme.purpleDeep.opacity(0.55)
                                : ClayTheme.bubbleAssistant
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous)
                                .stroke(isSystem ? ClayTheme.gold.opacity(0.35) : Color.clear, lineWidth: 1)
                        )
                        .clayEmboss(raised: true)
                )
            if !isUser { Spacer(minLength: 48) }
        }
    }

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(ClayTheme.gold)
            TextField("Search clay transcript", text: $searchText)
                .textFieldStyle(.plain)
                .foregroundStyle(ClayTheme.offWhite)
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(ClayTheme.charcoalDeep)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(ClayTheme.gold.opacity(0.45), lineWidth: 1.5)
                )
                .clayEmboss(raised: false)
        )
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
                                .stroke(ClayTheme.gold, lineWidth: 2)
                        )
                        .clayEmboss()
                    ClayAssetImage("PlusAttach", system: "plus", size: 18)
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
                                .clayEmboss()
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
                    .clayEmboss()
            )
            .frame(minHeight: 48)
        }
    }

    // MARK: - Clay chrome (visual contract: wall mock)

    private var chromeOverlays: some View {
        VStack {
            HStack(alignment: .top, spacing: 12) {
                topLeftChrome
                Spacer()
                topRightChrome
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            Spacer()
        }
    }

    private var topLeftChrome: some View {
        HStack(alignment: .center, spacing: 12) {
            ClayAssetImage("Bolte", system: "bolt.heart.fill", size: 58)
                .frame(width: ClayTheme.chromeSize, height: ClayTheme.chromeSize)
                .shadow(color: ClayTheme.orangeBolt.opacity(0.45), radius: 12, y: 4)
                .help("BOLTE — first RZL Being")

            Button {
                showSearch.toggle()
                if !showSearch { searchText = "" }
            } label: {
                ClayAssetImage("SearchGlass", system: "magnifyingglass", size: 36)
                    .frame(width: 48, height: 48)
                    .shadow(color: ClayTheme.gold.opacity(0.35), radius: 8)
            }
            .buttonStyle(.plain)
            .help("Search transcript")
        }
    }

    private var topRightChrome: some View {
        HStack(alignment: .center, spacing: 12) {
            Button {
                isOnline.toggle()
                messages.append(
                    ChatMessage(
                        role: .system,
                        text: CompanionRouter.reply(to: "mode", isOnline: isOnline)
                    )
                )
            } label: {
                Group {
                    if ClayImage.exists("ToggleLink") {
                        ClayAssetImage("ToggleLink", system: "switch.2", size: 52)
                            .frame(width: 120, height: 52)
                    } else {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(isOnline ? ClayTheme.onlineGreen : ClayTheme.offlineRed)
                                .frame(width: 10, height: 10)
                            Text(isOnline ? "ONLINE" : "OFFLINE")
                                .font(.system(size: 11, weight: .heavy, design: .rounded))
                                .foregroundStyle(.white)
                            ClayAssetImage(
                                isOnline ? "ToggleOnline" : "ToggleOffline",
                                system: isOnline ? "network" : "network.slash",
                                size: 22
                            )
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(ClayTheme.purpleClay)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                                        .stroke(ClayTheme.gold, lineWidth: 2.5)
                                )
                                .clayEmboss()
                        )
                    }
                }
            }
            .buttonStyle(.plain)
            .help("Online / offline link")
            .opacity(isOnline ? 1 : 0.92)

            Button {
                mindPulse.toggle()
                messages.append(
                    ChatMessage(role: .assistant, text: CompanionRouter.reply(to: "mind", isOnline: isOnline))
                )
            } label: {
                ClayAssetImage("MachineMind", system: "brain.head.profile", size: 52)
                    .frame(width: ClayTheme.chromeSize, height: ClayTheme.chromeSize)
                    .shadow(color: ClayTheme.gold.opacity(mindPulse ? 0.55 : 0.25), radius: mindPulse ? 14 : 8)
            }
            .buttonStyle(.plain)
            .help("Machine mind — mind loop")
        }
    }

    // MARK: - Send

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        messages.append(ChatMessage(role: .user, text: text))
        draft = ""
        let answer = CompanionRouter.reply(to: text, isOnline: isOnline)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) {
            messages.append(ChatMessage(role: .assistant, text: answer))
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

#Preview {
    ContentView()
        .frame(width: 980, height: 720)
}
