# Changelog
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
