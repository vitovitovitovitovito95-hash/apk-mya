# Analisi completa dell'app (Playwright)

- `node tools/qa/qa_all.js app` gioca tutti i giochi a tutti i livelli: risponde correttamente a ogni domanda,
  controlla errori JavaScript, opzioni (risposta presente, niente doppioni) ed elementi fuori schermo.
  Variabili: `VW`/`VH` (dimensione schermo, default 384×832), `LEVELS=1,5,15`, `ONLY=31,32`, `WORKERS=4`.
  Usare `dist/web` al posto di `app` per controllare la versione iPhone.
- `node tools/qa/qa_bots.js app` fa giocare i giochi per la mente (70, 71, 72, 74, 75, 77, 78) a un giocatore
  automatico preciso con tempo di reazione `RT` (ms, default 700) e verifica che ogni livello si possa vincere.

Serve Playwright con Chromium (già presente nell'ambiente cloud).
