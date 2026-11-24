import struct, hashlib
from pathlib import Path
from cryptography.hazmat.primitives.serialization import pkcs12, Encoding, PublicFormat
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

MAGIC=b'APK Sig Block 42'
V2_ID=0x7109871A
ALG_ID=0x0103  # RSA PKCS#1 v1.5 + SHA-256
CHUNK=1024*1024

def u32(n): return struct.pack('<I',n)
def u64(n): return struct.pack('<Q',n)
def lp(b): return u32(len(b))+b

def find_eocd(data: bytes):
    start=max(0,len(data)-(0xffff+22))
    pos=data.rfind(b'PK\x05\x06',start)
    if pos<0: raise ValueError('ZIP EOCD not found')
    if pos+22>len(data): raise ValueError('Truncated EOCD')
    comment_len=struct.unpack_from('<H',data,pos+20)[0]
    if pos+22+comment_len!=len(data):
        # tolerate trailing bytes only when another valid EOCD exists earlier
        p=pos
        while p>=start:
            comment_len=struct.unpack_from('<H',data,p+20)[0]
            if p+22+comment_len==len(data): pos=p; break
            p=data.rfind(b'PK\x05\x06',start,p)
        else: raise ValueError('EOCD comment length mismatch')
    cd_offset=struct.unpack_from('<I',data,pos+16)[0]
    cd_size=struct.unpack_from('<I',data,pos+12)[0]
    return pos,cd_offset,cd_size

def content_digest(sections):
    chunk_digests=[]
    for section in sections:
        mv=memoryview(section)
        for off in range(0,len(mv),CHUNK):
            c=mv[off:off+CHUNK]
            h=hashlib.sha256()
            h.update(b'\xa5'); h.update(u32(len(c))); h.update(c)
            chunk_digests.append(h.digest())
    h=hashlib.sha256(); h.update(b'\x5a'); h.update(u32(len(chunk_digests)))
    for d in chunk_digests: h.update(d)
    return h.digest()

def compute_apk_digest(data: bytes, signing_block_offset: int, cd_offset: int, eocd_offset: int):
    eocd=bytearray(data[eocd_offset:])
    struct.pack_into('<I',eocd,16,signing_block_offset)
    return content_digest([data[:signing_block_offset], data[cd_offset:eocd_offset], bytes(eocd)])

def load_key_cert(keystore: Path, password: str):
    key,cert,extra=pkcs12.load_key_and_certificates(keystore.read_bytes(),password.encode())
    if key is None or cert is None: raise ValueError('Private key/certificate not found in PKCS12')
    return key,cert

def make_v2_value(digest: bytes, key, cert):
    cert_der=cert.public_bytes(Encoding.DER)
    pub_der=cert.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)
    digest_record=u32(ALG_ID)+lp(digest)
    digests=lp(lp(digest_record))
    certificates=lp(lp(cert_der))
    attrs=lp(b'')
    signed_data=digests+certificates+attrs
    sig=key.sign(signed_data,padding.PKCS1v15(),hashes.SHA256())
    sig_record=u32(ALG_ID)+lp(sig)
    signatures=lp(lp(sig_record))
    signer=lp(signed_data)+signatures+lp(pub_der)
    return lp(lp(signer))

def make_signing_block(v2_value: bytes):
    pair=u64(4+len(v2_value))+u32(V2_ID)+v2_value
    size=len(pair)+8+len(MAGIC)
    return u64(size)+pair+u64(size)+MAGIC

def sign_v2(in_apk: Path, out_apk: Path, keystore: Path, password='android'):
    data=in_apk.read_bytes()
    eocd,cd_offset,cd_size=find_eocd(data)
    # Input should not already contain a signing block for this build path.
    key,cert=load_key_cert(keystore,password)
    digest=compute_apk_digest(data,cd_offset,cd_offset,eocd)
    v2=make_v2_value(digest,key,cert)
    block=make_signing_block(v2)
    new_cd=cd_offset+len(block)
    out=bytearray(data[:cd_offset]+block+data[cd_offset:])
    new_eocd=eocd+len(block)
    struct.pack_into('<I',out,new_eocd+16,new_cd)
    out_apk.write_bytes(out)
    return {'block_size':len(block),'digest':digest.hex(),'cd_before':cd_offset,'cd_after':new_cd}

def read_lp(buf,off):
    n=struct.unpack_from('<I',buf,off)[0]; off+=4
    return buf[off:off+n],off+n

def verify_v2(apk: Path):
    data=apk.read_bytes(); eocd,cd_offset,cd_size=find_eocd(data)
    if data[cd_offset-16:cd_offset]!=MAGIC: raise ValueError('APK Signing Block magic missing')
    size=struct.unpack_from('<Q',data,cd_offset-24)[0]
    start=cd_offset-(size+8)
    size2=struct.unpack_from('<Q',data,start)[0]
    if size!=size2: raise ValueError('Signing block sizes differ')
    pos=start+8; end_pairs=cd_offset-24
    value=None
    while pos<end_pairs:
        plen=struct.unpack_from('<Q',data,pos)[0]; pos+=8
        pid=struct.unpack_from('<I',data,pos)[0]; pos+=4
        pval=data[pos:pos+plen-4]; pos+=plen-4
        if pid==V2_ID: value=pval
    if value is None: raise ValueError('v2 ID-value pair missing')
    signers,_=read_lp(value,0); signer,_=read_lp(signers,0)
    signed_data,off=read_lp(signer,0)
    signatures,off=read_lp(signer,off)
    pub_der,off=read_lp(signer,off)
    sigrec,_=read_lp(signatures,0)
    alg=struct.unpack_from('<I',sigrec,0)[0]; sig,_=read_lp(sigrec,4)
    if alg!=ALG_ID: raise ValueError('Unexpected signature algorithm')
    # Parse signed data: digests, certs, attrs
    digests,sd_off=read_lp(signed_data,0)
    certs,sd_off=read_lp(signed_data,sd_off)
    attrs,sd_off=read_lp(signed_data,sd_off)
    drec,_=read_lp(digests,0)
    dalg=struct.unpack_from('<I',drec,0)[0]; expected_digest,_=read_lp(drec,4)
    if dalg!=ALG_ID: raise ValueError('Unexpected digest algorithm')
    cert_der,_=read_lp(certs,0)
    from cryptography import x509
    cert=x509.load_der_x509_certificate(cert_der)
    cert.public_key().verify(sig,signed_data,padding.PKCS1v15(),hashes.SHA256())
    # For digest verification, section 1 ends at signing block start; CD is actual cd_offset.
    actual=compute_apk_digest(data,start,cd_offset,eocd)
    if actual!=expected_digest: raise ValueError(f'Content digest mismatch {actual.hex()} != {expected_digest.hex()}')
    if cert.public_key().public_bytes(Encoding.DER,PublicFormat.SubjectPublicKeyInfo)!=pub_der:
        raise ValueError('Public key mismatch')
    return {'v2':True,'alg':hex(alg),'digest':actual.hex(),'signing_block_start':start,'cd_offset':cd_offset,'cert_subject':cert.subject.rfc4514_string()}

if __name__=='__main__':
    import argparse,json
    ap=argparse.ArgumentParser(); ap.add_argument('in_apk'); ap.add_argument('out_apk'); ap.add_argument('--keystore',required=True); ap.add_argument('--password',default='android')
    args=ap.parse_args(); info=sign_v2(Path(args.in_apk),Path(args.out_apk),Path(args.keystore),args.password); info['verify']=verify_v2(Path(args.out_apk)); print(json.dumps(info,indent=2))
