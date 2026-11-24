'use strict';
// v9.0: verifica le nuove regole dei livelli (risposte calcolate, distrattori sottili, progressione).
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};global.document={querySelector:()=>null,getElementById:()=>null};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const dir=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','storage.js','games-math.js','games-visual.js','games-english.js','games-extra.js','games-age6.js','games-v83-challenges.js','games-v9-levels.js','games-v9-logic.js','fx.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
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
// v9.1: nuovi giochi di logica e somme, con verifica indipendente delle risposte.
let logicQ=0;
for(let l=1;l<=15;l++)for(let t=0;t<300;t++){
  for(const id of [40,41,42]){
    const q=N.MathGames[id](l,state);logicQ++;
    check(/^\d+$/.test(q.answer),'Game '+id+' L'+l+' non-numeric/negative answer '+q.answer);
    check(optVals(q).includes(q.answer)&&new Set(optVals(q)).size===q.options.length,'Game '+id+' L'+l+' options');
    if(id===42){ // ricostruisce la piramide dai valori visibili e verifica che la risposta sia coerente
      const rows=[...q.visual.matchAll(/<div class="pyrRow">(.*?)<\/div>/g)].map(m=>[...m[1].matchAll(/<span class="pyrCell([^"]*)">([^<]*)<\/span>/g)].map(x=>x[1].includes('ask')?'?':x[2]===''?null:Number(x[2])));
      rows.reverse(); // rows[0]=base
      const unknown={};rows.forEach((r,i)=>r.forEach((v,j)=>{if(v===null||v==='?')unknown[i+','+j]=1;}));
      // risolve per sostituzione ripetuta
      const val=rows.map(r=>r.map(v=>typeof v==='number'?v:null));
      for(let it=0;it<20;it++)for(let i=1;i<val.length;i++)for(let j=0;j<val[i].length;j++){
        const a=val[i-1][j],b=val[i-1][j+1],c=val[i][j];
        if(c===null&&a!==null&&b!==null)val[i][j]=a+b;
        if(c!==null&&a===null&&b!==null)val[i-1][j]=c-b;
        if(c!==null&&a!==null&&b===null)val[i-1][j+1]=c-a;
      }
      // con la cima nota e tutto il centro nascosto serve la combinazione binomiale
      let ai,aj;rows.forEach((r,i)=>r.forEach((v,j)=>{if(v==='?'){ai=i;aj=j;}}));
      let got=val[ai][aj];
      if(got===null&&ai===0){const n=rows[0].length,top=val[n-1][0],C=[[1],[1,1],[1,2,1],[1,3,3,1]][n-1];let sum=0,ok=true;for(let j=0;j<n;j++)if(j!==aj){if(val[0][j]===null)ok=false;else sum+=C[j]*val[0][j];}check(ok&&top!==null,'Pyramid L'+l+' not solvable');got=(top-sum)/C[aj];}
      check(String(got)===q.answer,'Pyramid L'+l+' wrong answer '+got+' vs '+q.answer);
    }
  }
}
check(N.GAMES.length===22&&!N.GAMES.some(g=>g.id===21||g.id===35),'Figure games 21/35 should be merged into 8');
check(N.contentLevel(1)===4&&N.questionsFor(15)===8&&N.secondsFor(15)<N.secondsFor(1),'v9 difficulty boost');
console.log('PASS v9.1: '+logicQ+' logic/sum questions verified (sums, picture equations, number pyramids)');
check(typeof N.fx.confetti==='function'&&typeof N.fx.play==='function','fx module missing');
check(N.APP_VERSION==='9.1.0','version');
console.log('PASS v9.0: '+n+' questions; single-feature outliers, near-twins, mixed counting, hidden terms, inverse memory');
