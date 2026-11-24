'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');
global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.document={querySelector:()=>null,getElementById:()=>null};
const root=path.resolve(__dirname,'..','app','js');
for(const f of ['polyfills.js','core.js','data.js','data-es.js','storage.js','games-math.js','games-visual.js','games-english.js','games-extra.js','games-age6.js','games-v83-challenges.js','games-v9-levels.js','games-v9-logic.js','games-v92-levels.js','games-v92-lang.js','games-v92-brain.js'])vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
const NS=global.LogicLand,state=NS.defaultState();
function assert(x,msg){if(!x)throw new Error(msg);}
let generated=0;
for(const g of NS.GAMES){
  if(g.arcade){
    const a=NS.arcadeProfile(1)[g.arcade],b=NS.arcadeProfile(15)[g.arcade];
    if(['tetris','dodge'].includes(g.arcade))assert(a&&b,`Arcade profile missing for ${g.name}`); else assert(['unblock','dots','water','checkers','chess','flashgrid','nback','stroop'].includes(g.arcade),`Unknown interactive game ${g.arcade}`);
    continue;
  }
  const fn=NS.MathGames[g.id]||NS.VisualGames[g.id]||NS.EnglishGames[g.id];
  assert(typeof fn==='function',`Game ${g.id} (${g.name}): generator missing`);
  let lastLoad=-Infinity;
  for(let level=1;level<=15;level++){
    for(let i=0;i<50;i++){
      const q=fn(level,state);generated++;
      assert(q&&q.answer!==undefined&&q.answer!==null,`Game ${g.id} L${level}: answer missing`);
      assert(q.prompt,`Game ${g.id} L${level}: prompt missing`);
      assert(q.meta&&q.meta.level===level,`Game ${g.id} L${level}: level metadata missing`);
      assert(q.meta.age6===true,`Game ${g.id} L${level}: age6 progression override missing`);
      assert(q.meta.age6Load===NS.AGE6_DIFFICULTY[level-1].load,`Game ${g.id} L${level}: wrong age6 load`);
      assert(q.meta.age6Metrics&&typeof q.meta.age6Metrics==='object',`Game ${g.id} L${level}: effective metrics missing`);
      if(Array.isArray(q.options)){
        const values=q.options.map(o=>String(o&&typeof o==='object'?(o.value!==undefined?o.value:o.label):o));
        assert(values.includes(String(q.answer)),`Game ${g.id} L${level}: correct answer not in options`);
        assert(new Set(values).size===values.length,`Game ${g.id} L${level}: duplicate options`);
      }
    }
    const load=NS.AGE6_DIFFICULTY[level-1].load;
    assert(load>lastLoad,`Game ${g.id}: difficulty load did not increase at L${level}`);
    lastLoad=load;
  }
}
assert(NS.GAMES.length===28,'Expected 28 games');
assert(NS.GAMES.filter(g=>g.arcade==='tetris').length===1,'Tetris Junior missing');
assert(NS.GAMES.filter(g=>g.arcade==='dodge').length===1,'Macchia Sprint missing');
assert(NS.WORDS.length>=100,'Expected at least 100 English words');
console.log(`OK: ${generated} questions across ${NS.GAMES.filter(g=>!g.arcade).length} learning games + ${NS.GAMES.filter(g=>g.arcade).length} interactive games; 15 levels each.`);
