// Gioca DAVVERO i giochi "mente" (70-78) a ogni livello con un giocatore automatico preciso,
// con tempi di reazione da bambino veloce (RT ms). Verifica che ogni livello si possa vincere.
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=process.argv[2];const RT=+(process.env.RT||700);
const ONLY=process.env.ONLY?process.env.ONLY.split(',').map(Number):[70,71,72,74,75,77,78];
const LEVELS=process.env.LEVELS?process.env.LEVELS.split(',').map(Number):Array.from({length:15},(_,i)=>i+1);
const PORT=8900+Math.floor(Math.random()*90);
const srv=http.createServer((q,r)=>{let p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':p.endsWith('.css')?'text/css':'application/javascript'});r.end(d);});}).listen(PORT);
const BOT=function(RT){
  const M={};const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const prog=()=>{const t=$('#arcadeProgressText');return t?t.textContent:'';};
  const click=b=>b&&b.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  function ready(key){if(M.key!==key){M.key=key;M.seen=Date.now();return false;}if(M.acted===key)return false;if(Date.now()-M.seen<RT)return false;M.acted=key;return true;}
  const COLS={'#ff3b4f':'ROSSO','#2f80ff':'BLU','#1fb26b':'VERDE','#f2b100':'GIALLO','#9b5cff':'VIOLA','#ff7a1a':'ARANCIONE'};
  const hex=rgb=>{const m=rgb.match(/\d+/g);return m?'#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join(''):rgb;};
  const step={
    70(){const msg=($('#bgMsg')||{}).textContent||'';const on=$$('.bgCell.on');
      if(on.length){M.lit=on.map(b=>b.dataset.i);M.t=Date.now();return;}
      if(/Tocca/.test(msg)&&M.lit&&Date.now()-M.t>RT){const b=M.lit.map(i=>$('.bgCell[data-i="'+i+'"]')).find(b=>b&&!/ok/.test(b.className));if(b){click(b);M.t=Date.now()-RT+150;}else M.lit=null;}},
    71(){const n=$('#nbNum'),s=$('#nbSym'),a=$('#nbAsk');if(!n||!s)return;M.cards=M.cards||{};const num=+(n.textContent.match(/\d+/)||[0])[0];if(num&&/in/.test($('#nbCard').className))M.cards[num]=s.textContent;
      const m=a&&a.textContent.match(/carta (\d+) con la carta (\d+)/);if(!m)return;const key='nb'+m[1];if(!M.cards[m[1]]||!M.cards[m[2]])return;if(!ready(key))return;click($(M.cards[m[1]]===M.cards[m[2]]?'#nbYes':'#nbNo'));},
    72(){const w=$('#stWord'),r=$('#stRule');if(!w||!w.textContent||!r)return;const key=prog()+'|'+w.textContent+w.style.color+r.className;if(!ready(key))return;
      const name=/ink/.test(r.className)?COLS[hex(w.style.color)]:w.textContent;const b=$$('.stBtn').find(b=>b.textContent===name);click(b);},
    74(){const msg=($('#sqMsg')||{}).innerHTML||'';M.seq=M.seq||[];
      if(/Guarda bene/.test(msg)){const on=$$('.sqGrid .bgCell.on').map(b=>b.dataset.i);on.forEach(i=>{if(M.seq[M.seq.length-1]!==i&&M.seq.indexOf(i)<0)M.seq.push(i);});M.t=Date.now();M.k=0;return;}
      if(/Ora tocca/.test(msg)&&M.seq.length&&Date.now()-M.t>RT){const order=/contrario|ultima/.test(msg)?M.seq.slice().reverse():M.seq;const i=order[M.k];if(i===undefined){M.seq=[];return;}click($('.sqGrid .bgCell[data-i="'+i+'"]'));M.k++;M.t=Date.now()-RT+200;if(M.k>=order.length){M.seq=[];}}},
    75(){const st=$('#arStage');if(!st)return;const mid=st.querySelector('.ar.mid');if(!mid)return;const key=prog()+'|'+st.innerHTML.length+st.innerHTML.slice(0,200);if(!ready(key))return;
      const dir=e=>Math.round((+((e.style.transform||'').match(/-?\d+/)||[0])[0])/90)%4;const fl=[...st.querySelectorAll('.ar')].find(e=>!/mid|empty/.test(e.className));
      const orange=/orange/.test(mid.className);const right=orange&&fl?dir(fl):dir(mid);click($('.arBtn[data-d="'+right+'"]'));},
    77(){const bd=$('#mvBoard');if(!bd||/shuffle/.test(bd.className))return;const items=$$('.mvItem');if(!items.length||items.some(b=>/ok|bad/.test(b.className)))return;M.used=M.used||{};
      const key='mv'+bd.innerHTML;if(!ready(key))return;let cand=items.filter(b=>!M.used[b.dataset.x]);if(!cand.length){M.used={};cand=items;}const b=cand[0];M.used[b.dataset.x]=1;click(b);
      setTimeout(()=>{if(/Si ricomincia|ricomincia/i.test(($('#mvMsg')||{}).textContent||''))M.used={};},50);},
    78(){const L=$('#cmpL'),R=$('#cmpR');if(!L||!L.innerHTML)return;const key=prog()+'|'+L.innerHTML+R.innerHTML;if(!ready(key))return;
      const val=e=>{const d=e.querySelector('.cmpDots');if(d)return d.querySelectorAll('i').length;const t=(e.textContent||'').replace(/×/g,'*').replace(/[−–]/g,'-').replace(/÷|:/g,'/').replace(/[^0-9+\-*/(). ]/g,'');try{return Function('return ('+t+')')();}catch(x){return NaN;}};
      const a=val(L),c=val(R);M.log=(M.log||[]).concat([[a,c]]).slice(-3);click(a>c?L:R);}
  };
  return {tick(id){try{step[id]&&step[id]();}catch(e){M.err=String(e);}},M};
};
(async()=>{const b=await chromium.launch();const results=[];
  const W=+(process.env.WORKERS||4);const jobs=[];for(const g of ONLY)for(const L of LEVELS)jobs.push([g,L]);let idx=0;
  await Promise.all(Array.from({length:W},async()=>{const ctx=await b.newContext({viewport:{width:384,height:832}});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto(`http://localhost:${PORT}/index.html`);await pg.waitForTimeout(300);
    await pg.evaluate(()=>{const s=LogicLand.getState();s.settings.unlockAll=true;s.settings.sound=false;});
    while(idx<jobs.length){const [g,L]=jobs[idx++];const e0=errs.length;
      await pg.evaluate(([g,L,RT,src])=>{const BOT=eval('('+src+')');window.__b=BOT(RT);LogicLand.getState().games[g].level=L;LogicLand.startGame(g);LogicLand.beginLevel();clearInterval(window.__iv);window.__iv=setInterval(()=>window.__b.tick(g),60);},[g,L,RT,BOT.toString()]);
      const t0=Date.now();let res='timeout';
      while(Date.now()-t0<180000){await pg.waitForTimeout(400);const st=await pg.evaluate(()=>document.querySelector('.failLevel')?'FAIL':document.querySelector('.levelWin')?'win':'');if(st){res=st;break;}}
      const info=await pg.evaluate(()=>{clearInterval(window.__iv);const lc=document.getElementById('lifeCounter');return {lost:lc?(lc.textContent.match(/🖤/g)||[]).length:-1,err:window.__b.M.err||'',log:window.__b.M.log||null};});
      results.push({g,L,res,secs:Math.round((Date.now()-t0)/1000),lost:info.lost,err:info.err,js:errs.slice(e0).join(' | '),log:res!=='win'?info.log:null});
      process.stderr.write(`${g}L${L}:${res}(${info.lost}) `);
      await pg.evaluate(()=>LogicLand.renderHome());}
    await ctx.close();}));
  await b.close();srv.close();
  results.sort((a,b)=>a.g-b.g||a.L-b.L);
  for(const g of ONLY){const r=results.filter(x=>x.g===g);console.log(`\n== gioco ${g}: `+r.map(x=>`L${x.L}:${x.res==='win'?'✓':x.res}${x.lost?'(-'+x.lost+'❤)':''} ${x.secs}s`).join('  '));
    r.filter(x=>x.res!=='win'||x.err||x.js).forEach(x=>console.log('   ',JSON.stringify(x)));}
})();
