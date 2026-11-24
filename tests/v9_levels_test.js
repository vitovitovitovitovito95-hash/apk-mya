'use strict';
// v9.0: verifica le nuove regole dei livelli (risposte calcolate, distrattori sottili, progressione).
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};global.document={querySelector:()=>null,getElementById:()=>null};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const dir=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','storage.js','games-math.js','games-visual.js','games-english.js','games-extra.js','games-age6.js','games-v83-challenges.js','games-v9-levels.js','fx.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
const N=global.LogicLand,state=N.defaultState();
function check(ok,msg){if(!ok)throw new Error(msg);}
const strip=html=>[...html.matchAll(/<span>(?:<small>\d+<\/small>)?([^<]*)<\/span>/g)].map(m=>m[1]);
const optVals=q=>q.options.map(o=>String(typeof o==='object'?(o.value??o.label):o));
const glyphs=t=>Array.from(t);
let n=0;
for(let l=1;l<=15;l++){
  for(let t=0;t<200;t++){
    // Numero Mancante: la risposta deve essere coerente con la regola dichiarata.
    let q=N.MathGames[1](l,state);n++;
    check(q.meta.v9,'v9 generator not active for game 1');
    check(optVals(q).includes(q.answer)&&optVals(q).every(v=>Number(v)>=0),'Numbers L'+l+' bad options');
    if(l>=4&&l<=6)check(q.meta.age6Metrics.hiddenInternal===1,'Numbers L'+l+' should hide an internal term');
    // Intruso: dal L5 differisce una sola caratteristica.
    q=N.MathGames[7](l,state);n++;
    const items=strip(q.visual),idx=Number(q.answer),odd=items[idx],base=items[(idx+1)%items.length];
    check(items.filter(x=>x===odd).length===1&&items.filter(x=>x===base).length===items.length-1,'Odd L'+l+' not a single outlier');
    if(l>=5){const a=glyphs(odd),b=glyphs(base);check(a.length===b.length&&a.filter((g,i)=>g!==b[i]).length===1,'Odd L'+l+' must differ by exactly one feature: '+odd+' vs '+base);}
    // Gemelle: esattamente un duplicato, nelle posizioni della risposta.
    q=N.VisualGames[33](l,state);n++;
    const tiles=strip(q.visual),[p1,p2]=q.answer.split('-').map(Number);
    check(tiles.length===3+l,'Twins L'+l+' wrong count');
    check(tiles[p1-1]===tiles[p2-1]&&new Set(tiles).size===tiles.length-1,'Twins L'+l+' wrong duplicate');
    check(optVals(q).includes(q.answer),'Twins L'+l+' answer missing');
    // Conta: il numero di bersagli è corretto e i distrattori compaiono dal L3.
    for(const id of [31,11]){
      q=(id===31?N.MathGames:N.VisualGames)[id](l,state);n++;
      const target=id===11?'🟥':'🍎',cells=[...q.visual.matchAll(/<span[^>]*>([^<]*)<\/span>/g)].map(m=>m[1]);
      check(cells.filter(c=>c===target).length===3+l,'Count '+id+' L'+l+' wrong targets');
      if(l>=3)check(cells.length>3+l,'Count '+id+' L'+l+' needs distractors');
      const m=q.meta.age6Metrics;check(Number(q.answer)===3+l+m.added-m.removed+(l>=13?l-12:0),'Count '+id+' L'+l+' wrong answer');
    }
    // Domino: risposta coerente con il ciclo.
    q=N.VisualGames[35](l,state);n++;check(optVals(q).includes(q.answer),'Domino L'+l+' answer missing');
    if(l>=8)check(q.meta.age6Metrics.hiddenInternal===1,'Domino L'+l+' should hide internal tile');
    // Memoria: risposta tra le opzioni; versione inversa = oggetto non mostrato.
    q=N.VisualGames[14](l,state);n++;
    const shown=strip(q.visual);check(shown.length===2+l,'Memory L'+l+' wrong item count');
    if(q.meta.age6Metrics.inverse)check(!shown.includes(q.answer),'Memory inverse answer was shown');else check(shown.includes(q.answer),'Memory answer not shown');
    check(new Set(optVals(q)).size===q.options.length&&optVals(q).includes(String(q.answer)),'Memory L'+l+' options');
  }
}
check(typeof N.fx.confetti==='function'&&typeof N.fx.play==='function','fx module missing');
check(N.APP_VERSION==='9.0.0','version');
console.log('PASS v9.0: '+n+' questions; single-feature outliers, near-twins, mixed counting, hidden terms, inverse memory');
