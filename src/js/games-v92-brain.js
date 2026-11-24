'use strict';
/* v9.2 — Allenamento mentale (genere “brain training”, giochi originali per bambini):
   70 Griglia Lampo (memoria visuo-spaziale), 71 Uguale o Diverso (memoria di lavoro N-indietro),
   72 Colori Furbi (attenzione e flessibilità: colore dell'inchiostro o parola scritta),
   73 Calcolo Lampo (calcolo mentale a catena). Ogni livello ha parametri propri in tabella. */
(function(NS){
  const rnd=(a,b)=>NS.rnd(a,b), pick=a=>NS.pick(a), sh=a=>NS.shuffle(a);
  let live=null;
  function stop(){if(live){live.dead=true;(live.timers||[]).forEach(t=>clearTimeout(t));live=null;}}
  const prevStop=NS.stopPuzzle;NS.stopPuzzle=function(){stop();if(prevStop)prevStop();};
  function begin(opts){stop();const el=document.getElementById(opts.mountId);if(!el)return null;live={dead:false,timers:[]};return {el:el,s:live};}
  function later(s,fn,ms){const t=setTimeout(()=>{if(!s.dead)fn();},ms);s.timers.push(t);return t;}
  function head(title,desc){return '<div class="brainHead"><strong>'+title+'</strong><p>'+desc+'</p></div>';}

  /* ===== 70. Griglia Lampo ===== */
  const T70=[[3,3,1600,3],[3,4,1500,3],[4,4,1500,3],[4,5,1400,3],[4,6,1300,4],[5,6,1300,4],[5,7,1200,4],[5,8,1100,4],[5,9,1000,4],[6,9,1000,5],[6,10,950,5],[6,11,900,5],[6,12,850,5],[7,12,800,5],[7,14,750,5]];
  NS.LEVEL_INFO[70]=T70.map(([g,n,ms,r])=>'Griglia '+g+'×'+g+' · '+n+' caselle accese · '+(ms/1000).toFixed(2).replace(/0$/,'')+' s · '+r+' turni');
  function grid(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[g,n,ms,R]=T70[opts.level-1];let round=0,lit={},found=0,canTap=false;
    function draw(){
      let h=head('🟨 Griglia Lampo','Guarda le caselle che si accendono, poi toccale tutte. Turno '+(round+1)+' di '+R+'.')+'<div class="bgGrid" style="width:'+Math.min(340,g*52)+'px">';
      for(let i=0;i<g*g;i++)h+='<button class="bgCell" data-i="'+i+'" style="width:'+(100/g)+'%;height:'+Math.min(340,g*52)/g+'px"></button>';
      el.innerHTML=h+'</div><div class="puzzleHint" id="bgMsg">Guarda bene…</div>';
      const cells=el.querySelectorAll('.bgCell');
      for(let i=0;i<cells.length;i++)cells[i].onclick=function(){tap(Number(this.getAttribute('data-i')),this);};
    }
    function newPattern(){
      lit={};found=0;canTap=false;draw();const cells=el.querySelectorAll('.bgCell');
      sh(Array.from({length:g*g},(_,i)=>i)).slice(0,n).forEach(i=>{lit[i]=1;cells[i].className='bgCell on';});
      later(s,()=>{for(let i=0;i<cells.length;i++)cells[i].className='bgCell';canTap=true;const m=document.getElementById('bgMsg');if(m)m.textContent='Tocca le '+n+' caselle!';},ms);
    }
    function tap(i,btn){
      if(!canTap||btn.className.indexOf('ok')>=0)return;
      if(lit[i]){btn.className='bgCell ok';found++;if(found===n){canTap=false;round++;opts.onProgress(round/R,'Turni completati: '+round+'/'+R);if(round>=R)later(s,()=>{stop();opts.onSuccess();},450);else later(s,newPattern,700);}}
      else{btn.className='bgCell bad';canTap=false;const cells=el.querySelectorAll('.bgCell');Object.keys(lit).forEach(k=>{if(cells[k].className.indexOf('ok')<0)cells[k].className='bgCell miss';});
        if(opts.onMistake('Casella sbagliata!')===false){stop();return;}later(s,newPattern,1300);}
    }
    opts.onProgress(0,'Turni completati: 0/'+R);newPattern();
  }

  /* ===== 71. Uguale o Diverso (N indietro) ===== */
  const SETS={easy:['🍎','🚗','⭐','🐟','🎈','⚽'],animals:['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'],dots:['🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫'],fruit:['🍎','🍏','🍐','🍊','🍋','🍑','🍒','🍓']};
  const T71=[[1,'easy',3,8,4000],[1,'easy',4,10,3600],[1,'animals',4,10,3300],[1,'easy',5,12,3000],[1,'animals',6,12,2700],[1,'dots',6,14,2400],[1,'fruit',7,14,2200],
             [2,'easy',3,10,4000],[2,'easy',4,12,3600],[2,'animals',5,12,3200],[2,'dots',6,14,2900],[2,'fruit',6,14,2600],[2,'animals',7,16,2400],[2,'fruit',8,16,2200],[3,'easy',5,14,3200]];
  NS.LEVEL_INFO[71]=T71.map(([nb,set,k,c,ms])=>'Confronta con '+(nb===1?'la carta PRECEDENTE':nb===2?'la carta di 2 passi fa':'la carta di 3 passi fa')+' · '+k+' simboli '+(set==='easy'?'diversi':'simili')+' · '+c+' carte · '+(ms/1000).toFixed(1)+' s');
  function nback(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[nb,set,k,count,ms]=T71[opts.level-1],sym=sh(SETS[set]).slice(0,k);
    const cards=[];for(let i=0;i<count;i++){if(i>=nb&&Math.random()<0.4)cards.push(cards[i-nb]);else{let c=pick(sym);if(i>=nb&&c===cards[i-nb]&&Math.random()<0.6)c=pick(sym);cards.push(c);}}
    let i=0,wait=null,answered=false;const target=count-nb;let done=0;
    const what=nb===1?'quella di prima':nb===2?'quella di 2 carte fa':'quella di 3 carte fa';
    el.innerHTML=head('🔁 Uguale o Diverso','La carta è UGUALE a '+what+'?')+'<div class="nbTrail" id="nbTrail"></div><div class="nbCard" id="nbCard"></div><div class="nbTimer"><i id="nbBar"></i></div><div class="nbBtns"><button class="nbBtn yes" id="nbYes">✅ UGUALE</button><button class="nbBtn no" id="nbNo">❌ DIVERSO</button></div><div class="puzzleHint" id="nbMsg"></div>';
    const card=el.querySelector('#nbCard'),bar=el.querySelector('#nbBar'),msg=el.querySelector('#nbMsg');
    el.querySelector('#nbYes').onclick=()=>answer(true);el.querySelector('#nbNo').onclick=()=>answer(false);
    function show(){
      if(i>=count){stop();opts.onSuccess();return;}
      answered=false;card.className='nbCard';void card.offsetWidth;card.className='nbCard flip';card.textContent=cards[i];
      const trail=el.querySelector('#nbTrail');trail.innerHTML=Array.from({length:Math.min(i,nb)},()=>'<span>🂠</span>').join('');
      if(i<nb){msg.textContent='Memorizza questa carta…';bar.style.width='0%';later(s,()=>{i++;show();},1500);return;}
      msg.textContent='';bar.style.transition='none';bar.style.width='100%';void bar.offsetWidth;bar.style.transition='width '+ms+'ms linear';bar.style.width='0%';
      wait=later(s,()=>{if(!answered){answered=true;if(opts.onMistake('Troppo lento!')===false){stop();return;}next();}},ms);
    }
    function next(){done++;opts.onProgress(done/target,'Carte: '+done+'/'+target);later(s,()=>{i++;show();},350);}
    function answer(same){
      if(answered||i<nb||!live||live!==s)return;answered=true;clearTimeout(wait);
      const ok=(cards[i]===cards[i-nb])===same;card.className='nbCard '+(ok?'good':'badc');
      if(!ok){msg.textContent='Era '+(cards[i]===cards[i-nb]?'UGUALE':'DIVERSO')+': '+what+' era '+cards[i-nb];if(opts.onMistake('Risposta sbagliata.')===false){stop();return;}}
      next();
    }
    opts.onProgress(0,'Carte: 0/'+target);show();
  }

  /* ===== 72. Colori Furbi ===== */
  const COL=[['ROSSO','#ff3b4f'],['BLU','#2f80ff'],['VERDE','#1fb26b'],['GIALLO','#f2b100'],['VIOLA','#9b5cff'],['ARANCIONE','#ff7a1a']];
  // [colori, regola, prove, ms, quota parole “uguali”]
  const T72=[[3,'word',8,5000,.5],[3,'ink',8,5000,.5],[3,'ink',10,4500,.3],[4,'ink',10,4000,.2],[4,'ink',12,3500,0],[4,'sw4',12,4000,0],[5,'sw3',12,3800,0],[5,'rand',12,3800,0],
             [5,'rand',14,3400,0],[6,'rand',14,3200,0],[6,'rand',16,3000,0],[6,'rand',16,2700,0],[6,'randShuf',16,2700,0],[6,'randTrick',18,2500,0],[6,'randTrick',18,2200,0]];
  const RULE_TXT={ink:'sempre il COLORE',word:'sempre la PAROLA',sw4:'la regola cambia ogni 4',sw3:'la regola cambia ogni 3',rand:'regola a sorpresa',randShuf:'regola a sorpresa + pulsanti che si mescolano',randTrick:'regola a sorpresa + pulsanti ingannevoli'};
  NS.LEVEL_INFO[72]=T72.map(([k,r,n,ms])=>k+' colori · '+RULE_TXT[r]+' · '+n+' prove · '+(ms/1000).toFixed(1)+' s');
  function stroop(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[k,mode,n,ms,cong]=T72[opts.level-1],cols=COL.slice(0,k);
    let t=0,rule='ink',wait=null,answered=false,order=cols.map((_,i)=>i);
    el.innerHTML=head('🎨 Colori Furbi','Segui la regola in alto: 🎨 COLORE dell’inchiostro oppure 📖 PAROLA scritta.')+'<div class="stRule" id="stRule"></div><div class="stWord" id="stWord"></div><div class="nbTimer"><i id="stBar"></i></div><div class="stBtns" id="stBtns"></div><div class="puzzleHint" id="stMsg"></div>';
    const ruleEl=el.querySelector('#stRule'),word=el.querySelector('#stWord'),bar=el.querySelector('#stBar'),btns=el.querySelector('#stBtns'),msg=el.querySelector('#stMsg');
    let cur=null;
    function buttons(){
      if(mode==='randShuf'||mode==='randTrick')order=sh(order);
      btns.innerHTML=order.map(i=>{const trick=mode==='randTrick'?cols[(i+1+rnd(0,k-2))%k][1]:'#fff';return '<button class="stBtn'+(mode==='randTrick'?' trick':'')+'" data-c="'+i+'" style="background:'+cols[i][1]+';color:'+trick+'">'+cols[i][0]+'</button>';}).join('');
      const bs=btns.querySelectorAll('.stBtn');for(let x=0;x<bs.length;x++)bs[x].onclick=function(){pickC(Number(this.getAttribute('data-c')));};
    }
    function trial(){
      if(t>=n){stop();opts.onSuccess();return;}
      if(mode==='ink'||mode==='word')rule=mode;else if(mode==='sw4')rule=Math.floor(t/4)%2?'word':'ink';else if(mode==='sw3')rule=Math.floor(t/3)%2?'word':'ink';else rule=Math.random()<.5?'ink':'word';
      const w=rnd(0,k-1);let c=w;if(Math.random()>=cong){while(c===w)c=rnd(0,k-1);}
      cur={w:w,c:c};answered=false;
      ruleEl.className='stRule '+rule;ruleEl.innerHTML=rule==='ink'?'🎨 Tocca il <b>COLORE</b> dell’inchiostro':'📖 Tocca la <b>PAROLA</b> scritta';
      word.className='stWord';void word.offsetWidth;word.className='stWord pop';word.textContent=cols[w][0];word.style.color=cols[c][1];
      buttons();msg.textContent='';
      bar.style.transition='none';bar.style.width='100%';void bar.offsetWidth;bar.style.transition='width '+ms+'ms linear';bar.style.width='0%';
      wait=later(s,()=>{if(!answered){answered=true;if(opts.onMistake('Troppo lento!')===false){stop();return;}t++;opts.onProgress(t/n,'Prove: '+t+'/'+n);later(s,trial,400);}},ms);
    }
    function pickC(i){
      if(answered||!live||live!==s)return;answered=true;clearTimeout(wait);
      const right=rule==='ink'?cur.c:cur.w,ok=i===right;
      if(!ok){msg.textContent='La risposta era '+cols[right][0]+(rule==='ink'?' (colore dell’inchiostro)':' (parola scritta)');if(opts.onMistake('Attenzione alla regola!')===false){stop();return;}}
      else word.className='stWord good';
      t++;opts.onProgress(t/n,'Prove: '+t+'/'+n);later(s,trial,ok?300:1100);
    }
    opts.onProgress(0,'Prove: 0/'+n);trial();
  }

  /* ===== 73. Calcolo Lampo (domande con sequenza che scompare) ===== */
  // [operazioni, ms per operazione, operando massimo, tipi]
  const T73=[[1,2000,3,'+'],[2,1800,3,'+'],[2,1700,4,'+-'],[3,1600,4,'+-'],[3,1500,5,'+-'],[4,1500,5,'+-'],[4,1300,6,'+-'],[4,1200,9,'+-'],[5,1200,6,'+-'],[5,1100,9,'+-x'],[5,1000,9,'+-x'],[6,1000,9,'+-x'],[6,900,9,'+-xX'],[7,900,9,'+-xX'],[7,800,9,'+-xX']];
  NS.LEVEL_INFO[73]=T73.map(([n,ms,m,t])=>n+' '+(n>1?'operazioni':'operazione')+' a catena · '+(ms/1000).toFixed(1)+' s ciascuna · numeri fino a '+m+(t.indexOf('X')>=0?' · ×2 e ×3':t.indexOf('x')>=0?' · anche ×2':''));
  function calc(l){
    const [n,ms,m,types]=T73[l-1];let v=rnd(2,6);const start=v,ops=[];
    for(let i=0;i<n;i++){
      const kinds=types.split('');let k=pick(kinds);
      if((k==='x'||k==='X')&&(v>15||ops.some(o=>o[0]==='×')))k='+';
      if(k==='-'&&v<=2)k='+';
      if(k==='+'){const a=rnd(1,m);v+=a;ops.push(['+',a]);}
      else if(k==='-'){const a=rnd(1,Math.min(m,v-1));v-=a;ops.push(['−',a]);}
      else{const a=k==='X'?pick([2,3]):2;v*=a;ops.push(['×',a]);}
    }
    const id='calc_'+Math.random().toString(36).slice(2),total=n*ms+400;
    const near=[v+1,v-1,ops.length?(ops[ops.length-1][0]==='+'?v-ops[ops.length-1][1]:ops[ops.length-1][0]==='−'?v+ops[ops.length-1][1]:v/ops[ops.length-1][1]):v+2,v+2];
    const vals=[v];near.concat([v+3,v-2,v+5,v-3]).forEach(x=>{x=Math.round(x);if(x>=0&&vals.indexOf(x)<0&&vals.length<[3,3,3,4,4,4,4,5,5,5,5,6,6,6,6][l-1])vals.push(x);});
    const o=NS.attachDifficulty({prompt:'Calcola a mente!',sub:'Parti da '+start+' e segui le operazioni che compaiono.',
      visual:'<div class="calcBox"><div class="calcStart">'+start+'</div><div class="calcOp" id="'+id+'">▶</div><div class="calcDots">'+ops.map(()=>'<i></i>').join('')+'</div></div>',
      options:sh(vals).map(String),answer:String(v),hint:'Tieni il risultato a mente dopo ogni operazione, dillo sottovoce.',
      afterRender:function(){
        const el=document.getElementById(id),opt=document.querySelector('.options');if(!el)return;if(opt){opt.style.visibility='hidden';opt.style.pointerEvents='none';}
        let i=0;const dots=el.parentNode.querySelectorAll('.calcDots i');
        (function step(){if(!document.getElementById(id))return;if(i>=ops.length){el.textContent='= ?';el.className='calcOp end';const h=document.querySelector('.question h3');if(h)h.textContent='Qual è il risultato?';if(opt){opt.style.visibility='visible';opt.style.pointerEvents='auto';}return;}
          el.className='calcOp';void el.offsetWidth;el.className='calcOp pop';el.textContent=ops[i][0]+' '+ops[i][1];if(dots[i])dots[i].className='on';i++;setTimeout(step,ms);})();
      }},73,l);
    o.meta.age6=true;o.meta.age6Load=NS.AGE6_DIFFICULTY[l-1].load;o.meta.v92=true;o.meta.age6Metrics={operations:n,exposureMs:total,rank:[n,3000-ms,m]};o.meta.calcStart=start;o.meta.calcOps=ops;
    return o;
  }

  NS.PuzzleGames=NS.PuzzleGames||{};
  NS.PuzzleGames.flashgrid=grid;NS.PuzzleGames.nback=nback;NS.PuzzleGames.stroop=stroop;
  NS.MathGames[73]=calc;
  NS.V92Brain={T70:T70,T71:T71,T72:T72,T73:T73,calc:calc};
  // Descrizioni livello per i giochi arcade e puzzle (schermata "Livello N").
  try{
    const L15=Array.from({length:15},(_,i)=>i+1),pct=x=>Math.round(x*100)+'%';
    if(NS.arcadeProfile){
      NS.LEVEL_INFO[51]=L15.map(l=>{const t=NS.arcadeProfile(l).tetris;return t.targetLines+' righe da completare · caduta ogni '+(t.fallMs/1000).toFixed(2)+' s · '+t.pieceTypes+' tipi di pezzi'+(t.garbageRows?' · '+t.garbageRows+' '+(t.garbageRows>1?'righe':'riga')+' già piene':'');});
      NS.LEVEL_INFO[52]=L15.map(l=>{const d=NS.arcadeProfile(l).dodge;return d.targetObstacles+' ostacoli da schivare · velocità '+d.speed.toFixed(1)+' · passaggio di '+Math.round(d.gapPx)+' px';});
    }
    const C=NS.PuzzleV82Data;
    if(C&&C.unblock)NS.LEVEL_INFO[53]=C.unblock.map(x=>x.pieces.length+' blocchi di legno · soluzione minima in '+x.moves+' '+(x.moves>1?'mosse':'mossa'));
    if(C&&C.flow)NS.LEVEL_INFO[54]=C.flow.map((x,i)=>'Griglia '+x.n+'×'+x.n+' · '+x.pairs+' colori da collegare · percorso '+(i+1)+'/15');
    if(NS.newGameProfile){
      NS.LEVEL_INFO[55]=L15.map(l=>{const w=NS.newGameProfile(l,'water');return w.colors+' colori · provette da '+w.capacity+' · '+w.mixes+' rimescolamenti';});
      NS.LEVEL_INFO[56]=L15.map(l=>{const k=NS.newGameProfile(l,'checkers');return 'Avversario forte al '+pct(k.botSkill)+' · '+(k.aiDepth?'calcola '+k.aiDepth+' '+(k.aiDepth===1?'mossa':'mosse')+' avanti':'gioca d’istinto')+' · '+k.captures+' '+(k.captures>1?'catture':'cattura')+' da trovare';});
      NS.LEVEL_INFO[57]=L15.map(l=>{const k=NS.newGameProfile(l,'chess');return 'Avversario forte al '+pct(k.botSkill)+' · '+k.steps+' '+(k.steps>1?'passi':'passo')+' per missione · '+k.blockers+' pezzi che bloccano';});
    }
  }catch(_e){}
})(window.LogicLand);
