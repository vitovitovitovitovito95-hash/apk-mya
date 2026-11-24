'use strict';
(function(NS){
  let activeController=null;

  function stopActive(){
    try{activeController?.stop?.();}catch(_e){}
    activeController=null;
  }
  NS.stopArcade=stopActive;

  const TETROMINOES=[
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,0],[0,1,1]]
  ];

  function rotateMatrix(m){
    const h=m.length,w=m[0].length;
    return Array.from({length:w},(_,x)=>Array.from({length:h},(_,y)=>m[h-1-y][x]));
  }

  function boardScale(cols,rows,targetWidth){
    const cell=Math.max(16,Math.floor(targetWidth/cols)-2);
    return {cell,w:cell*cols,h:cell*rows};
  }

  function startTetris(opts){
    stopActive();
    const profile=NS.arcadeProfile(opts.level).tetris;
    const rows=16,cols=10;
    let board=Array.from({length:rows},()=>Array(cols).fill(0));
    let piece=null,lines=0,timer=null,stopped=false;
    const el=document.getElementById(opts.mountId);
    if(!el)return null;

    function addGarbage(){
      for(let r=0;r<profile.garbageRows;r++){
        const hole=NS.rnd(0,cols-1);
        board.shift();
        board.push(Array.from({length:cols},(_,c)=>c===hole?0:8));
      }
    }
    addGarbage();

    function newPiece(){
      const idx=NS.rnd(0,profile.pieceTypes-1);
      piece={shape:TETROMINOES[idx].map(r=>r.slice()),x:Math.floor((cols-TETROMINOES[idx][0].length)/2),y:0,type:idx+1};
      if(collides(piece.x,piece.y,piece.shape)){
        const canContinue=opts.onMistake?.('La torre ha raggiunto la cima!');
        if(!canContinue){stop();return false;}
        board=Array.from({length:rows},()=>Array(cols).fill(0));
        addGarbage();
        piece={shape:TETROMINOES[idx].map(r=>r.slice()),x:Math.floor((cols-TETROMINOES[idx][0].length)/2),y:0,type:idx+1};
      }
      return true;
    }

    function collides(nx,ny,shape){
      for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++)if(shape[r][c]){
        const x=nx+c,y=ny+r;
        if(x<0||x>=cols||y>=rows)return true;
        if(y>=0&&board[y][x])return true;
      }
      return false;
    }

    function merge(){
      piece.shape.forEach((row,r)=>row.forEach((v,c)=>{
        const y=piece.y+r,x=piece.x+c;
        if(v&&y>=0&&y<rows&&x>=0&&x<cols)board[y][x]=piece.type;
      }));
      const kept=board.filter(row=>row.some(v=>!v));
      const cleared=rows-kept.length;
      if(cleared){
        lines+=cleared;
        board=[...Array.from({length:cleared},()=>Array(cols).fill(0)),...kept];
        opts.onProgress?.(Math.min(1,lines/profile.targetLines),`${lines}/${profile.targetLines} righe`);
        if(lines>=profile.targetLines){ render(); stop(); opts.onSuccess?.(); return; }
      }
      newPiece();
    }

    function move(dx,dy){
      if(stopped||!piece)return false;
      if(!collides(piece.x+dx,piece.y+dy,piece.shape)){piece.x+=dx;piece.y+=dy;render();return true;}
      if(dy>0)merge();
      return false;
    }

    function rotate(){
      if(stopped||!piece)return;
      const next=rotateMatrix(piece.shape);
      for(const kick of [0,-1,1,-2,2]){
        if(!collides(piece.x+kick,piece.y,next)){piece.x+=kick;piece.shape=next;render();return;}
      }
    }

    function hardDrop(){
      if(stopped||!piece)return;
      while(!collides(piece.x,piece.y+1,piece.shape))piece.y++;
      merge();render();
    }

    function render(){
      if(!el||stopped)return;
      const view=board.map(row=>row.slice());
      if(piece)piece.shape.forEach((row,r)=>row.forEach((v,c)=>{
        const y=piece.y+r,x=piece.x+c;if(v&&y>=0&&y<rows&&x>=0&&x<cols)view[y][x]=piece.type;
      }));
      const scale=boardScale(cols,rows,Math.min(window.innerWidth*0.74,360));
      const cells=view.flat().map(v=>`<div class="tcell ${v?'filled f'+v:''}"></div>`).join('');
      el.innerHTML=`<div class="arcadeInfo"><b>Righe: ${lines}/${profile.targetLines}</b><span>Velocità ${Math.round(1000/profile.fallMs*10)/10}×</span></div><div class="tetrisBoard" style="width:${scale.w}px;height:${scale.h}px">${cells}</div><div class="arcadeControls"><button data-a="left">⬅️</button><button data-a="rotate">🔄</button><button data-a="right">➡️</button><button data-a="down">⬇️</button><button data-a="drop">⏬</button></div>`;
      el.querySelector('[data-a="left"]')?.addEventListener('click',()=>move(-1,0));
      el.querySelector('[data-a="right"]')?.addEventListener('click',()=>move(1,0));
      el.querySelector('[data-a="down"]')?.addEventListener('click',()=>move(0,1));
      el.querySelector('[data-a="rotate"]')?.addEventListener('click',rotate);
      el.querySelector('[data-a="drop"]')?.addEventListener('click',hardDrop);
    }

    function stop(){stopped=true;if(timer)clearInterval(timer);timer=null;window.removeEventListener('resize',render);window.removeEventListener('orientationchange',render);}
    if(newPiece()){
      render();
      opts.onProgress?.(0,`0/${profile.targetLines} righe`);
      timer=setInterval(()=>move(0,1),profile.fallMs);
      window.addEventListener('resize',render);
      window.addEventListener('orientationchange',render);
    }
    activeController={stop};
    return activeController;
  }

  function startDodge(opts){
    stopActive();
    const profile=NS.arcadeProfile(opts.level).dodge;
    const el=document.getElementById(opts.mountId);
    if(!el)return null;
    const W=320,H=420,player={x:42,y:H/2-18,w:34,h:34};
    let obstacles=[],passed=0,lastSpawn=0,lastTs=0,raf=0,stopped=false,invincibleUntil=0;

    el.innerHTML=`<div class="arcadeInfo"><b>Ostacoli: <span id="dodgePassed">0</span>/${profile.targetObstacles}</b><span>Velocità ${profile.speed.toFixed(1)}</span></div><div class="dodgeField" id="dodgeField"><div class="blobPlayer" id="blobPlayer">●</div></div><div class="arcadeControls dodgeControls"><button data-m="up">⬆️ SU</button><button data-m="down">⬇️ GIÙ</button></div>`;
    const field=el.querySelector('#dodgeField'),blob=el.querySelector('#blobPlayer'),counter=el.querySelector('#dodgePassed');

    function setPlayer(){blob.style.transform=`translate(${player.x}px,${player.y}px)`;}
    function movePlayer(d){player.y=NS.clamp(player.y+d,4,H-player.h-4);setPlayer();}
    el.querySelector('[data-m="up"]')?.addEventListener('click',()=>movePlayer(-profile.playerStep));
    el.querySelector('[data-m="down"]')?.addEventListener('click',()=>movePlayer(profile.playerStep));
    function moveFromClientY(clientY){const r=field.getBoundingClientRect(),y=(clientY-r.top)/r.height*H;player.y=NS.clamp(y-player.h/2,4,H-player.h-4);setPlayer();}
    field.addEventListener('pointerdown',e=>moveFromClientY(e.clientY));
    field.addEventListener('touchstart',e=>{if(e.touches&&e.touches[0]){e.preventDefault();moveFromClientY(e.touches[0].clientY);}},{passive:false});
    field.addEventListener('click',e=>moveFromClientY(e.clientY));
    setPlayer();

    function spawn(){
      const margin=45,gap=profile.gapPx,gapTop=NS.rnd(margin,Math.max(margin,H-margin-gap));
      const id='ob_'+Math.random().toString(36).slice(2);
      const item={id,x:W+20,w:34,gapTop,gap,passed:false};
      obstacles.push(item);
      const top=document.createElement('div'),bottom=document.createElement('div');
      top.className='dodgeObstacle';bottom.className='dodgeObstacle';top.dataset.id=id;bottom.dataset.id=id;
      top.style.cssText=`left:${item.x}px;top:0;height:${gapTop}px;width:${item.w}px`;
      bottom.style.cssText=`left:${item.x}px;top:${gapTop+gap}px;height:${H-gapTop-gap}px;width:${item.w}px`;
      field.appendChild(top);field.appendChild(bottom);
    }

    function overlap(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
    function hit(o){
      const topHit=overlap(player.x,player.y,player.w,player.h,o.x,0,o.w,o.gapTop);
      const by=o.gapTop+o.gap;
      const bottomHit=overlap(player.x,player.y,player.w,player.h,o.x,by,o.w,H-by);
      return topHit||bottomHit;
    }

    function removeDom(o){field.querySelectorAll(`[data-id="${o.id}"]`).forEach(n=>n.remove());}
    function stop(){stopped=true;if(raf)cancelAnimationFrame(raf);raf=0;window.removeEventListener('resize',setPlayer);window.removeEventListener('orientationchange',setPlayer);}

    function frame(ts){
      if(stopped)return;
      if(!lastTs){lastTs=ts;lastSpawn=ts;}
      const dt=Math.min(40,ts-lastTs);lastTs=ts;
      if(ts-lastSpawn>=profile.spawnMs){spawn();lastSpawn=ts;}
      for(const o of obstacles){
        o.x-=profile.speed*(dt/16.67);
        field.querySelectorAll(`[data-id="${o.id}"]`).forEach(n=>n.style.left=o.x+'px');
        if(!o.passed&&o.x+o.w<player.x){o.passed=true;passed++;counter.textContent=passed;opts.onProgress?.(Math.min(1,passed/profile.targetObstacles),`${passed}/${profile.targetObstacles} ostacoli`);if(passed>=profile.targetObstacles){stop();opts.onSuccess?.();return;}}
        if(ts>invincibleUntil&&hit(o)){
          invincibleUntil=ts+1100;blob.classList.add('hit');setTimeout(()=>blob.classList.remove('hit'),700);
          const canContinue=opts.onMistake?.('Hai toccato un ostacolo!');
          if(!canContinue){stop();return;}
          obstacles.forEach(removeDom);obstacles=[];player.y=H/2-player.h/2;setPlayer();lastSpawn=ts;
          break;
        }
      }
      obstacles=obstacles.filter(o=>{if(o.x+o.w<-10){removeDom(o);return false;}return true;});
      raf=requestAnimationFrame(frame);
    }

    opts.onProgress?.(0,`0/${profile.targetObstacles} ostacoli`);
    raf=requestAnimationFrame(frame);
    window.addEventListener('resize',setPlayer);
    window.addEventListener('orientationchange',setPlayer);
    activeController={stop};
    return activeController;
  }

  NS.ArcadeGames={tetris:startTetris,dodge:startDodge};
})(window.LogicLand);
