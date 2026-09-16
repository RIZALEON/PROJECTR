import SwiftUI
import UniformTypeIdentifiers

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
    @State private var showManualLanding: Bool = false
    @State private var attachments: [ClayAttachment] = []
    @State private var showFilePicker: Bool = false
    @FocusState private var composerFocused: Bool

    private let placeholder =
        "Type here · same as CoS — commands · ping · think … Ask anything"

    var body: some View {
        ZStack {
            ClayBackground()

            // No center chat window — transcript + composer live on the clay wall.
            openClaySeat
                .padding(.horizontal, 28)
                .padding(.top, 88)
                .padding(.bottom, 24)
                .opacity(showManualLanding ? 0 : 1)
                .allowsHitTesting(!showManualLanding)

            chromeOverlays
                .opacity(showManualLanding ? 0 : 1)
                .allowsHitTesting(!showManualLanding)

            if showManualLanding {
                ManualLandingView(isPresented: $showManualLanding)
                    .transition(.opacity)
                    .zIndex(50)
            }
        }
        .frame(minWidth: 640, minHeight: 480)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .preferredColorScheme(.dark)
        .animation(.easeInOut(duration: 0.18), value: showManualLanding)
        .onAppear {
            // Seed MACHINE MIND offline PDF cache from bundle/seat when available
            if let src = ManualPDFLocator.resolveSeatedPDF() {
                ManualPDFLocator.seedMachineMind(from: src)
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
            headerBar
                .padding(.horizontal, 8)
                .padding(.bottom, 10)

            messageList
                .padding(.horizontal, 4)

            if showSearch {
                searchBar
                    .padding(.horizontal, 4)
                    .padding(.bottom, 8)
            }

            composerRow
                .padding(.horizontal, 4)
                .padding(.top, 10)
        }
        .frame(maxWidth: 820)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }

    private var headerBar: some View {
        HStack(spacing: 10) {
            ClayAssetImage("Bolte", system: "bolt.circle.fill", size: 30)
                .clipShape(Circle())
                .shadow(color: ClayTheme.purple.opacity(0.5), radius: 8)

            VStack(alignment: .leading, spacing: 2) {
                Text("ЯBOT")
                    .clayText(size: 22, weight: .heavy, color: ClayTheme.offWhite)
                Text(isOnline ? "clay · link bonus" : "clay · offline premier")
                    .clayText(size: 10, weight: .bold, color: ClayTheme.muted, raised: false)
            }

            Spacer()

            Button(action: {}) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(ClayTheme.offWhite.opacity(0.9))
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(ClayTheme.slab).clayEmboss())
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
                ClayButton(
                    asset: "BtnArrowDown",
                    systemFallback: "chevron.down",
                    width: 44,
                    height: 44,
                    help: "Jump to latest"
                ) { jumpToken += 1 }
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
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(ClayTheme.gold)
            TextField("Search clay transcript", text: $searchText)
                .textFieldStyle(.plain)
                .font(ClayTheme.clayFont(size: 13, weight: .semibold))
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
        VStack {
            HStack(alignment: .top, spacing: 12) {
                topLeftChrome
                Spacer()
                topRightChrome
            }
            .padding(.horizontal, 14)
            .padding(.top, 10)
            Spacer()
        }
    }

    private var topLeftChrome: some View {
        HStack(alignment: .center, spacing: 14) {
            ClayButton(
                asset: "Bolte",
                systemFallback: "bolt.heart.fill",
                width: 68,
                height: 68,
                help: "BOLTE — USER GIVEЯ MANUAL"
            ) {
                showManualLanding = true
            }
            .shadow(color: ClayTheme.orangeBolt.opacity(0.45), radius: 12, y: 4)

            ClayButton(
                asset: "BtnSearch",
                systemFallback: "magnifyingglass",
                width: 52,
                height: 64,
                help: "Search transcript"
            ) {
                showSearch.toggle()
                if !showSearch { searchText = "" }
            }
        }
    }

    private var topRightChrome: some View {
        HStack(alignment: .center, spacing: 14) {
            ClayModeButton(isOnline: $isOnline, width: 108, height: 108) {
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
                width: 68,
                height: 60,
                help: "Machine mind — mind loop"
            ) {
                mindPulse.toggle()
                messages.append(
                    ChatMessage(role: .assistant, text: CompanionRouter.reply(to: "mind", isOnline: isOnline))
                )
            }
            .shadow(color: ClayTheme.gold.opacity(mindPulse ? 0.45 : 0.0), radius: mindPulse ? 12 : 0)
        }
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
