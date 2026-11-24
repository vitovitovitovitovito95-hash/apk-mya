'use strict';
(function(NS){
  const COLORS=['🔴','🔵','🟢','🟡','🟣','🟠'];
  const SHAPES=['●','▲','■','◆','★','⬟'];
  const ARROWS=['⬆️','➡️','⬇️','⬅️'];

  function qShapes(level){
    const band=NS.levelBand(level),mode=NS.rnd(0,Math.min(4,band));let seq=[],answer,hint;
    if(mode===0){const a=NS.pick(COLORS),b=NS.pick(COLORS.filter(x=>x!==a));seq=[a,b,a,b,a];answer=b;hint='I due colori si alternano.';}
    else if(mode===1){const a=NS.pick(SHAPES),b=NS.pick(SHAPES.filter(x=>x!==a)),c=NS.pick(SHAPES.filter(x=>x!==a&&x!==b));seq=[a,b,c,a,b];answer=c;hint='Si ripete un gruppo di tre forme.';}
    else if(mode===2){const a=NS.pick(COLORS),b=NS.pick(COLORS.filter(x=>x!==a));seq=[a,a,b,a,a,b,a,a];answer=b;hint='Il terzo elemento di ogni gruppo cambia colore.';}
    else if(mode===3){const start=NS.rnd(0,3),step=NS.pick([1,3]);seq=Array.from({length:5},(_,i)=>ARROWS[(start+i*step)%4]);answer=ARROWS[(start+5*step)%4];hint=step===1?'La freccia ruota di 90° a destra.':'La freccia ruota di 90° a sinistra.';}
    else{const a=NS.pick(SHAPES),b=NS.pick(SHAPES.filter(x=>x!==a));seq=[a,b,b,a,b,b,a];answer=b;hint='Osserva il blocco di tre: una forma, poi due uguali.';}
    return {prompt:'Quale figura viene dopo?',visual:`<div class="bigVisual">${seq.join(' ')} ?</div>`,options:NS.uniqueOptions(answer,[...COLORS,...SHAPES,...ARROWS]),answer,hint};
  }

  function qMatrix(level){
    const band=NS.levelBand(level),colors=NS.shuffle(COLORS).slice(0,3),shapes=NS.shuffle(SHAPES).slice(0,3);
    if(band<=2){
      const s1=shapes[0],s2=shapes[1],c1=colors[0],c2=colors[1],token=(s,c)=>`<span class="vtoken" data-color="${c}">${c}${s}</span>`;
      const answer=c2+s2;
      return {prompt:'Completa la matrice logica',sub:'Nella colonna cambia la forma; nella riga cambia il colore.',visual:`<div class="matrix"><i>${token(s1,c1)}</i><i>${token(s1,c2)}</i><i>${token(s2,c1)}</i><i>?</i></div>`,options:NS.uniqueOptions(answer,[c1+s1,c2+s1,c1+s2,colors[2]+s2]),answer,hint:'Prendi il colore della casella sopra e la forma della casella a sinistra.'};
    }
    const a=shapes[0],b=shapes[1],c=shapes[2],arr=[[a,b,c],[b,c,a],[c,a,'?']],answer=b;
    return {prompt:'Completa la matrice 3×3',sub:'Ogni riga contiene le stesse tre forme, ma spostate.',visual:`<div class="matrix3">${arr.flat().map(x=>`<i>${x}</i>`).join('')}</div>`,options:NS.shuffle([a,b,c,SHAPES.find(x=>![a,b,c].includes(x))]),answer,hint:'Confronta l’ordine delle forme nelle tre righe.'};
  }

  function qMirror(level){
    const band=NS.levelBand(level),orig=NS.pick(ARROWS),vertical=band<=2?true:NS.rnd(0,1)===0;
    const mapH={'⬅️':'➡️','➡️':'⬅️','⬆️':'⬆️','⬇️':'⬇️'},mapV={'⬅️':'⬅️','➡️':'➡️','⬆️':'⬇️','⬇️':'⬆️'};
    const answer=(vertical?mapH:mapV)[orig];
    return {prompt:`Specchio ${vertical?'verticale':'orizzontale'}: cosa vedi?`,visual:`<div class="bigVisual">${orig} 🪞 ?</div>`,options:NS.shuffle(ARROWS),answer,hint:vertical?'Destra e sinistra si scambiano.':'Alto e basso si scambiano.'};
  }

  function qBlocks(level){
    const band=NS.levelBand(level),variant=NS.rnd(0,band>=4?2:1),a=NS.rnd(2,5+level),b=NS.rnd(2,5+level);
    if(variant===0){const answer=a+b;return {prompt:'Quanti blocchi ci sono in tutto?',visual:`<div class="blockGroups"><div>${'🧱'.repeat(Math.min(a,10))}</div><div>${'🧱'.repeat(Math.min(b,10))}</div></div>`,sub:`Unisci un gruppo di ${a} e uno di ${b}.`,options:NS.uniqueOptions(answer,[answer+1,answer-1,Math.abs(a-b),answer+2]),answer:String(answer),hint:`Somma ${a} + ${b}.`};}
    if(variant===1){const overlap=NS.rnd(1,Math.min(a,b)),answer=a+b-overlap;return {prompt:'Conta senza contare due volte',sub:`Due gruppi hanno ${overlap} ${overlap===1?'blocco in comune':'blocchi in comune'}.`,visual:`<div class="bigVisual">${a} 🧱 + ${b} 🧱 − ${overlap} comuni</div>`,options:NS.uniqueOptions(answer,[a+b,answer+1,answer-1,a+b-overlap+2]),answer:String(answer),hint:`Somma e poi togli ${overlap}.`};}
    const total=a+b,answer=b;return {prompt:'Quanti blocchi sono nascosti?',visual:`<div class="bigVisual">${a} visibili + ❓ = ${total}</div>`,options:NS.uniqueOptions(answer,[answer+1,answer-1,total,a]),answer:String(answer),hint:`Fai ${total} − ${a}.`};
  }

  function qMaze(level){
    const n=level<=4?4:level<=9?5:level<=12?6:7;
    for(let attempt=0;attempt<50;attempt++){
      const grid=Array.from({length:n},()=>Array(n).fill(0));
      const walls=Math.min(n*n-3,Math.floor((level+2)*n/4));
      for(let i=0;i<walls;i++){const r=NS.rnd(0,n-1),c=NS.rnd(0,n-1);if((r===0&&c===0)||(r===n-1&&c===n-1))continue;grid[r][c]=1;}
      const q=[[0,0,0]],seen=new Set(['0,0']);let answer=-1;
      while(q.length){const [r,c,d]=q.shift();if(r===n-1&&c===n-1){answer=d;break;}for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc,key=nr+','+nc;if(nr>=0&&nc>=0&&nr<n&&nc<n&&!grid[nr][nc]&&!seen.has(key)){seen.add(key);q.push([nr,nc,d+1]);}}}
      if(answer>=0){const html=`<div class="maze" style="grid-template-columns:repeat(${n},${n>=7?26:30}px)">`+grid.flatMap((row,r)=>row.map((v,c)=>`<i class="${v?'wall':''} ${r===0&&c===0?'s':''} ${r===n-1&&c===n-1?'e':''}" style="width:${n>=7?26:30}px;height:${n>=7?26:30}px">${r===0&&c===0?'🐭':r===n-1&&c===n-1?'🧀':''}</i>`)).join('')+'</div>';return {prompt:'Qual è il cammino più corto?',sub:'Conta il minimo numero di passi da 🐭 a 🧀.',visual:html,options:NS.uniqueOptions(answer,[answer+1,answer+2,Math.max(1,answer-1),answer+3]),answer:String(answer),hint:'Puoi muoverti solo su, giù, destra o sinistra.'};}
    }
    return {prompt:'Qual è il cammino più corto?',options:['4','5','6','7'],answer:'6',hint:'Conta un passo per ogni casella.'};
  }

  function qLights(level){
    const n=level<=5?3:level<=10?4:5,press=NS.rnd(0,n-1),before=Array(n).fill(0);[press-1,press,press+1].forEach(i=>{if(i>=0&&i<n)before[i]=1;});
    return {prompt:'Quale interruttore spegne tutte le luci?',sub:'Premendo un interruttore cambiano quella luce e le vicine.',visual:`<div class="bigVisual">${before.map(x=>x?'💡':'⚫').join(' ')}</div>`,options:Array.from({length:n},(_,i)=>({label:`Interruttore ${i+1}`,value:String(i)})),answer:String(press),hint:'Cerca il centro del gruppo di luci accese.'};
  }

  function qMemory(level){
    const pool=['🍎','🚗','🐶','⭐','🌈','⚽','🎈','🦋','🍦','🚀','🐱','🌙'],count=Math.min(8,3+Math.floor(level/2)),icons=NS.shuffle(pool).slice(0,count),pos=NS.rnd(0,icons.length-1),answer=icons[pos],id='mem_'+Math.random().toString(36).slice(2),delay=Math.max(1200,3600-level*140);
    return {prompt:'Memorizza la sequenza!',sub:`Tra poco ti chiederò cosa c’era in posizione ${pos+1}.`,visual:`<div class="bigVisual" id="${id}">${icons.join(' ')}</div>`,options:NS.uniqueOptions(answer,pool),answer,hint:'Crea una piccola storia mentale con le immagini.',afterRender:()=>{const opts=document.querySelector('.options'),el=document.getElementById(id);if(!el)return;if(opts){opts.style.visibility='hidden';opts.style.pointerEvents='none';}setTimeout(()=>{if(!document.getElementById(id))return;el.textContent='❓ '.repeat(Math.min(icons.length,6));const h=document.querySelector('.question h3');if(h)h.textContent=`Cosa c’era in posizione ${pos+1}?`;if(opts){opts.style.visibility='visible';opts.style.pointerEvents='auto';}},delay);}};
  }

  function simulateRobot(r,c,d,cmds,size=4){for(const t of cmds){if(t==='R')d=(d+1)%4;else if(t==='L')d=(d+3)%4;else{const delta=[[-1,0],[0,1],[1,0],[0,-1]][d];r=NS.clamp(r+delta[0],0,size-1);c=NS.clamp(c+delta[1],0,size-1);}}return r+','+c;}
  function qRobot(level){
    const size=level<=10?4:5,dirs=ARROWS,d=NS.rnd(0,3),steps=Math.min(5,1+Math.floor((level-1)/3)),cmds=[];let r=Math.floor(size/2),c=Math.floor(size/2)-1,rr=r,cc=c,dd=d;
    for(let i=0;i<steps;i++){let turn=steps===1?'F':NS.pick(['F','F','R','L']);cmds.push(turn);if(turn==='R')dd=(dd+1)%4;else if(turn==='L')dd=(dd+3)%4;else{const z=[[-1,0],[0,1],[1,0],[0,-1]][dd];rr=NS.clamp(rr+z[0],0,size-1);cc=NS.clamp(cc+z[1],0,size-1);}}
    const target=rr+','+cc,correct=cmds.join(','),options=[correct],candidates=['F','R','L','F,F','R,F','L,F','F,R','F,L','F,F,F','R,F,F','L,F,F','F,R,F','F,L,F','R,F,L','L,F,R'];
    for(const x of NS.shuffle(candidates)){if(options.length>=4)break;if(!options.includes(x)&&simulateRobot(r,c,d,x.split(','),size)!==target)options.push(x);}while(options.length<4)options.push('R,R');
    let cells='';for(let y=0;y<size;y++)for(let x=0;x<size;x++)cells+=`<i>${y===r&&x===c?dirs[d]:y===rr&&x===cc?'🎯':''}</i>`;
    return {prompt:'Quale programma porta il robot al bersaglio?',sub:'F = avanti, R = gira a destra, L = gira a sinistra.',visual:`<div class="robotgrid" style="grid-template-columns:repeat(${size},42px)">${cells}</div>`,options:NS.shuffle(options).map(x=>({label:x.replaceAll(',',' → '),value:x})),answer:correct,hint:'Segui un comando alla volta e ricorda dove guarda il robot.'};
  }

  function qMissingPiece(level){
    const band=NS.levelBand(level),mode=NS.rnd(0,Math.min(3,band-1)),pool=[...COLORS,...SHAPES];
    let pattern;
    if(mode===0){const a=NS.pick(COLORS),b=NS.pick(COLORS.filter(x=>x!==a));pattern=[a,b,a,b,a,b];}
    else if(mode===1){const a=NS.pick(SHAPES),b=NS.pick(SHAPES.filter(x=>x!==a)),c=NS.pick(SHAPES.filter(x=>x!==a&&x!==b));pattern=[a,b,c,a,b,c];}
    else if(mode===2){const a=NS.pick(COLORS),b=NS.pick(COLORS.filter(x=>x!==a));pattern=[a,a,b,a,a,b];}
    else{pattern=['⬆️','➡️','⬇️','⬅️','⬆️','➡️'];}
    const idx=NS.rnd(1,pattern.length-2),answer=pattern[idx],shown=pattern.map((x,i)=>i===idx?'❓':x);
    return {prompt:'Quale pezzo manca?',sub:'Osserva tutta la sequenza prima di scegliere.',visual:`<div class="pieceStrip">${shown.map(x=>`<span>${x}</span>`).join('')}</div>`,options:NS.uniqueOptions(answer,pool.concat(ARROWS)),answer,hint:'Cerca il gruppo che si ripete prima e dopo il punto mancante.'};
  }

  function qColorMatrix(level){
    const colors=NS.shuffle(COLORS).slice(0,level<=5?2:3),hard=level>=9;
    if(!hard){const a=colors[0],b=colors[1],answer=a;return {prompt:'Completa la matrice di colori',visual:`<div class="matrix"><i>${a}</i><i>${b}</i><i>${b}</i><i>?</i></div>`,options:NS.uniqueOptions(answer,COLORS),answer,hint:'Le diagonali hanno lo stesso colore.'};}
    const [a,b,c]=colors,grid=[[a,b,c],[b,c,a],[c,a,'?']],answer=b;
    return {prompt:'Quale colore manca?',sub:'Ogni riga usa gli stessi tre colori spostati di una posizione.',visual:`<div class="matrix3">${grid.flat().map(x=>`<i>${x}</i>`).join('')}</div>`,options:NS.uniqueOptions(answer,COLORS),answer,hint:'Confronta la prima e la seconda riga: l’ordine ruota.'};
  }

  function qShapeMatrix(level){
    const shapes=NS.shuffle(SHAPES).slice(0,level<=5?2:3),hard=level>=8;
    if(!hard){const a=shapes[0],b=shapes[1],answer=b;return {prompt:'Completa la matrice di forme',visual:`<div class="matrix"><i>${a}</i><i>${b}</i><i>${a}</i><i>?</i></div>`,options:NS.uniqueOptions(answer,SHAPES),answer,hint:'Ogni riga contiene le stesse due forme nello stesso ordine.'};}
    const [a,b,c]=shapes,grid=[[a,b,c],[c,a,b],[b,c,'?']],answer=a;
    return {prompt:'Trova la forma mancante',sub:'Le tre forme cambiano posizione a ogni riga.',visual:`<div class="matrix3">${grid.flat().map(x=>`<i>${x}</i>`).join('')}</div>`,options:NS.uniqueOptions(answer,SHAPES),answer,hint:'Ogni forma deve comparire una volta per riga e per colonna.'};
  }

  function qVisualOdd(level){
    const band=NS.levelBand(level),kind=NS.rnd(0,Math.min(2,band-1));let arr,idx=NS.rnd(0,5),hint;
    if(kind===0){const normal=NS.pick(COLORS),odd=NS.pick(COLORS.filter(x=>x!==normal));arr=Array(6).fill(normal);arr[idx]=odd;hint='Uno solo ha un colore diverso.';}
    else if(kind===1){const normal=NS.pick(SHAPES),odd=NS.pick(SHAPES.filter(x=>x!==normal));arr=Array(6).fill(normal);arr[idx]=odd;hint='Uno solo ha una forma diversa.';}
    else{const normal='➡️',odd='⬅️';arr=Array(6).fill(normal);arr[idx]=odd;hint='Uno solo guarda nella direzione opposta.';}
    return {prompt:'Dove si nasconde l’anomalia?',visual:`<div class="pieceStrip">${arr.map((x,i)=>`<span><small>${i+1}</small>${x}</span>`).join('')}</div>`,options:arr.map((_x,i)=>({label:`Pezzo ${i+1}`,value:String(i)})),answer:String(idx),hint};
  }

  function qRotation(level){
    const start=NS.rnd(0,3),turns=level<=5?1:level<=10?NS.pick([1,2]):NS.pick([1,2,3]),clockwise=level<=7?true:NS.rnd(0,1)===0;
    const delta=clockwise?turns:-turns,answer=ARROWS[(start+delta+8)%4],degrees=turns*90;
    return {prompt:'Come finisce la rotazione?',sub:`Ruota la freccia di ${degrees}° ${clockwise?'in senso orario':'in senso antiorario'}.`,visual:`<div class="bigVisual">${ARROWS[start]} 🔄 ?</div>`,options:NS.shuffle(ARROWS),answer,hint:`Fai ${turns} ${turns===1?'quarto di giro':'quarti di giro'} ${clockwise?'a destra':'a sinistra'}.`};
  }

  function qSymmetry(level){
    const horizontalPairs=[['◀','▶'],['◢','◣'],['◤','◥'],['↙','↘']],verticalPairs=[['▲','▼'],['◢','◤'],['◣','◥'],['↗','↘']],vertical=level>=8&&NS.rnd(0,1)===1,pair=NS.pick(vertical?verticalPairs:horizontalPairs),answer=pair[1];
    return {prompt:'Completa la figura simmetrica',sub:`Immagina uno specchio ${vertical?'orizzontale':'verticale'} sulla linea centrale.`,visual:`<div class="symmetry">${pair[0]} <b>|</b> ❓</div>`,options:NS.uniqueOptions(answer,['◀','▶','▲','▼','◢','◣','◤','◥','↙','↘','↗']),answer,hint:vertical?'La parte alta deve riflettersi in basso.':'La parte sinistra deve riflettersi a destra.'};
  }

  function qCompleteDrawing(level){
    const band=NS.levelBand(level),a=NS.pick(SHAPES),b=NS.pick(SHAPES.filter(x=>x!==a)),c1=NS.pick(COLORS),c2=NS.pick(COLORS.filter(x=>x!==c1));
    const token=(c,s)=>c+s;let seq,answer,hint;
    if(band<=2){seq=[token(c1,a),token(c1,b),token(c2,a),token(c2,b)];answer=token(c1,a);hint='Cambiano prima la forma e poi il colore.';}
    else{seq=[token(c1,a),token(c2,b),token(c1,b),token(c2,a),token(c1,a)];answer=token(c2,b);hint='Colore e forma seguono due alternanze diverse.';}
    return {prompt:'Completa il disegno',visual:`<div class="pieceStrip">${seq.join(' ')} ❓</div>`,options:NS.uniqueOptions(answer,[token(c1,a),token(c1,b),token(c2,a),token(c2,b)]),answer,hint};
  }

  function qSecretRule(level){
    const band=NS.levelBand(level),rule=NS.rnd(0,band>=4?2:1);
    if(rule===0){const goodColor=NS.pick(COLORS.slice(0,4)),goodShape=NS.pick(SHAPES.slice(0,4)),answer=goodColor+goodShape,options=[answer,NS.pick(COLORS.filter(x=>x!==goodColor))+goodShape,goodColor+NS.pick(SHAPES.filter(x=>x!==goodShape)),NS.pick(COLORS.filter(x=>x!==goodColor))+NS.pick(SHAPES.filter(x=>x!==goodShape))];return {prompt:'Quale pezzo segue la regola segreta?',sub:`Regola: deve avere il colore ${goodColor} E la forma ${goodShape}.`,options:NS.shuffle(options),answer,hint:'Controlla entrambe le caratteristiche, non soltanto una.'};}
    if(rule===1){const answer='★★★',options=['★','★★','★★★','★★★★'];return {prompt:'Quale gruppo segue la regola?',sub:'Regola: il gruppo deve contenere esattamente 3 stelle.',options:NS.shuffle(options),answer,hint:'Conta con calma gli elementi.'};}
    const answer='🔴▲',options=['🔴▲','🔴■','🔵▲','🔵■'];return {prompt:'Scopri il pezzo corretto',sub:'Regola: rosso + triangolo. Devi rispettare due condizioni.',options:NS.shuffle(options),answer,hint:'Cerca prima il colore, poi verifica la forma.'};
  }

  function qOverlap(level){
    const a=NS.pick(['●','▲','■','◆']),b=NS.pick(['★','+','×','○']),answer=a+b,reverse=b+a;
    if(level<=7)return {prompt:'Qual è il risultato della sovrapposizione?',visual:`<div class="bigVisual">${a} + ${b} → ?</div>`,sub:'Il risultato deve contenere entrambi i simboli.',options:NS.uniqueOptions(answer,[a,b,reverse,a+a,b+b]),answer,hint:'Nessun simbolo scompare: uniscili nello stesso pezzo.'};
    const c=NS.pick(['●','▲','■']),combo=a+b+c,remove=NS.pick([a,b,c]),answer2=combo.replace(remove,'');
    return {prompt:'Quale figura resta?',visual:`<div class="bigVisual">${combo} − ${remove} → ?</div>`,options:NS.uniqueOptions(answer2,[a+b,b+c,a+c,a,b,c]),answer:answer2,hint:`Togli soltanto ${remove} dalla figura composta.`};
  }

  function qPuzzle3(level){
    const colors=NS.shuffle(COLORS).slice(0,3),shapes=NS.shuffle(SHAPES).slice(0,3),combined=level>=9;
    if(!combined){const grid=[[colors[0],colors[1],colors[2]],[colors[1],colors[2],colors[0]],[colors[2],colors[0],'?']],answer=colors[1];return {prompt:'Completa il puzzle 3×3',sub:'Ogni riga e colonna usa i tre colori una volta sola.',visual:`<div class="matrix3">${grid.flat().map(x=>`<i>${x}</i>`).join('')}</div>`,options:NS.uniqueOptions(answer,COLORS),answer,hint:'Controlla contemporaneamente riga e colonna.'};}
    const tok=(r,c)=>colors[r]+shapes[c],grid=[[tok(0,0),tok(1,1),tok(2,2)],[tok(1,2),tok(2,0),tok(0,1)],[tok(2,1),tok(0,2),'?']],answer=tok(1,0),pool=[];for(const c of colors)for(const s of shapes)pool.push(c+s);
    return {prompt:'Completa il puzzle avanzato',sub:'Colore e forma seguono due schemi contemporaneamente.',visual:`<div class="matrix3 compact">${grid.flat().map(x=>`<i>${x}</i>`).join('')}</div>`,options:NS.uniqueOptions(answer,pool,4),answer,hint:'Controlla separatamente la sequenza dei colori e quella delle forme.'};
  }

  NS.VisualGames={8:qShapes,9:qMatrix,10:qMirror,11:qBlocks,12:qMaze,13:qLights,14:qMemory,15:qRobot,21:qMissingPiece,22:qColorMatrix,23:qShapeMatrix,24:qVisualOdd,25:qRotation,26:qSymmetry,27:qCompleteDrawing,28:qSecretRule,29:qOverlap,30:qPuzzle3};
})(window.LogicLand);
