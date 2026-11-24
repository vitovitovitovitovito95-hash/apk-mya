#!/usr/bin/env python3
"""Genera app/sw.js con l'elenco di tutti i file da salvare offline (PWA per iPhone/iPad).
Eseguire dopo ogni modifica a app/ (lo fanno anche build_all.sh e il workflow GitHub Pages)."""
import hashlib, json
from pathlib import Path
APP = Path(__file__).resolve().parents[1] / 'app'
files = sorted(p.relative_to(APP).as_posix() for p in APP.rglob('*') if p.is_file() and p.name != 'sw.js')
digest = hashlib.sha256()
for f in files:
    digest.update(f.encode()); digest.update((APP / f).read_bytes())
version = digest.hexdigest()[:12]
sw = f"""/* Generato da tools/build_pwa.py — non modificare a mano. */
var CACHE='logicland-{version}';
var FILES={json.dumps(['./'] + files)};
self.addEventListener('install',function(e){{e.waitUntil(caches.open(CACHE).then(function(c){{return c.addAll(FILES);}}).then(function(){{return self.skipWaiting();}}));}});
self.addEventListener('activate',function(e){{e.waitUntil(caches.keys().then(function(keys){{return Promise.all(keys.filter(function(k){{return k!==CACHE;}}).map(function(k){{return caches.delete(k);}}));}}).then(function(){{return self.clients.claim();}}));}});
self.addEventListener('fetch',function(e){{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{{ignoreSearch:true}}).then(function(r){{return r||fetch(e.request);}}));}});
"""
(APP / 'sw.js').write_text(sw, encoding='utf-8')
print(f'sw.js: {len(files)} file in cache, versione {version}')
