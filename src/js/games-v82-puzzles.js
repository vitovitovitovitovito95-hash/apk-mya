'use strict';
(function(NS){
  // All 15 Rush Hour boards were solved by exhaustive shortest-path BFS offline.
  // Solutions require strictly more slides: see tests/v82_mechanics_test.js.
  var UNBLOCK = [{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"v","l":2,"fixed":3,"p":0},{"o":"v","l":2,"fixed":1,"p":4},{"o":"h","l":2,"fixed":5,"p":3}],"moves":1},{"pieces":[{"o":"h","l":2,"fixed":2,"p":2},{"o":"v","l":2,"fixed":4,"p":1},{"o":"h","l":3,"fixed":0,"p":3},{"o":"h","l":3,"fixed":1,"p":0}],"moves":2},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"v","l":3,"fixed":4,"p":0},{"o":"h","l":2,"fixed":1,"p":2},{"o":"v","l":2,"fixed":5,"p":2}],"moves":3},{"pieces":[{"o":"h","l":2,"fixed":2,"p":1},{"o":"h","l":2,"fixed":5,"p":3},{"o":"h","l":2,"fixed":4,"p":2},{"o":"v","l":3,"fixed":3,"p":0}],"moves":4},{"pieces":[{"o":"h","l":2,"fixed":2,"p":1},{"o":"h","l":3,"fixed":5,"p":2},{"o":"v","l":2,"fixed":1,"p":4},{"o":"v","l":3,"fixed":3,"p":0},{"o":"h","l":2,"fixed":3,"p":2}],"moves":5},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"h","l":2,"fixed":4,"p":1},{"o":"v","l":3,"fixed":3,"p":3},{"o":"v","l":3,"fixed":5,"p":1},{"o":"v","l":2,"fixed":2,"p":2},{"o":"v","l":2,"fixed":3,"p":0},{"o":"h","l":2,"fixed":5,"p":4}],"moves":6},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"v","l":3,"fixed":4,"p":2},{"o":"h","l":2,"fixed":4,"p":0},{"o":"v","l":2,"fixed":5,"p":4},{"o":"h","l":2,"fixed":1,"p":2},{"o":"v","l":2,"fixed":5,"p":2},{"o":"h","l":3,"fixed":0,"p":3},{"o":"v","l":2,"fixed":0,"p":0},{"o":"v","l":2,"fixed":2,"p":3},{"o":"v","l":3,"fixed":3,"p":2},{"o":"h","l":3,"fixed":5,"p":0},{"o":"h","l":2,"fixed":1,"p":4}],"moves":7},{"pieces":[{"o":"h","l":2,"fixed":2,"p":2},{"o":"v","l":3,"fixed":5,"p":0},{"o":"h","l":3,"fixed":3,"p":3},{"o":"v","l":3,"fixed":1,"p":1},{"o":"v","l":2,"fixed":0,"p":3},{"o":"v","l":2,"fixed":3,"p":0},{"o":"h","l":2,"fixed":5,"p":4},{"o":"v","l":2,"fixed":2,"p":3},{"o":"v","l":2,"fixed":0,"p":0},{"o":"v","l":2,"fixed":1,"p":4},{"o":"h","l":2,"fixed":5,"p":2}],"moves":8},{"pieces":[{"o":"h","l":2,"fixed":2,"p":1},{"o":"h","l":2,"fixed":5,"p":3},{"o":"h","l":2,"fixed":5,"p":0},{"o":"v","l":2,"fixed":5,"p":1},{"o":"v","l":2,"fixed":3,"p":2},{"o":"h","l":2,"fixed":1,"p":3},{"o":"v","l":2,"fixed":0,"p":2},{"o":"v","l":2,"fixed":4,"p":2},{"o":"h","l":2,"fixed":0,"p":0},{"o":"h","l":2,"fixed":1,"p":0},{"o":"v","l":2,"fixed":1,"p":3},{"o":"h","l":3,"fixed":4,"p":3}],"moves":9},{"pieces":[{"o":"h","l":2,"fixed":2,"p":2},{"o":"h","l":2,"fixed":4,"p":4},{"o":"v","l":2,"fixed":0,"p":1},{"o":"v","l":2,"fixed":1,"p":1},{"o":"v","l":2,"fixed":3,"p":3},{"o":"v","l":2,"fixed":2,"p":3},{"o":"v","l":2,"fixed":3,"p":0},{"o":"v","l":2,"fixed":0,"p":4},{"o":"v","l":2,"fixed":4,"p":2},{"o":"h","l":2,"fixed":1,"p":4},{"o":"v","l":2,"fixed":5,"p":2},{"o":"h","l":2,"fixed":3,"p":0}],"moves":10},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"v","l":2,"fixed":3,"p":2},{"o":"h","l":2,"fixed":0,"p":1},{"o":"h","l":2,"fixed":4,"p":1},{"o":"v","l":2,"fixed":0,"p":3},{"o":"v","l":2,"fixed":5,"p":0},{"o":"v","l":2,"fixed":2,"p":2},{"o":"h","l":2,"fixed":1,"p":0},{"o":"h","l":2,"fixed":4,"p":3},{"o":"h","l":2,"fixed":1,"p":3},{"o":"h","l":2,"fixed":5,"p":4},{"o":"v","l":2,"fixed":4,"p":2}],"moves":11},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"v","l":3,"fixed":2,"p":1},{"o":"h","l":2,"fixed":5,"p":4},{"o":"v","l":2,"fixed":3,"p":3},{"o":"v","l":3,"fixed":5,"p":0},{"o":"v","l":2,"fixed":0,"p":4},{"o":"h","l":2,"fixed":0,"p":3},{"o":"v","l":2,"fixed":1,"p":4},{"o":"h","l":2,"fixed":4,"p":4},{"o":"h","l":2,"fixed":3,"p":4},{"o":"v","l":2,"fixed":1,"p":0},{"o":"h","l":2,"fixed":5,"p":2}],"moves":12},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"h","l":2,"fixed":4,"p":4},{"o":"v","l":2,"fixed":5,"p":1},{"o":"h","l":3,"fixed":5,"p":3},{"o":"v","l":2,"fixed":3,"p":3},{"o":"v","l":2,"fixed":2,"p":4},{"o":"v","l":2,"fixed":0,"p":3},{"o":"h","l":2,"fixed":0,"p":1},{"o":"v","l":3,"fixed":4,"p":1},{"o":"v","l":2,"fixed":1,"p":3},{"o":"v","l":2,"fixed":3,"p":1}],"moves":13},{"pieces":[{"o":"h","l":2,"fixed":2,"p":1},{"o":"h","l":2,"fixed":4,"p":3},{"o":"v","l":2,"fixed":5,"p":1},{"o":"v","l":3,"fixed":3,"p":1},{"o":"v","l":2,"fixed":0,"p":3},{"o":"h","l":3,"fixed":0,"p":2},{"o":"v","l":3,"fixed":2,"p":3},{"o":"h","l":2,"fixed":0,"p":0},{"o":"v","l":2,"fixed":5,"p":3},{"o":"v","l":2,"fixed":4,"p":2}],"moves":15},{"pieces":[{"o":"h","l":2,"fixed":2,"p":0},{"o":"v","l":2,"fixed":3,"p":3},{"o":"h","l":2,"fixed":0,"p":2},{"o":"v","l":2,"fixed":4,"p":3},{"o":"v","l":2,"fixed":3,"p":1},{"o":"v","l":2,"fixed":0,"p":0},{"o":"v","l":2,"fixed":4,"p":1},{"o":"h","l":3,"fixed":4,"p":0},{"o":"v","l":2,"fixed":5,"p":2},{"o":"v","l":2,"fixed":2,"p":2},{"o":"h","l":2,"fixed":5,"p":2}],"moves":19}];
  // Each Flow board has an embedded guaranteed full-cover solution.
  var FLOW = [{"n":4,"paths":[[10,14,15,11,7,3,2],[6,5,1,0,4,8,9,13,12]],"pairs":2,"difficulty":49},{"n":4,"paths":[[14,15,11,10,6,7],[3,2,1,0,4,5,9,8,12,13]],"pairs":2,"difficulty":50},{"n":4,"paths":[[9,13,12,8,4,0],[1,5,6,2,3,7,11,10,14,15]],"pairs":2,"difficulty":51},{"n":4,"paths":[[13,12,8,4,0,1],[5,9,10,14,15],[11,7,6,2,3]],"pairs":3,"difficulty":60},{"n":5,"paths":[[18,19,24,23,22,17,12,13,14,9],[4,3,8,7,2,1,0],[5,6,11,10,15,16,21,20]],"pairs":3,"difficulty":79},{"n":5,"paths":[[6,5,0,1,2,3,4],[9,8,7,12,13,14,19,24,23],[18,17,22,21,20,15,16,11,10]],"pairs":3,"difficulty":80},{"n":5,"paths":[[10,5,0,1,6],[11,16,15,20,21],[22,17,12,7,2,3,4,9,8,13],[14,19,18,23,24]],"pairs":4,"difficulty":89},{"n":5,"paths":[[0,5,10,15,20,21,22],[23,24,19,14,9,4,3],[2,1,6,7,8,13],[18,17,16,11,12]],"pairs":4,"difficulty":90},{"n":6,"paths":[[34,35,29,28,27,33,32,31,30,24,18],[12,6,0,1,2,3],[4,5,11,17,23],[22,21,20,26,25,19,13,7,8,14,15,16,10,9]],"pairs":4,"difficulty":113},{"n":6,"paths":[[31,30,24,18,12,6,0,1],[2,3,4,5,11,10,9,8,7],[13,19,25,26,32,33,34],[35,29,23,17,16,22,28],[27,21,20,14,15]],"pairs":5,"difficulty":122},{"n":6,"paths":[[4,5,11,10,16],[17,23,29,35,34,28,22],[21,15,9,3,2,1,0,6],[7,8,14,13,12,18,19],[20,26,27,33,32,31,30,24,25]],"pairs":5,"difficulty":123},{"n":6,"paths":[[8,2,1,0,6,7,13],[12,18,24,30,31,25,19,20,14],[15,9,3,4,5,11,10],[16,17,23,22,21,27],[26,32,33,34,28,29,35]],"pairs":5,"difficulty":124},{"n":7,"paths":[[26,27,20,13,6,5,12,19,18,25,24,17,16,23,30],[31,32,33,34,41,48,47,40,39],[46,45,38,37,44,43,42,35],[36,29,28,21,22,15,14],[7,0,1,8,9,2,3,10,11,4]],"pairs":5,"difficulty":151},{"n":7,"paths":[[30,23,22,21,14,15,16,9],[8,7,0,1,2,3,4,5,6,13],[12,11,10,17,18,19,20,27,26],[25,24,31,32,33,34,41,48,47,40],[39,46,45,38,37,44,43,42,35,28,29,36]],"pairs":5,"difficulty":152},{"n":7,"paths":[[6,5,4,3,2,1,0,7,14,21],[28,35,42,43,36,29,22,15,8,9],[16,23,30,37,44,45,38,31,24,17,10],[11,12,13,20,27,34,41,48],[47,46,39,40,33,32,25,18,19,26]],"pairs":5,"difficulty":153}];
  var C=['#ff5269','#23bafb','#f6d34b','#53da82','#b47aff','#ff9a43'];
  var current=null;
  function stop(){if(current){if(current.cleanup)current.cleanup();current.dead=true;current=null;}}
  NS.stopAdvancedPuzzle=stop;
  function begin(opts){stop();var el=document.getElementById(opts.mountId);if(!el)return null;current={dead:false};return el;}
  function problem(el,heading,sub,content){el.innerHTML='<div class="puzzleHeading"><strong>'+heading+'</strong><p>'+sub+'</p></div>'+content+'<div id="puzzleMsg" class="puzzleHint" aria-live="polite"></div>';}
  function hint(el,msg){var box=el.querySelector('#puzzleMsg');if(box)box.textContent=msg;}
  function victory(opts){if(current)current.dead=true;opts.onProgress&&opts.onProgress(1,'Livello completato!');opts.onSuccess&&opts.onSuccess();}
  function mistake(opts,msg){return opts.onMistake?opts.onMistake(msg):true;}

  function unblock(opts){
    var el=begin(opts);if(!el)return null;
    var saved=UNBLOCK[opts.level-1],cars=saved.pieces.map(function(p,i){return {o:p.o,len:p.l,f:p.fixed,p:p.p,id:i};});
    var selected=0,moves=0,maxMoves=saved.moves+Math.max(2,Math.floor((16-opts.level)/3));
    var history=[],fresh=JSON.stringify(cars),drag=null;
    function occupied(x,y,skip){
      for(var i=0;i<cars.length;i++)if(i!==skip){var c=cars[i];for(var j=0;j<c.len;j++)if((c.o==='h'?c.p+j:c.f)===x&&(c.o==='h'?c.f:c.p+j)===y)return true;}
      return false;
    }
    function canPlace(id,p){
      var c=cars[id];if(p<0||p>6-c.len)return false;
      for(var k=0;k<c.len;k++)if(occupied(c.o==='h'?p+k:c.f,c.o==='h'?c.f:p+k,id))return false;
      return true;
    }
    function limits(id){
      var c=cars[id],lo=c.p,hi=c.p;
      while(canPlace(id,lo-1))lo--;
      while(canPlace(id,hi+1))hi++;
      return {lo:lo,hi:hi};
    }
    function reset(){cars=JSON.parse(fresh);moves=0;selected=0;history=[];render();}
    function slideTo(id,dest){
      if(!current||current.dead)return;
      var c=cars[id],cap=limits(id);
      dest=Math.min(cap.hi,Math.max(cap.lo,dest));
      if(dest===c.p){render();return;}
      history.push({id:id,p:c.p});c.p=dest;selected=id;moves++;
      if(id===0&&c.p===4){victory(opts);return;}
      if(moves>maxMoves){if(!mistake(opts,'Hai usato troppe mosse: riprova con un percorso più breve.')){current.dead=true;return;}reset();return;}
      if(opts.onProgress)opts.onProgress(Math.min(.95,moves/maxMoves),moves+' mosse');
      render();
    }
    function releaseListeners(){
      document.removeEventListener('mousemove',mouseMove,false);
      document.removeEventListener('mouseup',mouseEnd,false);
      drag=null;
    }
    function point(e){return {x:e.clientX,y:e.clientY};}
    function movePoint(pt){
      if(!drag)return;
      var d=drag.c.o==='h'?pt.x-drag.x:pt.y-drag.y;
      var low=(drag.range.lo-drag.original)*drag.cell,high=(drag.range.hi-drag.original)*drag.cell;
      drag.delta=Math.min(high,Math.max(low,d));
      drag.node.style.transform=drag.c.o==='h'?'translate3d('+drag.delta+'px,0,0)':'translate3d(0,'+drag.delta+'px,0)';
    }
    function endPoint(pt){
      if(!drag)return;
      movePoint(pt);
      var id=drag.id,step=drag.delta/drag.cell,original=drag.original;
      var rounded=Math.abs(step)<.20?0:Math.round(step);
      var dest=original+rounded;
      releaseListeners();
      slideTo(id,dest);
    }
    function mouseMove(e){if(drag){e.preventDefault();movePoint(point(e));}}
    function mouseEnd(e){if(drag){e.preventDefault();endPoint(point(e));}}
    function startDrag(id,pt,node,board){
      if(!current||current.dead)return;
      selected=id;
      var c=cars[id];
      drag={id:id,c:c,original:c.p,x:pt.x,y:pt.y,delta:0,node:node,range:limits(id),cell:board.clientWidth/6};
      node.classList.add('draggingWood');
    }
    function render(){
      if(!current||current.dead)return;
      var h='<div class="unblockBoard v82Unblock" aria-label="Puzzle dei blocchi da trascinare"><div class="unblockGrid">';
      for(var t=0;t<36;t++)h+='<span></span>';
      h+='</div>';
      cars.forEach(function(c,i){
        var x=c.o==='h'?c.p:c.f,y=c.o==='h'?c.f:c.p,w=c.o==='h'?c.len:1,hh=c.o==='v'?c.len:1;
        h+='<button type="button" class="woodBlock '+(i===0?'redWood ':'')+'" data-block="'+i+'" style="left:'+(x*100/6)+'%;top:'+(y*100/6)+'%;width:'+(w*100/6)+'%;height:'+(hh*100/6)+'%" aria-label="'+(i===0?'Blocco rosso':'Blocco '+i)+' da trascinare">'+(i===0?'➜':'')+'</button>';
      });
      h+='<span class="exitArrow">➜</span></div>'+
      '<div class="puzzleButtons v82Utility"><button data-util="undo">↶ Annulla</button><button data-util="hint">💡 Aiuto</button><button data-util="restart">↺ Ricomincia</button></div>'+
      '<div class="puzzleCount">Mosse: '+moves+'/'+maxMoves+' • Soluzione minima: '+saved.moves+' • Blocchi: '+cars.length+'</div>';
      problem(el,'🪵 Unlock Me','Trascina con un dito direttamente i legnetti, soltanto lungo il loro asse. Fai uscire il blocco rosso a destra.',h);
      var board=el.querySelector('.unblockBoard'),blocks=el.querySelectorAll('[data-block]');
      for(var i=0;i<blocks.length;i++)(function(node){
        var id=Number(node.getAttribute('data-block'));
        node.addEventListener('touchstart',function(e){
          if(!e.touches||!e.touches.length)return;
          if(e.cancelable)e.preventDefault();
          var t=e.touches[0];startDrag(id,{x:t.clientX,y:t.clientY},node,board);
        },{passive:false});
        node.addEventListener('mousedown',function(e){
          if(Date.now()-lastTouch<700)return;
          e.preventDefault();startDrag(id,point(e),node,board);
          document.addEventListener('mousemove',mouseMove,false);
          document.addEventListener('mouseup',mouseEnd,false);
        },false);
      })(blocks[i]);
      var lastTouch=0;
      board.addEventListener('touchmove',function(e){
        if(!drag||!e.touches||!e.touches.length)return;
        if(e.cancelable)e.preventDefault();
        var t=e.touches[0];movePoint({x:t.clientX,y:t.clientY});
      },{passive:false});
      board.addEventListener('touchend',function(e){
        if(!drag||!e.changedTouches||!e.changedTouches.length)return;
        if(e.cancelable)e.preventDefault();
        lastTouch=Date.now();var t=e.changedTouches[0];endPoint({x:t.clientX,y:t.clientY});
      },{passive:false});
      board.addEventListener('touchcancel',function(){if(drag){releaseListeners();render();}},false);
      var util=el.querySelectorAll('[data-util]');for(var k=0;k<util.length;k++)util[k].onclick=function(){
        var a=this.getAttribute('data-util');
        if(a==='restart')reset();
        else if(a==='undo'){if(history.length){var prev=history.pop();cars[prev.id].p=prev.p;moves=Math.max(0,moves-1);selected=prev.id;render();}}
        else{var c=cars[selected];hint(el,'Trascina '+(c.o==='h'?'a sinistra o a destra':'in alto o in basso')+' il blocco che vuoi muovere. Libera prima il passaggio del rosso.');}
      };
    }
    current.cleanup=releaseListeners;
    render();return current;
  }

  function dots(opts){
    var el=begin(opts);if(!el)return null;var c=FLOW[opts.level-1],n=c.n,pairs=c.paths.length;
    var ends={},paths=[];
    for(var i=0;i<pairs;i++){var p=c.paths[i];ends[p[0]]=i;ends[p[p.length-1]]=i;paths.push([]);}
    var active=-1,errors=0,board=null,cellNodes=[],filled=0;
    function owners(){var m={};for(var k=0;k<paths.length;k++)for(var t=0;t<paths[k].length;t++)m[paths[k][t]]=k;return m;}
    function draw(){
      var h='<div class="v82FlowWrap"><div class="dotsBoard v82Flow" style="grid-template-columns:repeat('+n+',1fr);">';
      for(var i=0;i<n*n;i++)h+='<button class="dotCell" data-cell="'+i+'" style="width:'+(100/n)+'%;height:'+(100/n)+'%" aria-label="Casella '+(i+1)+'"><span class="flowInner"></span></button>';
      h+='</div></div><div class="puzzleButtons v82Utility"><button data-action="undo">↶ Indietro</button><button data-action="clear">🧹 Cancella</button><button data-action="check">✓ Controlla</button></div>'+
      '<div class="puzzleCount" id="flowStats">Griglia '+n+'×'+n+' • '+pairs+' coppie • Riempimento 0/'+(n*n)+'</div>';
      problem(el,'🔗 Connect the Dots','Unisci i colori senza incrociare i percorsi e riempi <b>tutta</b> la griglia. Tocca o trascina il dito.',h);
      board=el.querySelector('.dotsBoard');cellNodes=Array.prototype.slice.call(el.querySelectorAll('[data-cell]'));
      var dragging=false,usedTouch=false;
      function target(t){if(!t)return -1;var b=board.getBoundingClientRect();if(t.clientX<b.left||t.clientX>=b.right||t.clientY<b.top||t.clientY>=b.bottom)return -1;return Math.floor((t.clientY-b.top)/b.height*n)*n+Math.floor((t.clientX-b.left)/b.width*n);}
      board.addEventListener('touchstart',function(e){if(e.touches.length){dragging=true;usedTouch=true;step(target(e.touches[0]));e.preventDefault();}},{passive:false});
      board.addEventListener('touchmove',function(e){if(dragging&&e.touches.length){step(target(e.touches[0]));e.preventDefault();}},{passive:false});
      board.addEventListener('touchend',function(){dragging=false;setTimeout(function(){usedTouch=false;},250);});
      board.addEventListener('click',function(e){if(usedTouch)return;var b=e.target;while(b&&b!==board&&!b.hasAttribute('data-cell'))b=b.parentNode;if(b&&b.hasAttribute&&b.hasAttribute('data-cell'))step(+b.getAttribute('data-cell'));});
      var actions=el.querySelectorAll('[data-action]');for(var i=0;i<actions.length;i++)actions[i].onclick=function(){var a=this.getAttribute('data-action');if(a==='clear'){paths=paths.map(function(){return [];});active=-1;refresh();}else if(a==='undo'){if(active>=0&&paths[active].length){paths[active].pop();if(!paths[active].length)active=-1;}else{var last=paths.findIndex(function(p){return p.length>1;});if(last>=0){paths[last].pop();active=last;}}refresh();}else{var own=owners(),solved=paths.every(function(p,k){return p.length>1&&ends[p[0]]===k&&ends[p[p.length-1]]===k;});if(solved&&Object.keys(own).length===n*n){victory(opts);}else{var more=n*n-Object.keys(own).length;hint(el,'Mancano '+more+' caselle e/o coppie non completate.');if(!mistake(opts,'Griglia non completa.'))current.dead=true;}}};
      refresh();
    }
    function step(i){if(current.dead||i<0||i>=n*n)return;var who=ends[i],own=owners();
      if(who!==undefined&&paths[who].length===0){paths[who]=[i];active=who;refresh();return;}
      if(who!==undefined&&active!==who){ // allow restarting a completed path from its starting endpoint
        if(paths[who].length&&paths[who][0]===i){paths[who]=[i];active=who;refresh();}return;
      }
      if(active<0)return;
      var p=paths[active],last=p[p.length-1];if(p.length>1&&last===i)return;
      if(p.length>1&&p[p.length-2]===i){p.pop();refresh();return;}
      if(Math.abs(i%n-last%n)+Math.abs(Math.floor(i/n)-Math.floor(last/n))!==1)return;
      if(own[i]!==undefined)return;
      if(who!==undefined&&who!==active)return;
      p.push(i);if(who===active)active=-1;
      var occup=owners(),filled=Object.keys(occup).length;
      opts.onProgress&&opts.onProgress(Math.min(.98,filled/(n*n)),filled+'/'+(n*n)+' caselle');
      if(filled===n*n&&paths.every(function(q,k){return q.length>1&&ends[q[0]]===k&&ends[q[q.length-1]]===k;})){victory(opts);return;}
      refresh();
    }
    function refresh(){if(!cellNodes.length)return;var owner=owners(),total=Object.keys(owner).length;
      for(var i=0;i<n*n;i++){var b=cellNodes[i],col=owner[i]!==undefined?owner[i]:ends[i],which=col!==undefined?C[col]:null;var html='';
        if(owner[i]!==undefined){var p=paths[col],q=p.indexOf(i),neighbors=[];if(q>0)neighbors.push(p[q-1]);if(q<p.length-1)neighbors.push(p[q+1]);for(var j=0;j<neighbors.length;j++){var delta=neighbors[j]-i;html+='<span class="flowArm '+(delta===1?'flowR':delta===-1?'flowL':delta===n?'flowD':'flowU')+'" style="background:'+which+'"></span>';}}
        if(which)html+='<span class="flowCore" style="background:'+which+'"></span>';
        if(ends[i]!==undefined)html+='<span class="flowEnd" style="background:'+which+'"></span>';
        b.firstChild.innerHTML=html;b.className='dotCell'+(owner[i]!==undefined?' flowUsed':'');
      }
      var stats=el.querySelector('#flowStats');if(stats)stats.textContent='Griglia '+n+'×'+n+' • '+pairs+' coppie • Riempimento '+total+'/'+(n*n);
    }
    draw();return current;
  }
  var old=NS.PuzzleGames || {};
  NS.PuzzleGames=Object.assign({},old,{unblock:unblock,dots:dots});
  var prev=NS.stopPuzzle;
  NS.stopPuzzle=function(){stop();if(prev)prev();};
  var before=NS.newGameProfile;
  NS.newGameProfile=function(level,key){if(key==='unblock')return {level:level,load:level*120,obstacles:UNBLOCK[level-1].pieces.length-1,optimalSlides:UNBLOCK[level-1].moves};if(key==='dots')return {level:level,load:level*120,size:FLOW[level-1].n,pairs:FLOW[level-1].paths.length};return before(level,key);};
  // v8.3: within a fixed board size and pair count, present Flow puzzles
  // in increasing order of directional turns (actual path geometry).
  // Boards, solutions and rules themselves are unchanged.
  function flowBends(f){var total=0;f.paths.forEach(function(p){for(var i=2;i<p.length;i++)if(p[i]-p[i-1]!==p[i-1]-p[i-2])total++;});return total;}
  for(var start=0;start<FLOW.length;){
    var end=start+1;
    while(end<FLOW.length&&FLOW[end].n===FLOW[start].n&&FLOW[end].paths.length===FLOW[start].paths.length)end++;
    var group=FLOW.slice(start,end).sort(function(a,b){return flowBends(a)-flowBends(b);});
    for(var i=start;i<end;i++)FLOW[i]=group[i-start];
    start=end;
  }
  NS.PuzzleV82Data={unblock:UNBLOCK,flow:FLOW};
})(window.LogicLand);
