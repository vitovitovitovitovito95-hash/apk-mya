'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const indexHtml=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
assert(indexHtml.includes('js/audio-index.js'), 'Missing audio-index in app/index.html');
assert(indexHtml.indexOf('js/audio-index.js') < indexHtml.indexOf('js/games-english.js'), 'Audio index should load first');
global.window=global;global.LogicLand={};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');
global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.document={getElementById:()=>null,querySelectorAll:()=>[],querySelector:()=>null};
let playCalls=0, lastSrc='';
global.Audio=function(){
  let src='';
  Object.defineProperty(this,'src',{get(){return src;},set(v){src=v;lastSrc=v;}});
  this.play=()=>{playCalls++;return Promise.resolve();};
  this.pause=()=>{}; this.removeAttribute=()=>{}; this.load=()=>{};
};
const file=n=>vm.runInThisContext(fs.readFileSync(path.join(root,'app/js',n),'utf8'),{filename:n});
for(const f of ['polyfills.js','core.js','data.js','storage.js','audio-index.js','games-english.js','games-math.js','games-visual.js','games-extra.js','games-age6.js'])file(f);
const LL=global.LogicLand,idx=LL.AUDIO_INDEX;
let checked=0;
for(const word of LL.WORDS){
  for(const lang of ['en','it']){
    const phrase=word[lang]; const fileName=idx[lang+'|'+phrase.toLowerCase()];
    assert(fileName,'Missing audio for '+lang+' '+phrase);
    const mp3=path.join(root,'app/audio',fileName);
    assert(fs.existsSync(mp3),'Missing mp3 '+fileName);
    assert(fs.readFileSync(mp3).length>500,'Tiny mp3 '+mp3);
    checked++;
  }
}
for(const sent of LL.SENTENCES){
  const line=sent.s.replace('___',sent.a);
  const key=idx['en|'+line.toLowerCase()];
  assert(key,'Missing sentence audio: '+line);
  checked++;
}
for(const w of LL.WORDS.slice(0,15)){
  LL.speakLine(w.en,'en-GB');
  assert(lastSrc.includes('.mp3'),'Audio did not use embedded mp3 for '+w.en);
}
LL.speakLine(LL.SENTENCES[0].s.replace('___',LL.SENTENCES[0].a),'en-GB');
assert(playCalls===16,'Not all sound button simulations played audio');
const s=LL.defaultState();
for(const id of [16,34]){
  const gen=LL.EnglishGames[id];
  for(let level=1;level<=15;level++){
    const q=gen(level,s);
    assert(q.custom && q.custom.includes('speakLine'),'English game has no audio button, id='+id+',level='+level);
  }
}
console.log('OK: '+checked+' word/sentence files verified; 16 simulated MP3 button clicks; audio available for English games at all 15 levels.');
