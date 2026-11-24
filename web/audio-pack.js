/* LogicLand Kids v9.3 – audio per la versione web (iPhone/iPad su claude.ai).
   Le pronunce (stessi file dell'APK) sono raccolte in un pacchetto per lingua
   (audio/en.json, audio/es.json, audio/it.json) e suonate come data: URI. */
(function(NS){
  'use strict';
  if(!NS)return;
  var packs={},loading={};
  function parse(path){var m=/^audio\/([a-z]+)\/(.+)$/.exec(String(path||''));return m?{lang:m[1],file:m[2]}:null;}
  function load(lang){
    if(packs[lang])return Promise.resolve(true);
    if(loading[lang])return loading[lang];
    loading[lang]=fetch('audio/'+lang+'.json').then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();})
      .then(function(j){packs[lang]=j;return true;},function(){loading[lang]=null;return false;});
    return loading[lang];
  }
  NS.audioSource=function(path){var p=parse(path);if(!p)return path;var pk=packs[p.lang];if(!pk)return null;return pk[p.file]?'data:audio/mpeg;base64,'+pk[p.file]:path;};
  NS.audioReady=function(path){var p=parse(path);return p?load(p.lang):Promise.resolve(false);};
  // inglese subito (è la lingua più usata), le altre poco dopo
  setTimeout(function(){load('en').then(function(){setTimeout(function(){load('es');load('it');},4000);});},1200);
})(window.LogicLand);
