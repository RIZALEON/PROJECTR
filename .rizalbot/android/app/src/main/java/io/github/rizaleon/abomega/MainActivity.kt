package io.github.rizaleon.abomega

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.Executors

/**
 * ABOMEGA 0.1 Android — iPhone clay twin + OFFLINE PREMIER command brain + Heart seat.
 * Offline is HARDCODE standard. Online icon toggles display label only.
 *
 * Scroll-to-bottom FAB mirrors Mac/iOS ContentView.messageList jump-to-latest
 * (ArrowDown / showJumpToLatest when distanceFromBottom > 56).
 */
class MainActivity : AppCompatActivity() {
    private lateinit var log: TextView
    private lateinit var input: EditText
    private lateinit var scroll: ScrollView
    private lateinit var middle: FrameLayout
    private lateinit var slate: ImageView
    private lateinit var jumpFab: ImageButton
    private lateinit var heart: NativeHeart
    private lateinit var landing: OfflineLanding
    private val bg = Executors.newSingleThreadExecutor()

    /** Parallel to Mac messages.count — used to gate FAB (need > 1). */
    private var messageCount: Int = 0

    /** Threshold mirrored from ContentView onScrollGeometryChange (56pt). */
    private val bottomSlopPx: Int by lazy { (56f * resources.displayMetrics.density).toInt() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        window.navigationBarColor = android.graphics.Color.parseColor("#12001F")
        @Suppress("DEPRECATION")
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)

        setContentView(R.layout.activity_main)
        log = findViewById(R.id.log)
        input = findViewById(R.id.input)
        scroll = findViewById(R.id.scroll)
        middle = findViewById(R.id.middle)
        slate = findViewById(R.id.clayslate)
        jumpFab = findViewById(R.id.btn_jump_latest)

        heart = NativeHeart(this)
        landing = OfflineLanding(this, middle, slate, scroll, log)

        val send = findViewById<ImageButton>(R.id.send)
        send.setOnClickListener { send() }
        send.alpha = 1.0f
        send.isEnabled = true

        findViewById<ImageButton>(R.id.btn_plus).setOnClickListener {
            append("System", "+ attach stub · offline premier")
        }

        wireJumpToLatest()
        wireYabar()
        handleDeepLink(intent)

        append("System", "Trifecta clay face live. ${OfflineCommandRouter.MODE_LINE}")
        append("System", "Heart: loading async…")

        bg.execute {
            val ok = heart.load()
            runOnUiThread {
                append("System", if (ok) "Heart READY · ${heart.statusLine()}" else "Heart not ready · ${heart.statusLine()}")
            }
            Log.i("MainActivity", heart.statusLine())
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val data = intent?.data ?: return
        if (data.scheme != "yabot") return
        when (data.host) {
            "lab" -> {
                landing.show(OfflineCommandRouter.BarRoute.LAB)
                jumpFab.bringToFront()
                updateJumpFab()
                append("Lab", "Deep link yabot://lab/chamber · offline chamber")
            }
            "cmd" -> {
                // yabot://cmd/ping  or  yabot://cmd?q=mode
                val q = data.getQueryParameter("q")
                    ?: data.pathSegments.joinToString(" ").trim()
                if (q.isNotEmpty()) {
                    append("You", q)
                    dispatchUserLine(q)
                }
            }
        }
    }

    private fun wireJumpToLatest() {
        jumpFab.setOnClickListener {
            scrollToBottom(animated = true)
            jumpFab.visibility = View.GONE
        }
        scroll.viewTreeObserver.addOnScrollChangedListener {
            updateJumpFab()
        }
        // Keep FAB above OfflineLanding overlays when they are added later.
        jumpFab.bringToFront()
        updateJumpFab()
    }

    /** Mac twin: show clay ↓ when scrolled away from latest; hide at bottom. */
    private fun updateJumpFab() {
        if (landing.showing() || scroll.visibility != View.VISIBLE) {
            if (jumpFab.visibility != View.GONE) jumpFab.visibility = View.GONE
            return
        }
        val child = scroll.getChildAt(0)
        if (child == null || messageCount <= 1) {
            if (jumpFab.visibility != View.GONE) jumpFab.visibility = View.GONE
            return
        }
        val contentH = child.height
        val viewH = scroll.height
        if (contentH <= viewH + 8) {
            if (jumpFab.visibility != View.GONE) jumpFab.visibility = View.GONE
            return
        }
        val distanceFromBottom = contentH - (scroll.scrollY + viewH)
        val atBottom = distanceFromBottom <= bottomSlopPx
        val shouldShow = !atBottom
        val next = if (shouldShow) View.VISIBLE else View.GONE
        if (jumpFab.visibility != next) {
            jumpFab.visibility = next
            if (next == View.VISIBLE) jumpFab.bringToFront()
        }
    }

    private fun scrollToBottom(animated: Boolean) {
        scroll.post {
            if (animated) {
                val child = scroll.getChildAt(0)
                val target = (child?.bottom ?: 0) - scroll.height
                if (target > scroll.scrollY) {
                    scroll.smoothScrollTo(0, target.coerceAtLeast(0))
                } else {
                    scroll.fullScroll(ScrollView.FOCUS_DOWN)
                }
            } else {
                scroll.fullScroll(ScrollView.FOCUS_DOWN)
            }
        }
    }


    /** HARDCODE: open sole fixed manual YAMANUAL from assets (PDF view). Leaves untouched. */
    private fun openYaManualPdf(): Boolean {
        return try {
            val outDir = File(getExternalFilesDir(null) ?: filesDir, "mind/books")
            if (!outDir.exists()) outDir.mkdirs()
            val out = File(outDir, "YAMANUAL.pdf")
            assets.open("mind/books/YAMANUAL.pdf").use { input ->
                FileOutputStream(out).use { output -> input.copyTo(output) }
            }
            val uri = Uri.fromFile(out)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/pdf")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            try {
                startActivity(intent)
            } catch (_: Exception) {
                startActivity(Intent.createChooser(intent, "YAMANUAL"))
            }
            true
        } catch (e: Exception) {
            Log.w("YABOT", "openYaManualPdf: ${e.message}")
            false
        }
    }

    private fun wireYabar() {
        tap(R.id.yabar_bolte) {
            landing.show(OfflineCommandRouter.BarRoute.BOLTE)
            jumpFab.bringToFront()
            updateJumpFab()
            val opened = openYaManualPdf()
            append(
                "Bolte",
                if (opened) "Opened YAMANUAL.pdf (sole fixed manual · offline assets)"
                else "YAMANUAL.pdf missing under assets/mind/books — reseat HARDCODE"
            )
        }
        tap(R.id.yabar_lab) {
            landing.show(OfflineCommandRouter.BarRoute.LAB)
            jumpFab.bringToFront()
            updateJumpFab()
            append("Lab", "Lab · chamber offline (yabot://lab/chamber)")
        }
        tap(R.id.yabar_search) {
            landing.show(OfflineCommandRouter.BarRoute.SEARCH)
            jumpFab.bringToFront()
            updateJumpFab()
            append("Search", "Search · overlay stub (magnetic; Ghost Home stays)")
        }
        tap(R.id.yabar_home) {
            landing.hideLanding()
            jumpFab.bringToFront()
            updateJumpFab()
            append("Ghost Home", "Ghost Heart Home · center magnet · OFFLINE PREMIER")
        }
        tap(R.id.yabar_wallet) {
            landing.show(OfflineCommandRouter.BarRoute.WALLET)
            jumpFab.bringToFront()
            updateJumpFab()
            append("Wallet", "Wallet · offline landing")
        }
        tap(R.id.yabar_online) {
            append("Mode", landing.toggleOnlineLabel())
        }
        tap(R.id.yabar_mind) {
            landing.show(OfflineCommandRouter.BarRoute.MIND)
            jumpFab.bringToFront()
            updateJumpFab()
            append("Mind", "Machine Mind · offline landing")
        }
    }

    private fun tap(id: Int, block: () -> Unit) {
        val v: View? = try {
            findViewById(id)
        } catch (_: Exception) {
            null
        }
        v?.setOnClickListener { block() }
    }

    private fun send() {
        val text = input.text?.toString()?.trim().orEmpty()
        if (text.isEmpty()) return
        input.setText("")
        append("You", text)
        dispatchUserLine(text)
    }

    private fun dispatchUserLine(text: String) {
        val route = OfflineCommandRouter.route(text, heart)
        if (route.handled) {
            route.bar?.let { bar ->
                when (bar) {
                    OfflineCommandRouter.BarRoute.ONLINE -> { /* display toggle via typed mode */ }
                    OfflineCommandRouter.BarRoute.HOME -> {
                        landing.hideLanding()
                        jumpFab.bringToFront()
                        updateJumpFab()
                    }
                    OfflineCommandRouter.BarRoute.BOLTE -> {
                        landing.show(bar)
                        jumpFab.bringToFront()
                        updateJumpFab()
                        openYaManualPdf()
                    }
                    else -> {
                        landing.show(bar)
                        jumpFab.bringToFront()
                        updateJumpFab()
                    }
                }
            }
            append("ЯBOT", route.reply ?: "")
            return
        }
        if (heart.seated) {
            append("ЯBOT", "…thinking (Heart)…")
            bg.execute {
                val out = heart.generate(text)
                runOnUiThread { append("ЯBOT", out) }
            }
        } else {
            append("ЯBOT", heart.offlinePremierFallback())
        }
    }

    private fun append(who: String, msg: String) {
        log.append("\n\n$who: $msg")
        messageCount += 1
        // Mirror Mac onChange(messages.count): auto-scroll + hide jump FAB.
        scrollToBottom(animated = true)
        jumpFab.visibility = View.GONE
    }
}
