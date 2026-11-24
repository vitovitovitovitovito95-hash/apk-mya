#!/usr/bin/env python3
"""v9.2 — Rigenera TUTTO l'audio offline con la voce SVOX Pico (molto più naturale di espeak):
inglese (en-GB), italiano (it-IT) e spagnolo (es-ES). Requisiti sul PC di build:
`pico2wave` (pacchetto libttspico-utils), `ffmpeg`, `node`. Sul dispositivo non serve nulla."""
import hashlib, json, re, subprocess, tempfile, os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'app'; DEST = APP / 'audio'; JS = APP / 'js' / 'audio-index.js'
dump = subprocess.run(['node', '-e', r"""
global.window=global;global.LogicLand={};const vm=require('vm'),fs=require('fs');
for(const f of ['core.js','data.js','data-es.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'));
const N=LogicLand;console.log(JSON.stringify({words:N.WORDS,sen:N.SENTENCES,ses:N.SENTENCES_ES}));
""", str(APP / 'js')], capture_output=True, text=True, check=True)
data = json.loads(dump.stdout)
old = {}
if JS.exists():
    m = re.search(r'AUDIO_INDEX = (\{.*\});', JS.read_text(encoding='utf-8'), re.S)
    if m: old = json.loads(m.group(1))
items = set()
def add(lang, text):
    text = str(text).strip()
    if text: items.add((lang, text))
# Copertura precedente (parole, frasi e token inglesi/italiani) + spagnolo.
for key in old:
    lang, text = key.split('|', 1); add(lang, text)
byen = {w['en']: w for w in data['words']}
for w in data['words']:
    add('en', w['en']); add('it', w['it'])
    if w.get('es'):
        add('es', w['es']); add('es', re.sub(r'^(el|la|los|las)\s+', '', w['es']))
for s in data['sen']: add('en', s['s'].replace('___', s['a']))
for s in data['ses']:
    bare = re.sub(r'^(el|la|los|las)\s+', '', byen[s['a']]['es'])
    add('es', s['s'].replace('___', bare))
VOICE = {'en': 'en-GB', 'it': 'it-IT', 'es': 'es-ES'}
DEST.mkdir(parents=True, exist_ok=True)
def produce(entry):
    lang, text = entry
    norm = lang + '|' + text.casefold()
    fn = f"{lang}/{hashlib.sha256(('pico|' + norm).encode()).hexdigest()[:20]}.mp3"
    dst = DEST / fn; dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        with tempfile.TemporaryDirectory() as td:
            wav = os.path.join(td, 'a.wav')
            say = text if re.search(r'[.?!]$', text) else text + '.'
            r = subprocess.run(['pico2wave', '-l', VOICE[lang], '-w', wav, say], capture_output=True)
            if r.returncode or not os.path.exists(wav): return norm, fn, 'pico failed'
            p = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
                                '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,apad=pad_dur=0.12,volume=1.5',
                                '-codec:a', 'libmp3lame', '-b:a', '40k', '-ar', '16000', '-ac', '1', str(dst)], capture_output=True)
            if p.returncode or dst.stat().st_size < 400: return norm, fn, p.stderr[:200]
    return norm, fn, None
index, errors = {}, []
with ThreadPoolExecutor(max_workers=12) as pool:
    for norm, fn, err in pool.map(produce, sorted(items)):
        (errors.append((norm, err)) if err else index.__setitem__(norm, fn))
if errors: raise SystemExit('Errori audio: %r' % errors[:5])
used = set(index.values())
for f in DEST.rglob('*.mp3'):
    if f.relative_to(DEST).as_posix() not in used: f.unlink()
JS.write_text('/* Auto-generato da tools/build_audio_v92.py (voce SVOX Pico, offline). */\nwindow.LogicLand = window.LogicLand || {};\nwindow.LogicLand.AUDIO_INDEX = '
              + json.dumps(index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n', encoding='utf-8')
size = sum(f.stat().st_size for f in DEST.rglob('*.mp3'))
print(json.dumps({'files': len(index), 'by_lang': {l: sum(1 for k in index if k.startswith(l + '|')) for l in VOICE}, 'MiB': round(size / 1048576, 2)}))
