'use strict';
window.LogicLand = window.LogicLand || {};
(function(NS){
  NS.APP_VERSION = '9.0.0';
  NS.SCHEMA_VERSION = 8;
  NS.MIN_AGE = 6;
  NS.MAX_AGE = 6;
  NS.MAX_LEVEL = 15;
  NS.QUESTIONS_PER_LEVEL = 5;
  NS.STARTING_LIVES = 3;
  NS.MAX_ERRORS_PER_LEVEL = 2;
  NS.DAY_MS = 86400000;

  NS.LEVEL_PROFILES = Array.from({length:NS.MAX_LEVEL},(_,i)=>{
    const level=i+1;
    return {
      level,
      score:level*100,
      stage:Math.ceil(level/3),
      withinStage:(level-1)%3+1,
      choices:Math.min(6,2+Math.ceil(level/4)),
      visibleItems:3+Math.floor((level+1)/2),
      memoryItems:3+Math.floor(level/2),
      numericMax:10+level*level,
      steps:1+Math.floor((level-1)/3),
      simultaneousRules:1+Math.floor((level-1)/4),
      distractorSimilarity:level,
      hintStrength:Math.max(1,6-Math.ceil(level/3))
    };
  });

  NS.ARCADE_PROFILES = Array.from({length:NS.MAX_LEVEL},(_,i)=>{
    const level=i+1;
    return {
      level,
      tetris:{
        targetLines:1+level,
        fallMs:Math.max(280,980-(level-1)*44),
        pieceTypes:Math.min(7,2+Math.floor((level+1)/2)),
        garbageRows:Math.floor((level-1)/4)
      },
      dodge:{
        targetObstacles:4+level,
        speed:2.0+(level-1)*0.20,
        spawnMs:Math.max(660,1520-(level-1)*58),
        gapPx:Math.max(96,176-(level-1)*5),
        playerStep:Math.min(34,22+Math.floor(level/2))
      }
    };
  });

  NS.arcadeProfile=function(level){
    return NS.ARCADE_PROFILES[NS.clamp(Number(level)||1,1,NS.MAX_LEVEL)-1];
  };

  NS.levelProfile = function(level){
    return NS.LEVEL_PROFILES[NS.clamp(Number(level)||1,1,NS.MAX_LEVEL)-1];
  };

  NS.difficultyLabel = function(level){
    const p=NS.levelProfile(level);
    return `Difficoltà ${p.level}/${NS.MAX_LEVEL} • ${p.simultaneousRules} ${p.simultaneousRules===1?'regola':'regole'} • ${p.steps} ${p.steps===1?'passaggio':'passaggi'}`;
  };

  NS.attachDifficulty = function(question,gameId,level){
    const q=question||{},p=NS.levelProfile(level);
    q.meta={...(q.meta||{}),gameId:Number(gameId),level:p.level,difficultyScore:p.score,stage:p.stage,steps:p.steps,rules:p.simultaneousRules};
    q.difficulty=p;
    return q;
  };

  NS.escapeHtml = function(value){
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  };

  NS.shuffle = function(input){
    const a = [...input];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };

  NS.rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  NS.clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  NS.pick = arr => arr[NS.rnd(0,arr.length-1)];

  NS.uniqueOptions = function(answer,pool,count=4){
    const all=[String(answer),...NS.shuffle(pool.map(String).filter(x=>x!==String(answer)))];
    return NS.shuffle([...new Set(all)].slice(0,count));
  };

  NS.levelBand = function(level){
    if(level<=2) return 1;
    if(level<=4) return 2;
    if(level<=6) return 3;
    if(level<=8) return 4;
    if(level<=10) return 5;
    if(level<=12) return 6;
    if(level<=14) return 7;
    return 8;
  };

  NS.localDateKey = function(date=new Date()){
    const y=date.getFullYear();
    const m=String(date.getMonth()+1).padStart(2,'0');
    const d=String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  };

  NS.daysBetween = function(a,b){
    const x=new Date(a+'T12:00:00');
    const y=new Date(b+'T12:00:00');
    return Math.round((y-x)/NS.DAY_MS);
  };

  NS.safeB64Encode = function(text){ return btoa(unescape(encodeURIComponent(text))); };
  NS.safeB64Decode = function(text){ return decodeURIComponent(escape(atob(text))); };
})(window.LogicLand);
