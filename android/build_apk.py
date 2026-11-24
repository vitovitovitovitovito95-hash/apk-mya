import os, struct, hashlib, zlib, zipfile, subprocess, shutil, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'app'
BUILD=ROOT/'dist'
BUILD.mkdir(exist_ok=True)
PKG='com.logicland.kids.v9asus'
MAIN_CLASS='Lcom/logicland/kids/v9asus/MainActivity;'
NO=0xffffffff

def uleb(n):
    out=bytearray()
    while True:
        b=n&0x7f; n>>=7
        if n: out.append(b|0x80)
        else: out.append(b); return bytes(out)

def align(buf,n=4):
    while len(buf)%n: buf.append(0)

def dex_build():
    # Descriptors and strings needed by bytecode.
    descs=[
      'Landroid/app/Activity;','Landroid/content/Context;','Landroid/os/Bundle;',
      'Landroid/view/View;','Landroid/webkit/WebView;','Landroid/webkit/WebSettings;',
      'Ljava/lang/String;',MAIN_CLASS,'V','Z','I'
    ]
    method_defs=[
      ('Landroid/app/Activity;','<init>',('V',())),
      ('Landroid/app/Activity;','onCreate',('V',('Landroid/os/Bundle;',))),
      ('Landroid/app/Activity;','setContentView',('V',('Landroid/view/View;',))),
      ('Landroid/app/Activity;','requestWindowFeature',('Z',('I',))),
      ('Landroid/webkit/WebView;','<init>',('V',('Landroid/content/Context;',))),
      ('Landroid/webkit/WebView;','getSettings',('Landroid/webkit/WebSettings;',())),
      ('Landroid/webkit/WebView;','loadUrl',('V',('Ljava/lang/String;',))),
      ('Landroid/webkit/WebSettings;','setJavaScriptEnabled',('V',('Z',))),
      ('Landroid/webkit/WebSettings;','setDomStorageEnabled',('V',('Z',))),
      (MAIN_CLASS,'<init>',('V',())),
      (MAIN_CLASS,'onCreate',('V',('Landroid/os/Bundle;',))),
    ]
    def shorty(ret,params):
        def s(t): return t if len(t)==1 else 'L'
        return s(ret)+''.join(s(p) for p in params)
    proto_specs=set(m[2] for m in method_defs)
    strings=set(descs)
    strings.update(m[1] for m in method_defs)
    strings.update(shorty(*p) for p in proto_specs)
    strings.add('file:///android_asset/index.html')
    strings=sorted(strings)
    sidx={s:i for i,s in enumerate(strings)}
    types=sorted(descs,key=lambda d:sidx[d])
    tidx={d:i for i,d in enumerate(types)}
    # Sort prototypes by return type then parameter type indices, close to dex canonical order.
    protos=sorted(proto_specs,key=lambda p:(tidx[p[0]], tuple(tidx[x] for x in p[1])))
    pidx={p:i for i,p in enumerate(protos)}
    methods=sorted(method_defs,key=lambda m:(tidx[m[0]],sidx[m[1]],pidx[m[2]]))
    midx={m:i for i,m in enumerate(methods)}

    header_size=0x70
    string_ids_off=header_size
    type_ids_off=string_ids_off+4*len(strings)
    proto_ids_off=type_ids_off+4*len(types)
    method_ids_off=proto_ids_off+12*len(protos)
    class_defs_off=method_ids_off+8*len(methods)
    data_off=(class_defs_off+32+3)&~3
    data=bytearray()

    # Parameter type lists.
    param_off={}
    for p in protos:
        params=p[1]
        if not params: continue
        key=tuple(params)
        if key in param_off: continue
        align(data,4); off=data_off+len(data); param_off[key]=off
        data+=struct.pack('<I',len(params))
        for t in params: data+=struct.pack('<H',tidx[t])
        if len(params)%2: data+=b'\x00\x00'

    # String data.
    str_off={}
    for s in strings:
        off=data_off+len(data); str_off[s]=off
        b=s.encode('utf-8')
        # All strings used are ASCII, so UTF-16 code unit length == len chars.
        data+=uleb(len(s))+b+b'\x00'

    # Code items need method ids known now.
    align(data,4)
    def ins_invoke(op, method, regs):
        A=len(regs); regs=regs+[0]*(5-len(regs)); C,D,E,F,G=regs[:5]
        return [op | ((G&0xf)<<8) | ((A&0xf)<<12), midx[method], (C&0xf)|((D&0xf)<<4)|((E&0xf)<<8)|((F&0xf)<<12)]
    def code_item(registers,ins,outs,units):
        b=bytearray(struct.pack('<HHHHII',registers,ins,outs,0,0,len(units)))
        for u in units: b+=struct.pack('<H',u)
        return b
    act_init=('Landroid/app/Activity;','<init>',('V',()))
    act_onc=('Landroid/app/Activity;','onCreate',('V',('Landroid/os/Bundle;',)))
    set_content=('Landroid/app/Activity;','setContentView',('V',('Landroid/view/View;',)))
    req_feat=('Landroid/app/Activity;','requestWindowFeature',('Z',('I',)))
    wv_init=('Landroid/webkit/WebView;','<init>',('V',('Landroid/content/Context;',)))
    get_settings=('Landroid/webkit/WebView;','getSettings',('Landroid/webkit/WebSettings;',()))
    load_url=('Landroid/webkit/WebView;','loadUrl',('V',('Ljava/lang/String;',)))
    set_js=('Landroid/webkit/WebSettings;','setJavaScriptEnabled',('V',('Z',)))
    set_dom=('Landroid/webkit/WebSettings;','setDomStorageEnabled',('V',('Z',)))
    my_init=(MAIN_CLASS,'<init>',('V',()))
    my_onc=(MAIN_CLASS,'onCreate',('V',('Landroid/os/Bundle;',)))

    code_offsets={}
    # Constructor: p0 is v0.
    units=[]
    units+=ins_invoke(0x70,act_init,[0])
    units+=[0x000e]
    off=data_off+len(data); code_offsets[my_init]=off; data+=code_item(1,1,1,units); align(data,4)

    # onCreate: locals v0,v1,v2; p0=v3, p1=v4.
    units=[]
    units+=ins_invoke(0x6f,act_onc,[3,4])
    # const/4 v2, #1 then requestWindowFeature(p0, v2)
    units+=[0x1212]
    units+=ins_invoke(0x6e,req_feat,[3,2])
    # new-instance v0, WebView
    units += [0x0022, tidx['Landroid/webkit/WebView;']]
    units += ins_invoke(0x70,wv_init,[0,3])
    units += ins_invoke(0x6e,get_settings,[0])
    units += [0x010c]  # move-result-object v1
    units += [0x1212]  # const/4 v2, #1
    units += ins_invoke(0x6e,set_js,[1,2])
    units += ins_invoke(0x6e,set_dom,[1,2])
    units += ins_invoke(0x6e,set_content,[3,0])
    units += [0x011a, sidx['file:///android_asset/index.html']]
    units += ins_invoke(0x6e,load_url,[0,1])
    units += [0x000e]
    off=data_off+len(data); code_offsets[my_onc]=off; data+=code_item(5,2,2,units); align(data,4)

    # Class data after code.
    class_data_off=data_off+len(data)
    cd=bytearray()
    cd+=uleb(0)+uleb(0)+uleb(1)+uleb(1)
    cd+=uleb(midx[my_init])+uleb(0x10001)+uleb(code_offsets[my_init])
    cd+=uleb(midx[my_onc])+uleb(0x0004)+uleb(code_offsets[my_onc])
    data+=cd
    align(data,4)
    map_off=data_off+len(data)

    # Map list offsets for data item groups.
    first_type_list=min(param_off.values()) if param_off else 0
    first_string=min(str_off.values())
    first_code=min(code_offsets.values())
    entries=[
      (0x0000,1,0),(0x0001,len(strings),string_ids_off),(0x0002,len(types),type_ids_off),
      (0x0003,len(protos),proto_ids_off),(0x0005,len(methods),method_ids_off),(0x0006,1,class_defs_off)
    ]
    if param_off: entries.append((0x1001,len(param_off),first_type_list))
    entries += [(0x2002,len(strings),first_string),(0x2001,2,first_code),(0x2000,1,class_data_off),(0x1000,1,map_off)]
    entries=sorted(entries,key=lambda e:e[2])
    mp=bytearray(struct.pack('<I',len(entries)))
    for typ,size,off in entries: mp+=struct.pack('<HHII',typ,0,size,off)
    data+=mp

    file_size=data_off+len(data)
    data_size=len(data)
    out=bytearray(b'\x00'*header_size)
    # string ids
    for s in strings: out+=struct.pack('<I',str_off[s])
    for t in types: out+=struct.pack('<I',sidx[t])
    for p in protos:
        ret,params=p; out+=struct.pack('<III',sidx[shorty(ret,params)],tidx[ret],param_off.get(tuple(params),0))
    for m in methods:
        cls,name,proto=m; out+=struct.pack('<HHI',tidx[cls],pidx[proto],sidx[name])
    # class def
    out+=struct.pack('<IIIIIIII',tidx[MAIN_CLASS],0x1,tidx['Landroid/app/Activity;'],0,NO,0,class_data_off,0)
    while len(out)<data_off: out.append(0)
    out+=data
    assert len(out)==file_size
    # Header except checksum/signature.
    hdr=bytearray()
    hdr+=b'dex\n035\x00'
    hdr+=b'\x00'*4+b'\x00'*20
    hdr+=struct.pack('<IIIIIIIIIIIIIIIIIIII',
        file_size,header_size,0x12345678,0,0,map_off,
        len(strings),string_ids_off,len(types),type_ids_off,len(protos),proto_ids_off,
        0,0,len(methods),method_ids_off,1,class_defs_off,data_size,data_off)
    assert len(hdr)==header_size
    out[:header_size]=hdr
    sig=hashlib.sha1(out[32:]).digest(); out[12:32]=sig
    chk=zlib.adler32(out[12:]) & 0xffffffff; out[8:12]=struct.pack('<I',chk)
    return bytes(out), {'strings':len(strings),'types':len(types),'methods':len(methods),'file_size':len(out)}

# Android Binary XML helpers
UTF8_FLAG=0x100
RES_XML_TYPE=0x0003; RES_STRING_POOL_TYPE=0x0001; RES_XML_RESOURCE_MAP_TYPE=0x0180
START_NS=0x0100; END_NS=0x0101; START_ELEM=0x0102; END_ELEM=0x0103
TYPE_STRING=0x03; TYPE_INT_DEC=0x10; TYPE_INT_BOOLEAN=0x12
ANDROID_URI='http://schemas.android.com/apk/res/android'

def string_pool(strings):
    # preserve caller order because resource map indexes align to names
    offsets=[]; blob=bytearray()
    def enc_len(n):
        if n<0x80:return bytes([n])
        return bytes([(n>>8)|0x80,n&0xff])
    for s in strings:
        offsets.append(len(blob)); b=s.encode('utf-8'); blob+=enc_len(len(s))+enc_len(len(b))+b+b'\x00'
    while len(blob)%4: blob.append(0)
    header_size=28; strings_start=header_size+4*len(strings); size=strings_start+len(blob)
    out=bytearray(struct.pack('<HHI',RES_STRING_POOL_TYPE,header_size,size))
    out+=struct.pack('<IIIII',len(strings),0,UTF8_FLAG,strings_start,0)
    out+=b''.join(struct.pack('<I',x) for x in offsets)+blob
    return bytes(out)

def axml_build():
    # Attribute names are deliberately early enough for a compact resource map.
    strings=[
      'android',ANDROID_URI,'manifest','package','versionCode','versionName','uses-sdk','minSdkVersion','targetSdkVersion',
      'application','label','allowBackup','supportsRtl','activity','name','exported','intent-filter','action','category',
      PKG,'9.2','LogicLand v9.2','com.logicland.kids.v9asus.MainActivity','android.intent.action.MAIN','android.intent.category.LAUNCHER'
    ]
    idx={s:i for i,s in enumerate(strings)}
    rid={
      'versionCode':0x0101021b,'versionName':0x0101021c,'minSdkVersion':0x0101020c,'targetSdkVersion':0x01010270,
      'label':0x01010001,'allowBackup':0x01010280,'supportsRtl':0x010103af,'name':0x01010003,'exported':0x01010010
    }
    out=bytearray(b'\x00'*8)
    out+=string_pool(strings)
    # resource map indexed by string index
    maxidx=max(idx[k] for k in rid)+1
    vals=[0]*maxidx
    for k,v in rid.items(): vals[idx[k]]=v
    rsize=8+4*len(vals)
    out+=struct.pack('<HHI',RES_XML_RESOURCE_MAP_TYPE,8,rsize)+b''.join(struct.pack('<I',x) for x in vals)
    def node_header(typ,size,line=1):return struct.pack('<HHIII',typ,16,size,line,NO)
    def ns_node(typ,prefix,uri):return node_header(typ,24)+struct.pack('<II',idx[prefix],idx[uri])
    def typed(dtype,data):return struct.pack('<HBBI',8,0,dtype,data & 0xffffffff)
    def attr(name,value=None,dtype=TYPE_STRING,data=None,android=True):
        ns=idx[ANDROID_URI] if android else NO; namei=idx[name]
        if dtype==TYPE_STRING:
            vi=idx[value]; raw=vi; dat=vi
        else:
            raw=NO; dat=data
        return struct.pack('<III',ns,namei,raw)+typed(dtype,dat)
    def start(tag,attrs):
        attrs_b=b''.join(attrs); size=16+20+len(attrs_b)
        ext=struct.pack('<IIHHHHHH',NO,idx[tag],20,20,len(attrs),0,0,0)
        return node_header(START_ELEM,size)+ext+attrs_b
    def end(tag):return node_header(END_ELEM,24)+struct.pack('<II',NO,idx[tag])
    out+=ns_node(START_NS,'android',ANDROID_URI)
    out+=start('manifest',[
      attr('package',PKG,TYPE_STRING,android=False),
      attr('versionCode',dtype=TYPE_INT_DEC,data=90200),
      attr('versionName','9.2')])
    out+=start('uses-sdk',[attr('minSdkVersion',dtype=TYPE_INT_DEC,data=23),attr('targetSdkVersion',dtype=TYPE_INT_DEC,data=23)])
    out+=end('uses-sdk')
    out+=start('application',[attr('label','LogicLand v9.2'),attr('allowBackup',dtype=TYPE_INT_BOOLEAN,data=0xffffffff),attr('supportsRtl',dtype=TYPE_INT_BOOLEAN,data=0xffffffff)])
    out+=start('activity',[attr('name','com.logicland.kids.v9asus.MainActivity'),attr('exported',dtype=TYPE_INT_BOOLEAN,data=0xffffffff)])
    out+=start('intent-filter',[])
    out+=start('action',[attr('name','android.intent.action.MAIN')]); out+=end('action')
    out+=start('category',[attr('name','android.intent.category.LAUNCHER')]); out+=end('category')
    out+=end('intent-filter');out+=end('activity');out+=end('application');out+=end('manifest')
    out+=ns_node(END_NS,'android',ANDROID_URI)
    struct.pack_into('<HHI',out,0,RES_XML_TYPE,8,len(out))
    return bytes(out)

def build_apk():
    dex,meta=dex_build(); manifest=axml_build()
    (BUILD/'classes.dex').write_bytes(dex); (BUILD/'AndroidManifest.xml').write_bytes(manifest)
    unsigned=BUILD/'LogicLandKids-unsigned.apk'
    if unsigned.exists(): unsigned.unlink()
    with zipfile.ZipFile(unsigned,'w',compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('AndroidManifest.xml',manifest)
        z.writestr('classes.dex',dex)
        for asset in ASSETS.rglob('*'):
            if asset.is_file():
                z.write(asset, 'assets/' + asset.relative_to(ASSETS).as_posix(), compress_type=zipfile.ZIP_STORED if asset.suffix.lower() == '.mp3' else zipfile.ZIP_DEFLATED)
    # Signing: no production secret is stored in the source tree.
    # For local test builds, a debug key is generated in dist/ if no env vars are supplied.
    ks=Path(os.environ.get('LLK_KEYSTORE', BUILD/'LogicLandKids-debug.jks'))
    pw=os.environ.get('LLK_KEYSTORE_PASSWORD','android')
    alias=os.environ.get('LLK_SIGNING_ALIAS','logicland-debug')
    if not ks.exists():
        subprocess.run(['keytool','-genkeypair','-v','-keystore',str(ks),'-storepass',pw,'-keypass',pw,'-alias',alias,'-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=LogicLand Kids v9 Asus, O=Local Build, C=IT'],check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    signed=BUILD/'LogicLandKids-v9.2-Asus-Android6.0.1.apk'
    shutil.copy2(unsigned,signed)
    subprocess.run(['jarsigner','-keystore',str(ks),'-storepass',pw,'-keypass',pw,'-sigalg','SHA256withRSA','-digestalg','SHA-256',str(signed),alias],check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    verify=subprocess.run(['jarsigner','-verify',str(signed)],capture_output=True,text=True)
    print(json.dumps({'apk':str(signed),'dex':meta,'manifest_size':len(manifest),'apk_size':signed.stat().st_size,'verify_rc':verify.returncode,'verify_tail':verify.stdout[-500:]},indent=2))
if __name__=='__main__':build_apk()
