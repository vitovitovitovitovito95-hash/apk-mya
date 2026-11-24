'use strict';
/* v9.3 — Altri giochi di allenamento mentale (tipi di esercizio classici della psicologia cognitiva,
   realizzati da zero con grafica e nomi originali):
   74 Sequenza Luminosa  — memoria di sequenze (in ordine, poi al contrario)
   75 Frecce in Fila     — attenzione: la freccia centrale, poi regola che cambia col colore
   76 Gira e Trova       — rotazione mentale di figure fatte di quadretti (domande)
   77 Mai Visto          — memoria di lavoro: tocca ogni volta un oggetto NUOVO
   78 Più o Meno?        — confronto veloce di quantità e operazioni
   Ogni gioco ha una tabella di 15 livelli; il test controlla che ogni riga sia più difficile della precedente. */
(function(NS){
  const rnd=(a,b)=>NS.rnd(a,b), pick=a=>NS.pick(a), sh=a=>NS.shuffle(a);
  const CH=[3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
  let live=null;
  function stop(){if(live){live.dead=true;(live.timers||[]).forEach(t=>clearTimeout(t));live=null;}}
  const prevStop=NS.stopPuzzle;NS.stopPuzzle=function(){stop();if(prevStop)prevStop();};
  function begin(opts){stop();const el=document.getElementById(opts.mountId);if(!el)return null;live={dead:false,timers:[]};return {el:el,s:live};}
  function later(s,fn,ms){const t=setTimeout(()=>{if(!s.dead)fn();},ms);s.timers.push(t);return t;}
  function head(title,desc){return '<div class="brainHead"><strong>'+title+'</strong><p>'+desc+'</p></div>';}
  function timerBar(bar,ms){bar.style.transition='none';bar.style.width='100%';void bar.offsetWidth;bar.style.transition='width '+ms+'ms linear';bar.style.width='0%';}

  /* ===== 74. Sequenza Luminosa ===== */
  // [griglia, lunghezza sequenza, ms per casella, turni, al contrario?]
  const T74=[[3,2,900,3,0],[3,3,850,3,0],[3,4,800,3,0],[4,4,750,3,0],[4,5,750,4,0],[4,6,700,4,0],[5,6,650,4,0],[5,7,600,4,0],
             [4,3,800,4,1],[4,4,750,4,1],[4,5,700,4,1],[5,5,650,4,1],[5,6,600,4,1],[5,6,520,5,1],[5,7,500,5,1]];
  NS.LEVEL_INFO[74]=T74.map(([g,n,ms,r,rev])=>n+' caselle in fila · griglia '+g+'×'+g+' · '+(rev?'tocca AL CONTRARIO (dall’ultima)':'tocca nello stesso ordine')+' · '+(ms/1000).toFixed(2).replace(/0$/,'')+' s · '+r+' turni');
  function seqlight(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[g,n,ms,R,rev]=T74[opts.level-1];let round=0,seq=[],pos=0,canTap=false;
    function draw(){
      const W=Math.min(Math.max(220,(el.clientWidth||360)-24),g*64,420),cs=Math.floor(W/g);
      let h=head('💡 Sequenza Luminosa',(rev?'Guarda l’ordine, poi tocca le caselle <b>AL CONTRARIO</b>: dall’ultima alla prima.':'Guarda l’ordine in cui si accendono, poi toccale <b>nello stesso ordine</b>.')+' Turno '+(round+1)+' di '+R+'.')+'<div class="bgGrid sqGrid" style="width:'+(cs*g)+'px">';
      for(let i=0;i<g*g;i++)h+='<button class="bgCell" data-i="'+i+'" style="width:'+cs+'px;height:'+cs+'px"></button>';
      el.innerHTML=h+'</div><div class="sqDots" id="sqDots"></div><div class="puzzleHint" id="sqMsg">Guarda bene…</div>';
      const cells=el.querySelectorAll('.bgCell');for(let i=0;i<cells.length;i++)cells[i].onclick=function(){tap(Number(this.getAttribute('data-i')),this);};
    }
    function dots(){const d=document.getElementById('sqDots');if(d)d.innerHTML=seq.map((_,i)=>'<i class="'+(i<pos?'on':'')+'"></i>').join('');}
    function play(){
      seq=[];let last=-1;while(seq.length<n){const c=rnd(0,g*g-1);if(c!==last&&seq.indexOf(c)<0){seq.push(c);last=c;}}
      pos=0;canTap=false;draw();dots();const cells=el.querySelectorAll('.bgCell');
      seq.forEach((c,k)=>{later(s,()=>{cells[c].className='bgCell on';if(NS.fx)NS.fx.play('tap');},k*(ms+180)+400);later(s,()=>{cells[c].className='bgCell';},k*(ms+180)+400+ms);});
      later(s,()=>{canTap=true;const m=document.getElementById('sqMsg');if(m)m.innerHTML=rev?'Ora tocca <b>dall’ultima alla prima</b>!':'Ora tocca <b>nello stesso ordine</b>!';},n*(ms+180)+450);
    }
    function tap(i,btn){
      if(!canTap)return;const want=rev?seq[n-1-pos]:seq[pos];
      if(i===want){btn.className='bgCell ok';btn.innerHTML='<b class="sqN">'+(pos+1)+'</b>';pos++;dots();
        if(pos===n){canTap=false;round++;opts.onProgress(round/R,'Turni completati: '+round+'/'+R);if(round>=R)later(s,()=>{stop();opts.onSuccess();},500);else later(s,play,800);}}
      else{canTap=false;btn.className='bgCell bad';const cells=el.querySelectorAll('.bgCell');
        seq.forEach((c,k)=>{if(cells[c].className.indexOf('ok')<0){cells[c].className='bgCell miss';cells[c].innerHTML='<b class="sqN">'+(rev?n-k:k+1)+'</b>';}});
        const m=document.getElementById('sqMsg');if(m)m.textContent='Ecco l’ordine giusto (numeri).';
        if(opts.onMistake('Ordine sbagliato!')===false){stop();return;}later(s,play,1800);}
    }
    opts.onProgress(0,'Turni completati: 0/'+R);play();
  }

  /* ===== 75. Frecce in Fila ===== */
  // [frecce, direzioni (2/4), quota frecce “contro”, regola (c=centrale, sw=cambia col colore, swX=cambia + forma a croce), prove, ms]
  const T75=[[1,2,0,'c',8,4000],[3,2,.3,'c',10,3600],[5,2,.5,'c',10,3200],[5,2,.7,'c',12,3000],[5,4,.5,'c',12,3000],[7,4,.6,'c',12,2800],
             [5,2,.5,'sw',12,3400],[5,4,.5,'sw',12,3200],[7,4,.6,'sw',14,3000],[7,4,.7,'sw',14,2800],
             [5,4,.6,'swX',14,3200],[9,4,.6,'swX',14,3000],[9,4,.7,'swX',16,2600],[9,4,.8,'swX',16,2300],[9,4,.8,'swX',18,2000]];
  const RULE75={c:'segui la freccia CENTRALE',sw:'BLU = centrale · ARANCIONE = le altre',swX:'come prima, ma le frecce sono a croce'};
  NS.LEVEL_INFO[75]=T75.map(([k,d,inc,r,n,ms])=>k+' '+(k>1?'frecce':'freccia')+' · '+d+' direzioni · '+RULE75[r]+(inc?' · '+Math.round(inc*100)+'% ingannevoli':'')+' · '+n+' prove · '+(ms/1000).toFixed(1)+' s');
  const DIR_ICON=['➡','⬇','⬅','⬆'];
  function arrows(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[k,dirs,inc,mode,N,ms]=T75[opts.level-1];let t=0,cur=null,answered=true,wait=null;
    const usable=dirs===2?[0,2]:[0,1,2,3],btnOrder=dirs===2?[2,0]:[2,3,1,0];
    el.innerHTML=head('➡️ Frecce in Fila',mode==='c'?'Tocca la direzione della freccia <b>CENTRALE</b>. Non farti ingannare dalle altre!':'Frecce <b class="arBlueTxt">BLU</b>: segui la freccia centrale. Frecce <b class="arOrTxt">ARANCIONI</b>: segui le ALTRE frecce.')+
      '<div class="arStage" id="arStage"></div><div class="nbTimer"><i id="arBar"></i></div><div class="arBtns">'+btnOrder.map(d=>'<button class="arBtn" data-d="'+d+'">'+DIR_ICON[d]+'</button>').join('')+'</div><div class="puzzleHint" id="arMsg"></div>';
    const stage=el.querySelector('#arStage'),bar=el.querySelector('#arBar'),msg=el.querySelector('#arMsg'),bs=el.querySelectorAll('.arBtn');
    for(let x=0;x<bs.length;x++)bs[x].onclick=function(){pickD(Number(this.getAttribute('data-d')));};
    const arrow=(d,col,center)=>'<span class="ar '+col+(center?' mid':'')+'" style="-webkit-transform:rotate('+(d*90)+'deg);transform:rotate('+(d*90)+'deg)">➜</span>';
    function trial(){
      if(t>=N){stop();opts.onSuccess();return;}
      const c=pick(usable),contra=Math.random()<inc&&k>1;let f=c;if(contra)while(f===c)f=pick(usable);
      const col=mode==='c'?'blue':(Math.random()<.5?'blue':'orange'),right=col==='blue'||k===1?c:f;cur={right:right};answered=false;
      let h='';
      if(mode==='swX'){const cross=k===5?[[0,1],[1,0],[1,2],[2,1]]:[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]];h='<div class="arCross">';for(let r=0;r<3;r++){h+='<div class="arRow">';for(let q=0;q<3;q++){const isC=r===1&&q===1,isF=cross.some(p=>p[0]===r&&p[1]===q);h+=isC?arrow(c,col,true):isF?arrow(f,col):'<span class="ar empty"></span>';}h+='</div>';}h+='</div>';}
      else{h='<div class="arRow">';for(let x=0;x<k;x++)h+=x===(k-1)/2?arrow(c,col,true):arrow(f,col);h+='</div>';}
      stage.innerHTML=h;stage.className='arStage pop';msg.textContent='';timerBar(bar,ms);
      wait=later(s,()=>{if(!answered){answered=true;msg.textContent='Tempo scaduto!';if(opts.onMistake('Troppo lento!')===false){stop();return;}t++;opts.onProgress(t/N,'Prove: '+t+'/'+N);later(s,trial,600);}},ms);
    }
    function pickD(d){
      if(answered||!live||live!==s)return;answered=true;clearTimeout(wait);const ok=d===cur.right;stage.className='arStage '+(ok?'good':'badc');
      if(!ok){msg.textContent='Era '+DIR_ICON[cur.right]+(mode==='c'||k===1?' (freccia centrale)':' — guarda il colore delle frecce!');if(opts.onMistake('Direzione sbagliata.')===false){stop();return;}}
      t++;opts.onProgress(t/N,'Prove: '+t+'/'+N);later(s,trial,ok?280:1100);
    }
    opts.onProgress(0,'Prove: 0/'+N);later(s,trial,500);
  }

  /* ===== 76. Gira e Trova (domande) ===== */
  // [quadretti, rotazioni (180 / 90 / qualsiasi), trappole (0 figure diverse, 1 figure allo specchio, 2 specchio + un quadretto spostato), quadretti colorati]
  const T76=[[4,0,0,1],[4,1,0,1],[4,2,0,1],[5,2,0,1],[4,2,1,1],[5,2,1,1],[6,2,1,1],[5,2,2,1],[6,2,2,1],[5,2,1,2],[6,2,1,2],[7,2,1,2],[7,2,2,2],[8,2,2,2],[8,2,2,3]];
  const TRAP76=['figure diverse','attenzione: figure allo SPECCHIO','specchio e figure quasi uguali'];
  NS.LEVEL_INFO[76]=T76.map(([n,r,tr,c],i)=>'Figura di '+n+' quadretti · '+(r===0?'girata a testa in giù':r===1?'girata di un quarto':'girata in qualsiasi modo')+' · '+TRAP76[tr]+(c>1?' · '+c+' colori da seguire':'')+' · '+CH[i]+' risposte');
  const COL76=['#4b7bff','#ff4d6d','#ffb400'];
  const norm=cells=>{const mx=Math.min.apply(null,cells.map(c=>c[0])),my=Math.min.apply(null,cells.map(c=>c[1]));return cells.map(c=>[c[0]-mx,c[1]-my,c[2]]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);};
  const keyOf=cells=>norm(cells).map(c=>c.join(',')).join(';');
  const rot=cells=>norm(cells.map(c=>[-c[1],c[0],c[2]])); // 90° in senso orario (y verso il basso)
  const mirror=cells=>norm(cells.map(c=>[-c[0],c[1],c[2]]));
  const rots=cells=>{const out=[norm(cells)];for(let i=0;i<3;i++)out.push(rot(out[out.length-1]));return out;};
  function polyomino(n){
    const cells=[[0,0]],has=(x,y)=>cells.some(c=>c[0]===x&&c[1]===y);
    while(cells.length<n){const c=pick(cells),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),x=c[0]+d[0],y=c[1]+d[1];if(!has(x,y))cells.push([x,y]);}
    return cells;
  }
  function paint(cells,colors){const out=cells.map(c=>[c[0],c[1],0]);const idx=sh(out.map((_,i)=>i));for(let k=1;k<colors;k++)out[idx[k-1]][2]=k;return norm(out);}
  function connected(cells){const seen={},st=[cells[0]];seen[cells[0][0]+','+cells[0][1]]=1;while(st.length){const c=st.pop();[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{const k=(c[0]+d[0])+','+(c[1]+d[1]);if(!seen[k]&&cells.some(z=>z[0]+','+z[1]===k)){seen[k]=1;st.push([c[0]+d[0],c[1]+d[1]]);}});}return Object.keys(seen).length===cells.length;}
  function moved(cells){
    for(let guard=0;guard<200;guard++){const out=cells.map(c=>c.slice()),i=rnd(0,out.length-1),c=pick(out.filter((_,j)=>j!==i)),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),x=c[0]+d[0],y=c[1]+d[1];
      if(out.some(z=>z[0]===x&&z[1]===y))continue;out[i]=[x,y,out[i][2]];if(connected(out))return norm(out);}
    return null;
  }
  function shapeHtml(cells,size){
    const w=Math.max.apply(null,cells.map(c=>c[0]))+1,h=Math.max.apply(null,cells.map(c=>c[1]))+1;let out='<span class="rtShape" style="width:'+(w*size)+'px;height:'+(h*size)+'px">';
    cells.forEach(c=>{out+='<i style="left:'+(c[0]*size)+'px;top:'+(c[1]*size)+'px;width:'+(size-2)+'px;height:'+(size-2)+'px;background:'+COL76[c[2]]+'"></i>';});
    return out+'</span>';
  }
  function rotate76(l){
    const [n,rmode,trap,colors]=T76[l-1];
    for(let attempt=0;attempt<400;attempt++){
      const base=paint(polyomino(n),colors),R=rots(base),rk=R.map(keyOf);
      const mir=rots(mirror(base)),chiral=mir.every(m=>rk.indexOf(keyOf(m))<0);
      if(trap>=1&&!chiral)continue;
      const turn=rmode===0?2:rmode===1?pick([1,3]):pick([1,2,3]),answer=R[turn];
      if(rk[turn]===rk[0])continue; // la rotazione deve cambiare davvero l'aspetto
      const pool=[],seen={};rk.forEach(k=>seen[k]=1);
      const add=c=>{if(!c)return;const all=rots(c).map(keyOf);if(all.some(k=>seen[k]))return;const pickR=pick(rots(c));seen[keyOf(pickR)]=1;all.forEach(k=>seen[k]=1);pool.push(pickR);};
      if(trap>=1)add(mirror(base));
      for(let g=0;g<60&&pool.length<CH[l-1]-1;g++){
        const recolor=()=>norm(base.map((c,i)=>[c[0],c[1],base[(i+1)%base.length][2]]));
        if(trap===0)add(paint(polyomino(n),colors));
        else if(trap===1){if(colors>1)add(recolor());add(paint(polyomino(n),colors));}
        else{add(moved(base));add(moved(mirror(base)));if(colors>1)add(recolor());}
      }
      if(pool.length<CH[l-1]-1)continue;
      const opts=sh([answer].concat(pool.slice(0,CH[l-1]-1)));
      const o=NS.attachDifficulty({prompt:'Quale è la STESSA figura, solo girata?',sub:(trap>=1?'Attenzione: una figura allo specchio NON è la stessa! ':'')+(colors>1?'Anche i quadretti colorati devono girare insieme.':''),
        visual:'<div class="rtMain">'+shapeHtml(base,30)+'<b class="rtTurn">↻</b></div>',
        options:opts.map(c=>({label:shapeHtml(c,18),value:keyOf(c)})),answer:keyOf(answer),answerLabel:shapeHtml(answer,16),
        hint:'Scegli un quadretto speciale (un angolo o un colore) e segui dove va quando giri la figura.'},76,l);
      o.meta.age6=true;o.meta.age6Load=NS.AGE6_DIFFICULTY[l-1].load;o.meta.v92=true;o.meta.rotBase=keyOf(base);
      o.meta.age6Metrics={cells:n,trap:trap,colors:colors,rank:[colors,trap,n,rmode]};
      return o;
    }
    throw new Error('Gira e Trova: generazione fallita al livello '+l);
  }

  /* ===== 77. Mai Visto ===== */
  const SET77={easy:['🍎','🚗','⭐','🐟','🎈','⚽','🌙','🎸','📘','🍦','🌸','🔔'],animals:['🐶','🐱','🐭','🐹','🐰','🐻','🐼','🐨','🐯','🦁','🐮','🐷'],fruit:['🍎','🍏','🍐','🍊','🍋','🍑','🍒','🍓','🍇','🍉','🍌','🍍']};
  const T77=[[3,'easy',6000,2],[4,'easy',6000,2],[5,'easy',5500,2],[5,'animals',5000,2],[6,'easy',5000,2],[6,'animals',4500,2],[7,'easy',4500,2],[7,'animals',4000,2],
             [8,'easy',4000,2],[8,'fruit',3800,2],[9,'animals',3600,2],[9,'fruit',3400,2],[10,'animals',3200,2],[10,'fruit',3000,2],[12,'fruit',2800,2]];
  NS.LEVEL_INFO[77]=T77.map(([n,set,ms,r])=>n+' oggetti '+(set==='easy'?'diversi':'simili')+' che cambiano posto · '+(ms/1000).toFixed(1)+' s per tocco · '+r+' giri');
  function newone(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[n,set,ms,R]=T77[opts.level-1],items=sh(SET77[set]).slice(0,n);let round=0,used={},wait=null,busy=false,lastOrder='';
    el.innerHTML=head('🆕 Mai Visto','Tocca ogni volta un oggetto che <b>NON hai ancora toccato</b>. Dopo ogni tocco gli oggetti si mescolano!')+'<div class="mvBoard" id="mvBoard"></div><div class="nbTimer"><i id="mvBar"></i></div><div class="puzzleHint" id="mvMsg"></div>';
    const board=el.querySelector('#mvBoard'),bar=el.querySelector('#mvBar'),msg=el.querySelector('#mvMsg');
    function count(){return Object.keys(used).length;}
    function turn(){
      busy=false;let order=sh(items.slice());for(let k=0;k<8&&order.join('')===lastOrder;k++)order=sh(items.slice());lastOrder=order.join('');board.className='mvBoard shuffle';void board.offsetWidth;board.className='mvBoard';
      board.innerHTML=order.map(x=>'<button class="mvItem" data-x="'+x+'">'+x+'</button>').join('');
      const bs=board.querySelectorAll('.mvItem');for(let k=0;k<bs.length;k++)bs[k].onclick=function(){tap(this.getAttribute('data-x'),this);};
      opts.onProgress((round*n+count())/(R*n),'Giro '+(round+1)+'/'+R+' · toccati '+count()+'/'+n);
      timerBar(bar,ms);clearTimeout(wait);wait=later(s,()=>{if(busy)return;busy=true;msg.textContent='Tempo scaduto!';if(opts.onMistake('Troppo lento!')===false){stop();return;}later(s,turn,700);},ms);
    }
    function tap(x,btn){
      if(busy||!live||live!==s)return;busy=true;clearTimeout(wait);
      if(used[x]){btn.className='mvItem bad';msg.textContent='Questo l’avevi già toccato! Si ricomincia il giro.';used={};if(opts.onMistake('Già toccato!')===false){stop();return;}later(s,turn,1300);return;}
      used[x]=1;btn.className='mvItem ok';msg.textContent='';if(NS.fx)NS.fx.play('tap');
      if(count()===n){round++;used={};opts.onProgress(round/R,'Giri completati: '+round+'/'+R);if(round>=R){later(s,()=>{stop();opts.onSuccess();},500);return;}msg.textContent='Bravo! Nuovo giro: si ricomincia da zero.';later(s,turn,1100);return;}
      later(s,turn,380);
    }
    turn();
  }

  /* ===== 78. Più o Meno? ===== */
  // [tipo, numero massimo, quanto sono vicini (rapporto minimo per i puntini), prove, ms]
  const T78=[['dots',6,2,8,5000],['dots',9,1.6,10,4500],['dots',12,1.4,10,4000],['dotsSize',12,1.5,10,4000],['dotsSize',15,1.3,12,3600],
             ['expr1',10,0,12,4500],['expr1',20,0,12,4000],['expr2',10,0,12,4500],['expr2',20,0,12,4000],['expr2',20,0,14,3400],
             ['mix',15,1.3,14,4000],['mix',20,1.2,14,3600],['expr3',20,0,14,4000],['expr3',30,0,16,3600],['expr3',30,0,16,3000]];
  const TYPE78={dots:'puntini',dotsSize:'puntini grandi e piccoli (non farti ingannare!)',expr1:'operazione contro numero',expr2:'operazione contro operazione',mix:'puntini contro operazione',expr3:'con le moltiplicazioni'};
  NS.LEVEL_INFO[78]=T78.map(([t,m,r,n,ms])=>'Tocca il lato con PIÙ: '+TYPE78[t]+' · fino a '+m+' · '+n+' prove · '+(ms/1000).toFixed(1)+' s');
  function expr(v,kind,max){ // restituisce un testo che vale v
    if(kind===0)return String(v);
    if(kind===2&&v>=4){const ds=[2,3,4,5].filter(d=>v%d===0&&v/d>=2&&v/d<=10);if(ds.length){const d=pick(ds);return d+' × '+(v/d);}}
    if(Math.random()<.5&&v>=2){const a=rnd(1,v-1);return a+' + '+(v-a);}
    const b=rnd(1,Math.max(1,Math.min(9,max-v)));return (v+b)+' − '+b;
  }
  // Puntini sparsi senza sovrapposizioni; il numero disegnato è SEMPRE quello richiesto (se non c'è posto, puntini più piccoli).
  function dotsHtml(nDots,sized){
    let r0=sized?(sized>0?11:5):8,pts=[];
    for(let tries=0;tries<8;tries++){
      pts=[];let guard=0;
      while(pts.length<nDots&&guard++<3000){const r=Math.max(3,r0+rnd(-1,1)),x=rnd(r+2,148-r),y=rnd(r+2,118-r);if(pts.every(p=>(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y)>(p[2]+r+3)*(p[2]+r+3)))pts.push([x,y,r]);}
      if(pts.length===nDots)break;r0=Math.max(3,r0-1);
    }
    return '<span class="cmpDots" data-n="'+pts.length+'">'+pts.map(p=>'<i style="left:'+(p[0]-p[2])+'px;top:'+(p[1]-p[2])+'px;width:'+(2*p[2])+'px;height:'+(2*p[2])+'px"></i>').join('')+'</span>';
  }
  function compare(opts){
    const b=begin(opts);if(!b)return;const {el,s}=b,[type,max,ratio,N,ms]=T78[opts.level-1];let t=0,answered=true,wait=null,cur=null;
    el.innerHTML=head('⚖️ Più o Meno?','Tocca il lato che vale <b>DI PIÙ</b>. Veloce!')+'<div class="cmpRow"><button class="cmpSide" id="cmpL"></button><b class="cmpVs">?</b><button class="cmpSide" id="cmpR"></button></div><div class="nbTimer"><i id="cmpBar"></i></div><div class="puzzleHint" id="cmpMsg"></div>';
    const L=el.querySelector('#cmpL'),Rb=el.querySelector('#cmpR'),bar=el.querySelector('#cmpBar'),msg=el.querySelector('#cmpMsg');
    L.onclick=()=>pickS(0);Rb.onclick=()=>pickS(1);
    function values(){
      if(type==='dots'||type==='dotsSize'||type==='mix'){let a,c;do{a=rnd(2,max);c=rnd(2,max);}while(a===c||Math.max(a,c)/Math.min(a,c)>ratio*1.6||Math.max(a,c)/Math.min(a,c)<ratio);return [a,c];}
      let a,c;do{a=rnd(3,max);c=rnd(3,max);}while(a===c||Math.abs(a-c)>Math.max(2,Math.round(max/5)));return [a,c];
    }
    function trial(){
      if(t>=N){stop();opts.onSuccess();return;}
      const [a,c]=values();cur={more:a>c?0:1};answered=false;
      const side=(v,i)=>{
        if(type==='dots')return dotsHtml(v,0);
        if(type==='dotsSize')return dotsHtml(v,(v>(i?a:c))?-1:1); // chi ha PIÙ puntini li ha più PICCOLI: trappola
        if(type==='mix')return i===0?dotsHtml(v,0):'<span class="cmpTxt">'+expr(v,1,max)+'</span>';
        return '<span class="cmpTxt">'+expr(v,type==='expr1'?(i===0?0:1):type==='expr2'?1:(Math.random()<.6?2:1),max)+'</span>';
      };
      const flip=type==='expr1'&&Math.random()<.5;
      L.innerHTML=side(a,flip?1:0);Rb.innerHTML=side(c,flip?0:1);L.className=Rb.className='cmpSide pop';msg.textContent='';timerBar(bar,ms);
      wait=later(s,()=>{if(!answered){answered=true;msg.textContent='Tempo scaduto!';if(opts.onMistake('Troppo lento!')===false){stop();return;}t++;opts.onProgress(t/N,'Prove: '+t+'/'+N);later(s,trial,600);}},ms);
    }
    function pickS(i){
      if(answered||!live||live!==s)return;answered=true;clearTimeout(wait);const ok=i===cur.more;(i?Rb:L).className='cmpSide '+(ok?'good':'badc');
      if(!ok){(cur.more?Rb:L).className='cmpSide good';msg.textContent='Valeva di più l’altro lato.';if(opts.onMistake('Era l’altro!')===false){stop();return;}}
      t++;opts.onProgress(t/N,'Prove: '+t+'/'+N);later(s,trial,ok?300:1200);
    }
    opts.onProgress(0,'Prove: 0/'+N);later(s,trial,400);
  }

  NS.PuzzleGames=NS.PuzzleGames||{};
  NS.PuzzleGames.seqlight=seqlight;NS.PuzzleGames.arrows=arrows;NS.PuzzleGames.newone=newone;NS.PuzzleGames.compare=compare;
  NS.VisualGames[76]=rotate76;
  NS.V93Brain={T74:T74,T75:T75,T76:T76,T77:T77,T78:T78,expr:expr,rots:rots,mirror:mirror,keyOf:keyOf,rotate76:rotate76,dotsHtml:dotsHtml};
})(window.LogicLand);
