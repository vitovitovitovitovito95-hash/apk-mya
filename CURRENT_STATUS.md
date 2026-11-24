# LogicLand Kids — Stato v9.3

- v9.3: 33 giochi. Nuovi 74–78 in `src/js/games-v93-brain.js`; Conta e Scegli (31) rifatto in `games-v92-levels.js`;
  Uguale o Diverso con cambio carta visibile e 2/3 indietro; Griglia Lampo fino a 8×8.
- iPhone/iPad: pagina web su claude.ai (`tools/build_web.py` → `dist/web`, audio in `audio/{en,es,it}.json`,
  progressi nel db della pagina con `web/cloud-save.js`). L'APK non usa questi file.
- Analisi completa eseguita (tutti i giochi e livelli, 5 dimensioni di schermo, giochi per la mente giocati da bot).
- APK 9.3 (versionCode 90300) firmati con le stesse chiavi v9 → aggiornano la 9.2. Installazione fisica: da verificare.

# LogicLand Kids — Stato v9.2

- v9.2: 28 giochi. Livelli in tabelle a 15 righe (`src/js/games-v92-levels.js`), lingue EN/ES
  (`games-v92-lang.js`, `data-es.js`), allenamento mentale 70–73 (`games-v92-brain.js`), sblocco a stelle e
  schermata livello in `app.js`. Audio Pico (`tools/build_audio_v92.py`). Test principale: `tests/v92_levels_test.js`.
- APK 9.2 (versionCode 90200) firmati con le stesse chiavi v9 → aggiornano la 9.1. Installazione fisica: da verificare.

# LogicLand Kids — Stato v9.1

- v9.1: 22 giochi (nuovi 40/41/42 in `src/js/games-v9-logic.js`, 21 e 35 accorpati in 8), boost contenuti +3 livelli, 6–8 domande, timer per domanda, nuovo tema, nome app “LogicLand v9.1”, versionCode 90100.


- Base v8.4. 21 giochi, 15 livelli, 3 vite, backup schema 8, MP3 offline invariati.
- Nuovi generatori v9 (`src/js/games-v9-levels.js`) per Numero Mancante, Intruso, Coppie Gemelle,
  Conta e Scegli, Blocchi Logici, Domino, Memoria Visiva. Test (ora): `tests/v92_levels_test.js`.
- Grafica/animazioni v9: fondo di `app/css/styles.css` + `src/js/fx.js` (suoni, coriandoli, scintille).
- PWA per iOS: `app/manifest.webmanifest`, `app/sw.js` (generato), `app/icons/`, workflow Pages manuale.
- APK v9.0 (versionCode 90000) con NUOVE chiavi e package `com.logicland.kids.v9s24` / `.v9asus`:
  si installano accanto alla v8; i progressi si trasferiscono con il codice di backup.
- Installazione fisica su S24 / Asus: da verificare.

# LogicLand Kids — Stato v8.4

Versione 8.4 basata rigorosamente sulla 8.3.

Modifiche limitate ai soli giochi Dama Junior, Scacchi Junior, Unlock Me e CSS della scacchiera; versione aggiornamento v8.4.

- 21 giochi, 15 livelli ciascuno, 3 vite, backup schema 8.
- Dama: 24 pedine iniziali, 64 caselle quadrate fisse anche ruotando lo schermo, avversario con abilità crescente.
- Scacchi: 32 pezzi iniziali, 64 caselle quadrate, obiettivi e avversario con complessità crescente.
- Unlock Me: trascinamento diretto touch/mouse; nessun tasto direzionale; puzzle originali invariati.
- Audio MP3 offline e tutti gli altri giochi invariati.
- Test automatici inclusi test v84_board_drag_test.js; prove di input in Chromium: touch/mouse drag, caselle stabili alla rotazione.

Le due build 8.4 sono preparate come aggiornamento dalla 8.3, con package e firme invariati, versionCode 80400. Installazione fisica da verificare.
