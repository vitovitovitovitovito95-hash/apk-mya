'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'src/js/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
function assert(x,msg){if(!x)throw new Error(msg);}
assert(app.includes('Livello successivo ${gs.level} →'),'Explicit next-level button missing');
assert(app.includes('NS.STARTING_LIVES'),'Lives not wired into session');
assert(app.includes('lives<=0'),'Zero-lives fail condition missing');
assert(app.includes('❤️❤️❤️'),'Three-heart UI rule missing');
assert(app.includes('Riprova livello ${gs.level}'),'Retry-level button missing');
assert(html.includes('games-age6.js'),'Age-6 override module not loaded');
assert(html.indexOf('polyfills.js')<html.indexOf('core.js'),'Polyfills must load before app code');
console.log('OK: next-level button, three-life flow, retry flow and age-6 module are wired.');
