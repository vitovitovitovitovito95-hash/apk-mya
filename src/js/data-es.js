'use strict';
/* v9.2 — Vocabolario spagnolo (stesse 178 parole dell'inglese, con articolo per i nomi). */
(function(NS){
  const ES={
    'cat':'el gato','dog':'el perro','bird':'el pájaro','fish':'el pez','horse':'el caballo','rabbit':'el conejo','lion':'el león','tiger':'el tigre','monkey':'el mono','elephant':'el elefante','bear':'el oso','duck':'el pato','frog':'la rana','mouse':'el ratón','cow':'la vaca','turtle':'la tortuga','whale':'la ballena','eagle':'el águila',
    'apple':'la manzana','banana':'el plátano','bread':'el pan','milk':'la leche','cheese':'el queso','carrot':'la zanahoria','strawberry':'la fresa','water':'el agua','cake':'la tarta','egg':'el huevo','rice':'el arroz','pizza':'la pizza','grape':'la uva','lemon':'el limón','ice cream':'el helado','breakfast':'el desayuno','lunch':'el almuerzo','dinner':'la cena','vegetables':'las verduras','sandwich':'el bocadillo','bottle':'la botella',
    'red':'rojo','blue':'azul','green':'verde','yellow':'amarillo','orange':'naranja','purple':'morado','black':'negro','white':'blanco','pink':'rosa','brown':'marrón','grey':'gris','gold':'dorado','silver':'plateado',
    'sun':'el sol','moon':'la luna','star':'la estrella','tree':'el árbol','flower':'la flor','rain':'la lluvia','snow':'la nieve','sea':'el mar','cloud':'la nube','mountain':'la montaña','river':'el río','forest':'el bosque','weather':'el tiempo',
    'house':'la casa','bed':'la cama','chair':'la silla','door':'la puerta','table':'la mesa','window':'la ventana','lamp':'la lámpara','kitchen':'la cocina','bathroom':'el baño','garden':'el jardín','living room':'el salón',
    'book':'el libro','pencil':'el lápiz','school':'la escuela','teacher':'la maestra','backpack':'la mochila','pen':'el bolígrafo','ruler':'la regla','notebook':'el cuaderno','classroom':'la clase','homework':'los deberes','lesson':'la lección','question':'la pregunta','answer':'la respuesta',
    'mother':'la madre','father':'el padre','sister':'la hermana','brother':'el hermano','family':'la familia','grandmother':'la abuela','grandfather':'el abuelo','baby':'el bebé','parents':'los padres','cousin':'el primo',
    'one':'uno','two':'dos','three':'tres','four':'cuatro','five':'cinco','six':'seis','seven':'siete','eight':'ocho','nine':'nueve','ten':'diez','eleven':'once','twelve':'doce','thirteen':'trece','twenty':'veinte','thirty':'treinta',
    'head':'la cabeza','hand':'la mano','foot':'el pie','eye':'el ojo','ear':'la oreja','nose':'la nariz','mouth':'la boca','arm':'el brazo','leg':'la pierna','shoulder':'el hombro','finger':'el dedo',
    'shirt':'la camiseta','dress':'el vestido','shoe':'el zapato','hat':'el sombrero','sock':'el calcetín','jacket':'la chaqueta','trousers':'los pantalones','coat':'el abrigo','boots':'las botas',
    'run':'correr','jump':'saltar','read':'leer','write':'escribir','eat':'comer','drink':'beber','sleep':'dormir','play':'jugar','walk':'caminar','swim':'nadar','listen':'escuchar','carry':'llevar','choose':'elegir','finish':'terminar',
    'happy':'feliz','sad':'triste','angry':'enfadado','tired':'cansado','hungry':'hambriento','scared':'asustado','excited':'emocionado','worried':'preocupado',
    'park':'el parque','shop':'la tienda','hospital':'el hospital','station':'la estación','library':'la biblioteca','beach':'la playa','city':'la ciudad','village':'el pueblo','museum':'el museo',
    'yesterday':'ayer','today':'hoy','tomorrow':'mañana','morning':'la mañana','afternoon':'la tarde','evening':'la noche','weekend':'el fin de semana',
    'bus':'el autobús','train':'el tren','car':'el coche','plane':'el avión','bicycle':'la bicicleta','ticket':'el billete'
  };
  NS.WORDS.forEach(w=>{w.es=ES[w.en]||null;});
  NS.WORDS_ES=NS.WORDS.filter(w=>w.es);
  // Frasi semplici con parola mancante (traduzione italiana per l'aiuto).
  NS.SENTENCES_ES=[
    {lvl:1,a:'cat',s:'El ___ duerme.',it:'Il gatto dorme.'},
    {lvl:1,a:'dog',s:'El ___ corre.',it:'Il cane corre.'},
    {lvl:1,a:'apple',s:'Como una ___.',it:'Mangio una mela.'},
    {lvl:2,a:'water',s:'Bebo ___.',it:'Bevo acqua.'},
    {lvl:2,a:'sun',s:'El ___ es amarillo.',it:'Il sole è giallo.'},
    {lvl:2,a:'book',s:'Leo un ___.',it:'Leggo un libro.'},
    {lvl:3,a:'school',s:'Voy a la ___.',it:'Vado a scuola.'},
    {lvl:3,a:'family',s:'Quiero a mi ___.',it:'Voglio bene alla mia famiglia.'},
    {lvl:3,a:'chair',s:'Me siento en la ___.',it:'Mi siedo sulla sedia.'},
    {lvl:4,a:'teacher',s:'La ___ está en la clase.',it:'La maestra è in classe.'},
    {lvl:4,a:'beach',s:'En verano vamos a la ___.',it:'D’estate andiamo in spiaggia.'},
    {lvl:5,a:'mountain',s:'La ___ es muy alta.',it:'La montagna è molto alta.'},
    {lvl:5,a:'grandmother',s:'Mi ___ cuenta cuentos.',it:'Mia nonna racconta storie.'},
    {lvl:6,a:'homework',s:'Hago los ___ después de la escuela.',it:'Faccio i compiti dopo la scuola.'},
    {lvl:6,a:'bicycle',s:'Ella va en ___.',it:'Lei va in bicicletta.'},
    {lvl:7,a:'museum',s:'El sábado visitamos el ___.',it:'Sabato visitiamo il museo.'},
    {lvl:7,a:'ticket',s:'Guarda el ___ del tren.',it:'Conserva il biglietto del treno.'},
    {lvl:8,a:'weekend',s:'El ___ jugamos juntos.',it:'Nel fine settimana giochiamo insieme.'}
  ];
  // Parola senza articolo (per i completamenti di frase).
  NS.esBare=function(w){return String(w.es||'').replace(/^(el|la|los|las)\s+/,'');};
})(window.LogicLand);
