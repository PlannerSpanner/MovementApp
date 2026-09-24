// runtime smoke test: fake DOM, execute the whole app script, run frames, click buttons
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
function makeEl(){
  const el={children:[],style:{},classList:{add(){},remove(){},toggle(){}},
    attrs:{},_html:'',
    setAttribute(k,v){this.attrs[k]=String(v);},
    removeAttribute(k){delete this.attrs[k];},
    getAttribute(k){return this.attrs[k];},
    appendChild(c){this.children.push(c);return c;},
    insertAdjacentHTML(){},
    addEventListener(){},
    querySelector(){return makeEl();},
  };
  Object.defineProperty(el,'innerHTML',{get(){return el._html;},set(v){el._html=v;}});
  Object.defineProperty(el,'textContent',{get(){return el._txt||'';},set(v){el._txt=v;}});
  return el;
}
function run(app){
  const h=fs.readFileSync(path.join(ROOT,`${app}.html`),'utf8');
  const js=h.split('<script>')[1].split('</script>')[0];
  const els={};
  const doc={getElementById(id){return els[id]||(els[id]=makeEl());},
    createElement(){return makeEl();},
    createElementNS(){return makeEl();},
    querySelector(){return makeEl();},
    addEventListener(){},
    visibilityState:'visible'};
  let frameCb=null; const timeouts=[];
  const env={document:doc,
    navigator:{wakeLock:{request:async()=>({addEventListener(){},release(){}})}},
    window:{AudioContext:function(){this.state='running';this.currentTime=0;
      this.resume=()=>{};this.createOscillator=()=>({type:'',frequency:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},start(){},stop(){}});
      this.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
      this.destination={};}},
    SpeechSynthesisUtterance:function(t){this.t=t;},
    speechSynthesis:{speak(){},getVoices(){return [];},addEventListener(){}},
    performance:{now:()=>pnow},
    requestAnimationFrame:cb=>{frameCb=cb;},
    setInterval:(fn,ms)=>{intervals.push(fn);return intervals.length;},
    clearInterval:()=>{}, setTimeout:(fn,ms)=>{timeouts.push(fn);return 1;},
    Date, Math, JSON, String, Object, Array, console};
  env.AudioContext=env.window.AudioContext;
  env.window.speechSynthesis=env.speechSynthesis;env.window.SpeechSynthesisUtterance=env.SpeechSynthesisUtterance;
  const intervals=[]; let pnow=0;
  const fn=new Function(...Object.keys(env), js);
  fn(...Object.values(env));                       // top-level execution
  for(let i=0;i<8;i++){ pnow+=40; if(frameCb){const cb=frameCb;frameCb=null;cb(pnow);} }  // frames
  // press Start, run a few timer ticks, background-return sim
  const start=els['bMain']; if(start&&start.onclick){start.onclick(); timeouts.forEach(t=>t()); intervals.forEach(t=>t());}
  for(let i=0;i<8;i++){ pnow+=40; if(frameCb){const cb=frameCb;frameCb=null;cb(pnow);} }
  const layer=els['layer'];
  const drawn=layer&&layer._html&&layer._html.includes('<line')&&layer._html.includes('<circle');
  const feet=(layer._html.match(/<line/g)||[]).length;
  const ground=els['shadow']&&els['shadow'].attrs.rx==='40';
  console.log(`${app.padEnd(20)} top-level ok | figure drawn: ${!!drawn} (${feet} lines) | ground placed: ${!!ground}`);
  if(!drawn||!ground) process.exitCode=1;
}
for(const app of ['morning-flow','prenatal-stretch','prenatal-movement','daily-13']){
  try{run(app);}catch(e){console.log(app,'RUNTIME ERROR:',e.message);process.exitCode=1;}
}
// strength.html has no timer/buttons: execute top-level, run frames, click a tab
// and a set-check, and confirm every movement's layer got real figure markup
function runWk(){
  const h=fs.readFileSync(path.join(ROOT,'strength.html'),'utf8');
  const js=h.split('<script>')[1].split('</script>')[0];
  const els={};
  const doc={getElementById(id){return els[id]||(els[id]=makeEl());},
    createElement(){return makeEl();},querySelector(){return makeEl();},
    addEventListener(){},visibilityState:'visible'};
  let frameCb=null; let pnow=0;
  const env={document:doc,window:{addEventListener(){}},
    performance:{now:()=>pnow},
    requestAnimationFrame:cb=>{frameCb=cb;},
    setTimeout:()=>1,Date,Math,JSON,String,Object,Array,console};
  const fn=new Function(...Object.keys(env),js);
  fn(...Object.values(env));
  for(let i=0;i<6;i++){pnow+=40;if(frameCb){const cb=frameCb;frameCb=null;cb(pnow);}}
  if(els['tabB']&&els['tabB'].onclick)els['tabB'].onclick();
  if(els['ck-A-0-0']&&els['ck-A-0-0'].onclick)els['ck-A-0-0'].onclick();
  for(let i=0;i<6;i++){pnow+=40;if(frameCb){const cb=frameCb;frameCb=null;cb(pnow);}}
  let drawn=0,empty=[];
  for(const id of Object.keys(els))if(id.startsWith('ly-')){
    if(els[id]._html&&els[id]._html.includes('<line')&&els[id]._html.includes('<circle'))drawn++;
    else empty.push(id);
  }
  const ok=drawn===11&&!empty.length;
  console.log(`strength             top-level ok | figures drawn: ${drawn}/11${empty.length?' EMPTY: '+empty.join(','):''}`);
  if(!ok)process.exitCode=1;
}
try{runWk();}catch(e){console.log('strength','RUNTIME ERROR:',e.message);process.exitCode=1;}
