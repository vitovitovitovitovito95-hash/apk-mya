'use strict';
/* v9.0 — Livelli più ricchi e più impegnativi.
   Sostituisce sei generatori della v8.3 mantenendo gli stessi contratti
   (metriche crescenti, risposte calcolate dai dati, opzioni senza duplicati).
   Novità principali:
   - Numero Mancante: 5 tipi di regola (passo fisso, termine nascosto, aumenti
     alternati, differenze crescenti, sequenze intrecciate).
   - Chi è l'intruso? / Coppie Gemelle: dal livello 5 i distrattori differiscono
     per UNA sola caratteristica (colore, forma o direzione) → serve attenzione vera.
   - Conta e Scegli / Blocchi Logici: oggetti mescolati in griglia sparsa, si
     conta solo il tipo richiesto e poi si eseguono le operazioni.
   - Domino dei Colori: dal livello 8 manca una tessera interna.
   - Memoria Visiva: dal livello 6 griglia su due righe, dal livello 10
     anche la domanda inversa “quale oggetto NON c’era?”. */
(function(NS){
  var COLORS=['🔴','🔵','🟢','🟡','🟣','🟠'];
  var SHAPES=['●','▲','■','◆','★','⬟'];
  var DIRS=['↑','→','↓','←'];
  var OBJECTS=['🍎','🐶','🚗','🦋','⭐','⚽','🍓','🐠','🌙','🌸','🐱','🚀','🍦','🎈','🧸','🍀','☀️','📘','🍋','🎲'];
  function rnd(a,b){return NS.rnd(a,b);}
  function pick(a){return NS.pick(a);}
  function sh(a){return NS.shuffle(a);}
  function nChoices(l){return Math.min(6,2+Math.floor((l-1)/3));}
  function choices(answer,pool,count){
    var values=[String(answer)],used={};used[String(answer)]=1;
    sh(pool.map(String)).forEach(function(s){if(!used[s]&&values.length<count){used[s]=1;values.push(s);}});
    var delta=1;
    while(values.length<count){
      var n=Number(answer),str;
      if(isFinite(n)){var d=delta%2?Math.ceil(delta/2):-delta/2;str=String(n+d);}else str='◇'+delta;
      if(!used[str]){used[str]=1;values.push(str);}
      delta++;
    }
    return sh(values);
  }
  function q(id,lv,question,metric){
    var obj=NS.attachDifficulty(question,id,lv);
    obj.meta.age6=true;
    obj.meta.age6Load=NS.AGE6_DIFFICULTY[lv-1].load;
    obj.meta.age6Metrics=metric;
    obj.meta.v83=true;
    obj.meta.v9=true;
    return obj;
  }
  // Token = combinazione di 1, 2 o 3 caratteristiche a seconda del livello.
  function featureCount(l){return l<=4?1:l<=9?2:3;}
  function makeToken(t,f){return COLORS[t[0]]+(f>=2?SHAPES[t[1]]:'')+(f>=3?DIRS[t[2]]:'');}
  function randomTuple(){return [rnd(0,5),rnd(0,5),rnd(0,3)];}
  function sameTuple(a,b,f){for(var i=0;i<f;i++)if(a[i]!==b[i])return false;return true;}
  // Variante che cambia esattamente UNA caratteristica.
  function nearVariant(t,f){
    var feat=rnd(0,f-1),size=feat===2?4:6,v=t.slice(),x=t[feat];
    while(x===t[feat])x=rnd(0,size-1);
    v[feat]=x;return v;
  }
  function emojiOpts(list){return list.map(function(v){return {label:'<span class="optEmoji">'+v+'</span>',value:v};});}
  function strip(arr,numbered){
    return '<div class="pieceStrip v9Strip">'+arr.map(function(v,i){return '<span>'+(numbered?'<small>'+(i+1)+'</small>':'')+v+'</span>';}).join('')+'</div>';
  }

  /* ---------- 1. Numero Mancante ---------- */
  function number(l){
    var n=3+l,seq=[],answer,rule,kind,hideAt=-1,a=rnd(1,6);
    if(l<=3){ // passo fisso crescente
      var step=l+rnd(0,1);for(var i=0;i<n;i++)seq.push(a+i*step);
      answer=a+n*step;rule='Aggiungi sempre '+step+'.';kind='step';
    }else if(l<=6){ // passo fisso, ma il numero mancante è DENTRO la sequenza
      var st=l-1+rnd(0,2),down=l>=6&&rnd(0,1)===1;
      var start=down?a+st*n+rnd(5,15):a;
      for(var j=0;j<=n;j++)seq.push(down?start-j*st:start+j*st);
      hideAt=rnd(1,n-1);answer=seq[hideAt];
      rule=down?'Ogni volta togli '+st+'.':'Ogni volta aggiungi '+st+'.';kind='hidden';
    }else if(l<=9){ // due aumenti che si alternano
      var first=l-5,second=first+rnd(1,3),now=a;seq=[now];
      for(var k=1;k<n;k++){now+=k%2?first:second;seq.push(now);}
      answer=now+(n%2?first:second);rule='Alterna +'+first+' e +'+second+'.';kind='alternate';
    }else if(l<=12){ // differenze che crescono: +1, +2, +3...
      var d0=l===11?2:1,inc=1,cur=a,diff=d0;seq=[cur];
      for(var m=1;m<n;m++){cur+=diff;seq.push(cur);diff+=inc;}
      answer=cur+diff;rule='Il salto cresce ogni volta di '+inc+' (+'+d0+', +'+(d0+inc)+', +'+(d0+2*inc)+'…).';kind='growing';
      if(l===12){hideAt=rnd(Math.floor(n/2),n-1);seq.push(answer);answer=seq[hideAt];kind='growing-hidden';}
    }else{ // due sequenze intrecciate: una sale, una scende
      var up=l-10,dn=l-11,x=a,y=dn*Math.ceil(n/2)+rnd(10,20);
      for(var p=0;p<n;p++)seq.push(p%2?y-Math.floor(p/2)*dn:x+Math.floor(p/2)*up);
      answer=n%2?y-Math.floor(n/2)*dn:x+Math.floor(n/2)*up;
      rule='Due sequenze intrecciate: le posizioni dispari salgono di '+up+', le pari scendono di '+dn+'.';kind='interleaved';
      if(l===15){hideAt=rnd(2,n-2);seq.push(answer);answer=seq[hideAt];kind='interleaved-hidden';}
    }
    var shown=seq.map(function(v,i){return i===hideAt?'<b class="seqHole">?</b>':String(v);});
    var text=shown.join(' · ')+(hideAt<0?' · <b class="seqHole">?</b>':'');
    var pool=[answer-1,answer+1,answer-2,answer+2,answer+3,answer-3,answer+5,answer-5,answer+10].filter(function(v){return v>=0;});
    return q(1,l,{prompt:hideAt<0?'Qual è il numero che viene dopo?':'Quale numero manca nella sequenza?',
      visual:'<div class="bigVisual seqVisual">'+text+'</div>',options:choices(answer,pool,nChoices(l)),answer:String(answer),hint:rule},
      {terms:n,ruleCount:l<=6?1:2,ruleKind:kind,hiddenInternal:hideAt>=0?1:0});
  }

  /* ---------- 7. Chi è l'intruso? ---------- */
  function odd(l){
    var f=featureCount(l),length=3+l,base=randomTuple(),wrong;
    // L1-4 differenza evidente; dal L5 una sola caratteristica cambia.
    if(l<5){wrong=randomTuple();while(sameTuple(wrong,base,f))wrong=randomTuple();}
    else wrong=nearVariant(base,f);
    var idx=rnd(0,length-1),arr=[];
    for(var i=0;i<length;i++)arr.push(makeToken(i===idx?wrong:base,f));
    var nums=[];for(var k=0;k<length;k++)if(k!==idx)nums.push(String(k));
    var c=Math.min(length,nChoices(l));
    var options=sh([String(idx)].concat(sh(nums).slice(0,c-1))).map(function(v){return {label:'Posizione '+(Number(v)+1),value:v};});
    return q(7,l,{prompt:'Quale pezzo è diverso dagli altri?',sub:l>=5?'Attenzione: cambia un solo dettaglio!':'',visual:strip(arr,true),options:options,answer:String(idx),
      hint:f===1?'Guarda i colori.':f===2?'Controlla colore e forma.':'Controlla colore, forma e direzione della freccia.'},
      {visibleItems:length,featureCount:f,differingFeatures:l<5?f:1,choices:c});
  }

  /* ---------- 33. Coppie Gemelle ---------- */
  function twins(l){
    var f=featureCount(l),len=3+l,twin=randomTuple(),others=[],seen={},tries=0;
    seen[makeToken(twin,f)]=1;
    var nearShare=l<5?0:l<10?0.5:0.75; // quota di “quasi gemelli”
    while(others.length<len-2&&tries<5000){
      tries++;
      var t=Math.random()<nearShare?nearVariant(twin,f):randomTuple(),tok=makeToken(t,f);
      if(seen[tok])continue;seen[tok]=1;others.push(tok);
    }
    var list=sh(others),tw=makeToken(twin,f);
    var i=rnd(0,list.length);list.splice(i,0,tw);
    var j=rnd(0,list.length);while(j===i)j=rnd(0,list.length);list.splice(j,0,tw);
    var pos=[];list.forEach(function(t,k){if(t===tw)pos.push(k+1);});
    var answer=pos.join('-'),pool=[];
    for(var a=1;a<=len;a++)for(var b=a+1;b<=len;b++)pool.push(a+'-'+b);
    // Distrattori: coppie che contengono uno dei due gemelli (più insidiose).
    var tricky=pool.filter(function(p){var s=p.split('-');return p!==answer&&(Number(s[0])===pos[0]||Number(s[1])===pos[1]||Number(s[0])===pos[1]||Number(s[1])===pos[0]);});
    var opts=choices(answer,l>=6?tricky.concat(pool):pool,nChoices(l));
    return q(33,l,{prompt:'Dove sono le due figure identiche?',sub:l>=5?'Molte figure si somigliano: devono coincidere tutti i dettagli.':'',visual:strip(list,true),
      options:opts.map(function(v){return {label:'Pezzi '+v.replace('-',' e '),value:v};}),answer:answer,hint:'Confronta i dettagli uno alla volta.'},
      {items:len,features:f,nearDuplicates:Math.round((len-2)*nearShare),options:opts.length});
  }

  /* ---------- 31 / 11. Conta e Scegli, Blocchi Logici ---------- */
  function counting(id,l){
    var target=id===11?'🟥':'🍎';
    var distractTypes=id===11?['🟦','🟩','🟨','🟪','🟧']:['🍐','🍊','🍋','🍓','🍇'];
    var count=3+l,kinds=l<=2?0:l<=6?1:l<=10?2:3,dist=kinds?Math.min(10,Math.floor(count*0.6)+kinds):0;
    var types=sh(distractTypes).slice(0,kinds),items=[];
    for(var i=0;i<count;i++)items.push(target);
    for(var k=0;k<dist;k++)items.push(types[k%Math.max(1,kinds)]);
    items=sh(items);
    var text=kinds?'Conta solo '+target+'.':'Conta tutti gli oggetti.',number=count,steps=1,add=0,sub=0,extra=0;
    if(l>=5){add=1+Math.floor((l-5)/2);number+=add;steps++;text+=' Poi aggiungi '+add+'.';}
    if(l>=9){sub=1+Math.floor((l-9)/2);number-=sub;steps++;text+=' Poi togli '+sub+'.';}
    if(l>=13){extra=l-12;number+=extra;steps++;text+=' Infine aggiungi '+extra+'.';}
    var cols=items.length>12?6:items.length>8?5:4;
    var visual='<div class="countGrid" style="max-width:'+(cols*48)+'px">'+items.map(function(o,n){return '<span style="-webkit-animation-delay:'+(n*35)+'ms;animation-delay:'+(n*35)+'ms">'+o+'</span>';}).join('')+'</div>';
    return q(id,l,{prompt:id===11?'Quanti blocchi rossi rimangono?':'Quante mele ci sono alla fine?',sub:text,visual:visual,
      options:choices(number,[number-1,number+1,number-2,number+2,number-3,number+3,count+dist],nChoices(l)),answer:String(number),
      hint:kinds?'Tocca con lo sguardo solo '+target+', uno alla volta. Poi fai le operazioni in ordine.':'Conta prima quelli presenti, poi esegui le operazioni nell’ordine.'},
      {countedItems:count,distractors:dist,distractorKinds:kinds,steps:steps,added:add,removed:sub});
  }

  /* ---------- 35. Domino dei Colori ---------- */
  function domino(l){
    var period=2+Math.floor((l-1)/3),pal=sh(COLORS).slice(0,Math.min(6,period)),count=4+l,series=[];
    // L13+: il ciclo contiene un colore ripetuto (es. A A B C) → più difficile da riconoscere.
    if(l>=13)pal=[pal[0]].concat(pal.slice(0,period-1));
    for(var i=0;i<count;i++)series.push(pal[i%pal.length]);
    var hideAt=-1,answer;
    if(l>=8){hideAt=rnd(Math.max(pal.length,2),count-1);answer=series[hideAt];}
    else answer=pal[count%pal.length];
    var shown=series.map(function(c,i){return i===hideAt?'<b class="seqHole">?</b>':c;}).join(' ')+(hideAt<0?' <b class="seqHole">?</b>':'');
    return q(35,l,{prompt:hideAt<0?'Quale colore continua la sequenza?':'Quale tessera manca nella sequenza?',visual:'<div class="bigVisual">'+shown+'</div>',
      options:emojiOpts(choices(answer,COLORS,nChoices(l))),answer:answer,hint:l>=13?'Attenzione: nel ciclo un colore compare due volte di seguito.':'Trova il ciclo di colori e ripetilo.'},
      {tiles:count,cycleLength:pal.length,hiddenInternal:hideAt>=0?1:0});
  }

  /* ---------- 14. Memoria Visiva ---------- */
  function memory(l){
    var count=2+l,images=sh(OBJECTS).slice(0,count),exposure=Math.max(1700,4800-l*210),position=rnd(0,count-1);
    var inverse=l>=10&&rnd(0,1)===1,answer,options,ask;
    if(inverse){
      var missingPool=OBJECTS.filter(function(o){return images.indexOf(o)<0;});
      answer=pick(missingPool);
      options=sh([answer].concat(sh(images).slice(0,nChoices(l)-1)));
      ask='Quale oggetto NON c’era?';
    }else{
      answer=images[position];
      options=choices(answer,images.concat(OBJECTS),nChoices(l));
      ask='Quale oggetto era alla posizione '+(position+1)+'?';
    }
    var id='memory9_'+Math.random().toString(36).slice(2),grid=l>=6;
    var cells=images.map(function(o,i){return '<span><small>'+(i+1)+'</small>'+o+'</span>';}).join('');
    var question={prompt:'Memorizza gli oggetti!',sub:inverse?'Guarda bene tutti gli oggetti.':'Ricorda quale oggetto è nella posizione '+(position+1)+'.',
      visual:'<div class="memoryBoard'+(grid?' grid':'')+'" id="'+id+'">'+cells+'</div><div class="memoryTimer" id="'+id+'_t"><i style="-webkit-animation-duration:'+exposure+'ms;animation-duration:'+exposure+'ms"></i></div>',
      options:emojiOpts(options),answer:answer,hint:inverse?'Ripassa mentalmente gli oggetti uno per uno.':'Concentrati su una posizione alla volta.',
      afterRender:function(){
        var el=document.getElementById(id),opt=document.querySelector('.options');if(!el)return;
        if(opt){opt.style.visibility='hidden';opt.style.pointerEvents='none';}
        setTimeout(function(){
          if(!document.getElementById(id))return;
          var spans=el.querySelectorAll('span');
          for(var s=0;s<spans.length;s++){spans[s].className='hidden';spans[s].innerHTML='<small>'+(s+1)+'</small>❓';}
          var t=document.getElementById(id+'_t');if(t)t.style.visibility='hidden';
          var heading=document.querySelector('.question h3');if(heading)heading.textContent=ask;
          if(opt){opt.style.visibility='visible';opt.style.pointerEvents='auto';}
        },exposure);
      }};
    return q(14,l,question,{memoryItems:count,exposureMs:exposure,possiblePositions:count,inverse:inverse?1:0});
  }

  NS.MathGames[1]=number;
  NS.MathGames[7]=odd;
  NS.MathGames[31]=function(l){return counting(31,l);};
  NS.VisualGames[11]=function(l){return counting(11,l);};
  NS.VisualGames[14]=memory;
  NS.VisualGames[33]=twins;
  NS.VisualGames[35]=domino;
  NS.V9Levels={number:number,odd:odd,twins:twins,counting:counting,domino:domino,memory:memory};
})(window.LogicLand);
