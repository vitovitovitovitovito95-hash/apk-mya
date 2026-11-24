package com.logicland.kids;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.util.Locale;

/**
 * Guscio Android di LogicLand Kids.
 *
 * Ospita la web-app locale (assets/index.html) in una WebView senza accesso a Internet e
 * aggiunge solo ciò che la WebView da sola non garantisce:
 * <ul>
 *   <li>voce inglese con il motore di sintesi vocale del telefono ({@code LLKAndroid.speak});</li>
 *   <li>copia del codice di backup negli appunti ({@code LLKAndroid.copyText});</li>
 *   <li>tasto Indietro di sistema che torna alla mappa invece di chiudere l'app;</li>
 *   <li>finestre confirm()/alert() native (es. "Azzera tutti i progressi");</li>
 *   <li>margini corretti con l'edge-to-edge di Android 15+ (barra di stato, fotocamera, tastiera);</li>
 *   <li>timer JavaScript in pausa quando l'app non è visibile (giochi arcade).</li>
 * </ul>
 *
 * Compilabile con qualsiasi android.jar da API 23 in su: le API più recenti (30+) sono
 * usate via reflection, così il build funziona anche con gli strumenti Debian/Ubuntu.
 */
public class MainActivity extends Activity {

    private static final String START_URL = "file:///android_asset/index.html";
    private static final String ASSET_PREFIX = "file:///android_asset/";
    private static final String BRIDGE_NAME = "LLKAndroid";
    private static final String BACK_JS =
            "(function(){try{return !!(window.LogicLand&&LogicLand.handleBack&&LogicLand.handleBack());}"
                    + "catch(e){return false;}})()";

    /** Colori di sfondo della web-app (styles.css): azzurro in alto, crema in basso. */
    private static final int BG_TOP = 0xFFEDF9FF;
    private static final int BG_BOTTOM = 0xFFFFFAF4;

    private WebView webView;
    private volatile Speech speech;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM, new int[]{BG_TOP, BG_BOTTOM}));
        root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
                int[] p = safeInsets(insets);
                v.setPadding(p[0], p[1], p[2], p[3]);
                return consumeAll(insets);
            }
        });

        speech = new Speech(getApplicationContext());

        webView = new WebView(this);
        webView.setBackgroundColor(BG_TOP);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);           // progressi in localStorage
        settings.setAllowFileAccess(false);            // gli asset restano accessibili
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);

        webView.setWebViewClient(new LocalOnlyClient());
        webView.setWebChromeClient(new DialogChromeClient());
        webView.addJavascriptInterface(new Bridge(), BRIDGE_NAME);

        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        useDarkSystemBarIcons();

        webView.loadUrl(START_URL);
    }

    /** Indietro: prima chiede alla web-app di tornare alla mappa; dalla mappa esce come di consueto. */
    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(BACK_JS, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String handled) {
                if (!"true".equals(handled) && !isFinishing()) {
                    leaveApp();
                }
            }
        });
    }

    private void leaveApp() {
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        Speech s = speech;
        if (s != null) s.stop();
        if (webView != null) {
            webView.onPause();
            // Ferma i timer JavaScript mentre l'app non è visibile: senza, in Tetris Junior i pezzi
            // continuerebbero a cadere a schermo spento facendo perdere vite.
            webView.pauseTimers();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.resumeTimers();
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        Speech s = speech;
        speech = null;
        if (s != null) s.shutdown();
        if (webView != null) {
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) parent.removeView(webView);
            webView.removeJavascriptInterface(BRIDGE_NAME);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    // ---------------------------------------------------------------- JavaScript bridge

    /** Esposto alla web-app come {@code window.LLKAndroid}. I metodi girano sul thread JavaBridge. */
    public final class Bridge {
        @JavascriptInterface
        public boolean speak(String text) {
            Speech s = speech;
            return s != null && s.speak(text);
        }

        @JavascriptInterface
        public void stopSpeaking() {
            Speech s = speech;
            if (s != null) s.stop();
        }

        /** "ready", "loading" oppure "unavailable". */
        @JavascriptInterface
        public String ttsStatus() {
            Speech s = speech;
            return s == null ? "unavailable" : s.status();
        }

        @JavascriptInterface
        public boolean copyText(String text) {
            try {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm == null) return false;
                cm.setPrimaryClip(ClipData.newPlainText("LogicLand Kids", text == null ? "" : text));
                return true;
            } catch (Throwable t) {
                return false;
            }
        }
    }

    // ---------------------------------------------------------------- WebView clients

    /** L'app è solo offline: nessuna navigazione verso siti esterni o altre app. */
    static final class LocalOnlyClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return url == null || !url.startsWith(ASSET_PREFIX);
        }
    }

    /** confirm()/alert() con dialoghi nativi e titolo dell'app invece di "file://". */
    final class DialogChromeClient extends WebChromeClient {
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            return showJsDialog(message, result, false);
        }

        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            return showJsDialog(message, result, true);
        }
    }

    private boolean showJsDialog(String message, final JsResult result, boolean withCancel) {
        if (isFinishing()) {
            result.cancel();
            return true;
        }
        AlertDialog.Builder builder = new AlertDialog.Builder(this)
                .setTitle(getApplicationInfo().loadLabel(getPackageManager()))
                .setMessage(message)
                .setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        result.confirm();
                    }
                })
                .setOnCancelListener(new DialogInterface.OnCancelListener() {
                    @Override
                    public void onCancel(DialogInterface dialog) {
                        result.cancel();
                    }
                });
        if (withCancel) {
            builder.setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    result.cancel();
                }
            });
        }
        builder.show();
        return true;
    }

    // ---------------------------------------------------------------- Sintesi vocale

    /** Wrapper thread-safe di TextToSpeech: voce inglese, velocità adatta ai bambini, coda di 1 parola. */
    static final class Speech implements TextToSpeech.OnInitListener {
        private static final int LOADING = 0, READY = 1, UNAVAILABLE = -1;

        private final TextToSpeech tts;
        private int state = LOADING;
        private String pending;

        Speech(Context context) {
            TextToSpeech created = null;
            try {
                created = new TextToSpeech(context, this);
            } catch (Throwable t) {
                markUnavailable();
            }
            tts = created;
        }

        private synchronized void markUnavailable() {
            state = UNAVAILABLE;
            pending = null;
        }

        @Override
        public synchronized void onInit(int result) {
            if (result != TextToSpeech.SUCCESS || tts == null || state == UNAVAILABLE) {
                state = UNAVAILABLE;
                pending = null;
                return;
            }
            state = READY;
            selectEnglish();
            try {
                tts.setSpeechRate(0.8f);
            } catch (Throwable ignored) {
            }
            if (pending != null) {
                speakNow(pending);
                pending = null;
            }
        }

        private void selectEnglish() {
            Locale[] preferred = {Locale.UK, Locale.US, Locale.ENGLISH};
            for (Locale locale : preferred) {
                int r;
                try {
                    r = tts.setLanguage(locale);
                } catch (Throwable t) {
                    r = TextToSpeech.LANG_NOT_SUPPORTED;
                }
                if (r >= TextToSpeech.LANG_AVAILABLE) return;
            }
        }

        /** true se la parola viene pronunciata (o lo sarà appena il motore è pronto). */
        synchronized boolean speak(String text) {
            if (text == null || text.trim().length() == 0) return false;
            if (state == UNAVAILABLE || tts == null) return false;
            if (state == LOADING) {
                pending = text;
                return true;
            }
            return speakNow(text);
        }

        private boolean speakNow(String text) {
            try {
                return tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "llk") == TextToSpeech.SUCCESS;
            } catch (Throwable t) {
                return false;
            }
        }

        synchronized void stop() {
            pending = null;
            if (state == READY) {
                try {
                    tts.stop();
                } catch (Throwable ignored) {
                }
            }
        }

        synchronized String status() {
            return state == READY ? "ready" : state == LOADING ? "loading" : "unavailable";
        }

        synchronized void shutdown() {
            state = UNAVAILABLE;
            pending = null;
            if (tts != null) {
                try {
                    tts.shutdown();
                } catch (Throwable ignored) {
                }
            }
        }
    }

    // ---------------------------------------------------------------- Barre di sistema e insets

    /** Icone scure su barra di stato e di navigazione (lo sfondo dell'app è chiaro). */
    private void useDarkSystemBarIcons() {
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                Object controller = Window.class.getMethod("getInsetsController").invoke(window);
                if (controller != null) {
                    int light = 8 /* APPEARANCE_LIGHT_STATUS_BARS */ | 16 /* APPEARANCE_LIGHT_NAVIGATION_BARS */;
                    Class.forName("android.view.WindowInsetsController")
                            .getMethod("setSystemBarsAppearance", int.class, int.class)
                            .invoke(controller, light, light);
                    return;
                }
            } catch (Throwable ignored) {
                // si ripiega sui flag classici
            }
        }
        View decor = window.getDecorView();
        decor.setSystemUiVisibility(decor.getSystemUiVisibility()
                | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                | 0x00000010 /* SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR, API 26 */);
    }

    /**
     * Margini da lasciare liberi: barre di sistema, foro della fotocamera e tastiera.
     * Con targetSdk 35 Android 15+ disegna l'app sotto le barre (edge-to-edge obbligatorio);
     * sulle versioni precedenti il sistema li consuma già e qui arrivano a zero.
     */
    static int[] safeInsets(WindowInsets in) {
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                Class<?> type = Class.forName("android.view.WindowInsets$Type");
                int mask = (Integer) type.getMethod("systemBars").invoke(null)
                        | (Integer) type.getMethod("displayCutout").invoke(null)
                        | (Integer) type.getMethod("ime").invoke(null);
                Object insets = WindowInsets.class.getMethod("getInsets", int.class).invoke(in, mask);
                Class<?> c = insets.getClass();
                return new int[]{
                        c.getField("left").getInt(insets), c.getField("top").getInt(insets),
                        c.getField("right").getInt(insets), c.getField("bottom").getInt(insets)};
            } catch (Throwable ignored) {
                // si ripiega sulle API classiche
            }
        }
        int l = in.getSystemWindowInsetLeft(), t = in.getSystemWindowInsetTop();
        int r = in.getSystemWindowInsetRight(), b = in.getSystemWindowInsetBottom();
        if (Build.VERSION.SDK_INT >= 28) {
            try {
                Object cutout = WindowInsets.class.getMethod("getDisplayCutout").invoke(in);
                if (cutout != null) {
                    Class<?> c = Class.forName("android.view.DisplayCutout");
                    l = Math.max(l, (Integer) c.getMethod("getSafeInsetLeft").invoke(cutout));
                    t = Math.max(t, (Integer) c.getMethod("getSafeInsetTop").invoke(cutout));
                    r = Math.max(r, (Integer) c.getMethod("getSafeInsetRight").invoke(cutout));
                    b = Math.max(b, (Integer) c.getMethod("getSafeInsetBottom").invoke(cutout));
                }
            } catch (Throwable ignored) {
                // nessun ritaglio da gestire
            }
        }
        return new int[]{l, t, r, b};
    }

    static WindowInsets consumeAll(WindowInsets in) {
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                return (WindowInsets) WindowInsets.class.getField("CONSUMED").get(null);
            } catch (Throwable ignored) {
                // si ripiega sotto
            }
        }
        return in.consumeSystemWindowInsets();
    }
}
