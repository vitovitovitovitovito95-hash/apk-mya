'use strict';
// Tests observable input difficulty, NOT only a numeric level tag.
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};global.document={querySelector:()=>null,getElementById:()=>null};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const dir=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','data-es.js','storage.js','games-math.js','games-visual.js','games-english.js','games-extra.js','games-age6.js','games-new.js','games-v82-puzzles.js','games-v82-board.js','games-v83-challenges.js','games-v9-levels.js','games-v9-logic.js','games-v92-levels.js','games-v92-lang.js','games-v92-brain.js','games-v93-brain.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
const N=global.LogicLand, state=N.defaultState();
function check(ok,msg){if(!ok)throw new Error(msg);}
const metrics={
  40:'operations',41:'equations',42:'baseSize',1:'terms',7:'visibleItems',8:'presentedItems',9:'holes',11:'blocks',14:'memoryItems',16:'vocabularyMinBand',21:'presentedItems',31:'countedItems',32:'pieces',33:'items',34:'vocabularyMinBand',35:'tiles',5:'holes',73:'operations',76:'cells',60:'vocabularyMinBand',61:'vocabularyMinBand'
};
const rising={1:'terms',7:'visibleItems',8:'presentedItems',9:'holes',11:'countedItems',14:'memoryItems',21:'presentedItems',31:'countedItems',32:'pieces',33:'items',35:'tiles',5:'holes'};
let questions=0;
for(const g of N.GAMES){
 if(g.arcade)continue;
 let previous=-Infinity;
 for(let lv=1;lv<=15;lv++){
  const gen=N.MathGames[g.id]||N.VisualGames[g.id]||N.EnglishGames[g.id];
  let key=metrics[g.id];check(key,'No measurable input complexity for '+g.id);
  for(let t=0;t<30;t++){
   const q=gen(lv,state);questions++;
   let v=q.meta.age6Metrics[key];
   check(typeof v==='number' && v>=0,g.name+' L'+lv+' missing metric '+key);
   if(rising[g.id]&&(!q.meta.v92||g.id===5||g.id===1||g.id===8)){check(v>previous,g.name+' L'+lv+' objective feature not strictly greater than previous level');}
   check(String(q.answer).length>0,g.name+' L'+lv+' no answer');
   check(typeof q.prompt==='string'&&q.prompt.length>0,g.name+' L'+lv+' prompt missing');
   const opts=q.options.map(x=>String(typeof x==='object'?(x.value??x.label):x));
   check(opts.includes(String(q.answer)),g.name+' L'+lv+' correct answer not present');
   check(opts.length===new Set(opts).size,g.name+' L'+lv+' duplicate choice');
   if(g.id===5){check(q.meta.age6Metrics.uniqueSolutions===1,'Nonunique sudoku');check(v===[3,4,5,6,8,9,10,11,12,13,14,15,16,17,18][lv-1],'Sudoku holes do not follow the v9.2 table');}
   if(g.id===9)check(v===lv,'Matrix hidden tiles do not grow');
   if((g.id===16||g.id===34)&&!q.meta.age6Metrics.tierFree){
     const sorted=N.WORDS.slice().sort((a,b)=>a.lvl-b.lvl||a.en.length-b.en.length||a.en.localeCompare(b.en));
     const start=Math.floor((lv-1)*sorted.length/15),end=Math.floor(lv*sorted.length/15);
     const idx=sorted.findIndex(w=>w.en===q.word.en);
     check(idx>=start&&idx<end,g.name+' L'+lv+' wrong curriculum tier '+idx+' outside '+start+'..'+end);
   }
  }
  previous=gen(lv,state).meta.age6Metrics[key]; // v9.2 games: deterministic per level for 1/5/8, others checked via rank in v92_levels_test
 }
}
// two games of dexterity strictly increase objective and fall speed.
const a=N.ARCADE_PROFILES;
for(let i=1;i<15;i++){
 check(a[i].tetris.targetLines>a[i-1].tetris.targetLines&&a[i].tetris.fallMs<a[i-1].tetris.fallMs,'Tetris regression at '+(i+1));
 check(a[i].dodge.targetObstacles>a[i-1].dodge.targetObstacles&&a[i].dodge.gapPx<a[i-1].dodge.gapPx,'Dodge regression at '+(i+1));
}
const catalog=N.PuzzleV82Data;
check(catalog.unblock.length===15&&catalog.flow.length===15,'Puzzle catalogs');
for(let i=1;i<15;i++)check(catalog.unblock[i].moves>catalog.unblock[i-1].moves,'Unlock optimum not strictly increasing');
for(let i=0;i<15;i++){
 let f=catalog.flow[i],total=f.paths.reduce((s,p)=>s+p.length,0);
 check(total===f.n*f.n,'Connect no complete solution');
}
for(let i=1;i<15;i++){
 check(N.newGameProfile(i+1,'water').mixes>N.newGameProfile(i,'water').mixes,'Water scramble count not progressive');
}
check(N.GAMES.length===33,'Expected 33 games');
console.log('PASS v8.3: '+questions+' measured questions; Sudoku unique, Matrix holes increasing; 7 interactive progression contracts');
