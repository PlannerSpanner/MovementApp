// Builds the local review pages into /review (gitignored, never deployed; served on the LAN by
// proto/review/serve.js).
//   review/index.html       Phase 2 report (docs/figure-phase2-report.md) + LIVE before/after loops
//                           for all 37 in-scope movements. BEFORE = engine and data as shipped on
//                           main (read with `git show main:src/...`), AFTER = src/ as it is now.
//   review/sheets.html      eight-phase sheets, before (proto/audit/out/current) above after
//                           (qa/screenshots/sheets), plus the audit report
//   review/assessment.html  the Phase 1 assessment and critique, as written (static)
//   review/tune.html        built separately by proto/skin/build.js
//   node qa/fig/sheets.js && node qa/fig/audit.js && node proto/review/build.js && node proto/review/serve.js
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'review'),IMG=path.join(OUT,'img');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),has=f=>fs.existsSync(path.join(ROOT,f));
const BASE=process.env.REVIEW_BASE||'main';
const old=f=>cp.execFileSync('git',['show',BASE+':src/'+f],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
fs.mkdirSync(IMG,{recursive:true});
const copyPng=(dir,prefix)=>!has(dir)?[]:fs.readdirSync(path.join(ROOT,dir)).filter(f=>f.endsWith('.png')).map(f=>{fs.copyFileSync(path.join(ROOT,dir,f),path.join(IMG,prefix+f));return prefix+f;});
const strips=copyPng('proto/out',''),before=copyPng('proto/audit/out/current','before-'),after=copyPng('qa/screenshots/sheets','after-');
// ---- minimal markdown -> html ----
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const img=(f,alt)=>`<a class="zoom" href="img/${f}"><img loading="lazy" src="img/${f}" alt="${alt||f}"></a>`;
const inl=s=>esc(s).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,a,u)=>img(path.basename(u),a))
  .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
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
// ---- engines for the browser ----
const APPS=[['flow','Morning Flow',['d_flow.js'],'app_tpl.js','const layer=document.getElementById','MOVES',true,'morning-flow'],
            ['daily','Daily 13',['d_daily.js'],'app_tpl.js','const layer=document.getElementById','MOVES',true,'daily-13'],
            ['strength','Strength',['d_wka.js','d_wkb.js'],'wk_tpl.js','// ---- DOM ----','WK_A.concat(WK_B)',false,'strength']];
const mk=(get,[k,label,data,tplF,cut,moves,trall])=>{let tpl=get(tplF);tpl=tpl.slice(0,tpl.indexOf(cut));if(trall)tpl=tpl.replace('const PROPFIT=false;','const PROPFIT=true;');
  return `function(){${get('eng2.js')}\n${data.map(get).join('\n')}\n${tpl}\n;return {MOVES:${moves},poseAt,solve,figMarkup,fitOf,project,pitch:()=>PITCH,setSkin:s=>{if(typeof SKIN!=='undefined')SKIN=s;}};}`;};
const SKINJ=has('src/skin.json')?JSON.stringify(JSON.parse(rd('src/skin.json'))):null;
const now=f=>f==='eng2.js'&&SKINJ?rd('src/'+f).replace('let SKIN=null;','let SKIN='+SKINJ+';'):rd('src/'+f);
const ENG='const MK={'+APPS.map(a=>`B_${a[0]}:${mk(old,a)},A_${a[0]}:${mk(now,a)}`).join(',\n')+'};';
const NOTES=has('docs/figure-phase2-notes.json')?JSON.parse(rd('docs/figure-phase2-notes.json')):{};
const SKIN=null;   // the approved skin is stamped into the AFTER engines above
const LIVE_HTML=`<section id="live"><h2>Before and after, live</h2>
<p>Each pair runs in this page. <b>Before</b> is the engine and pose data shipped on <code>main</code>. <b>After</b> is this branch. Same loop length, same phase. Bilateral movements show one side; the app mirrors at half time.</p>
<div id="bar"><div id="chips"></div><div id="ctl"><button id="pp">Pause</button><button id="sp">1×</button><input id="scrub" type="range" min="0" max="1000" value="0"><span id="phv"></span></div></div>
<div id="close"></div>
<div id="cards"></div></section>`;
const LIVE_JS=`${ENG}
const APPS=${JSON.stringify(APPS.map(a=>[a[0],a[1]]))},NOTES=${JSON.stringify(NOTES)},TUNED=${JSON.stringify(SKIN)};
const STAGES=[['pale stage','#eef3ee',1],['dark stage','#121a15',0]];
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),toHex=c=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>toHex(hex(a).map((v,i)=>v+(hex(b)[i]-v)*t));
const theme=(bg,light)=>light?{bg,body:'#3a3833',R:'#1f1e1b',L:mixc('#3a3833',bg,0.42),floor:mixc(bg,'#000000',0.09),prop:mixc(bg,'#000000',0.3),ink:'#1f1e1b'}
  :{bg,body:'#ece9e2',R:'#ffffff',L:mixc('#ece9e2',bg,0.5),floor:mixc(bg,'#ffffff',0.1),prop:mixc(bg,'#ffffff',0.35),ink:'#ffffff'};
let T=theme(STAGES[0][1],true),skinOn=false,playing=true,speed=1,clock=0,last=0,scrubPh=null;
const views=[],cards=document.getElementById('cards');
APPS.forEach(([k,label])=>{const B=MK['B_'+k](),A=MK['A_'+k]();const h=document.createElement('h3');h.textContent=label;h.id='app-'+k;cards.appendChild(h);
  A.MOVES.forEach((ma,i)=>{const mb=B.MOVES.find(x=>x.n===ma.n)||B.MOVES[i];mb.fit=B.fitOf(mb);ma.fit=A.fitOf(ma);
    const card=document.createElement('div');card.className='card';
    card.innerHTML='<h4>'+(i+1)+'. '+ma.n+'</h4><div class="row"></div>'+(NOTES[k+'/'+ma.n]?'<p class="note">'+NOTES[k+'/'+ma.n]+'</p>':'');
    const row=card.querySelector('.row');
    [[B,mb,'before'],[A,ma,'after']].forEach(([E,m,l])=>{const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<svg viewBox="0 0 100 100"></svg><div class="lab">'+l+'</div>';
      row.appendChild(cell);views.push({E,m,svg:cell.querySelector('svg'),cell,vis:false,after:l==='after'});});
    cards.appendChild(card);});});
// ---- close-ups: same engines, a cropped viewBox, optionally another camera ----
const CLOSE=[
 ['Feet on all fours: Cat-cows','flow','Cat-cows','0 0 100 100',null,'Top of the foot on the floor, sole up, toes straight back. The ankle is inside the foot and the foot is drawn over the end of the shin.'],
 ['Cat-cows, feet close up','flow','Cat-cows','0 50 42 42',null,'The foot is a slim wedge continuing the shin.'],
 ['Feet on all fours: Thread the needle','flow','Thread the needle','0 0 100 100',null,'Same kneeling contact.'],
 ['Feet on all fours: Bird dog','daily','Bird dog','0 0 100 100',null,'Kneeling foot top-down; the extended leg ends in a foot in line with the shin.'],
 ['Prone feet: Cobra press-ups','flow','Cobra press-ups','0 0 100 100',null,'Lying prone the foot is in line with the shin, top down, sole up.'],
 ['Cobra, feet close up','flow','Cobra press-ups','0 40 38 38',null,'A slim wedge continuing the leg.'],
 ['Toes tucked: Plank hold','daily','Plank hold','0 0 100 100',null,'The only floor poses with tucked toes are Plank hold, the rear foot of Reverse lunges and Split squat, and Chest-supported row. The build checks that list.'],
 ['Standing feet close up','daily','Deep squats','22 60 44 44',null,'Sole down. The ankle sits inside the foot, above and forward of the heel; the shin end no longer pokes out.'],
 ['Hands on a farmer hold','daily','Dumbbell farmer hold','22 38 38 38',null,'Dumbbells now sit in the fist, 3.3 units (7 cm) below the hip joint; before, they hung from the wrist joint at hip height. Handles run front to back: a neutral grip.'],
 ['Hands on a row','daily','Dumbbell bent-over row','22 22 50 50',null,'Neutral grip: handles front to back all the way up.'],
 ['Hands on the Romanian deadlift','strength','Romanian deadlift','20 30 55 55',null,'Overhand (pronated) grip on the bar. The bar is in the fist, so the arms hang 5 degrees back of plumb (11 before the hand was added).'],
 ['Feet from above: squat stance','daily','Deep squats','0 0 100 100',{cam:40,pitch:74},'After only: the old engine had one fixed camera height. From above each foot is a footprint, toes a little out.'],
 ['Feet from above: lunge','daily','Reverse lunges','0 0 100 100',{cam:40,pitch:68},'After only. Front foot flat, rear foot on its ball.'],
 ['Feet from the side: lunge','daily','Reverse lunges','0 55 45 45',null,'Flat front foot, rear foot heel-up pivoting on the ball.'],
 ['Prone Y-T-W: the setup preview','daily','Prone Y-T-W raise','0 0 100 100','tview','After only: this is what shows during GET SET UP (side-on, so face-down reads). The loop in the Daily 13 list below is the work view from above, on its mat.'],
];
{const host=document.getElementById('close');const h=document.createElement('h3');h.textContent='Close-ups: hands, feet, Y-T-W';h.id='app-close';host.appendChild(h);
 const eng={};
 CLOSE.forEach(([title,k,name,vb,view,note])=>{eng[k]=eng[k]||{B:MK['B_'+k](),A:MK['A_'+k]()};
  const card=document.createElement('div');card.className='card';card.innerHTML='<h4>'+title+'</h4><div class="row"></div><p class="note">'+note+'</p>';
  const row=card.querySelector('.row');
  (view?[['A','after']]:[['B','before'],['A','after']]).forEach(([w,l])=>{const E=eng[k][w];let m=E.MOVES.find(x=>x.n===name);
    const hold=view==='tview';
    if(view){const v=hold?m.tview:view;m=Object.assign({},m,v);delete m.fit;}
    m.fit=E.fitOf(m);
    const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<svg viewBox="'+vb+'"></svg><div class="lab">'+l+'</div>';
    row.appendChild(cell);views.push({E,m,svg:cell.querySelector('svg'),cell,vis:false,after:w==='A',hold});});
  host.appendChild(card);});}
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=views.find(x=>x.cell===e.target);if(v)v.vis=e.isIntersecting;}),{rootMargin:'200px'});
views.forEach(v=>io.observe(v.cell));
const RX=/#6d4f1c|#c2a473|#7d5a1e|#b9a98b|#42591f|#a8bc85|#5c7d34/g;
function draw(v,ph){
  const mk=v.E.figMarkup(v.m,v.m.fit,ph),map={'#6d4f1c':T.R,'#c2a473':T.L,'#7d5a1e':T.body,'#b9a98b':T.prop,'#42591f':T.R,'#a8bc85':T.L,'#5c7d34':T.body};
  if(!v.g){const p=v.E.poseAt(v.m,0).p,q=v.E.project([p[0],93,p[2]]);v.g={x:q.x*v.m.fit.sc+v.m.fit.ox,y:q.y*v.m.fit.sc+v.m.fit.oy,ry:40*Math.sin(v.E.pitch()*Math.PI/180)};}
  v.svg.innerHTML='<ellipse cx="'+v.g.x.toFixed(1)+'" cy="'+v.g.y.toFixed(1)+'" rx="40" ry="'+v.g.ry.toFixed(1)+'" fill="'+T.floor+'"/>'+mk.replace(RX,c=>map[c]);}
function paint(){document.querySelectorAll('.cell').forEach(c=>{c.style.background=T.bg;c.querySelector('.lab').style.color=T.ink;});if(!playing)frame(performance.now(),true);}
const chips=document.getElementById('chips');
STAGES.forEach((t,i)=>{const b=document.createElement('button');b.className='chip'+(i?'':' on');b.textContent=t[0];
  b.onclick=()=>{T=theme(t[1],!!t[2]);chips.querySelectorAll('.chip.st').forEach(x=>x.classList.remove('on'));b.classList.add('on');paint();};b.classList.add('st');chips.appendChild(b);});
if(TUNED){const b=document.createElement('button');b.className='chip';b.textContent='skin: today';b.onclick=()=>{skinOn=!skinOn;b.textContent=skinOn?'skin: tuned export':'skin: today';b.classList.toggle('on',skinOn);paint();};chips.appendChild(b);}
[['close','Close-ups']].concat(APPS).forEach(([k,label])=>{const a=document.createElement('a');a.className='chip';a.href='#app-'+k;a.textContent=label;chips.appendChild(a);});
const scrub=document.getElementById('scrub'),phv=document.getElementById('phv'),pp=document.getElementById('pp'),sp=document.getElementById('sp');
pp.onclick=()=>{playing=!playing;pp.textContent=playing?'Pause':'Play';if(playing)scrubPh=null;};
sp.onclick=()=>{speed=speed===1?0.5:speed===0.5?0.25:1;sp.textContent=speed+'×';};
scrub.oninput=()=>{playing=false;pp.textContent='Play';scrubPh=scrub.value/1000;frame(performance.now(),true);};
function frame(now,once){const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;if(playing)clock+=dt*speed;
  views.forEach(v=>{if(!v.vis)return;draw(v,v.hold?0:(scrubPh!=null?scrubPh:((clock/v.m.cyc)%1)));});
  phv.textContent=scrubPh!=null?'ph '+scrubPh.toFixed(2):'';
  if(!once)requestAnimationFrame(frame);}
paint();requestAnimationFrame(frame);`;
const CSS=`:root{color-scheme:light dark}body{margin:0;font:16px/1.5 -apple-system,system-ui,Segoe UI,sans-serif;background:#fbfaf7;color:#1d1c1a}
@media(prefers-color-scheme:dark){body{background:#151513;color:#e9e6df}th{background:#24231f!important}td,th{border-color:#3a3833!important}code{background:#2a2925!important}.card{border-color:#3a3833!important}#bar{background:#151513ee!important}}
main{max-width:980px;margin:0 auto;padding:12px 16px 80px}h1{font-size:1.6rem;line-height:1.2}h2{font-size:1.25rem;margin-top:2em;border-top:1px solid #8884;padding-top:1em}h3{font-size:1.1rem;margin:1.4em 0 .3em}h4{font-size:.98rem;margin:0 0 .4em}
nav{display:flex;gap:14px;flex-wrap:wrap;font-size:.9rem;padding:8px 0}a{color:inherit}
code{background:#eceae4;padding:1px 4px;border-radius:4px;font-size:.88em;word-break:break-word}
.tw{overflow-x:auto;margin:1em 0}table{border-collapse:collapse;font-size:.86rem;min-width:100%}th,td{border:1px solid #d9d5cb;padding:5px 8px;text-align:left;vertical-align:top}th{background:#f0ede6}
.zoom{display:block;overflow-x:auto;margin:.6em 0;border:1px solid #8884;border-radius:8px}.zoom img{display:block;height:auto;max-width:none;width:1100px}
@media(min-width:1150px){.zoom img{width:100%}}
#bar{position:sticky;top:0;z-index:5;background:#fbfaf7ee;padding:8px 0;backdrop-filter:blur(6px)}#chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px}
.chip{flex:none;border:1px solid #8886;border-radius:999px;padding:6px 12px;font:inherit;font-size:.82rem;background:transparent;color:inherit;text-decoration:none}.chip.on{border-color:#e0572e;background:#e0572e;color:#fff}
#ctl{display:flex;gap:8px;align-items:center}#ctl button{font:inherit;padding:6px 12px;border-radius:8px;border:1px solid #8886;background:transparent;color:inherit}#scrub{flex:1;min-width:0}#phv{font-size:.8rem;white-space:nowrap}
.card{border:1px solid #d9d5cb;border-radius:12px;padding:10px;margin:12px 0}.note{font-size:.88rem;margin:.5em 0 0;opacity:.9}
.row{display:grid;grid-template-columns:1fr 1fr;gap:6px}.cell{border-radius:10px;overflow:hidden;position:relative}.cell svg{display:block;width:100%;height:auto}.lab{position:absolute;left:8px;top:5px;font-size:.7rem;font-weight:600;opacity:.75}
.pair p{font-size:.8rem;margin:.8em 0 0;opacity:.8}`;
const page=(title,body,js)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}</style></head><body><main>
<nav><a href="index.html">Phase 2 report</a><a href="index.html#live">Before / after loops</a><a href="sheets.html">Sheets + audit</a><a href="rewordings.html">Re-worded rubric lines</a><a href="tune.html">Skin tuning</a><a href="assessment.html">Phase 1 assessment</a></nav>${body}</main>${js?`<script>${js}</script>`:''}</body></html>`;
// ---- index ----
const report=has('docs/figure-phase2-report.md')?md(rd('docs/figure-phase2-report.md')):'<h1>Figure work, Phase 2</h1><p>Report not written yet.</p>';
fs.writeFileSync(path.join(OUT,'index.html'),page('Figure work, Phase 2',report+LIVE_HTML,LIVE_JS));
// ---- sheets: before above after, then the audit ----
const LABEL={'morning-flow':'Morning Flow','daily-13':'Daily 13','strength':'Strength'};
let sh='<h1>Eight-phase sheets, before and after</h1><p>App camera above; small body-frame side and front truth views under each cell (orange = left, blue = right). Before = the Phase 1 audit of the shipped poses. After = this branch. Swipe sideways; tap to open full size.</p>';
for(const a in LABEL){sh+=`<h2>${LABEL[a]}</h2>`;after.filter(f=>f.startsWith('after-'+a+'-')).forEach(f=>{const b='before-'+f.slice(6);
  sh+=`<div class="pair"><p>${f.slice(6).replace(/\.png$/,'')} · before</p>${before.includes(b)?img(b):'<p>(no before sheet)</p>'}<p>after</p>${img(f)}</div>`;});}
if(has('qa/screenshots/fig/audit.md'))sh+=md(rd('qa/screenshots/fig/audit.md'));
['skin.md'].forEach(f=>{if(has('qa/screenshots/fig/'+f))sh+='<h2 id="'+f.replace(/\W/g,'-')+'">'+f+'</h2>'+md(rd('qa/screenshots/fig/'+f));});
fs.writeFileSync(path.join(OUT,'sheets.html'),page('Sheets and audit',sh));
// ---- Phase 1 documents, static ----
let as=md(rd('docs/figure-system-assessment.md'))+'<h2>Strips from Phase 1</h2>'+strips.filter(f=>f.startsWith('strip-')).map(f=>`<p class="note">${f}</p>`+img(f)).join('')+md(rd('docs/pose-critique.md'));
fs.writeFileSync(path.join(OUT,'assessment.html'),page('Phase 1 assessment',as));
if(has('docs/rubric-rewordings.md'))fs.writeFileSync(path.join(OUT,'rewordings.html'),page('Re-worded rubric lines',md(rd('docs/rubric-rewordings.md'))));
if(fs.existsSync(path.join(OUT,'critique.html')))fs.unlinkSync(path.join(OUT,'critique.html'));
console.log('built review/index.html ('+Math.round(fs.statSync(path.join(OUT,'index.html')).size/1024)+' KB), sheets.html ('+after.length+' after, '+before.length+' before), assessment.html');
