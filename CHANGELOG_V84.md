# LogicLand Kids 8.4 — Interventi mirati

**Base: v8.3.** Inalterati gli altri 18 giochi, le immagini, l'audio offline, i progressi/schema 8, le 3 vite, il pulsante livello successivo e la rotazione generale.

## Dama Junior
- Scacchiera 8×8 con larghezza e altezza delle **64 caselle identiche in pixel**. Ridisegno automatico alla rotazione.
- **24 pedine dalla prima partita:** 12 bianche e 12 nere su caselle scure.
- Regole preesistenti conservate (catture obbligatorie, multiple, promozione).
- Più abilità del computer man mano che aumenta il livello: profondità di ricerca crescente e minore probabilità di mosse casuali a *ogni* livello (anche quando la profondità non cambia).

## Scacchi Junior
- Apertura in posizione standard con **32 pezzi dall'inizio**, sempre, a tutti i 15 livelli.
- 64 caselle identiche anche al ruotare del telefono/tablet.
- Obiettivi di cattura crescenti per i primi 10 livelli, quindi missione di scacco matto. Gioco avversario progressivamente più forte.
- Conservate le regole Junior già presenti (senza arrocco ed en passant).

## Unlock Me
- Nessun pulsante direzionale. **Trascina il blocco** sotto il dito o con il mouse, in orizzontale/verticale a seconda del suo asse.
- Anteprima fluida del movimento, collisioni valide, aggancio alle caselle al rilascio; possibili spostamenti di varie caselle con un solo trascinamento.
- Rimangono Annulla, Aiuto e Ricomincia. I 15 puzzle verificati dalla v8.3 sono invariati.

## Verifiche
- Test automatici di tutti i 21 giochi e di ogni livello.
- Nuovo test v84_board_drag_test.js su **15 livelli** di Dama, Scacchi e Unlock Me.
- Prova grafica in Chromium sul layout portrait / landscape, e prova reale della logica di trascinamento tramite input simulato.
- APK Samsung/Asus firmati con le stesse chiavi della 8.3, codice versione 80400.
