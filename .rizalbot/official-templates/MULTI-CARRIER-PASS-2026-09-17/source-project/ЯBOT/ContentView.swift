import SwiftUI
import UniformTypeIdentifiers

struct ContentView: View {
    @State private var messages: [ChatMessage] = []
    @State private var draft: String = ""
    @ObservedObject private var mode = ModeStore.shared
    private var isOnline: Bool { mode.isOnline }
    @State private var showJumpToLatest: Bool = false
    @State private var jumpToken: Int = 0
    @State private var showSearch: Bool = false
    @State private var searchText: String = ""
    @State private var mindPulse: Bool = false
    @State private var showClayLanding: Bool = false
    @State private var clayLandingTitle: String = ""
    @State private var attachments: [ClayAttachment] = []
    @State private var showFilePicker: Bool = false
    @FocusState private var composerFocused: Bool
    @FocusState private var searchFocused: Bool

    private let placeholder = ""

    var body: some View {
        ZStack {
            ClayBackground()

            // Slate: full height to the very top, on chalkboard, under chat + chrome.
            ClaySlatePlate()
                .opacity(showClayLanding ? 0 : 1)
                .allowsHitTesting(!showClayLanding)

            // Chat lives on/within the slate column (centered, width ≤ slate).
            openClaySeat
                .frame(maxWidth: ClayTheme.slateInnerWidth)
                .frame(maxWidth: .infinity)
                .padding(.top, 56) // clear top chrome; slate itself still runs to the top
                .padding(.bottom, 12)
                .opacity(showClayLanding ? 0 : 1)
                .allowsHitTesting(!showClayLanding)

            chromeOverlays
                .opacity(showClayLanding ? 0 : 1)
                .allowsHitTesting(!showClayLanding)

            if showClayLanding {
                ClayLandingView(isPresented: $showClayLanding, title: clayLandingTitle)
                    .transition(.opacity)
                    .zIndex(50)
            }
        }
        #if os(macOS)
        .frame(minWidth: 640, minHeight: 480)
        #endif
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .preferredColorScheme(.dark)
        .onAppear { ClayCommandInbox.start() }
        .onReceive(NotificationCenter.default.publisher(for: ClayCommandInbox.notificationName)) { note in
            if let t = note.userInfo?["text"] as? String {
                injectSend(t)
            }
        }
        .onOpenURL { url in
            handleOpenURL(url)
        }
        .animation(.easeInOut(duration: 0.18), value: showClayLanding)
        .onAppear {
            // Off main thread — ledger I/O must never block UI restore / inbox timers.
            DispatchQueue.global(qos: .utility).async {
                _ = YaToken.ensureGenesisMinted()
                if let src = ManualPDFLocator.resolveSeatedPDF() {
                    ManualPDFLocator.seedMachineMind(from: src)
                }
            }
        }
        .fileImporter(
            isPresented: $showFilePicker,
            allowedContentTypes: [.item, .image, .pdf, .text, .data, .audio, .movie],
            allowsMultipleSelection: true
        ) { result in
            switch result {
            case .success(let urls):
                for url in urls {
                    let accessed = url.startAccessingSecurityScopedResource()
                    defer { if accessed { url.stopAccessingSecurityScopedResource() } }
                    if !attachments.contains(where: { $0.url == url }) {
                        attachments.append(ClayAttachment(name: url.lastPathComponent, url: url))
                    }
                }
                if !urls.isEmpty {
                    messages.append(ChatMessage(
                        role: .system,
                        text: "Added \(urls.count) file(s): " + urls.map(\.lastPathComponent).joined(separator: ", ")
                    ))
                }
            case .failure(let error):
                messages.append(ChatMessage(role: .system, text: "Could not add files: \(error.localizedDescription)"))
            }
        }
    }

    // MARK: - Open clay seat (no center window)

    private var openClaySeat: some View {
        VStack(spacing: 0) {
            messageList
                .padding(.top, 8)
                .padding(.horizontal, ClayTheme.slateContentInset)
            if showSearch, !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Text(searchHitLabel)
                    .font(ClayTheme.clayFont(size: 11, weight: .bold))
                    .foregroundStyle(ClayTheme.gold)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, ClayTheme.slateContentInset)
                    .padding(.bottom, 6)
            }
            composerRow
                .padding(.horizontal, 4)
                .padding(.bottom, 14)
                .frame(maxWidth: .infinity)
        }
        .frame(maxWidth: ClayTheme.slateInnerWidth)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var searchHitLabel: String {
        let n = filteredMessages.count
        let q = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        if n == 0 { return "No matches for “\(q)”" }
        return n == 1 ? "1 match" : "\(n) matches"
    }



    private var messageList: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: ClayTheme.bubbleClearGap) {
                        ForEach(Array(filteredMessages.enumerated()), id: \.element.id) { index, message in
                            bubble(for: message, index: index)
                                .id(message.id)
                        }
                        Color.clear.frame(height: 4).id("bottom-anchor")
                    }
                    .padding(.vertical, 10)
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
                // Show clay ↓ when scrolled away from latest; hide at bottom.
                .onScrollGeometryChange(for: CGFloat.self) { geo in
                    let contentH = geo.contentSize.height
                    let viewH = geo.containerSize.height
                    if contentH <= viewH + 8 { return 0 }
                    return contentH - (geo.contentOffset.y + viewH)
                } action: { _, distanceFromBottom in
                    let atBottom = distanceFromBottom <= 56
                    let shouldShow = !atBottom && messages.count > 1
                    if showJumpToLatest != shouldShow {
                        showJumpToLatest = shouldShow
                    }
                }
            }

            if showJumpToLatest {
                ClayButton(
                    asset: ClayImage.exists("ArrowDown") ? "ArrowDown" : "BtnArrowDown",
                    systemFallback: "arrow.down.circle.fill",
                    width: 52,
                    height: 52,
                    help: "Jump to latest"
                ) {
                    jumpToken += 1
                }
                .padding(.trailing, 8)
                .padding(.bottom, 10)
                .transition(.scale(scale: 0.85).combined(with: .opacity))
                .zIndex(6)
            }
        }
        .animation(.easeInOut(duration: 0.18), value: showJumpToLatest)
        .frame(maxHeight: .infinity)
    }

    private var filteredMessages: [ChatMessage] {
        let q = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard showSearch, !q.isEmpty else { return messages }
        return messages.filter { $0.text.localizedCaseInsensitiveContains(q) }
    }

    private func bubble(for message: ChatMessage, index: Int = 0) -> some View {
        let isUser = message.role == .user
        let isSystem = message.role == .system
        let kind = ClayBubbleMetrics.kind(for: message.text, isSystem: isSystem)
        // HARDCODE: rectangular tablets only (4 rounded corners) — never pointed bar shells.
        let bubbleName: String = {
            if isUser {
                if ClayImage.exists("BubbleShellPurple") { return "BubbleShellPurple" }
                if ClayImage.exists("TabletPurple") { return "TabletPurple" }
                return "BubbleUser"
            }
            // Companion/system: gray rectangular plate (cycle soft variants that stay rectangular)
            let rectPack = [
                "BubbleShellGray", "BubbleShellPurple",
                "TabletGraySlab", "TabletGray", "TabletSlate", "BubbleAssistant"
            ]
            let existing = rectPack.filter { ClayImage.exists($0) }
            guard !existing.isEmpty else { return "BubbleAssistant" }
            return existing[index % existing.count]
        }()
        let maxW = min(
            isUser ? ClayTheme.tabletUserMaxWidth : ClayTheme.tabletAssistantMaxWidth,
            ClayTheme.slateInnerWidth - 8
        )
        let fontSize = ClayBubbleMetrics.fontSize(kind: kind, isSystem: isSystem)

        // Stamped clay type — highlight top-left + shade bottom-right (ref aesthetic).
        let stamped = Text(message.text.uppercased())
            .font(isSystem ? ClayTheme.clayGoldFont(size: fontSize) : ClayTheme.clayFont(size: fontSize))
            .tracking(ClayBubbleMetrics.tracking)
            .lineSpacing(ClayBubbleMetrics.lineSpacing(kind))
            .multilineTextAlignment(.leading)
            .lineLimit(nil)
            .fixedSize(horizontal: false, vertical: true)
            .foregroundStyle(isSystem ? ClayTheme.gold : ClayTheme.offWhite)
            // 3D clay letter lift (Decider HEART / LOVE refs)
            .shadow(color: Color.white.opacity(0.45), radius: 0, x: -1.2, y: -1.2)
            .shadow(color: Color.white.opacity(0.20), radius: 0, x: -0.5, y: -0.5)
            .shadow(color: Color.black.opacity(0.55), radius: 1.6, x: 1.8, y: 2.4)
            .shadow(color: Color.black.opacity(0.35), radius: 0.4, x: 0.8, y: 1.0)

        let tablet = stamped
            .padding(.horizontal, ClayBubbleMetrics.insetX(kind))
            .padding(.vertical, ClayBubbleMetrics.insetY(kind))
            .frame(minWidth: ClayBubbleMetrics.minWidth(kind), minHeight: ClayBubbleMetrics.minHeight(kind), alignment: .leading)
            .frame(maxWidth: maxW, alignment: .leading)
            .background {
                ZStack {
                    // Base rectangular clay plate (never pointed)
                    RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous)
                        .fill(isUser ? ClayTheme.purpleClay : ClayTheme.bubbleAssistant)
                    if ClayImage.exists(bubbleName) {
                        Image(bubbleName)
                            .resizable()
                            .interpolation(.high)
                            .scaledToFill()
                            .clipShape(RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous))
                    }
                }
            }
            // Soft inner rim so type sits in a molded well
            .overlay {
                RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius - 2, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.10), lineWidth: 1)
                    .padding(3)
                    .allowsHitTesting(false)
            }
            .clipShape(RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous))
            .compositingGroup()
            .shadow(color: Color.black.opacity(0.55), radius: 8, x: 0, y: 5)

        // Grok Bot layout: your tablets trailing (right), companion leading (left).
        // Text inside every tablet is left-aligned. Never overlap — clear air gap.
        return Group {
            if isUser {
                HStack(alignment: .top, spacing: 0) {
                    Spacer(minLength: 12)
                    tablet
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
            } else {
                HStack(alignment: .top, spacing: 0) {
                    tablet
                    Spacer(minLength: 12)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(.bottom, ClayTheme.bubbleShadowReserve)
    }
    private var searchBar: some View {
        ClaySearchBar(text: $searchText, focused: $searchFocused) {
            showSearch = false
            searchText = ""
            searchFocused = false
        }
    }

    private var composerRow: some View {
        ClayComposerBar(
            draft: $draft,
            attachments: $attachments,
            placeholder: placeholder,
            focused: $composerFocused,
            onSend: send,
            onAddFiles: { showFilePicker = true }
        )
    }

    // MARK: - Clay chrome (visual contract: wall mock)

    private var chromeOverlays: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 10) {
                // Top-left: BOLTE + search glass; clay search well appears beside the glass.
                HStack(alignment: .center, spacing: 8) {
                    ClayButton(
                        asset: "Bolte",
                        systemFallback: "bolt.heart.fill",
                        width: 32,
                        height: 32,
                        help: "Clay landing — USER MANUAL"
                    ) {
                        withAnimation(.easeInOut(duration: 0.18)) {
                            clayLandingTitle = "USER MANUAL"
                            showClayLanding = true
                        }
                    }

                    ClayButton(
                        asset: "BtnSearch",
                        systemFallback: "magnifyingglass",
                        width: 32,
                        height: 32,
                        help: "Search chat"
                    ) {
                        withAnimation(.spring(response: 0.28, dampingFraction: 0.85)) {
                            showSearch.toggle()
                        }
                        if showSearch {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                                searchFocused = true
                            }
                        } else {
                            searchText = ""
                            searchFocused = false
                        }
                    }

                    if showSearch {
                        searchBar
                            .transition(.asymmetric(
                                insertion: .move(edge: .leading).combined(with: .opacity),
                                removal: .opacity
                            ))
                    }
                }
                .frame(minHeight: 36)

                Spacer(minLength: 12)

                // Mode + mind — same size, center-aligned pair (far upper right).
                HStack(alignment: .center, spacing: 8) {
                    ClayModeButton(isOnline: $mode.isOnline, width: 32, height: 32) {
                        messages.append(
                            ChatMessage(
                                role: .system,
                                text: CompanionRouter.reply(to: "mode", isOnline: isOnline)
                            )
                        )
                    }

                    ClayButton(
                        asset: "BtnMind",
                        systemFallback: "brain.head.profile",
                        width: 32,
                        height: 32,
                        help: "Clay landing — MACHINE MIND"
                    ) {
                        mindPulse.toggle()
                        withAnimation(.easeInOut(duration: 0.18)) {
                            clayLandingTitle = "MACHINE MIND"
                            showClayLanding = true
                        }
                    }
                }
                .frame(height: 32)
            }
            .frame(minHeight: 52)
            .padding(.horizontal, 14)
            .padding(.top, 12)
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }


    private func handleOpenURL(_ url: URL) {
        guard url.scheme?.lowercased() == "yabot" else { return }
        if let comps = URLComponents(url: url, resolvingAgainstBaseURL: false),
           let item = comps.queryItems?.first(where: { $0.name == "text" }),
           let t = item.value, !t.isEmpty {
            injectSend(t)
            return
        }
        let pathText = url.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if !pathText.isEmpty {
            injectSend(pathText.removingPercentEncoding ?? pathText)
        }
    }

    private func injectSend(_ text: String) {
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else { return }
        draft = cleaned
        send()
    }

    // MARK: - Send

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        let files = attachments
        guard !text.isEmpty || !files.isEmpty else { return }

        var userLine = text
        if !files.isEmpty {
            let names = files.map(\.name).joined(separator: ", ")
            let fileNote = "Files: " + names
            userLine = text.isEmpty ? fileNote : text + "\n" + fileNote
        }
        messages.append(ChatMessage(role: .user, text: userLine))
        MindTranscript.append(role: "user", kind: "prompt", body: userLine, party: "Decider")
        draft = ""
        attachments = []

        let routeInput = text.isEmpty ? "files: " + files.map(\.name).joined(separator: ", ") : text
        let answer = CompanionRouter.reply(to: routeInput, isOnline: isOnline)
        let fileAck: String = files.isEmpty
            ? answer
            : answer + "\nReceived \(files.count) file(s): " + files.map(\.name).joined(separator: ", ")
        MindTranscript.append(role: "assistant", kind: "reply", body: fileAck, party: "clay")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) {
            messages.append(ChatMessage(role: .assistant, text: fileAck))
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
