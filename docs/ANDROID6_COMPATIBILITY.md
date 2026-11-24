# Compatibilità Android 6.0.1 / Asus tablet

- Manifest: `minSdkVersion 23`, `targetSdkVersion 23`.
- Nessuna libreria `.so`: il pacchetto non dipende da ARM32/ARM64.
- Runtime web compilato in ES5.
- `polyfills.js` copre API JavaScript/DOM mancanti nei vecchi WebView: Array.from/find/includes/flat/flatMap/at, Object.assign/entries/values/fromEntries, String repeat/padStart/replaceAll, NodeList.forEach, Element.remove e requestAnimationFrame.
- CSS runtime non usa `var(--...)`; le principali griglie hanno fallback Flexbox.
- Tetris ha fallback Flexbox 10×16 anche senza CSS Grid.
- Macchia Sprint ascolta pointer, touch e click per tablet con WebView legacy.
- Dati e giochi sono offline in `assets/`.

La compatibilità è verificata staticamente e tramite build firmata. Non è possibile simulare qui l’hardware specifico del tablet Asus: la prova definitiva resta l’installazione sul dispositivo reale.
