# LogicLand Kids su iPhone / iPad

## Opzione 1 — PWA (subito, gratis, senza Mac)
L'app è una PWA offline. Va pubblicata su un indirizzo https (es. GitHub Pages):
1. Su GitHub: *Settings → Pages → Source: GitHub Actions*.
2. *Actions → “Pubblica versione web/iOS (PWA)” → Run workflow*.
3. Sull'iPhone/iPad apri con **Safari** l'indirizzo mostrato dal workflow
   (es. `https://<utente>.github.io/apk-mya/`), poi **Condividi → Aggiungi alla schermata Home**.
4. Alla prima apertura vengono salvati tutti i file (giochi, immagini, 465 MP3): poi funziona anche offline.

Nota: i progressi della PWA sono separati da quelli Android. Usa Zona genitori → Backup per copiarli.

## Opzione 2 — App nativa iOS (.ipa) con Capacitor
Serve un **Mac con Xcode** e un **Apple ID** (gratis per provarla sul proprio iPhone per 7 giorni;
Apple Developer Program 99 €/anno per TestFlight / App Store).
```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios          # usa capacitor.config.json (webDir = app)
npx cap sync ios
npx cap open ios         # in Xcode: Signing & Capabilities → scegli il tuo Team → ▶︎ Run sul dispositivo
```
Dopo ogni modifica: `node tools/transpile_legacy.js && npx cap sync ios`.
