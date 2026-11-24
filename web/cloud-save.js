/* LogicLand Kids v9.3 – salvataggio dei progressi nel cloud.
   Usato SOLO dalla versione web pubblicata su claude.ai (iPhone/iPad): l'APK non lo include.
   I progressi restano privati per ogni persona (data/users/<id>/), come previsto dalla piattaforma. */
(function(NS){
  'use strict';
  if(!NS||!window.claude||typeof window.claude.use!=='function')return;
  var ref=null,lastKey='',writing=false,pending=null,timer=null,ready=false;
  function keyOf(s){try{var c=JSON.parse(JSON.stringify(s));delete c.updated;return JSON.stringify(c);}catch(e){return '';}}
  // quanto si è giocato: cresce a ogni risposta, serve per scegliere la copia più avanti
  function activity(s){var t=(s&&s.totals)||{};return (Number(t.correct)||0)+(Number(t.wrong)||0)+(Number(t.sessions)||0);}
  function schedule(delay){if(timer)clearTimeout(timer);timer=setTimeout(function(){timer=null;flush();},delay||1500);}
  function flush(){
    if(!ref||writing||!pending)return;
    var s=pending;pending=null;var k=keyOf(s);if(!k||k===lastKey)return;
    writing=true;
    ref.set({v:1,updated:s.updated||new Date().toISOString(),activity:activity(s),state:JSON.stringify(s)}).then(function(){
      lastKey=k;writing=false;if(pending)schedule();
    },function(err){
      writing=false;
      if(err&&(err.code==='unavailable'||err.code==='resource_exhausted')){if(!pending)pending=s;schedule(4000+Math.random()*3000);}
    });
  }
  NS.afterSave=function(state){if(!ready||!ref)return;pending=state;schedule();};
  Promise.all([window.claude.use('db'),window.claude.use('user')]).then(function(r){
    var db=r[0],user=r[1];if(!db||!user||typeof user.id!=='function')return null;
    return Promise.resolve(user.id()).then(function(id){if(!id)return null;ref=db.doc('data/users/'+id+'/logicland');return ref.get();});
  }).then(function(snap){
    if(!ref)return;
    var local=NS.getState?NS.getState():null,remote=null;
    if(snap&&snap.exists){var d=snap.data()||{};try{remote=JSON.parse(d.state);}catch(e){remote=null;}}
    if(remote&&activity(remote)>activity(local)){
      NS.applyExternalState(remote);lastKey=keyOf(NS.getState());ready=true;
      if(NS.toast)NS.toast('☁️ Progressi recuperati');return;
    }
    ready=true;if(local){pending=local;schedule(500);}
  }).catch(function(){ready=false;});
})(window.LogicLand);
