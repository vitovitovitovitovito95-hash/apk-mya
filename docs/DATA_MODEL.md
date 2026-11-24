# Data model v6

`schema = 6`.

Lo stato persistente contiene profilo (età fissata al percorso 6 anni), impostazioni, economia, statistiche generali, stato dei 14 giochi correnti (`level`, `wins`, `best`, `correct`, `wrong`, `lastPlayed`), progresso inglese e missione giornaliera.

Formato backup corrente: `LLK6.<checksum>.<base64-json>`.

Sono importabili LLK2, LLK3, LLK4 e LLK5. Durante la migrazione vengono conservati i giochi ancora presenti nel catalogo attivo; i vecchi giochi fuori dal percorso 6 anni non vengono caricati nello stato operativo.
