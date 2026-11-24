'use strict';
(function(NS){
  var current=null;
  function stop(){if(current){current.dead=true;if(current.timer)clearTimeout(current.timer);if(current.cleanup)current.cleanup();}current=null;}
  NS.stopBoardV82=stop;
  function start(opts){stop();var el=document.getElementById(opts.mountId);if(!el)return null;current={dead:false,timer:null};return el;}
  function banner(el,title,desc,boardHtml,footer){el.innerHTML='<div class="puzzleHeading"><strong>'+title+'</strong><p>'+desc+'</p></div>'+boardHtml+'<div class="puzzleHint" id="boardStatus" aria-live="polite">'+(footer||'')+'</div>';}
  function notify(el,text){var m=el.querySelector('#boardStatus');if(m)m.textContent=text;}
  function won(opts){if(current)current.dead=true;opts.onProgress&&opts.onProgress(1,'Missione completata');opts.onSuccess&&opts.onSuccess();}
  function failed(opts,reset,msg){if(current&&current.dead)return;var cont=opts.onMistake?opts.onMistake(msg):true;if(!cont){if(current)current.dead=true;return;}reset();}
  function dup(b){return b.map(function(r){return r.slice();});}
  function put(b,x,y){return y>=0&&y<b.length&&x>=0&&x<b.length?b[y][x]:null;}
  function inside(x,y,n){return x>=0&&y>=0&&x<n&&y<n;}

  // English draughts (checkers): mandatory jumps, multi-captures, king promotion,
  // no backwards movement for men, correct turn alternation, bot with minimax.
  function chMoves(board,side){
    var n=board.length,quiet=[],jumps=[];
    function dirs(piece){var all=[[1,1],[-1,1],[1,-1],[-1,-1]];return piece.toUpperCase()===piece?all:all.filter(function(d){return d[1]===(side==='w'?-1:1);});}
    function captures(b,x,y,p,path,removed){
      var found=false,ds=dirs(p);
      for(var j=0;j<ds.length;j++){
        var dx=ds[j][0],dy=ds[j][1],mx=x+dx,my=y+dy,tx=x+2*dx,ty=y+2*dy;
        var enemy=put(b,mx,my);
        if(!inside(tx,ty,n)||put(b,tx,ty)||!enemy||enemy.toLowerCase()===side)continue;
        found=true;
        var t=dup(b);t[y][x]='';t[my][mx]='';t[ty][tx]=p;
        var next=path.concat([{x:tx,y:ty,hit:[mx,my]}]);
        if(p.toUpperCase()!==p && (ty===0&&side==='w'||ty===n-1&&side==='b')){jumps.push({from:path[0].from,to:[tx,ty],path:next,capture:next.length});}
        else captures(t,tx,ty,p,next,removed+1);
      }
      if(!found&&removed>0)jumps.push({from:path[0].from,to:[x,y],path:path,capture:removed});
    }
    for(var y=0;y<n;y++)for(var x=0;x<n;x++){
      var p=board[y][x];if(!p||p.toLowerCase()!==side)continue;
      var dirs0=dirs(p);
      for(var j=0;j<dirs0.length;j++){
        var dx=dirs0[j][0],dy=dirs0[j][1],tx=x+dx,ty=y+dy;
        if(inside(tx,ty,n)&&!put(board,tx,ty))quiet.push({from:[x,y],to:[tx,ty],path:[{x:tx,y:ty}],capture:0});
      }
      captures(board,x,y,p,[{from:[x,y]}],0);
    }
    return jumps.length?jumps:quiet;
  }
  function chApply(board,move){var b=dup(board),fx=move.from[0],fy=move.from[1],p=b[fy][fx];b[fy][fx]='';for(var i=0;i<move.path.length;i++){var at=move.path[i];if(at.hit)b[at.hit[1]][at.hit[0]]='';}b[move.to[1]][move.to[0]]=(move.to[1]===0&&p==='w'||move.to[1]===b.length-1&&p==='b')?p.toUpperCase():p;return b;}
  function chEval(board){var score=0,n=board.length;for(var y=0;y<n;y++)for(var x=0;x<n;x++){var p=board[y][x];if(!p)continue;var val=(p.toUpperCase()===p?170:100);val+=((p.toLowerCase()==='b'?y:n-1-y)*3);score+=p.toLowerCase()==='b'?val:-val;}return score;}
  function chSearch(b,side,depth,alpha,beta){var ms=chMoves(b,side);if(!ms.length)return side==='b'?-10000:10000;if(depth===0)return chEval(b);
    ms=ms.slice().sort(function(a,b){return b.capture-a.capture;}).slice(0,depth>=3?10:14);
    var best=side==='b'?-Infinity:Infinity;
    for(var i=0;i<ms.length;i++){var v=chSearch(chApply(b,ms[i]),side==='b'?'w':'b',depth-1,alpha,beta);if(side==='b'){best=Math.max(best,v);alpha=Math.max(alpha,v);}else{best=Math.min(best,v);beta=Math.min(beta,v);}if(alpha>=beta)break;}
    return best;
  }
  function boardDimension(){
    // Actual square pixel geometry: 8 columns, 8 rows, never stretched on rotation.
    var w=(window.innerWidth||400)-40,h=(window.innerHeight||700)*.69;
    return Math.max(184,Math.floor(Math.min(w,h,424)/8)*8);
  }
  function checkers(opts){
    var el=start(opts);if(!el)return null;var lv=opts.level,n=8,rows=3;
    // All 24 pieces from level 1; successive levels improve the opponent,
    // not by deleting pieces or falsifying the board state.
    var depth=lv<=3?0:lv<=7?1:lv<=12?2:3;
    var botQuality=Math.min(.98,.13+lv*.056);
    var turns=0,selected=null,actions=[],board,whiteCount=0,redo=0,botBusy=false;
    var symbols={w:'⛀',W:'⛁',b:'⛂',B:'⛃'};
    function newBoard(){if(current&&current.timer)clearTimeout(current.timer);board=Array.from({length:n},function(){return Array(n).fill('');});for(var y=0;y<rows;y++)for(var x=0;x<n;x++){if((x+y)%2===1)board[y][x]='b';if((x+(n-1-y))%2===1)board[n-1-y][x]='w';}
      selected=null;actions=chMoves(board,'w');turns=0;botBusy=false;render();}
    function countPieces(side){var v=0;for(var y=0;y<n;y++)for(var x=0;x<n;x++)if(board[y][x]&&board[y][x].toLowerCase()===side)v++;return v;}
    function render(msg){if(current.dead)return;actions=chMoves(board,'w');var valid={};if(selected)actions.filter(function(m){return m.from[0]===selected[0]&&m.from[1]===selected[1];}).forEach(function(m){valid[m.to[0]+','+m.to[1]]=true;});
      var boardPx=boardDimension(),sqPx=boardPx/8;
      var h='<div class="chessBoard v82Board" style="width:'+boardPx+'px;height:'+boardPx+'px">';for(var y=0;y<8;y++)for(var x=0;x<8;x++){var p=board[y][x],dark=(x+y)%2===1,sel=selected&&selected[0]===x&&selected[1]===y;
        h+='<button class="chessSquare '+(dark?'darkSq':'lightSq')+(sel?' v82Selected':'')+(valid[x+','+y]?' v82Legal':'')+'" data-pos="'+x+','+y+'" style="width:'+sqPx+'px!important;height:'+sqPx+'px!important;flex:0 0 '+sqPx+'px" aria-label="Casella '+(x+1)+','+(y+1)+'">'+(p?'<span class="v82Checker '+(p.toLowerCase()==='w'?'v82White':'v82Black')+'">'+(p===p.toUpperCase()?'★':'')+'</span>':valid[x+','+y]?'<span class="v82LegalDot"></span>':'')+'</button>';
      }h+='</div><div class="puzzleButtons v82Utility"><button data-bact="help">💡 Regole</button><button data-bact="restart">↺ Ricomincia</button></div>';
      banner(el,'⛀ Dama Junior','Pedine chiare: sei tu. Le catture sono obbligatorie; è possibile saltare più pedine di seguito e diventare dama. <b>Vinci battendo il computer.</b> Avversario '+(lv<=5?'principiante':lv<=10?'intermedio':'avanzato')+'.',h,msg||'Seleziona una tua pedina: le destinazioni possibili si illuminano.');
      var bs=el.querySelectorAll('[data-pos]');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var xy=this.getAttribute('data-pos').split(',').map(Number);tap(xy[0],xy[1]);};
      var acts=el.querySelectorAll('[data-bact]');for(var i=0;i<acts.length;i++)acts[i].onclick=function(){if(this.getAttribute('data-bact')==='restart')newBoard();else notify(el,'Regole: sulle caselle scure, muovi in diagonale. Se puoi catturare devi farlo; le donne coronate muovono anche all’indietro.');};
    }
    function tap(x,y){if(current.dead||!board||botBusy)return;var p=board[y][x];if(p&&p.toLowerCase()==='w'){if(actions.some(function(m){return m.from[0]===x&&m.from[1]===y;})){selected=[x,y];render();}else notify(el,'Devi usare una pedina che può muovere o catturare.');return;}
      if(botBusy)return;
      if(!selected)return;var can=actions.filter(function(m){return m.from[0]===selected[0]&&m.from[1]===selected[1]&&m.to[0]===x&&m.to[1]===y;});
      if(!can.length){notify(el,'Mossa impossibile. Segui una casella verde.');return;}
      var chosen=can.sort(function(a,b){return b.capture-a.capture;})[0];board=chApply(board,chosen);turns++;selected=null;
      if(countPieces('b')===0||chMoves(board,'b').length===0){won(opts);return;}
      opts.onProgress&&opts.onProgress(Math.min(.95,turns/(8+lv*2)),turns+' mosse');render('Bravo! Il computer sta pensando…');
      botBusy=true;current.timer=setTimeout(botTurn,180);
    }
    function botTurn(){if(current.dead)return;botBusy=false;var ms=chMoves(board,'b');if(!ms.length){won(opts);return;}
      var move=ms[0];if(Math.random()<botQuality){var best=-Infinity;for(var i=0;i<ms.length;i++){var next=chApply(board,ms[i]);var val=depth>0?chSearch(next,'w',depth-1,-100000,100000):chEval(next);val+=ms[i].capture*20;if(val>best){best=val;move=ms[i];}}}else move=ms[Math.floor(Math.random()*ms.length)];
      board=chApply(board,move);
      if(countPieces('w')===0||chMoves(board,'w').length===0){failed(opts,newBoard,'Hai perso contro il computer: riprova la partita.');return;}
      selected=null;render(move.capture?'Il computer ha catturato una pedina. Pensa a una risposta!':'Ora tocca a te.');
    }
    var onResize=function(){if(current&&!current.dead)render();};
    window.addEventListener('resize',onResize);window.addEventListener('orientationchange',onResize);
    current.cleanup=function(){window.removeEventListener('resize',onResize);window.removeEventListener('orientationchange',onResize);};
    newBoard();return current;
  }

  // Chess Junior: real legal chess moves with occupied-square blocking, pawn
  // captures/promotion, king safety, check and checkmate. Mini-position training
  // first, then harder opponents; no castling/en-passant in this junior variant.
  var CS={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
  var cv={p:100,n:320,b:330,r:500,q:900,k:20000};
  function color(p){if(!p)return '';return p===p.toUpperCase()?'w':'b';}
  function pseudo(b,side){var m=[];
    function add(x,y,tx,ty,p){if(!inside(tx,ty,8))return false;var q=b[ty][tx];if(color(q)===side)return false;if(q&&q.toLowerCase()==='k')return false;m.push({from:[x,y],to:[tx,ty],takes:!!q});return !q;}
    for(var y=0;y<8;y++)for(var x=0;x<8;x++){
      var p=b[y][x];if(!p||color(p)!==side)continue;var t=p.toLowerCase(),ds=[],i;
      if(t==='p'){
        var dy=side==='w'?-1:1,ny=y+dy;
        if(inside(x,ny,8)&&!b[ny][x]){m.push({from:[x,y],to:[x,ny],takes:false});if((side==='w'&&y===6||side==='b'&&y===1)&&!b[y+2*dy][x])m.push({from:[x,y],to:[x,y+2*dy],takes:false});}
        for(var dx of [-1,1])if(inside(x+dx,ny,8)&&color(b[ny][x+dx])&&color(b[ny][x+dx])!==side&&b[ny][x+dx].toLowerCase()!=='k')m.push({from:[x,y],to:[x+dx,ny],takes:true});continue;
      }
      if(t==='n'){ds=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];for(i=0;i<ds.length;i++)add(x,y,x+ds[i][0],y+ds[i][1],p);continue;}
      if(t==='k'){for(var xx=-1;xx<=1;xx++)for(var yy=-1;yy<=1;yy++)if(xx||yy)add(x,y,x+xx,y+yy,p);continue;}
      if(t==='r'||t==='q')ds=ds.concat([[1,0],[-1,0],[0,1],[0,-1]]);
      if(t==='b'||t==='q')ds=ds.concat([[1,1],[-1,1],[1,-1],[-1,-1]]);
      for(i=0;i<ds.length;i++)for(var step=1;step<8;step++)if(!add(x,y,x+ds[i][0]*step,y+ds[i][1]*step,p))break;
    }
    return m;
  }
  function chessApply(b,m){var v=dup(b),p=v[m.from[1]][m.from[0]];v[m.from[1]][m.from[0]]='';if(p==='P'&&m.to[1]===0)p='Q';if(p==='p'&&m.to[1]===7)p='q';v[m.to[1]][m.to[0]]=p;return v;}
  function threatened(b,x,y,by){
    for(var yy=0;yy<8;yy++)for(var xx=0;xx<8;xx++){
      var p=b[yy][xx],t=p&&p.toLowerCase();if(color(p)!==by)continue;var dx=x-xx,dy=y-yy,ax=Math.abs(dx),ay=Math.abs(dy);
      if(t==='p'){if(ay===1&&ax===1&&dy===(by==='w'?-1:1))return true;continue;}
      if(t==='n'){if(ax===1&&ay===2||ax===2&&ay===1)return true;continue;}
      if(t==='k'){if(Math.max(ax,ay)===1)return true;continue;}
      if(!((t==='b'||t==='q')&&ax===ay||(t==='r'||t==='q')&&(dx===0||dy===0)))continue;
      var sx=Math.sign(dx),sy=Math.sign(dy),d=Math.max(ax,ay),clear=true;
      for(var i=1;i<d;i++)if(put(b,xx+sx*i,yy+sy*i)){clear=false;break;}if(clear)return true;
    }return false;
  }
  function inCheck(b,side){var target=side==='w'?'K':'k';for(var y=0;y<8;y++)for(var x=0;x<8;x++)if(b[y][x]===target)return threatened(b,x,y,side==='w'?'b':'w');return true;}
  function chessMoves(b,side){return pseudo(b,side).filter(function(m){return !inCheck(chessApply(b,m),side);});}
  function chessValue(b){var s=0;for(var y=0;y<8;y++)for(var x=0;x<8;x++){var p=b[y][x];if(p)s+=(color(p)==='b'?1:-1)*(cv[p.toLowerCase()]||0);}return s;}
  function chessSearch(b,side,depth,alpha,beta){var ms=chessMoves(b,side);if(!ms.length)return inCheck(b,side)?(side==='b'?-90000:90000):0;if(depth<=0)return chessValue(b);
    ms.sort(function(a,b){return Number(b.takes)-Number(a.takes);});var best=side==='b'?-Infinity:Infinity;
    for(var i=0;i<Math.min(20,ms.length);i++){var val=chessSearch(chessApply(b,ms[i]),side==='b'?'w':'b',depth-1,alpha,beta);if(side==='b'){best=Math.max(best,val);alpha=Math.max(alpha,val);}else{best=Math.min(best,val);beta=Math.min(beta,val);}if(alpha>=beta)break;}return best;
  }
  function chess(opts){
    var el=start(opts);if(!el)return null;
    var level=opts.level,selected=null,board,turn=0,actions=[],captured=0,botBusy=false;
    // Full normal starting army: 16 + 16 pieces, from level one.
    // Capture targets and computer skill both progress through the 15 levels.
    var target=level<=10?Math.ceil(level*.6):0;
    var aiDepth=level<=3?0:level<=8?1:2,quality=Math.min(.99,.12+level*.057);
    function setup(){if(current&&current.timer)clearTimeout(current.timer);
      board=Array.from({length:8},function(){return Array(8).fill('');});
      var black='rnbqkbnr',white='RNBQKBNR';
      for(var x=0;x<8;x++){
        board[0][x]=black.charAt(x);board[1][x]='p';
        board[6][x]='P';board[7][x]=white.charAt(x);
      }
      selected=null;turn=0;captured=0;botBusy=false;render();
    }
    function countBlack(){var r=0;for(var yy=0;yy<8;yy++)for(var xx=0;xx<8;xx++)if(board[yy][xx]&&color(board[yy][xx])==='b'&&board[yy][xx]!=='k')r++;return r;}
    function render(info){if(current.dead)return;actions=chessMoves(board,'w');var allowed={};if(selected)actions.filter(function(m){return m.from[0]===selected[0]&&m.from[1]===selected[1];}).forEach(function(m){allowed[m.to[0]+','+m.to[1]]=true;});
      var boardPx=boardDimension(),sqPx=boardPx/8;
      var html='<div class="chessBoard v82Board" style="width:'+boardPx+'px;height:'+boardPx+'px">';for(var y=0;y<8;y++)for(var x=0;x<8;x++){var p=board[y][x],dark=(x+y)%2!==0,sel=selected&&selected[0]===x&&selected[1]===y;
        html+='<button class="chessSquare '+(dark?'darkSq':'lightSq')+(sel?' v82Selected':'')+(allowed[x+','+y]?' v82Legal':'')+'" data-pos="'+x+','+y+'" style="width:'+sqPx+'px!important;height:'+sqPx+'px!important;flex:0 0 '+sqPx+'px" aria-label="Casella '+(x+1)+','+(y+1)+'">'+(p?'<span class="v82ChessPiece '+(color(p)==='w'?'v82ChessWhite':'v82ChessBlack')+'">'+CS[p]+'</span>':allowed[x+','+y]?'<span class="v82LegalDot"></span>':'')+'</button>';
      }
      html+='</div><div class="puzzleButtons v82Utility"><button data-act="help">💡 Regole</button><button data-act="restart">↺ Ricomincia</button></div>';
      var goal=target?'Cattura '+target+' '+(target===1?'pezzo avversario':'pezzi avversari')+' usando mosse legali.':'Conquista la vittoria dando scacco matto al Re nero.';
      banner(el,'♛ Scacchi Junior',goal+' Il computer gioca con i pezzi neri. I Re non possono restare sotto scacco.',html,info||'Tocca un pezzo bianco, poi una destinazione verde.');
      var bs=el.querySelectorAll('[data-pos]');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var xy=this.getAttribute('data-pos').split(',').map(Number);tap(xy[0],xy[1]);};
      var aa=el.querySelectorAll('[data-act]');for(var i=0;i<aa.length;i++)aa[i].onclick=function(){if(this.getAttribute('data-act')==='restart')setup();else notify(el,'Il Re non può restare sotto scacco. Cavallo a L; alfiere in diagonale; torre in riga o colonna; Regina in tutte queste direzioni; pedone avanti e cattura in diagonale. Arrocco ed en passant non sono previsti nella versione Junior.');};
    }
    function tap(x,y){if(current.dead||botBusy)return;var p=board[y][x];if(color(p)==='w'){
      if(actions.some(function(m){return m.from[0]===x&&m.from[1]===y;})){selected=[x,y];render();}else notify(el,'Quel pezzo non può muoversi ora.');return;}
      if(!selected)return;var m=actions.find(function(m){return m.from[0]===selected[0]&&m.from[1]===selected[1]&&m.to[0]===x&&m.to[1]===y;});
      if(!m){notify(el,'Mossa non consentita. Segui una destinazione illuminata.');return;}
      var wasBlack=countBlack();board=chessApply(board,m);captured+=wasBlack-countBlack();selected=null;turn++;
      var opponentMoves=chessMoves(board,'b');
      if(!opponentMoves.length){if(inCheck(board,'b')){won(opts);return;}else{failed(opts,setup,'Patta per stallo: nessuna mossa legale al computer.');return;}}
      if(target&&captured>=target){won(opts);return;}
      opts.onProgress&&opts.onProgress(Math.min(.92,target?captured/target:turn/(10+level)),target?captured+'/'+target+' catture':turn+' mosse');
      botBusy=true;render('Il computer sta scegliendo una risposta…');current.timer=setTimeout(bot,160);
    }
    function bot(){if(current.dead)return;botBusy=false;var moves=chessMoves(board,'b');if(!moves.length){won(opts);return;}
      var mv=moves[Math.floor(Math.random()*moves.length)];
      if(Math.random()<quality){var best=-Infinity;for(var i=0;i<moves.length;i++){var b=chessApply(board,moves[i]);var val=aiDepth>0?chessSearch(b,'w',aiDepth-1,-100000,100000):chessValue(b);val+=moves[i].takes?18:0;if(val>best){best=val;mv=moves[i];}}}
      board=chessApply(board,mv);
      var me=chessMoves(board,'w');if(!me.length){failed(opts,setup,inCheck(board,'w')?'Scacco matto del computer: riprova.':'Posizione senza mosse: si ricomincia.');return;}
      render(inCheck(board,'w')?'Attenzione, sei sotto scacco!':'Tocca a te: pensa alla prossima mossa.');
    }
    var onResize=function(){if(current&&!current.dead)render();};
    window.addEventListener('resize',onResize);window.addEventListener('orientationchange',onResize);
    current.cleanup=function(){window.removeEventListener('resize',onResize);window.removeEventListener('orientationchange',onResize);};
    setup();return current;
  }
  var prev=NS.stopPuzzle;
  NS.stopPuzzle=function(){stop();if(prev)prev();};
  var old=NS.PuzzleGames||{};
  NS.PuzzleGames=Object.assign({},old,{checkers:checkers,chess:chess});
  // Exposed strictly for automatic rule testing; not used as an answer oracle.
  NS.BoardRulesV82={checkersMoves:chMoves,checkersApply:chApply,chessMoves:chessMoves,chessApply:chessApply,inCheck:inCheck};
  var profile=NS.newGameProfile;
  NS.newGameProfile=function(level,key){
    if(key==='checkers')return {level:level,load:level*120,piecesPerSide:12,botSkill:Math.min(.98,.13+level*.056),captures:1+Math.floor((level-1)/5),decoys:level,boardSize:8,aiDepth:level<=3?0:level<=7?1:level<=12?2:3};
    if(key==='chess')return {level:level,load:level*120,piecesPerSide:16,botSkill:Math.min(.99,.12+level*.057),captureTarget:level<=10?Math.ceil(level*.6):0,steps:1+Math.floor((level-1)/5),blockers:Math.floor((level-1)/3),piece:Math.min(5,Math.floor((level-1)/2))};
    return profile(level,key);
  };
})(window.LogicLand);
