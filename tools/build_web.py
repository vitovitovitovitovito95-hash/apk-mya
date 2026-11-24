#!/usr/bin/env python3
"""Versione web per iPhone/iPad (pubblicata come pagina su claude.ai).

Copia app/ in dist/web/, toglie il service worker (non consentito nella pagina
ospitata) e aggiunge web/cloud-save.js per salvare i progressi nel cloud.
L'APK Android NON usa questa cartella.
"""
import os, shutil, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'app'); OUT=os.path.join(ROOT,'dist','web')
if os.path.isdir(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC,OUT,ignore=shutil.ignore_patterns('sw.js','audio'))
shutil.copy(os.path.join(ROOT,'web','cloud-save.js'),os.path.join(OUT,'js','cloud-save.js'))
shutil.copy(os.path.join(ROOT,'web','audio-pack.js'),os.path.join(OUT,'js','audio-pack.js'))
# un pacchetto audio per lingua: {nomefile: base64}
import base64, json
os.makedirs(os.path.join(OUT,'audio'),exist_ok=True)
for lang in sorted(os.listdir(os.path.join(SRC,'audio'))):
    d=os.path.join(SRC,'audio',lang)
    if not os.path.isdir(d): continue
    pack={f:base64.b64encode(open(os.path.join(d,f),'rb').read()).decode() for f in sorted(os.listdir(d)) if f.endswith('.mp3')}
    json.dump(pack,open(os.path.join(OUT,'audio',lang+'.json'),'w'),separators=(',',':'))
    print('pack',lang,len(pack),'file')
p=os.path.join(OUT,'index.html'); html=open(p,encoding='utf-8').read()
tag='<script src="js/app.js"></script>'
assert tag in html
html=html.replace(tag,tag+'\n  <script src="js/cloud-save.js"></script>')
html=html.replace('<script src="js/games-english.js"></script>','<script src="js/audio-pack.js"></script>\n  <script src="js/games-english.js"></script>')
html=html.replace('<script src="js/polyfills.js"></script>','<script>window.LLK_NO_SW=true;</script>\n  <script src="js/polyfills.js"></script>')
open(p,'w',encoding='utf-8').write(html)
n=sum(len(f) for _,_,f in os.walk(OUT))
print('web build:',OUT,n,'file')
