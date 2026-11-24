'use strict';
/* v9.2 — Lingue: inglese (16, 34) e spagnolo (60, 61) con la stessa scala in 15 livelli.
   Ogni livello cambia il TIPO di esercizio o toglie un aiuto (italiano, immagine, testo scritto):
   leggere → ascoltare → solo ascolto; parola → frase → significato della frase.
   Le parole di ogni livello appartengono a una fascia di vocabolario nuova (15 fasce). */
(function(NS){
  const rnd=(a,b)=>NS.rnd(a,b), pick=a=>NS.pick(a), sh=a=>NS.shuffle(a);
  const CH=[3,3,3,4,4,4,4,5,5,5,5,6,6,6,6],nc=l=>CH[l-1];
  const CAT={animals:'animali',food:'cibo',colors:'colori',nature:'natura',home:'casa',school:'scuola',family:'famiglia',numbers:'numeri',body:'corpo',clothes:'vestiti',actions:'azioni',feelings:'emozioni',places:'luoghi',time:'tempo',transport:'trasporti'};
  const L={
    en:{voice:'en-GB',name:'inglese',flag:'🇬🇧',w:x=>x.en,list:()=>NS.WORDS,sent:()=>NS.SENTENCES,fill:(s,w)=>s.s.replace('___',w.en)},
    es:{voice:'es-ES',name:'spagnolo',flag:'🇪🇸',w:x=>x.es,list:()=>NS.WORDS_ES,sent:()=>NS.SENTENCES_ES,fill:(s,w)=>s.s.replace('___',NS.esBare(w))}
  };
  function tier(lang,l){
    const C=L[lang],ranked=C.list().slice().sort((a,b)=>a.lvl-b.lvl||C.w(a).length-C.w(b).length||C.w(a).localeCompare(C.w(b)));
    const lo=Math.floor((l-1)*ranked.length/15),hi=Math.floor(l*ranked.length/15);
    return ranked.slice(lo,Math.max(lo+1,hi));
  }
  function q(id,l,question,metric){
    const o=NS.attachDifficulty(question,id,l);
    o.meta.age6=true;o.meta.age6Load=NS.AGE6_DIFFICULTY[l-1].load;o.meta.age6Metrics=metric;o.meta.v92=true;
    return o;
  }
  function audioBtns(text,voice,hideText){
    const t=NS.jsArg?NS.jsArg(text):NS.escapeHtml(text);
    return '<div class="speakRow"><button class="speak big" onclick="LogicLand.speakLine(\''+t+'\',\''+voice+'\')">🔊 '+(hideText?'Ascolta':'Ascolta')+'</button><button class="speak slow" onclick="LogicLand.speakSlow()">🐢 Lento</button></div>';
  }
  // distrattori: stessa categoria a livelli alti (più difficile), parole “vicine” nel vocabolario
  // Parole senza un'immagine chiara (ieri/oggi/domani…, colori resi male dagli emoji su Android 6):
  // non vengono usate nelle modalità in cui si sceglie un'IMMAGINE.
  const NOPIC={gold:1,silver:1,grey:1,pink:1};
  const picOk=x=>x.cat!=='time'&&!NOPIC[x.en];
  function others(lang,word,l,count,pic){
    const C=L[lang],all=C.list().filter(x=>C.w(x)!==C.w(word)&&x.emoji!==word.emoji&&(!pic||picOk(x)));
    const same=sh(all.filter(x=>x.cat===word.cat)),near=sh(all.filter(x=>x.cat!==word.cat&&Math.abs(x.lvl-word.lvl)<=1)),rest=sh(all);
    const order=l>=6?same.concat(near,rest):near.concat(same,rest),out=[],seen={};
    seen[C.w(word)]=1;seen['e'+word.emoji]=1;seen['i'+word.it]=1;
    for(const x of order){if(out.length>=count)break;if(seen[C.w(x)]||seen['e'+x.emoji]||seen['i'+x.it])continue;seen[C.w(x)]=1;seen['e'+x.emoji]=1;seen['i'+x.it]=1;out.push(x);}
    return out;
  }
  function choose(lang,l,state,pic){
    let t=tier(lang,l);if(pic&&t.some(picOk))t=t.filter(picOk);
    const due=lang==='en'?t.filter(w=>{const s=state&&state.english&&state.english.words&&state.english.words[w.en];return s&&s.wrong>0&&s.due<=Date.now();}):[];
    return pick(due.length&&rnd(0,2)?due:t);
  }

  /* --- 16 / 60: Abbina parola e immagine --- */
  const MODES_A=[
    ['it2w','Italiano + immagine → scegli la parola'],['it2w','Italiano + immagine → scegli la parola'],['it2w','Italiano + immagine → scegli la parola'],
    ['img2w','Solo immagine → scegli la parola'],['img2w','Solo immagine → scegli la parola'],
    ['w2img','Parola scritta + audio → scegli l’immagine'],['w2img','Parola scritta + audio → scegli l’immagine'],['w2img','Parola scritta + audio → scegli l’immagine'],
    ['wonly2img','Solo parola scritta (senza audio) → immagine'],['wonly2img','Solo parola scritta (senza audio) → immagine'],
    ['ear2img','SOLO ASCOLTO → scegli l’immagine'],['ear2img','SOLO ASCOLTO → scegli l’immagine'],['ear2img','SOLO ASCOLTO → scegli l’immagine'],
    ['ear2it','SOLO ASCOLTO → scegli il significato in italiano'],['ear2it','SOLO ASCOLTO → scegli il significato in italiano']
  ];
  function match(lang,id){
    return function(l,state){
      const mode=MODES_A[l-1][0],pic=mode!=='it2w'&&mode!=='ear2it',C=L[lang],w=choose(lang,l,state,pic),ws=[w].concat(others(lang,w,l,nc(l)-1,pic)),txt=C.w(w);
      let prompt,sub='',opts,custom='',auto=null;
      if(mode==='it2w'){prompt='Come si dice in '+C.name+'?';sub='<span class="bigEmoji">'+w.emoji+'</span> '+w.it;opts=ws.map(x=>({label:C.w(x).toUpperCase(),value:C.w(x)}));}
      else if(mode==='img2w'){prompt='Come si dice in '+C.name+'?';sub='<span class="bigEmoji">'+w.emoji+'</span>';opts=ws.map(x=>({label:C.w(x).toUpperCase(),value:C.w(x)}));}
      else if(mode==='w2img'){prompt='Quale immagine è “'+txt.toUpperCase()+'”?';custom=audioBtns(txt,C.voice);auto=[txt,C.voice];opts=ws.map(x=>({label:'<span class="optEmoji">'+x.emoji+'</span>',value:C.w(x)}));}
      else if(mode==='wonly2img'){prompt='Quale immagine è “'+txt.toUpperCase()+'”?';sub='Senza audio: leggi la parola.';opts=ws.map(x=>({label:'<span class="optEmoji">'+x.emoji+'</span>',value:C.w(x)}));}
      else if(mode==='ear2img'){prompt='👂 Ascolta e tocca l’immagine giusta';custom=audioBtns(txt,C.voice,true);auto=[txt,C.voice];opts=ws.map(x=>({label:'<span class="optEmoji">'+x.emoji+'</span>',value:C.w(x)}));}
      else{prompt='👂 Ascolta: che cosa significa?';custom=audioBtns(txt,C.voice,true);auto=[txt,C.voice];opts=ws.map(x=>({label:x.it.toUpperCase(),value:C.w(x)}));}
      const o=q(id,l,{word:w,prompt:prompt,sub:sub,custom:custom,options:sh(opts),answer:txt,answerLabel:txt.toUpperCase()+' = '+w.it+' '+w.emoji,hint:l<=5?'Ricorda la prima lettera della parola.':l<=10?'Pensa alla categoria: '+CAT[w.cat]+'.':'Ascolta di nuovo, anche con 🐢 Lento.'},
        {vocabularyMinBand:l,alternatives:opts.length,mode:mode,rank:[['it2w','img2w','w2img','wonly2img','ear2img','ear2it'].indexOf(mode),l]});
      o.autoSpeak=auto;o.sayAfter=[txt,C.voice];o.lang=lang;
      return o;
    };
  }

  /* --- 34 / 61: Parole, frasi, categorie e ascolto --- */
  const MODES_B=[
    ['w2it','Leggi e ascolta → significato'],['w2it','Leggi e ascolta → significato'],['w2it','Leggi e ascolta → significato'],
    ['it2w','Dall’italiano → scrivi la parola giusta (parole simili)'],['it2w','Dall’italiano → parola giusta (parole simili)'],
    ['fill','Completa la frase'],['fill','Completa la frase (frasi più lunghe)'],['fill','Completa la frase (frasi difficili)'],
    ['odd','Quale parola NON è del gruppo? (con categoria)'],['odd','Quale parola NON è del gruppo? (con categoria)'],['oddNoCat','Quale parola NON è del gruppo? (trova tu la categoria)'],
    ['ear2w','SOLO ASCOLTO → scegli la parola scritta'],['ear2w','SOLO ASCOLTO → scegli la parola scritta'],
    ['earSent','SOLO ASCOLTO di una frase → significato'],['earSent','SOLO ASCOLTO di frasi lunghe → significato']
  ];
  function words(lang,id){
    return function(l,state){
      const C=L[lang],mode=MODES_B[l-1][0];let w=choose(lang,l,state),prompt,sub='',opts,answer,label,custom='',auto=null,say=null,meta={};
      if(mode==='w2it'){const ws=[w].concat(others(lang,w,l,nc(l)-1));answer=C.w(w);prompt='Che cosa significa “'+answer.toUpperCase()+'”?';custom=audioBtns(answer,C.voice);auto=[answer,C.voice];opts=ws.map(x=>({label:x.it.toUpperCase(),value:C.w(x)}));label=answer.toUpperCase()+' = '+w.it;}
      else if(mode==='it2w'){answer=C.w(w);const all=C.list().filter(x=>C.w(x)!==answer),first=answer.replace(/^(el|la|los|las) /,'')[0];
        const look=sh(all.filter(x=>C.w(x).replace(/^(el|la|los|las) /,'')[0]===first)).concat(others(lang,w,l,8));const ws=[w];look.forEach(x=>{if(ws.length<nc(l)&&ws.indexOf(x)<0)ws.push(x);});
        prompt='Come si dice “'+w.it.toUpperCase()+'”?';sub='Attenzione: molte parole iniziano con la stessa lettera.';opts=ws.map(x=>({label:C.w(x).toUpperCase(),value:C.w(x)}));label=answer.toUpperCase();say=[answer,C.voice];}
      else if(mode==='fill'||mode==='earSent'){
        const maxL=mode==='fill'?[3,5,8][l-6]:l===14?5:8,minL=mode==='fill'?[1,3,5][l-6]:l===14?1:5;
        let pool=C.sent().filter(s=>s.lvl>=minL&&s.lvl<=maxL);if(!pool.length)pool=C.sent();
        const s=pick(pool),sw=C.list().filter(x=>x.en===s.a)[0];w=sw;meta.sentence=1;
        if(mode==='fill'){answer=lang==='es'?NS.esBare(sw):sw.en;const ws=[sw].concat(others(lang,sw,l,nc(l)+4));
          prompt='Completa la frase';sub='<span class="sentence">'+NS.escapeHtml(s.s).replace('___','<b class="seqHole">___</b>')+'</span><br><small>'+s.it+'</small>';
          opts=ws.map(x=>{const v=lang==='es'?NS.esBare(x):x.en;return {label:v.toUpperCase(),value:v};}).filter((o,i,a)=>a.findIndex(z=>z.value===o.value)===i).slice(0,nc(l));label=answer.toUpperCase();say=[C.fill(s,sw),C.voice];}
        else{const full=C.fill(s,sw);answer=s.it;const its=sh(C.sent().filter(x=>x.it!==s.it)).slice(0,nc(l)-1).map(x=>x.it);
          prompt='👂 Ascolta la frase: che cosa significa?';custom=audioBtns(full,C.voice,true);auto=[full,C.voice];opts=[s.it].concat(its).map(v=>({label:v,value:v}));label=s.it;say=[full,C.voice];}
      }
      else if(mode==='odd'||mode==='oddNoCat'){
        let group=sh(C.list().filter(x=>x.cat===w.cat&&x!==w)).slice(0,nc(l)-2).concat([w]);
        const intr=pick(C.list().filter(x=>x.cat!==w.cat&&Math.abs(x.lvl-w.lvl)<=2));answer=C.w(intr);
        prompt='Quale parola NON appartiene al gruppo?';sub=mode==='odd'?'Gruppo: '+CAT[w.cat]:'Trova tu che cosa hanno in comune le altre.';
        opts=group.concat([intr]).map(x=>({label:C.w(x).toUpperCase(),value:C.w(x)}));label=answer.toUpperCase()+' ('+intr.it+')';w=intr;say=[answer,C.voice];}
      else{answer=C.w(w);const ws=[w].concat(others(lang,w,l,nc(l)-1));prompt='👂 Ascolta e scegli la parola scritta';custom=audioBtns(answer,C.voice,true);auto=[answer,C.voice];opts=ws.map(x=>({label:C.w(x).toUpperCase(),value:C.w(x)}));label=answer.toUpperCase()+' = '+w.it;}
      opts=opts.filter((o,i,a)=>a.findIndex(z=>z.value===o.value)===i);
      const o=q(id,l,{word:w,prompt:prompt,sub:sub,custom:custom,options:sh(opts),answer:answer,answerLabel:label,hint:mode==='fill'?'Leggi la traduzione italiana sotto la frase.':mode.indexOf('ear')===0?'Usa 🐢 Lento per sentire meglio.':'Pensa al significato di ogni parola.'},
        Object.assign({vocabularyMinBand:l,alternatives:opts.length,mode:mode,rank:[['w2it','it2w','fill','odd','oddNoCat','ear2w','earSent'].indexOf(mode),l],tierFree:(meta.sentence||mode==='odd'||mode==='oddNoCat')?1:0},meta));
      o.autoSpeak=auto;o.sayAfter=say||[C.w(w),C.voice];o.lang=lang;
      return o;
    };
  }
  NS.LEVEL_INFO[16]=MODES_A.map((m,i)=>'Vocabolario fascia '+(i+1)+'/15 · '+m[1]+' · '+CH[i]+' risposte');
  NS.LEVEL_INFO[60]=NS.LEVEL_INFO[16].slice();
  NS.LEVEL_INFO[34]=MODES_B.map((m,i)=>'Fascia '+(i+1)+'/15 · '+m[1]+' · '+CH[i]+' risposte');
  NS.LEVEL_INFO[61]=NS.LEVEL_INFO[34].slice();
  NS.EnglishGames[16]=match('en',16);NS.EnglishGames[34]=words('en',34);
  NS.EnglishGames[60]=match('es',60);NS.EnglishGames[61]=words('es',61);
  NS.V92Lang={tier:tier,MODES_A:MODES_A,MODES_B:MODES_B};
})(window.LogicLand);
