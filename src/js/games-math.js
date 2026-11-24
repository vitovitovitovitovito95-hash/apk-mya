'use strict';
(function(NS){
  function qSequence(level){
    let seq=[],answer,rule;
    const band=NS.levelBand(level), mode=band===1?NS.rnd(0,1):band===2?NS.rnd(0,2):NS.rnd(0,4);
    if(mode===0){
      const start=NS.rnd(0,8+level),step=NS.rnd(1,Math.max(2,Math.ceil(level/2)));
      for(let i=0;i<5;i++)seq.push(start+i*step);answer=start+5*step;rule=`Aggiungi ${step} ogni volta.`;
    }else if(mode===1){
      const start=NS.rnd(8,22+level*2),step=NS.rnd(1,Math.max(2,Math.ceil(level/3)));
      for(let i=0;i<5;i++)seq.push(start-i*step);answer=start-5*step;rule=`Togli ${step} ogni volta.`;
    }else if(mode===2){
      const start=NS.rnd(1,6),a=NS.rnd(1,4),b=NS.rnd(2,6);seq=[start];
      for(let i=1;i<6;i++)seq.push(seq[i-1]+(i%2?a:b));answer=seq.pop();rule=`Gli aumenti si alternano: +${a}, +${b}.`;
    }else if(mode===3){
      const start=NS.rnd(1,3),mul=NS.rnd(2,3);seq=[start];for(let i=1;i<5;i++)seq.push(seq[i-1]*mul);answer=seq[4]*mul;rule=`Moltiplica per ${mul}.`;
    }else{
      const a=NS.rnd(1,6),b=NS.rnd(1,6);seq=[a,b];for(let i=2;i<6;i++)seq.push(seq[i-1]+seq[i-2]);answer=seq.pop();rule='Ogni numero è la somma dei due precedenti.';
    }
    return {prompt:'Qual è il numero successivo?',visual:`<div class="bigVisual">${seq.join(' · ')} · ?</div>`,options:NS.uniqueOptions(answer,[answer+1,answer-1,answer+2,answer-2,answer+5,Math.max(0,answer-5)]),answer:String(answer),hint:rule};
  }

  function qCalc(level){
    const band=NS.levelBand(level),variant=NS.rnd(0,band>=4?3:band>=2?2:1);
    if(variant===0){
      const ops=band===1?['+','-']:band===2?['+','-','×']:['+','-','×','÷'];
      const op=NS.pick(ops);let a,b,answer;
      if(op==='+'){a=NS.rnd(2,15+level*5);b=NS.rnd(2,12+level*4);answer=a+b;}
      else if(op==='-'){a=NS.rnd(10,25+level*6);b=NS.rnd(2,a);answer=a-b;}
      else if(op==='×'){a=NS.rnd(2,Math.min(12,3+level));b=NS.rnd(2,Math.min(12,3+level));answer=a*b;}
      else{b=NS.rnd(2,Math.min(10,2+level));answer=NS.rnd(2,Math.min(12,3+level));a=b*answer;}
      return {prompt:`Quanto fa ${a} ${op} ${b}?`,sub:'Scegli il risultato corretto.',options:NS.uniqueOptions(answer,[answer+1,answer-1,answer+2,answer-2,answer+5]),answer:String(answer),hint:`Calcola ${a} ${op} ${b}.`};
    }
    if(variant===1){
      const total=NS.rnd(10,30+level*5),known=NS.rnd(2,total-2),answer=total-known;
      return {prompt:'Trova il numero nascosto',visual:`<div class="bigVisual">${known} + ❓ = ${total}</div>`,options:NS.uniqueOptions(answer,[answer+1,answer-1,total,known]),answer:String(answer),hint:`Fai ${total} − ${known}.`};
    }
    if(variant===2){
      const packs=NS.rnd(2,Math.min(10,3+level)),each=NS.rnd(2,Math.min(10,3+level)),answer=packs*each;
      return {prompt:'Mini-problema',sub:`Ci sono ${packs} scatole con ${each} figurine ciascuna. Quante figurine in tutto?`,options:NS.uniqueOptions(answer,[answer+packs,answer-each,packs+each,answer+1]),answer:String(answer),hint:`Ripeti ${each} per ${packs} volte.`};
    }
    const a=NS.rnd(2,15),b=NS.rnd(2,12),c=NS.rnd(2,8),answer=a+b*c;
    return {prompt:'Calcolo a due passaggi',visual:`<div class="bigVisual">${a} + ${b} × ${c}</div>`,sub:'Prima esegui la moltiplicazione.',options:NS.uniqueOptions(answer,[(a+b)*c,a+b+c,answer+2,answer-2]),answer:String(answer),hint:`Prima ${b} × ${c}, poi aggiungi ${a}.`};
  }

  function qPyramid(level){
    const band=NS.levelBand(level);
    if(band<=2){
      const a=NS.rnd(1,8+level*2),b=NS.rnd(1,8+level*2),top=a+b;
      if(NS.rnd(0,1)===0)return {prompt:'Quale numero va in cima?',visual:`<div class="bigVisual">❓<br>🔺 ${a} ${b}</div>`,sub:'Il numero sopra è la somma dei due sotto.',options:NS.uniqueOptions(top,[top+1,top-1,Math.abs(a-b),top+3]),answer:String(top),hint:`Somma ${a} + ${b}.`};
      const miss=NS.rnd(0,1)===0?'a':'b',answer=miss==='a'?a:b;
      return {prompt:'Quale numero manca alla base?',visual:`<div class="bigVisual">${top}<br>🔺 ${miss==='a'?'❓':a} ${miss==='b'?'❓':b}</div>`,sub:'Il numero sopra è la somma dei due sotto.',options:NS.uniqueOptions(answer,[answer+1,answer-1,top,Math.abs(a-b)]),answer:String(answer),hint:`Fai ${top} − ${miss==='a'?b:a}.`};
    }
    const a=NS.rnd(1,9+level),b=NS.rnd(1,9+level),c=NS.rnd(1,9+level),ab=a+b,bc=b+c,top=ab+bc;
    const targets=[['ab',ab],['bc',bc],['b',b],['top',top]],pick=NS.pick(targets),key=pick[0],answer=pick[1];
    const row2=`${key==='ab'?'❓':ab} &nbsp; ${key==='bc'?'❓':bc}`;
    const row3=`${a} &nbsp; ${key==='b'?'❓':b} &nbsp; ${c}`;
    const topText=key==='top'?'❓':top;
    return {prompt:'Completa la piramide a 3 piani',visual:`<div class="bigVisual pyramidVisual">${topText}<br>${row2}<br>${row3}</div>`,sub:'Ogni casella è la somma delle due immediatamente sotto.',options:NS.uniqueOptions(answer,[answer+1,Math.max(0,answer-1),answer+3,Math.max(0,answer-3),top]),answer:String(answer),hint:'Lavora dal piano dove conosci entrambi i numeri.'};
  }

  function qBalance(level){
    const band=NS.levelBand(level),variant=NS.rnd(0,band>=4?2:1);
    const x=NS.rnd(1,8+level*2);
    if(variant===0){const a=NS.rnd(1,6+level),b=x+a;return {prompt:'Quanto vale ❓?',visual:`<div class="bigVisual">❓ + ${a} ⚖️ ${b}</div>`,options:NS.uniqueOptions(x,[x+1,x-1,b,a]),answer:String(x),hint:`Trova il numero che, aggiunto a ${a}, dà ${b}.`};}
    if(variant===1){const m=NS.rnd(2,Math.min(6,2+band)),tot=m*x;return {prompt:'Trova il peso nascosto',visual:`<div class="bigVisual">${m} × ❓ ⚖️ ${tot}</div>`,options:NS.uniqueOptions(x,[x+1,x-1,m,tot-m]),answer:String(x),hint:`Dividi ${tot} per ${m}.`};}
    const m=NS.rnd(2,5),c=NS.rnd(1,10),tot=m*x+c;return {prompt:'Bilancia a due passaggi',visual:`<div class="bigVisual">${m} × ❓ + ${c} ⚖️ ${tot}</div>`,options:NS.uniqueOptions(x,[x+1,x-1,m,tot-c]),answer:String(x),hint:`Prima togli ${c}, poi dividi per ${m}.`};
  }

  function qSudoku(level){
    const symbols=level<=5?['1','2','3','4']:level<=10?NS.shuffle(['🔴','🔵','🟢','🟡']):NS.shuffle(['▲','■','●','◆']);
    const base=[[0,1,2,3],[2,3,0,1],[1,0,3,2],[3,2,1,0]],grid=base.map(r=>r.map(v=>symbols[v]));
    if(NS.rnd(0,1))[grid[0],grid[1]]=[grid[1],grid[0]];
    const r=NS.rnd(0,3),c=NS.rnd(0,3),answer=grid[r][c];
    const html='<div class="sudoku">'+grid.flatMap((row,ri)=>row.map((v,ci)=>`<div class="cell ${ri===r&&ci===c?'target':''}">${ri===r&&ci===c?'?':v}</div>`)).join('')+'</div>';
    return {prompt:'Quale simbolo completa il Sudoku?',sub:'Ogni simbolo compare una sola volta in ogni riga e colonna.',visual:html,options:NS.shuffle(symbols),answer:String(answer),hint:'Controlla prima la riga, poi la colonna.'};
  }

  function qCode(level){
    const digits=level<=5?2:3,max=level<=8?6:9;
    for(let tries=0;tries<100;tries++){
      const codes=[];while(codes.length<4){const c=Array.from({length:digits},()=>NS.rnd(1,max)).join('');if(!codes.includes(c))codes.push(c);}
      const answer=NS.pick(codes),nums=answer.split('').map(Number),sum=nums.reduce((a,b)=>a+b,0),firstParity=nums[0]%2,lastCmp=nums.at(-1)>Math.floor(max/2);
      const filtered=codes.filter(c=>{const x=c.split('').map(Number);return x.reduce((a,b)=>a+b,0)===sum&&(x[0]%2===firstParity)&&((x.at(-1)>Math.floor(max/2))===lastCmp);});
      if(filtered.length===1)return {prompt:'Scopri il codice segreto',visual:`<div class="bigVisual">🔐 ${'_ '.repeat(digits).trim()}</div>`,sub:`Somma = ${sum} • prima cifra ${firstParity?'dispari':'pari'} • ultima ${lastCmp?'alta':'bassa'}`,options:NS.shuffle(codes),answer,hint:'Elimina un codice alla volta usando tutti gli indizi.'};
    }
    return {prompt:'Scopri il codice segreto',options:['24','35','46','57'],answer:'24',hint:'Usa contemporaneamente somma e parità.'};
  }

  function qOdd(level){
    const band=NS.levelBand(level),type=NS.rnd(0,band>=3?3:2);
    if(type===0){const base=NS.rnd(2,8),arr=[base*2,base*3,base*4,base*5],odd=base*4+1;arr.splice(NS.rnd(0,4),0,odd);return {prompt:"Qual è l'intruso?",sub:`Quasi tutti i numeri sono multipli di ${base}.`,options:NS.shuffle(arr.map(String)),answer:String(odd),hint:`Controlla quali numeri si dividono per ${base}.`};}
    if(type===1){const normal=NS.pick(['🔵','🔺','⭐','🟩']),odd=normal==='🔵'?'🔴':normal==='🔺'?'🔻':normal==='⭐'?'🌟':'🟦',arr=Array(5).fill(normal),idx=NS.rnd(0,4);arr[idx]=odd;return {prompt:'Trova la figura diversa',visual:`<div class="bigVisual">${arr.join(' ')}</div>`,options:arr.map((_x,i)=>({label:`Posizione ${i+1}`,value:String(i)})),answer:String(idx),hint:'Confronta forma, colore e orientamento.'};}
    if(type===2){const odds=NS.shuffle([5,7,9,11,13,15,17]).slice(0,3),odd=NS.pick([4,6,8,10,12,14,16]);const nums=[...odds];nums.splice(NS.rnd(0,3),0,odd);return {prompt:'Quale numero è diverso dagli altri?',sub:'Tre sono dispari, uno è pari.',options:NS.shuffle(nums.map(String)),answer:String(odd),hint:'Pari = divisibile per 2.'};}
    const groups=['🍎🍎','🚗🚗','🐶🐶','⭐⭐'],normal=NS.pick(groups),odd=normal+normal[0],arr=[normal,normal,normal,odd],idx=NS.rnd(0,3);[arr[idx],arr[3]]=[arr[3],arr[idx]];return {prompt:'Quale gruppo non segue la stessa quantità?',visual:`<div class="bigVisual">${arr.map((x,i)=>`<span>${i+1}:${x}</span>`).join(' &nbsp; ')}</div>`,options:arr.map((_x,i)=>({label:`Gruppo ${i+1}`,value:String(i)})),answer:String(idx),hint:'Conta gli elementi in ogni gruppo.'};
  }

  NS.MathGames={1:qSequence,2:qCalc,3:qPyramid,4:qBalance,5:qSudoku,6:qCode,7:qOdd};
})(window.LogicLand);
