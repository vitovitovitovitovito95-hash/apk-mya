'use strict';
const vm=require('vm'),fs=require('fs'),path=require('path');
global.window=global;global.LogicLand={};global.document={getElementById:()=>null};
const dir=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','games-new.js','games-v82-puzzles.js','games-v82-board.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
function yes(cond,msg){if(!cond)throw new Error(msg);}
const N=global.LogicLand,cat=N.PuzzleV82Data;
yes(cat.unblock.length===15&&cat.flow.length===15,'Catalog 15 levels');
let last=0;
for(let i=0;i<15;i++){
 const u=cat.unblock[i],f=cat.flow[i],b=N.newGameProfile(i+1,'unblock'),d=N.newGameProfile(i+1,'dots');
 yes(u.moves>last,'Unlock minimal moves strictly increasing at '+i);last=u.moves;
 yes(u.pieces.length>=4,'Unlock block count');
 yes(b.optimalSlides===u.moves,'Unlock profile mismatch');
 yes(f.paths.length===d.pairs&&f.n===d.size,'Flow profile mismatch');
 let all=[];
 for(const p of f.paths){yes(p.length>=5,'Flow path too short');for(let t=1;t<p.length;t++){
  let a=p[t-1],c=p[t];yes(Math.abs(a%f.n-c%f.n)+Math.abs(Math.floor(a/f.n)-Math.floor(c/f.n))===1,'Flow non-adjacent');
 }all.push(...p);}
 yes(new Set(all).size===f.n*f.n,'Flow incomplete or repeated cells at '+(i+1));
}
const R=N.BoardRulesV82;
const blank=()=>Array.from({length:8},()=>Array(8).fill(''));
let b=blank();b[5][0]='w';b[4][1]='b';b[2][3]='b';
const capture=R.checkersMoves(b,'w');yes(capture.length>0&&capture.every(x=>x.capture===2),'Mandatory double capture');
let after=R.checkersApply(b,capture[0]);yes(after[1][4]==='w'&&after[4][1]===''&&after[2][3]==='','Multi-jump applying captures');
b=blank();b[1][2]='w';const promo=R.checkersMoves(b,'w').find(m=>m.to[1]===0);yes(R.checkersApply(b,promo)[0][1]==='W'||R.checkersApply(b,promo)[0][3]==='W','King promotion');
b=blank();b[7][4]='K';b[0][0]='k';b[0][4]='r';
yes(R.inCheck(b,'w'),'Rook check detected');
yes(R.chessMoves(b,'w').every(m=>!R.inCheck(R.chessApply(b,m),'w')),'King safety all legal moves');
b=blank();b[7][4]='K';b[0][4]='k';b[6][0]='P';b[5][1]='p';
const pm=R.chessMoves(b,'w').filter(m=>m.from[0]===0&&m.from[1]===6);
yes(pm.some(m=>m.to[0]===1&&m.to[1]===5&&m.takes),'Pawn diagonal capture');
yes(pm.some(m=>m.to[0]===0&&m.to[1]===4),'Pawn double push');
console.log('OK v8.2: 15 solvable Flow layouts, strict Unlock difficulties, forced/double captures, checkers kings, chess king safety + pawns');
