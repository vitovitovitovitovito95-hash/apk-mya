# Audio offline (v9.2)

Tutte le parole e le frasi dei giochi di lingua hanno un MP3 nell'app: inglese (voce en-GB), spagnolo (es-ES)
e le frasi italiane di aiuto (it-IT). Totale circa 785 file, 5,1 MiB, in `app/audio/{en,it,es}/`.
L'indice `app/js/audio-index.js` usa chiavi `lingua|testo` (es. `en|apple`, `es|el gato`, `es|el gato duerme.`).

- Voce: **SVOX Pico** (`pico2wave`, pacchetto `libttspico-utils`), più naturale della vecchia espeak.
  Post-elaborazione con ffmpeg: taglio silenzi, volume +50%, MP3 mono 16 kHz 40 kbit/s.
- Rigenerare dopo modifiche al vocabolario: `python3 tools/build_audio_v92.py` (serve solo sulla macchina di build).
- Nell'app: le modalità di ascolto partono da sole dopo 0,45 s; 🔊 riascolta, 🐢 Lento riproduce al 72% della velocità.
  Dopo ogni risposta la parola giusta viene pronunciata.
- Ordine di ricerca: MP3 della frase intera → MP3 parola per parola → TTS nativo Android (solo inglese) → messaggio.
