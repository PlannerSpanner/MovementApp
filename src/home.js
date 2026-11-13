// ---- launcher (index.html). Runs after d_daily.js + eng2.js + the pure slice of app_tpl.js,
// so the idle figure is the real engine. Pure helpers first (qa/home.js evals everything above
// the DOM marker); DOM wiring after it. ----
const TAO=/*TAO*/[];
const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
// one line a day, the same all day, cycling through the list (LOCAL calendar day)
const taoFor=(d,list)=>list.length?list[Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)%list.length]:null;
const doneOn=(G,k)=>!!(G&&Array.isArray(G[k])&&G[k].length);
// Monday-first week containing `now`: [{key,date,letter,done,today}]
function weekOf(G,now){const dow=(now.getDay()+6)%7,out=[];
  for(let i=0;i<7;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-dow+i),k=dayKey(d);
    out.push({key:k,date:d.getDate(),letter:'MTWTFSS'[i],done:doneOn(G,k),today:i===dow});}
  return out;}
// a month as a Monday-first grid: `lead` blank cells, then one cell per day
function monthOf(G,y,mo,now){const n=new Date(y,mo+1,0).getDate(),lead=(new Date(y,mo,1).getDay()+6)%7,tk=dayKey(now),days=[];
  for(let i=1;i<=n;i++){const k=dayKey(new Date(y,mo,i));days.push({key:k,date:i,done:doneOn(G,k),today:k===tk});}
  return {lead,days,name:['January','February','March','April','May','June','July','August','September','October','November','December'][mo]+' '+y};}
// which session to offer first: the first of the two daily timers not yet finished today
const nextUp=(G,now)=>{const a=(G&&G[dayKey(now)])||[];return ['morning-flow','daily-13'].find(id=>a.indexOf(id)<0)||null;};
// ---- DOM ----
const $=id=>document.getElementById(id);
const logRead=()=>{try{const o=JSON.parse(localStorage.getItem('mvLog')||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}};
const dayCell=c=>'<div class="day'+(c.done?' done':'')+(c.today?' today':'')+'">'+(c.done||!c.letter?c.date:c.letter)+'</div>';
function render(){const now=new Date(),G=logRead(),h=now.getHours();
  $('datebar').textContent=(h<12?'Good morning':h<17?'Good afternoon':'Good evening')+' · '+now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
  const t=taoFor(now,TAO);if(t){$('tao').textContent='“'+t[0]+'”';$('taosrc').textContent='Tao Te Ching '+t[1]+' · Legge, 1891';}
  $('week').innerHTML=weekOf(G,now).map(dayCell).join('');
  const up=nextUp(G,now),today=G[dayKey(now)]||[];
  ['morning-flow','daily-13','strength','hip-activation'].forEach(id=>{const b=$('go-'+id);if(!b)return;b.classList.toggle('go',id===up);b.classList.toggle('did',today.indexOf(id)>=0);});
  let mh='';for(let i=0;i<3;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1),M=monthOf(G,d.getFullYear(),d.getMonth(),now);
    if(i&&!M.days.some(c=>c.done))continue;
    mh+='<div class="caps tiny mute">'+M.name+'</div><div class="grid">'+'MTWTFSS'.split('').map(c=>'<div class="hd">'+c+'</div>').join('')
      +'<div></div>'.repeat(M.lead)+M.days.map(dayCell).join('')+'</div>';}
  $('months').innerHTML=mh;}
render();
$('openSheet').onclick=()=>{$('app').classList.add('show-sheet');window.scrollTo(0,0);};
$('closeSheet').onclick=()=>$('app').classList.remove('show-sheet');
// the idle figure: the standing breath loop, in ink, fitted to the shape of its stage
const IDLE=MOVES.find(m=>m.n==='Standing posture reset')||MOVES[0];
const FIGST={id:'hx',hatch:true};let BOX={w:100,h:100},fit=null;
function measure(){try{const s=$('stage'),w=s.clientWidth,h=s.clientHeight;if(!(w>0&&h>0))return;
  const H=Math.max(30,Math.min(240,Math.round(100*h/w)));BOX={w:100,h:H};$('fig').setAttribute('viewBox','0 0 100 '+H);
  FIGST.hatch=w/100>=2.3;fit=fitOf(IDLE,null,BOX);
  setCam(IDLE);const j=solve(poseAt(IDLE,0)),g=project([(j.ftL[0]+j.ftR[0])/2,93,(j.ftL[2]+j.ftR[2])/2]),sh=$('shadow');
  const gx=g.x*fit.sc+fit.ox,gy=(g.y*fit.sc+fit.oy+1.7*fit.sc).toFixed(2),gw=Math.min(46,30*fit.sc);
  sh.setAttribute('x1',(gx-gw).toFixed(2));sh.setAttribute('x2',(gx+gw).toFixed(2));sh.setAttribute('y1',gy);sh.setAttribute('y2',gy);}catch(e){}}
measure();if(!fit)fit=fitOf(IDLE,null,BOX);
if(window.addEventListener)window.addEventListener('resize',measure);
let t0=performance.now(),last=0;
(function loop(now){if(now-last>40){last=now;try{$('layer').innerHTML=figMarkup(IDLE,fit,((now-t0)/1000%IDLE.cyc)/IDLE.cyc,null,FIGST);}catch(e){}}
  requestAnimationFrame(loop);})(performance.now());
// auto-update: same launch/foreground freshness swap as the timer apps; also re-read the log
async function freshCheck(){try{
  if(typeof BUILDV==='undefined')return;
  const r=await fetch(location.href,{cache:'no-store'});
  const m=(await r.text()).match(/BUILDV='([0-9a-f]+)'/);
  if(!m||m[1]===BUILDV)return;
  const n=Date.now(),l=+(sessionStorage.getItem('bvr')||0);
  if(n-l<15000)return;
  sessionStorage.setItem('bvr',String(n));
  try{await fetch(location.href,{cache:'reload'});}catch(e){}
  location.reload();
}catch(e){}}
if(window.addEventListener){
  window.addEventListener('pageshow',()=>{render();freshCheck();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){render();freshCheck();}});
}
