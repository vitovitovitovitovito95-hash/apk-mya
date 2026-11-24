'use strict';
(function(NS){
  NS.AGE_PATHS = {
    6:{title:'Primi Esploratori',icon:'🌱',subtitle:'Percorso 6 anni: giochi logici, inglese con audio, abilità e attività adattate anche al tablet Asus.'}
  };

  NS.GAMES = [
    {id:1,icon:'🔢',name:'Numero Mancante',desc:'Sequenze numeriche: la regola cambia davvero livello dopo livello.',group:'Logica matematica',world:'math',age:6},
    {id:5,icon:'🔳',name:'Sudoku Junior',desc:'Ogni livello aggiunge simboli e più buchi da completare.',group:'Logica matematica',world:'math',age:6},
    {id:7,icon:'🕵️',name:"Chi è l’intruso?",desc:'Trova l’elemento anomalo con differenze via via meno evidenti.',group:'Logica e attenzione',world:'logic',age:6},
    {id:8,icon:'🔷',name:'Sequenze di Figure',desc:'Colori, forme e direzioni con regole sempre più ricche.',group:'Logica figurata',world:'visual',age:6},
    {id:9,icon:'🧠',name:'Matrici Logiche',desc:'Dalle semplici 2×2 alle matrici con doppia regola.',group:'Matrici figurate',world:'visual',age:6},
    {id:11,icon:'🧱',name:'Blocchi Logici',desc:'Conta, confronta e ricostruisci gruppi di blocchi con più passaggi.',group:'Numeri e spazio',world:'visual',age:6},
    {id:14,icon:'🎨',name:'Memoria Visiva',desc:'Ricorda sequenze sempre più lunghe in tempi progressivamente più brevi.',group:'Memoria',world:'visual',age:6},
    {id:16,icon:'🖼️',name:'English Picture Match',desc:'Immagini, parole, ascolto e audio: dai vocaboli base fino a B1.',group:'English',world:'english',age:6,eng:true},
    {id:21,icon:'🧩',name:'Pezzo Mancante',desc:'Completa pattern sempre più lunghi e con più caratteristiche.',group:'Completamento figurato',world:'visual',age:6},
    {id:31,icon:'🍎',name:'Conta e Scegli',desc:'Conta, confronta e trova quantità nascoste con difficoltà crescente.',group:'Prime quantità',world:'math',age:6},
    {id:32,icon:'🔎',name:'Ombra Giusta',desc:'Abbina figure e sagome con composizioni e distrattori più simili.',group:'Percezione visiva',world:'visual',age:6},
    {id:33,icon:'👯',name:'Coppie Gemelle',desc:'Trova la coppia identica tra un numero crescente di figure simili.',group:'Attenzione visiva',world:'visual',age:6},
    {id:34,icon:'🇬🇧',name:'Prime Parole Inglesi',desc:'Categorie, traduzioni e ascolto: dalle prime parole fino al livello B1.',group:'English',world:'english',age:6,eng:true},
    {id:35,icon:'🎨',name:'Domino dei Colori',desc:'Continua sequenze da una regola semplice a combinazioni multiple.',group:'Colori e sequenze',world:'visual',age:6},
    {id:51,icon:'🧱',name:'Tetris Junior',desc:'Niente pallini: veri quadratini, più velocità e più pezzi a ogni livello.',group:'Abilità e spazio',world:'arcade',age:6,arcade:'tetris'},
    {id:52,icon:'🟣',name:'Macchia Sprint',desc:'Schiva ostacoli sempre più veloci e stretti a ogni livello.',group:'Abilità e riflessi',world:'arcade',age:6,arcade:'dodge'},
    {id:53,icon:'🪵',name:'Unlock Me',desc:'Libera il blocco rosso spostando gli ostacoli di legno.',group:'Spazio e pianificazione',world:'logic',age:6,arcade:'unblock'},
    {id:54,icon:'🔗',name:'Connect the Dots',desc:'Collega i punti dello stesso colore senza incrociare i percorsi.',group:'Percorsi e colori',world:'logic',age:6,arcade:'dots'},
    {id:55,icon:'🧪',name:'Water Sort Puzzle',desc:'Versa l’acqua fra le provette finché ogni colore è separato.',group:'Logica e ordinamento',world:'logic',age:6,arcade:'water'},
    {id:56,icon:'⚫',name:'Dama Junior',desc:'Impara a saltare e catturare le pedine avversarie.',group:'Strategia',world:'logic',age:6,arcade:'checkers'},
    {id:57,icon:'♞',name:'Scacchi Junior',desc:'Impara le mosse dei pezzi e completa piccole missioni.',group:'Strategia',world:'logic',age:6,arcade:'chess'}
  ];

  const rows = [
    ['cat','gatto','🐱','animals',1,'A1'],['dog','cane','🐶','animals',1,'A1'],['bird','uccello','🐦','animals',1,'A1'],['fish','pesce','🐟','animals',1,'A1'],['horse','cavallo','🐴','animals',2,'A1'],['rabbit','coniglio','🐰','animals',2,'A1'],['lion','leone','🦁','animals',3,'A1'],['tiger','tigre','🐯','animals',3,'A1'],['monkey','scimmia','🐵','animals',4,'A2'],['elephant','elefante','🐘','animals',4,'A2'],['bear','orso','🐻','animals',3,'A1'],['duck','anatra','🦆','animals',2,'A1'],['frog','rana','🐸','animals',3,'A1'],['mouse','topo','🐭','animals',2,'A1'],['cow','mucca','🐄','animals',2,'A1'],['turtle','tartaruga','🐢','animals',5,'A2'],['whale','balena','🐋','animals',6,'B1'],['eagle','aquila','🦅','animals',7,'B1'],
    ['apple','mela','🍎','food',1,'A1'],['banana','banana','🍌','food',1,'A1'],['bread','pane','🍞','food',2,'A1'],['milk','latte','🥛','food',2,'A1'],['cheese','formaggio','🧀','food',3,'A1'],['carrot','carota','🥕','food',3,'A1'],['strawberry','fragola','🍓','food',4,'A2'],['water','acqua','💧','food',1,'A1'],['cake','torta','🍰','food',2,'A1'],['egg','uovo','🥚','food',2,'A1'],['rice','riso','🍚','food',3,'A1'],['pizza','pizza','🍕','food',2,'A1'],['grape','uva','🍇','food',3,'A1'],['lemon','limone','🍋','food',3,'A1'],['ice cream','gelato','🍦','food',3,'A1'],['breakfast','colazione','🥣','food',4,'A2'],['lunch','pranzo','🍱','food',4,'A2'],['dinner','cena','🍽️','food',4,'A2'],['vegetables','verdure','🥦','food',5,'A2'],['sandwich','panino','🥪','food',5,'A2'],['bottle','bottiglia','🧴','food',6,'B1'],
    ['red','rosso','🔴','colors',1,'A1'],['blue','blu','🔵','colors',1,'A1'],['green','verde','🟢','colors',1,'A1'],['yellow','giallo','🟡','colors',1,'A1'],['orange','arancione','🟠','colors',2,'A1'],['purple','viola','🟣','colors',2,'A1'],['black','nero','⚫','colors',2,'A1'],['white','bianco','⚪','colors',2,'A1'],['pink','rosa','🩷','colors',2,'A1'],['brown','marrone','🟤','colors',3,'A1'],['grey','grigio','🩶','colors',3,'A1'],['gold','oro','🟨','colors',5,'A2'],['silver','argento','⬜','colors',6,'B1'],
    ['sun','sole','☀️','nature',1,'A1'],['moon','luna','🌙','nature',1,'A1'],['star','stella','⭐','nature',1,'A1'],['tree','albero','🌳','nature',2,'A1'],['flower','fiore','🌸','nature',2,'A1'],['rain','pioggia','🌧️','nature',3,'A1'],['snow','neve','❄️','nature',3,'A1'],['sea','mare','🌊','nature',3,'A1'],['cloud','nuvola','☁️','nature',2,'A1'],['mountain','montagna','⛰️','nature',4,'A2'],['river','fiume','🏞️','nature',4,'A2'],['forest','foresta','🌲','nature',5,'A2'],['weather','tempo atmosferico','🌦️','nature',6,'B1'],
    ['house','casa','🏠','home',1,'A1'],['bed','letto','🛏️','home',2,'A1'],['chair','sedia','🪑','home',2,'A1'],['door','porta','🚪','home',2,'A1'],['table','tavolo','🪵','home',2,'A1'],['window','finestra','🪟','home',3,'A1'],['lamp','lampada','💡','home',3,'A1'],['kitchen','cucina','🍳','home',4,'A2'],['bathroom','bagno','🛁','home',4,'A2'],['garden','giardino','🪴','home',5,'A2'],['living room','salotto','🛋️','home',6,'B1'],
    ['book','libro','📘','school',1,'A1'],['pencil','matita','✏️','school',2,'A1'],['school','scuola','🏫','school',2,'A1'],['teacher','insegnante','👩‍🏫','school',3,'A1'],['backpack','zaino','🎒','school',3,'A1'],['pen','penna','🖊️','school',2,'A1'],['ruler','righello','📏','school',3,'A1'],['notebook','quaderno','📓','school',3,'A1'],['classroom','classe','🏫','school',4,'A2'],['homework','compiti','📝','school',5,'A2'],['lesson','lezione','📚','school',6,'B1'],['question','domanda','❓','school',7,'B1'],['answer','risposta','💬','school',7,'B1'],
    ['mother','mamma','👩','family',1,'A1'],['father','papà','👨','family',1,'A1'],['sister','sorella','👧','family',2,'A1'],['brother','fratello','👦','family',2,'A1'],['family','famiglia','👨‍👩‍👧','family',2,'A1'],['grandmother','nonna','👵','family',3,'A1'],['grandfather','nonno','👴','family',3,'A1'],['baby','bebè','👶','family',2,'A1'],['parents','genitori','👪','family',4,'A2'],['cousin','cugino','🧒','family',5,'A2'],
    ['one','uno','1️⃣','numbers',1,'A1'],['two','due','2️⃣','numbers',1,'A1'],['three','tre','3️⃣','numbers',1,'A1'],['four','quattro','4️⃣','numbers',1,'A1'],['five','cinque','5️⃣','numbers',1,'A1'],['six','sei','6️⃣','numbers',2,'A1'],['seven','sette','7️⃣','numbers',2,'A1'],['eight','otto','8️⃣','numbers',2,'A1'],['nine','nove','9️⃣','numbers',2,'A1'],['ten','dieci','🔟','numbers',2,'A1'],['eleven','undici','11','numbers',3,'A1'],['twelve','dodici','12','numbers',3,'A1'],['thirteen','tredici','13','numbers',4,'A2'],['twenty','venti','20','numbers',5,'A2'],['thirty','trenta','30','numbers',6,'B1'],
    ['head','testa','🙂','body',2,'A1'],['hand','mano','✋','body',2,'A1'],['foot','piede','🦶','body',2,'A1'],['eye','occhio','👁️','body',2,'A1'],['ear','orecchio','👂','body',2,'A1'],['nose','naso','👃','body',2,'A1'],['mouth','bocca','👄','body',2,'A1'],['arm','braccio','💪','body',3,'A1'],['leg','gamba','🦵','body',3,'A1'],['shoulder','spalla','🫲','body',5,'A2'],['finger','dito','☝️','body',5,'A2'],
    ['shirt','maglietta','👕','clothes',2,'A1'],['dress','vestito','👗','clothes',2,'A1'],['shoe','scarpa','👟','clothes',2,'A1'],['hat','cappello','🧢','clothes',3,'A1'],['sock','calzino','🧦','clothes',3,'A1'],['jacket','giacca','🧥','clothes',3,'A1'],['trousers','pantaloni','👖','clothes',4,'A2'],['coat','cappotto','🧥','clothes',5,'A2'],['boots','stivali','🥾','clothes',6,'B1'],
    ['run','correre','🏃','actions',3,'A1'],['jump','saltare','🤸','actions',3,'A1'],['read','leggere','📖','actions',3,'A1'],['write','scrivere','✍️','actions',3,'A1'],['eat','mangiare','🍽️','actions',3,'A1'],['drink','bere','🥤','actions',3,'A1'],['sleep','dormire','😴','actions',3,'A1'],['play','giocare','🎮','actions',3,'A1'],['walk','camminare','🚶','actions',4,'A2'],['swim','nuotare','🏊','actions',4,'A2'],['listen','ascoltare','🎧','actions',5,'A2'],['carry','portare','👜','actions',6,'B1'],['choose','scegliere','✅','actions',7,'B1'],['finish','finire','🏁','actions',7,'B1'],
    ['happy','felice','😊','feelings',3,'A1'],['sad','triste','😢','feelings',3,'A1'],['angry','arrabbiato','😠','feelings',4,'A2'],['tired','stanco','🥱','feelings',4,'A2'],['hungry','affamato','😋','feelings',4,'A2'],['scared','spaventato','😨','feelings',4,'A2'],['excited','entusiasta','🤩','feelings',5,'A2'],['worried','preoccupato','😟','feelings',6,'B1'],
    ['park','parco','🌳','places',3,'A1'],['shop','negozio','🏪','places',3,'A1'],['hospital','ospedale','🏥','places',4,'A2'],['station','stazione','🚉','places',4,'A2'],['library','biblioteca','📚','places',4,'A2'],['beach','spiaggia','🏖️','places',4,'A2'],['city','città','🏙️','places',5,'A2'],['village','villaggio','🏘️','places',6,'B1'],['museum','museo','🏛️','places',7,'B1'],
    ['yesterday','ieri','📆','time',5,'A2'],['today','oggi','🗓️','time',3,'A1'],['tomorrow','domani','📅','time',5,'A2'],['morning','mattina','🌅','time',4,'A2'],['afternoon','pomeriggio','🌇','time',5,'A2'],['evening','sera','🌆','time',5,'A2'],['weekend','fine settimana','🎉','time',6,'B1'],
    ['bus','autobus','🚌','transport',4,'A2'],['train','treno','🚆','transport',4,'A2'],['car','auto','🚗','transport',3,'A1'],['plane','aereo','✈️','transport',5,'A2'],['bicycle','bicicletta','🚲','transport',4,'A2'],['ticket','biglietto','🎫','transport',6,'B1']
  ];

  NS.WORDS = rows.map((w,id)=>({id,en:w[0],it:w[1],emoji:w[2],cat:w[3],lvl:w[4],cefr:w[5]}));

  NS.SENTENCES = [
    {lvl:1,a:'cat',s:'The ___ is sleeping.',it:'Il gatto sta dormendo.'},
    {lvl:1,a:'dog',s:'The ___ can run.',it:'Il cane può correre.'},
    {lvl:1,a:'apple',s:'I eat an ___.',it:'Io mangio una mela.'},
    {lvl:1,a:'book',s:'This is my ___.',it:'Questo è il mio libro.'},
    {lvl:2,a:'sun',s:'The ___ is yellow.',it:'Il sole è giallo.'},
    {lvl:2,a:'water',s:'I drink ___.',it:'Io bevo acqua.'},
    {lvl:2,a:'school',s:'I go to ___.',it:'Io vado a scuola.'},
    {lvl:2,a:'family',s:'I love my ___.',it:'Amo la mia famiglia.'},
    {lvl:3,a:'blue',s:'The sky is ___.',it:'Il cielo è blu.'},
    {lvl:3,a:'chair',s:'Sit on the ___.',it:'Siediti sulla sedia.'},
    {lvl:3,a:'read',s:'I like to ___.',it:'Mi piace leggere.'},
    {lvl:3,a:'happy',s:'I am ___.',it:'Io sono felice.'},
    {lvl:4,a:'teacher',s:'The ___ is in the classroom.',it:'L’insegnante è in classe.'},
    {lvl:4,a:'jacket',s:'Wear your ___.',it:'Indossa la giacca.'},
    {lvl:4,a:'library',s:'We read books at the ___.',it:'Leggiamo libri in biblioteca.'},
    {lvl:5,a:'mountain',s:'The ___ is very high.',it:'La montagna è molto alta.'},
    {lvl:5,a:'swim',s:'I can ___ in the sea.',it:'So nuotare nel mare.'},
    {lvl:5,a:'grandmother',s:'My ___ tells great stories.',it:'Mia nonna racconta belle storie.'},
    {lvl:6,a:'homework',s:'I do my ___ after school.',it:'Faccio i compiti dopo scuola.'},
    {lvl:6,a:'forest',s:'We walk in the ___.',it:'Camminiamo nella foresta.'},
    {lvl:6,a:'bicycle',s:'She rides her ___.',it:'Lei va in bicicletta.'},
    {lvl:7,a:'question',s:'Can you answer this ___ ?',it:'Sai rispondere a questa domanda?'},
    {lvl:7,a:'ticket',s:'Please keep your train ___.',it:'Per favore conserva il biglietto del treno.'},
    {lvl:7,a:'museum',s:'We visit the ___ on Saturday.',it:'Visitiamo il museo sabato.'},
    {lvl:8,a:'choose',s:'You must ___ the correct picture.',it:'Devi scegliere l’immagine corretta.'},
    {lvl:8,a:'weekend',s:'At the ___ we play together.',it:'Nel fine settimana giochiamo insieme.'},
    {lvl:8,a:'worried',s:'She feels ___ before the test.',it:'Si sente preoccupata prima della prova.'}
  ];
})(window.LogicLand);
