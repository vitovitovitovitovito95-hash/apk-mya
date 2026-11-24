#!/usr/bin/env python3
"""Build native-S24 APK starting from the user's proven-installable v5.0.1 binary native shell.
Preserve original working classes.dex, resources.arsc and launcher resources; replace
only local web assets + package/version in compiled manifest, then sign with JAR/v1
and APK Signature Scheme v2. The signing key is new because the original v5
private key was not supplied. Thus a unique package name is required.
"""
from pathlib import Path
import os, sys, struct, zipfile, subprocess, hashlib, shutil, json
from apk_v2_sign import sign_v2, verify_v2
ROOT=Path(__file__).resolve().parents[1]
TPL=ROOT/'android'/'working-v5.0.1.apk'
ASSETS=ROOT/'app'
OUT=ROOT/'dist'
PACKAGE='com.logicland.kids.v9s24'
ACTIVITY='com.logicland.kids.MainActivity'
VERSION='9.2.0'
VERSION_CODE=90200


def axml_patch(data):
    if struct.unpack_from('<H',data,0)[0]!=3: raise RuntimeError('Expected AXML')
    off=8
    typ,hs,size=struct.unpack_from('<HHI',data,off)
    if typ!=1: raise RuntimeError('Expected string pool')
    n,styles,flags,string_start,styles_start=struct.unpack_from('<IIIII',data,off+8)
    if flags & 0x100: raise RuntimeError('Expected UTF16 pool, got UTF8')
    offsets=struct.unpack_from('<'+'I'*n,data,off+28)
    strings=[]
    for x in offsets:
        i=off+string_start+x
        nchars=struct.unpack_from('<H',data,i)[0]; i+=2
        if nchars & 0x8000:
            nchars=((nchars & 0x7fff)<<16)|struct.unpack_from('<H',data,i)[0];i+=2
        strings.append(data[i:i+2*nchars].decode('utf-16-le'))
    assert 'com.logicland.kids' in strings and '.MainActivity' in strings
    replace={'com.logicland.kids':PACKAGE,'.MainActivity':ACTIVITY,'5.0.1':VERSION}
    strings=[replace.get(s,s) for s in strings]
    b=bytearray(); newoffset=[]
    for s in strings:
        newoffset.append(len(b))
        units=len(s.encode('utf-16-le'))//2
        if units>=0x8000:
            b+=struct.pack('<HH',((units>>16)|0x8000),units&0xffff)
        else: b+=struct.pack('<H',units)
        b+=s.encode('utf-16-le')+b'\x00\x00'
    while len(b)%4:b.append(0)
    new_start=28+4*n
    new_size=new_start+len(b)
    pool=bytearray(struct.pack('<HHI',1,28,new_size))
    pool+=struct.pack('<IIIII',n,0,flags,new_start,0)
    pool+=struct.pack('<'+'I'*n,*newoffset)+b
    result=bytearray(data[:8]+pool+data[off+size:])
    struct.pack_into('<I',result,4,len(result))
    # patch actual manifest versionCode int to 70200 while keeping original numeric type.
    # AXML start elements have type 0x0102, attribute size normally 20.
    pos=8+len(pool)
    found=False
    while pos<len(result):
        ctype,hsize,csize=struct.unpack_from('<HHI',result,pos)
        if csize<8: raise RuntimeError('Bad XML chunk')
        if ctype==0x102:
            name_idx=struct.unpack_from('<I',result,pos+20)[0]
            if strings[name_idx]=='manifest':
                attr_start,attr_size,count=struct.unpack_from('<HHH',result,pos+24)
                # struct at pos+16: ns u32,name u32, attrStart u16 attrSize u16 attrCount u16...
                attr_start,attr_size,count=struct.unpack_from('<HHH',result,pos+24)
                for i in range(count):
                    aa=pos+16+attr_start+i*attr_size
                    attr_name=struct.unpack_from('<I',result,aa+4)[0]
                    if strings[attr_name]=='versionCode':
                        assert result[aa+15]==0x10, ('versionCode wrong type', result[aa+15])
                        struct.pack_into('<I',result,aa+16,VERSION_CODE)
                        found=True
                break
        pos+=csize
    if not found:raise RuntimeError('Missing versionCode in compiled AXML')
    assert len(result)==struct.unpack_from('<I',result,4)[0]
    return bytes(result)


def patch_resource_package(data):
    """Keep the known-good compiled resource table, changing only its package-name field.
    This prevents a manifest/resources namespace mismatch for the isolated S24 app.
    """
    d=bytearray(data)
    if struct.unpack_from('<H',d,0)[0]!=2:raise RuntimeError('Expected Android resources table')
    pos=struct.unpack_from('<H',d,0)[0] # overwritten below: table header size is at byte 2
    pos=struct.unpack_from('<H',d,2)[0]
    found=False
    while pos<len(d):
        typ,head,size=struct.unpack_from('<HHI',d,pos)
        if typ==0x0200:
            old=d[pos+12:pos+268].decode('utf-16-le').split('\0')[0]
            if old!='com.logicland.kids':raise RuntimeError('Unexpected original resource package: '+old)
            encoded=PACKAGE.encode('utf-16-le')
            if len(encoded)>254:raise RuntimeError('New package too long')
            d[pos+12:pos+268]=encoded+b'\0'*(256-len(encoded))
            found=True
            break
        if size<8:break
        pos+=size
    if not found:raise RuntimeError('No resource package chunk')
    # v9: app label visibly different from v8 (same byte length keeps every string-pool offset valid).
    old_label=b'\x0e\x0eLogicLand Kids\x00';new_label=b'\x0e\x0eLogicLand v9.2\x00'
    assert len(old_label)==len(new_label) and bytes(d).count(old_label)==1,'App label not found in resources.arsc'
    i=bytes(d).find(old_label);d[i:i+len(old_label)]=new_label
    return bytes(d)

def addfile(z,path,data,orig=None):
    meta=zipfile.ZipInfo(path,(1981,1,1,1,1,2))
    meta.compress_type=zipfile.ZIP_STORED if (path=='resources.arsc' or path.endswith(('.png','.jpg','.jpeg','.webp','.ogg','.mp3'))) else zipfile.ZIP_DEFLATED
    meta.external_attr=0o100644<<16
    # Maintain required Android 11+ resources.arsc alignment (and other stored files).
    if meta.compress_type==zipfile.ZIP_STORED:
        cur=z.fp.tell() if z.fp else 0
        base=cur+30+len(path.encode('utf-8'))
        pad=(-(base+4))%4
        meta.extra=struct.pack('<HH',0xD935,pad)+b'\x00'*pad
    z.writestr(meta,data,compresslevel=9)


def zipalign_v1(source, destination):
    """Align uncompressed ZIP entries after jarsigner (v1 signatures cover entry contents, not ZIP headers)."""
    with zipfile.ZipFile(source) as original, zipfile.ZipFile(destination,'w') as result:
        for info in original.infolist():
            if info.is_dir(): continue
            addfile(result,info.filename,original.read(info.filename))
    with zipfile.ZipFile(destination) as z:
        item=z.getinfo('resources.arsc')
        offset=item.header_offset+30+len(item.filename.encode())+len(item.extra)
        if item.compress_type!=zipfile.ZIP_STORED or offset%4:
            raise RuntimeError('resources.arsc not stored/aligned after v1 signing')

def build():
    OUT.mkdir(parents=True,exist_ok=True)
    template=zipfile.ZipFile(TPL)
    assert template.read('classes.dex')[:4]==b'dex\n'
    unsigned=OUT/'tmp-unsigned.apk'
    with zipfile.ZipFile(unsigned,'w') as z:
        for item in template.infolist():
            if item.is_dir() or item.filename.startswith('META-INF/') or item.filename.startswith('assets/'):
                continue
            data=template.read(item.filename)
            if item.filename=='AndroidManifest.xml':data=axml_patch(data)
            if item.filename=='resources.arsc':data=patch_resource_package(data)
            badge=ROOT/'android'/'icons_v9'/item.filename.replace('/','__')
            if badge.exists():data=badge.read_bytes()  # v9: launcher icon with a "9" badge
            addfile(z,item.filename,data)
        for path in sorted(ASSETS.rglob('*')):
            if path.is_file():
                addfile(z,'assets/'+path.relative_to(ASSETS).as_posix(),path.read_bytes())
    ks=Path(os.environ.get('LLK_S24_KEYSTORE',OUT/'LogicLandKids-v9-s24.p12'))
    pw=os.environ.get('LLK_PASSWORD','android')
    if not ks.exists():
        subprocess.run(['keytool','-genkeypair','-storetype','PKCS12','-keystore',str(ks),'-storepass',pw,'-keypass',pw,'-alias','logicland-v8','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=LogicLand Kids v9 S24,O=Local Build,C=IT'],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    jarsigned=OUT/'tmp-v1.apk'
    shutil.copyfile(unsigned,jarsigned)
    subprocess.run(['jarsigner','-keystore',str(ks),'-storepass',pw,'-keypass',pw,'-sigalg','SHA256withRSA','-digestalg','SHA-256',str(jarsigned),'logicland-v8'],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    aligned=OUT/'tmp-v1-aligned.apk'
    zipalign_v1(jarsigned,aligned)
    signed=OUT/'LogicLandKids-v9.2-Samsung-S24Ultra.apk'
    sign_v2(aligned,signed,ks,pw)
    verify2=verify_v2(signed)
    v1=subprocess.run(['jarsigner','-verify',str(signed)],capture_output=True,text=True)
    if v1.returncode!=0 or 'jar verified' not in (v1.stdout+v1.stderr).lower():
        raise RuntimeError('JAR/v1 verification failed: '+v1.stdout+'\n'+v1.stderr)
    with zipfile.ZipFile(signed) as z:
        assert z.testzip() is None
        assert z.read('classes.dex')==template.read('classes.dex')
        assert z.read('resources.arsc')==patch_resource_package(template.read('resources.arsc'))
        assert len([n for n in z.namelist() if n.startswith('assets/js/')])>=10
        item=z.getinfo('resources.arsc')
        assert item.compress_type==zipfile.ZIP_STORED
        assert (item.header_offset+30+len(item.filename.encode())+len(item.extra))%4==0
    print(json.dumps({'apk':str(signed),'bytes':signed.stat().st_size,'sha256':hashlib.sha256(signed.read_bytes()).hexdigest(),'package':PACKAGE,'versionCode':VERSION_CODE,'v1_verified':v1.returncode==0,'v2':verify2,'classes.dex_identical_to_working_v5':True,'resources.arsc_identical_except_package_name':True},indent=2))
    return signed

if __name__=='__main__':build()
