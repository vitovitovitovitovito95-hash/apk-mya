'use strict';
/* v8.3: ONLY learning-level content. UI, input, audio, hearts and saves are unchanged.
   Every function below uses an observable content variable that grows at L1..L15.
   All question answers are computed from the generated data, never guessed. */
(function(NS){
  var nmax=15;
  function rnd(a,b){return NS.rnd(a,b);}
  function pick(a){return NS.pick(a);}
  function sh(a){return NS.shuffle(a);}
  function choices(answer,pool,count){
    var values=[String(answer)], used={};used[String(answer)]=1;
    sh(pool.map(String)).forEach(function(s){if(!used[s]){used[s]=1;values.push(s);}});
    var delta=1;
    while(values.length<count){var n=Number(answer);if(isFinite(n)){var d=delta%2?Math.ceil(delta/2):-delta/2;var str=String(n+d);if(!used[str]){used[str]=1;values.push(str);}}else{
      var s='◇'+delta;if(!used[s]){used[s]=1;values.push(s);}
    }delta++;}
    return sh(values.slice(0,count));
  }
  function q(id,lv,question,metric){
    var obj=NS.attachDifficulty(question,id,lv);
    obj.meta.age6=true;
    obj.meta.age6Load=NS.AGE6_DIFFICULTY[lv-1].load;
    obj.meta.age6Metrics=metric;
    obj.meta.v83=true;
    return obj;
  }
  function opts(id,l,answer,pool){return choices(answer,pool,Math.min(6,2+Math.floor((l-1)/3)));}
  var colored=['🔴','🔵','🟢','🟡','🟣','🟠'];
  var shapes=['●','▲','■','◆','★','⬟'];
  var dirs=['↑','→','↓','←'];
  var objects=['🍎','🐶','🚗','🦋','⭐','⚽','🍓','🐠','🌙','🌸','🐱','🚀','🍦','🎈','🧸','🍀','☀️','📘','🍋','🎲'];
  var outline={'●':'○','▲':'△','■':'□','◆':'◇','★':'☆','⬟':'⬡'};
  function tokens(l){
    var feature=l<=4?1:l<=9?2:3;
    var palette=[];
    for(var a=0;a<6;a++)for(var b=0;b<(feature>=2?6:1);b++)for(var c=0;c<(feature>=3?4:1);c++){
      palette.push(colored[a]+(feature>=2?shapes[b]:'')+(feature>=3?dirs[c]:''));
    }
    return {palette:palette,features:feature};
  }
  function missing(l,kind){
    var info=tokens(l),period=2+Math.floor((l-1)/4),used=sh(info.palette).slice(0,period);
    var n=4+l,items=Array.from({length:n},function(_,i){return used[i%period];});
    var index=kind==='missing'? (l<5?n-1:rnd(1,n-2)):n;
    var answer=used[index%period],shown=items.slice();
    if(kind==='missing')shown[index]='❓';else shown.push('❓');
    return q(kind==='missing'?21:8,l,{
      prompt:kind==='missing'?'Quale figura manca?':'Quale figura viene dopo?',
      visual:'<div class="pieceStrip">'+shown.map(function(t){return '<span>'+t+'</span>';}).join('')+'</div>',
      options:opts(null,l,answer,info.palette),answer:answer,
      hint:l<=5?'Trova il gruppo che si ripete.':l<=10?'Confronta tutti i simboli della sequenza.':'Segui colore, forma e direzione separatamente.'
    },{presentedItems:n,period:period,featureCount:info.features,hiddenInternal:kind==='missing'&&l>=5?1:0});
  }
  function number(l){
    var a=rnd(1,5),seq=[],answer,rule,n=3+l;
    if(l<=5){var step=l;for(var i=0;i<n;i++)seq.push(a+i*step);answer=a+n*step;rule='Aggiungi sempre '+step+'.';}
    else if(l<=10){var first=l-4,second=first+1,now=a;seq=[now];for(var i=1;i<n;i++){now+=i%2?first:second;seq.push(now);}answer=now+(n%2?first:second);rule='Alterna due aumenti diversi.';}
    else {var x=a,y=(l-9)*n+12;for(var i=0;i<n;i++)seq.push(i%2?y-Math.floor(i/2)*(l-9):x+Math.floor(i/2)*(l-8));answer=n%2?y-Math.floor(n/2)*(l-9):x+Math.floor(n/2)*(l-8);rule='Ci sono due sequenze intrecciate: una sale e una scende.';}
    return q(1,l,{prompt:'Qual è il numero che viene dopo?',visual:'<div class="bigVisual">'+seq.join(' · ')+' · ?</div>',options:opts(null,l,answer,[answer-1,answer+1,answer-2,answer+2,answer+3,answer-3,answer+5]),answer:String(answer),hint:rule},
      {terms:n,ruleCount:l<=5?1:2,stepSize:l<=5?l:l<=10?l-4:l-8});
  }
  function odd(l){
    var info=tokens(l),base=pick(info.palette),length=3+l,arr=Array(length).fill(base),idx=rnd(0,length-1);
    var parts=[base,info.palette.filter(function(t){return t!==base;})];
    var wrong=pick(parts[1]);arr[idx]=wrong;
    var numbers=Array.from({length:length},function(_,i){return String(i)});
    return q(7,l,{prompt:'Quale pezzo è diverso dagli altri?',visual:'<div class="pieceStrip">'+arr.map(function(v,i){return '<span><small>'+(i+1)+'</small>'+v+'</span>';}).join('')+'</div>',options:sh([String(idx)].concat(sh(numbers.filter(function(x){return x!==String(idx);})).slice(0,Math.min(length-1,Math.min(6,2+Math.floor((l-1)/3))-1)))).map(function(v){return {label:'Posizione '+(Number(v)+1),value:v};}),answer:String(idx),hint:'Osserva le caratteristiche di ogni elemento.'},
      {visibleItems:length,featureCount:info.features,choices:Math.min(6,2+Math.floor((l-1)/3))});
  }
  function numericSecondStep(id,l){
    // Number of objects that must actually be counted increases at EVERY
    // level, and the number of arithmetic operations grows by stage.
    var count=3+l,icon=id===11?'🧱':'🍎';
    var text='Conta tutti gli oggetti.',number=count,steps=1;
    if(l>=5){var add=1+Math.floor((l-5)/2);number+=add;steps++;text+=' Poi aggiungi '+add+'.';}
    if(l>=9){var sub=1+Math.floor((l-9)/2);number-=sub;steps++;text+=' Poi togli '+sub+'.';}
    if(l>=13){var extra=1+Math.floor((l-13)/1);number+=extra;steps++;text+=' Infine aggiungi '+extra+'.';}
    var visual='<div class="bigVisual countVisual">'+Array.from({length:count},function(){return icon;}).join(' ')+'</div>';
    return q(id,l,{prompt:id===11?'Quanti blocchi rimangono?':'Quanti oggetti ci sono alla fine?',sub:text,visual:visual,
      options:opts(null,l,number,[number-1,number+1,number-2,number+2,number-3,number+3]),answer:String(number),hint:'Conta prima quelli presenti, poi esegui le operazioni nell’ordine.'},
      {countedItems:count,steps:steps,added:l>=5?1+Math.floor((l-5)/2):0,removed:l>=9?1+Math.floor((l-9)/2):0});
  }
  function memory(l){
    var count=2+l,images=sh(objects).slice(0,count),exposure=4800-l*210,position=rnd(0,count-1);
    var answer=images[position],id='memory83_'+Math.random().toString(36).slice(2);
    var question={prompt:'Memorizza gli oggetti!',sub:'Ricorda quale oggetto è nella posizione '+(position+1)+'.',visual:'<div class="bigVisual" id="'+id+'">'+images.join(' ')+'</div>',options:opts(null,l,answer,objects),answer:answer,hint:'Concentrati su una posizione alla volta.',afterRender:function(){
      var el=document.getElementById(id),opt=document.querySelector('.options');if(!el)return;
      if(opt){opt.style.visibility='hidden';opt.style.pointerEvents='none';}
      setTimeout(function(){if(!document.getElementById(id))return;el.textContent='❓ '.repeat(count);var heading=document.querySelector('.question h3');if(heading)heading.textContent='Quale oggetto era alla posizione '+(position+1)+'?';if(opt){opt.style.visibility='visible';opt.style.pointerEvents='auto';}},exposure);
    }};
    return q(14,l,question,{memoryItems:count,exposureMs:exposure,possiblePositions:count});
  }
  function shadow(l){
    var length=1+l,items=Array.from({length:length},function(){return pick(shapes);});
    var answer=items.map(function(s){return outline[s];}).join('');
    var pool=[];for(var i=0;i<Math.max(24,length*3);i++){var alt=items.slice(),at=i%length;alt[at]=pick(shapes.filter(function(s){return s!==items[at];}));pool.push(alt.map(function(s){return outline[s];}).join(''));}
    return q(32,l,{prompt:'Qual è l’ombra corretta?',sub:'Mantieni il numero, la forma e l’ordine di tutti i pezzi.',visual:'<div class="bigVisual">'+items.join(' ')+' → ?</div>',options:opts(null,l,answer,pool),answer:answer,hint:'Confronta un pezzo alla volta.'},{pieces:length,nearDistractors:Math.min(6,2+Math.floor((l-1)/3))-1});
  }
  function twins(l){
    var len=3+l,info=tokens(l),set=sh(info.palette),selected=set[0],list=set.slice(1,len-1);
    // A second identical tile is the sole duplicate. All other tiles differ.
    var i=rnd(0,list.length),j=rnd(0,list.length+1);while(j===i)j=rnd(0,list.length+1);
    list.splice(i,0,selected);list.splice(j,0,selected); // indices may shift
    var positions=[];list.forEach(function(t,index){if(t===selected)positions.push(index+1);});
    var answer=positions.join('-'),pool=[];for(var a=1;a<=len;a++)for(var b=a+1;b<=len;b++)pool.push(a+'-'+b);
    return q(33,l,{prompt:'Dove sono le due figure identiche?',visual:'<div class="pieceStrip">'+list.map(function(t,k){return '<span><small>'+(k+1)+'</small>'+t+'</span>';}).join('')+'</div>',options:opts(null,l,answer,pool).map(function(v){return {label:'Pezzi '+v.replace('-',' e '),value:v};}),answer:answer,hint:'Devono coincidere tutti i dettagli.'},{items:len,features:info.features,options:Math.min(6,2+Math.floor((l-1)/3))});
  }
  function domino(l){
    var period=2+Math.floor((l-1)/3),seqPalette=sh(colored).slice(0,Math.min(6,period)),count=4+l,series=[];
    // Period grows at L4,L7,L10,L13; number of tiles grows at every level.
    for(var i=0;i<count;i++)series.push(seqPalette[i%seqPalette.length]);
    var answer=seqPalette[count%seqPalette.length];
    return q(35,l,{prompt:'Quale colore continua la sequenza?',visual:'<div class="bigVisual">'+series.join(' ')+' ?</div>',options:opts(null,l,answer,colored),answer:answer,hint:'Trova il ciclo di colori e ripetilo.'},{tiles:count,cycleLength:seqPalette.length});
  }
  function english(l,state,id){
    var band=l<=4?1:l<=8?2:l<=10?3:l<=12?5:6;
    var filtered=NS.WORDS.filter(function(w){return w.lvl>=band&&(l<=10?w.lvl<=band+1:true)&&(l<12?w.cefr!=='B1':w.cefr==='B1');});
    if(!filtered.length)filtered=NS.WORDS.filter(function(w){return w.lvl>=band;});
    var ranked=NS.WORDS.slice().sort(function(a,b){return a.lvl-b.lvl || a.en.length-b.en.length || a.en.localeCompare(b.en);});
    var lo=Math.floor((l-1)*ranked.length/15),hi=Math.floor(l*ranked.length/15);
    var tier=ranked.slice(lo,Math.max(lo+1,hi));
    // Repetition of mistakes stays possible within the current level's band.
    var due=tier.filter(function(w){var stats=state&&state.english&&state.english.words&&state.english.words[w.en];return stats&&stats.wrong>0&&stats.due<=Date.now();});
    var word=pick(due.length&&rnd(0,2)!==0?due:tier);
    var same=sh(NS.WORDS.filter(function(w){return w.en!==word.en&&w.cat===word.cat&&w.lvl>=Math.max(1,band-1);}));
    var rest=sh(NS.WORDS.filter(function(w){return w.en!==word.en&&w.cat!==word.cat&&w.lvl>=Math.max(1,band-1);}));
    var distractors=(l>=6?same.concat(rest):rest.concat(same)).slice(0,Math.min(6,2+Math.floor((l-1)/3))-1);
    var panel=l<=5?'italian-to-english':l<=10?'english-to-image':'english-to-translation';
    var showItalian=l<=2,showEmoji=l<=6;
    var optW=sh([word].concat(distractors));
    var items=optW.map(function(w){return {label:panel==='english-to-image'?w.emoji:panel==='english-to-translation'?w.it.toUpperCase():w.en.toUpperCase(),value:w.en};});
    var custom='<button class="speak" onclick="LogicLand.speakLine(\''+NS.escapeHtml(word.en)+'\',\'en-GB\')">🔊 Ascolta la parola</button>';
    var question={word:word,prompt:panel==='italian-to-english'?'Come si dice in inglese?':panel==='english-to-image'?'Quale immagine corrisponde alla parola inglese?':'Qual è il significato in italiano?',sub:(showItalian?'Italiano: '+word.it+' • ':'')+(showEmoji?'Immagine: '+word.emoji+' • ':'')+(panel==='italian-to-english'?'':'Parola: '+word.en.toUpperCase()),custom:custom,options:items,answer:word.en,answerLabel:word.en.toUpperCase()+' = '+word.it,hint:l<=4?'Ascolta e osserva l’immagine.':l<=10?'Ascolta bene la pronuncia.':'Confronta le traduzioni simili.'};
    if(panel==='italian-to-english'&&!showItalian)question.sub='Traduci: '+word.it+(showEmoji?' '+word.emoji:'');
    if(id===34 && l>=9){ // Identify the outlier among vocabulary of a single category.
      var group=sh(NS.WORDS.filter(function(w){return w.cat===word.cat&&w.en!==word.en&&w.lvl>=Math.max(1,band-1);})).slice(0,3);
      if(group.length===3){var extra=pick(rest);var answer=extra.en;question.prompt='Quale parola NON appartiene al gruppo?';question.sub=l<=12?'Categoria: '+word.cat:'Trova da sola la categoria.';question.options=sh(group.concat([extra])).map(function(w){return {label:w.en.toUpperCase(),value:w.en};});question.answer=answer;question.answerLabel=extra.en.toUpperCase();question.word=word;}
    }
    return q(id,l,question,{vocabularyMinBand:band,lexicalRankMin:lo,cefr:word.cefr,alternatives:items.length,context:panel,categoryDistractors:distractors.filter(function(w){return w.cat===word.cat;}).length});
  }
  NS.MathGames[1]=number;
  NS.MathGames[7]=odd;
  NS.VisualGames[8]=function(l){return missing(l,'next');};
  NS.VisualGames[11]=function(l){return numericSecondStep(11,l);};
  NS.VisualGames[14]=memory;
  NS.EnglishGames[16]=function(l,s){return english(l,s,16);};
  NS.VisualGames[21]=function(l){return missing(l,'missing');};
  NS.MathGames[31]=function(l){return numericSecondStep(31,l);};
  NS.VisualGames[32]=shadow;
  NS.VisualGames[33]=twins;
  NS.EnglishGames[34]=function(l,s){return english(l,s,34);};
  NS.VisualGames[35]=domino;
})(window.LogicLand);
