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

## Vincoli v9.2
- Ordine script: `data-es.js` dopo `data.js`; `games-v92-levels.js`, `games-v92-lang.js`, `games-v92-brain.js`
  dopo `games-v9-logic.js` (sostituiscono i generatori di 1, 5, 7, 8, 11, 14, 16, 31, 32, 33, 34, 40, 41, 42).
- Ogni nuova riga di livello deve mantenere `meta.age6Metrics.rank` strettamente crescente (ordine lessicografico)
  rispetto al livello precedente: lo controlla `tests/v92_levels_test.js`, che verifica anche le risposte.
- Nessun "boost" nascosto: `contentLevel(l)===l`. Domande per livello 5→10, secondi 30→12.
- Giochi 70–72 sono puzzle interattivi (`NS.PuzzleGames.flashgrid/nback/stroop`), 73 è a domande.
- Sblocco: tabella `UNLOCK` in `app.js`; `settings.unlockAll` lo disattiva.
- Giochi ispirati al genere "brain training" ma originali: non copiare nomi, grafica o regole di prodotti esistenti.

## Vincoli v9.3
- `games-v93-brain.js` dopo `games-v92-brain.js` (giochi 74, 75, 77, 78 come `NS.PuzzleGames`, 76 a domande).
- `NS.saveState` non deve mai lanciare eccezioni (pagina web in riquadro protetto, iPhone in privato).
- Audio: un solo elemento `Audio` riutilizzato (`games-english.js`); nella versione web `NS.audioSource` fornisce
  i data: URI dai pacchetti per lingua. Testo nei pulsanti 🔊: usare `NS.jsArg(text)`.
- Niente `alert/confirm/prompt` (bloccati su iPhone/pagina web).
- Water Sort: semi in `WATER_SEED` (`games-new.js`); se cambiano, `tests/water_levels_test.js` deve restare verde.
- Versione web: `python3 tools/build_web.py`, poi ripubblicare `dist/web` sulla pagina claude.ai esistente.
