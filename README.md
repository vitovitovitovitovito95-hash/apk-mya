# Aggiornamento v8.3: solo livelli e difficoltà

Le altre funzioni restano quelle di v8.2. Dettagli in `docs/DIFFICOLTA_EFFETTIVA_V83.md`.

# LogicLand Kids v8.2 — S24 Ultra + Asus Android 6.0.1

Aggiornamento mirato della **v8.1 con audio offline**. Restano 21 giochi × 15 livelli, tre vite, backup, storia/progressi, icone illustrate e le 178 parole inglesi con MP3 offline. Sono stati **riscritti quattro giochi** con tabelloni veri e regole interattive.

## Quattro giochi revisionati

### 🪵 Unlock Me (gioco 53)
- 15 tabelloni reali 6×6, verificati con un risolutore BFS offline.
- Numero minimo di *scorrimenti* per la soluzione: **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 19**; quindi è **strettamente crescente**.
- Blocchi orizzontali e verticali di 2 o 3 caselle, collisioni vere, tasti touch/frecce, annulla e ricomincia.
- Più pressioni consecutive nella stessa direzione sullo stesso blocco rappresentano un singolo scorrimento (una mossa nel gioco tradizionale).
- Se finiscono le mosse disponibili si consuma una delle 3 vite e il tabellone riparte.

### 🔗 Connect the Dots (gioco 54)
- 15 sfide con griglie da 4×4 a 7×7, da 2 a 5 coppie colorate.
- I percorsi devono essere ortogonali, senza incroci né sovrapposizioni, e **riempire l'intera griglia**.
- Ogni tabellone è stato generato da una suddivisione di un percorso completo: soluzione esistente verificata.
- Interazione tramite tap o trascinamento, ritorno indietro, pulizia e controllo della soluzione.
- Il pulsante Controlla non dà la risposta corretta, ma può consumare una vita se la sfida è incompleta.

### ⛀ Dama Junior (gioco 56)
- Partite reali su tavoliere 8×8 contro un avversario software.
- Catture obbligatorie, catene di catture, promozione a dama, mosse diagonali lecite, turni alternati, vittoria quando l'altro giocatore rimane senza pedine o mosse.
- Incremento progressivo di numero di pedine e capacità dell'avversario, con ricerca minimax ai livelli alti.
- Caselle di arrivo evidenziate, aiuto e ripartenza. Le mosse palesemente illegali non consumano vite per un tocco impreciso; una sconfitta consuma una vita.

### ♛ Scacchi Junior (gioco 57)
- Scacchiera 8×8 con pedoni, torri, cavalli, alfieri, Regina e Re e un avversario software.
- Tra le regole implementate: blocchi, catture, movimenti, promozione automatica del pedone, divieto di lasciare il Re sotto scacco, scacco matto e stallo.
- Livelli 1–9: missioni di cattura con difficoltà crescente. Livelli 10–15: scacco matto contro il computer, progressione di pezzi e forza dell'avversario.
- **Variante Junior**: arrocco ed en passant non sono inclusi, dichiarati nell'interfaccia; non è un simulatore FIDE completo.
- Mosse possibili evidenziate; una sconfitta consuma una vita, un tocco su una casella illecita no.

## Workflow di sviluppo
1. Conservare i keystore **originali v8/v8.1** per gli aggiornamenti.
2. Modificare `src/js/` e `app/css/styles.css`.
3. `node tools/transpile_legacy.js` per ES5 su Android 6.
4. Eseguire tutti i test in `tests/`, compreso `v82_mechanics_test.js`.
5. `python android/build_apk.py` per Asus.
6. `python android/build_s24_v5native.py` per Samsung.

### File principali
- `src/js/games-v82-puzzles.js`: Unlock Me e Connect the Dots, cataloghi verificati
- `src/js/games-v82-board.js`: motori Dama/Scacchi Junior e avversario software
- `tests/v82_mechanics_test.js`: test di regole e progressione
- `android/working-v5.0.1.apk`: guscio nativo S24 di Claude provato dall'utente

**Non cancellare né reimpostare i dati esistenti.** `schema=8` resta invariato e `versionCode` è 80200 (superiore a 80100). Gli identificativi Android sono quelli della v8.1. Per aggiornare serve la stessa chiave privata; le chiavi NON si distribuiscono nello ZIP sorgente.

## Limiti di verifica
Sono stati eseguiti test di generazione, regole e interazione in Chromium. Le prestazioni di bot e touch su **specifici dispositivi fisici** restano da verificare. Il punteggio di difficoltà non può garantire che ogni bambino percepisca ogni passaggio come strettamente più difficile.

## Aggiornamento 8.4
Vedi `CHANGELOG_V84.md`: Dama con 24 pedine e caselle quadrate stabili, Scacchi con 32 pezzi e livelli più impegnativi, Unlock Me con trascinamento diretto senza pulsanti freccia. Le altre funzionalità della 8.3 non sono state modificate.
