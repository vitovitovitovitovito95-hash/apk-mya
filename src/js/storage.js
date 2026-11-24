'use strict';
(function(NS){
  const KEY_V8='logicland_kids_v8';
  const KEY_V7='logicland_kids_v7';
  const KEY_V6='logicland_kids_v6';
  const KEY_V5='logicland_kids_v5';
  const KEY_V4='logicland_kids_v4';
  const KEY_V3='logicland_kids_v3';
  const KEY_V2='logicland_kids_v2';
  const KEY_V1='logicland_kids_v1';

  NS.defaultState=function(){
    return {
      schema:NS.SCHEMA_VERSION,
      profile:{name:'Esploratrice',age:6,avatar:'🦊'},
      settings:{sound:true,hints:true,animations:true},
      economy:{coins:0,stars:0,streak:0,xp:0},
      totals:{correct:0,wrong:0,sessions:0},
      games:Object.fromEntries(NS.GAMES.map(g=>[g.id,{level:1,wins:0,best:0,correct:0,wrong:0,lastPlayed:null}])),
      english:{words:{}},
      daily:{date:NS.localDateKey(),gamesCompleted:0,englishCorrect:0,claimed:false},
      created:new Date().toISOString(),
      updated:new Date().toISOString()
    };
  };

  function migrateV1(v1){
    const out=NS.defaultState();
    if(!v1||typeof v1!=='object')return out;
    out.economy.coins=Number(v1.coins||0);out.economy.stars=Number(v1.stars||0);out.economy.streak=Number(v1.streak||0);
    out.totals.correct=Number(v1.totalCorrect||0);out.totals.wrong=Number(v1.totalWrong||0);
    for(const g of NS.GAMES){const old=v1.games?.[g.id];if(old)out.games[g.id]={...out.games[g.id],...old};}
    for(const [word,old] of Object.entries(v1.words||{}))out.english.words[word]={correct:Number(old.right||0),wrong:Number(old.wrong||0),box:1,due:Date.now(),lastSeen:Number(old.last||0)};
    out.created=v1.created||out.created;out.updated=new Date().toISOString();return normalize(out);
  }

  function normalize(raw){
    const base=NS.defaultState();
    if(!raw||typeof raw!=='object')return base;
    const merged={
      ...base,...raw,
      profile:{...base.profile,...(raw.profile||{})},
      settings:{...base.settings,...(raw.settings||{})},
      economy:{...base.economy,...(raw.economy||{})},
      totals:{...base.totals,...(raw.totals||{})},
      games:Object.fromEntries(NS.GAMES.map(g=>[g.id,{...base.games[g.id],...(raw.games?.[g.id]||raw.games?.[String(g.id)]||{})}])),
      english:{...base.english,...(raw.english||{}),words:{...(raw.english?.words||{})}},
      daily:{...base.daily,...(raw.daily||{})}
    };
    merged.profile.age=NS.clamp(Number(merged.profile.age)||6,NS.MIN_AGE,NS.MAX_AGE);
    for(const g of NS.GAMES){
      merged.games[g.id]={...base.games[g.id],...(merged.games[g.id]||{})};
      merged.games[g.id].level=NS.clamp(Number(merged.games[g.id].level)||1,1,NS.MAX_LEVEL);
      merged.games[g.id].best=NS.clamp(Number(merged.games[g.id].best)||0,0,3);
    }
    merged.schema=NS.SCHEMA_VERSION;
    return merged;
  }

  NS.ensureDaily=function(state){
    const today=NS.localDateKey();
    if(state.daily?.date!==today)state.daily={date:today,gamesCompleted:0,englishCorrect:0,claimed:false};
    return state;
  };

  NS.loadState=function(){
    try{
      const current=JSON.parse(localStorage.getItem(KEY_V8)||'null');
      if(current)return NS.ensureDaily(normalize(current));
      for(const key of [KEY_V7,KEY_V6,KEY_V5,KEY_V4,KEY_V3,KEY_V2]){
        const old=JSON.parse(localStorage.getItem(key)||'null');
        if(old){const migrated=normalize(old);localStorage.setItem(KEY_V8,JSON.stringify(migrated));return NS.ensureDaily(migrated);}
      }
      const legacy=JSON.parse(localStorage.getItem(KEY_V1)||'null');
      if(legacy){const migrated=migrateV1(legacy);localStorage.setItem(KEY_V8,JSON.stringify(migrated));return NS.ensureDaily(migrated);}
    }catch(err){console.warn('Storage load failed',err);}    
    return NS.defaultState();
  };

  // v9.3: il salvataggio non deve mai bloccare l'app (iPhone in navigazione privata,
  // pagina ospitata in un riquadro protetto, memoria piena...).
  NS.saveState=function(state){state.updated=new Date().toISOString();state.schema=NS.SCHEMA_VERSION;NS.ensureDaily(state);
    try{localStorage.setItem(KEY_V8,JSON.stringify(normalize(state)));}catch(err){try{console.warn('Storage save failed',err);}catch(_e){}}
    if(typeof NS.afterSave==='function'){try{NS.afterSave(state);}catch(_e){}}};
  NS.normalizeState=function(raw){return NS.ensureDaily(normalize(raw));};

  function checksum(json){return Array.from(json).reduce((a,c)=>(a+c.charCodeAt(0))%65535,0).toString(16);}

  NS.exportBackup=function(state){
    const payload={app:'LogicLandKids',schema:NS.SCHEMA_VERSION,exportedAt:new Date().toISOString(),state:normalize(state)};
    const json=JSON.stringify(payload);return `LLK8.${checksum(json)}.${NS.safeB64Encode(json)}`;
  };

  NS.importBackup=function(code){
    const parts=String(code||'').trim().split('.');
    if(parts.length!==3||!['LLK2','LLK3','LLK4','LLK5','LLK6','LLK7','LLK8'].includes(parts[0]))throw new Error('Formato backup non riconosciuto');
    const json=NS.safeB64Decode(parts[2]);if(checksum(json)!==parts[1])throw new Error('Backup danneggiato o incompleto');
    const payload=JSON.parse(json);if(payload.app!=='LogicLandKids'||!payload.state)throw new Error('Backup non valido');
    return NS.ensureDaily(normalize(payload.state));
  };

  NS.englishWordStats=function(state,word){const base={correct:0,wrong:0,box:1,due:0,lastSeen:0};return {...base,...(state.english.words[word]||{})};};

  NS.recordEnglishResult=function(state,word,ok){
    const stat=NS.englishWordStats(state,word.en);
    if(ok){stat.correct++;stat.box=NS.clamp(stat.box+1,1,6);const intervals=[0,1,3,7,14,30,45];stat.due=Date.now()+intervals[stat.box]*NS.DAY_MS;state.daily.englishCorrect++;}
    else{stat.wrong++;stat.box=1;stat.due=Date.now()+10*60*1000;}
    stat.lastSeen=Date.now();state.english.words[word.en]=stat;
  };

  NS.selectEnglishWord=function(state,level){
    const maxWordLevel=Math.min(8,NS.levelBand(level)),candidates=NS.WORDS.filter(w=>w.lvl<=maxWordLevel),now=Date.now(),weighted=[];
    for(const word of candidates){
      const s=NS.englishWordStats(state,word.en);let weight=1;
      if(!s.lastSeen)weight+=2;
      if(s.due<=now)weight+=3;
      weight+=Math.min(5,s.wrong*2);
      weight-=Math.min(2,Math.floor(s.correct/4));
      if((word.cefr||'').startsWith('B1')&&level<11)weight=Math.max(1,weight-2);
      for(let i=0;i<Math.max(1,weight);i++)weighted.push(word);
    }
    return weighted[NS.rnd(0,weighted.length-1)];
  };
})(window.LogicLand);
