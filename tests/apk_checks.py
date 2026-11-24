"""Offline structural/signature verification. This does not verify physical installation."""
from pathlib import Path
import sys,zipfile,hashlib,subprocess,importlib.util
ROOT=Path(__file__).resolve().parents[1]
ANDROID=ROOT/'android'
APK_S24=ROOT/'dist'/'LogicLandKids-v9.1-Samsung-S24Ultra.apk'
APK_TAB=ROOT/'dist'/'LogicLandKids-v9.1-Asus-Android6.0.1.apk'
S24=APK_S24
# Build script may produce a generic filename for the tablet before publishing.
if not APK_TAB.exists():APK_TAB=ROOT/'dist'/'LogicLandKids-v7-Asus-Android6-debug.apk'
expected={}
for fn in (APK_S24,APK_TAB):
    assert fn.exists(),fn
    with zipfile.ZipFile(fn) as z:
        assert z.testzip() is None,fn
        n=z.namelist()
        assert {'AndroidManifest.xml','classes.dex','assets/index.html','assets/js/games-new.js','assets/img/unblock.webp','assets/img/chess.webp'}<=set(n),fn
        assert z.read('classes.dex')[:4]==b'dex\n',fn
        files={k:hashlib.sha256(z.read(k)).hexdigest() for k in n if k.startswith('assets/') and not k.endswith('/')}
        expected[fn.name]=files
        assert len(files)>20,(fn,len(files))
    proc=subprocess.run(['jarsigner','-verify',str(fn)],capture_output=True,text=True)
    assert proc.returncode==0,(fn,proc.stderr)
assert expected[APK_S24.name]==expected[APK_TAB.name],'Assets of phone/tablet differ'
import importlib.util
sp=importlib.util.spec_from_file_location('v2sign',ANDROID/'apk_v2_sign.py')
mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
assert mod.verify_v2(APK_S24)['v2'] is True
print('OK: both APKs structurally valid, Android assets identical, JAR signature valid, S24 v2 valid')
for f in [APK_S24,APK_TAB]:
    print(f.name, 'bytes=',f.stat().st_size,'sha256=',hashlib.sha256(f.read_bytes()).hexdigest())
