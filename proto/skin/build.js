// Builds the figure-skin tuning page into /review/tune.html (gitignored, served on the LAN by
// proto/review/serve.js). It runs the REAL engine from src/ in the page: today's constant-width
// skin (SKIN=null) beside the variable-width skin (eng2.js SKIN), with a slider per profile.
// Export posts the chosen values to the server, which writes review/skin-export.json, and
// also offers them as a download.
//   node proto/skin/build.js && node proto/review/serve.js
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'review');
const {source}=require(path.join(ROOT,'qa','fig','engine.js'));
fs.mkdirSync(OUT,{recursive:true});
const fac=app=>`function(){${source(app)}\n;return {MOVES,poseAt,solve,figMarkup,fitOf,project,setCam,pitch:()=>PITCH,setSkin:s=>{SKIN=s;}};}`;
// Stand-ins until step 4 lands the real pose fixes: the control's re-authoring of Side plank
// and Thread the needle (proto/patched/engine.js), applied only while the shipped data is
// still the old pose. Skin tuning should be judged on poses that are roughly right.
const STANDIN=`{
 'Side plank':m=>{if(m.A.roll)return false;const legs={lL:[0,0,0,0],lR:[0,0,0,0]};
   m.cam=0;m.A={p:[0,78.7,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:0,aL:[4,0,4,0],ikR:{w:[26.9,92.5,12.5]},swAR:16,...legs};
   m.B={p:[0,79.3,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:0,aL:[4,0,4,0],ikR:{w:[26.9,92.5,12.5]},swAR:16,...legs};m.pin='LR';return true;},
 'Thread the needle':m=>{if(m.A.s[0]!==84)return false;m.A.s=[62,60];m.M.s=[80,84];m.B.s=[104,118];m.B.hf=40;m.B.tw=-66;return true;}
}`;
const CARDS=[['flow','Thread the needle'],['flow','Bent rotation sweeps'],['flow','Arm sweeps with knee dip'],['daily','Side plank'],['daily','Deep squats']];
const DEF={joint:2.5,mid:2.3,tip:2.0,upper:{w:3.6,at:0.40},fore:{w:3.1,at:0.30},thigh:{w:4.3,at:0.38},shin:{w:3.5,at:0.30},torso:{chest:1.10,waist:0.88,at:0.50,stroke:2.6}};
const PRESETS={
 '1 · today':{joint:3,mid:3,tip:3,upper:{w:3,at:0.5},fore:{w:3,at:0.5},thigh:{w:3,at:0.5},shin:{w:3,at:0.5},torso:{chest:1,waist:1,at:0.5,stroke:2.6}},
 '2 · suggested':DEF,
 '3 · more':{joint:2.6,mid:2.3,tip:1.9,upper:{w:4.2,at:0.40},fore:{w:3.5,at:0.28},thigh:{w:5.2,at:0.36},shin:{w:4.1,at:0.28},torso:{chest:1.16,waist:0.82,at:0.48,stroke:2.8}},
 '4 · most':{joint:2.8,mid:2.3,tip:1.8,upper:{w:4.9,at:0.40},fore:{w:3.9,at:0.27},thigh:{w:6.2,at:0.35},shin:{w:4.7,at:0.27},torso:{chest:1.22,waist:0.78,at:0.46,stroke:3.0}},
};
// slider table: [group, key path, label, min, max, step]
const SL=[
 ['Thigh','thigh.w','max width',1.5,8,0.1],['Thigh','thigh.at','where the max sits (0 hip, 1 knee)',0.1,0.9,0.01],
 ['Shin','shin.w','max width (calf)',1.5,7,0.1],['Shin','shin.at','where the max sits (0 knee, 1 ankle)',0.1,0.9,0.01],
 ['Upper arm','upper.w','max width',1.5,7,0.1],['Upper arm','upper.at','where the max sits (0 shoulder, 1 elbow)',0.1,0.9,0.01],
 ['Forearm','fore.w','max width',1.5,6,0.1],['Forearm','fore.at','where the max sits (0 elbow, 1 wrist)',0.1,0.9,0.01],
 ['Torso','torso.chest','chest width (1 = shoulder joints)',0.9,1.5,0.01],['Torso','torso.waist','waist width (1 = straight side)',0.55,1.1,0.01],
 ['Torso','torso.at','where the waist sits (0 hip, 1 shoulder)',0.2,0.8,0.01],['Torso','torso.stroke','edge thickness (side-on trunk)',1.5,5,0.1],
 ['Joints','joint','shoulder and hip width',1.2,4.5,0.1],['Joints','mid','elbow and knee width',1.2,4.5,0.1],['Joints','tip','wrist and ankle width',1.0,4,0.1],
 ['All','gain','muscle amount (scales every swell; 1 = as set)',0,2,0.05],['All','cap','max width cap, any limb',2,8,0.1],
];
const CSS=`:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;font:15px/1.45 -apple-system,system-ui,Segoe UI,sans-serif;background:#fbfaf7;color:#1d1c1a}
@media(prefers-color-scheme:dark){body{background:#151513;color:#e9e6df}#sheet{background:#1e1d1aF2!important;border-color:#3a3833!important}.card{border-color:#3a3833!important}button,.tab{border-color:#6668!important}}
main{max-width:900px;margin:0 auto;padding:10px 12px 330px}h1{font-size:1.3rem;margin:.3em 0}h2{font-size:1.05rem;margin:1.4em 0 .3em}p{margin:.4em 0}.sm{font-size:.82rem;opacity:.8}
nav{display:flex;gap:14px;flex-wrap:wrap;font-size:.88rem;padding:4px 0}a{color:inherit}
.card{border:1px solid #d9d5cb;border-radius:12px;padding:8px;margin:10px 0}.card h3{font-size:.98rem;margin:0 0 6px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}.cell{border-radius:9px;overflow:hidden;position:relative}.cell svg{display:block;width:100%;height:auto}
.lab{position:absolute;left:7px;top:5px;font-size:.68rem;font-weight:600;letter-spacing:.02em;opacity:.75}
.thumbs{display:flex;gap:10px;overflow-x:auto;padding:6px 0}.tg{flex:none;border-radius:10px;padding:6px 8px;display:flex;gap:6px;align-items:flex-end}.tg div{text-align:center;font-size:.6rem}.tg svg{display:block}
#sheet{position:fixed;left:0;right:0;bottom:0;z-index:9;background:#fbfaf7F2;backdrop-filter:blur(8px);border-top:1px solid #d9d5cb;padding:6px 10px calc(8px + env(safe-area-inset-bottom));max-width:900px;margin:0 auto}
#tabs{display:flex;gap:5px;overflow-x:auto;padding-bottom:5px}.tab{flex:none;font:inherit;font-size:.8rem;padding:5px 10px;border-radius:999px;border:1px solid #8886;background:transparent;color:inherit}.tab.on{background:#e0572e;color:#fff;border-color:#e0572e!important}
.sl{display:grid;grid-template-columns:1fr 3.2em;gap:2px 8px;align-items:center;margin:3px 0}.sl label{font-size:.76rem;grid-column:1/3;opacity:.85}.sl input{width:100%;margin:0}.sl output{font-variant-numeric:tabular-nums;font-size:.85rem;text-align:right}
#row2,#row3{display:flex;gap:6px;align-items:center;margin-top:5px;flex-wrap:wrap}button{font:inherit;font-size:.82rem;padding:6px 10px;border-radius:8px;border:1px solid #8886;background:transparent;color:inherit}
#scrub{flex:1;min-width:60px}#exp{background:#e0572e;color:#fff;border-color:#e0572e!important;font-weight:600}#msg{font-size:.76rem;opacity:.85;flex-basis:100%}
#hide{margin-left:auto}#sheet.min #panel,#sheet.min #row3{display:none}`;
const HTML=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Figure skin tuning</title><style>${CSS}</style></head><body><main>
<nav><a href="index.html">Review page</a><a href="#thumbs">Live Activity sizes</a><a href="#about">What this is</a></nav>
<h1>Figure skin tuning</h1>
<p class="sm">Left of each pair: today's skin. Right: the new variable-width skin, driven by the sliders at the bottom. Top row pale stage, bottom row dark stage. Same engine, same joints: only the drawing changes.</p>
<div id="cards"></div>
<h2 id="thumbs">Live Activity sizes</h2>
<p class="sm">The same figures at 60 pt and 28 pt, today beside new. They follow the scrubber, so pause and drag to find the worst phase.</p>
<div id="th"></div>
<h2 id="about">What this is</h2>
<p class="sm">Widths use the same unit as today's limb stroke, which is 3.0. Each limb segment is drawn as a filled shape that is narrow at its joints and swells to its max width at the chosen point along the bone. The torso keeps its four corner joints; chest and waist factors reshape the outline between them. <b>Export</b> saves the values to <code>review/skin-export.json</code> on the computer serving this page and downloads a copy. Slider positions are remembered on this device.</p>
<p class="sm" id="standin"></p>
</main>
<div id="sheet"><div id="tabs"></div><div id="panel"></div>
<div id="row2"><button id="pp">Pause</button><button id="sp">1×</button><input id="scrub" type="range" min="0" max="1000" value="0"><button id="hide">Hide</button></div>
<div id="row3"><span class="sm">Preset</span><span id="pre"></span><button id="exp">Export</button><span id="msg"></span></div></div>
<script>
const MK={flow:${fac('morning-flow')},daily:${fac('daily-13')}};
const STANDIN=${STANDIN};
const CARDS=${JSON.stringify(CARDS)},SL=${JSON.stringify(SL)},PRESETS=${JSON.stringify(PRESETS)},DEF=${JSON.stringify(DEF)};
const STAGES=[['pale','#eef3ee'],['dark','#121a15']];
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),toHex=c=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>toHex(hex(a).map((v,i)=>v+(hex(b)[i]-v)*t));
const theme=(bg,light)=>light?{bg,body:'#3a3833',R:'#1f1e1b',L:mixc('#3a3833',bg,0.42),floor:mixc(bg,'#000000',0.09),prop:mixc(bg,'#000000',0.3),ink:'#1f1e1b'}
  :{bg,body:'#ece9e2',R:'#ffffff',L:mixc('#ece9e2',bg,0.5),floor:mixc(bg,'#ffffff',0.1),prop:mixc(bg,'#ffffff',0.35),ink:'#ffffff'};
const TH=[theme(STAGES[0][1],true),theme(STAGES[1][1],false)];
// ---- state ----
const get=(o,k)=>k.split('.').reduce((a,p)=>a[p],o),set=(o,k,v)=>{const ps=k.split('.');const l=ps.pop();ps.reduce((a,p)=>a[p],o)[l]=v;};
const clone=o=>JSON.parse(JSON.stringify(o));
let raw=Object.assign(clone(DEF),{gain:1,cap:8});
try{const s=JSON.parse(localStorage.getItem('skinTune2')||'null');if(s&&s.thigh&&s.torso)raw=Object.assign(raw,s);}catch(e){}
function effective(){const s=clone(raw),g=raw.gain,cap=raw.cap;delete s.gain;delete s.cap;
  const base={upper:(s.joint+s.mid)/2,fore:(s.mid+s.tip)/2,thigh:(s.joint+s.mid)/2,shin:(s.mid+s.tip)/2};
  for(const k in base)s[k].w=+Math.min(cap,base[k]+(s[k].w-base[k])*g).toFixed(2);
  s.torso.chest=+(1+(s.torso.chest-1)*g).toFixed(3);s.torso.waist=+(1+(s.torso.waist-1)*g).toFixed(3);return s;}
let SK=effective();
// ---- views ----
const views=[],standins=[];
function mkView(E,m,ti,skinned,host,px){const d=document.createElement('div');
  d.innerHTML='<svg viewBox="0 0 100 100"'+(px?' width="'+px+'" height="'+px+'"':'')+'></svg>';host.appendChild(d);
  const v={E,m,ti,skinned,svg:d.querySelector('svg'),el:d,vis:true};views.push(v);return d;}
CARDS.forEach(([app,n])=>{const E=MK[app](),m=E.MOVES.find(x=>x.n===n);
  if(STANDIN[n]&&STANDIN[n](m))standins.push(n); m.fit=E.fitOf(m);
  const card=document.createElement('div');card.className='card';card.innerHTML='<h3>'+n+'</h3><div class="grid"></div>';
  const grid=card.querySelector('.grid');
  [0,1].forEach(ti=>[false,true].forEach(sk=>{const c=mkView(E,m,ti,sk,grid);c.className='cell';c.style.background=TH[ti].bg;
    c.insertAdjacentHTML('beforeend','<div class="lab" style="color:'+TH[ti].ink+'">'+(sk?'new':'today')+'</div>');}));
  document.getElementById('cards').appendChild(card);
  const row=document.createElement('div');row.className='thumbs';
  [0,1].forEach(ti=>[60,28].forEach(px=>{const g=document.createElement('div');g.className='tg';g.style.background=TH[ti].bg;g.style.color=TH[ti].ink;
    [false,true].forEach(sk=>{const c=mkView(E,m,ti,sk,g,px);c.insertAdjacentHTML('beforeend',sk?'new':'today');});row.appendChild(g);}));
  const h=document.createElement('p');h.className='sm';h.textContent=n;document.getElementById('th').appendChild(h);document.getElementById('th').appendChild(row);});
if(standins.length)document.getElementById('standin').textContent='Stand-in poses (the real pose fixes land in step 4): '+standins.join(', ')+'.';
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=views.find(x=>x.el===e.target);if(v)v.vis=e.isIntersecting;}),{rootMargin:'150px'});
views.forEach(v=>io.observe(v.el));
function draw(v,ph){const T=TH[v.ti];v.E.setSkin(v.skinned?SK:null);
  const mk=v.E.figMarkup(v.m,v.m.fit,ph),map={'#6d4f1c':T.R,'#c2a473':T.L,'#7d5a1e':T.body,'#b9a98b':T.prop};
  if(!v.g){const p=v.E.poseAt(v.m,0).p,q=v.E.project([p[0],93,p[2]]);v.g='<ellipse cx="'+(q.x*v.m.fit.sc+v.m.fit.ox).toFixed(1)+'" cy="'+(q.y*v.m.fit.sc+v.m.fit.oy).toFixed(1)+'" rx="40" ry="'+(40*Math.sin(v.E.pitch()*Math.PI/180)).toFixed(1)+'" fill="'+T.floor+'"/>';}
  v.svg.innerHTML=v.g+mk.replace(/#6d4f1c|#c2a473|#7d5a1e|#b9a98b/g,c=>map[c]);}
// ---- controls ----
const groups=[...new Set(SL.map(s=>s[0]))],tabs=document.getElementById('tabs'),panel=document.getElementById('panel');
let cur=groups[0];
function showGroup(g){cur=g;tabs.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.textContent===g));panel.innerHTML='';
  SL.filter(s=>s[0]===g).forEach(([_,k,label,min,max,step])=>{const d=document.createElement('div');d.className='sl';const val=get(raw,k);
    d.innerHTML='<label>'+label+'</label><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><output>'+(+val).toFixed(step<0.1?2:1)+'</output>';
    const inp=d.querySelector('input'),out=d.querySelector('output');
    inp.oninput=()=>{set(raw,k,+inp.value);out.textContent=(+inp.value).toFixed(step<0.1?2:1);changed();};panel.appendChild(d);});}
groups.forEach(g=>{const b=document.createElement('button');b.className='tab';b.textContent=g;b.onclick=()=>showGroup(g);tabs.appendChild(b);});
function changed(){SK=effective();try{localStorage.setItem('skinTune2',JSON.stringify(raw));}catch(e){}document.getElementById('msg').textContent='';if(!playing)frame(performance.now(),true);}
const pre=document.getElementById('pre');
Object.keys(PRESETS).forEach(n=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{raw=Object.assign(clone(PRESETS[n]),{gain:1,cap:8});showGroup(cur);changed();};pre.appendChild(b);});
let playing=true,speed=1,clock=0,last=0,scrubPh=null;
const scrub=document.getElementById('scrub'),pp=document.getElementById('pp'),sp=document.getElementById('sp'),sheet=document.getElementById('sheet');
pp.onclick=()=>{playing=!playing;pp.textContent=playing?'Pause':'Play';if(playing)scrubPh=null;};
sp.onclick=()=>{speed=speed===1?0.5:speed===0.5?0.25:1;sp.textContent=speed+'×';};
scrub.oninput=()=>{playing=false;pp.textContent='Play';scrubPh=scrub.value/1000;frame(performance.now(),true);};
document.getElementById('hide').onclick=e=>{sheet.classList.toggle('min');e.target.textContent=sheet.classList.contains('min')?'Sliders':'Hide';};
document.getElementById('exp').onclick=async()=>{const body=JSON.stringify({version:1,exported:new Date().toISOString(),skin:SK,sliders:raw},null,1),msg=document.getElementById('msg');
  let saved=false;try{const r=await fetch('export-skin',{method:'POST',headers:{'Content-Type':'application/json'},body});saved=r.ok;}catch(e){}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'application/json'}));a.download='skin-export.json';document.body.appendChild(a);a.click();a.remove();}catch(e){}
  msg.textContent=saved?'Saved to review/skin-export.json on the computer, and downloaded here.':'Could not reach the computer. A copy was downloaded to this device.';};
function frame(now,once){const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;if(playing)clock+=dt*speed;
  views.forEach(v=>{if(!v.vis)return;draw(v,scrubPh!=null?scrubPh:((clock/v.m.cyc)%1));});
  if(!once)requestAnimationFrame(frame);}
showGroup(cur);requestAnimationFrame(frame);
</script></body></html>`;
fs.writeFileSync(path.join(OUT,'tune.html'),HTML);
console.log('built review/tune.html ('+Math.round(HTML.length/1024)+' KB)');
