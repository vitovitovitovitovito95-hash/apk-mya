'use strict';
// v8.4: verify full initial armies, stable square sizes and strict per-level AI skill.
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.innerWidth=390;global.innerHeight=820;
global.addEventListener=()=>{};global.removeEventListener=()=>{};
const target={html:'',set innerHTML(value){this.html=value;},get innerHTML(){return this.html;},querySelectorAll:()=>[],querySelector:()=>({addEventListener:()=>{},clientWidth:350,textContent:''})};
global.document={getElementById:()=>target,removeEventListener:()=>{},addEventListener:()=>{}};
global.LogicLand={};const dir=path.join(__dirname,'../app/js');
for(const file of ['polyfills.js','core.js','data.js','storage.js','games-new.js','games-v82-puzzles.js','games-v82-board.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,file),'utf8'),{filename:file});
function check(v,msg){if(!v)throw Error(msg);}
const N=global.LogicLand;
let lastCheckers=0,lastChess=0;
for(let level=1;level<=15;level++){
  const checkers=N.newGameProfile(level,'checkers'),chess=N.newGameProfile(level,'chess');
  check(checkers.piecesPerSide===12&&chess.piecesPerSide===16,'Full army metadata at '+level);
  check(checkers.botSkill>lastCheckers&&chess.botSkill>lastChess,'AI skill not increasing at '+level);
  lastCheckers=checkers.botSkill;lastChess=chess.botSkill;
  N.PuzzleGames.checkers({mountId:'stage',level});
  check((target.html.match(/class="v82Checker/g)||[]).length===24,'Checkers pieces at '+level);
  check((target.html.match(/class="chessSquare/g)||[]).length===64,'Checkers squares at '+level);
  check((target.html.match(/flex:0 0 [0-9]+px/g)||[]).length===64,'Checkers fixed geometry at '+level);
  N.PuzzleGames.chess({mountId:'stage',level});
  check((target.html.match(/class="v82ChessPiece/g)||[]).length===32,'Chess pieces at '+level);
  check((target.html.match(/class="chessSquare/g)||[]).length===64,'Chess squares at '+level);
  check((target.html.match(/flex:0 0 [0-9]+px/g)||[]).length===64,'Chess fixed geometry at '+level);
  N.PuzzleGames.unblock({mountId:'stage',level});
  check(target.html.indexOf('data-dir=')<0,'Unlock arrow controls at '+level);
  check((target.html.match(/data-block=/g)||[]).length>=4,'Draggable wooden pieces at '+level);
}
console.log('PASS v8.4: 15 full-army Checkers (12x2), Chess (16x2), fixed 8x8 square geometry, ascending AI skill and arrow-free drag boards');
