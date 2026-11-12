// Design prototypes (gitignored output, served on the LAN by proto/review/serve.js):
//   review/design/index.html      chooser
//   review/design/a.html b.html c.html   three directions, same real engine, same flow:
//   home -> transition poster -> setup -> work -> ... -> finish (celebration, chime, seal) -> seal sheet
// The figure is drawn by the shipped engine (src/, skin included); only its inks are remapped
// here: right limbs and head solid ink, LEFT limbs engraved hatching (solid tone below a size
// where the hatch would shimmer).   node proto/design/build.js
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'review','design');
const {source}=require(path.join(ROOT,'qa','fig','engine.js'));
fs.mkdirSync(OUT,{recursive:true});
const fac=app=>`function(){${source(app)}\n;return {MOVES,poseAt,solve,figMarkup,fitOf,project,pitch:()=>PITCH};}`;
const DIRS={
 a:{name:'A · Letterpress',blurb:'Restrained and left-aligned. One accent ink, thin rules, lots of paper. Movement names sit over a rule.',
    font:"'DIN Condensed','Avenir Next Condensed','Arial Narrow',sans-serif",numFont:"'DIN Condensed','Avenir Next Condensed','Arial Narrow',sans-serif",
    frame:12,radius:4,torso:'ink',gap:1,texture:0,rays:0,zig:0,banner:'rule',seal:'ring',weight:700,track:'0.16em',align:'left',ground:'line'},
 b:{name:'B · Broadside',blurb:'Two-colour job-printing poster, centred. Thick colour frame with a keyline, names reversed out of a black bar, numerals between heavy rules.',
    font:"'Futura-CondensedExtraBold','Futura Condensed','Avenir Next Condensed','Arial Narrow',sans-serif",numFont:"'Futura-CondensedExtraBold','Avenir Next Condensed','Arial Narrow',sans-serif",
    frame:16,radius:2,torso:'ink',gap:1,texture:1,rays:0,zig:0,banner:'bar',seal:'ticks',weight:800,track:'0.08em',align:'center',ground:'line'},
 c:{name:'C · Woodcut',blurb:'Full woodcut. Carved border and a fan of rays on the poster moments, names on a curved ribbon, the figure on a cut ground. The work screen is still plain paper.',
    font:"'Rockwell','Copperplate','Avenir Next Condensed',serif",numFont:"'DIN Condensed','Avenir Next Condensed','Arial Narrow',sans-serif",
    frame:20,radius:0,torso:'ink',gap:1,texture:2,rays:1,zig:1,banner:'ribbon',seal:'sun',weight:700,track:'0.1em',align:'center',ground:'band'}};
const CSS=d=>`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{--paper:#f3ead6;--ink:#1b1814;--verm:#d2432a;--ochre:#d99a2b;--mute:#7d7361;--deep:#1b1814;--frame:var(--paper)}
:root.dark{--paper:#151310;--ink:#efe5cf;--verm:#e2573c;--ochre:#e0a53a;--mute:#9a917f;--deep:#000}
html{font-size:100%}body{margin:0;background:var(--frame);color:var(--ink);font-family:${d.font};transition:background .5s;min-height:100dvh;-webkit-user-select:none;user-select:none}
#app{position:fixed;inset:0;padding:calc(${d.frame}px + env(safe-area-inset-top)) ${d.frame}px calc(${d.frame}px + env(safe-area-inset-bottom));display:flex}
#paper{flex:1;background:var(--paper);border-radius:${d.radius}px;position:relative;overflow:hidden;display:flex;flex-direction:column;${d.frame>10?'outline:1.5px solid var(--ink);outline-offset:-5px;':''}}
${d.zig?`#app.orn::before{content:"";position:absolute;inset:6px;border:5px solid var(--ink);pointer-events:none;-webkit-mask:repeating-conic-gradient(from 45deg,#000 0 25%,#0000 0 50%) 0 0/10px 10px;mask:repeating-conic-gradient(from 45deg,#000 0 25%,#0000 0 50%) 0 0/10px 10px;opacity:.85}`:''}
.screen{position:absolute;inset:0;display:none;flex-direction:column;padding:14px 16px 12px}.screen.on{display:flex}
.caps{text-transform:uppercase;letter-spacing:${d.track};font-weight:${d.weight}}
.tiny{font-size:.78rem}.mute{color:var(--mute)}
h1{font-size:clamp(2.2rem,${d.font.indexOf('Rockwell')>=0?'10.5vw':'13vw'},4rem);line-height:.9;margin:.1em 0 0;text-transform:uppercase;letter-spacing:.02em;font-weight:${d.weight}}
.rule{height:${d.frame>10?3:1}px;background:var(--ink);margin:10px 0}
.tao{font-family:'Baskerville','Hoefler Text',Georgia,serif;font-style:italic;font-size:1.05rem;line-height:1.35;margin:.2em 0 0;text-transform:none;letter-spacing:0}
.stage{position:relative;width:100%;max-width:min(100%,52dvh);margin:0 auto;aspect-ratio:1}
#setup .stage,#work .stage{margin:auto}
#setup,#work{${d.align==='center'?'text-align:center;':''}}.stage svg{position:absolute;inset:0;width:100%;height:100%}
.poster{background:var(--verm);color:var(--paper)}.poster .mute{color:var(--paper);opacity:.8}
${d.texture?`.poster::after,.tex::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${d.texture>1?'.9':'1.4'}' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${d.texture>1?'1.6 -.75':'-1.2 .8'}'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");mix-blend-mode:${d.texture>1?'multiply':'soft-light'};opacity:${d.texture>1?'.35':'.6'}}`:''}
.btn{font:inherit;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:58px;margin-top:8px;padding:8px 16px;background:transparent;color:var(--ink);border:${d.frame>10?2.5:1.2}px solid var(--ink);border-radius:${d.radius}px;font-size:1.35rem;text-transform:uppercase;letter-spacing:${d.track};font-weight:${d.weight}}
.btn small{font-size:.8rem;opacity:.7}.btn.go{background:var(--verm);color:var(--paper);border-color:var(--ink)}
.btn:active{transform:translateY(1px)}
.num{font-family:${d.numFont};font-weight:${d.weight};font-size:clamp(5.5rem,34vw,10rem);line-height:.82;letter-spacing:-.01em;text-align:${d.align};font-variant-numeric:tabular-nums;margin-top:auto;${d.banner==='bar'?'border-top:4px solid var(--ink);border-bottom:4px solid var(--ink);padding:.12em 0 .02em;':''}}
.bar{display:flex;gap:10px;align-items:stretch;margin-top:10px}.bar .pill{min-height:58px;min-width:${d.font.indexOf('Rockwell')>=0?'62px;padding:7px 8px;letter-spacing:.04em':'76px'};border-radius:${d.radius}px;font-size:.95rem;border-width:1.5px}
.next{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;text-align:left;border:1.5px solid var(--ink);border-radius:${d.radius}px;padding:6px 12px}.next b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:${d.font.indexOf('Rockwell')>=0?'.92rem;letter-spacing:.04em':'1.25rem'};line-height:1.1}
.ticks{display:flex;gap:4px;margin-top:10px}.ticks i{flex:1;height:5px;background:var(--mute);opacity:.35}.ticks i.done{background:var(--ink);opacity:1}.ticks i.now{background:var(--verm);opacity:1}
.week{display:flex;gap:6px;justify-content:space-between;margin-top:8px}.day{flex:1;aspect-ratio:1;border:1px dashed var(--mute);border-radius:50%;display:grid;place-items:center;font-size:.7rem;color:var(--mute);position:relative}
.day svg,.cell svg{position:absolute;inset:-8%;width:116%;height:116%}
.stamp{animation:stamp .5s cubic-bezier(.2,1.6,.4,1) both}@keyframes stamp{0%{transform:scale(2.4) rotate(-18deg);opacity:0}60%{opacity:1}100%{transform:scale(1) rotate(-7deg);opacity:1}}
.sheet{position:absolute;left:0;right:0;top:0;background:var(--paper);border-bottom:2px solid var(--ink);padding:16px 16px 16px;transform:translateY(-105%);transition:transform .28s;z-index:5;font-family:'Baskerville',Georgia,serif;font-size:1.05rem;line-height:1.4}.sheet.on{transform:none}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-top:10px}.cell{aspect-ratio:1;border:1px dashed var(--mute);border-radius:50%;position:relative;display:grid;place-items:center;font-size:.62rem;color:var(--mute)}
.top{display:flex;justify-content:space-between;align-items:center}.pill{font:inherit;font-size:.78rem;background:transparent;color:inherit;border:1px solid currentColor;border-radius:999px;padding:7px 12px;min-height:36px;text-transform:uppercase;letter-spacing:.12em}
.center{text-align:center}
.rays{position:absolute;left:-30%;bottom:-34%;width:230%;aspect-ratio:1;background:conic-gradient(from 10deg at 22% 78%,#0000 0 4deg,var(--ochre) 0 13deg,#0000 0 22deg,var(--ochre) 0 28deg,#0000 0 41deg,var(--ochre) 0 52deg,#0000 0 60deg,var(--ochre) 0 66deg,#0000 0 78deg,var(--ochre) 0 90deg,#0000 0 360deg);opacity:.85;pointer-events:none}
.z{position:relative;z-index:1}`;
const PAGE=(k,d)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${d.name}</title><style>${CSS(d)}</style></head><body>
<div id="app"><div id="paper">
<section class="screen on" id="home">
  <div class="top"><span class="caps tiny mute">${d.name}</span><span><button class="pill" id="dark">Dark</button> <a class="pill" href="index.html" style="text-decoration:none">All 3</a></span></div>
  
  <h1 class="z">Movement</h1><div class="rule z"></div>
  <p class="tao z" id="tao"></p><p class="caps tiny mute z" id="taosrc"></p>
  <div class="stage z" id="st-home" style="max-width:min(60%,24dvh)"></div>
  <div style="margin-top:auto" class="z">
   <div class="caps tiny mute">This week</div><div class="week" id="week"></div>
   <button class="btn go" data-s="daily"><span>Daily 13</span><small>12 min</small></button>
   <button class="btn" data-s="flow"><span>Morning Flow</span><small>13 min</small></button>
   <button class="btn" data-s="sheet"><span>Seal sheet</span><small>history</small></button>
  </div>
</section>
<section class="screen poster" id="trans">${d.rays?'<div class="rays"></div>':''}
  <div class="caps tiny z" id="tr-count"></div><div style="margin:auto 0" class="z center"><div id="tr-banner"></div><div class="caps" style="font-size:1.1rem;margin-top:14px" id="tr-sub"></div></div>
</section>
<section class="screen" id="setup">
  <div id="su-banner"></div>
  <div class="stage" id="st-setup"></div>
  <div class="num" id="su-num" style="font-size:clamp(3.4rem,19vw,5.6rem);border:0;padding:0"></div>
  <div class="ticks" id="tk1"></div>
  <div class="bar"><div class="next" style="background:var(--ochre);color:#1b1814;border-color:var(--ink)"><span class="caps tiny">Get set</span><b class="caps" id="su-cue" style="font-size:.95rem;white-space:normal"></b></div><button class="pill" id="skip1">Skip</button></div>
</section>
<section class="screen" id="work">
  <div class="stage" id="st-work"></div>
  <div class="num" id="wk-num"></div>
  <div class="ticks" id="tk2"></div>
  <div class="bar"><button class="pill" id="pause">Pause</button><div class="next"><span class="caps tiny">Next</span><b class="caps" id="wk-next"></b></div><button class="pill" id="skip2">Skip</button></div>
  <div class="sheet" id="form"></div>
</section>
<section class="screen poster" id="finish">${d.rays?'<div class="rays"></div>':''}
  <div class="caps tiny z">Movement complete</div><div class="stage z" id="st-fin" style="max-width:min(86%,38dvh)"></div>
  <h1 class="z center" style="font-size:clamp(2.6rem,15vw,4.4rem)">Done</h1><p class="tao z center" id="fin-line" style="color:var(--paper)"></p>
  <div class="week z" id="week2" style="margin-top:auto"></div>
  <button class="btn z" id="fin-home" style="color:var(--paper);border-color:var(--paper)"><span>Home</span><small>seal sheet</small></button>
</section>
<section class="screen" id="sheet"><div class="top"><span class="caps">Seal sheet</span><button class="pill" id="sh-home">Home</button></div><div class="rule"></div>
  <div class="caps tiny mute">November · one seal a day</div><div class="grid" id="grid"></div>
  <p class="tao" style="margin-top:auto">No streak count. A missed day is an empty circle, nothing more.</p>
</section>
</div></div>
<script>
const D=${JSON.stringify(d)};
const MK={daily:${fac('daily-13')},flow:${fac('morning-flow')}};
const EN={daily:MK.daily(),flow:MK.flow()};
const $=id=>document.getElementById(id),root=document.documentElement;
const css=v=>getComputedStyle(root).getPropertyValue(v).trim();
let INKS={};const inks=()=>{INKS={paper:css('--paper'),ink:css('--ink'),verm:css('--verm'),ochre:css('--ochre'),mute:css('--mute')};};
// ---- the ink figure: right limbs + head solid, LEFT limbs hatched, trunk per direction ----
const SRC={R:'#6d4f1c',L:'#c2a473',T:'#7d5a1e',P:'#b9a98b'};
function inkFig(mk,px,onPoster,uid){const I=INKS,ink=onPoster?I.paper:I.ink,paper=onPoster?I.verm:I.paper;
  const hatchOK=px>=2.3;                       // hatch period is 1.5 units: below ~3.5 px it shimmers, so fall back to a tone
  const tone='color-mix(in srgb,'+ink+' 46%,'+paper+')',gap=D.gap?' stroke="'+paper+'" stroke-width="0.42"':'';
  let defs='',n=0;
  // left hands and feet (the curved shapes): solid tone, they are too small to hold a hatch
  let s=mk.replace(new RegExp('fill="'+SRC.L+'" stroke="'+SRC.L+'" stroke-width="[^"]*"','g'),'fill="'+tone+'" stroke="'+ink+'" stroke-width="0.4"');
  // left limb segments: one pattern each, anchored to the limb's first point and turned square to the bone,
  // so the hatch rides with the limb (no crawl) and every segment has the same texture
  s=s.replace(new RegExp('<path d="M(-?[0-9.]+),(-?[0-9.]+)L(-?[0-9.]+),(-?[0-9.]+)([^"]*)" fill="'+SRC.L+'"/>','g'),(m0,x0,y0,x1,y1,rest)=>{
    if(!hatchOK)return '<path d="M'+x0+','+y0+'L'+x1+','+y1+rest+'" fill="'+tone+'"/>';
    const id='hx-'+uid+'-'+(n++),ang=Math.atan2(y1-y0,x1-x0)*180/Math.PI+90+22;
    defs+='<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="1.5" height="1.5" patternTransform="translate('+x0+' '+y0+') rotate('+ang.toFixed(1)+')"><rect width="1.5" height="1.5" fill="'+paper+'"/><rect width="1.5" height="0.62" fill="'+ink+'"/></pattern>';
    return '<path d="M'+x0+','+y0+'L'+x1+','+y1+rest+'" fill="url(#'+id+')" stroke="'+ink+'" stroke-width="0.5"/>';});
  s=s.replace(new RegExp('fill="'+SRC.R+'"/>','g'),'fill="'+ink+'"'+gap+'/>')
    .split(SRC.R).join(ink).split(SRC.L).join(ink).split(SRC.P).join(I.ochre).split(SRC.T).join(ink);
  return '<defs>'+defs+'</defs>'+s;}
const views={};
function view(host,poster){const el=$(host);el.innerHTML='<svg viewBox="0 0 100 100"></svg>';return views[host]={svg:el.firstChild,el,poster,id:host};}
function draw(v,E,m,ph){if(!m.fit)m.fit=E.fitOf(m);const px=v.el.clientWidth/100;
  const p=E.poseAt(m,0).p;const mk=E.figMarkup(m,m.fit,ph),q=E.project([p[0],93,p[2]]);
  const gy=q.y*m.fit.sc+m.fit.oy+1.6*m.fit.sc,gx=q.x*m.fit.sc+m.fit.ox,ink=v.poster?INKS.paper:INKS.ink;
  let g='<line x1="'+(gx-30)+'" x2="'+(gx+30)+'" y1="'+gy.toFixed(1)+'" y2="'+gy.toFixed(1)+'" stroke="'+ink+'" stroke-width="0.5" stroke-linecap="round" opacity=".55"/>';
  if(D.ground==='band'){g='<line x1="'+(gx-34)+'" x2="'+(gx+34)+'" y1="'+gy.toFixed(1)+'" y2="'+gy.toFixed(1)+'" stroke="'+ink+'" stroke-width="0.9"/>';for(let i=-11;i<=11;i++)g+='<line x1="'+(gx+i*3)+'" x2="'+(gx+i*3-1.6)+'" y1="'+(gy+0.6).toFixed(1)+'" y2="'+(gy+3.2-Math.abs(i)*0.12).toFixed(1)+'" stroke="'+ink+'" stroke-width="0.45"/>';}
  v.svg.innerHTML=g+inkFig(mk,px,v.poster,v.id);}
// ---- demo session: three real movements, shortened ----
const get=(k,n)=>EN[k].MOVES.find(m=>m.n===n);
const SESS={daily:[['daily','Deep squats'],['daily','Bird dog'],['daily','Side plank']],flow:[['flow','Arm sweeps with knee dip'],['flow','Cat-cows'],['flow','Thread the needle']]};
const idle=get('daily','Standing posture reset');
const cele=(()=>{const b=JSON.parse(JSON.stringify(get('flow','Bouncing in place')));b.n='celebrate';b.cyc=0.9;delete b.fit;
  [b.A,b.M,b.B].forEach((K,i)=>{K.yaw=-34;K.aL=[180,-(24+i*4),180,-(30+i*8)];K.aR=[180,24+i*4,180,30+i*8];K.hf=-8;});return b;})();
const TAO=${JSON.stringify(JSON.parse(fs.readFileSync(path.join(ROOT,'docs','design','tao-legge.json'),'utf8')).lines.map(l=>[l.text,'Tao Te Ching '+l.ch+' · Legge, 1891']))};
// ---- ornaments (original: plain print vocabulary) ----
function banner(text,poster){const ink=poster?INKS.ink:INKS.ink,pap=INKS.paper,n=text.length,fs=Math.max(15,Math.min(30,430/n));
  if(D.banner==='rule')return '<div class="caps" style="font-size:clamp(1.7rem,9vw,2.6rem);line-height:1">'+text+'</div><div class="rule" style="background:'+(poster?pap:INKS.ink)+'"></div>';
  if(D.banner==='bar')return '<div class="caps" style="background:'+(poster?INKS.paper:INKS.ink)+';color:'+(poster?INKS.verm:INKS.paper)+';font-size:clamp(1.5rem,'+(n>16?'6.4':'8.4')+'vw,2.4rem);line-height:1;padding:.34em .4em .26em;text-align:center">'+text+'</div>';
  const rib=true;
  return '<svg viewBox="0 -6 320 122" style="width:100%;display:block"><path id="bp" d="M22,78 Q160,14 298,78" fill="none"/>'
   +(rib?'<path d="M4,70 l34,-12 l-6,30 z M316,70 l-34,-12 l6,30 z" fill="'+ink+'"/>':'')
   +'<path d="M22,78 Q160,14 298,78" fill="none" stroke="'+ink+'" stroke-width="'+(rib?46:40)+'" stroke-linecap="'+(rib?'butt':'round')+'"/>'
   +'<path d="M22,78 Q160,14 298,78" fill="none" stroke="'+pap+'" stroke-width="'+(rib?39:34)+'" stroke-linecap="'+(rib?'butt':'round')+'"/>'
   +'<text font-size="'+fs+'" font-weight="'+D.weight+'" letter-spacing="1.6" fill="'+INKS.ink+'" style="text-transform:uppercase;font-family:inherit" dy="'+(fs*0.34)+'"><textPath href="#bp" startOffset="50%" text-anchor="middle">'+text.toUpperCase()+'</textPath></text></svg>';}
function seal(day,col){const c=col||INKS.verm,p=INKS.paper;let g='';
  if(D.seal==='ring')g='<circle cx="50" cy="50" r="40" fill="none" stroke="'+c+'" stroke-width="6"/><circle cx="50" cy="50" r="27" fill="'+c+'"/>';
  else if(D.seal==='ticks'){g='<circle cx="50" cy="50" r="44" fill="'+c+'"/><circle cx="50" cy="50" r="36" fill="none" stroke="'+p+'" stroke-width="2"/>';for(let i=0;i<24;i++){const a=i*Math.PI/12;g+='<line x1="'+(50+38*Math.cos(a))+'" y1="'+(50+38*Math.sin(a))+'" x2="'+(50+43*Math.cos(a))+'" y2="'+(50+43*Math.sin(a))+'" stroke="'+p+'" stroke-width="1.6"/>';}}
  else{let r='';for(let i=0;i<11;i++){const a=i*2*Math.PI/11+(i%3)*0.07,b=a+Math.PI/15+(i%2)*0.05;r+='M50,50L'+(50+47*Math.cos(a))+','+(50+47*Math.sin(a))+'L'+(50+47*Math.cos(b))+','+(50+47*Math.sin(b))+'Z';}
    g='<path d="'+r+'" fill="'+c+'"/><circle cx="50" cy="50" r="33" fill="'+c+'" stroke="'+p+'" stroke-width="2.5"/>';}
  return '<svg viewBox="0 0 100 100">'+g+'<text x="50" y="59" text-anchor="middle" font-size="26" font-weight="800" fill="'+p+'" style="font-family:inherit">'+day+'</text></svg>';}
const DAYS=['M','T','W','T','F','S','S'],TODAY=3,doneWeek=[1,1,0,0,0,0,0];
function week(id,stampToday){$(id).innerHTML=DAYS.map((d,i)=>'<div class="day">'+d+(doneWeek[i]?'<span class="'+(stampToday&&i===TODAY?'stamp':'')+'" style="position:absolute;inset:0;transform:rotate(-7deg)">'+seal(9+i,id==='week2'?INKS.ink:null)+'</span>':'')+'</div>').join('');}
function grid(){let h='';for(let i=1;i<=30;i++){const done=i<=12&&i!==4&&i!==8||(i===12&&doneWeek[TODAY]);h+='<div class="cell">'+i+(done&&i<=12?'<span style="position:absolute;inset:0;transform:rotate('+((i*37)%19-9)+'deg)">'+seal(i,i%5===0?INKS.ochre:null)+'</span>':'')+'</div>';}$('grid').innerHTML=h;}
// ---- sound: the app's own sine-chime family ----
let actx=null;const ac=()=>actx||(actx=new (window.AudioContext||window.webkitAudioContext)());
function chime(f,v,d,at){try{const c=ac(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+(at||0);o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.02);g.gain.exponentialRampToValueAtTime(0.0008,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+0.05);}catch(e){}}
const cTrans=()=>{chime(440,.12,1);chime(554.37,.1,.8,.15);chime(659.25,.08,.6,.3);};
const cDone=()=>{chime(440,.12,1.2);chime(554.37,.1,1,.2);chime(659.25,.1,1,.4);chime(880,.08,1.6,.6);chime(110,.2,.35,1.05);chime(1318.5,.05,1.8,1.1);};   // the last two land with the seal
// ---- flow ----
let st='home',sk='daily',mi=0,t0=0,dur=0,clock0=performance.now(),paused=false,pausedAt=0;
const FRAME={home:'--paper',trans:'--verm',setup:'--ochre',work:'--verm',finish:'--deep',sheet:'--paper'};
function show(s){st=s;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('on',e.id===s));root.style.setProperty('--frame','var('+FRAME[s]+')');$('form').classList.remove('on');$('app').classList.toggle('orn',s==='home'||s==='trans'||s==='finish'||s==='sheet');paused=false;$('pause').textContent='Pause';}
const cur=()=>{const [k,n]=SESS[sk][mi];return [EN[k],get(k,n)];};
function ticks(id){$(id).innerHTML=SESS[sk].map((_,i)=>'<i class="'+(i<mi?'done':i===mi?'now':'')+'"></i>').join('');}
function go(s){t0=performance.now();
  if(s==='trans'){const [,m]=cur();dur=1900;$('tr-count').textContent=(mi+1)+' of '+SESS[sk].length;$('tr-banner').innerHTML=banner(m.n,true);$('tr-sub').textContent=mi?'Next':'Begin';cTrans();}
  if(s==='setup'){const [,m]=cur();dur=5000;$('su-banner').innerHTML=banner(m.n,false);$('su-cue').textContent=(m.setup||'').split('.')[0];ticks('tk1');}
  if(s==='work'){const [,m]=cur();dur=11000;const nx=SESS[sk][mi+1];$('wk-next').textContent=nx?nx[1]:'Finish';ticks('tk2');$('form').innerHTML='<div class="caps tiny mute" style="font-family:inherit">'+m.n+'</div>'+m.cue+'.<div class="caps tiny mute" style="margin-top:8px">Tap to close</div>';chime(660,.1,.5);}
  if(s==='finish'){dur=1e9;doneWeek[TODAY]=1;$('fin-line').textContent='Squats sunk, dog walked, line held.';week('week2',true);cDone();}
  if(s==='home'){week('week');}if(s==='sheet')grid();
  show(s);}
function nextPhase(){if(st==='trans')go('setup');else if(st==='setup')go('work');else if(st==='work'){mi++;go(mi<SESS[sk].length?'trans':'finish');}}
function loop(now){if(paused){requestAnimationFrame(loop);return;}const el=now-t0,left=Math.max(0,dur-el),sec=Math.ceil(left/1000),tph=((now-clock0)/1000);
  if(st==='home')draw(views['st-home'],EN.daily,idle,(tph/idle.cyc)%1);
  else if(st==='setup'){const [E,m]=cur();draw(views['st-setup'],E,m,0);$('su-num').textContent=sec;}
  else if(st==='work'){const [E,m]=cur();draw(views['st-work'],E,m,((el/1000)/m.cyc)%1);$('wk-num').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
  else if(st==='finish')draw(views['st-fin'],EN.flow,cele,(tph/cele.cyc)%1);
  if((st==='trans'||st==='setup'||st==='work')&&left<=0)nextPhase();
  requestAnimationFrame(loop);}
inks();['st-home','st-setup','st-work'].forEach(h=>view(h,false));view('st-fin',true);
{const t=TAO[Math.floor(Date.now()/864e5)%TAO.length];$('tao').textContent='\\u201c'+t[0]+'\\u201d';$('taosrc').textContent=t[1];}
document.querySelectorAll('.btn[data-s]').forEach(b=>b.onclick=()=>{const s=b.dataset.s;if(s==='sheet')return go('sheet');sk=s;mi=0;try{ac().resume();}catch(e){}go('trans');});
$('skip1').onclick=$('skip2').onclick=e=>{e.stopPropagation();nextPhase();};
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Resume':'Pause';if(paused)pausedAt=performance.now();else t0+=performance.now()-pausedAt;};
$('st-work').onclick=()=>$('form').classList.toggle('on');$('form').onclick=()=>$('form').classList.remove('on');
$('fin-home').onclick=$('sh-home').onclick=()=>go('home');
const setDark=on=>{root.classList.toggle('dark',on);inks();$('dark').textContent=on?'Light':'Dark';go(st==='finish'?'finish':st);};
$('dark').onclick=()=>setDark(!root.classList.contains('dark'));
if(location.hash==='#dark'||(matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches&&location.hash!=='#light'))setDark(true);
go('home');requestAnimationFrame(loop);
window.__go=(s,i)=>{if(i!=null)mi=i;go(s);};
</script></body></html>`;
for(const k in DIRS)fs.writeFileSync(path.join(OUT,k+'.html'),PAGE(k,DIRS[k]));
fs.writeFileSync(path.join(OUT,'index.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Design directions</title>
<body style="margin:0;padding:20px 18px;background:#f3ead6;color:#1b1814;font:17px/1.45 -apple-system,system-ui,sans-serif;max-width:640px"><h1 style="font-size:1.5rem">Three directions</h1>
<p>Each is a working prototype on the real engine. Tap a session on its home screen; it runs three movements, shortened, through transition, setup, work and the finish. <b>Skip</b> jumps a phase. Tap the figure during work for the form text. Sound starts on the first tap.</p>
${Object.keys(DIRS).map(k=>`<p><a href="${k}.html" style="display:block;padding:16px;border:2px solid #1b1814;color:inherit;text-decoration:none"><b>${DIRS[k].name}</b><br>${DIRS[k].blurb}<br><span style="font-size:.85rem">also: <a href="${k}.html#dark">dark</a></span></a></p>`).join('')}
<p><a href="../index.html">Back to the figure review page</a></p></body>`);
console.log('built review/design: index + '+Object.keys(DIRS).join(', '));
