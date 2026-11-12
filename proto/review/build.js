// Builds the local review page for the figure-system assessment into /review (gitignored,
// never deployed). Self-contained static files:
//   review/index.html     docs/figure-system-assessment.md rendered, every strip embedded,
//                         plus LIVE loops: row A (current engine) beside row A2 (patched control)
//                         for every prototyped movement, on any phase colour, light or dark
//   review/critique.html  docs/pose-critique.md + all 37 eight-phase sheets + numeric flags
//   review/img/           copies of proto/out/*.png and proto/audit/out/current/*.png
//   node proto/review/build.js && node proto/review/serve.js
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'review'),IMG=path.join(OUT,'img');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
fs.mkdirSync(IMG,{recursive:true});
const cp=(dir)=>fs.readdirSync(path.join(ROOT,dir)).filter(f=>f.endsWith('.png')).map(f=>{fs.copyFileSync(path.join(ROOT,dir,f),path.join(IMG,f));return f;});
const strips=cp('proto/out'),sheets=cp('proto/audit/out/current');
// ---- minimal markdown -> html (headings, paragraphs, lists, tables, images, bold, code, links) ----
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inl=s=>esc(s).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,a,u)=>img(path.basename(u),a))
  .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
const img=(f,alt)=>`<a class="zoom" href="img/${f}"><img loading="lazy" src="img/${f}" alt="${alt||f}"></a>`;
function md(src){
  const L=src.replace(/\r/g,'').split('\n');let h='',i=0;
  const slug=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  while(i<L.length){const l=L[i];
    if(!l.trim()){i++;continue;}
    let m;
    if((m=l.match(/^(#{1,4})\s+(.*)/))){h+=`<h${m[1].length} id="${slug(m[2])}">${inl(m[2])}</h${m[1].length}>`;i++;continue;}
    if(l.startsWith('|')){const rows=[];while(i<L.length&&L[i].startsWith('|')){rows.push(L[i]);i++;}
      const cells=r=>r.replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      h+='<div class="tw"><table><thead><tr>'+cells(rows[0]).map(c=>`<th>${inl(c)}</th>`).join('')+'</tr></thead><tbody>'+
        rows.slice(2).map(r=>'<tr>'+cells(r).map(c=>`<td>${inl(c)}</td>`).join('')+'</tr>').join('')+'</tbody></table></div>';continue;}
    if(/^(\s*)([-*]|\d+\.)\s+/.test(l)){const ord=/^\s*\d+\./.test(l);const items=[];
      while(i<L.length&&(/^(\s*)([-*]|\d+\.)\s+/.test(L[i])||(/^\s+\S/.test(L[i])&&items.length))){
        if(/^(\s*)([-*]|\d+\.)\s+/.test(L[i]))items.push(L[i].replace(/^(\s*)([-*]|\d+\.)\s+/,''));else items[items.length-1]+=' '+L[i].trim();i++;}
      h+=`<${ord?'ol':'ul'}>`+items.map(x=>`<li>${inl(x)}</li>`).join('')+`</${ord?'ol':'ul'}>`;continue;}
    const p=[];while(i<L.length&&L[i].trim()&&!/^(#{1,4}\s|\||\s*([-*]|\d+\.)\s)/.test(L[i])){p.push(L[i].trim());i++;}
    h+=`<p>${inl(p.join(' '))}</p>`;}
  return h;
}
// ---- engines for the browser: the shipped sources, and the patched control ----
const tplCut=()=>{const t=rd('src/app_tpl.js');return t.slice(0,t.indexOf('const layer=document.getElementById')).replace('const PROPFIT=false;','const PROPFIT=true;');};
const srcA=data=>rd('src/eng2.js')+'\n'+rd('src/'+data)+'\n'+tplCut()+'\nconst PITCH_NOW=()=>PITCH;';
const PT=require('../patched/engine');
const srcP=data=>PT.source(data)+'\nconst PITCH_NOW=()=>PITCH;';
const fac=(code)=>`function(){${code}\n;return {MOVES,poseAt,solve,figMarkup,fitOf,project,pitch:PITCH_NOW};}`;
const ENGINES=`const MK={A_flow:${fac(srcA('d_flow.js'))},A_daily:${fac(srcA('d_daily.js'))},P_flow:${fac(srcP('d_flow.js'))},P_daily:${fac(srcP('d_daily.js'))}};
const OV={${Object.keys(PT.OVERRIDE).map(k=>JSON.stringify(k)+':'+PT.OVERRIDE[k].toString()).join(',\n')}};`;
// what is shown live. `ov` applies the control's data-only re-authoring; `pre` runs first.
const CARDS=[
 {n:'Thread the needle',app:'flow',note:'Right arm threads. The app mirrors at the halfway chime; the loop here shows one side.',v:[
   {e:'A',l:'A · current'},{e:'P',l:'A2 · 3 patches + 4 changed numbers',ov:1}]},
 {n:'Side plank',app:'daily',note:'A is a prone body with level hips seen from an angle. A2 uses the new <code>roll</code> number: hips stacked, shoulder over the elbow.',v:[
   {e:'A',l:'A · current'},{e:'P',l:'A2 · root roll + data',ov:1,sw:16}]},
 {n:'Prone Y-T-W raise',app:'daily',note:'<b>The trade to judge.</b> Side-on keeps the prone read and the lift off the floor, and loses the letters. At 58° the Y, T and W read, and the lift does not.',v:[
   {e:'A',l:'A · current, side-on (cam 72, pitch 13)'},{e:'P',l:'A2 · side-on, patches only (no stop at the T)'},{e:'P',l:'A2 · raised camera (cam 40, pitch 58)',ov:1}]},
 {n:'Cat-cows',app:'flow',note:'Data only: two spine pairs changed so the shoulders stay over the hands. Elbows hold 177° all cycle.',v:[
   {e:'A',l:'A · current'},{e:'P',l:'A2 · data only',ov:1}]},
 {n:'Bent rotation sweeps',app:'flow',note:'No data fix was attempted in the control. The only difference is patch 3: the motion no longer stops dead at the both-hands-down crossover. Its remaining faults (hand under the floor, arm as a bar at 0.375) are still there in A2.',v:[
   {e:'A',l:'A · current'},{e:'P',l:'A2 · patches only'}]},
 {n:'Arm sweeps with knee dip',app:'flow',note:'No data fix was attempted in the control and this movement has no mid keyframe, so A2 is identical to A. Shown for completeness: the squatty bottom is a data fault still to fix.',v:[
   {e:'A',l:'A · current'},{e:'P',l:'A2 · patches only (identical)'}]},
];
const THEMES=[['work','light','#e2f0e5'],['work','dark','#11301f'],['setup','light','#f7e8c9'],['setup','dark','#3a2a0d'],['rest','light','#dde8f6'],['rest','dark','#0f2238'],['work','vivid','#2f9e6b'],['setup','vivid','#e0a12e']];
const LIVE_HTML=`<section id="live"><h2>Live loops: A (current) beside A2 (patched control)</h2>
<p>These run the real engine in this page: row A is the shipped <code>src/</code> engine and data, row A2 is the same engine with the three text patches from <code>proto/patched/engine.js</code>. Pick a phase colour; the figure colours follow from the background by one rule. The phase colours are placeholders.</p>
<div id="bar"><div id="chips"></div><div id="ctl"><button id="pp">Pause</button><button id="sp">1×</button><input id="scrub" type="range" min="0" max="1000" value="0"><span id="phv">ph 0.00</span></div></div>
<div id="cards"></div></section>`;
const LIVE_JS=`${ENGINES}
const CARDS=${JSON.stringify(CARDS)},THEMES=${JSON.stringify(THEMES)};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),toHex=c=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>toHex(hex(a).map((v,i)=>v+(hex(b)[i]-v)*t));
const lum=h=>{const [r,g,b]=hex(h).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*r+0.7152*g+0.0722*b;};
const con=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
function theme(bg){const light=con(bg,'#1f1e1b')>=con(bg,'#ffffff');
  return light?{bg,body:'#3a3833',R:'#1f1e1b',L:mixc('#3a3833',bg,0.42),floor:mixc(bg,'#000000',0.09),prop:mixc(bg,'#000000',0.3),ink:'#1f1e1b'}
              :{bg,body:'#ece9e2',R:'#ffffff',L:mixc('#ece9e2',bg,0.5),floor:mixc(bg,'#ffffff',0.1),prop:mixc(bg,'#ffffff',0.35),ink:'#ffffff'};}
let T=theme(THEMES[0][2]),playing=true,speed=1,clock=0,last=0,scrubPh=null;
const views=[];
CARDS.forEach(c=>{const card=document.createElement('div');card.className='card';
  card.innerHTML='<h3>'+c.n+'</h3><p class="note">'+c.note+'</p><div class="row"></div>';
  const row=card.querySelector('.row');
  c.v.forEach(v=>{const E=MK[v.e+'_'+c.app](),m=E.MOVES.find(x=>x.n===c.n);
    if(v.sw!=null)m._sw=v.sw; if(v.ov)OV[c.n](m); m.fit=E.fitOf(m);
    const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<svg viewBox="0 0 100 100"></svg><div class="lab">'+v.l+'</div>';
    row.appendChild(cell);views.push({E,m,svg:cell.querySelector('svg'),cell,vis:true});});
  document.getElementById('cards').appendChild(card);});
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=views.find(x=>x.cell===e.target);if(v)v.vis=e.isIntersecting;}),{rootMargin:'120px'});
views.forEach(v=>io.observe(v.cell));
function draw(v,ph){const mk=v.E.figMarkup(v.m,v.m.fit,ph),map={'#6d4f1c':T.R,'#c2a473':T.L,'#7d5a1e':T.body,'#b9a98b':T.prop};
  // floor disc on the real floor plane under the pelvis at phase 0 (y = 93 in engine units)
  if(!v.g){const p=v.E.poseAt(v.m,0).p;v.E.figMarkup(v.m,v.m.fit,0);const q=v.E.project([p[0],93,p[2]]);v.g={x:q.x*v.m.fit.sc+v.m.fit.ox,y:q.y*v.m.fit.sc+v.m.fit.oy,ry:40*Math.sin(v.E.pitch()*Math.PI/180)};}
  v.svg.innerHTML='<ellipse cx="'+v.g.x.toFixed(1)+'" cy="'+v.g.y.toFixed(1)+'" rx="40" ry="'+v.g.ry.toFixed(1)+'" fill="'+T.floor+'"/>'+mk.replace(/#6d4f1c|#c2a473|#7d5a1e|#b9a98b/g,c=>map[c]);}
function paintTheme(){document.querySelectorAll('.cell').forEach(c=>{c.style.background=T.bg;c.querySelector('.lab').style.color=T.ink;});}
const chips=document.getElementById('chips');
THEMES.forEach((t,i)=>{const b=document.createElement('button');b.className='chip'+(i?'':' on');b.style.background=t[2];b.style.color=theme(t[2]).ink;b.textContent=t[0]+' '+t[1];
  b.onclick=()=>{T=theme(t[2]);chips.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));b.classList.add('on');paintTheme();if(!playing)frame(performance.now(),true);};chips.appendChild(b);});
const scrub=document.getElementById('scrub'),phv=document.getElementById('phv'),pp=document.getElementById('pp'),sp=document.getElementById('sp');
pp.onclick=()=>{playing=!playing;pp.textContent=playing?'Pause':'Play';if(playing)scrubPh=null;};
sp.onclick=()=>{speed=speed===1?0.5:speed===0.5?0.25:1;sp.textContent=speed+'×';};
scrub.oninput=()=>{playing=false;pp.textContent='Play';scrubPh=scrub.value/1000;frame(performance.now(),true);};
function frame(now,once){const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;if(playing)clock+=dt*speed;
  views.forEach(v=>{if(!v.vis)return;const ph=scrubPh!=null?scrubPh:((clock/v.m.cyc)%1);draw(v,ph);});
  if(scrubPh!=null)phv.textContent='ph '+scrubPh.toFixed(2);else phv.textContent='each at its own tempo';
  if(!once)requestAnimationFrame(frame);}
paintTheme();requestAnimationFrame(frame);`;
const CSS=`:root{color-scheme:light dark}body{margin:0;font:16px/1.5 -apple-system,system-ui,Segoe UI,sans-serif;background:#fbfaf7;color:#1d1c1a}
@media(prefers-color-scheme:dark){body{background:#151513;color:#e9e6df}th{background:#24231f!important}td,th{border-color:#3a3833!important}code{background:#2a2925!important}.card{border-color:#3a3833!important}#bar{background:#151513ee!important}}
main{max-width:980px;margin:0 auto;padding:12px 16px 80px}h1{font-size:1.6rem;line-height:1.2}h2{font-size:1.25rem;margin-top:2em;border-top:1px solid #8884;padding-top:1em}h3{font-size:1.05rem;margin:.2em 0}
nav{display:flex;gap:14px;flex-wrap:wrap;font-size:.9rem;padding:8px 0}a{color:inherit}
code{background:#eceae4;padding:1px 4px;border-radius:4px;font-size:.88em;word-break:break-word}
.tw{overflow-x:auto;margin:1em 0}table{border-collapse:collapse;font-size:.86rem;min-width:100%}th,td{border:1px solid #d9d5cb;padding:5px 8px;text-align:left;vertical-align:top}th{background:#f0ede6}
.zoom{display:block;overflow-x:auto;margin:.6em 0;border:1px solid #8884;border-radius:8px}.zoom img{display:block;height:auto;max-width:none;width:1100px}
@media(min-width:1150px){.zoom img{width:100%}}
#bar{position:sticky;top:0;z-index:5;background:#fbfaf7ee;padding:8px 0;backdrop-filter:blur(6px)}#chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px}
.chip{flex:none;border:2px solid transparent;border-radius:999px;padding:6px 12px;font:inherit;font-size:.82rem}.chip.on{border-color:#e0572e}
#ctl{display:flex;gap:8px;align-items:center}#ctl button{font:inherit;padding:6px 12px;border-radius:8px;border:1px solid #8886;background:transparent;color:inherit}#scrub{flex:1;min-width:0}#phv{font-size:.8rem;white-space:nowrap}
.card{border:1px solid #d9d5cb;border-radius:12px;padding:10px;margin:14px 0}.note{font-size:.88rem;margin:.2em 0 .6em;opacity:.85}
.row{display:flex;gap:6px;flex-wrap:wrap}.cell{flex:1 1 150px;border-radius:10px;overflow:hidden}.cell svg{display:block;width:100%;height:auto}.lab{font-size:.74rem;padding:4px 8px 8px;text-align:center}
.gal h3{margin-top:1.4em}`;
const page=(title,body,js)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}</style></head><body><main>
<nav><a href="index.html">Assessment</a><a href="index.html#live">Live loops</a><a href="index.html#all-strips">All strips</a><a href="critique.html">Critique + 37 sheets</a></nav>${body}</main>${js?`<script>${js}</script>`:''}</body></html>`;
// ---- index: the assessment, live loops inserted before "Candidates compared", then every strip ----
let doc=md(rd('docs/figure-system-assessment.md'));
const at=doc.indexOf('<h2 id="candidates-compared">');if(at<0)throw new Error('anchor heading missing');
doc=doc.slice(0,at)+LIVE_HTML+doc.slice(at);
const NAMES={thread:'Thread the needle',windmill:'Bent rotation sweeps',sweeps:'Arm sweeps with knee dip',sideplank:'Side plank',ytw:'Prone Y-T-W raise'};
let gal='<section class="gal"><h2 id="all-strips">All strips</h2><p>Every file in <code>proto/out/</code>. Rows: A current engine, A2 patched control (where one was built), B rig with 2D mannequin, C rig with 3D mannequin. Swipe sideways; tap to open full size.</p>';
for(const k in NAMES){gal+=`<h3>${NAMES[k]}</h3>`+strips.filter(f=>f.startsWith('strip-'+k+'-')).map(f=>`<p class="note">${f.replace(/^strip-[a-z]+-|\.png$/g,'')}</p>`+img(f)).join('');}
gal+='<h3>Live Activity sizes (3x image)</h3>'+img('thumbs.png')+'<h3>Eight backgrounds</h3>'+img('themes.png')+'</section>';
fs.writeFileSync(path.join(OUT,'index.html'),page('Figure system assessment',doc+gal,LIVE_JS));
// ---- critique page ----
const APP={'morning-flow':'Morning Flow','daily-13':'Daily 13','strength':'Strength'};
let cr=md(rd('docs/pose-critique.md'))+'<section class="gal"><h2>All 37 sheets (current engine, eight phases)</h2><p>App camera above; small body-frame side and front truth views below each cell (orange = left, blue = right).</p>';
for(const a in APP){cr+=`<h3>${APP[a]}</h3>`+sheets.filter(f=>f.startsWith(a+'-')).map(f=>img(f)).join('');}
cr+='</section>'+md(rd('proto/audit/out/checks.md'));
fs.writeFileSync(path.join(OUT,'critique.html'),page('Pose critique',cr));
console.log('built review/index.html ('+Math.round(fs.statSync(path.join(OUT,'index.html')).size/1024)+' KB), review/critique.html, '+(strips.length+sheets.length)+' images');
