'use strict';
(function(NS){
  let state=NS.loadState();
  let selectedCategory='Tutti';
  let current=null,round=0,score=0,lives=NS.STARTING_LIVES,question=null,locked=false,selectedAge=NS.clamp(Number(state.profile.age)||6,NS.MIN_AGE,NS.MAX_AGE);

  NS.isLocked=()=>locked;
  NS.submitCustomAnswer=value=>answer(value);
  NS.toast=toast;

  function save(){NS.saveState(state);}
  function gameState(id){return state.games[id]||{level:1,wins:0,best:0,correct:0,wrong:0};}

  function beep(ok=true){
    if(!state.settings.sound)return;
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=ok?660:190;g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.09);}catch(_e){}
  }

  function topbar(){return `<div class="top"><div class="toprow"><div class="avatar">${NS.escapeHtml(state.profile.avatar||'🦊')}</div><div class="brand">LogicLand <small>GIOCA • PENSA • IMPARA</small></div><div class="pill">⭐ ${state.economy.stars}</div><div class="pill">🪙 ${state.economy.coins}</div></div></div>`;}

  function dailyMissionHtml(){
    NS.ensureDaily(state);const d=state.daily,games=Math.min(3,d.gamesCompleted),eng=Math.min(5,d.englishCorrect),done=games>=3&&eng>=5;
    if(done&&!d.claimed){d.claimed=true;state.economy.coins+=20;state.economy.stars+=2;save();setTimeout(()=>toast('Missione giornaliera completata: +2 ⭐ e +20 🪙'),250);}
    return `<div class="daily ${done?'done':''}">${done?'✅':'🎯'} Missione di oggi: giochi ${games}/3 • parole inglesi ${eng}/5${done?' • completata!':''}</div>`;
  }

  const iconMap={1:'math',5:'sudoku',7:'odd',8:'matrix',9:'matrix',11:'puzzle',14:'memory',16:'english',21:'puzzle',31:'count',32:'odd',33:'memory',34:'english',35:'matrix',51:'tetris',52:'dodge',53:'unblock',54:'dots',55:'water',56:'checkers',57:'chess'};
  function cardImage(g){return `<img class="gameArtwork" src="img/${iconMap[g.id]||'puzzle'}.webp" alt="" loading="lazy">`;}
  function gameCard(g){
    const s=gameState(g.id),pct=Math.floor((Math.max(1,s.level)-1)/NS.MAX_LEVEL*100);
    return `<button class="card gameTile" onclick="LogicLand.startGame(${g.id})">${cardImage(g)}<div class="gameTileCopy"><h3>${NS.escapeHtml(g.name)}</h3><p>${NS.escapeHtml(g.desc)}</p><div class="gameTileProgress"><span>Livello ${s.level} / ${NS.MAX_LEVEL}</span><span>⭐ ${Math.min(3,s.best||0)}</span></div><div class="miniTrack"><i style="width:${pct}%"></i></div></div></button>`;
  }
  function selectCategory(category){selectedCategory=category;renderHome();}
  function renderHome(ageOverride){
    NS.stopEnglishAudio?.();
    NS.stopArcade?.();NS.stopPuzzle?.();current=null;NS.ensureDaily(state);
    save();
    const name=NS.escapeHtml(state.profile.name||'Esploratrice'),games=NS.GAMES;
    const categories=[['Tutti','Tutti'],['Logica','logic'],['Figure','visual'],['Numeri','math'],['Inglese','english'],['Abilità','arcade']];
    const visible=selectedCategory==='Tutti'?games:games.filter(g=>g.world===selectedCategory);
    const tabs=categories.map(c=>`<button class="categoryTab ${selectedCategory===c[1]?'active':''}" onclick="LogicLand.selectCategory('${c[1]}')">${c[0]}</button>`).join('');
    document.getElementById('app').innerHTML=topbar()+`<div class="wrap newHome"><section class="hero newHero"><h1>Ciao, ${name}! 🌈</h1><p>Esplora i mondi di LogicLand: scegli un gioco e continua la tua avventura!</p>${dailyMissionHtml()}</section><div class="homeHeading"><h2>🎲 Scegli il tuo gioco</h2><span>${games.length} giochi · 15 livelli ciascuno</span></div><div class="categoryTabs">${tabs}</div><div class="grid gameGallery">${visible.map(gameCard).join('')}</div><div class="nav"><button class="secondary" style="flex:1" onclick="LogicLand.renderParents()">👨‍👩‍👧 Zona genitori</button><button class="secondary" onclick="LogicLand.about()">ℹ️</button></div></div>`;
  }

  function selectAge(age){selectedAge=NS.clamp(Number(age),NS.MIN_AGE,NS.MAX_AGE);renderHome(selectedAge);}

  function lifeHtml(){
    return `<span class="lives" id="lifeCounter" aria-label="Vite">${Array.from({length:NS.STARTING_LIVES},(_,i)=>i<lives?'❤️':'🖤').join('')}</span>`;
  }

  function updateLivesUI(){
    const e=document.getElementById('lifeCounter');
    if(e)e.innerHTML=Array.from({length:NS.STARTING_LIVES},(_,i)=>i<lives?'❤️':'🖤').join('');
  }

  function gameShell(body,progressOverride=null){
    const st=gameState(current.id),pct=progressOverride===null?Math.min(100,round/NS.QUESTIONS_PER_LEVEL*100):NS.clamp(progressOverride,0,100);
    document.getElementById('app').innerHTML=topbar()+`<div class="wrap"><div class="gameHead"><button class="back" onclick="LogicLand.renderHome(${selectedAge})">←</button><div class="gameTitle"><h2>${current.icon} ${NS.escapeHtml(current.name)}</h2><div>Livello ${st.level}/${NS.MAX_LEVEL} • ${NS.escapeHtml(current.group)}<br><small>${NS.difficultyLabel(st.level)}</small></div></div><div class="gameStatus">${lifeHtml()}<span class="badge">${current.arcade?'L'+st.level:score+'/'+NS.QUESTIONS_PER_LEVEL+' ✓'}</span></div></div><div class="progress"><i id="levelProgress" style="width:${pct}%"></i></div>${body}</div>`;
  }

  function makeQuestion(id,level){const fn=NS.MathGames[id]||NS.VisualGames[id]||NS.EnglishGames[id];if(!fn)throw new Error(`Generatore mancante per gioco ${id}`);return fn(level,state);}

  function renderQuestion(x){
    const opts=x.options?`<div class="options">${x.options.map(o=>{const value=o&&typeof o==='object'?(o.value??o.label):o;const label=o&&typeof o==='object'?(o.label??o.value):o;return `<button class="opt" data-value="${NS.escapeHtml(value)}" onclick="LogicLand.answer(this)">${label}</button>`;}).join('')}</div>`:'';
    gameShell(`<div class="question"><div class="qicon">${x.icon||current.icon}</div><h3>${x.prompt}</h3>${x.sub?`<p>${x.sub}</p>`:''}${x.visual||''}${x.custom||''}</div>${opts}<div id="feedback"></div>`);if(x.afterRender)setTimeout(x.afterRender,50);
  }

  function startGame(id){
    NS.stopEnglishAudio?.();
    NS.stopArcade?.();
    current=NS.GAMES.find(g=>g.id===Number(id));if(!current)return;
    selectedAge=current.age;round=0;score=0;lives=NS.STARTING_LIVES;locked=false;
    if(current.arcade)return startArcadeLevel();
    nextQuestion();
  }

  function nextQuestion(){
    if(round>=NS.QUESTIONS_PER_LEVEL)return finishLevel();
    locked=false;question=makeQuestion(current.id,gameState(current.id).level);renderQuestion(question);
  }

  function registerMistake(message){
    const gs=gameState(current.id);
    lives--;state.totals.wrong++;gs.wrong++;state.economy.streak=0;gs.lastPlayed=new Date().toISOString();save();updateLivesUI();
    if(lives<=0){setTimeout(()=>failLevel(message||'Hai esaurito le vite.'),180);return false;}
    toast(`${message||'Errore'} Ti restano ${lives} ${lives===1?'vita':'vite'} ❤️`);return true;
  }

  function answer(source){
    if(locked)return;const value=source?.dataset?.value??source,ok=String(value)===String(question.answer);locked=true;
    document.querySelectorAll('.opt').forEach(b=>{if(String(b.dataset.value)===String(question.answer))b.classList.add('correct');});if(source&&source.classList&&!ok)source.classList.add('wrong');
    const gs=gameState(current.id);
    if(ok){score++;state.totals.correct++;gs.correct++;state.economy.streak++;state.economy.coins+=2+(gs.level>7?1:0);state.economy.xp+=10;if(current.eng&&question.word)NS.recordEnglishResult(state,question.word,true);beep(true);gs.lastPlayed=new Date().toISOString();save();}
    else{
      if(current.eng&&question.word)NS.recordEnglishResult(state,question.word,false);beep(false);
      const keepGoing=registerMistake('Risposta sbagliata.');
      if(!keepGoing)return;
    }
    const feedback=document.getElementById('feedback'),right=question.answerLabel||NS.escapeHtml(question.answer),hint=state.settings.hints?(question.hint||'Osserva la regola e prova un passo alla volta.'):'Riprova nella prossima sfida.';
    feedback.innerHTML=`<div class="feedback ${ok?'good':'bad'}">${ok?'🌟 Perfetto! Ottimo ragionamento.':'💪 Attenzione: la risposta giusta è '+right}<div class="hint">${ok?(state.economy.streak>=3?'Serie di '+state.economy.streak+' risposte corrette! 🔥':'Continua così!'):hint+` Hai ancora ${lives} ${lives===1?'vita':'vite'}.`}</div></div><button class="nextBtn" onclick="LogicLand.advance()">${round===NS.QUESTIONS_PER_LEVEL-1?'Concludi il livello':'Prossima sfida →'}</button>`;
  }

  function advance(){round++;nextQuestion();}

  function failLevel(reason){
    NS.stopArcade?.();NS.stopPuzzle?.();locked=true;
    const gs=gameState(current.id);state.totals.sessions++;save();
    gameShell(`<div class="question levelWin failLevel"><div class="trophy">💛</div><h2>Livello da riprovare</h2><p>${NS.escapeHtml(reason||'Hai esaurito le tre vite.')} Il livello termina quando vengono consumate tutte e <b>3 le vite</b>.</p><div class="lifeRule">❤️❤️❤️ → ogni errore consuma una vita → a 0 vite si ricomincia</div><button class="nextBtn" onclick="LogicLand.startGame(${current.id})">↺ Riprova livello ${gs.level}</button><button class="secondary" style="width:100%;margin-top:9px" onclick="LogicLand.renderHome(${selectedAge})">Torna al percorso</button></div>`,0);
  }

  function finishLevel(){
    NS.stopArcade?.();NS.stopPuzzle?.();
    const gs=gameState(current.id),old=gs.level,perfect=lives===NS.STARTING_LIVES,earned=perfect?3:2;
    gs.best=Math.max(gs.best||0,earned);gs.wins=(gs.wins||0)+1;state.economy.stars+=earned;state.economy.coins+=5*earned;state.economy.xp+=Math.max(20,score*5);state.totals.sessions++;state.daily.gamesCompleted++;
    if(gs.level<NS.MAX_LEVEL)gs.level++;save();
    const maxed=old>=NS.MAX_LEVEL;
    const mastery=maxed?'Hai completato anche il livello massimo! 🏅':`Hai sbloccato il livello ${gs.level}!`;
    const nextLabel=maxed?'↺ Rigioca livello 15':`Livello successivo ${gs.level} →`;
    gameShell(`<div class="question levelWin"><div class="trophy">${perfect?'🏆':'🎉'}</div><h2>Livello ${old} completato!</h2><p>${current.arcade?'Sfida di abilità superata.':`Hai risolto <b>${score} sfide su ${NS.QUESTIONS_PER_LEVEL}</b>.`} ${mastery}</p><div class="reward"><span>+${earned} ⭐</span><span>+${5*earned} 🪙</span></div><button class="nextBtn nextLevelButton" onclick="LogicLand.startGame(${current.id})">${nextLabel}</button><button class="secondary" style="width:100%;margin-top:9px" onclick="LogicLand.renderHome(${selectedAge})">Torna al percorso</button></div>`,100);
  }

  function startArcadeLevel(){
    const gs=gameState(current.id),profile=NS.arcadeProfile(gs.level),isTetris=current.arcade==='tetris';
    const rules=isTetris
      ?`Completa <b>${profile.tetris.targetLines} righe</b>. Usa i pulsanti per spostare e ruotare i pezzi.`
      :current.arcade==='dodge'?`Supera <b>${profile.dodge.targetObstacles} ostacoli</b>. Tocca il campo o usa SU/GIÙ per muovere la macchia.`
      :`Risolvi la sfida! Ogni livello richiede più ragionamento.`;
    const isBoardPuzzle = !!NS.PuzzleGames?.[current.arcade];
    const intro = isBoardPuzzle ? '<div class="puzzleLifeMini">❤️❤️❤️ • Tre vite per completare il livello</div>' : `<div class="question arcadeIntro"><div class="qicon">${current.icon}</div><h3>${NS.escapeHtml(current.name)} • Livello ${gs.level}</h3><p>${rules}</p><div class="lifeRule">Hai ❤️❤️❤️: ogni errore consuma una vita. A 0 vite il livello termina.</div></div>`;
    gameShell(`${intro}<div id="arcadeMount" class="arcadeMount"></div><div id="arcadeProgressText" class="arcadeProgressText"></div>`,0);
    const starter=NS.ArcadeGames?.[current.arcade]||NS.PuzzleGames?.[current.arcade];
    if(!starter)return failLevel('Modulo arcade non disponibile.');
    starter({level:gs.level,mountId:'arcadeMount',onMistake:(msg)=>registerMistake(msg),onProgress:(fraction,label)=>{const bar=document.getElementById('levelProgress');if(bar)bar.style.width=Math.round(fraction*100)+'%';const t=document.getElementById('arcadeProgressText');if(t)t.textContent=label;},onSuccess:()=>{score=lives===NS.STARTING_LIVES?NS.QUESTIONS_PER_LEVEL:NS.QUESTIONS_PER_LEVEL-1;state.totals.correct++;gs.correct++;beep(true);finishLevel();}});
  }

  function accuracy(correct,wrong){const t=correct+wrong;return t?Math.round(correct/t*100):0;}
  function worldStats(world){const ids=NS.GAMES.filter(g=>g.world===world).map(g=>g.id);let c=0,w=0,lv=0;ids.forEach(id=>{const s=gameState(id);c+=s.correct||0;w+=s.wrong||0;lv+=s.level||1;});return {acc:accuracy(c,w),avg:ids.length?Math.round(lv/ids.length*10)/10:0};}
  function ageStats(age){const ids=NS.GAMES.filter(g=>g.age===age).map(g=>g.id),avg=ids.length?Math.round(ids.reduce((s,id)=>s+gameState(id).level,0)/ids.length*10)/10:0;return {avg,mastered:ids.filter(id=>gameState(id).level>=NS.MAX_LEVEL).length,total:ids.length};}

  function renderParents(){
    const learned=Object.values(state.english.words).filter(x=>(x.box||1)>=4&&(x.correct||0)>=4).length,review=Object.values(state.english.words).filter(x=>(x.wrong||0)>0&&(x.due||0)<=Date.now()).length,acc=accuracy(state.totals.correct,state.totals.wrong),avg=Math.round(NS.GAMES.reduce((s,g)=>s+gameState(g.id).level,0)/NS.GAMES.length*10)/10;
    const worlds=[['Matematica','math'],['Logica','logic'],['Visivo','visual'],['English','english'],['Abilità','arcade']];
    document.getElementById('app').innerHTML=topbar()+`<div class="wrap"><div class="gameHead"><button class="back" onclick="LogicLand.renderHome(${selectedAge})">←</button><div class="gameTitle"><h2>👨‍👩‍👧 Zona genitori</h2><div>Progressi, età, impostazioni e backup</div></div></div>
      <div class="parentCard"><h3>👧 Profilo</h3><div class="setting"><label>Nome mostrato nell’app</label><input id="profileName" maxlength="18" value="${NS.escapeHtml(state.profile.name)}"></div><div class="setting"><label>Età / percorso consigliato</label><select id="profileAge">${Array.from({length:NS.MAX_AGE-NS.MIN_AGE+1},(_,i)=>i+NS.MIN_AGE).map(a=>`<option value="${a}" ${a===Number(state.profile.age)?'selected':''}>${a} anni</option>`).join('')}</select></div><button class="primary" style="width:100%;margin-top:10px" onclick="LogicLand.saveProfile()">Salva profilo</button></div>
      <div class="parentCard"><h3>📊 Progressi</h3><div class="statrow"><span>Precisione generale</span><b>${acc}%</b></div><div class="bar"><i style="width:${acc}%"></i></div><div class="statrow"><span>Livello medio</span><b>${avg}/${NS.MAX_LEVEL}</b></div><div class="statrow"><span>Sessioni completate</span><b>${state.totals.sessions}</b></div><div class="statrow"><span>Parole consolidate</span><b>${learned}</b></div><div class="statrow"><span>Parole da ripassare ora</span><b>${review}</b></div><div class="worldProgress">${worlds.map(([label,key])=>{const x=worldStats(key);return `<div class="worldMini"><b>${label}</b><small>${x.acc}% corrette • liv. ${x.avg}</small></div>`;}).join('')}</div><div class="ageProgress">${Array.from({length:NS.MAX_AGE-NS.MIN_AGE+1},(_,i)=>i+NS.MIN_AGE).map(age=>{const x=ageStats(age);return `<div><b>${age} anni</b><span>liv. medio ${x.avg}/${NS.MAX_LEVEL} • completati ${x.mastered}/${x.total}</span></div>`;}).join('')}</div></div>
      <div class="parentCard"><h3>⚙️ Impostazioni</h3><div class="setting"><label>Suoni</label><input type="checkbox" id="soundSetting" ${state.settings.sound?'checked':''}></div><div class="setting"><label>Mostra suggerimenti</label><input type="checkbox" id="hintSetting" ${state.settings.hints?'checked':''}></div><div class="setting"><label>Rotazione / adattamento tablet</label><span class="tiny">Attiva automaticamente layout portrait / landscape</span></div><button class="secondary" style="width:100%;margin-top:10px" onclick="LogicLand.speakLine('apple','en-GB')">🔊 Prova pronuncia inglese: APPLE</button><button class="primary" style="width:100%;margin-top:10px" onclick="LogicLand.saveSettings()">Salva impostazioni</button></div>
      <div class="parentCard"><h3>💾 Backup per cambio telefono</h3><p class="tiny">Il codice include profilo, tutti i ${NS.GAMES.length} giochi, livelli, stelle, monete, statistiche e progresso dell’inglese. I vecchi backup LLK2/LLK3/LLK4/LLK5 restano importabili.</p><textarea id="backup" class="codebox" placeholder="Qui comparirà il codice di backup"></textarea><div class="footerBtns" style="margin-top:9px"><button class="primary" onclick="LogicLand.makeBackup()">Crea / copia</button><button class="secondary" onclick="LogicLand.restoreBackup()">Ripristina</button></div></div>
      <div class="parentCard"><h3>🧩 Contenuti</h3><p class="tiny"><b>${NS.GAMES.length} giochi</b> • <b>${NS.MAX_LEVEL} livelli per gioco</b> • ${NS.GAMES.length*NS.MAX_LEVEL} livelli complessivi • oltre ${NS.WORDS.length} vocaboli inglesi • ripasso dilazionato • offline • nessuna pubblicità.</p><button class="danger" style="width:100%" onclick="LogicLand.resetProgress()">Azzera tutti i progressi</button></div><p class="tiny" style="text-align:center">LogicLand Kids ${NS.APP_VERSION} • schema dati ${NS.SCHEMA_VERSION}</p></div>`;
  }

  function saveProfile(){const name=document.getElementById('profileName').value.trim().slice(0,18),age=Number(document.getElementById('profileAge').value);state.profile.name=name||'Esploratrice';state.profile.age=NS.clamp(age,NS.MIN_AGE,NS.MAX_AGE);selectedAge=state.profile.age;save();toast('Profilo salvato ✅');}
  function saveSettings(){state.settings.sound=document.getElementById('soundSetting').checked;state.settings.hints=document.getElementById('hintSetting').checked;save();toast('Impostazioni salvate ✅');}

  async function makeBackup(){const code=NS.exportBackup(state),box=document.getElementById('backup');box.value=code;box.focus();box.select();try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(code);}else document.execCommand('copy');toast('Backup copiato negli appunti ✅');}catch(_e){toast('Backup creato: copialo e conservalo');}}
  function restoreBackup(){const raw=document.getElementById('backup').value.trim();if(!raw)return toast('Incolla prima il codice di backup');try{state=NS.importBackup(raw);selectedAge=state.profile.age;save();toast('Backup ripristinato ✅');setTimeout(renderParents,400);}catch(err){toast(err.message||'Codice di backup non valido');}}
  function resetProgress(){if(confirm('Vuoi davvero azzerare tutti i progressi? Questa operazione non si può annullare senza un backup.')){const profile={...state.profile},settings={...state.settings};state=NS.defaultState();state.profile=profile;state.settings=settings;save();renderParents();}}
  function about(){toast(`LogicLand Kids ${NS.APP_VERSION} • ${NS.GAMES.length} giochi • ${NS.MAX_LEVEL} livelli • 6 anni • Android 6.0.1+ • audio inglese B1`);}
  function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),2400);}

  function applyTabletLayout(){
    const landscape=window.innerWidth>window.innerHeight;
    document.body.classList.toggle('landscape',landscape);
    document.body.classList.toggle('portrait',!landscape);
    document.body.classList.toggle('tablet',Math.max(window.innerWidth,window.innerHeight)>=720);
  }


  function handleBack(){if(current){renderHome();return true;}return false;}
  Object.assign(NS,{renderHome,handleBack,selectAge,selectCategory,startGame,answer,advance,renderParents,saveProfile,saveSettings,makeBackup,restoreBackup,resetProgress,about});
  applyTabletLayout();
  window.addEventListener('resize',applyTabletLayout);
  window.addEventListener('orientationchange',applyTabletLayout);
  renderHome();
})(window.LogicLand);
