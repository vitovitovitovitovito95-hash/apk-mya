'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};
global.document={querySelector:()=>null,getElementById:()=>null};
const root=path.resolve(__dirname,'..','app','js');
for(const f of ['polyfills.js','core.js','data.js','data-es.js','games-math.js','games-visual.js','games-english.js','games-extra.js','games-age6.js','games-new.js'])vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
const NS=global.LogicLand;
function assert(x,msg){if(!x)throw new Error(msg);}
assert(NS.MIN_AGE===6&&NS.MAX_AGE===6,'V6 must focus only on age 6');
assert(NS.MAX_LEVEL===15,'There must be exactly 15 levels per game');
assert(NS.STARTING_LIVES===3,'There must be three starting lives');
assert(NS.MAX_ERRORS_PER_LEVEL===2,'Three lives mean the third error ends the level');
assert(NS.GAMES.length===33,'Expected 33 active age-6 games');
assert(NS.GAMES.every(g=>g.age===6),'Every active game must be age 6');
assert(NS.AGE6_DIFFICULTY&&NS.AGE6_DIFFICULTY.length===15,'Missing age-6 difficulty contract');
for(let i=1;i<15;i++){
  const a=NS.AGE6_DIFFICULTY[i-1],b=NS.AGE6_DIFFICULTY[i];
  assert(b.load>a.load,`Age-6 cognitive load not increasing L${i}->L${i+1}`);
  assert(b.choices>=a.choices,`Choices regressed at L${i+1}`);
  assert(b.sequenceLength>=a.sequenceLength,`Sequence length regressed at L${i+1}`);
  assert(b.visualItems>=a.visualItems,`Visual item count regressed at L${i+1}`);
  assert(b.distractorSimilarity>a.distractorSimilarity,`Distractor similarity not increasing at L${i+1}`);
  assert(b.memoryDelayMs<a.memoryDelayMs,`Memory exposure time not decreasing at L${i+1}`);
  assert(b.rules>=a.rules,`Rule count regressed at L${i+1}`);
}
const t=NS.ARCADE_PROFILES.map(p=>p.tetris),d=NS.ARCADE_PROFILES.map(p=>p.dodge);
for(let i=1;i<15;i++){
  assert(t[i].targetLines>t[i-1].targetLines,`Tetris target not increasing at L${i+1}`);
  assert(t[i].fallMs<t[i-1].fallMs,`Tetris speed not increasing at L${i+1}`);
  assert(t[i].pieceTypes>=t[i-1].pieceTypes&&t[i].garbageRows>=t[i-1].garbageRows,`Tetris secondary difficulty regressed L${i+1}`);
  assert(d[i].targetObstacles>d[i-1].targetObstacles,`Dodge target not increasing at L${i+1}`);
  assert(d[i].speed>d[i-1].speed,`Dodge speed not increasing at L${i+1}`);
  assert(d[i].spawnMs<d[i-1].spawnMs,`Dodge spawn interval not decreasing L${i+1}`);
  assert(d[i].gapPx<d[i-1].gapPx,`Dodge gap not shrinking L${i+1}`);
}
for(const key of ['unblock','dots','water','checkers','chess']){let prev=-1;for(let l=1;l<=15;l++){let p=NS.newGameProfile(l,key);assert(p&&p.level===l,'New game level incorrect '+key);assert(p.load>prev,'New game load not increasing '+key+' level '+l);prev=p.load;}}console.log('OK: 33 games, 15 levels, 3 lives, progressive core, arcade and new puzzle configurations.');
