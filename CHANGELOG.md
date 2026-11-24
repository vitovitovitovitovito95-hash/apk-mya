# Changelog
## 9.3.0
- **Conta e Scegli** rifatto: 15 livelli tutti diversi (contare 1 o 3 tipi di oggetti, somme, "quanti in più",
  oggetti quasi uguali, operazioni in 2 passi, zone colorate GIALLO/BLU, oggetti che si coprono dopo pochi secondi).
- **Uguale o Diverso**: la carta esce e ne entra una nuova (numero "Carta N" e colore diverso), così il cambio si vede
  anche quando il simbolo è identico; striscia delle carte precedenti con quella da confrontare evidenziata;
  livelli 5–9 confrontano con 2 carte prima, livelli 10–15 con 3 carte prima.
- **Griglia Lampo**: la griglia cresce da 3×3 a 8×8 e le caselle accese da 3 a 12.
- **5 nuovi giochi per la mente** (originali): Sequenza Luminosa, Frecce in Fila, Gira e Trova (rotazione mentale),
  Mai Visto, Più o Meno?. Totale 33 giochi.
- **Analisi completa** con `qa_all` (Playwright): 33 giochi × 15 livelli, ogni domanda risposta, controllo di errori
  JavaScript e di elementi fuori schermo su 360×640, 384×832, 390×844, 600×960, 1280×800. I 7 giochi per la mente
  sono stati giocati da un giocatore automatico a tutti i 15 livelli (tutti vincibili).
- Correzioni trovate dall'analisi: Ombra Giusta usciva dallo schermo dal livello 5 (ora gruppi da 4 e una colonna);
  errore quando si passava alla domanda successiva prima della pronuncia; la schermata "Livello da riprovare" poteva
  comparire dopo essere tornati alla home; piccoli scatti laterali nelle animazioni; "Mai Visto" a volte rimescolava
  nello stesso ordine; copertine sbagliate (Conta e Scegli mostrava "Trova l'intruso").
- **Water Sort**: un puzzle verificato per livello, la soluzione più corta cresce da 4 a 18 versamenti
  (`tests/water_levels_test.js`); limite di versamenti più stretto ai livelli alti.
- **Dama e Scacchi**: descrizione dei livelli allineata al comportamento reale del computer.
- **iPhone/iPad**: versione web pubblicata su claude.ai (`python3 tools/build_web.py` → `dist/web`): audio in
  pacchetti per lingua, progressi salvati sull'account (`web/cloud-save.js`), niente service worker.
- Robustezza: il salvataggio non blocca mai l'app se la memoria del browser non è disponibile; un solo lettore audio
  riutilizzato (necessario su iPhone); conferma "azzera progressi" con doppio tocco invece di `confirm()`;
  margini per notch e barra in basso dell'iPhone.
- Android: versionName 9.3, versionCode 90300, etichetta "LogicLand v9.3", stesse chiavi della 9.1/9.2.
## 9.2.0
- **Livelli riprogettati**: per 11 giochi una tabella di 15 righe scritta a mano (regola, numero di elementi,
  caratteristiche da confrontare, tipo di domanda, numero e somiglianza delle risposte). Tolto il "salto +3 livelli"
  della 9.1 che rendeva identici i livelli 13–15. Ogni domanda espone un vettore `rank` e il test
  `tests/v92_levels_test.js` controlla che OGNI domanda del livello N+1 sia più difficile di OGNI domanda del livello N.
- Risposte verificate con risolutori indipendenti (sequenze, intruso, cicli di figure, blocchi logici, equazioni,
  piramidi, Sudoku a soluzione unica, calcolo a catena): ~30.000 domande per esecuzione.
- Blocchi Logici rifatto (prima era un doppione di Conta e Scegli): colore/forma/grandezza con E, NON, OPPURE.
- Sudoku: griglia diversa ogni volta (permutazioni), buchi 3→18.
- Schermata "Livello N" prima di ogni livello: cosa cambia, livello precedente, domande, secondi, vite.
- Nuovi giochi: Calcolo Lampo, Griglia Lampo, Uguale o Diverso (N indietro), Colori Furbi (colore/parola),
  Parole Spagnole, Español: Frasi e Ascolto. Totale 28 giochi.
- Lingue: 15 modalità diverse per livello (lettura → immagine → solo ascolto → frasi), fasce di vocabolario,
  autoplay e tasto 🐢 Lento. Le parole senza immagine chiara (ieri/oggi/domani…) non sono usate nei quiz a immagini.
- Sblocco con le stelle (5 / 12 / 20 / 30 ⭐) per i giochi più complessi; "Sblocca tutti" nell'area genitori.
- Audio rifatto con SVOX Pico (EN, IT, ES).
- Android: versionName 9.2, versionCode 90200, etichetta "LogicLand v9.2", stesse chiavi e package della 9.1
  (si installa sopra la 9.1 senza perdere i progressi).
## 8.2.0
- Riscritti Unlock Me, Connect the Dots, Dama e Scacchi Junior con regole reali.
- Unlock Me: 15 puzzle con distanza minima soluzione crescente verificata con ricerca BFS; spostamenti, collisioni, mosse, annulla.
- Connect the Dots: 15 Flow puzzle completi, griglie 4×4 a 7×7, percorsi senza incrocio, obbligo di copertura di tutta la griglia, tap e drag.
- Dama: cattura obbligatoria, catture multiple, promozione e avversario con ricerca a difficoltà crescente.
- Scacchi Junior: movimenti/catture/check/checkmate, avversario e missioni di cattura iniziali (senza arrocco/en passant).
- UI mobile e tablet compattata per mostrare i tabelloni più in alto; pulsanti di controllo più grandi.
- Tutte le parole e registrazioni MP3 offline della v8.1 preservate.
- Versione Android 8.2.0, versionCode 80200, firma/debug/package coerenti con 8.1.
