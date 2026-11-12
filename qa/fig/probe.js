// Authoring probe: print solved joints (world x, y, z; y down, floor 93) and key angles.
//   node qa/fig/probe.js <app> "<name substring>" [ph,ph,...] [joint,joint,...]
const {load}=require('./engine'),{sample}=require('./lib');
const [app,name,phs='0,0.25,0.5,0.75',js='']=process.argv.slice(2);
const E=load(app),m=E.MOVES.find(x=>x.n.toLowerCase().includes(name.toLowerCase()));
if(!m){console.log('no movement');process.exit(1);}
const C=sample(E,m),want=js?js.split(','):Object.keys(C.F[0].j);
console.log(m.n,'cam',m.cam||40,'pitch',m.pitch==null?13:m.pitch,'scale',m.fit.sc.toFixed(2));
for(const ph of phs.split(',').map(Number)){const f=C.at(ph);
  console.log(`ph ${ph}  elbows L/R ${C.ang(f,'shL','elL','haL').toFixed(0)}/${C.ang(f,'shR','elR','haR').toFixed(0)}  knees L/R ${C.ang(f,'hpL','knL','ftL').toFixed(0)}/${C.ang(f,'hpR','knR','ftR').toFixed(0)}  trunk ${C.pitch(f,'pelvis','neck').toFixed(0)} from up`);
  console.log('  '+want.map(k=>`${k}[${f.j[k].map(v=>v.toFixed(1)).join(',')}]`).join(' '));}
