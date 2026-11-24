#!/usr/bin/env python3
"""Compila l'APK Android di LogicLand Kids: guscio nativo (WebView) + web-app offline di app/.

Uso, dalla radice del progetto:

    python android/build_apk.py

Risultato: dist/LogicLandKids-<versione>.apk (firmato v1+v2+v3, allineato, installabile da Android 8 in su).

Strumenti richiesti, cercati in ANDROID_HOME / ANDROID_SDK_ROOT (Android Studio), poi nel PATH:
  - JDK 17 o 21 (javac, keytool)
  - Android build-tools >= 30: aapt2, d8 (oppure dx), zipalign, apksigner
  - un android.jar di qualsiasi piattaforma con API >= 23
Su Ubuntu/Debian, senza Android Studio:
    sudo apt install aapt dalvik-exchange zipalign apksigner android-sdk-platform-23

Firma (nessun segreto nel repository):
  LLK_KEYSTORE           percorso del keystore (default: dist/LogicLandKids-debug.jks, creato se manca)
  LLK_KEYSTORE_PASSWORD  password del keystore (default per la chiave debug: "android")
  LLK_SIGNING_ALIAS      alias della chiave (default: logicland-debug)
  LLK_KEY_PASSWORD       password della chiave, solo se diversa da quella del keystore (JKS)
Per aggiornare l'app già installata senza perdere i progressi serve SEMPRE la stessa chiave.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB_APP = ROOT / 'app'
SRC = ROOT / 'android' / 'native_app' / 'src' / 'main'
DIST = ROOT / 'dist'
WORK = DIST / 'build'

APP_ID = 'com.logicland.kids'
MIN_SDK = 26          # Android 8.0
TARGET_SDK = 35       # Android 15 (edge-to-edge gestito in MainActivity)
FIXED_TIME = (1981, 1, 1, 1, 1, 2)   # date fisse negli zip: build ripetibili
STORE_EXT = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.ogg', '.m4a', '.wav'}
SKIP_NAMES = {'.DS_Store', 'Thumbs.db', 'desktop.ini'}


def fail(msg):
    sys.exit(f'\n[ERRORE] {msg}')


def run(cmd, **kw):
    print('  $ ' + ' '.join(str(c) for c in cmd))
    res = subprocess.run([str(c) for c in cmd], text=True, capture_output=True, **kw)
    out = (res.stdout or '') + (res.stderr or '')
    if res.returncode != 0:
        fail(f'comando non riuscito (exit {res.returncode}):\n{out.strip()}')
    return out


# ------------------------------------------------------------------ versione e strumenti

def read_version():
    core = (WEB_APP / 'js' / 'core.js').read_text(encoding='utf-8')
    m = re.search(r"NS\.APP_VERSION\s*=\s*'([^']+)'", core)
    if not m:
        fail('NS.APP_VERSION non trovato in app/js/core.js')
    name = m.group(1)
    nums = re.match(r'(\d+)\.(\d+)\.(\d+)', name)
    if not nums:
        fail(f'NS.APP_VERSION "{name}" deve iniziare con MAJOR.MINOR.PATCH')
    major, minor, patch = (int(x) for x in nums.groups())
    code = int(os.environ.get('LLK_VERSION_CODE') or major * 10000 + minor * 100 + patch)
    return name, code


def sdk_roots():
    cands = [os.environ.get('ANDROID_HOME'), os.environ.get('ANDROID_SDK_ROOT'),
             Path.home() / 'Android' / 'Sdk', Path.home() / 'Library' / 'Android' / 'sdk',
             Path(os.environ.get('LOCALAPPDATA', '')) / 'Android' / 'Sdk' if os.name == 'nt' else None,
             '/usr/lib/android-sdk']
    seen, roots = set(), []
    for c in cands:
        if c and Path(c).is_dir() and str(Path(c).resolve()) not in seen:
            seen.add(str(Path(c).resolve()))
            roots.append(Path(c))
    return roots


def version_key(p):
    return [int(x) for x in re.findall(r'\d+', p.name)] or [-1]


def find_tool(name):
    exts = ['.exe', '.bat', ''] if os.name == 'nt' else ['']
    for root in sdk_roots():
        bt = root / 'build-tools'
        if bt.is_dir():
            for ver in sorted((d for d in bt.iterdir() if d.is_dir()), key=version_key, reverse=True):
                for ext in exts:
                    p = ver / (name + ext)
                    if p.is_file():
                        return str(p)
    for ext in exts:
        p = shutil.which(name + ext)
        if p:
            return p
    return None


def find_android_jar():
    best = None
    for root in sdk_roots():
        plats = root / 'platforms'
        if not plats.is_dir():
            continue
        for d in plats.iterdir():
            jar = d / 'android.jar'
            m = re.match(r'android-(\d+)$', d.name)
            if jar.is_file() and m and int(m.group(1)) >= 23:
                if best is None or int(m.group(1)) > best[0]:
                    best = (int(m.group(1)), str(jar))
    return best


def find_jdk_tool(name):
    java_home = os.environ.get('JAVA_HOME')
    if java_home:
        for ext in (['.exe', ''] if os.name == 'nt' else ['']):
            p = Path(java_home) / 'bin' / (name + ext)
            if p.is_file():
                return str(p)
    return shutil.which(name)


def locate_tools():
    tools = {
        'aapt2': find_tool('aapt2'), 'zipalign': find_tool('zipalign'), 'apksigner': find_tool('apksigner'),
        'd8': find_tool('d8'), 'dx': find_tool('dx') or shutil.which('dalvik-exchange'),
        'javac': find_jdk_tool('javac'), 'keytool': find_jdk_tool('keytool'),
    }
    platform = find_android_jar()
    missing = [k for k in ('aapt2', 'zipalign', 'apksigner', 'javac', 'keytool') if not tools[k]]
    if not (tools['d8'] or tools['dx']):
        missing.append('d8 (o dx)')
    if not platform:
        missing.append('android.jar (platforms/android-XX)')
    if missing:
        fail('strumenti mancanti: ' + ', '.join(missing) + '\nInstalla Android Studio (SDK build-tools + una piattaforma) '
             'oppure, su Ubuntu/Debian:\n  sudo apt install aapt dalvik-exchange zipalign apksigner android-sdk-platform-23')
    tools['api'], tools['android_jar'] = platform
    return tools


# ------------------------------------------------------------------ fasi di build

def compile_resources(t, version_name, version_code):
    print('\n[1/5] Risorse e manifest (aapt2)')
    compiled = WORK / 'res-compiled.zip'
    linked = WORK / 'res-linked.apk'
    run([t['aapt2'], 'compile', '--dir', SRC / 'res', '-o', compiled])
    run([t['aapt2'], 'link', '-o', linked, '-I', t['android_jar'], '--manifest', SRC / 'AndroidManifest.xml',
         '--min-sdk-version', MIN_SDK, '--target-sdk-version', TARGET_SDK,
         '--version-code', version_code, '--version-name', version_name, compiled])
    return linked


def compile_java(t):
    print('\n[2/5] Codice Java → DEX')
    classes = WORK / 'classes'
    classes.mkdir(parents=True)
    sources = sorted((SRC / 'java').rglob('*.java'))
    if not sources:
        fail('nessun sorgente Java in android/app/src/main/java')
    run([t['javac'], '-source', '8', '-target', '8', '-bootclasspath', t['android_jar'], '-encoding', 'UTF-8',
         '-Xlint:-options', '-g:source,lines', '-d', classes, *sources])
    dex_dir = WORK / 'dex'
    dex_dir.mkdir()
    if t['d8']:
        class_files = sorted(classes.rglob('*.class'))
        run([t['d8'], '--release', '--min-api', MIN_SDK, '--lib', t['android_jar'], '--output', dex_dir, *class_files])
    else:
        run([t['dx'], '--dex', f'--min-sdk-version={MIN_SDK}', f'--output={dex_dir / "classes.dex"}', classes])
    dex = dex_dir / 'classes.dex'
    if not dex.is_file():
        fail('classes.dex non generato')
    return dex


def zip_add(z, name, data, store):
    info = zipfile.ZipInfo(name, FIXED_TIME)
    info.compress_type = zipfile.ZIP_STORED if store else zipfile.ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    z.writestr(info, data, compresslevel=None if store else 9)


def assemble(linked, dex):
    print('\n[3/5] Assemblaggio APK (manifest, codice, risorse, web-app in assets/)')
    unsigned = WORK / 'unsigned.apk'
    assets = 0
    with zipfile.ZipFile(linked) as src, zipfile.ZipFile(unsigned, 'w') as z:
        entries = {i.filename: src.read(i) for i in src.infolist() if not i.is_dir()}
        zip_add(z, 'AndroidManifest.xml', entries.pop('AndroidManifest.xml'), store=False)
        zip_add(z, 'classes.dex', dex.read_bytes(), store=False)
        # Da targetSdk 30 resources.arsc deve essere non compresso e allineato a 4 byte.
        zip_add(z, 'resources.arsc', entries.pop('resources.arsc'), store=True)
        for name in sorted(entries):
            zip_add(z, name, entries[name], store=Path(name).suffix.lower() in STORE_EXT)
        for f in sorted(WEB_APP.rglob('*')):
            if f.is_file() and f.name not in SKIP_NAMES and not f.name.startswith('.'):
                rel = f.relative_to(WEB_APP).as_posix()
                zip_add(z, 'assets/' + rel, f.read_bytes(), store=f.suffix.lower() in STORE_EXT)
                assets += 1
    print(f'  {assets} file della web-app inclusi in assets/')
    return unsigned


def signing_config(t):
    env = os.environ.copy()
    env.setdefault('LLK_KEYSTORE_PASSWORD', 'android')
    keystore = Path(os.environ.get('LLK_KEYSTORE') or DIST / 'LogicLandKids-debug.jks')
    alias = os.environ.get('LLK_SIGNING_ALIAS', 'logicland-debug')
    if not keystore.exists():
        if os.environ.get('LLK_KEYSTORE'):
            fail(f'keystore non trovato: {keystore}')
        print(f'  Nessun keystore: creo una chiave debug locale in {keystore.relative_to(ROOT)}')
        run([t['keytool'], '-genkeypair', '-keystore', keystore, '-alias', alias,
             '-storepass:env', 'LLK_KEYSTORE_PASSWORD', '-keypass:env', 'LLK_KEYSTORE_PASSWORD',
             '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000',
             '-dname', 'CN=LogicLand Kids Debug, O=Local Build, C=IT'], env=env)
    return keystore, alias, env


def align_and_sign(t, unsigned, out_apk):
    print('\n[4/5] Allineamento (zipalign) e firma v1+v2+v3 (apksigner)')
    aligned = WORK / 'aligned.apk'
    run([t['zipalign'], '-p', '-f', '4', unsigned, aligned])
    keystore, alias, env = signing_config(t)
    cmd = [t['apksigner'], 'sign', '--ks', keystore, '--ks-key-alias', alias,
           '--ks-pass', 'env:LLK_KEYSTORE_PASSWORD']
    if env.get('LLK_KEY_PASSWORD'):
        cmd += ['--key-pass', 'env:LLK_KEY_PASSWORD']
    cmd += ['--min-sdk-version', MIN_SDK, '--v1-signing-enabled', 'true', '--v2-signing-enabled', 'true',
            '--v3-signing-enabled', 'true', '--v4-signing-enabled', 'false', '--out', out_apk, aligned]
    if out_apk.exists():
        out_apk.unlink()
    run(cmd, env=env)
    return keystore


def verify(t, apk):
    print('\n[5/5] Verifica')
    # --min-sdk-version 21 fa verificare anche la firma v1 (JAR), oltre a v2/v3.
    out = run([t['apksigner'], 'verify', '--verbose', '--print-certs', '--min-sdk-version', '21', apk])
    run([t['zipalign'], '-c', '-p', '4', apk])
    schemes = {}
    for s in ('v1', 'v2', 'v3'):
        m = re.search(rf'Verified using {s} scheme[^:\n]*:\s*(true|false)', out)
        schemes[s] = bool(m and m.group(1) == 'true')
    if not (schemes['v2'] and schemes['v3']):
        fail('firma v2/v3 non verificata:\n' + out)
    cert = re.search(r'certificate SHA-256 digest: ([0-9a-f]+)', out)
    return schemes, cert.group(1) if cert else None


def build():
    version_name, version_code = read_version()
    t = locate_tools()
    print(f'LogicLand Kids {version_name} (versionCode {version_code}) — android.jar API {t["api"]}, '
          f'dex: {"d8" if t["d8"] else "dx"}')
    DIST.mkdir(exist_ok=True)
    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True)

    linked = compile_resources(t, version_name, version_code)
    dex = compile_java(t)
    unsigned = assemble(linked, dex)
    out_apk = DIST / f'LogicLandKids-{version_name}.apk'
    keystore = align_and_sign(t, unsigned, out_apk)
    schemes, cert = verify(t, out_apk)

    data = out_apk.read_bytes()
    print('\n' + json.dumps({
        'apk': str(out_apk.relative_to(ROOT)), 'package': APP_ID,
        'versionName': version_name, 'versionCode': version_code,
        'minSdk': MIN_SDK, 'targetSdk': TARGET_SDK, 'size_bytes': len(data),
        'sha256': hashlib.sha256(data).hexdigest(), 'signature_schemes': schemes,
        'signer_cert_sha256': cert, 'keystore': str(keystore),
    }, indent=2))


if __name__ == '__main__':
    build()
