'use strict';
// v9.3: Water Sort — ogni livello ha un puzzle risolvibile e la soluzione più corta
// (trovata con ricerca completa delle mosse reali) cresce di 1 versamento a ogni livello.
const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.LogicLand={};global.document={querySelector:()=>null,getElementById:()=>null,addEventListener:()=>{}};
const dir=path.join(__dirname,'../app/js');
for(const f of ['polyfills.js','core.js','data.js','data-es.js','storage.js','games-math.js','games-visual.js','games-new.js'])vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
const NS=global.LogicLand,W=NS.WATER_LEVELS;
if(!W)throw new Error('WATER_LEVELS mancante');
function gen(level){const cfg=NS.newGameProfile(level,'water'),cap=cfg.capacity,num=cfg.colors;const tubes=Array.from({length:num+2},(_,i)=>i<num?Array(cap).fill(i):[]);
  let x=W.seed[level-1];const rng=n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n;};
  for(let t=0;t<cfg.mixes;t++){const av=[];for(let i=0;i<tubes.length;i++){const s=tubes[i];if(!s.length)continue;const top=s[s.length-1];if(s.length>1&&s[s.length-2]!==top)continue;for(let j=0;j<tubes.length;j++)if(i!==j&&tubes[j].length<cap&&(!tubes[j].length||tubes[j][tubes[j].length-1]!==top))av.push([i,j]);}if(!av.length)break;const p=av[rng(av.length)];tubes[p[1]].push(tubes[p[0]].pop());}
  return {tubes,cap};}
function solve({tubes,cap}){const key=ts=>ts.map(a=>a.join('')).sort().join('|');const done=ts=>ts.every(a=>!a.length||(a.length===cap&&a.every(c=>c===a[0])));
  let q=[tubes],seen=new Set([key(tubes)]),d=0;
  while(q.length&&d<40){const nq=[];for(const ts of q){if(done(ts))return d;for(let i=0;i<ts.length;i++){const f=ts[i];if(!f.length)continue;const c=f[f.length-1];for(let j=0;j<ts.length;j++){if(i===j)continue;const to=ts[j];if(to.length>=cap||(to.length&&to[to.length-1]!==c))continue;const n=ts.map(a=>a.slice());while(n[i].length&&n[i][n[i].length-1]===c&&n[j].length<cap)n[j].push(n[i].pop());const k=key(n);if(!seen.has(k)){seen.add(k);nq.push(n);}}}}q=nq;d++;}
  return -1;}
let prev=0;
for(let L=1;L<=15;L++){const m=solve(gen(L));if(m!==W.min[L-1])throw new Error('Water L'+L+': soluzione minima '+m+' invece di '+W.min[L-1]);if(m<=prev)throw new Error('Water L'+L+': nessun salto di difficoltà');prev=m;}
console.log('water_levels_test OK: soluzioni minime',W.min.join(','));
