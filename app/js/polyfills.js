/* Minimal polyfills for Android 6 / legacy Android System WebView. ES5 syntax only. */
(function(){
  if(!Array.from){Array.from=function(x){return Array.prototype.slice.call(x);};}
  if(!Array.prototype.includes){Array.prototype.includes=function(v){return this.indexOf(v)!==-1;};}
  if(!String.prototype.includes){String.prototype.includes=function(v,p){return this.indexOf(v,p||0)!==-1;};}
  if(!String.prototype.repeat){String.prototype.repeat=function(n){var s='',i;for(i=0;i<n;i++)s+=String(this);return s;};}
  if(!String.prototype.padStart){String.prototype.padStart=function(n,p){var s=String(this),x=p===undefined?' ':String(p);while(s.length<n)s=x+s;return s.slice(-n);};}
  if(!String.prototype.replaceAll){String.prototype.replaceAll=function(a,b){return String(this).split(a).join(b);};}
  if(!Array.prototype.flat){Array.prototype.flat=function(){return Array.prototype.concat.apply([],this);};}
  if(!Array.prototype.flatMap){Array.prototype.flatMap=function(fn,ctx){return Array.prototype.concat.apply([],this.map(fn,ctx));};}
  if(!Array.prototype.at){Array.prototype.at=function(i){i=Number(i)||0;if(i<0)i=this.length+i;return this[i];};}
  if(!Object.assign){Object.assign=function(t){var i,k;t=Object(t);for(i=1;i<arguments.length;i++){var s=arguments[i];if(s!=null)for(k in s)if(Object.prototype.hasOwnProperty.call(s,k))t[k]=s[k];}return t;};}
  if(!Object.entries){Object.entries=function(o){var a=[],k;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))a.push([k,o[k]]);return a;};}
  if(!Object.values){Object.values=function(o){var a=[],k;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))a.push(o[k]);return a;};}
  if(!Object.fromEntries){Object.fromEntries=function(a){var o={},i;for(i=0;i<a.length;i++)o[a[i][0]]=a[i][1];return o;};}

  if(!Array.prototype.find){Array.prototype.find=function(fn,ctx){var i;for(i=0;i<this.length;i++)if(fn.call(ctx,this[i],i,this))return this[i];};}
  if(window.NodeList&&!NodeList.prototype.forEach){NodeList.prototype.forEach=Array.prototype.forEach;}
  if(window.Element&&!Element.prototype.remove){Element.prototype.remove=function(){if(this.parentNode)this.parentNode.removeChild(this);};}
  if(!Number.isFinite){Number.isFinite=function(v){return typeof v==='number'&&isFinite(v);};}
  if(!window.requestAnimationFrame){window.requestAnimationFrame=function(cb){return setTimeout(function(){cb(Date.now());},16);};window.cancelAnimationFrame=clearTimeout;}
})();
