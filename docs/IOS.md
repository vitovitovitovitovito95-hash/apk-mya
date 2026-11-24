# LogicLand Kids su iPhone / iPad

## Opzione 1 — PWA su GitHub Pages (subito, gratis, senza Mac, senza account)
L'app è una PWA offline (cartella `app/`). Il repository va reso **pubblico** (GitHub Pages gratis
funziona solo così). Nella radice ci sono `index.html` (porta subito a `app/`) e `.nojekyll`.
1. *Settings → General → Danger Zone → Change visibility → Public*.
2. *Settings → Pages → Build and deployment → Source: Deploy from a branch*,
   branch `claude/project-thread-pm5h75` (o `main` dopo il merge), cartella `/ (root)` → *Save*.
3. Dopo 1–2 minuti il gioco è su `https://vitovitovitovitovito95-hash.github.io/apk-mya/`.
4. Sull'iPhone/iPad apri il link con **Safari**, poi **Condividi → Aggiungi alla schermata Home**
   (l'app lo suggerisce con un riquadro viola, che non compare più dopo averlo chiuso).
5. Alla prima apertura vengono salvati tutti i file (giochi, immagini, audio): poi funziona anche offline.

Dopo ogni modifica a `app/` esegui `python3 tools/build_pwa.py` (nuova versione della cache) e fai push:
GitHub Pages si aggiorna da solo. In alternativa resta il workflow manuale `pages-pwa.yml`
(*Source: GitHub Actions*, va avviato da `main`).

Nota: i progressi della PWA restano sull'iPhone e sono separati da quelli Android. Usa Zona genitori → Backup per copiarli.

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
