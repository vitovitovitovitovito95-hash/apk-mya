# LogicLand Kids v8.3 — Progressione reale L1→L15 (solo contenuti/livelli)

La v8.3 modifica **solo la difficoltà dei livelli**. Conserva 21 giochi, 15 livelli,
3 vite, tasto “Livello successivo”, salvataggi schema 8, grafica e MP3 offline della v8.2.

## Parametri effettivamente calcolati negli esercizi

| Gioco | Cambiamento osservabile a ogni avanzamento |
|---|---|
| Numero Mancante | La sequenza contiene sempre un termine in più; aumentano passi e regole (semplice → alternata → intrecciata). |
| Sudoku Junior | +1 casella nascosta per livello: da 2 a 16, su griglie 4×4 e 6×6; viene verificata una sola soluzione completa. |
| Chi è l'intruso? | +1 figura da confrontare ogni livello; si aggiungono attributi colore, forma, orientamento. |
| Sequenze di Figure | +1 tessera per livello, aumento dei cicli e delle caratteristiche simultanee. |
| Matrici Logiche | +1 tessera nascosta per livello, dimensione crescente da 3×3 a 6×6 e regole di colore/forma più complesse. |
| Blocchi Logici | +1 blocco da contare per livello; successivamente richiede 2–4 passaggi con addizioni/sottrazioni. |
| Memoria Visiva | +1 immagine da ricordare per livello, con esposizione più breve a ogni passaggio. |
| English Picture Match | Lessico in 15 gruppi non sovrapposti ordinati per difficoltà lessicale (banda e lunghezza), da A1 ad A2/B1; più scelte e meno indizi. Audio preservato. |
| Pezzo Mancante | +1 pezzo nel pattern a ogni livello; spazio mancante interno e più regole. |
| Conta e Scegli | +1 oggetto da contare per livello, poi più calcoli concatenati. |
| Ombra Giusta | +1 forma nella figura composta per livello, con alternative che differiscono di un solo pezzo. |
| Coppie Gemelle | +1 oggetto nel confronto per livello; cresce il numero di attributi da osservare. |
| Prime Parole Inglesi | Traduzione, ascolto, associazioni categoriali e intruso lessicale; ciascun livello presenta vocaboli di una fascia lessicale successiva, fino a B1. Audio preservato. |
| Domino dei Colori | +1 tessera mostrata per livello e cicli cromatici più lunghi. |
| Tetris Junior | +1 riga obiettivo ogni livello, caduta più rapida, più pezzi e ostacoli. |
| Macchia Sprint | +1 ostacolo da superare, più velocità e varchi meno ampi a ogni livello. |
| Unlock Me | 15 configurazioni BFS verificate: soluzione minima da 1 a 19 scorrimenti, strettamente crescente. |
| Connect the Dots | Tabelloni sempre risolvibili, dimensione e coppie crescenti; a parità di questi parametri i percorsi sono ordinati per numero di curve. |
| Water Sort Puzzle | +2 tentativi di mescolamento per livello, con colori e capacità crescenti. |
| Dama Junior | Crescono progressivamente pedine presenti, probabilità di scelta ottima e profondità di ricerca del bot. |
| Scacchi Junior | Aumentano pezzi/pedoni, obiettivi di cattura, precisione del bot e profondità di ricerca; ultimi livelli a scacco matto. |

## Cosa dimostrano i test
- `tests/v83_actual_difficulty_test.js` verifica dimensioni/indizi reali e risposte per i 14 giochi a domande.
- `tests/v82_mechanics_test.js` conferma regole e solubilità dei puzzle.
- `tests/progression_test.js` controlla i profili Tetris/Macchia e gli altri giochi.
- `tests/smoke_test.js` genera 10.500 domande e verifica opzioni e risposte.

**Nota sulla misurazione:** aumentando la complessità osservabile del contenuto si ottiene
una progressione più controllata; non è matematicamente possibile garantire che ogni singolo
esercizio generato al livello N+1 sia percepito più difficile da qualunque bambino di ogni
esercizio del livello N. I parametri e il controllo delle regole evitano aumenti soltanto nominali.
