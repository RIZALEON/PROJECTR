package io.github.rizaleon.abomega

import android.content.Context
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.InetAddress
import java.util.concurrent.TimeUnit

/**
 * Offline premier command surface — Android twin of Mac CompanionRouter + PingPongNetTest.
 * Routes BEFORE Heart. Mode is always OFFLINE PREMIER (online is display-only bonus).
 */
object OfflineCommandRouter {
    const val MODE_LINE = "MODE: OFFLINE. PREMIER PATH. LOCAL MOUTH ONLY."
    private const val MAX_PING = 5
    private const val DEFAULT_PING = 3
    private const val PROC_TIMEOUT_SEC = 12L

    data class Route(
        val handled: Boolean,
        val reply: String? = null,
        val bar: BarRoute? = null
    )

    enum class BarRoute { LAB, WALLET, MIND, HOME, BOLTE, SEARCH, ONLINE }

    fun route(raw: String, heart: NativeHeart): Route {
        val text = raw.trim()
        if (text.isEmpty()) return Route(false)

        val lower = text.lowercase()

        // Explicit bar / landing keywords
        when {
            lower == "lab" || lower.startsWith("lab ") || lower == "chamber" ->
                return Route(true, "Lab · chamber offline landing (yabot://lab/chamber)", BarRoute.LAB)
            lower == "wallet" ->
                return Route(true, "Wallet · offline landing", BarRoute.WALLET)
            lower == "mind" || lower == "machine mind" ->
                return Route(true, "Machine Mind · offline landing", BarRoute.MIND)
            lower == "home" || lower == "ghost" || lower == "ghost home" ->
                return Route(true, "Ghost Heart Home · center magnet · OFFLINE PREMIER", BarRoute.HOME)
            lower == "bolte" ->
                return Route(true, "Bolte · YAMANUAL sole manual (assets/mind/books/YAMANUAL.pdf)", BarRoute.BOLTE)
            lower == "search" ->
                return Route(true, "Search · overlay stub (offline premier; Ghost Home stays)", BarRoute.SEARCH)
            lower == "online" || lower == "offline" || lower == "mode" ->
                return Route(true, MODE_LINE, BarRoute.ONLINE)
        }

        // Companion heartbeat (bare ping / pong) — NOT ICMP
        if (lower == "ping" || lower == "pong" || lower == "utah ping") {
            return Route(true, "pong · ABOMEGA Android 0.1 · OFFLINE PREMIER · local mouth")
        }

        if (lower == "help" || lower == "commands" || lower == "functions" || lower == "?") {
            return Route(true, helpText(heart))
        }

        if (lower == "heart" || lower.startsWith("heart ") || lower == "heart status" || lower == "status") {
            return Route(true, heart.statusLine())
        }

        if (lower.contains("law") || lower.contains("source") || lower == "nonnuclear") {
            return Route(
                true,
                "ЯOS GIVES SOURCE VALUE. App updates from itself. NonNuclear. Offline premier is standard; online is bonus."
            )
        }

        if (lower.startsWith("evolve")) {
            return Route(true, "Evolve is Decider-gated. I cannot grant myself permission.")
        }

        // PingPong net-test tree (before Heart)
        PingPongNetTest.handleClay(text)?.let { return Route(true, it) }

        return Route(false)
    }

    fun helpText(heart: NativeHeart): String {
        return """
            |ЯBOT Android · BASE COMMANDS (one word) · Rbot proficiency 0–10
            |HARDCODE: base = exactly one word · multi-word = extension under that base
            |Aliases: commands · functions · ? → help
            |Contract: BASE-COMMANDS-ONE-WORD-0.1.md
            |
            |SEATED HERE (Android) · word — blurb — N/10
|1  ping — companion heartbeat (bare ≠ ICMP) — 9/10
|2  pong — companion heartbeat reply — 9/10
|3  help — this list + extension hints — 8/10
|5  mind — mind loop / Machine Mind — 6/10
|8  bolte — YAMANUAL sole manual face — 7/10
|13  evolve — Decider-gated (never self-granted) — 4/10
|15  mode — ONLINE / OFFLINE premier status — 8/10
|16  online — online path (bonus only) — 5/10
|17  offline — affirm offline premier — 8/10
|18  search — web search (ONLINE bonus) — 5/10
|30  heart — ${heart.statusLine()} — 8/10
|31  ghost — Я GHOST CHAIN tape — 7/10
|37  lab — Lab / chamber landing — 6/10
|38  wallet — Wallet landing — 5/10
|39  home — Ghost Heart Home — 7/10
            |
            |EXTENSIONS seated
            |· pingpong · PING -C N host · NSLOOKUP · host (bare ping stays heartbeat)
            |· heart status · law / source / nonnuclear
            |
            |MAC/iOS SEATED · NOT ON ANDROID YET (no fake handler) · N/10 from contract
| 4 think 6/10 · 6 tongue 7/10 · 7 teachings 7/10 · 9 rzl 6/10
| 10 revert 5/10 · 11 reform 5/10 · 12 respawn 6/10 · 14 snapshot 5/10
| 19 nearby 5/10 · 20 place 6/10 · 21 research 4/10 · 22 read 4/10
| 23 token 6/10 · 24 coin 6/10 · 25 mint 6/10 · 26 yacode 7/10
| 27 cos 7/10 · 28 voice 7/10 · 29 triangle 7/10 · 32 essence 6/10
| 33 teach 7/10 · 34 lock 7/10 · 35 remember 7/10 · 36 transcript 7/10
| 40 scout 6/10 · 41 shot 6/10 · 42 walis 5/10 · 43 who 8/10
| 44 bot 8/10 · 45 labels 8/10
            |
            |Chat with Heart when seated; else offline seat reply.
            |Offline premier is standard; online is bonus only.
        """.trimMargin()
    }

    /** Run a short ProcessBuilder command; returns stdout/stderr or FAIL. */
    fun runShell(label: String, argv: List<String>): String {
        return try {
            val pb = ProcessBuilder(argv)
                .redirectErrorStream(true)
            val proc = pb.start()
            val out = StringBuilder()
            BufferedReader(InputStreamReader(proc.inputStream)).use { br ->
                var line: String?
                while (br.readLine().also { line = it } != null) {
                    out.appendLine(line)
                }
            }
            val finished = proc.waitFor(PROC_TIMEOUT_SEC, TimeUnit.SECONDS)
            if (!finished) {
                proc.destroyForcibly()
                return "$label\nFAIL · timed out after ${PROC_TIMEOUT_SEC}s"
            }
            val body = out.toString().trim().ifEmpty { "(no output · exit ${proc.exitValue()})" }
            val status = if (proc.exitValue() == 0) "OK" else "EXIT ${proc.exitValue()}"
            "$label · $status\n$body"
        } catch (e: Exception) {
            "$label\nFAIL · ${e.message}"
        }
    }
}

/**
 * Android twin of PingPongNetTest.swift — ping / nslookup / host via Runtime where allowed.
 * Bare companion `ping` is NOT handled here (OfflineCommandRouter keeps heartbeat).
 */
object PingPongNetTest {
    const val commandName = "PINGPONG"
    const val schema = "PingPongNetTest.v1"
    private const val maxPingCount = 5
    private const val defaultPingCount = 3

    fun handleClay(raw: String): String? {
        val text = raw.trim()
        if (text.isEmpty()) return null
        val lower = text.lowercase()

        if (lower == "pingpong" || lower == "ping pong" ||
            lower == "pingpong help" || lower == "ping pong help"
        ) {
            return helpText()
        }
        if (lower.startsWith("pingpong ") || lower.startsWith("ping pong ")) {
            var rest = text
            for (p in listOf("pingpong ", "PINGPONG ", "ping pong ", "PING PONG ")) {
                if (rest.lowercase().startsWith(p.lowercase())) {
                    rest = rest.drop(p.length).trim()
                    break
                }
            }
            if (rest.isEmpty()) return helpText()
            return runBlock(rest)
        }
        if (!looksLikeNetTest(text)) return null
        return runBlock(text)
    }

    fun looksLikeNetTest(raw: String): Boolean {
        val lines = raw.lines().map { it.trim() }.filter { it.isNotEmpty() }
        if (lines.isEmpty()) return false
        if (lines.size == 1) return classifyLine(lines[0]) != null
        if (lines.any { it.lowercase().startsWith("pingpong") || it.lowercase().startsWith("ping pong") }) {
            return true
        }
        val hits = lines.count { classifyLine(it) != null }
        return hits >= 1 && hits * 2 >= lines.size
    }

    private sealed class Verb {
        data class Ping(val host: String, val count: Int) : Verb()
        data class Nslookup(val host: String) : Verb()
        data class Host(val host: String) : Verb()
    }

    private fun classifyLine(line: String): Verb? {
        val trimmed = line.trim()
        if (trimmed.isEmpty()) return null
        val lower = trimmed.lowercase()
        // Bare companion heartbeat — NEVER steal
        if (lower == "ping" || lower == "utah ping") return null

        if (lower.startsWith("pingpong ") || lower.startsWith("ping pong ")) {
            val rest = trimmed.substringAfter(' ').trim().let {
                if (lower.startsWith("ping pong ")) trimmed.drop(9).trim() else it
            }
            return classifyLine(rest)
        }

        val tokens = trimmed.split(Regex("\\s+"))
        val head = tokens.firstOrNull()?.lowercase() ?: return null
        when (head) {
            "ping" -> return parsePing(tokens.drop(1))
            "nslookup" -> {
                if (tokens.size < 2) return null
                val h = sanitizeHost(tokens[1])
                return if (h.isEmpty()) null else Verb.Nslookup(h)
            }
            "host", "dig" -> {
                if (tokens.size < 2) return null
                val h = sanitizeHost(tokens[1])
                return if (h.isEmpty()) null else Verb.Host(h)
            }
        }
        return null
    }

    private fun parsePing(tokens: List<String>): Verb? {
        var count = defaultPingCount
        var host: String? = null
        var i = 0
        while (i < tokens.size) {
            val t = tokens[i]
            val tl = t.lowercase()
            if (tl == "-c" || tl == "-n" || tl == "--count") {
                if (i + 1 < tokens.size) {
                    tokens[i + 1].toIntOrNull()?.let { count = it.coerceIn(1, maxPingCount) }
                    i += 2
                    continue
                }
            }
            if (tl.startsWith("-c") && tl.length > 2) {
                tl.drop(2).toIntOrNull()?.let { count = it.coerceIn(1, maxPingCount) }
                i++
                continue
            }
            if (t.startsWith("-")) {
                i++
                continue
            }
            if (host == null) host = sanitizeHost(t)
            i++
        }
        val h = host ?: return null
        if (h.isEmpty()) return null
        return Verb.Ping(h, count)
    }

    private fun sanitizeHost(raw: String): String {
        var s = raw.trim()
        while (s.isNotEmpty() && s.first() in "!.,;:\"'()[]{}") s = s.drop(1)
        while (s.isNotEmpty() && s.last() in "!.,;:\"'()[]{}") s = s.dropLast(1)
        if (s.isEmpty() || s.contains("://") || s.contains("/") || s.contains(" ")) return ""
        if (s.any { !(it.isLetterOrDigit() || it in ".-:_") }) return ""
        return s
    }

    private fun runBlock(text: String): String {
        val lines = text.lines().map { it.trim() }.filter { it.isNotEmpty() }
        val out = mutableListOf("$commandName · $schema · local net-test (not Heart)")
        var any = false
        for (line in lines) {
            val verb = classifyLine(line)
            if (verb == null) {
                out.add("SKIP · not a net-test verb: $line")
                continue
            }
            any = true
            out.add(runVerb(verb))
        }
        if (!any) return helpText() + "\n(no runnable net-test line in input)"
        return out.joinToString("\n\n")
    }

    private fun runVerb(verb: Verb): String = when (verb) {
        is Verb.Ping -> ping(verb.host, verb.count)
        is Verb.Nslookup -> dnsLookup(verb.host, digStyle = false)
        is Verb.Host -> dnsLookup(verb.host, digStyle = true)
    }

    private fun ping(host: String, count: Int): String {
        val n = count.coerceIn(1, maxPingCount)
        // Android emulator usually has /system/bin/ping
        val tryPaths = listOf(
            listOf("ping", "-c", "$n", "-W", "2", host),
            listOf("/system/bin/ping", "-c", "$n", "-W", "2", host)
        )
        for (argv in tryPaths) {
            val r = OfflineCommandRouter.runShell("PING · $host · count $n", argv)
            if (!r.contains("FAIL ·") || r.contains("EXIT")) return r
            if (!r.contains("No such file") && !r.contains("error=2") && !r.contains("Cannot run")) {
                return r
            }
        }
        // Fallback: InetAddress.isReachable (ICMP if permitted, else TCP echo heuristic)
        return try {
            val lines = mutableListOf("PING · $host · count $n · InetAddress fallback")
            var ok = 0
            repeat(n) { i ->
                val start = System.currentTimeMillis()
                val reachable = InetAddress.getByName(host).isReachable(2000)
                val ms = System.currentTimeMillis() - start
                if (reachable) {
                    ok++
                    lines.add("seq ${i + 1}: ok · ${ms}ms")
                } else {
                    lines.add("seq ${i + 1}: fail · unreachable/${ms}ms")
                }
            }
            lines.add("--- $n probes, $ok ok · $schema")
            lines.joinToString("\n")
        } catch (e: Exception) {
            "PING · $host · FAIL · ${e.message}"
        }
    }

    private fun dnsLookup(host: String, digStyle: Boolean): String {
        val label = if (digStyle) "DIG/HOST" else "NSLOOKUP"
        // Prefer getaddrinfo via InetAddress (always available offline-capable for local/cache)
        return try {
            val addrs = InetAddress.getAllByName(host)
            if (addrs.isEmpty()) {
                "$label · $host · FAIL · no addresses"
            } else {
                "$label · $host · OK\n" + addrs.joinToString("\n") { it.hostAddress ?: it.toString() }
            }
        } catch (e: Exception) {
            // Optional shell fallback
            val shell = OfflineCommandRouter.runShell(label, listOf("nslookup", host))
            if (!shell.contains("FAIL ·")) shell else "$label · $host · FAIL · ${e.message}"
        }
    }

    fun helpText(): String = """
        |$commandName · $schema
        |Local device network TEST (offline-premier companion stays Heart; these are Decider test probes).
        |Verbs:
        |  ping [-c N] <host>     count capped $maxPingCount (default $defaultPingCount)
        |  nslookup <host>
        |  host / dig <host>
        |  pingpong <verb…>       explicit tree root
        |Examples:
        |  PING -C 3 1.1.1.1
        |  NSLOOKUP EXAMPLE.COM
        |  pingpong ping -c 2 127.0.0.1
        |Note: bare `ping` still means companion heartbeat → pong (not ICMP).
    """.trimMargin()
}
