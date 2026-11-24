'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),jsdir=path.join(root,'app','js');
function assert(x,msg){if(!x)throw new Error(msg);}
const builder=fs.readFileSync(path.join(root,'android','build_apk.py'),'utf8');
assert(builder.includes("data=23),attr('targetSdkVersion',dtype=TYPE_INT_DEC,data=23)"),'APK must use minSdk/targetSdk 23');
const html=fs.readFileSync(path.join(root,'app','index.html'),'utf8');
assert(html.indexOf('polyfills.js')>=0&&html.indexOf('polyfills.js')<html.indexOf('core.js'),'Legacy polyfills not loaded first');
const css=fs.readFileSync(path.join(root,'app','css','styles.css'),'utf8');
assert(!css.includes('var(--'),'CSS custom properties remain in runtime CSS');
for(const name of fs.readdirSync(jsdir).filter(x=>x.endsWith('.js')&&x!=='polyfills.js')){
  const s=fs.readFileSync(path.join(jsdir,name),'utf8');
  for(const token of ['?.','??','=>','`'])assert(!s.includes(token),`${name} still contains modern syntax ${token}`);
}
console.log('OK: Android 6.0.1 API 23 manifest, ES5 runtime JavaScript, polyfills and legacy CSS fallbacks.');
