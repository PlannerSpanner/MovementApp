// Voice-path invariants for every app that speaks (4 timer apps + hip-activation).
// Runs each built script against a fake DOM with a Safari-shaped speechSynthesis:
//   1. getVoices() is EMPTY (new-device iOS: list populates async / never) -> cues
//      must still be spoken, with no voice object attached (system default), and the
//      app must warn on the console rather than fail silently.
//   2. the Start tap must call speechSynthesis.speak() SYNCHRONOUSLY inside the click
//      handler (iOS drops speak() that is not rooted in a user gesture; a setTimeout
//      breaks the chain) — same priming the AudioContext already gets.
//   3. with speechSynthesis missing entirely, Start must still run the timer.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
function makeEl(){
  const el={children:[],style:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},
    attrs:{},_html:'',
    setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},
    getAttribute(k){return this.attrs[k];},appendChild(c){this.children.push(c);return c;},
    insertAdjacentHTML(){},handlers:{},addEventListener(k,f){this.handlers[k]=f;},querySelector(){return makeEl();},
    querySelectorAll(){return [];}};
  Object.defineProperty(el,'innerHTML',{get(){return el._html;},set(v){el._html=v;}});
  Object.defineProperty(el,'textContent',{get(){return el._txt||'';},set(v){el._txt=v;}});
  return el;
}
let fail=false;
const check=(name,ok)=>{console.log(`${name.padEnd(64)} ${ok?'ok':'FAIL'}`);if(!ok)fail=true;};
function fakeAudio(){return function(){this.state='suspended';this.currentTime=0;
  this.resume=()=>{this.state='running';};
  this.createOscillator=()=>({type:'',frequency:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},start(){},stop(){}});
  this.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
  this.destination={};};}
// run one app; opts.speech=false removes speechSynthesis entirely
function run(app,opts){
  const h=fs.readFileSync(path.join(ROOT,`${app}.html`),'utf8');
  const scripts=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const js=scripts.join('\n');
  const els={}; const timeouts=[],intervals=[]; let frameCb=null,pnow=0;
  const spoken=[]; let inGesture=false; const warns=[];
  const body=makeEl(),h1=makeEl();
  const doc={body,getElementById(id){return els[id]||(els[id]=makeEl());},
    createElement(tag){if(tag==='audio'&&opts.audio!==false){const a=makeEl();a.loop=false;a.paused=true;a.playCalls=[];
        a.play=()=>{a.playCalls.push(inGesture);a.paused=false;return Promise.resolve();};
        a.pause=()=>{a.paused=true;};a.load=()=>{};media.push(a);return a;}
      return makeEl();},createElementNS(){return makeEl();},
    querySelector(sel){return sel==='h1'?h1:makeEl();},querySelectorAll(){return [];},
    addEventListener(){},visibilityState:'visible'};
  const media=[]; let sessionType=null; let getVoicesCalls=0;
  const AC=fakeAudio();
  const env={document:doc,
    navigator:{wakeLock:{request:async()=>({addEventListener(){},release(){}})}},
    window:{AudioContext:AC,addEventListener(){}},
    AudioContext:AC,
    performance:{now:()=>pnow},
    requestAnimationFrame:cb=>{frameCb=cb;},
    setInterval:(fn)=>{intervals.push(fn);return intervals.length;},
    clearInterval(){},setTimeout:(fn)=>{timeouts.push(fn);return 1;},
    console:{log(){},warn(...a){warns.push(a.join(' '));},error(...a){warns.push(a.join(' '));}},
    Date,Math,JSON,String,Object,Array,Number,Boolean,Promise,Error,RegExp};
  if(opts.debug)env.location={search:'?debug=1'};
  if(opts.audio!==false){
    env.navigator.audioSession={get type(){return sessionType||'auto';},set type(v){sessionType=v;}};
  }
  if(opts.speech!==false){
    env.SpeechSynthesisUtterance=function(t){this.text=t;this.voice=undefined;this.ev={};this.addEventListener=(k,f)=>{this.ev[k]=f;};};
    env.speechSynthesis={getVoices(){getVoicesCalls++;return [];},speaking:false,pending:false,
      speak(u){spoken.push({text:u.text,voice:u.voice,gesture:inGesture});if(u.ev.start)u.ev.start();if(u.ev.end)u.ev.end();},
      cancel(){},addEventListener(){}};
    env.window.speechSynthesis=env.speechSynthesis;
    env.window.SpeechSynthesisUtterance=env.SpeechSynthesisUtterance;
  }
  // hip-activation wires buttons via inline onclick attributes -> export its handlers
  const tail=app==='hip-activation'?'\n;return {toggleTimer};':'\n;return {};';
  const fn=new Function(...Object.keys(env),js+tail);
  const ex=fn(...Object.values(env));
  for(let i=0;i<4;i++){pnow+=40;if(frameCb){const cb=frameCb;frameCb=null;cb(pnow);}}
  const start=app==='hip-activation'?ex.toggleTimer:(els['bMain']&&els['bMain'].onclick);
  if(!start)throw new Error('no Start handler found');
  inGesture=true; start(); inGesture=false;
  const primed=spoken.filter(s=>s.gesture);
  timeouts.splice(0).forEach(t=>t());          // deferred cue announcements
  intervals.forEach(t=>t());
  for(let i=0;i<4;i++){pnow+=40;if(frameCb){const cb=frameCb;frameCb=null;cb(pnow);}}
  // tap again = Pause
  inGesture=true; start(); inGesture=false;
  return {spoken,primed,warns,intervals,els,media,body,h1,getVoicesCalls:()=>getVoicesCalls,sessionType:()=>sessionType};
}
const APPS=['morning-flow','prenatal-stretch','prenatal-movement','daily-13','hip-activation'];
for(const app of APPS){
  try{
    const r=run(app,{});
    check(`${app}: Start tap primes speech synchronously in the gesture`,r.primed.length>=1);
    const cues=r.spoken.filter(s=>s.text&&s.text.trim().length>1);
    check(`${app}: first cue spoken with empty voice list`,cues.length>=1);
    check(`${app}: no voice object attached when list is empty (system default)`,cues.every(s=>s.voice==null));
    check(`${app}: warns on console when no matching voice is available`,r.warns.some(w=>/voice/i.test(w)));
    check(`${app}: timer started (interval registered)`,r.intervals.length>=1);
    // ring/silent switch: a bare AudioContext gets the 'ambient' session on iOS and is
    // muted by the switch; an active media element (and audioSession 'playback') is not
    const loop=r.media.find(a=>a.loop);
    check(`${app}: silent looping media element started in the Start tap`,!!loop&&loop.playCalls[0]===true);
    const srcs=loop?loop.children.map(c=>c.src):[];
    check(`${app}: first <source> is an inline data URI (no network)`,/^data:audio\//.test(srcs[0]||''));
    check(`${app}: second <source> is the silent.wav fallback file`,srcs[1]==='silent.wav');
    check(`${app}: media element paused when the timer pauses`,!!loop&&loop.paused===true);
    check(`${app}: navigator.audioSession.type set to playback`,r.sessionType()==='playback');
    const r2=run(app,{speech:false});
    check(`${app}: timer still starts with speechSynthesis absent`,r2.intervals.length>=1);
    // ?debug=1 on-device diagnostics panel: present only when asked, logs prime + cue lifecycle
    check(`${app}: no debug panel without ?debug=1`,r.body.children.length===0);
    const rd=run(app,{debug:true});
    const panel=rd.body.children[0];const txt=panel?JSON.stringify(panel.children.map(c=>c.textContent)):'';
    check(`${app}: ?debug=1 renders the panel`,!!panel);
    check(`${app}: panel shows speechSynthesis presence + voices + speaking/pending/paused`,/'speechSynthesis' in window/.test(txt)&&/voices \(last list/.test(txt)&&/speaking:.*pending:.*paused:/.test(txt));
    check(`${app}: panel logs prime speak() and its START/END`,/prime: speak/.test(txt)&&/prime START/.test(txt)&&/prime END/.test(txt));
    check(`${app}: panel logs each cue speak() with START/END`,/cue#1 speak\(\)/.test(txt)&&/cue#1 START/.test(txt)&&/cue#1 END/.test(txt));
    check(`${app}: debug run still starts the timer`,rd.intervals.length>=1);
    // strictly passive: the panel adds no speech API calls, and the poll is read-only
    check(`${app}: debug panel adds no getVoices()/speak() calls`,rd.getVoicesCalls()===r.getVoicesCalls()&&rd.spoken.length===r.spoken.length);
    check(`${app}: cue lines carry AC/session/keepAlive snapshot`,/cue#1 speak\(\)[^\n]*AC\[[^\n]*session\[[^\n]*keepAlive\[/.test(txt)&&/cue#1 START[^\n]*AC\[/.test(txt));
    // 5 quick taps on the title open the panel without the query string (home-screen build)
    const rt=run(app,{});
    for(let i=0;i<5;i++)rt.h1.handlers.click&&rt.h1.handlers.click();
    const tpanel=rt.body.children[0];const ttxt=tpanel?JSON.stringify(tpanel.children.map(c=>c.textContent)):'';
    check(`${app}: 5 title taps open the panel with buffered history`,!!tpanel&&/prime: speak/.test(ttxt)&&/debug view on \(5 taps\)/.test(ttxt));
    const r3=run(app,{audio:false});
    check(`${app}: timer still starts with media/audioSession absent`,r3.intervals.length>=1);
  }catch(e){console.log(app,'RUNTIME ERROR:',e.message);fail=true;}
}
console.log(fail?'VOICE FAIL':'VOICE PASS');
process.exit(fail?1:0);
