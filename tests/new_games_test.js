'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};
const holder={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null};
global.document={getElementById:()=>holder};
const root=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','data-es.js','games-new.js'])vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
const N=global.LogicLand;
function check(c,msg){if(!c)throw new Error(msg);}
const keys=['unblock','dots','water','checkers','chess'];let renders=0;
for(const key of keys){let last=-1;
 for(let level=1;level<=15;level++){
   let p=N.newGameProfile(level,key);check(p.load>last,`${key}: non-increasing complexity at ${level}`);last=p.load;
   holder.innerHTML='';
   N.PuzzleGames[key]({level,mountId:'game',onMistake:()=>true,onSuccess:()=>{},onProgress:()=>{}});
   check(holder.innerHTML.length>300,`${key}: empty render at ${level}`);
   check(holder.innerHTML.includes('data-'),`${key}: interactive controls missing at ${level}`);
   if(key==='unblock')check((holder.innerHTML.match(/data-b=/g)||[]).length>=p.obstacles+1,`${key}: missing blockers`);
   if(key==='water')check((holder.innerHTML.match(/data-tube=/g)||[]).length===p.colors+2,`${key}: wrong tube count`);
   if(key==='dots')check((holder.innerHTML.match(/class="dotCell"/g)||[]).length===p.size*p.size,`${key}: wrong grid size`);
   if(key==='checkers')check((holder.innerHTML.match(/class="chessSquare/g)||[]).length===64,`${key}: wrong board size`);
   if(key==='chess')check((holder.innerHTML.match(/class="chessSquare/g)||[]).length===64,`${key}: wrong board size`);
   renders++;
 }
}
check(N.GAMES.length===28,'Expected 28 actual games');
check(N.MAX_LEVEL===15&&N.STARTING_LIVES===3,'Progression contract failed');
console.log(`OK: ${renders} interactive game renders, all 15 levels, progressive parameters.`);
