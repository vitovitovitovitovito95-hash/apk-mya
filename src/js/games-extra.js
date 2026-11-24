'use strict';
(function(NS){
  const COLORS=['🔴','🔵','🟢','🟡','🟣','🟠'];
  const SHAPES=['●','▲','■','◆','★','⬟'];
  const ARROWS=['⬆️','➡️','⬇️','⬅️'];
  const OBJECTS=['🍎','⭐','🐶','🚗','🦋','⚽','🍓','🐠'];
  const OUTLINE={'●':'○','▲':'△','■':'□','◆':'◇','★':'☆','⬟':'⬡'};

  function finish(id,level,q){return NS.attachDifficulty(q,id,level);}
  function opt(answer,pool,count=4){return NS.uniqueOptions(String(answer),pool.map(String),count);}

  function qCountChoose(level){
    const p=NS.levelProfile(level),icon=NS.pick(OBJECTS),mode=level<=5?0:level<=10?NS.rnd(0,1):NS.rnd(1,2);
    if(mode===0){
      const n=Math.min(18,2+level+NS.rnd(0,2));
      return finish(31,level,{prompt:'Quanti oggetti vedi?',visual:`<div class="bigVisual countVisual">${icon.repeat(n)}</div>`,options:opt(n,[n-2,n-1,n+1,n+2,n+3].filter(x=>x>0),p.choices),answer:String(n),hint:'Conta uno alla volta, toccandoli con lo sguardo.'});
    }
    if(mode===1){
      const a=NS.rnd(2,7+level),b=NS.rnd(2,7+level);if(a===b)return qCountChoose(level);
      const answer=a>b?'A':'B';
      return finish(31,level,{prompt:'Quale gruppo contiene più oggetti?',visual:`<div class="compareGroups"><div><b>A</b><span>${icon.repeat(Math.min(a,18))}</span></div><div><b>B</b><span>${icon.repeat(Math.min(b,18))}</span></div></div>`,options:[{label:'Gruppo A',value:'A'},{label:'Gruppo B',value:'B'}],answer,hint:'Puoi contare i due gruppi e poi confrontare i numeri.'});
    }
    const known=NS.rnd(3,8+level),missing=NS.rnd(2,5+Math.floor(level/2)),total=known+missing;
    return finish(31,level,{prompt:'Quanti oggetti sono nascosti?',visual:`<div class="bigVisual">${icon.repeat(Math.min(known,12))} + ❓ = ${total}</div>`,options:opt(missing,[missing-2,missing-1,missing+1,missing+2,total].filter(x=>x>=0),p.choices),answer:String(missing),hint:`Fai ${total} − ${known}.`});
  }

  function qShadow(level){
    const p=NS.levelProfile(level),count=level<=5?1:level<=10?2:3,base=NS.shuffle(SHAPES).slice(0,count),answer=base.map(x=>OUTLINE[x]).join('');
    const wrong=[];
    for(let i=0;i<8;i++){let x=NS.shuffle(SHAPES).slice(0,count).map(s=>OUTLINE[s]).join('');if(x!==answer)wrong.push(x);}
    return finish(32,level,{prompt:'Qual è l’ombra corretta?',sub:count===1?'Abbina la figura alla sua sagoma.':'Mantieni forma e ordine di tutti i pezzi.',visual:`<div class="bigVisual">${base.join('')} → ?</div>`,options:opt(answer,wrong,p.choices),answer,hint:'L’ombra cambia il riempimento, non la forma.'});
  }

  function qTwins(level){
    const p=NS.levelProfile(level),n=Math.min(10,4+Math.floor(level/2)),pool=level<=5?COLORS:level<=10?[...COLORS,...SHAPES]:[...COLORS,...SHAPES,...ARROWS];
    let arr=NS.shuffle(pool).slice(0,n),token=NS.pick(arr),i=NS.rnd(0,n-1),j=NS.rnd(0,n-1);while(j===i)j=NS.rnd(0,n-1);arr[i]=token;arr[j]=token;
    // Make every other token unique relative to the twin token.
    const used=new Set([token]);for(let k=0;k<n;k++){if(k===i||k===j)continue;let candidates=pool.filter(x=>!used.has(x));if(!candidates.length)candidates=pool.filter(x=>x!==token);arr[k]=NS.pick(candidates);used.add(arr[k]);}
    const a=Math.min(i,j)+1,b=Math.max(i,j)+1,answer=`${a}-${b}`,pairs=[answer];
    while(pairs.length<Math.min(6,p.choices)){const x=NS.rnd(1,n),y=NS.rnd(1,n);if(x===y)continue;const z=`${Math.min(x,y)}-${Math.max(x,y)}`;if(!pairs.includes(z))pairs.push(z);}
    return finish(33,level,{prompt:'Dove sono le due figure gemelle?',visual:`<div class="pieceStrip">${arr.map((x,k)=>`<span><small>${k+1}</small>${x}</span>`).join('')}</div>`,options:NS.shuffle(pairs).map(x=>({label:`Pezzi ${x.replace('-', ' e ')}`,value:x})),answer,hint:'Confronta forma, colore e orientamento: devono essere identici.'});
  }

  function englishDistractors(word,count=5){
    const same=NS.WORDS.filter(x=>x.en!==word.en&&(x.cat===word.cat||x.lvl===word.lvl));
    return NS.shuffle(same.length>=count?same:NS.WORDS.filter(x=>x.en!==word.en)).slice(0,count);
  }
  function wordChoices(correct,others,count){
    return NS.shuffle([correct,...NS.shuffle(others.filter(x=>x.en!==correct.en)).slice(0,Math.max(1,count-1))]);
  }

  function qFirstEnglish(level,state){
    const p=NS.levelProfile(level),w=NS.selectEnglishWord(state,Math.min(level,9)),others=englishDistractors(w,6),mode=level<=4?0:level<=9?1:2;
    if(mode===0)return finish(34,level,{word:w,prompt:`Come si dice “${w.it}” in inglese?`,visual:`<div class="bigVisual">${w.emoji}</div>`,options:wordChoices(w,others,p.choices).map(x=>({label:x.en.toUpperCase(),value:x.en})).concat([]),answer:w.en,answerLabel:w.en.toUpperCase(),hint:`La parola indica ${w.it}.`});
    if(mode===1)return finish(34,level,{word:w,prompt:`Cosa significa “${w.en.toUpperCase()}”?`,visual:`<div class="bigVisual">${w.emoji}</div>`,options:wordChoices(w,others,p.choices).map(x=>({label:x.it,value:x.en})),answer:w.en,answerLabel:w.it,hint:'Guarda l’immagine e ricorda la parola.'});
    const candidates=wordChoices(w,others,Math.max(3,p.choices));
    return finish(34,level,{word:w,prompt:'Scegli la parola inglese corretta',sub:`Categoria: ${w.cat} • Italiano: ${w.it}`,options:candidates.map(x=>({label:x.en.toUpperCase(),value:x.en})),answer:w.en,answerLabel:w.en.toUpperCase(),hint:'Usa insieme categoria e significato.'});
  }

  function qColorDomino(level){
    const p=NS.levelProfile(level),a=NS.pick(COLORS),b=NS.pick(COLORS.filter(x=>x!==a)),c=NS.pick(COLORS.filter(x=>x!==a&&x!==b));let seq,answer,hint;
    if(level<=3){seq=[a,b,a,b,a];answer=b;hint='Alterna due colori.';}
    else if(level<=6){seq=[a,a,b,a,a,b,a,a];answer=b;hint='Due uguali e uno diverso.';}
    else if(level<=9){seq=[a,b,c,a,b,c,a];answer=b;hint='Si ripete un gruppo di tre.';}
    else if(level<=12){seq=[a,b,b,c,c,a,a,b,b];answer=c;hint='Ogni colore compare due volte, poi cambia.';}
    else{const d=NS.pick(COLORS.filter(x=>![a,b,c].includes(x)));seq=[a,b,c,d,b,c,d,a,c,d,a];answer=b;hint='La sequenza scorre su quattro colori saltando il primo a ogni blocco.';}
    return finish(35,level,{prompt:'Quale tessera continua il domino?',visual:`<div class="bigVisual">${seq.join(' ')} ?</div>`,options:opt(answer,COLORS,p.choices),answer,hint});
  }

  function qMysteryOperation(level){
    const p=NS.levelProfile(level);let f,label;
    if(level<=3){const k=level+1;f=x=>x+k;label=`+${k}`;}
    else if(level<=6){const k=2+Math.floor((level-4)/2);f=x=>x*k;label=`×${k}`;}
    else if(level<=9){const k=level-5;f=x=>2*x+k;label=`×2 poi +${k}`;}
    else if(level<=12){const k=level-8;f=x=>3*x-k;label=`×3 poi −${k}`;}
    else{const k=level-11;f=x=>x*x+k;label=`quadrato poi +${k}`;}
    const x1=NS.rnd(1,5+Math.floor(level/3)),x2=x1+1,x3=x2+1,answer=f(x3);
    return finish(36,level,{prompt:'Quale numero manca?',sub:'Scopri la stessa trasformazione usata negli esempi.',visual:`<div class="bigVisual">${x1} → ${f(x1)} &nbsp; ${x2} → ${f(x2)} &nbsp; ${x3} → ?</div>`,options:opt(answer,[answer-3,answer-2,answer-1,answer+1,answer+2,answer+3].filter(x=>x>=0),p.choices),answer:String(answer),hint:`Regola: ${label}.`});
  }

  function qDirections(level){
    const p=NS.levelProfile(level),start=NS.rnd(0,3),turns=[];let dir=start,steps=Math.min(5,p.steps+Math.floor(p.withinStage/2));
    for(let i=0;i<steps;i++){const delta=level<=4?1:NS.pick(level<=9?[1,3]:[1,2,3]);turns.push(delta);dir=(dir+delta)%4;}
    const text=turns.map(t=>t===1?'↻90°':t===2?'↻180°':'↺90°').join('  ');
    return finish(37,level,{prompt:'In quale direzione finisce la freccia?',visual:`<div class="bigVisual">${ARROWS[start]} &nbsp; ${text} &nbsp; → ?</div>`,options:NS.shuffle(ARROWS),answer:ARROWS[dir],hint:'Applica le rotazioni una alla volta, da sinistra a destra.'});
  }

  function qEnglishMemory(level,state){
    const p=NS.levelProfile(level),w=NS.selectEnglishWord(state,level),others=englishDistractors(w,6),mode=level<=5?0:level<=10?1:2;
    if(mode===0)return finish(38,level,{word:w,prompt:'Ricorda la coppia',sub:`${w.emoji} = ${w.en.toUpperCase()}. Quale parola hai appena visto?`,options:wordChoices(w,others,p.choices).map(x=>({label:x.en.toUpperCase(),value:x.en})),answer:w.en,answerLabel:w.en.toUpperCase(),hint:`Era associata a ${w.emoji}.`});
    if(mode===1)return finish(38,level,{word:w,prompt:'Quale immagine appartiene alla parola?',visual:`<div class="bigVisual">${w.en.toUpperCase()}</div>`,options:wordChoices(w,others,p.choices).map(x=>({label:`${x.emoji} ${x.it}`,value:x.en})),answer:w.en,answerLabel:`${w.emoji} ${w.it}`,hint:'Richiama mentalmente la coppia parola-immagine.'});
    const sameCat=NS.WORDS.filter(x=>x.cat===w.cat&&x.en!==w.en),second=NS.pick(sameCat.length?sameCat:others);
    return finish(38,level,{word:w,prompt:'Quale coppia appartiene alla stessa categoria?',sub:`Categoria nascosta: ${w.en.toUpperCase()} + ?`,options:wordChoices(second,others.filter(x=>x.cat!==w.cat),p.choices).map(x=>({label:x.en.toUpperCase(),value:x.en})),answer:second.en,answerLabel:second.en.toUpperCase(),hint:`${w.en} significa ${w.it}: pensa alla sua categoria.`});
  }

  function qFractions(level){
    const p=NS.levelProfile(level),den=level<=4?2:level<=8?NS.pick([2,3,4]):level<=12?NS.pick([3,4,5,6]):NS.pick([4,5,6,8]),num=NS.rnd(1,den-1),answer=`${num}/${den}`;
    const filled='🟦'.repeat(num)+'⬜'.repeat(den-num),pool=[];for(let d=2;d<=8;d++)for(let n=1;n<d;n++)pool.push(`${n}/${d}`);
    if(level<=9)return finish(39,level,{prompt:'Quale frazione è colorata?',visual:`<div class="bigVisual fractionVisual">${filled}</div>`,options:opt(answer,pool,p.choices),answer,hint:`Conta ${den} parti uguali e ${num} parti colorate.`});
    const den2=den;let num2=NS.rnd(1,den2-1);while(num2===num)num2=NS.rnd(1,den2-1);const a=num/den,b=num2/den2,ans=a>b?'A':'B';
    return finish(39,level,{prompt:'Quale frazione è maggiore?',visual:`<div class="compareGroups"><div><b>A</b><span>${'🟦'.repeat(num)}${'⬜'.repeat(den-num)}</span><small>${num}/${den}</small></div><div><b>B</b><span>${'🟩'.repeat(num2)}${'⬜'.repeat(den2-num2)}</span><small>${num2}/${den2}</small></div></div>`,options:[{label:'A',value:'A'},{label:'B',value:'B'}],answer:ans,hint:'Con lo stesso denominatore, è maggiore la frazione con più parti colorate.'});
  }

  function qCoordinates(level){
    const p=NS.levelProfile(level),n=Math.min(7,3+Math.floor((level-1)/3)),r=NS.rnd(0,n-1),c=NS.rnd(0,n-1),answer=String.fromCharCode(65+r)+(c+1);let cells='';
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)cells+=`<i>${y===r&&x===c?'⭐':''}</i>`;
    const pool=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)pool.push(String.fromCharCode(65+y)+(x+1));
    return finish(40,level,{prompt:'In quale coordinata si trova la stella?',sub:'Le righe sono lettere; le colonne sono numeri.',visual:`<div class="coordWrap"><div class="robotgrid" style="grid-template-columns:repeat(${n},36px)">${cells}</div></div>`,options:opt(answer,pool,p.choices),answer,hint:`Riga ${String.fromCharCode(65+r)}, colonna ${c+1}.`});
  }

  function qAnalogy(level){
    const p=NS.levelProfile(level),shape=NS.pick(SHAPES),shape2=NS.pick(SHAPES.filter(x=>x!==shape)),c1=NS.pick(COLORS),c2=NS.pick(COLORS.filter(x=>x!==c1));let A,B,C,answer,hint,pool=[];
    if(level<=5){A=c1+shape;B=c2+shape;C=c1+shape2;answer=c2+shape2;hint='Cambia il colore, ma conserva la forma.';}
    else if(level<=10){A=c1+shape;B=c1+shape2;C=c2+shape;answer=c2+shape2;hint='Applica a C lo stesso cambio di forma visto tra A e B.';}
    else{const ar=NS.pick(ARROWS),idx=ARROWS.indexOf(ar),rot=1+((level-11)%3);A=c1+ARROWS[idx];B=c2+ARROWS[(idx+rot)%4];C=c1+ARROWS[(idx+1)%4];answer=c2+ARROWS[(idx+1+rot)%4];hint='Cambia colore e ruota della stessa quantità.';}
    for(const c of COLORS.slice(0,4))for(const s of [...SHAPES.slice(0,4),...ARROWS])pool.push(c+s);
    return finish(41,level,{prompt:'A sta a B come C sta a…',visual:`<div class="bigVisual">${A} : ${B} = ${C} : ?</div>`,options:opt(answer,pool,p.choices),answer,hint});
  }

  function qEnglishCategories(level,state){
    const p=NS.levelProfile(level),w=NS.selectEnglishWord(state,level),same=NS.WORDS.filter(x=>x.cat===w.cat&&x.en!==w.en),mate=NS.pick(same.length?same:englishDistractors(w)),wrong=NS.shuffle(NS.WORDS.filter(x=>x.cat!==w.cat)).slice(0,6);
    if(level<=7)return finish(42,level,{word:w,prompt:'Quale parola appartiene alla stessa categoria?',sub:`${w.en.toUpperCase()} (${w.it})`,options:wordChoices(mate,wrong,p.choices).map(x=>({label:`${x.en.toUpperCase()} ${x.emoji}`,value:x.en})),answer:mate.en,answerLabel:mate.en.toUpperCase(),hint:`Pensa alla categoria “${w.cat}”.`});
    const group=NS.shuffle([w,mate,...same.filter(x=>x.en!==mate.en)]).slice(0,3),intruder=NS.pick(wrong),arr=NS.shuffle([...group,intruder]);
    return finish(42,level,{word:w,prompt:'Quale parola è l’intrusa?',sub:'Tre parole appartengono alla stessa categoria.',options:arr.map(x=>({label:x.en.toUpperCase(),value:x.en})),answer:intruder.en,answerLabel:intruder.en.toUpperCase(),hint:'Traduci le parole e cerca quella di una categoria diversa.'});
  }

  function qMultiStepProblems(level){
    const p=NS.levelProfile(level),a=NS.rnd(5,15+level*2),b=NS.rnd(2,8+level),c=NS.rnd(1,6+Math.floor(level/2));let text,answer;
    if(level<=5){answer=a+b-c;text=`Hai ${a} figurine, ne ricevi ${b} e poi ne regali ${c}. Quante ne restano?`;}
    else if(level<=10){const packs=NS.rnd(2,3+Math.floor(level/3)),each=NS.rnd(3,8),gift=NS.rnd(1,Math.min(6,packs*each-1));answer=packs*each-gift;text=`Hai ${packs} pacchetti da ${each} figurine. Ne regali ${gift}. Quante restano?`;}
    else{const groups=NS.rnd(2,5),each=NS.rnd(4,9),extra=NS.rnd(2,8),share=NS.pick([2,3]);const total=groups*each+extra,usable=total-total%share;answer=usable/share;text=`Ci sono ${groups} scatole da ${each} oggetti e altri ${extra}. Ne usi ${usable} e li dividi tra ${share} bambini. Quanti a testa?`;}
    return finish(43,level,{prompt:'Problema a più passaggi',sub:text,options:opt(answer,[answer-3,answer-2,answer-1,answer+1,answer+2,answer+3].filter(x=>x>=0),p.choices),answer:String(answer),hint:`Servono ${p.steps} passaggi: scrivi un risultato intermedio alla volta.`});
  }

  function qDoubleMatrix(level){
    const p=NS.levelProfile(level),cs=NS.shuffle(COLORS).slice(0,3),ss=NS.shuffle(SHAPES).slice(0,3),tok=(r,c)=>cs[r]+ss[c];let grid,answer,pool=[];
    for(const c of cs)for(const s of ss)pool.push(c+s);
    if(level<=5){grid=[[tok(0,0),tok(0,1)],[tok(1,0),'?']];answer=tok(1,1);}
    else if(level<=10){grid=[[tok(0,0),tok(1,1),tok(2,2)],[tok(1,2),tok(2,0),tok(0,1)],[tok(2,1),tok(0,2),'?']];answer=tok(1,0);}
    else{grid=[[tok(0,0),tok(1,1),tok(2,2)],[tok(2,1),tok(0,2),tok(1,0)],[tok(1,2),tok(2,0),'?']];answer=tok(0,1);}
    const cls=grid.length===2?'matrix':'matrix3 compact';
    return finish(44,level,{prompt:'Completa la matrice a doppia regola',sub:'Colore e forma seguono schemi indipendenti.',visual:`<div class="${cls}">${grid.flat().map(x=>`<i>${x}</i>`).join('')}</div>`,options:opt(answer,pool,p.choices),answer,hint:'Controlla prima solo i colori, poi solo le forme.'});
  }

  function qImpossibleTile(level){
    const p=NS.levelProfile(level),n=Math.min(10,5+Math.floor(level/3)),baseC=NS.pick(COLORS),baseS=NS.pick(SHAPES),oddC=NS.pick(COLORS.filter(x=>x!==baseC)),oddS=NS.pick(SHAPES.filter(x=>x!==baseS)),idx=NS.rnd(0,n-1),arr=[];
    for(let i=0;i<n;i++){if(level<=5)arr.push(i===idx?oddC:baseC);else if(level<=10)arr.push(i===idx?baseC+oddS:baseC+baseS);else arr.push(i===idx?oddC+oddS:baseC+baseS);}
    return finish(45,level,{prompt:'Quale tassello non può appartenere al gruppo?',visual:`<div class="pieceStrip">${arr.map((x,i)=>`<span><small>${i+1}</small>${x}</span>`).join('')}</div>`,options:Array.from({length:n},(_,i)=>({label:`Tassello ${i+1}`,value:String(i)})),answer:String(idx),hint:level<=5?'Cerca il colore diverso.':level<=10?'Il colore è uguale: controlla la forma.':'Controlla contemporaneamente colore e forma.'});
  }

  const SENTENCE_BANK=[
    ['I','like','red','apples'],['The','dog','can','run'],['My','book','is','blue'],['We','go','to','school'],['The','cat','is','sleeping'],['I','drink','cold','water'],['My','family','is','happy'],['The','bird','can','fly']
  ];
  function qSentenceOrder(level,state){
    const p=NS.levelProfile(level),base=NS.pick(SENTENCE_BANK),extra=level>=11?['today']:[],words=[...base,...extra],answer=words.join(' '),wrong=[];
    for(let i=0;i<10;i++){const x=NS.shuffle(words).join(' ');if(x!==answer&&!wrong.includes(x))wrong.push(x);}
    const refWord=NS.WORDS.find(w=>answer.toLowerCase().includes(w.en))||NS.selectEnglishWord(state,level);
    return finish(46,level,{word:refWord,prompt:'Quale frase è nell’ordine corretto?',sub:`Parole: ${NS.shuffle(words).join(' • ')}`,options:opt(answer,wrong,p.choices),answer,answerLabel:answer,hint:'In inglese di solito viene prima chi compie l’azione, poi il verbo.'});
  }

  function qConditions(level){
    const p=NS.levelProfile(level),names=['Anna','Luca','Mia','Leo'],items=['🍎','📘','⚽','🎈'];
    if(level<=5){const a=NS.pick(names),b=NS.pick(names.filter(x=>x!==a)),item=NS.pick(items),answer=a;return finish(47,level,{prompt:'Chi può avere l’oggetto?',sub:`Solo ${a} ha ${item}. ${b} non ha ${item}.`,options:opt(a,[b,...names.filter(x=>x!==a&&x!==b)],p.choices),answer,hint:'Usa la frase positiva: dice direttamente chi possiede l’oggetto.'});}
    if(level<=10){const a=names[0],b=names[1],c=names[2];return finish(47,level,{prompt:'Chi è sicuramente davanti?',sub:`${a} è davanti a ${b}. ${b} è davanti a ${c}.`,options:opt(a,[b,c,names[3]],p.choices),answer:a,hint:'Se A è davanti a B e B davanti a C, A è davanti a entrambi.'});}
    const answer='Mia';return finish(47,level,{prompt:'Chi soddisfa tutte le condizioni?',sub:'Anna ha il libro ma non la palla. Luca ha la palla ma non il libro. Mia ha sia libro sia palla. Serve qualcuno con ENTRAMBI.',options:NS.shuffle(['Anna','Luca','Mia','Leo']),answer,hint:'“Entrambi” significa che devono essere vere due condizioni nello stesso momento.'});
  }

  function qConstrainedPaths(level){
    const p=NS.levelProfile(level),paths=['A-B-C-D','A-C-B-D','A-B-D-C','A-D-B-C','A-C-D-B'];let rule,answer;
    if(level<=5){rule='Devi passare da B prima di C e finire in D.';answer='A-B-C-D';}
    else if(level<=10){rule='Devi visitare C prima di B, B prima di D e finire in D.';answer='A-C-B-D';}
    else{rule='Devi visitare B, poi D, e C deve essere l’ultima tappa.';answer='A-B-D-C';}
    return finish(48,level,{prompt:'Quale percorso rispetta tutti i vincoli?',sub:rule,visual:'<div class="bigVisual">A 🏠 &nbsp; B ⭐ &nbsp; C 🔑 &nbsp; D 🏁</div>',options:NS.shuffle([answer,...NS.shuffle(paths.filter(x=>x!==answer)).slice(0,Math.max(p.choices,4)-1)]),answer,hint:'Controlla i vincoli uno alla volta ed elimina i percorsi che ne violano anche uno solo.'});
  }

  function qMultiRulePattern(level){
    const p=NS.levelProfile(level),cs=NS.shuffle(COLORS).slice(0,4),ss=NS.shuffle(SHAPES).slice(0,4),rules=Math.min(4,p.simultaneousRules),tokens=[];let answer;
    for(let i=0;i<6;i++){const c=cs[i%Math.min(cs.length,Math.max(2,rules))],s=ss[Math.floor(i/Math.max(1,4-rules))%ss.length],rot=level>=11?ARROWS[i%4]:'';tokens.push(c+s+rot);}
    const i=6,c=cs[i%Math.min(cs.length,Math.max(2,rules))],s=ss[Math.floor(i/Math.max(1,4-rules))%ss.length],rot=level>=11?ARROWS[i%4]:'';answer=c+s+rot;
    const pool=[];for(const x of cs)for(const y of ss)pool.push(x+y+(level>=11?NS.pick(ARROWS):''));
    return finish(49,level,{prompt:'Quale pezzo continua il pattern?',sub:`Il livello combina ${rules} ${rules===1?'regola':'regole'} contemporaneamente.`,visual:`<div class="pieceStrip">${tokens.map(x=>`<span>${x}</span>`).join('')}<span>?</span></div>`,options:opt(answer,pool,p.choices),answer,hint:'Analizza separatamente colore, forma, quantità e orientamento.'});
  }

  function qEnglishLogic(level,state){
    const p=NS.levelProfile(level),w=NS.selectEnglishWord(state,level),others=englishDistractors(w,8),same=NS.WORDS.filter(x=>x.cat===w.cat&&x.en!==w.en),mate=NS.pick(same.length?same:others);
    if(level<=5)return finish(50,level,{word:w,prompt:'English clue',sub:`I am ${w.emoji}. In Italian I am “${w.it}”. What am I in English?`,options:wordChoices(w,others,p.choices).map(x=>({label:x.en.toUpperCase(),value:x.en})),answer:w.en,answerLabel:w.en.toUpperCase(),hint:`Traduci “${w.it}”.`});
    if(level<=10)return finish(50,level,{word:w,prompt:'English logic',sub:`${w.en.toUpperCase()} and ? belong to the same group.`,options:wordChoices(mate,others.filter(x=>x.cat!==w.cat),p.choices).map(x=>({label:`${x.en.toUpperCase()} ${x.emoji}`,value:x.en})),answer:mate.en,answerLabel:mate.en.toUpperCase(),hint:`Pensa alla categoria di ${w.en}: ${w.cat}.`});
    const intruder=NS.pick(others.filter(x=>x.cat!==w.cat)),group=NS.shuffle([w,mate,...same.filter(x=>x.en!==mate.en).slice(0,2),intruder]);
    return finish(50,level,{word:w,prompt:'Find the odd word out',sub:'Four words belong together; one does not.',options:group.map(x=>({label:x.en.toUpperCase(),value:x.en})),answer:intruder.en,answerLabel:intruder.en.toUpperCase(),hint:'Traduci tutte le parole e cerca quella di categoria diversa.'});
  }

  Object.assign(NS.MathGames,{31:qCountChoose,36:qMysteryOperation,39:qFractions,43:qMultiStepProblems});
  Object.assign(NS.VisualGames,{32:qShadow,33:qTwins,35:qColorDomino,37:qDirections,40:qCoordinates,41:qAnalogy,44:qDoubleMatrix,45:qImpossibleTile,49:qMultiRulePattern});
  Object.assign(NS.EnglishGames,{34:qFirstEnglish,38:qEnglishMemory,42:qEnglishCategories,46:qSentenceOrder,50:qEnglishLogic});
  Object.assign(NS.VisualGames,{47:qConditions,48:qConstrainedPaths});

  // Every generator, old and new, is normalized through the same 15-step
  // difficulty contract. Tests verify that the score strictly increases L1→L15.
  for(const registry of [NS.MathGames,NS.VisualGames,NS.EnglishGames]){
    for(const [id,fn] of Object.entries(registry)){
      if(fn._progressWrapped)continue;
      const wrapped=function(level,state){return NS.attachDifficulty(fn(level,state),Number(id),level);};
      wrapped._progressWrapped=true;
      registry[id]=wrapped;
    }
  }
})(window.LogicLand);
