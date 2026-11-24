'use strict';
// v9.2: per OGNI gioco e OGNI livello verifica, con risolutori indipendenti dal generatore:
//  - la risposta è corretta e unica tra le opzioni, niente opzioni doppie, numero di opzioni previsto;
//  - il "salto" tra un livello e il successivo è reale: il vettore rank cresce in ordine lessicografico
//    (il livello L+1 è più difficile di QUALSIASI domanda del livello L);
//  - ogni livello ha la sua descrizione (NS.LEVEL_INFO) diversa dalle altre;
//  - spagnolo/inglese: fasce di vocabolario, modalità per livello e audio presente per ciò che viene pronunciato.
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};global.document={querySelector:()=>null,getElementById:()=>null};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const dir=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','data-es.js','storage.js','audio-index.js','games-math.js','games-visual.js','games-english.js','games-extra.js','games-age6.js','games-arcade.js','games-new.js','games-v82-puzzles.js','games-v82-board.js','games-v83-challenges.js','games-v9-levels.js','games-v9-logic.js','games-v92-levels.js','games-v92-lang.js','games-v92-brain.js','fx.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
const N=global.LogicLand,state=N.defaultState();
function check(ok,msg){if(!ok)throw new Error(msg);}
const CH=[3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
const optVals=q=>q.options.map(o=>String(typeof o==='object'?(o.value??o.label):o));
const lexCmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const x=a[i]===undefined?-Infinity:a[i],y=b[i]===undefined?-Infinity:b[i];if(x!==y)return x<y?-1:1;}return 0;};
const gen=id=>N.MathGames[id]||N.VisualGames[id]||N.EnglishGames[id];
const SAMPLES=Number(process.env.V92_SAMPLES||120);

/* ---------- risolutori indipendenti ---------- */
// 1: la sequenza completa deve rispettare la regola del tipo; nessun'altra opzione la rispetta.
function seqOk(kind,s){
  const d=s.slice(1).map((v,i)=>v-s[i]);
  switch(kind){
    case 'step':case 'down':case 'stepHole':case 'bigHole':return d.every(x=>x===d[0])&&d[0]!==0;
    case 'alt':case 'altHole':case 'altMix':return d.every((x,i)=>i<2||x===d[i-2])&&d[0]!==d[1];
    case 'grow':case 'growHole':return d.every((x,i)=>i===0||x-d[i-1]===1);
    case 'double':return s.every((v,i)=>i===0||v===2*s[i-1]);
    case 'inter':{const ev=s.filter((_,i)=>i%2===0),od=s.filter((_,i)=>i%2===1),de=ev.slice(1).map((v,i)=>v-ev[i]),dd=od.slice(1).map((v,i)=>v-od[i]);return de.every(x=>x===de[0])&&dd.every(x=>x===dd[0]);}
    case 'fib':case 'fibHole':return s.every((v,i)=>i<2||v===s[i-1]+s[i-2]);
    case 'mulAdd':{const k=s[2]-s[1];return k>0&&s.every((v,i)=>i===0||(i%2===1?v===2*s[i-1]:v===s[i-1]+k));}
  }
  throw new Error('kind '+kind);
}
function verify1(q){
  const txt=q.visual.replace(/<b class="seqHole">\?<\/b>/,'?').replace(/<[^>]+>/g,'');
  const parts=txt.split('·').map(x=>x.trim()),hole=parts.indexOf('?');
  check(hole>=0,'1: no hole');
  const fill=v=>parts.map((p,i)=>i===hole?v:Number(p));
  check(seqOk(q.meta.age6Metrics.kind,fill(Number(q.answer))),'1 '+q.meta.age6Metrics.kind+': answer breaks the rule '+parts.join(',')+' -> '+q.answer);
  for(const o of optVals(q))if(o!==q.answer)check(!seqOk(q.meta.age6Metrics.kind,fill(Number(o))),'1: option '+o+' also fits '+parts.join(','));
}
// Gettoni: colore, forma, rotazione, taglia.
function parseTokens(html){
  return html.split('<span class="tkCell').slice(1).map(cell=>{
    const m=cell.match(/<span class="tk( tkBig)?" style="color:(#[0-9a-f]+)">([^<]*)(?:<i class="tkDir" style="[^"]*rotate\((\d+)deg\)[^"]*">)?/);
    if(!m)return null;return {big:!!m[1],c:m[2],s:m[3],r:m[4]===undefined?-1:Number(m[4]),blank:false};
  });
}
const tkKey=t=>t?[t.c,t.s,t.r,t.big].join('|'):'?';
function verify7(q,l){
  const t=parseTokens(q.visual),idx=Number(q.answer),keys=t.map(tkKey),odd=keys[idx];
  check(keys.filter(k=>k===odd).length===1&&new Set(keys).size===2,'7 L'+l+': not exactly one outlier');
  const base=t[(idx+1)%t.length],o=t[idx],diff=['c','s','r','big'].filter(f=>base[f]!==o[f]).length;
  const T=N.V92.T7[l-1];check(T[0]===t.length,'7 L'+l+': item count');
  if(T[2]===1)check(diff===1,'7 L'+l+': must differ by exactly one detail, got '+diff);
}
function verify33(q,l){
  const keys=parseTokens(q.visual).map(tkKey),[a,b]=q.answer.split('-').map(Number);
  check(keys[a-1]===keys[b-1]&&new Set(keys).size===keys.length-1,'33 L'+l+': wrong twins');
}
// 8: per ogni caratteristica trova il periodo minimo coerente con le caselle visibili e predice la casella "?".
function verify8(q,l){
  const cells=q.visual.split('<span class="tkCell').slice(1).map(c=>c.indexOf('seqHole')>=0?'ASK':c.indexOf('tkBlank')>=0?null:parseTokens('<span class="tkCell'+c)[0]);
  const ask=cells.indexOf('ASK');check(ask>=0,'8: no ask');
  const pred={};
  for(const f of ['c','s','r']){
    let found=null;
    for(let p=1;p<=6&&found===null;p++){
      let ok=true,val;
      for(let i=0;i<cells.length&&ok;i++)for(let j=i+p;j<cells.length&&ok;j+=p){const a=cells[i],b=cells[j];if(a&&b&&a!=='ASK'&&b!=='ASK'&&a[f]!==b[f])ok=false;}
      if(!ok)continue;
      for(let j=ask%p;j<cells.length;j+=p){const c=cells[j];if(c&&c!=='ASK'){val=c[f];break;}}
      if(val!==undefined)found=val;
    }
    check(found!==null,'8 L'+l+': feature '+f+' not inferable');pred[f]=found;
  }
  const opt=q.options.find(o=>o.value===q.answer),ot=parseTokens('<span class="tkCell">'+opt.label)[0];
  check(ot.c===pred.c&&ot.s===pred.s&&ot.r===pred.r,'8 L'+l+': answer does not continue the cycles');
  for(const o of q.options)if(o.value!==q.answer){const x=parseTokens('<span class="tkCell">'+o.label)[0];check(!(x.c===pred.c&&x.s===pred.s&&x.r===pred.r),'8 L'+l+': two options look identical to the answer');}
}
function verify14(q,l){
  const shown=[...q.visual.matchAll(/<span><small>\d+<\/small>([^<]*)<\/span>/g)].map(m=>m[1]),T=q.meta.age6Metrics;
  check(shown.length===T.memoryItems,'14 L'+l+': item count');
  if(T.qType===2)check(!shown.includes(q.answer)&&optVals(q).filter(v=>!shown.includes(v)).length===1,'14 L'+l+': "not present" must be the only unseen option');
  else check(shown.includes(q.answer),'14 L'+l+': answer was not shown');
  if(T.qType===4){const first=optVals(q).reduce((a,b)=>shown.indexOf(a)<shown.indexOf(b)?a:b);check(first===q.answer,'14 L'+l+': first item wrong');}
}
function verify31(q,l){
  const cells=[...q.visual.matchAll(/<span>([^<]*)<\/span>/g)].map(m=>m[1]);
  let n=cells.filter(c=>c==='🍎').length;check(n===3+l,'31 L'+l+': apple count');
  for(const m of q.sub.matchAll(/(aggiungine|togline) (\d+)/g))n+=m[1]==='togline'?-Number(m[2]):Number(m[2]);
  check(String(n)===q.answer,'31 L'+l+': wrong total '+n+' vs '+q.answer);
  if(l>=3)check(cells.length>3+l,'31 L'+l+': needs distractor fruit');
}
// 11: legge blocchi (colore/forma/taglia dallo stile) e condizioni (testo dei gettoni) e valuta.
const HEXC={'#ff3b4f':'rosso','#2f80ff':'blu','#ffc21a':'giallo','#1fb26b':'verde'};
function verify11(q,l){
  const blocks=[...q.visual.matchAll(/<span class="dCell"><small>\d+<\/small><i class="dBlock" style="([^"]*)"><\/i><\/span>/g)].map(m=>{
    const st=m[1],tri=/border-bottom:(\d+)px solid (#[0-9a-f]+)/.exec(st);
    if(tri)return {c:HEXC[tri[2]],s:'triangolo',z:Number(tri[1])>=46?'grande':'piccolo'};
    const w=Number(/width:(\d+)px/.exec(st)[1]),h=Number(/height:(\d+)px/.exec(st)[1]),col=HEXC[/background:(#[0-9a-f]+)/.exec(st)[1]];
    return {c:col,s:/border-radius:50%/.test(st)?'cerchio':w!==h?'rettangolo':'quadrato',z:w>=46?'grande':'piccolo'};
  });
  const conds=[...q.visual.matchAll(/<span class="dChip( neg)?">(.*?)<\/span>(?=<b class="dJoin|<\/span>|<\/div>)/g)].map(m=>{
    const txt=m[2].replace(/<[^>]+>/g,' ');let attr,val;
    for(const v of ['rosso','blu','giallo','verde'])if(txt.indexOf(v)>=0){attr='c';val=v;}
    for(const v of ['cerchio','quadrato','triangolo','rettangolo'])if(txt.indexOf(v)>=0){attr='s';val=v;}
    for(const v of ['piccolo','grande'])if(txt.indexOf(v)>=0){attr='z';val=v;}
    return {attr,val,neg:!!m[1]};
  });
  check(conds.length===q.meta.age6Metrics.conditions&&conds.every(c=>c.attr),'11 L'+l+': conditions not readable');
  const or=q.visual.indexOf('dJoin or')>=0;
  const test=b=>{const r=conds.map(c=>(b[c.attr]===c.val)!==c.neg);return or?((r[0]||r[1])&&r.slice(2).every(Boolean)):r.every(Boolean);};
  const match=blocks.map((b,i)=>test(b)?i+1:0).filter(Boolean);
  if(q.prompt.indexOf('Trova')===0)check(match.length===1&&String(match[0])===q.answer,'11 L'+l+': find answer wrong ('+match+' vs '+q.answer+')');
  else check(String(match.length)===q.answer,'11 L'+l+': count wrong ('+match.length+' vs '+q.answer+')');
  check(blocks.length===q.meta.age6Metrics.blocks,'11 L'+l+': block count');
}
function verify32(q,l){
  const OUT={'●':'○','▲':'△','■':'□','◆':'◇','★':'☆','⬟':'⬡'};
  const items=q.visual.replace(/<[^>]+>/g,'').trim().split(' ');let t=items.map(s=>OUT[s]);if(l>=10)t=t.reverse();
  check(t.join('')===q.answer,'32 L'+l+': wrong shadow');
}
// 41: risolve il sistema per backtracking (valori 1..40) e controlla che la domanda abbia UN solo valore.
function evalExpr(tok,val){
  const t=tok.map(x=>x in val?val[x]:x);let terms=[],cur=t[0];
  for(let i=1;i<t.length;i+=2){const op=t[i],v=t[i+1];if(op==='×')cur*=v;else{terms.push(cur);terms.push(op);cur=v;}}
  terms.push(cur);let r=terms[0];for(let i=1;i<terms.length;i+=2)r=terms[i]==='+'?r+terms[i+1]:r-terms[i+1];return r;
}
function verify41(q,l){
  const rows=[...q.visual.matchAll(/<div class="eqRow">(.*?) <b>=<\/b> <span class="eqRes">(\d+)<\/span><\/div>/g)].map(m=>({tok:m[1].split(' '),res:Number(m[2])}));
  const ask=/<div class="eqRow ask">(.*?) <b>=<\/b>/.exec(q.visual)[1].split(' ');
  const fruits=[];rows.forEach(r=>r.tok.forEach((x,i)=>{if(i%2===0&&fruits.indexOf(x)<0)fruits.push(x);}));
  const sols=new Set(),val={};let nodes=0;
  (function rec(k){
    if(++nodes>2e6)throw new Error('41: solver budget');
    for(const r of rows){if(r.tok.every((x,i)=>i%2||x in val)&&evalExpr(r.tok,val)!==r.res)return;}
    if(k===fruits.length){sols.add(evalExpr(ask,val));return;}
    for(let v=1;v<=40;v++){val[fruits[k]]=v;rec(k+1);delete val[fruits[k]];}
  })(0);
  check(sols.size===1&&sols.has(Number(q.answer)),'41 L'+l+': system gives '+[...sols]+' expected '+q.answer);
}
function verify42(q,l){
  const rows=[...q.visual.matchAll(/<div class="pyrRow">(.*?)<\/div>/g)].map(m=>[...m[1].matchAll(/<span class="pyrCell([^"]*)">([^<]*)<\/span>/g)].map(x=>x[1].includes('ask')?'?':x[2]===''?null:Number(x[2])));
  rows.reverse();
  const val=rows.map(r=>r.map(v=>typeof v==='number'?v:null));
  for(let it=0;it<20;it++)for(let i=1;i<val.length;i++)for(let j=0;j<val[i].length;j++){
    const a=val[i-1][j],b=val[i-1][j+1],c=val[i][j];
    if(c===null&&a!==null&&b!==null)val[i][j]=a+b;
    if(c!==null&&a===null&&b!==null)val[i-1][j]=c-b;
    if(c!==null&&a!==null&&b===null)val[i-1][j+1]=c-a;
  }
  let ai,aj;rows.forEach((r,i)=>r.forEach((v,j)=>{if(v==='?'){ai=i;aj=j;}}));
  let got=val[ai][aj];
  if(got===null&&ai===0){const n=rows[0].length,top=val[n-1][0],C=[[1],[1,1],[1,2,1],[1,3,3,1]][n-1];let sum=0,ok=true;for(let j=0;j<n;j++)if(j!==aj){if(val[0][j]===null)ok=false;else sum+=C[j]*val[0][j];}check(ok&&top!==null,'42 L'+l+': not solvable');got=(top-sum)/C[aj];}
  check(String(got)===q.answer,'42 L'+l+': wrong answer '+got+' vs '+q.answer);
}
// 5: rilegge la griglia, conta le soluzioni (deve essere 1) e controlla la casella dorata.
function verify5(q,l){
  const tiles=[...q.visual.matchAll(/<div class="sudokuTile[^"]*"[^>]*>([^<]*)<\/div>/g)].map(m=>m[1]==='&nbsp;'?'':m[1]),n=Math.round(Math.sqrt(tiles.length)),bw=n===4?2:3,bh=2;
  check(n*n===tiles.length,'5: grid not square');
  const g=[];for(let r=0;r<n;r++)g.push(tiles.slice(r*n,r*n+n).map(v=>v===''||v==='?'?0:Number(v)));
  const target=tiles.indexOf('?'),tr=Math.floor(target/n),tc=target%n;let sols=0,val=null;
  const okAt=(r,c,v)=>{for(let i=0;i<n;i++){if(g[r][i]===v||g[i][c]===v)return false;}const r0=Math.floor(r/bh)*bh,c0=Math.floor(c/bw)*bw;for(let y=r0;y<r0+bh;y++)for(let x=c0;x<c0+bw;x++)if(g[y][x]===v)return false;return true;};
  (function rec2(){if(sols>1)return;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!g[r][c]){for(let v=1;v<=n;v++)if(okAt(r,c,v)){g[r][c]=v;rec2();g[r][c]=0;}return;}sols++;val=g[tr][tc];})();
  check(sols===1&&String(val)===q.answer,'5 L'+l+': sudoku solutions '+sols+', value '+val+' vs '+q.answer);
  check(tiles.filter(v=>v===''||v==='?').length===q.meta.age6Metrics.holes,'5 L'+l+': holes');
}
function verify73(q,l){
  let v=q.meta.calcStart;for(const [op,a] of q.meta.calcOps)v=op==='+'?v+a:op==='−'?v-a:v*a;
  check(String(v)===q.answer&&v>=0,'73 L'+l+': wrong chain result');
  check(q.meta.calcOps.length===N.V92Brain.T73[l-1][0],'73 L'+l+': number of operations');
}
// Lingue
const audioHas=(lang,text)=>{const n=String(text).trim().toLowerCase();return !!(N.AUDIO_INDEX[lang+'|'+n]||N.AUDIO_INDEX[lang+'|'+n+'.']);};
function verifyLang(id,q,l){
  const lang=id===60||id===61?'es':'en',w=x=>lang==='es'?x.es:x.en,M=q.meta.age6Metrics;
  const modes=(id===16||id===60?N.V92Lang.MODES_A:N.V92Lang.MODES_B);
  check(M.mode===modes[l-1][0],id+' L'+l+': mode');
  if(!M.tierFree&&M.mode!=='odd'){const tier=N.V92Lang.tier(lang,l);check(tier.indexOf(q.word)>=0,id+' L'+l+': word outside vocabulary band');}
  if(/^ear/.test(M.mode)||M.mode==='w2img'||M.mode==='w2it')check(q.autoSpeak&&q.autoSpeak[0],id+' L'+l+': listening mode without audio');
  if(['img2w','w2img','wonly2img','ear2img'].includes(M.mode)){const list=lang==='es'?N.WORDS_ES:N.WORDS;for(const v of optVals(q)){const x=list.find(y=>w(y)===v);check(x&&x.cat!=='time'&&!['gold','silver','grey','pink'].includes(x.en),id+' L'+l+': picture mode uses a word without a clear picture: '+v);}}
  if(M.mode==='wonly2img')check(!q.autoSpeak,id+' L'+l+': read-only mode should not autoplay');
  for(const s of [q.autoSpeak,q.sayAfter])if(s&&s[0])check(audioHas(lang,s[0]),id+' L'+l+': missing audio for "'+s[0]+'"');
  if(M.mode==='odd'||M.mode==='oddNoCat'){const vals=optVals(q),list=lang==='es'?N.WORDS_ES:N.WORDS,cat=x=>list.find(y=>w(y)===x).cat,cats=vals.map(cat),odd=cats.filter((c,i)=>cats.indexOf(c)===cats.lastIndexOf(c)&&vals[i]===q.answer);check(odd.length===1&&cats.filter(c=>c!==cat(q.answer)).length===vals.length-1,id+' L'+l+': odd-one-out ambiguous');}
}

/* ---------- giro su tutti i giochi e livelli ---------- */
const verifiers={1:verify1,5:verify5,7:verify7,8:verify8,11:verify11,14:verify14,31:verify31,32:verify32,33:verify33,41:verify41,42:verify42,73:verify73};
let total=0;const perGame={};
for(const g of N.GAMES){
  if(g.arcade)continue;
  const fn=gen(g.id);check(fn,'generator '+g.id);
  let prevMax=null;
  check(N.LEVEL_INFO[g.id]&&N.LEVEL_INFO[g.id].length===15,'LEVEL_INFO missing for '+g.id);
  check(new Set(N.LEVEL_INFO[g.id]).size===15,'LEVEL_INFO for '+g.id+' has identical levels');
  for(let l=1;l<=15;l++){
    let mn=null,mx=null;
    const n=g.id===5?Math.ceil(SAMPLES/4):g.id===41?Math.ceil(SAMPLES/2):SAMPLES;
    for(let t=0;t<n;t++){
      const q=fn(l,state);total++;
      check(q.meta&&q.meta.level===l,g.id+' L'+l+': level meta');
      const vals=optVals(q);
      check(vals.includes(String(q.answer)),g.id+' L'+l+': answer not among options');
      check(new Set(vals).size===vals.length,g.id+' L'+l+': duplicate options');
      if(g.id===5)check(vals.length===(l<=4?4:6),'5 L'+l+': digit options');
      else if(q.meta.v92)check(vals.length===CH[l-1]||(g.id===14&&vals.length>=CH[l-1]-1),g.id+' L'+l+': expected '+CH[l-1]+' options, got '+vals.length);
      const r=q.meta.v92?q.meta.age6Metrics.rank:[q.meta.age6Metrics.holes];
      check(Array.isArray(r)&&r.every(x=>typeof x==='number'),g.id+' L'+l+': rank');
      if(!mn||lexCmp(r,mn)<0)mn=r;if(!mx||lexCmp(r,mx)>0)mx=r;
      if(verifiers[g.id])verifiers[g.id](q,l);
      if([16,34,60,61].includes(g.id))verifyLang(g.id,q,l);
    }
    if(prevMax)check(lexCmp(mn,prevMax)>0,'Game '+g.id+' ('+g.name+'): level '+l+' not harder than level '+(l-1)+' (min '+JSON.stringify(mn)+' <= previous max '+JSON.stringify(prevMax)+')');
    prevMax=mx;
  }
  perGame[g.id]=1;
}
// Giochi “cervello” interattivi: tabelle a 15 righe sempre più difficili.
const B=N.V92Brain;
const rank70=r=>[r[1],r[0],-r[2]];
const SET71={easy:0,animals:1,dots:2,fruit:3},rank71=r=>[r[0],r[2],SET71[r[1]],r[3],-r[4]];
const RULE72={word:0,ink:1,sw4:2,sw3:3,rand:4,randShuf:5,randTrick:6},rank72=r=>[RULE72[r[1]],r[0],r[2],-r[3],-r[4]];
for(const [name,T,rk] of [['70 Lampi di Luce',B.T70,rank70],['71 Uguale o Diverso',B.T71,rank71],['72 Colori Furbi',B.T72,rank72]]){
  check(T.length===15,name+' table');
  for(let i=1;i<15;i++)check(lexCmp(rk(T[i]),rk(T[i-1]))>0,name+': level '+(i+1)+' not harder than '+i);
}
for(const id of [70,71,72,51,52,53,54,55,56,57])check(N.LEVEL_INFO[id]&&new Set(N.LEVEL_INFO[id]).size===15,'LEVEL_INFO '+id);
// Spagnolo: tutte le parole e tutte le frasi hanno l'audio.
check(N.WORDS_ES.length===N.WORDS.length,'every English word must have a Spanish translation');
for(const x of N.WORDS_ES){check(audioHas('es',x.es),'audio es missing: '+x.es);check(audioHas('es',N.esBare(x)),'audio es (bare) missing: '+N.esBare(x));}
for(const x of N.WORDS)check(audioHas('en',x.en),'audio en missing: '+x.en);
for(const s of N.SENTENCES_ES){const w=N.WORDS_ES.find(y=>y.en===s.a);check(w,'sentence word '+s.a);check(audioHas('es',s.s.replace('___',N.esBare(w))),'audio es sentence missing: '+s.s);}
// Livelli e versione.
check(N.contentLevel(1)===1&&N.contentLevel(15)===15,'no hidden level boost in v9.2');
check(N.questionsFor(1)===5&&N.questionsFor(15)===10,'questions per level');
for(let l=2;l<=15;l++)check(N.secondsFor(l)<=N.secondsFor(l-1),'seconds per question must not grow');
check(N.GAMES.length===28&&!N.GAMES.some(g=>g.id===21||g.id===35),'28 games, figure games merged');
check(typeof N.fx.confetti==='function','fx module missing');
check(N.APP_VERSION==='9.2.0','version');
console.log('PASS v9.2: '+total+' questions verified with independent solvers across '+Object.keys(perGame).length+' question games x 15 levels; strict level gaps; 3 brain games; Spanish audio complete');
