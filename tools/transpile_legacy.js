/* Build the browser JavaScript for Android 6 / legacy WebView. */
const fs=require('fs'),path=require('path');
let ts;
try{ts=require('typescript');}catch(e){
  try{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');}
  catch(_e){console.error('TypeScript non trovato. Installa con: npm install -g typescript');process.exit(2);}
}
const root=path.resolve(__dirname,'..'),src=path.join(root,'src','js'),out=path.join(root,'app','js');
fs.mkdirSync(out,{recursive:true});
for(const name of fs.readdirSync(src).filter(x=>x.endsWith('.js')).sort()){
  const input=fs.readFileSync(path.join(src,name),'utf8');
  const result=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None,downlevelIteration:true,removeComments:false}});
  fs.writeFileSync(path.join(out,name),result.outputText,'utf8');
  console.log('ES5',name);
}
console.log('Compat build completata:',out);
