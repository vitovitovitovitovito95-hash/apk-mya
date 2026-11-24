# Due pipeline Android

**Samsung S24 Ultra**: `python android/build_s24_v5native.py`, usa `android/working-v5.0.1.apk` come base nativa testata dall'utente. Vengono sostituiti gli asset locali ed emessi `dist/LogicLandKids-v8-Samsung-S24Ultra.apk` firmato v1+v2. La firma proviene da `dist/LogicLandKids-v8-debug.p12` (alias `logicland-v8`).

**Asus Android 6.0.1**: `python android/build_apk.py`; genera `dist/LogicLandKids-v8-Asus-Android6.0.1.apk` per API23 con JS ES5. Firma v1 mediante `dist/LogicLandKids-debug.jks` (alias `logicland-debug`).

**Opzione build nativa standard**: `android/build_android_native.py` conserva la pipeline originaria Claude (aapt2, javac, d8, zipalign, apksigner), richiede Android SDK e necessita di adattamento dei package/target per la build duale. Non è il builder usato per i file consegnati.

Le chiavi debug non sono nel ZIP sorgente: senza i keystore originali non si possono installare aggiornamenti firmati diversamente sopra lo stesso package. Una installazione con package nuovo è distinta e richiede importazione di backup. Chiave privata: conservarla fuori da chat pubbliche e repository.
