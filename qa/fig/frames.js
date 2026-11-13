// Frame pins: a hash of every movement's rendered markup (fit + 64 phases, the legacy audit
// render and the ink figure the pages draw) for all five
// apps, from the real engine + data. The committed qa/fig/pins.json is the record of what
// every movement looks like; an engine or data edit that changes a movement nobody meant to
// touch shows up here as a changed hash, by name.
//   node qa/fig/frames.js            check against qa/fig/pins.json (exit 1 on any change)
//   node qa/fig/frames.js --update   rewrite it (do this in the same commit as the intended change)
//   node qa/fig/frames.js --diff     list changed movements, exit 0
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,APPS}=require('./engine');
const FILE=path.join(__dirname,'pins.json'), N=64;
function pins(){
  const out={};
  for(const app of Object.keys(APPS)){const E=load(app);
    E.MOVES.forEach((m,i)=>{const h=crypto.createHash('sha1');
      h.update(JSON.stringify(m.fit));
      for(let k=0;k<N;k++)h.update(E.figMarkup(m,m.fit,k/N));
      // and the INK figure, which is what the pages draw (the stacking order included)
      for(let k=0;k<N;k++)h.update(E.inkFigure(m,m.fit,k/N,null,{id:'p',hatch:true}));
      out[`${app}/${String(i+1).padStart(2,'0')} ${m.n}`]=h.digest('hex').slice(0,16);});}
  return out;
}
if(require.main===module){
  const now=pins(), arg=process.argv[2];
  if(arg==='--update'){fs.writeFileSync(FILE,JSON.stringify(now,null,1)+'\n');console.log('pins.json updated ('+Object.keys(now).length+' movements)');process.exit(0);}
  const was=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE,'utf8')):{};
  const keys=[...new Set([...Object.keys(was),...Object.keys(now)])].sort();
  const ch=keys.filter(k=>was[k]!==now[k]);
  ch.forEach(k=>console.log('  changed: '+k+(was[k]?'':' (new)')+(now[k]?'':' (removed)')));
  console.log(`frames: ${keys.length-ch.length} of ${keys.length} movements byte-identical to the pinned render`+(ch.length?`, ${ch.length} changed`:''));
  if(ch.length&&arg!=='--diff'){console.log('FRAMES FAIL (if the change is intended: node qa/fig/frames.js --update, same commit)');process.exit(1);}
  console.log('FRAMES PASS');
}
module.exports={pins};
