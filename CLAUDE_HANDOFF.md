# Istruzioni per gli aggiornamenti

Usare il **progetto v8.2** e non ripristinare `games-new.js` come unica implementazione: viene caricato prima dei file `games-v82-puzzles.js` e `games-v82-board.js`, che sostituiscono i quattro giochi revisionati. I vecchi moduli rimangono a fini storici e per Water Sort.

Non perdere la compatibilità Android 6: compilazione ES5 obbligatoria, evitare dipendenze da CSS Grid, Pointer Events o speechSynthesis, e controllare entrambe le versioni APK. Conservare byte per byte gli MP3 della v8.1.

Regole permanenti: 21 giochi, 15 livelli per gioco, tre vite, pulsante livello successivo, backup invariato e nessuna pubblicità. Dama e Scacchi devono rimanere interattivi, non tornare a cliccare stelle su caselle target. Non inserire chiavi di firma negli archivi sorgente. Se l'APK usa lo stesso package dell'installato, incrementare versionCode e firmare con lo stesso keystore v8.

## Vincoli v8.4
- Non tornare alla Dama semplificata: 12 pedine per colore già al livello 1, caselle pixel-quadrate.
- Non tornare agli Scacchi con pezzi mancanti: schieramento completo da L1.
- Unlock Me: interazione esclusivamente trascinamento diretto del blocco; niente frecce. Conservare i 15 livelli solvibili.
- Preservare per i due APK firma e package della 8.3, schema di salvataggio 8, 3 vite e tutti gli MP3 offline.

## Vincoli v9.0
- `games-v9-levels.js` è caricato dopo `games-v83-challenges.js` e sostituisce 7 generatori: modificare lì.
- `fx.js` prima di `app.js`. Non usare CSS custom properties (`var(--`) né `gap` su flex per Android 6.
- Dopo modifiche a `app/` rigenerare `app/sw.js` con `python3 tools/build_pwa.py`.
- Firmare con le chiavi v9 (fuori dal repo); package v9s24/v9asus, versionCode > 90000.
