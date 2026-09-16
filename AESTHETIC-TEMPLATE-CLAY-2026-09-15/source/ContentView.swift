import SwiftUI
import UniformTypeIdentifiers

struct ContentView: View {
    @State private var messages: [ChatMessage] = []
    @State private var draft: String = ""
    @State private var isOnline: Bool = false
    @State private var showJumpToLatest: Bool = false
    @State private var jumpToken: Int = 0
    @State private var showSearch: Bool = false
    @State private var searchText: String = ""
    @State private var mindPulse: Bool = false
    @State private var attachments: [ClayAttachment] = []
    @State private var showFilePicker: Bool = false
    @FocusState private var composerFocused: Bool
    @FocusState private var searchFocused: Bool

    private let placeholder = ""

    var body: some View {
        ZStack {
            ClayBackground()

            // No center chat window — transcript + composer live on the clay wall.
            openClaySeat
                .padding(.horizontal, 28)
                .padding(.top, 88)
                .padding(.bottom, 24)

            chromeOverlays
        }
        .frame(minWidth: 640, minHeight: 480)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .preferredColorScheme(.dark)
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
            if showSearch, !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Text(searchHitLabel)
                    .font(ClayTheme.clayFont(size: 11, weight: .bold))
                    .foregroundStyle(ClayTheme.gold)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 12)
                    .padding(.bottom, 6)
            }
            composerRow
                .padding(.horizontal, 8)
                .padding(.bottom, 14)
                .frame(maxWidth: .infinity)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.top, 64)
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
                .font(ClayTheme.clayFont(size: isSystem ? 12.5 : 15, weight: isSystem ? .medium : .semibold))
                .foregroundStyle(
                    isUser ? Color.black.opacity(0.82)
                        : isSystem ? ClayTheme.gold
                        : ClayTheme.offWhite
                )
                .shadow(color: Color.black.opacity(isUser ? 0.08 : 0.35), radius: 0.6, y: 1)
                .padding(.horizontal, 16)
                .padding(.vertical, isSystem ? 10 : 13)
                .background(
                    ZStack {
                        RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous)
                            .fill(
                                isUser ? ClayTheme.bubbleUser
                                    : isSystem ? ClayTheme.purpleDeep.opacity(0.72)
                                    : ClayTheme.bubbleAssistant
                            )
                        ClayNoiseOverlay(opacity: 0.35)
                            .clipShape(RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous))
                        RoundedRectangle(cornerRadius: ClayTheme.bubbleRadius, style: .continuous)
                            .stroke(
                                isSystem ? ClayTheme.gold.opacity(0.4) : Color.white.opacity(0.10),
                                lineWidth: 1.2
                            )
                    }
                    .clayEmboss(raised: true)
                )
            if !isUser { Spacer(minLength: 48) }
        }
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
                        help: "BOLTE"
                    ) { }

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
                    ClayModeButton(isOnline: $isOnline, width: 32, height: 32) {
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
                        help: "Machine mind"
                    ) {
                        mindPulse.toggle()
                        messages.append(
                            ChatMessage(role: .assistant, text: CompanionRouter.reply(to: "mind", isOnline: isOnline))
                        )
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
        draft = ""
        attachments = []

        let routeInput = text.isEmpty ? "files: " + files.map(\.name).joined(separator: ", ") : text
        let answer = CompanionRouter.reply(to: routeInput, isOnline: isOnline)
        let fileAck: String = files.isEmpty
            ? answer
            : answer + "\nReceived \(files.count) file(s): " + files.map(\.name).joined(separator: ", ")
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
