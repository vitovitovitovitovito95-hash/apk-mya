'use strict';
/* v9.2 — Scala dei livelli riprogettata gioco per gioco.
   Ogni gioco ha una TABELLA di 15 livelli scritta a mano: ogni livello cambia almeno una
   caratteristica concreta (regola, numero di elementi, caratteristiche da confrontare,
   tipo di domanda, numero e somiglianza delle risposte). Niente “salto di +3 livelli”:
   il livello 1 è il livello 1, il 15 è davvero il più difficile.
   Ogni domanda espone meta.age6Metrics.rank: un vettore che cresce in ordine
   lessicografico da un livello al successivo (verificato da tests/v92_levels_test.js). */
(function(NS){
  const rnd=(a,b)=>NS.rnd(a,b), pick=a=>NS.pick(a), sh=a=>NS.shuffle(a);
  const CH=[3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
  const nc=l=>CH[l-1];
  NS.LEVEL_INFO=NS.LEVEL_INFO||{};
  function q(id,l,question,metric){
    const o=NS.attachDifficulty(question,id,l);
    o.meta.age6=true;o.meta.age6Load=NS.AGE6_DIFFICULTY[l-1].load;o.meta.age6Metrics=metric;o.meta.v92=true;
    return o;
  }
  // Opzioni numeriche: a livelli alti i distrattori sono “errori plausibili” passati dal generatore.
  function numOpts(answer,count,near){
    const vals=[answer];
    (near||[]).concat(sh([answer+1,answer-1,answer+2,answer-2,answer+3,answer-3,answer+5,answer-5,answer+10,answer-10]))
      .forEach(v=>{v=Math.round(v);if(v>=0&&vals.indexOf(v)<0&&vals.length<count)vals.push(v);});
    let d=11;while(vals.length<count){if(vals.indexOf(answer+d)<0)vals.push(answer+d);d++;}
    return sh(vals).map(String);
  }

  /* ===== Gettoni grafici: forma colorata + direzione + taglia (usati da 7, 8, 33) ===== */
  const HEX=['#ff3b4f','#2f80ff','#1fb26b','#ffb400','#9b5cff','#ff7a1a'];
  const SHP=['●','▲','■','◆','★','⬟'];
  function tok(t,f){ // t=[colore,forma,direzione,taglia]
    const shape=f>=2?SHP[t[1]]:'●',dir=f>=3?'<i class="tkDir" style="-webkit-transform:rotate('+(t[2]*90)+'deg);transform:rotate('+(t[2]*90)+'deg)">➜</i>':'';
    return '<span class="tk'+(f>=4&&t[3]?' tkBig':'')+'" style="color:'+HEX[t[0]]+'">'+shape+dir+'</span>';
  }
  const key=(t,f)=>t.slice(0,f).join('-');
  const randT=()=>[rnd(0,5),rnd(0,5),rnd(0,3),rnd(0,1)];
  function nearT(t,f,only){const ft=only!==undefined?only:rnd(0,f-1),size=[6,6,4,2][ft],v=t.slice();let x=t[ft];while(x===t[ft])x=rnd(0,size-1);v[ft]=x;return v;}
  function tiles(list,numbered,extra){return '<div class="tkStrip">'+list.map((h,i)=>'<span class="tkCell'+(extra&&extra[i]?' '+extra[i]:'')+'">'+(numbered?'<small>'+(i+1)+'</small>':'')+h+'</span>').join('')+'</div>';}

  /* ========== 1. Numero Mancante ========== */
  const T1=[
    ['step',5,'Aggiungi sempre 2'],['step',5,'Salti più grandi (+3, +4, +5)'],['down',6,'Sequenze che scendono'],
    ['stepHole',6,'Il numero mancante è in mezzo'],['bigHole',6,'Salti da 7 a 11, numero in mezzo'],['alt',7,'Due salti che si alternano'],
    ['altMix',7,'Sali e scendi a turno'],['altHole',8,'Salti alternati con buco in mezzo'],['grow',7,'Il salto cresce: +1, +2, +3…'],
    ['double',6,'Ogni numero è il doppio'],['growHole',8,'Salto che cresce, buco in mezzo'],['inter',9,'Due sequenze intrecciate'],
    ['fib',7,'Ogni numero = somma dei due precedenti'],['mulAdd',7,'×2 e +k a turno'],['fibHole',8,'Somma dei due precedenti, buco in mezzo']
  ];
  NS.LEVEL_INFO[1]=T1.map(r=>r[2]);
  function g1(l){
    const [kind,n]=T1[l-1];let seq=[],hide=-1,rule='',near=[];const a=rnd(1,5);
    if(kind==='step'){const s=l===1?2:rnd(3,5);for(let i=0;i<=n;i++)seq.push(a+i*s);rule='Aggiungi sempre '+s+'.';near=[seq[n]+1,seq[n]-s];}
    else if(kind==='down'){const s=rnd(2,3),st=s*n+rnd(3,9);for(let i=0;i<=n;i++)seq.push(st-i*s);rule='Togli sempre '+s+'.';near=[seq[n]+s,seq[n]-1];}
    else if(kind==='stepHole'||kind==='bigHole'){const s=kind==='stepHole'?rnd(4,6):rnd(7,11),st=kind==='bigHole'?rnd(5,20):a;for(let i=0;i<n;i++)seq.push(st+i*s);hide=rnd(1,n-2);rule='Ogni volta +'+s+'.';near=[seq[hide]+s,seq[hide]-1,seq[hide]+1];}
    else if(kind==='alt'||kind==='altHole'){const x=rnd(1,2),y=rnd(3,5);let v=a;seq=[v];for(let i=1;i<=n;i++){v+=i%2?x:y;seq.push(v);}if(kind==='altHole'){seq.pop();hide=rnd(2,n-2);}rule='Alterna +'+x+' e +'+y+'.';near=[x,y].map(d=>(hide>=0?seq[hide-1]:seq[n-1])+d);}
    else if(kind==='altMix'){const x=rnd(3,5),y=rnd(1,2);let v=a+5;seq=[v];for(let i=1;i<=n;i++){v+=i%2?x:-y;seq.push(v);}rule='Alterna +'+x+' e −'+y+'.';near=[seq[n-1]+x,seq[n-1]-y].filter(z=>z!==seq[n]);}
    else if(kind==='grow'||kind==='growHole'){let v=a,d=kind==='grow'?1:rnd(2,3);const d0=d;seq=[v];for(let i=1;i<=n;i++){v+=d;seq.push(v);d++;}if(kind==='growHole'){seq.pop();hide=rnd(3,n-2);}rule='Il salto cresce di 1 ogni volta (+'+d0+', +'+(d0+1)+', +'+(d0+2)+'…).';const t=hide>=0?hide:n;near=[seq[t-1]+(seq[t-1]-seq[t-2]),seq[t]+1];}
    else if(kind==='double'){let v=rnd(1,3);for(let i=0;i<=n;i++){seq.push(v);v*=2;}rule='Ogni numero è il doppio del precedente.';near=[seq[n-1]+(seq[n-1]-seq[n-2]),seq[n]+2,seq[n-1]*3];}
    else if(kind==='inter'){const up=rnd(2,4),dn=rnd(1,3);let x=a,y=dn*6+rnd(8,14);for(let i=0;i<=n;i++){seq.push(i%2?y:x);if(i%2)y-=dn;else x+=up;}rule='Due sequenze intrecciate: una sale di '+up+', l’altra scende di '+dn+'.';near=[seq[n-1]+up,seq[n-1]-dn,seq[n-2]];}
    else if(kind==='fib'||kind==='fibHole'){let x=rnd(1,3),y=rnd(1,4);seq=[x,y];while(seq.length<=n)seq.push(seq[seq.length-1]+seq[seq.length-2]);if(kind==='fibHole'){seq.pop();hide=rnd(2,n-3);}rule='Ogni numero è la somma dei due prima.';const t=hide>=0?hide:n;near=[seq[t-1]*2,seq[t]+1,seq[t-1]+1];}
    else if(kind==='mulAdd'){const k=rnd(1,3);let v=rnd(1,2);for(let i=0;i<=n;i++){seq.push(v);v=i%2?v+k:v*2;}rule='A turno: ×2 e poi +'+k+'.';near=[seq[n-1]+k,seq[n-1]*2+k,seq[n]+1];}
    let answer;
    if(hide<0){answer=seq[n];seq=seq.slice(0,n);}else answer=seq[hide];
    const shown=seq.map((v,i)=>i===hide?'<b class="seqHole">?</b>':String(v)).join(' · ')+(hide<0?' · <b class="seqHole">?</b>':'');
    return q(1,l,{prompt:hide<0?'Qual è il numero che viene dopo?':'Quale numero manca?',visual:'<div class="bigVisual seqVisual">'+shown+'</div>',
      options:numOpts(answer,nc(l),near.filter(x=>x!==answer)),answer:String(answer),hint:rule},
      {terms:3+l,rank:[l],kind:kind,hiddenInternal:hide>=0?1:0,choices:nc(l)});
  }

  /* ========== 7. Chi è l'intruso? ========== */
  const T7=[[4,1,1],[5,1,1],[6,2,2],[6,2,1],[7,2,1],[8,3,2],[8,3,1],[9,3,1],[10,3,1],[10,4,1],[11,4,1],[12,4,1],[13,4,1],[14,4,1],[15,4,1]];
  const FEAT=['colore','forma','direzione','grandezza'];
  NS.LEVEL_INFO[7]=T7.map(([n,f,d])=>n+' figure · '+f+' '+(f>1?'caratteristiche':'caratteristica')+' · '+(d===1&&f>1?'cambia UN solo dettaglio':'differenza evidente'));
  function g7(l){
    const [n,f,d]=T7[l-1],base=randT();let odd;
    if(d===1)odd=nearT(base,f,l>=13?rnd(2,3):undefined);else{odd=randT();while(key(odd,f)===key(base,f)||(f>1&&odd.slice(0,f).filter((v,i)=>v===base[i]).length>f-d))odd=randT();}
    const idx=rnd(0,n-1),list=[];for(let i=0;i<n;i++)list.push(tok(i===idx?odd:base,f));
    const others=sh(Array.from({length:n},(_,i)=>i).filter(i=>i!==idx));
    // a livelli alti i distrattori sono le posizioni vicine all'intruso
    const nearPos=l>=8?others.sort((x,y)=>Math.abs(x-idx)-Math.abs(y-idx)):others;
    const opts=sh([idx].concat(nearPos.slice(0,nc(l)-1)));
    return q(7,l,{prompt:'Quale figura è diversa dalle altre?',sub:d===1&&f>1?'Cambia un solo dettaglio: '+FEAT.slice(0,f).join(', ')+'.':'',visual:tiles(list,true),
      options:opts.map(v=>({label:'Posizione '+(v+1),value:String(v)})),answer:String(idx),answerLabel:'Posizione '+(idx+1),hint:'Controlla una caratteristica alla volta: '+FEAT.slice(0,f).join(', ')+'.'},
      {visibleItems:n,featureCount:f,rank:[f,4-d,n],choices:nc(l)});
  }

  /* ========== 33. Coppie Gemelle ========== */
  const T33=[[4,1,0],[5,1,0],[5,2,0],[6,2,.3],[7,2,.5],[7,3,.3],[8,3,.5],[9,3,.6],[10,3,.7],[10,4,.6],[11,4,.7],[12,4,.8],[13,4,.85],[14,4,.9],[15,4,.95]];
  NS.LEVEL_INFO[33]=T33.map(([n,f,s])=>n+' figure · '+f+' '+(f>1?'caratteristiche':'caratteristica')+(s?' · '+Math.round(s*100)+'% quasi uguali':''));
  function g33(l){
    const [n,f,share]=T33[l-1],twin=randT(),seen={},others=[];seen[key(twin,f)]=1;let guard=0;
    while(others.length<n-2&&guard++<4000){const t=Math.random()<share?nearT(twin,f):randT(),k=key(t,f);if(seen[k])continue;seen[k]=1;others.push(t);}
    const list=sh(others);let i=rnd(0,list.length);list.splice(i,0,twin);let j=rnd(0,list.length);while(j===i)j=rnd(0,list.length);list.splice(j,0,twin);
    const pos=[];list.forEach((t,k)=>{if(t===twin)pos.push(k+1);});
    const answer=pos.join('-'),pool=[];for(let a=1;a<=n;a++)for(let b=a+1;b<=n;b++)if(a+'-'+b!==answer)pool.push(a+'-'+b);
    const tricky=pool.filter(p=>{const s=p.split('-').map(Number);return s.indexOf(pos[0])>=0||s.indexOf(pos[1])>=0;});
    const opts=sh([answer].concat(sh(l>=6?tricky:pool).concat(sh(pool)).filter((v,k,a)=>a.indexOf(v)===k).slice(0,nc(l)-1)));
    return q(33,l,{prompt:'Dove sono le due figure identiche?',sub:share?'Molte figure si somigliano: controlla tutti i dettagli.':'',visual:tiles(list.map(t=>tok(t,f)),true),
      options:opts.map(v=>({label:'Pezzi '+v.replace('-',' e '),value:v})),answer:answer,answerLabel:'Pezzi '+pos[0]+' e '+pos[1],hint:'Prendi una figura e cercane una identica, dettaglio per dettaglio.'},
      {items:n,features:f,rank:[f,Math.round(share*100),n],options:opts.length});
  }

  /* ========== 8. Sequenze di Figure (cicli indipendenti per colore, forma, direzione) ========== */
  // c/s = schema del ciclo (indici), d = passo di rotazione della freccia (0 = nessuna), miss = 0/1/2 caselle nascoste
  const T8=[
    {c:[0,1],len:5,miss:0},{c:[0,1,2],len:6,miss:0},{c:[0,1,2],len:7,miss:1},
    {c:[0,1],s:[0,1],len:7,miss:0},{c:[0,1],s:[0,1,2],len:8,miss:0},{c:[0,1,2],s:[0,1],len:8,miss:1},
    {c:[0,1,2],s:[0,1,2,3],len:9,miss:1},{c:[0,0,1],s:[0,1,2],len:10,miss:1},
    {c:[0,1],s:[0,1,2],d:1,len:9,miss:0},{c:[0,1,2],s:[0,1],d:1,len:10,miss:1},{c:[0,1,2,3],s:[0,1,2],d:1,len:11,miss:1},
    {c:[0,1,1],s:[0,1,2,3],d:1,len:12,miss:1},{c:[0,1,2],s:[0,1,2,3],d:2,len:11,miss:2},{c:[0,1,2,3],s:[0,1,2],d:2,len:12,miss:2},
    {c:[0,0,1,2],s:[0,1,1],d:1,len:13,miss:2}
  ];
  NS.LEVEL_INFO[8]=T8.map(t=>{const f=t.d?3:t.s?2:1;return t.len+' figure · '+(f===1?'colori':f===2?'colore e forma con cicli diversi':'colore, forma e freccia che ruota')+(t.miss?' · '+(t.miss===2?'due caselle coperte':'pezzo mancante in mezzo'):'');});
  function g8(l){
    const t=T8[l-1],f=t.d?3:t.s?2:1,cols=sh([0,1,2,3,4,5]),shps=sh([0,1,2,3,4,5]),d0=rnd(0,3);
    const at=i=>[cols[t.c[i%t.c.length]],t.s?shps[t.s[i%t.s.length]]:0,t.d?(d0+i*t.d)%4:0,0];
    const total=t.miss?t.len:t.len+1,seq=Array.from({length:total},(_,i)=>at(i));
    let ask=t.miss?rnd(Math.max(2,t.c.length),t.len-2):t.len,blank=-1;
    if(t.miss===2){blank=ask+(rnd(0,1)?1:-1);if(blank>=t.len)blank=ask-1;}
    const answerT=seq[ask],answer=key(answerT,4);
    const shown=seq.slice(0,t.len).map((x,i)=>i===ask?'<b class="seqHole">?</b>':i===blank?'<span class="tkBlank"></span>':tok(x,f));
    if(!t.miss)shown.push('<b class="seqHole">?</b>');
    // distrattori: stessa figura con UNA caratteristica sbagliata (presi dal ciclo stesso)
    const pool=[],seen={};seen[answer]=1;
    const addP=x=>{const k=key(x,4);if(!seen[k]){seen[k]=1;pool.push(x);}};
    for(let i=0;i<total+4;i++){const x=at(i);if(f>=2)addP([x[0],answerT[1],answerT[2],0]);if(f>=2)addP([answerT[0],x[1],answerT[2],0]);if(f>=3)addP([answerT[0],answerT[1],x[2],0]);addP(x);}
    for(let k=0;k<6;k++)addP([k,answerT[1],answerT[2],0]);
    const opts=sh([answerT].concat(sh(pool).slice(0,nc(l)-1)));
    return q(8,l,{prompt:t.miss?'Quale figura va al posto del ?':'Quale figura viene dopo?',sub:f>=2?'Colore'+(f>=3?', forma e freccia':' e forma')+' seguono cicli DIVERSI: seguili separatamente.':'',visual:tiles(shown,false),
      options:opts.map(x=>({label:'<span class="optTok">'+tok(x,f)+'</span>',value:key(x,4)})),answer:answer,answerLabel:tok(answerT,f),hint:f===1?'Trova il gruppo di colori che si ripete.':'Guarda prima solo i colori, poi solo le forme'+(f>=3?', poi come gira la freccia.':'.')},
      {presentedItems:3+l,features:f,rank:[f,t.miss,t.len],tiles:t.len});
  }

  /* ========== 14. Memoria Visiva ========== */
  const T14=[[3,4000,1],[4,3800,1],[5,3600,1],[5,3200,2],[6,3200,2],[6,2800,3],[7,2800,3],[8,2600,3],[8,2300,4],[9,2300,4],[10,2200,4],[10,1900,4],[11,1900,4],[12,1800,4],[12,1500,4]];
  const OBJ=['🍎','🐶','🚗','🦋','⭐','⚽','🍓','🐠','🌙','🌸','🐱','🚀','🍦','🎈','🧸','🍀','☀️','📘','🍋','🎲','🐸','🍩','🎸','🦊'];
  NS.LEVEL_INFO[14]=T14.map(([n,ms,t])=>n+' oggetti · '+(ms/1000).toFixed(1)+' s per guardarli · '+['','domanda: posizione','+ “quale NON c’era?”','+ “quale era in mezzo?”','+ “quale è venuto prima?”'][t]);
  function g14(l){
    const [n,ms,types]=T14[l-1],imgs=sh(OBJ).slice(0,n),type=rnd(1,types);let ask,answer,opts;
    if(type===1){const p=rnd(0,n-1);answer=imgs[p];ask='Quale oggetto era nella casella '+(p+1)+'?';opts=[answer].concat(sh(imgs.filter(x=>x!==answer)).slice(0,nc(l)-2)).concat(sh(OBJ.filter(x=>imgs.indexOf(x)<0)).slice(0,1));}
    else if(type===2){answer=pick(OBJ.filter(x=>imgs.indexOf(x)<0));ask='Quale oggetto NON c’era?';opts=[answer].concat(sh(imgs).slice(0,nc(l)-1));}
    else if(type===3){const p=rnd(1,n-2);answer=imgs[p];ask='Quale oggetto era tra '+imgs[p-1]+' e '+imgs[p+1]+'?';opts=[answer].concat(sh(imgs.filter(x=>x!==answer&&x!==imgs[p-1]&&x!==imgs[p+1])).slice(0,nc(l)-1));}
    else{const cand=sh(imgs).slice(0,Math.min(nc(l),n));answer=cand.reduce((a,b)=>imgs.indexOf(a)<imgs.indexOf(b)?a:b);ask='Quale di questi era PRIMA (nella casella col numero più piccolo)?';opts=cand;}
    opts=sh(opts.filter((v,i,a)=>a.indexOf(v)===i));
    const id='m92_'+Math.random().toString(36).slice(2);
    return q(14,l,{prompt:'Memorizza gli oggetti!',sub:'Hai '+(ms/1000).toFixed(1)+' secondi.',
      visual:'<div class="memoryBoard grid" id="'+id+'">'+imgs.map((o,i)=>'<span><small>'+(i+1)+'</small>'+o+'</span>').join('')+'</div><div class="memoryTimer"><i style="-webkit-animation-duration:'+ms+'ms;animation-duration:'+ms+'ms"></i></div>',
      options:opts.map(v=>({label:'<span class="optEmoji">'+v+'</span>',value:v})),answer:answer,answerLabel:answer,hint:'Prova a dire i nomi degli oggetti in ordine mentre li guardi.',
      afterRender:function(){const el=document.getElementById(id),opt=document.querySelector('.options');if(!el)return;if(opt){opt.style.visibility='hidden';opt.style.pointerEvents='none';}
        setTimeout(function(){if(!document.getElementById(id))return;const sp=el.querySelectorAll('span');for(let s=0;s<sp.length;s++){sp[s].className='hidden';sp[s].innerHTML='<small>'+(s+1)+'</small>❓';}
          const t=el.nextSibling;if(t&&t.style)t.style.visibility='hidden';const h=document.querySelector('.question h3');if(h)h.textContent=ask;if(opt){opt.style.visibility='visible';opt.style.pointerEvents='auto';}},ms);}},
      {memoryItems:n,exposureMs:ms,questionTypes:types,qType:type,rank:[types,n,5000-ms]});
  }

  /* ========== 31. Conta e Scegli ========== */
  const K31=[0,0,1,1,1,2,2,2,3,3,3,3,4,4,4],OPS31=l=>l<=4?0:l<=8?1:l<=12?2:3;
  NS.LEVEL_INFO[31]=Array.from({length:15},(_,i)=>{const l=i+1;return (3+l)+' mele da contare'+(K31[i]?' tra '+K31[i]+' '+(K31[i]>1?'tipi':'tipo')+' di altra frutta':'')+(OPS31(l)?' · '+OPS31(l)+' '+(OPS31(l)>1?'operazioni':'operazione'):'');});
  function g31(l){
    const target='🍎',kinds=K31[l-1],types=sh(['🍐','🍊','🍋','🍓','🍇','🍑']).slice(0,kinds),count=3+l;
    const dist=kinds?Math.min(12,Math.ceil(count*0.7)):0,items=[];for(let i=0;i<count;i++)items.push(target);for(let k=0;k<dist;k++)items.push(types[k%kinds]);
    const ops=OPS31(l);let n=count,text=kinds?'Conta SOLO le '+target+'.':'Conta le '+target+'.';const steps=[];
    if(ops>=1){const a=rnd(2,3+Math.floor(l/4));n+=a;text+=' Poi aggiungine '+a+'.';steps.push(a);}
    if(ops>=2){const b=rnd(2,4);n-=b;text+=' Poi togline '+b+'.';steps.push(-b);}
    if(ops>=3){const c=rnd(1,5);n+=c;text+=' Infine aggiungine '+c+'.';steps.push(c);}
    const cols=items.length>16?6:items.length>9?5:4;
    return q(31,l,{prompt:'Quante mele ci sono alla fine?',sub:text,visual:'<div class="countGrid" style="max-width:'+(cols*48)+'px">'+sh(items).map(o=>'<span>'+o+'</span>').join('')+'</div>',
      options:numOpts(n,nc(l),[count+dist,n+(steps[0]||1),n-(steps[steps.length-1]||1),count]),answer:String(n),hint:'Conta le mele toccandole con lo sguardo una alla volta, poi fai le operazioni in ordine.'},
      {countedItems:count,distractorKinds:kinds,ops:ops,added:steps.filter(x=>x>0).reduce((a,b)=>a+b,0),removed:-steps.filter(x=>x<0).reduce((a,b)=>a+b,0),rank:[ops,kinds,count]});
  }

  /* ========== 11. Blocchi Logici (blocchi di Dienes: colore, forma, grandezza; E / NON / OPPURE) ========== */
  const BC=[['rosso','#ff3b4f'],['blu','#2f80ff'],['giallo','#ffc21a'],['verde','#1fb26b']];
  const BS=['cerchio','quadrato','triangolo','rettangolo'],BZ=['piccolo','grande'];
  // form: f=trova l'unico, c=conta. conds: lista di [attributo, negato] ; or: prime due condizioni in OPPURE
  const T11=[
    {n:3,f:'f',c:[['c',0]]},{n:4,f:'f',c:[['s',0]]},{n:4,f:'f',c:[['c',0],['s',0]]},{n:5,f:'f',c:[['c',0],['z',0]]},
    {n:6,f:'f',c:[['c',1],['z',0]]},{n:7,f:'f',c:[['c',0],['s',0],['z',0]]},{n:7,f:'f',c:[['s',0],['c',1],['z',0]]},
    {n:8,f:'c',c:[['c',0]]},{n:8,f:'c',c:[['c',0],['s',0]]},{n:9,f:'c',c:[['s',0],['z',1]]},
    {n:9,f:'c',c:[['c',0],['z',0],['s',1]]},{n:10,f:'c',c:[['c',1],['s',1]]},{n:11,f:'c',c:[['c',0],['s',0]],or:1},
    {n:11,f:'c',c:[['c',0],['s',0],['z',0]],or:1},{n:12,f:'c',c:[['c',1],['s',1],['z',0]]}
  ];
  NS.LEVEL_INFO[11]=T11.map(t=>t.n+' blocchi · '+(t.f==='f'?'trova quello giusto':'contali')+' · '+t.c.length+' '+(t.c.length>1?'condizioni':'condizione')+(t.c.some(c=>c[1])?' con NON':'')+(t.or?' con OPPURE':''));
  function blockHtml(b,num){
    const col=BC[b.c][1],sz=b.z?46:28,shape=BS[b.s];let st;
    if(shape==='triangolo')st='width:0;height:0;border-left:'+(sz/2+2)+'px solid transparent;border-right:'+(sz/2+2)+'px solid transparent;border-bottom:'+sz+'px solid '+col;
    else st='background:'+col+';width:'+(shape==='rettangolo'?Math.round(sz*1.6):sz)+'px;height:'+(shape==='rettangolo'?Math.round(sz*0.75):sz)+'px'+(shape==='cerchio'?';border-radius:50%':';border-radius:4px');
    return '<span class="dCell">'+(num?'<small>'+num+'</small>':'')+'<i class="dBlock" style="'+st+'"></i></span>';
  }
  function chip(attr,b,neg){
    const label=attr==='c'?'<i class="sw" style="background:'+BC[b.c][1]+'"></i>'+BC[b.c][0]:attr==='s'?blockHtml({c:3,s:b.s,z:0}).replace('dCell','dMini')+BS[b.s]:(b.z?'⬛ ':'▪️ ')+BZ[b.z];
    return '<span class="dChip'+(neg?' neg':'')+'">'+(neg?'<b>NON</b> ':'')+label+'</span>';
  }
  function g11(l){
    const t=T11[l-1],ref={c:rnd(0,l>=7?3:2),s:rnd(0,3),z:rnd(0,1)};
    const test=b=>{const r=t.c.map(([a,neg])=>(b[a]===ref[a])!==!!neg);return t.or?((r[0]||r[1])&&r.slice(2).every(Boolean)):r.every(Boolean);};
    let blocks,count,guard=0;
    do{blocks=Array.from({length:t.n},()=>({c:rnd(0,l>=7?3:2),s:rnd(0,3),z:rnd(0,1)}));count=blocks.filter(test).length;guard++;}
    while(guard<3000&&(t.f==='f'?count!==1:(count<1||count>t.n-2)));
    const conds=t.c.map(([a,neg],i)=>chip(a,ref,neg)+(i<t.c.length-1?(t.or&&i===0?'<b class="dJoin or">OPPURE</b>':'<b class="dJoin">E</b>'):''));
    const condHtml='<div class="dConds">'+(t.or&&t.c.length>2?'<span class="dGroup">'+conds[0]+conds[1]+'</span>'+conds.slice(2).join(''):conds.join(''))+'</div>';
    const board='<div class="dBoard">'+blocks.map((b,i)=>blockHtml(b,i+1)).join('')+'</div>';
    let options,answer,answerLabel;
    if(t.f==='f'){const idx=blocks.findIndex(test);answer=String(idx+1);answerLabel='Blocco '+answer;
      const near=blocks.map((b,i)=>[i,t.c.filter(([a,neg])=>(b[a]===ref[a])!==!!neg).length]).filter(x=>x[0]!==idx).sort((x,y)=>y[1]-x[1]).map(x=>String(x[0]+1));
      options=sh([answer].concat(near.slice(0,nc(l)-1))).map(v=>({label:'Blocco '+v,value:v}));}
    else{answer=String(count);answerLabel=answer;const loose=blocks.filter(b=>t.c.slice(0,1).every(([a,neg])=>(b[a]===ref[a])!==!!neg)).length;options=numOpts(count,nc(l),[loose,count+1,count-1]);}
    return q(11,l,{prompt:t.f==='f'?'Trova il blocco con queste caratteristiche:':'Quanti blocchi hanno queste caratteristiche?',sub:t.or?'OPPURE = basta una delle due. E = servono entrambe.':'',visual:condHtml+board,options:options,answer:answer,answerLabel:answerLabel,
      hint:t.c.some(c=>c[1])?'NON significa: tutti tranne quello. Controlla una condizione alla volta.':'Controlla ogni blocco: colore, poi forma, poi grandezza.'},
      {blocks:t.n,conditions:t.c.length,rank:[t.n,t.c.length+t.c.filter(c=>c[1]).length+(t.or?2:0)+(t.f==='c'?2:0)]});
  }

  /* ========== 32. Ombra Giusta ========== */
  const OUT={'●':'○','▲':'△','■':'□','◆':'◇','★':'☆','⬟':'⬡'},SH6=Object.keys(OUT);
  NS.LEVEL_INFO[32]=Array.from({length:15},(_,i)=>(i+2)+' pezzi in fila · '+(i>=9?'ombra al CONTRARIO (specchio)':'ombra nello stesso ordine')+' · '+CH[i]+' risposte quasi uguali');
  function g32(l){
    const len=l+1,mirror=l>=10,items=Array.from({length:len},()=>pick(SH6)),target=(mirror?items.slice().reverse():items).map(s=>OUT[s]);
    const answer=target.join('');const pool=[];
    if(mirror)pool.push(items.map(s=>OUT[s]).join(''));
    for(let k=0;k<30;k++){const alt=target.slice(),at=rnd(0,len-1);alt[at]=OUT[pick(SH6.filter(s=>OUT[s]!==target[at]))];pool.push(alt.join(''));if(len>2&&k%3===0){const sw=target.slice(),x=rnd(0,len-2);const tmp=sw[x];sw[x]=sw[x+1];sw[x+1]=tmp;pool.push(sw.join(''));}}
    const opts=[answer];pool.forEach(p=>{if(opts.indexOf(p)<0&&opts.length<nc(l))opts.push(p);});
    return q(32,l,{prompt:mirror?'Qual è l’ombra allo SPECCHIO?':'Qual è l’ombra corretta?',sub:mirror?'Allo specchio l’ordine si inverte: l’ultimo pezzo diventa il primo.':'Stessi pezzi, stesso ordine.',visual:'<div class="bigVisual">'+items.join(' ')+'</div>',
      options:sh(opts).map(v=>({label:'<span class="optShadow">'+v+'</span>',value:v})),answer:answer,answerLabel:answer,hint:'Confronta un pezzo alla volta, da sinistra a destra.'},
      {pieces:len,mirror:mirror?1:0,rank:[len]});
  }

  /* ========== 40. Somme di Oggetti ========== */
  const TH=['🍪','🧁','⚽','🎈','🌟','🍬','🐟','🧸','🍓','🌼'];
  const T40=['Due gruppi (fino a 8)','Due gruppi più grandi (da 9 a 12)','Tre gruppi da sommare','Togliere: quanti restano?','Aggiungi e togli',
    'Cestini uguali (2 × …)','Tre cestini uguali','Cestini uguali + extra','Cestini, extra e togli','Zampe di un animale',
    'Zampe di due animali diversi','Zampe e ruote di tre gruppi','Regali e caramelle in tre passaggi','Dividi in parti uguali','Problema in tre passaggi con × e −'];
  NS.LEVEL_INFO[40]=T40;
  const grp=(ic,n)=>'<span class="objGroup">'+new Array(n+1).join(ic)+'</span>',op=s=>'<b class="objOp">'+s+'</b>';
  const basket=(ic,n,b)=>'<span class="objBasket">'+(b||'🧺')+grp(ic,n).replace('objGroup','objGroup in')+'</span>';
  function g40(l){
    const ic=pick(TH);let html='',ans,text,near=[];
    const LEGS=[['🐞',6,'zampe'],['🐕',4,'zampe'],['🐔',2,'zampe'],['🕷️',8,'zampe'],['🐙',8,'braccia']];
    switch(l){
      case 1:{const a=rnd(1,4),b=rnd(1,4);ans=a+b;html=grp(ic,a)+op('+')+grp(ic,b);text='Quanti '+ic+' in tutto?';near=[a,b];break;}
      case 2:{const a=rnd(5,7),b=rnd(4,5);ans=a+b;html=grp(ic,a)+op('+')+grp(ic,b);text='Quanti '+ic+' in tutto?';near=[ans-1,ans+1];break;}
      case 3:{const a=rnd(2,5),b=rnd(2,5),c=rnd(2,5);ans=a+b+c;html=grp(ic,a)+op('+')+grp(ic,b)+op('+')+grp(ic,c);text='Somma i tre gruppi.';near=[a+b,b+c];break;}
      case 4:{const a=rnd(7,11),b=rnd(2,5);ans=a-b;html=grp(ic,a)+op('−')+grp(ic,b);text='Ne togli '+b+'. Quanti restano?';near=[a+b,a];break;}
      case 5:{const a=rnd(6,10),b=rnd(3,6),c=rnd(2,5);ans=a+b-c;html=grp(ic,a)+op('+')+grp(ic,b)+op('−')+grp(ic,c);text='Aggiungi, poi togli.';near=[a+b+c,a+b,a-b+c];break;}
      case 6:{const e=rnd(3,5);ans=2*e;html=basket(ic,e)+op('+')+basket(ic,e);text='2 cestini con '+e+' '+ic+' ciascuno.';near=[e+2,ans+e];break;}
      case 7:{const e=rnd(3,5);ans=3*e;html=basket(ic,e)+op('+')+basket(ic,e)+op('+')+basket(ic,e);text='3 cestini uguali.';near=[2*e,4*e,e+3];break;}
      case 8:{const k=rnd(3,4),e=rnd(3,5),x=rnd(2,5);ans=k*e+x;for(let i=0;i<k;i++)html+=(i?op('+'):'')+basket(ic,e);html+=op('+')+grp(ic,x);text=k+' cestini da '+e+' e altri '+x+'.';near=[k*e,k+e+x,(k+1)*e];break;}
      case 9:{const k=rnd(3,4),e=rnd(4,6),x=rnd(2,5),y=rnd(3,6);ans=k*e+x-y;for(let i=0;i<k;i++)html+=(i?op('+'):'')+basket(ic,e);html+=op('+')+grp(ic,x)+op('−')+grp(ic,y);text=k+' cestini da '+e+', più '+x+', meno '+y+'.';near=[k*e+x,k*e-y,ans+2*y];break;}
      case 10:{const A=pick(LEGS),n=rnd(3,5);ans=n*A[1];html=grp(A[0],n);text='Ogni '+A[0]+' ha '+A[1]+' '+A[2]+'. Quante '+A[2]+' in tutto?';near=[n+A[1],ans-A[1]];break;}
      case 11:{const [A,B]=sh(LEGS.slice(0,4)).slice(0,2),na=rnd(2,4),nb=rnd(2,3);ans=na*A[1]+nb*B[1];html=grp(A[0],na)+op('+')+grp(B[0],nb);text='Ogni '+A[0]+' ha '+A[1]+' zampe, ogni '+B[0]+' ne ha '+B[1]+'. Quante zampe in tutto?';near=[(na+nb)*A[1],(na+nb)*B[1],na*B[1]+nb*A[1]];break;}
      case 12:{const P=[['🐕',4],['🐔',2],['🚲',2],['🚗',4],['🛺',3]],[A,B,C]=sh(P).slice(0,3),na=rnd(2,3),nb=rnd(2,3),nc2=rnd(1,3);ans=na*A[1]+nb*B[1]+nc2*C[1];html=grp(A[0],na)+op('+')+grp(B[0],nb)+op('+')+grp(C[0],nc2);text='Conta zampe e ruote: '+A[0]+'='+A[1]+', '+B[0]+'='+B[1]+', '+C[0]+'='+C[1]+'.';near=[na*A[1]+nb*B[1],ans+C[1],ans-B[1]];break;}
      case 13:{const bags=rnd(3,4),per=rnd(4,6),g=rnd(2,5),e=rnd(2,4);ans=bags*per-g-e;for(let i=0;i<bags;i++)html+=(i?op('+'):'')+basket(ic,per,'🎁');text=bags+' pacchi con '+per+' '+ic+'. Ne regali '+g+' e ne mangi '+e+'. Quanti restano?';near=[bags*per-g,bags*per-e,bags*per];break;}
      case 14:{const kids=rnd(2,4),each=rnd(3,5);ans=each;html=grp(ic,kids*each)+op('÷')+grp('🧒',kids);text=(kids*each)+' '+ic+' divisi in parti uguali tra '+kids+' bambini. Quanti a testa?';near=[kids,each+1,each-1,kids*each-kids];break;}
      default:{const a=rnd(3,4),pa=rnd(3,5),b=rnd(2,3),pb=rnd(2,4),e=rnd(3,6);ans=a*pa+b*pb-e;for(let i=0;i<a;i++)html+=(i?op('+'):'')+basket(ic,pa,'📦');html+=op('+');for(let i=0;i<b;i++)html+=(i?op('+'):'')+basket(ic,pb,'🛍️');html+=op('−')+grp(ic,e);text=a+' scatole da '+pa+' e '+b+' sacchetti da '+pb+'. Ne usi '+e+'. Quanti restano?';near=[a*pa+b*pb,ans+e+1,a*pa-e];}
    }
    const steps=[1,1,2,1,2,1,2,3,4,1,2,3,3,1,4][l-1],concept=[1,1,1,2,2,3,3,3,3,4,4,4,5,6,7][l-1];
    return q(40,l,{prompt:'Somme di oggetti',sub:text,visual:'<div class="objSum">'+html+'</div>',options:numOpts(ans,nc(l),near.filter(x=>x!==ans)),answer:String(ans),
      hint:concept<=2?'Conta ogni gruppo, scrivi i numeri e poi calcola.':concept===3?'Gruppi uguali: conta un gruppo e ripetilo tante volte.':concept===4?'Ogni animale porta le sue zampe: somma gruppo per gruppo.':concept===6?'Distribuisci uno a testa finché finiscono.':'Fai un passaggio alla volta: prima il totale, poi togli.'},
      {operations:steps,concept:concept,rank:[concept,steps,ans>99?99:ans]});
  }

  /* ========== 41. Equazioni con Figure ========== */
  const FR=['🍎','🍌','🍒','🍇','🍓','🍐','🍊','🍋','🥝','🍑'];
  const T41=[[1,'A+A',5],[1,'A+A+A',6],[2,'A,B',6],[2,'A,B',9],[3,'catena',6],[3,'catena',9],[3,'somma',8],[3,'meno',9],[3,'meno',12],[3,'per',5],[3,'per2',6],[3,'coppie',6],[3,'coppie',10],[4,'quattro',6],[4,'quattro×',5]];
  NS.LEVEL_INFO[41]=T41.map(([u,k,m])=>u+' '+(u>1?'frutti misteriosi':'frutto misterioso')+' · '+({'A+A':'una riga','A+A+A':'tre uguali','A,B':'due righe','catena':'tre righe a catena','somma':'trova la somma','meno':'con la sottrazione','per':'con la moltiplicazione','per2':'moltiplicazione da dedurre','coppie':'tre coppie intrecciate','quattro':'quattro righe','quattro×':'quattro righe con ×'})[k]+' · valori fino a '+m);
  function eqRow(parts,res){return '<div class="eqRow">'+parts.join(' ')+' <b>=</b> <span class="eqRes">'+res+'</span></div>';}
  function g41(l){
    const [u,k,m]=T41[l-1],F=sh(FR).slice(0,4),[A,B,C,D]=F,r=()=>rnd(1,m);let a=r(),b=r(),c=r(),d=r(),rows=[],ask,ans,near=[];
    switch(k){
      case 'A+A':rows=[eqRow([A,'+',A],2*a)];ask=A;ans=a;near=[2*a,a+1];break;
      case 'A+A+A':rows=[eqRow([A,'+',A,'+',A],3*a)];ask=A;ans=a;near=[3*a,a+3];break;
      case 'A,B':rows=[eqRow([A,'+',A],2*a),eqRow([A,'+',B],a+b)];ask=B;ans=b;near=[a+b,a];break;
      case 'catena':rows=[eqRow([A,'+',A,'+',A],3*a),eqRow([A,'+',B],a+b),eqRow([B,'+',C],b+c)];ask=C;ans=c;near=[b+c,b,a];break;
      case 'somma':rows=[eqRow([A,'+',A],2*a),eqRow([B,'+',B,'+',A],2*b+a),eqRow([C,'+',B],c+b)];ask=A+' + '+B+' + '+C;ans=a+b+c;near=[2*a+2*b+a,a+b,c+b+a+1];break;
      case 'meno':a=rnd(1,Math.floor(m/2));b=a+rnd(1,m-a);c=rnd(Math.ceil(b/2),Math.ceil(b/2)+m);rows=[eqRow([A,'+',A],2*a),eqRow([B,'−',A],b-a),eqRow([C,'+',C,'−',B],2*c-b)];ask=C+' + '+B;ans=c+b;near=[2*c-b,c,b-a+c];break;
      case 'per':a=rnd(2,m);b=rnd(2,m);rows=[eqRow([A,'+',A],2*a),eqRow([A,'×',B],a*b)];ask=B+' + '+A;ans=a+b;near=[a*b,a+b+1,2*a];break;
      case 'per2':a=rnd(2,5);b=rnd(2,5);c=rnd(1,m);rows=[eqRow([A,'+',A,'+',A],3*a),eqRow([A,'×',B],a*b),eqRow([B,'+',C],b+c)];ask=A+' × '+C;ans=a*c;near=[a+c,a*b,c*b];break;
      case 'coppie':rows=sh([eqRow([A,'+',B],a+b),eqRow([B,'+',C],b+c),eqRow([A,'+',C],a+c)]);ask=A;ans=a;near=[b,c,a+b-c,(a+b+c)];break;
      case 'quattro':rows=[eqRow([A,'+',B],a+b),eqRow([B,'+',C],b+c),eqRow([A,'+',C],a+c),eqRow([C,'+',D,'+',D],c+2*d)];ask=A+' + '+D;ans=a+d;near=[a+c,c+d,2*d+a];break;
      default:a=rnd(1,m);b=rnd(1,m);c=rnd(1,m);d=rnd(2,4);rows=[eqRow([A,'+',B],a+b),eqRow([B,'+',C],b+c),eqRow([A,'+',C],a+c),eqRow([D,'×',D],d*d)];ask=A+' × '+D;ans=a*d;near=[a+d,a*d+d,b*d];
    }
    return q(41,l,{prompt:'Quanto vale '+ask+'?',sub:'Ogni frutto vale sempre lo stesso numero.',visual:'<div class="eqBox">'+rows.join('')+'<div class="eqRow ask">'+ask+' <b>=</b> <span class="eqRes">?</span></div></div>',
      options:numOpts(ans,nc(l),near.filter(x=>x!==ans)),answer:String(ans),
      hint:k==='coppie'||k.indexOf('quattro')===0?'Somma le tre righe con le coppie: ottieni il DOPPIO di tutti e tre i frutti.':k.indexOf('per')===0?'× vuol dire “volte”: 3 × 4 = 4 + 4 + 4.':'Trova un frutto alla volta e usalo nella riga dopo.'},
      {equations:rows.length,unknowns:u,rank:[u,{'A+A':0,'A+A+A':1,'A,B':0,'catena':0,'somma':1,'meno':2,'per':3,'per2':4,'coppie':5,'quattro':0,'quattro×':1}[k],m]});
  }

  /* ========== 42. Piramide dei Numeri ========== */
  // [base, cosa chiedere (top/corner/center), mattoni centrali nascosti, valore massimo]
  const T42=[[2,'top',0,5],[2,'corner',0,6],[3,'top',0,5],[3,'top',2,6],[3,'corner',0,6],[3,'corner',2,7],[3,'center',2,7],[4,'top',0,6],[4,'top',2,7],[4,'top',5,7],[4,'corner',0,7],[4,'corner',3,8],[4,'center',3,8],[4,'center',5,9],[4,'center',5,12]];
  NS.LEVEL_INFO[42]=T42.map(([b,a,h,m])=>'Base di '+b+' · '+(a==='top'?'trova la cima':a==='corner'?'trova un numero della base (all’indietro)':'trova il numero CENTRALE della base')+(h?' · '+h+' mattoni nascosti':'')+' · numeri fino a '+m);
  function g42(l){
    const [base,ask,hideN,m]=T42[l-1],b=Array.from({length:base},()=>rnd(1,m)),rows=[b];
    while(rows[rows.length-1].length>1){const p=rows[rows.length-1];rows.push(p.slice(0,-1).map((v,i)=>v+p[i+1]));}
    const top=rows.length-1,askCell=ask==='top'?[top,0]:ask==='corner'?[0,rnd(0,1)?0:base-1]:[0,rnd(1,base-2)];
    const mids=[];for(let r=1;r<top;r++)for(let c=0;c<rows[r].length;c++)mids.push(r+','+c);
    const hidden={};sh(mids).slice(0,hideN).forEach(k2=>hidden[k2]=1);
    const ans=rows[askCell[0]][askCell[1]];
    let html='<div class="pyramid">';
    for(let r=top;r>=0;r--){html+='<div class="pyrRow">';for(let c=0;c<rows[r].length;c++){const isA=r===askCell[0]&&c===askCell[1],h=hidden[r+','+c];html+='<span class="pyrCell'+(isA?' ask':h?' blank':'')+'">'+(isA?'?':h?'':rows[r][c])+'</span>';}html+='</div>';}
    html+='</div>';
    const near=ask==='top'?[rows[top-1]?rows[top-1].reduce((x,y)=>x+y,0):ans+1,b.reduce((x,y)=>x+y,0)]:[ans+1,ans*2,rows[1]?rows[1][Math.min(askCell[1],rows[1].length-1)]:ans+2];
    return q(42,l,{prompt:ask==='top'?'Quale numero va in cima?':'Quale numero manca nella base?',sub:'Ogni mattone è la somma dei due mattoni sotto di lui.',visual:html,
      options:numOpts(ans,nc(l),near.filter(x=>x!==ans)),answer:String(ans),
      hint:ask==='top'?'Riempi una fila alla volta partendo dal basso.':'Lavora all’indietro: il numero che cerchi = mattone sopra − il suo vicino.'},
      {baseSize:base,hiddenBlocks:hideN,rank:[base,{top:0,corner:1,center:2}[ask],hideN,m]});
  }

  /* ========== 5. Sudoku Junior: griglie diverse ogni volta + buchi crescenti ========== */
  const H5=[3,4,5,6,8,9,10,11,12,13,14,15,16,17,18];
  NS.LEVEL_INFO[5]=H5.map((h,i)=>'Griglia '+(i<4?'4×4':'6×6')+' · '+h+' caselle vuote');
  function g5(l){
    const n=l<=4?4:6,bw=n===4?2:3,bh=2,target=H5[l-1];
    for(let attempt=0;attempt<30;attempt++){
      const perm=sh(Array.from({length:n},(_,i)=>i+1));
      // permuta righe dentro le fasce e colonne dentro i riquadri: griglia sempre diversa
      const rowOrder=[],colOrder=[];
      sh(Array.from({length:n/bh},(_,i)=>i)).forEach(band=>sh(Array.from({length:bh},(_,i)=>band*bh+i)).forEach(r=>rowOrder.push(r)));
      sh(Array.from({length:n/bw},(_,i)=>i)).forEach(st=>sh(Array.from({length:bw},(_,i)=>st*bw+i)).forEach(c=>colOrder.push(c)));
      const g=rowOrder.map(r=>colOrder.map(c=>perm[((r*bw+Math.floor(r/bh)+c)%n)]));
      const mask=g.map(row=>row.map(()=>false));
      const count=()=>{const bd=g.map((row,r)=>row.map((v,c)=>mask[r][c]?0:v));let cnt=0;
        (function rec(){if(cnt>=2)return;let best=null,av=null;
          for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!bd[r][c]){const ps=[];for(let v=1;v<=n;v++){if(bd[r].indexOf(v)>=0)continue;if(bd.some(row=>row[c]===v))continue;let box=false;for(let y=Math.floor(r/bh)*bh;y<Math.floor(r/bh)*bh+bh;y++)for(let x=Math.floor(c/bw)*bw;x<Math.floor(c/bw)*bw+bw;x++)if(bd[y][x]===v)box=true;if(!box)ps.push(v);}
            if(!ps.length)return;if(!best||ps.length<av.length){best=[r,c];av=ps;}}
          if(!best){cnt++;return;}for(const v of av){bd[best[0]][best[1]]=v;rec();bd[best[0]][best[1]]=0;if(cnt>=2)return;}})();return cnt;};
      let hid=0;for(const [r,c] of sh(Array.from({length:n*n},(_,i)=>[Math.floor(i/n),i%n]))){if(hid>=target)break;mask[r][c]=true;if(count()===1)hid++;else mask[r][c]=false;}
      if(hid<target)continue;
      const empty=[];mask.forEach((row,r)=>row.forEach((v,c)=>{if(v)empty.push([r,c]);}));
      const [tr,tc]=pick(empty),ans=g[tr][tc];
      let vis='<div class="sudokuPlay" style="grid-template-columns:repeat('+n+',1fr);width:100%;max-width:'+(n*55)+'px">';
      for(let r=0;r<n;r++)for(let c=0;c<n;c++)vis+='<div class="sudokuTile '+(r===tr&&c===tc?'sudokuTarget':'')+((c+1)%bw===0&&c<n-1?' sdR':'')+((r+1)%bh===0&&r<n-1?' sdB':'')+'" style="font-size:'+(n===6?19:26)+'px;width:'+(100/n)+'%;min-height:'+(n===6?42:52)+'px">'+(r===tr&&c===tc?'?':mask[r][c]?'&nbsp;':g[r][c])+'</div>';
      vis+='</div>';
      return q(5,l,{prompt:'Quale numero va nella casella dorata?',sub:'Griglia '+n+'×'+n+' · '+hid+' caselle vuote. Ogni numero una sola volta per riga, colonna e riquadro.',visual:vis,
        options:sh(Array.from({length:n},(_,i)=>String(i+1))),answer:String(ans),hint:'Guarda insieme riga, colonna e riquadro della casella dorata.'},
        {size:n,holes:hid,uniqueSolutions:1,rank:[n,hid]});
    }
    throw new Error('Sudoku v9.2: generazione fallita');
  }

  /* ========== 9. Matrici: nessuna modifica alla logica v8.3 (già 15 passi), solo info livello ========== */
  NS.LEVEL_INFO[9]=Array.from({length:15},(_,i)=>{const l=i+1,n=l<=4?3:l<=8?4:l<=12?5:6;return 'Matrice '+n+'×'+n+' · '+l+' '+(l>1?'caselle coperte':'casella coperta')+' · regola '+(l<=4?'semplice':l<=8?'diagonale':l<=12?'doppia':'intrecciata');});

  NS.MathGames[1]=g1;NS.MathGames[7]=g7;NS.MathGames[5]=g5;NS.MathGames[31]=g31;NS.MathGames[40]=g40;NS.MathGames[41]=g41;NS.MathGames[42]=g42;
  NS.VisualGames[8]=g8;NS.VisualGames[11]=g11;NS.VisualGames[14]=g14;NS.VisualGames[32]=g32;NS.VisualGames[33]=g33;
  NS.V92={g1,g5,g7,g8,g11,g14,g31,g32,g33,g40,g41,g42,tok,T8,T7};
})(window.LogicLand);
