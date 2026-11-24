# English audio v8.1

The application ships with 465 offline MP3 pronunciations, covering 178 English/Italian vocabulary pairs plus common phrase tokens. Total packaged MP3 data is approximately 3.3 MiB.

Tap the speaker icon to listen. Local MP3 speech is used first; native Android TextToSpeech and browser speechSynthesis are fallback paths. This avoids relying on a TTS engine/voice pack being installed. For dynamically assembled sentences, a token-by-token audio playlist is used if no whole-sentence audio is available.

The voice is the offline espeak synthetic voice (not natural speech). Rebuild with `python tools/build_audio_assets.py` after changing vocabulary; the script requires `espeak` and `ffmpeg` on the build machine, not on the device.
