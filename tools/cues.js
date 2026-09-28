// Cue-string enumerator = SOURCE OF TRUTH for the spoken clips. Drives each built
// timer end-to-end in a fake DOM with a controllable clock, capturing every say()
// call through the app's __onSay seam (text + the segment it was spoken in, so a
// transition cue knows its gap length). Also toggles Voice off/on to capture the
// fixed "Voice on." line. Writes qa/cue-strings.json for tools/gen_cues.py.
//
//   node tools/cues.js            # enumerate -> qa/cue-strings.json (+ pricing summary)
//   node tools/cues.js --list     # also print every string
//   node tools/cues.js --check [--dir <built-html-dir>]
//        verify every enumerated string has a clip in src/cues.json AND the file
//        exists; report transition cues that overrun their gap. Exit 1 on a missing
//        clip — rebuild.py runs this against the freshly built pages and refuses to
//        install them if it fails.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const args=process.argv.slice(2);const DIR=args.includes('--dir')?args[args.indexOf('--dir')+1]:ROOT;
function makeEl(){const el={children:[],style:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},attrs:{},_html:'',
  setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},getAttribute(k){return this.attrs[k];},
  appendChild(c){this.children.push(c);return c;},insertAdjacentHTML(){},addEventListener(){},querySelector(){return makeEl();},querySelectorAll(){return [];}};
  Object.defineProperty(el,'innerHTML',{get(){return el._html;},set(v){el._html=v;}});
  Object.defineProperty(el,'textContent',{get(){return el._txt||'';},set(v){el._txt=v;}});return el;}
function run(app){
  // --dir points at a staging build; pages not built from src (hip-activation) live in ROOT
  const fp=[path.join(DIR,`${app}.html`),path.join(ROOT,`${app}.html`)].find(f=>fs.existsSync(f));
  const h=fs.readFileSync(fp,'utf8');
  const js=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  const els={};let now=1_000_000_000_000;const timeouts=[],intervals=[];const spoken=[];
  const FakeDate=function(...a){return a.length?new Date(...a):new Date(now);};FakeDate.now=()=>now;
  const AC=function(){this.state='running';this.currentTime=0;this.resume=()=>Promise.resolve();
    this.createOscillator=()=>({type:'',frequency:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},start(){},stop(){}});
    this.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});this.destination={};};
  const doc={getElementById(id){return els[id]||(els[id]=makeEl());},createElement(){const a=makeEl();a.play=()=>Promise.resolve();a.pause=()=>{};a.load=()=>{};return a;},
    createElementNS(){return makeEl();},querySelector(){return makeEl();},querySelectorAll(){return [];},addEventListener(){},visibilityState:'visible'};
  const win={AudioContext:AC,addEventListener(){},__onSay(t,seg){spoken.push({text:t,gap:seg&&seg.trans?seg.dur:null});}};
  const env={document:doc,navigator:{wakeLock:{request:async()=>({addEventListener(){},release(){}})}},
    window:win,AudioContext:AC,performance:{now:()=>0},requestAnimationFrame(){},
    setInterval:(fn)=>{intervals.push(fn);return intervals.length;},clearInterval(){},setTimeout:(fn)=>{timeouts.push(fn);return 1;},
    console:{log(){},warn(){},error(){}},Date:FakeDate,Math,JSON,String,Object,Array,Number,Boolean,Promise,Error,RegExp};
  const fn=new Function(...Object.keys(env),js+(app==='hip-activation'?'\n;return {toggleTimer,toggleVoice};':'\n;return {};'));
  const ex=fn(...Object.values(env));
  const start=app==='hip-activation'?ex.toggleTimer:els['bMain'].onclick;
  // Voice off then on: captures the fixed confirmation line
  const vt=app==='hip-activation'?ex.toggleVoice:els['bVoice'].onclick; vt(); vt();
  start();
  for(let s=0;s<4000;s++){now+=1000;intervals.forEach(t=>t());timeouts.splice(0).forEach(t=>t());
    if(els['bMain']&&els['bMain'].style.display==='none')break;
    if(app==='hip-activation'&&els['mainBtn']&&els['mainBtn'].style.display==='none')break;}
  timeouts.splice(0).forEach(t=>t());
  return spoken.filter(s=>s.text&&s.text.trim().length>1);
}
const APPS=['morning-flow','prenatal-stretch','prenatal-movement','daily-13','hip-activation'];
const all=new Map();let totalSpoken=0;
for(const app of APPS){const sp=run(app);totalSpoken+=sp.length;
  const d=new Map();sp.forEach(s=>{const e=d.get(s.text)||{gap:null};if(s.gap&&(!e.gap||s.gap<e.gap))e.gap=s.gap;d.set(s.text,e);});
  console.log(`${app.padEnd(18)} ${String(sp.length).padStart(3)} cues spoken, ${String(d.size).padStart(3)} distinct`);
  d.forEach((e,t)=>{const g=all.get(t)||{apps:new Set(),gap:null};g.apps.add(app);if(e.gap&&(!g.gap||e.gap<g.gap))g.gap=e.gap;all.set(t,g);});}
const texts=[...all.keys()];
const out=texts.map(t=>({text:t,gap:all.get(t).gap,apps:[...all.get(t).apps]}));
fs.writeFileSync(path.join(ROOT,'qa','cue-strings.json'),JSON.stringify(out,null,1));
const words=texts.reduce((a,t)=>a+t.split(/\s+/).length,0);
console.log(`\nDISTINCT CUE STRINGS: ${texts.length} (${texts.filter(t=>all.get(t).apps.size>1).length} shared) | ${words} words -> qa/cue-strings.json`);
if(args.includes('--list'))console.log(out.map(o=>`[${o.apps.map(a=>a.slice(0,4)).join(',')}]${o.gap?' gap '+o.gap+'s':''} ${o.text}`).join('\n'));
if(args.includes('--check')){
  const mp=path.join(ROOT,'src','cues.json');
  if(!fs.existsSync(mp)){console.log('CUES CHECK FAIL: src/cues.json missing — run tools/gen_cues.py');process.exit(1);}
  const man=JSON.parse(fs.readFileSync(mp,'utf8'));const clips=man.clips||{};
  const missing=out.filter(o=>!clips[o.text]);
  const nofile=out.filter(o=>clips[o.text]&&!fs.existsSync(path.join(ROOT,clips[o.text].f)));
  const over=out.filter(o=>o.gap&&clips[o.text]&&clips[o.text].s>o.gap-0.8-3.0);
  const orphan=Object.keys(clips).filter(t=>!all.has(t));
  over.forEach(o=>console.log(`  WARN cue overruns its gap: ${clips[o.text].s}s clip in a ${o.gap}s gap (budget ${(o.gap-3.8).toFixed(1)}s): ${o.text.slice(0,70)}`));
  orphan.forEach(t=>console.log(`  note: manifest clip no app speaks: ${t.slice(0,70)}`));
  if(missing.length||nofile.length){
    missing.forEach(o=>console.log(`  MISSING CLIP: ${o.text}`));nofile.forEach(o=>console.log(`  FILE MISSING: ${clips[o.text].f} for: ${o.text}`));
    console.log(`CUES CHECK FAIL: ${missing.length} string(s) without a clip, ${nofile.length} clip file(s) missing — run tools/gen_cues.py`);process.exit(1);}
  console.log(`CUES CHECK PASS — ${out.length} strings, all clips present (${over.length} gap overrun warning(s))`);
}
