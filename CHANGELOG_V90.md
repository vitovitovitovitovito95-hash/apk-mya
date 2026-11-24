# LogicLand Kids 9.1 — Difficoltà vera, più logica, nuovo tema

Richiesta: “i giochi non sono più difficili, la grafica è uguale; più logica, giochi di somme”.

## Riconoscibile a colpo d'occhio
- Nome app **“LogicLand v9.1”**, icona con **badge rosso “9”** (S24), etichetta `v9` nell'app, banner “NUOVA VERSIONE 9”.

## Difficoltà per TUTTI i giochi
- I contenuti dei giochi a domande partono **3 livelli più avanti** (il livello 1 ora equivale al vecchio livello 4).
- **6 → 8 domande** per livello (prima 5).
- **Timer per ogni domanda**: da 30 s (L1) a 9 s (L15), doppio tempo per i giochi di ragionamento; allo scadere si perde una vita. Risposta veloce = moneta bonus.
- Tetris: più righe, caduta più veloce, più righe-ostacolo. Macchia Sprint: più ostacoli, più veloce, varchi più stretti.
- Water Sort: 3–6 colori, provette da 4, molti più mescolamenti.
- Dama: il computer ragiona 1–3 mosse avanti fin dal livello 1 e sbaglia molto meno. Scacchi: computer più forte, più catture richieste.

## Nuovi giochi di logica e somme
- ➕ **Somme di Oggetti**: gruppi da sommare, sottrazioni, cestini uguali (moltiplicazione), zampe/ruote, problemi in due passaggi.
- 🧮 **Equazioni con Figure**: ogni frutto vale un numero; da 1 a 4 incognite, con −, × e sistemi (a+b, b+c, a+c).
- 🔺 **Piramide dei Numeri**: ogni mattone è la somma dei due sotto; trova la cima o, nei livelli alti, un numero della base all'indietro con i mattoni intermedi nascosti.
- **Pezzo Mancante** e **Domino dei Colori** (troppo simili) sono stati accorpati in **Sequenze di Figure**. Totale: 22 giochi.

## Nuovo tema grafico “Mondo Magico”
- Sfondo viola-rosa, pulsanti colorati 3D, schede con colore del mondo, etichette “NUOVO”, barra tempo, risposte verde/rosso piene.

---

# LogicLand Kids 9.0 — Livelli più impegnativi, nuova grafica, versione iOS (PWA)

Base: v8.4. Restano 21 giochi × 15 livelli, 3 vite, backup schema 8, audio MP3 offline,
Dama/Scacchi/Unlock Me della v8.4.

## Livelli e complessità (nuovo modulo `src/js/games-v9-levels.js`)
| Gioco | Novità |
|---|---|
| Numero Mancante | 5 tipi di regola: passo fisso (L1–3), numero mancante *dentro* la sequenza anche in discesa (L4–6), aumenti alternati (L7–9), salti che crescono +1,+2,+3… (L10–12), due sequenze intrecciate (L13–15), con termine nascosto a L12 e L15. |
| Chi è l'intruso? | Dal livello 5 l'intruso differisce per **una sola** caratteristica (colore, forma o direzione). |
| Coppie Gemelle | Dal livello 5 molte figure sono “quasi gemelle” (50% a L5–9, 75% a L10–15); i distrattori includono coppie con uno dei due gemelli. |
| Conta e Scegli / Blocchi Logici | Oggetti mescolati in griglia: si conta **solo** il tipo richiesto (1–3 tipi di distrattori), poi le operazioni. |
| Domino dei Colori | Dal livello 8 manca una tessera interna; dal 13 il ciclo contiene un colore ripetuto. |
| Memoria Visiva | Griglia con caselle numerate, barra del tempo, carte che si girano; dal livello 10 anche “quale oggetto NON c'era?”. |

Gli altri giochi mantengono la progressione verificata della v8.3/8.4 (Sudoku, Matrici, Sequenze,
Pezzo Mancante, Ombra, Inglese, Tetris, Macchia Sprint, Water Sort, Connect the Dots, Unlock Me, Dama, Scacchi).

## Grafica e animazioni (`app/css/styles.css` sezione v9, `src/js/fx.js`)
- Sfondo con bolle colorate in movimento, banner con gradiente animato, avatar che ondeggia.
- Schede gioco con entrata a cascata ed effetto pressione.
- Domande che entrano con animazione, risposte che compaiono una alla volta.
- Risposta giusta: rimbalzo + stelline; risposta sbagliata: scossa + vibrazione breve; cuore perso animato.
- Barra di avanzamento con riflesso; livello completato con coppa animata, ricompense e **coriandoli**.
- Suoni: melodie brevi per giusto/sbagliato/vittoria con un solo AudioContext riutilizzato
  (prima ne veniva creato uno nuovo a ogni suono, con rischio di blocco audio dopo molte risposte).
- Corretto: i pulsanti di risposta occupavano metà della colonna nei WebView moderni (S24).
- Tutto rispetta “riduci animazioni” del sistema.

## iOS / iPhone / iPad
- L'app è ora anche una **PWA** installabile da Safari (“Aggiungi a Home”) e funziona offline:
  `app/manifest.webmanifest`, `app/sw.js` (generato da `tools/build_pwa.py`), icone in `app/icons/`.
- `capacitor.config.json` + `docs/IOS.md` per creare l'app nativa .ipa con Xcode.

## Android
- versionCode 90000, versione 9.0. **Nuove chiavi di firma e nuovi package**
  (`com.logicland.kids.v9s24`, `com.logicland.kids.v9asus`) perché le chiavi della v8 non erano disponibili:
  la v9 si installa **accanto** alla v8. Trasferire i progressi con Zona genitori → Backup.

## Verifiche
- Tutti i test esistenti superati + nuovo `tests/v9_levels_test.js` (21.000 domande generate).
- Prova in Chromium: home telefono/tablet, giochi a vari livelli, schermata di vittoria, PWA offline.
- APK: firma v1 verificata (entrambi), v2 verificata (S24), manifest e DEX letti con androguard.
- Installazione su dispositivo fisico: da verificare.
