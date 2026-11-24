// QA completo: ogni gioco a domande, ogni livello, ogni domanda risposta correttamente;
// giochi arcade/puzzle: avvio a ogni livello + tocchi casuali. Raccoglie errori JS e problemi di layout.
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=process.argv[2];const VW=+(process.env.VW||384),VH=+(process.env.VH||832);const ONLY=process.env.ONLY?process.env.ONLY.split(',').map(Number):null;
const LEVELS=process.env.LEVELS?process.env.LEVELS.split(',').map(Number):Array.from({length:15},(_,i)=>i+1);
const PORT=8800+Math.floor(Math.random()*100);
const srv=http.createServer((q,r)=>{let p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':p.endsWith('.css')?'text/css':p.endsWith('.js')?'application/javascript':'application/octet-stream'});r.end(d);});}).listen(PORT);
const issues=[];function issue(g,l,msg){issues.push(`[${g} L${l}] ${msg}`);}
async function setup(b){const ctx=await b.newContext({viewport:{width:VW,height:VH}});const pg=await ctx.newPage();pg.__errs=[];
  pg.on('pageerror',e=>pg.__errs.push(e.message+' @ '+String(e.stack||'').split('\n').slice(1,3).join(' / ').replace(/http:\/\/localhost:\d+\//g,'')));pg.on('console',m=>{if(m.type()==='error'&&!/404|Failed to load/.test(m.text()))pg.__errs.push('console:'+m.text());});
  await pg.goto(`http://localhost:${PORT}/index.html`);await pg.waitForTimeout(400);
  await pg.evaluate(()=>{const NS=window.LogicLand;window.__q=null;for(const T of [NS.MathGames,NS.VisualGames,NS.EnglishGames])for(const k of Object.keys(T)){const f=T[k];T[k]=function(){const q=f.apply(this,arguments);window.__q=q;return q;};}
    const st=NS.getState();st.settings.unlockAll=true;st.settings.sound=false;});
  return pg;}
const layoutJS=()=>{const W=innerWidth,out=[];if(document.documentElement.scrollWidth>W+1)out.push('pagina più larga dello schermo ('+document.documentElement.scrollWidth+'>'+W+')');
  const seen=new Set();document.querySelectorAll('#app .question *, #app .arcadeMount *, #app .options *').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||getComputedStyle(e).visibility==='hidden')return;if(r.right>W+3||r.left<-3){const n=(e.className&&e.className.baseVal===undefined?e.className:e.tagName)+'';if(!seen.has(n)){seen.add(n);out.push('fuori schermo: .'+n+' ['+Math.round(r.left)+','+Math.round(r.right)+']');}}});
  document.querySelectorAll('.opt').forEach(o=>{if(o.scrollWidth>o.clientWidth+3)out.push('testo tagliato nel pulsante: '+o.textContent.slice(0,30));});return out.slice(0,6);};
async function qGame(pg,g,L){
  await pg.evaluate(([g,L])=>{const st=LogicLand.getState();st.games[g].level=L;LogicLand.startGame(g);},[g,L]);await pg.waitForTimeout(30);
  await pg.evaluate(()=>LogicLand.beginLevel());
  const n=await pg.evaluate(L=>LogicLand.questionsFor(L),L);
  for(let i=0;i<n;i++){
    await pg.waitForTimeout(90);
    const r=await pg.evaluate(()=>{const q=window.__q;if(!q)return {err:'nessuna domanda'};const opts=[...document.querySelectorAll('.opt')];const vals=opts.map(o=>o.dataset.value);const labels=opts.map(o=>o.innerHTML.trim());
      const res={prompt:(q.prompt||'').replace(/<[^>]+>/g,'').slice(0,50),n:opts.length,answer:String(q.answer),custom:!q.options};
      if(q.options){res.hasAnswer=vals.includes(String(q.answer));res.dupVal=new Set(vals).size!==vals.length;res.dupLab=new Set(labels).size!==labels.length;res.emptyLab=labels.some(l=>!l.replace(/<[^>]+>/g,'').trim()&&!/<span|<i|<b/.test(l));}
      return res;});
    if(r.err){issue(g,L,r.err);break;}
    if(!r.custom){if(r.n<2)issue(g,L,`solo ${r.n} opzioni: ${r.prompt}`);if(!r.hasAnswer)issue(g,L,`risposta ${r.answer} non tra le opzioni: ${r.prompt}`);if(r.dupVal)issue(g,L,`opzioni con valore duplicato: ${r.prompt}`);if(r.dupLab)issue(g,L,`opzioni identiche: ${r.prompt}`);if(r.emptyLab)issue(g,L,`opzione vuota: ${r.prompt}`);}
    if(i===0||i===n-1){const lay=await pg.evaluate(layoutJS);lay.forEach(x=>issue(g,L,x));}
    if(r.custom)await pg.evaluate(a=>LogicLand.submitCustomAnswer(a),r.answer);
    else await pg.evaluate(()=>{const q=window.__q;const b=[...document.querySelectorAll('.opt')].find(o=>o.dataset.value===String(q.answer));LogicLand.answer(b);});
    const fb=await pg.evaluate(()=>{const f=document.querySelector('#feedback .feedback');return f?f.className:'';});
    if(!/good/.test(fb))issue(g,L,`risposta corretta non accettata (${fb||'nessun feedback'}): ${r.prompt}`);
    await pg.evaluate(()=>LogicLand.advance());
  }
  await pg.waitForTimeout(60);
  const end=await pg.evaluate(()=>({win:!!document.querySelector('.levelWin:not(.failLevel)'),fail:!!document.querySelector('.failLevel')}));
  if(!end.win)issue(g,L,'il livello non si conclude con la vittoria');
}
async function aGame(pg,g,L){
  await pg.evaluate(([g,L])=>{const st=LogicLand.getState();st.games[g].level=L;LogicLand.startGame(g);},[g,L]);await pg.waitForTimeout(30);
  await pg.evaluate(()=>LogicLand.beginLevel());await pg.waitForTimeout(700);
  const lay=await pg.evaluate(layoutJS);lay.forEach(x=>issue(g,L,x));
  const empty=await pg.evaluate(()=>{const m=document.getElementById('arcadeMount');return !m||m.innerHTML.trim().length<20;});if(empty)issue(g,L,'area di gioco vuota');
  for(let k=0;k<25;k++){
    await pg.evaluate(()=>{const m=document.getElementById('arcadeMount');if(!m)return;const bs=[...m.querySelectorAll('button,[data-cell],.bgCell,.mvItem,.waterTube,.cmpSide,.chessSquare')].filter(b=>b.offsetParent);if(!bs.length)return;const b=bs[Math.floor(Math.random()*bs.length)];b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
    await pg.waitForTimeout(110);
    const still=await pg.evaluate(()=>!!document.getElementById('arcadeMount'));if(!still)break;
  }
  await pg.evaluate(()=>LogicLand.renderHome());
}
(async()=>{const b=await chromium.launch();const pg0=await setup(b);
  const games=await pg0.evaluate(()=>LogicLand.GAMES.map(g=>({id:g.id,arcade:!!g.arcade,name:g.name})));await pg0.context().close();
  const list=games.filter(g=>!ONLY||ONLY.includes(g.id));
  const W=+(process.env.WORKERS||4);let idx=0;
  await Promise.all(Array.from({length:W},async()=>{const pg=await setup(b);while(idx<list.length){const g=list[idx++];
    for(const L of LEVELS){const before=pg.__errs.length;try{if(g.arcade)await aGame(pg,g.id,L);else await qGame(pg,g.id,L);}catch(e){issue(g.id,L,'eccezione nel test: '+e.message.split('\n')[0]);}
      pg.__errs.slice(before).forEach(e=>issue(g.id,L,'ERRORE JS: '+e));}
    process.stderr.write(`${g.id} `);}
    await pg.context().close();}));
  await b.close();srv.close();
  const uniq=[...new Set(issues)];console.log(`\n${VW}x${VH}: ${uniq.length} problemi`);uniq.forEach(x=>console.log(x));
})();
