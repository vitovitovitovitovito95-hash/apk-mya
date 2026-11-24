'use strict';
(function(NS){
  function distractWords(word,count=3){
    const sameBand=NS.WORDS.filter(x=>x.id!==word.id&&x.lvl<=Math.max(2,word.lvl+1));
    return NS.shuffle(sameBand).slice(0,count);
  }

  // Prefer bundled MP3 playback over Android TTS: both the S24 and Android 6
  // can lack a usable English voice even when Android TTS reports success.
  let playingAudio=null;
  let playbackSerial=0;
  const BASE_AUDIO='audio/';

  function ttsFallback(text,lang){
    try{
      if((lang||'en-GB').indexOf('en')===0 && window.LLKAndroid && typeof window.LLKAndroid.speak==='function'){
        if(window.LLKAndroid.speak(String(text)))return true;
      }
    }catch(_ignore){}
    try{
      if(!('speechSynthesis' in window))return false;
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang=lang||'en-GB';
      utterance.rate=(lang||'en-GB').indexOf('it')===0?.88:.76;
      window.speechSynthesis.speak(utterance);
      return true;
    }catch(_ignore){return false;}
  }

  NS.stopEnglishAudio=function(){
    playbackSerial++;
    if(playingAudio){
      try{playingAudio.pause();playingAudio.removeAttribute('src');playingAudio.load();}catch(_ignore){}
      playingAudio=null;
    }
  };

  function audioFiles(text,lang){
    const l=(lang||'en-GB').toLowerCase(),keyLang=l.indexOf('it')===0?'it':l.indexOf('es')===0?'es':'en';
    const index=NS.AUDIO_INDEX||{};
    const norm=String(text||'').trim().toLowerCase();
    const direct=index[keyLang+'|'+norm];
    if(direct)return [BASE_AUDIO+direct];
    // Sentences composed dynamically, and lists of words at high levels:
    // concatenate the prerecorded word pronunciation files.
    if(keyLang==='en'||keyLang==='es'){const dot=index[keyLang+'|'+norm+'.'];if(dot)return [BASE_AUDIO+dot];}
    const parts=norm.match(/[a-zà-ÿñ]+(?:['’][a-zà-ÿ]+)?/g)||[];
    const files=[];
    for(let i=0;i<parts.length;i++){
      const f=index[keyLang+'|'+parts[i]];
      if(f)files.push(BASE_AUDIO+f);
    }
    return files;
  }

  NS.speakLine=function(text,lang,slow){
    if(!text)return false;
    NS.lastSpoken=[text,lang];
    NS.stopEnglishAudio();
    const serial=playbackSerial;
    const files=audioFiles(text,lang);
    if(!files.length){
      if(!ttsFallback(text,lang)&&NS.toast)NS.toast('Audio non disponibile: prova a riavviare l’app.');
      return false;
    }
    let i=0;
    function playNext(){
      if(serial!==playbackSerial)return;
      if(i>=files.length){playingAudio=null;return;}
      const audio=new Audio();
      playingAudio=audio;
      audio.preload='auto';
      audio.onended=function(){if(serial===playbackSerial){i++;playNext();}};
      audio.onerror=function(){
        if(serial!==playbackSerial)return;
        playingAudio=null;
        if(!ttsFallback(text,lang)&&NS.toast)NS.toast('Audio non disponibile su questo dispositivo.');
      };
      audio.src=files[i];
      try{audio.playbackRate=slow?0.72:1;if('preservesPitch' in audio)audio.preservesPitch=true;}catch(_r){}
      try{
        const result=audio.play();
        if(result&&typeof result.catch==='function'){
          result.catch(function(){
            if(serial!==playbackSerial)return;
            playingAudio=null;
            if(!ttsFallback(text,lang)&&NS.toast)NS.toast('Tocca nuovamente 🔊 per ascoltare.');
          });
        }
      }catch(_error){
        if(serial!==playbackSerial)return;
        if(!ttsFallback(text,lang)&&NS.toast)NS.toast('Audio non disponibile su questo dispositivo.');
      }
    }
    playNext();
    return true;
  };
  NS.speak=NS.speakLine;
  NS.speakSlow=function(){if(NS.lastSpoken)NS.speakLine(NS.lastSpoken[0],NS.lastSpoken[1],true);};

  function soundBtn(text,lang,label){
    return `<button class="speak" aria-label="${label||'Ascolta'}" onclick="LogicLand.speakLine('${NS.escapeHtml(text)}','${lang||'en-GB'}')">🔊 ${label||'Audio'}</button>`;
  }

  function qPicture(level,state){
    const w=NS.selectEnglishWord(state,level),reverse=level>=9&&NS.rnd(0,2)===0,others=distractWords(w,Math.min(5,NS.levelProfile(level).choices));
    if(reverse){
      const opts=NS.shuffle([w,...others]).slice(0,NS.levelProfile(level).choices).map(x=>({label:`${x.emoji}<br><small>${x.it}</small>`,value:x.en}));
      return {word:w,prompt:`Quale immagine significa “${w.en.toUpperCase()}”?`,sub:`Livello parola: ${w.cefr||'A1'}`,custom:soundBtn(w.en,'en-GB','Ascolta la parola'),options:opts,answer:w.en,answerLabel:`${w.en.toUpperCase()} = ${w.it}`,hint:`Pensa alla categoria: ${w.cat}.`};
    }
    const opts=NS.shuffle([w,...others]).slice(0,NS.levelProfile(level).choices).map(x=>({label:x.en.toUpperCase(),value:x.en}));
    return {word:w,prompt:`Come si dice ${w.emoji} in inglese?`,sub:`In italiano: ${w.it} • livello ${w.cefr||'A1'}`,custom:soundBtn(w.en,'en-GB','Ascolta la parola'),options:opts,answer:w.en,answerLabel:w.en.toUpperCase(),hint:`La parola comincia con “${w.en[0].toUpperCase()}”.`};
  }

  function qListen(level,state){
    const w=NS.selectEnglishWord(state,level),others=distractWords(w,Math.min(5,NS.levelProfile(level).choices)),advanced=level>=10&&NS.rnd(0,1)===1;
    const base=[w,...others].slice(0,NS.levelProfile(level).choices);
    const opts=advanced?NS.shuffle(base).map(x=>({label:x.en.toUpperCase(),value:x.en})):NS.shuffle(base).map(x=>({label:`${x.emoji}<br><small>${x.it}</small>`,value:x.en}));
    return {word:w,prompt:advanced?'Ascolta e riconosci la parola scritta':'Ascolta la parola inglese',sub:'Tocca l’altoparlante e scegli la risposta corretta.',custom:soundBtn(w.en,'en-GB','Ascolta'),options:opts,answer:w.en,answerLabel:`${w.en.toUpperCase()} = ${w.it}`,hint:'Puoi ascoltarla più volte.',afterRender:()=>setTimeout(()=>NS.speakLine(w.en,'en-GB'),300)};
  }

  function qBuildWord(level,state){
    const w=NS.selectEnglishWord(state,level),answer=w.en.toUpperCase(),letters=NS.shuffle(answer.replaceAll(' ','').split('')),id='bw_'+Math.random().toString(36).slice(2),showItalian=level<11;
    return {word:w,prompt:`Costruisci la parola ${w.emoji}`,sub:showItalian?`In italiano: ${w.it}`:`Indizio: categoria “${w.cat}” • ${w.cefr||'A1'}`,
      visual:`<div class="wordline" id="${id}_out">_</div><div class="letters">${letters.map((ch,i)=>`<button class="letter" id="${id}_${i}" onclick="LogicLand.addLetter('${id}',${i},'${NS.escapeHtml(ch)}')">${NS.escapeHtml(ch)}</button>`).join('')}</div><button class="secondary" onclick="LogicLand.clearWord('${id}')">↺ Ricomincia</button>`,
      custom:`${soundBtn(w.en,'en-GB','Ascolta la parola')}<button class="nextBtn" style="max-width:280px;margin:10px auto 0" onclick="LogicLand.submitWord('${id}')">Controlla parola</button>`,options:null,answer:answer.replaceAll(' ',''),answerLabel:answer,hint:`La parola ha ${answer.replaceAll(' ','').length} lettere.`,afterRender:()=>{NS.wordBuffers[id]='';}};
  }

  function qTranslate(level,state){
    const w=NS.selectEnglishWord(state,level),others=distractWords(w,Math.min(5,NS.levelProfile(level).choices)),reverse=level>=8&&NS.rnd(0,1)===1;
    if(reverse){const opts=NS.shuffle([w,...others]).slice(0,NS.levelProfile(level).choices).map(x=>({label:x.it.toUpperCase(),value:x.en}));return {word:w,prompt:`Cosa significa “${w.en.toUpperCase()}”?`,visual:`<div class="bigVisual">${w.emoji}</div>`,custom:soundBtn(w.en,'en-GB','Ascolta la parola'),options:opts,answer:w.en,answerLabel:w.it.toUpperCase(),hint:'Collega la parola alla sua immagine e categoria.'};}
    const opts=NS.shuffle([w,...others]).slice(0,NS.levelProfile(level).choices).map(x=>({label:x.en.toUpperCase(),value:x.en}));
    return {word:w,prompt:`Traduci: “${w.it}”`,visual:`<div class="bigVisual">${w.emoji}</div>`,custom:soundBtn(w.it,'it-IT','Ascolta in italiano'),options:opts,answer:w.en,answerLabel:w.en.toUpperCase(),hint:'Pensa alla parola già incontrata nei giochi precedenti.'};
  }

  function qSentence(level,state){
    const sentenceLevel=Math.min(8,Math.max(1,NS.levelBand(level))),pool=NS.SENTENCES.filter(x=>x.lvl<=sentenceLevel),useDynamic=level>=11&&NS.rnd(0,1)===1;
    if(useDynamic){
      const w=NS.selectEnglishWord(state,level),wrong=distractWords(w,5).map(x=>x.en),templates=[`I can see a ___ .`,`This is my ___ .`,`I like the ___ .`,`Where is the ___ ?`,`I use my ___ at school.`,`We go to the ___ at the weekend.`],s=NS.pick(templates);
      return {word:w,prompt:'Completa la frase',visual:`<div class="bigVisual sentenceVisual">${NS.escapeHtml(s)}</div>`,sub:`Parola da usare: ${w.it} ${w.emoji} • ${w.cefr||'A1'}`,custom:soundBtn(s.replace('___',w.en),'en-GB','Ascolta la frase'),options:NS.uniqueOptions(w.en,wrong,NS.levelProfile(level).choices),answer:w.en,answerLabel:w.en.toUpperCase(),hint:`Inserisci la parola inglese per “${w.it}”.`};
    }
    const item=NS.pick(pool),w=NS.WORDS.find(x=>x.en===item.a)||NS.selectEnglishWord(state,level),wrong=distractWords(w,5).map(x=>x.en);
    return {word:w,prompt:'Completa la frase',visual:`<div class="bigVisual sentenceVisual">${NS.escapeHtml(item.s)}</div>`,sub:`${item.it} • livello ${w.cefr||'A1'}`,custom:soundBtn(item.s.replace('___', item.a),'en-GB','Ascolta la frase'),options:NS.uniqueOptions(item.a,wrong,NS.levelProfile(level).choices),answer:item.a,answerLabel:item.a.toUpperCase(),hint:`La frase parla di “${w.it}”.`};
  }

  NS.wordBuffers={};
  NS.addLetter=function(id,index,ch){if(NS.isLocked?.())return;const b=document.getElementById(`${id}_${index}`);if(!b||b.disabled)return;b.disabled=true;b.style.opacity=.35;NS.wordBuffers[id]=(NS.wordBuffers[id]||'')+ch;const out=document.getElementById(`${id}_out`);if(out)out.textContent=NS.wordBuffers[id]||'_';};
  NS.clearWord=function(id){if(NS.isLocked?.())return;NS.wordBuffers[id]='';const out=document.getElementById(`${id}_out`);if(out)out.textContent='_';document.querySelectorAll(`[id^="${id}_"]`).forEach(el=>{if(el.tagName==='BUTTON'){el.disabled=false;el.style.opacity=1;}});};
  NS.submitWord=function(id){if(NS.submitCustomAnswer)NS.submitCustomAnswer(NS.wordBuffers[id]||'');};

  NS.EnglishGames={16:qPicture,17:qListen,18:qBuildWord,19:qTranslate,20:qSentence};
})(window.LogicLand);
