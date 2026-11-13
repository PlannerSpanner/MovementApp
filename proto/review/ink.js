// Review page for the ink-figure rebuild and the app icon (2026-11-13), into /review (gitignored,
// served on the LAN by proto/review/serve.js):
//   review/ink.html   icons at home-screen size; BEFORE / AFTER live loops in the INK render for
//                     Will's nine complaints (close-ups) and for every movement in all five apps.
// BEFORE = the engine, data and templates at REVIEW_BASE (default 71785b7, design-refresh before
// the rebuild), read with `git show`. AFTER = src/ as it is now.
//   node proto/icons/build.js && node proto/review/ink.js
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'review');
const BASE=process.env.REVIEW_BASE||'71785b7';
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const old=f=>cp.execFileSync('git',['show',BASE+':src/'+f],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
const skin=(get,f)=>{const s=get(f);if(f!=='eng2.js')return s;let sk=null;try{sk=JSON.stringify(JSON.parse(get('skin.json')));}catch(e){}return sk?s.replace('let SKIN=null;','let SKIN='+sk+';'):s;};
const APPS=[['flow','Morning Flow',['d_flow.js'],'app_tpl.js','const layer=document.getElementById','MOVES',true],
            ['daily','Daily 13',['d_daily.js'],'app_tpl.js','const layer=document.getElementById','MOVES',true],
            ['strength','Strength',['d_wka.js','d_wkb.js'],'wk_tpl.js','// ---- DOM ----','WK_A.concat(WK_B)',false],
            ['stretch','Prenatal Stretch (archived)',['d_stretch.js'],'app_tpl.js','const layer=document.getElementById','MOVES',false],
            ['birth','Birth Prep (archived)',['d_birth.js'],'app_tpl.js','const layer=document.getElementById','MOVES',false]];
const mk=(get,[k,label,data,tplF,cut,moves,trall])=>{let tpl=get(tplF);tpl=tpl.slice(0,tpl.indexOf(cut));if(trall)tpl=tpl.replace('const PROPFIT=false;','const PROPFIT=true;');
  return `function(){${skin(get,'eng2.js')}\n${data.map(f=>get(f)).join('\n')}\n${tpl}\n;return {MOVES:${moves},poseAt,solve,figMarkup,fitOf,project,wk:${tplF==='wk_tpl.js'},`
    +`tone:typeof inkTone==='function'?inkTone:null,ink:typeof inkFigure==='function'?inkFigure:null};}`;};
const ENG='const MK={'+APPS.map(a=>`B_${a[0]}:${mk(old,a)},A_${a[0]}:${mk(f=>rd('src/'+f),a)}`).join(',\n')+'};';
const ICONS=JSON.parse(rd('icons/options.json'));
const b64=f=>'data:image/png;base64,'+fs.readFileSync(path.join(ROOT,'icons',f)).toString('base64');
// close-ups: [title, app, movement, joints to centre on, width of the crop, note]
const CLOSE=[
 ['1. One outline rule: both sides','daily','Standing posture reset',['hpL','hpR','knL','knR','haL','haR'],46,'Every part now has the same ink outline. The right limbs are ink inside it, the left limbs paper with engraved lines; the hatch runs on through the left hand and foot instead of stopping at a grey one.'],
 ['2. No caps at knees and elbows','daily','Deep squats',['knL','knR','hpL'],44,'Each limb is one shape from hip to toes and from shoulder to fingertips. The hatch turns the corner at the joint with a mitre; nothing is drawn across it.'],
 ['2. Elbows','flow','Punching rotations',['elL','elR','shL','shR'],44,'Same rule at the elbow and the wrist.'],
 ['3. One foot shape, no arch','daily','Standing posture reset',['ftL','ftR','toeL','toeR'],30,'The same simple outline from the inner side and the outer side.'],
 ['3. Feet on all fours','flow','Cat-cows',['ftL','ftR','knL'],36,'Top of the foot down, in line with the shin, same shape.'],
 ['4. Order holds still','flow','Cross-body knee drives',['hpL','hpR','shL','shR'],60,'Whole limbs are stacked, not single bones, and two parts change places only when the depth difference where they overlap is clear. Scrub slowly: the old render swaps bones and flashes outlines.'],
 ['5. Hips hinge at the hip joints','flow','Bent rotation sweeps',['hpL','hpR','knL'],44,'The trunk ends in a rounded pelvis whose lower outer corners are the hip joints. In the fold nothing pokes past the hips.'],
 ['5. Hips, standing','daily','Reverse lunges',['hpL','hpR','knL','knR'],50,'Both thighs start at the pelvis corners, at the same height.'],
 ['6. A hand edge-on is still a hand','daily','Standing posture reset',['haL','haR'],30,'The hand is built from landmarks with thickness, like the foot. Edge-on it is a slab about two units deep, with the fingers curling a little toward the palm.'],
 ['6. Hands on a row','daily','Dumbbell bent-over row',['haL','haR'],34,'Neutral grip, fist closed over the handle.'],
 ['7. An arm across the chest','flow','Cross-body knee drives',['shL','shR','haL','haR'],50,'The order is decided where the two parts overlap on screen, so an arm in front of the chest is drawn in front of it, with a paper gap along its edge.'],
 ['7. Punching rotations','flow','Punching rotations',['shL','shR','haL','haR','hpL'],60,'Same rule.'],
 ['8. Cat-cows: hands flat, fingers forward','flow','Cat-cows',['haL','haR','elL'],34,'On all fours the fingers point ahead (away from the pelvis along the body) all the way through the movement, palms down, and no part of the hand goes below the ground line. Before, they followed the slant of the forearm and swung round to point at the knees.'],
 ['8. Bird dog hands','daily','Bird dog',['haL','haR'],34,'Same rule.'],
 ['9. 90/90: hips, thighs and hands','flow','90/90 with a fold',['hpL','hpR','knL','knR','haL','haR'],64,'Rounded pelvis, whole-limb order, paper gaps where a limb crosses the trunk or the other leg.'],
];
const HTML=`<h1>Figure rendering and app icon</h1>
<p>Branch <code>design-refresh</code>, not pushed. <b>Before</b> is the branch as you saw it on your phone; <b>after</b> is the rebuilt ink figure. Everything below runs live in this page.</p>
<nav><a href="#icons">Icons</a><a href="#close">Your nine points</a>${APPS.map(a=>`<a href="#app-${a[0]}">${a[1]}</a>`).join('')}<a href="index.html">Older review pages</a></nav>
<section id="icons"><h2>App icon: three options</h2>
<p>Top row: actual home-screen size (60 points) with the iOS corner mask. Below: enlarged, and the maskable version in a circle (how Android crops it).</p>
<div class="home">${ICONS.map(o=>`<div class="ic"><img src="${b64(o.k+'-180.png')}" width="60" height="60" alt="${o.name}"><span>Movement</span></div>`).join('')}</div>
<div class="home dk">${ICONS.map(o=>`<div class="ic"><img src="${b64(o.k+'-180.png')}" width="60" height="60" alt="${o.name}"><span>Movement</span></div>`).join('')}</div>
${ICONS.map((o,i)=>`<div class="card"><h4>${'ABC'[i]}. ${o.name}</h4><div class="big"><img class="sq" src="${b64(o.k+'-512.png')}" width="160" height="160" alt=""><img class="ci" src="${b64(o.k+'-512m.png')}" width="110" height="110" alt=""></div><p class="note">${o.note}</p></div>`).join('')}
<p class="note">Files for each option are in <code>icons/</code>: 180 (apple-touch-icon), 192 and 512 (manifest), 192 and 512 maskable, 1024 master for the native build, and the SVG. None is wired into the pages yet: say which one and I will switch <code>icon-app.png</code> and add the manifest.</p></section>
<section id="live"><h2 id="close">Your nine points, before and after</h2>
<div id="bar"><div id="ctl"><button id="pp">Pause</button><button id="sp">1×</button><button id="dk">Dark</button><input id="scrub" type="range" min="0" max="1000" value="0"><span id="phv"></span></div></div>
<div id="closeups"></div><h2>Every movement, before and after</h2><div id="cards"></div></section>`;
const JS=`${ENG}
const APPS=${JSON.stringify(APPS.map(a=>[a[0],a[1]]))},CLOSE=${JSON.stringify(CLOSE)};
let playing=true,speed=1,clock=0,last=0,scrubPh=null,uid=0;
const views=[],eng={};
const E=(k,w)=>{const id=w+'_'+k;if(!eng[id]){const e=MK[id]();e.MOVES.forEach(m=>{m.fit=e.wk?e.fitOf(m):e.fitOf(m,null,{w:100,h:100});});eng[id]=e;}return eng[id];};
const render=(e,m,ph,id)=>e.wk?(e.ink?e.ink(m,m.fit,ph,null,{id,hatch:false}):e.tone(e.figMarkup(m,m.fit,ph))):e.figMarkup(m,m.fit,ph,null,{id,hatch:true});
function pair(host,title,k,name,box,note){
  const card=document.createElement('div');card.className='card';card.innerHTML='<h4>'+title+'</h4><div class="row"></div>'+(note?'<p class="note">'+note+'</p>':'');
  const row=card.querySelector('.row');
  [['B','before'],['A','after']].forEach(([w,l])=>{const e=E(k,w),m=e.MOVES.find(x=>x.n===name);if(!m)return;
    const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<svg viewBox="'+box+'"></svg><div class="lab">'+l+'</div>';
    row.appendChild(cell);views.push({e,m,svg:cell.querySelector('svg'),cell,vis:false,id:'h'+(uid++)});});
  host.appendChild(card);}
{const host=document.getElementById('closeups');
 CLOSE.forEach(([title,k,name,js,wd,note])=>{const e=E(k,'A'),m=e.MOVES.find(x=>x.n===name);e.figMarkup(m,m.fit,0);
  const j=e.solve(e.poseAt(m,0)),P=js.map(n=>{const q=e.project(j[n]);return [q.x*m.fit.sc+m.fit.ox,q.y*m.fit.sc+m.fit.oy];});
  const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
  const w=Math.max(wd,Math.max(...xs)-Math.min(...xs)+14,Math.max(...ys)-Math.min(...ys)+14);
  pair(host,title+' <small>'+name+'</small>',k,name,(cx-w/2).toFixed(1)+' '+(cy-w/2).toFixed(1)+' '+w.toFixed(1)+' '+w.toFixed(1),note);});}
{const host=document.getElementById('cards');
 APPS.forEach(([k,label])=>{const h=document.createElement('h3');h.textContent=label;h.id='app-'+k;host.appendChild(h);
  E(k,'A').MOVES.forEach((m,i)=>pair(host,(i+1)+'. '+m.n,k,m.n,'0 0 100 100',''));});}
const io=new IntersectionObserver(es=>es.forEach(en=>{const v=views.find(x=>x.cell===en.target);if(v)v.vis=en.isIntersecting;}),{rootMargin:'200px'});
views.forEach(v=>io.observe(v.cell));
const scrub=document.getElementById('scrub'),phv=document.getElementById('phv'),pp=document.getElementById('pp'),sp=document.getElementById('sp');
pp.onclick=()=>{playing=!playing;pp.textContent=playing?'Pause':'Play';if(playing)scrubPh=null;};
sp.onclick=()=>{speed=speed===1?0.5:speed===0.5?0.25:1;sp.textContent=speed+'×';};
document.getElementById('dk').onclick=()=>{document.body.classList.toggle('dark');};
scrub.oninput=()=>{playing=false;pp.textContent='Play';scrubPh=scrub.value/1000;frame(performance.now(),true);};
function frame(now,once){const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;if(playing)clock+=dt*speed;
  views.forEach(v=>{if(!v.vis)return;try{v.svg.innerHTML=render(v.e,v.m,scrubPh!=null?scrubPh:((clock/v.m.cyc)%1),v.id);}catch(err){v.svg.innerHTML='<text x="4" y="12" font-size="5">'+err.message+'</text>';}});
  phv.textContent=scrubPh!=null?'ph '+scrubPh.toFixed(2):'';
  if(!once)requestAnimationFrame(frame);}
requestAnimationFrame(frame);`;
const CSS=`body{margin:0;font:16px/1.5 -apple-system,system-ui,Segoe UI,sans-serif;background:#fbfaf7;color:#1d1c1a;--paper:#f3ead6;--ink:#1b1814;--ochre:#d99a2b;--tk:52%}
body.dark{background:#151513;color:#e9e6df;--paper:#151310;--ink:#efe5cf;--ochre:#e0a53a;--tk:46%}
main{max-width:980px;margin:0 auto;padding:12px 16px 80px}h1{font-size:1.6rem;line-height:1.2}h2{font-size:1.25rem;margin-top:2em;border-top:1px solid #8884;padding-top:1em}h3{font-size:1.1rem;margin:1.4em 0 .3em}h4{font-size:.98rem;margin:0 0 .4em}h4 small{font-weight:400;opacity:.7}
nav{display:flex;gap:14px;flex-wrap:wrap;font-size:.9rem;padding:8px 0}a{color:inherit}code{background:#8882;padding:1px 4px;border-radius:4px;font-size:.88em}
#bar{position:sticky;top:0;z-index:5;background:#fbfaf7ee;padding:8px 0}body.dark #bar{background:#151513ee}
#ctl{display:flex;gap:8px;align-items:center}#ctl button{font:inherit;padding:6px 12px;border-radius:8px;border:1px solid #8886;background:transparent;color:inherit}#scrub{flex:1;min-width:0}#phv{font-size:.8rem;white-space:nowrap}
.card{border:1px solid #8884;border-radius:12px;padding:10px;margin:12px 0}.note{font-size:.88rem;margin:.5em 0 0;opacity:.9}
.row{display:grid;grid-template-columns:1fr 1fr;gap:6px}.cell{border-radius:10px;overflow:hidden;position:relative;background:var(--paper);--fi:var(--ink);--fp:var(--paper);--fo:var(--ochre);--ft:color-mix(in srgb,var(--ink) var(--tk),var(--paper))}
.cell svg{display:block;width:100%;height:auto}.lab{position:absolute;left:8px;top:5px;font-size:.7rem;font-weight:600;opacity:.75;color:var(--ink)}
.home{display:flex;gap:26px;padding:22px 20px 14px;border-radius:18px;background:linear-gradient(160deg,#5b7f9a,#c9a88b);margin:10px 0}.home.dk{background:linear-gradient(160deg,#101418,#2a2320)}
.ic{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11px;color:#fff}.ic img{border-radius:13.4px;display:block}
.big{display:flex;gap:16px;align-items:center}.big .sq{border-radius:36px}.big .ci{border-radius:50%}`;
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'ink.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Figure rendering and icon</title><style>${CSS}</style></head><body><main>${HTML}</main><script>${JS}</script></body></html>`);
console.log('built review/ink.html ('+Math.round(fs.statSync(path.join(OUT,'ink.html')).size/1024)+' KB), before = '+BASE);
