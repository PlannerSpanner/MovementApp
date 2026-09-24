// Enumerate every distinct spoken cue string across the five speaking apps by driving
// each built timer end-to-end in a fake DOM with a controllable clock, capturing every
// speechSynthesis.speak() text. Prices out pre-generated TTS cue files.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
function makeEl(){const el={children:[],style:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},attrs:{},_html:'',
  setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},getAttribute(k){return this.attrs[k];},
  appendChild(c){this.children.push(c);return c;},insertAdjacentHTML(){},addEventListener(){},querySelector(){return makeEl();},querySelectorAll(){return [];}};
  Object.defineProperty(el,'innerHTML',{get(){return el._html;},set(v){el._html=v;}});
  Object.defineProperty(el,'textContent',{get(){return el._txt||'';},set(v){el._txt=v;}});return el;}
function run(app){
  const h=fs.readFileSync(path.join(ROOT,`${app}.html`),'utf8');
  const js=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  const els={};let now=1_000_000_000_000;const timeouts=[],intervals=[];const spoken=[];
  const FakeDate=function(...a){return a.length?new Date(...a):new Date(now);};FakeDate.now=()=>now;
  const AC=function(){this.state='running';this.currentTime=0;this.resume=()=>{};
    this.createOscillator=()=>({type:'',frequency:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},start(){},stop(){}});
    this.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});this.destination={};};
  const doc={getElementById(id){return els[id]||(els[id]=makeEl());},createElement(){const a=makeEl();a.play=()=>Promise.resolve();a.pause=()=>{};a.load=()=>{};return a;},
    createElementNS(){return makeEl();},querySelector(){return makeEl();},querySelectorAll(){return [];},addEventListener(){},visibilityState:'visible'};
  const env={document:doc,navigator:{wakeLock:{request:async()=>({addEventListener(){},release(){}})}},
    window:{AudioContext:AC,addEventListener(){}},AudioContext:AC,performance:{now:()=>0},requestAnimationFrame(){},
    setInterval:(fn)=>{intervals.push(fn);return intervals.length;},clearInterval(){},setTimeout:(fn)=>{timeouts.push(fn);return 1;},
    console:{log(){},warn(){},error(){}},Date:FakeDate,Math,JSON,String,Object,Array,Number,Boolean,Promise,Error,RegExp,
    SpeechSynthesisUtterance:function(t){this.text=t;},speechSynthesis:{getVoices(){return [];},speak(u){spoken.push(u.text);},cancel(){},addEventListener(){}}};
  env.window.speechSynthesis=env.speechSynthesis;env.window.SpeechSynthesisUtterance=env.SpeechSynthesisUtterance;
  const fn=new Function(...Object.keys(env),js+(app==='hip-activation'?'\n;return {toggleTimer};':'\n;return {};'));
  const ex=fn(...Object.values(env));
  const start=app==='hip-activation'?ex.toggleTimer:els['bMain'].onclick;
  start();
  // hip-activation counts seconds itself via tick(); the template apps read Date.now()
  for(let s=0;s<4000;s++){now+=1000;intervals.forEach(t=>t());timeouts.splice(0).forEach(t=>t());
    if(els['bMain']&&els['bMain'].style.display==='none')break;
    if(app==='hip-activation'&&els['mainBtn']&&els['mainBtn'].style.display==='none')break;}
  timeouts.splice(0).forEach(t=>t());
  return spoken.filter(t=>t&&t.trim().length>1);
}
const APPS=['morning-flow','prenatal-stretch','prenatal-movement','daily-13','hip-activation'];
const all=new Map();let totalSpoken=0;
for(const app of APPS){const sp=run(app);totalSpoken+=sp.length;const d=new Set(sp);
  console.log(`${app.padEnd(18)} ${String(sp.length).padStart(3)} cues spoken, ${String(d.size).padStart(3)} distinct`);
  d.forEach(t=>{if(!all.has(t))all.set(t,new Set());all.get(t).add(app);});}
const texts=[...all.keys()];
const words=texts.reduce((a,t)=>a+t.split(/\s+/).length,0),chars=texts.reduce((a,t)=>a+t.length,0);
const sharedN=texts.filter(t=>all.get(t).size>1).length;
console.log(`\nDISTINCT CUE STRINGS: ${texts.length} (${sharedN} shared by 2+ apps) | ${words} words, ${chars} chars`);
// speech at rate .8 ≈ 2.2 words/s (+0.4 s tail per clip)
const secs=texts.reduce((a,t)=>a+t.split(/\s+/).length/2.2+0.4,0);
console.log(`Estimated audio: ${secs.toFixed(0)} s total (avg ${(secs/texts.length).toFixed(1)} s/clip)`);
for(const [name,kbps] of [['AAC-HE 32 kbps mono',32],['MP3 48 kbps mono',48],['MP3 64 kbps mono',64]])
  console.log(`  ${name.padEnd(22)} ≈ ${(secs*kbps/8).toFixed(0)} KB total, ≈ ${(secs*kbps/8/texts.length).toFixed(1)} KB/clip`);
const perApp={};for(const app of APPS){const t=texts.filter(x=>all.get(x).has(app));perApp[app]=t.reduce((a,x)=>a+x.split(/\s+/).length/2.2+0.4,0);}
console.log('\nPer-app audio seconds (own cue set):',Object.entries(perApp).map(([a,s])=>`${a}=${s.toFixed(0)}s`).join('  '));
if(process.argv[2]==='--list'){console.log('\n'+texts.map(t=>`[${[...all.get(t)].map(a=>a.slice(0,4)).join(',')}] ${t}`).join('\n'));}
fs.writeFileSync(path.join(ROOT,'qa','cue-strings.json'),JSON.stringify(texts,null,1));
