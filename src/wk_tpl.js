// ---------- projection / pose blending (pure — qa/wk.js slices at the DOM marker) ----------
const lerp=(a,b,t)=>a+(b-a)*t;
const lerpA=(a,b,t)=>(a&&b)?a.map((v,i)=>lerp(v,b[i],t)):(a||b||null);
function lerpT(A,B,t){if(!A&&!B)return null; if(A&&A.k)return A;
  if(A&&B&&A.w&&B.w)return {w:lerpA(A.w,B.w,t)}; return A||B;}
function normalise(m){
  if(m._norm) return; m._norm=true;
  const KF=[m.A,m.B,m.M].filter(Boolean);
  if(m.pin){
    const j=solve(m.A);
    if(m.pin.indexOf('L')>=0){const t=j.ftL.slice(); KF.forEach(k=>k.ikFL=t.slice());}
    if(m.pin.indexOf('R')>=0){const t=j.ftR.slice(); KF.forEach(k=>k.ikFR=t.slice());}
  }
  [['ikFL','ftL'],['ikFR','ftR']].forEach(([ikf,joint])=>{
    const n=KF.filter(k=>k[ikf]).length;
    if(n>0&&n<KF.length) KF.forEach(k=>{ if(!k[ikf]) k[ikf]=solve(k)[joint].slice(); });
  });
}
function blend(A,B,t){const o={swL:lerp(A.swL||0,B.swL||0,t),swR:lerp(A.swR||0,B.swR||0,t),
  swAL:lerp(A.swAL||0,B.swAL||0,t),swAR:lerp(A.swAR||0,B.swAR||0,t),sl:lerp(A.sl||0,B.sl||0,t),
  p:lerpA(A.p,B.p,t),yaw:lerp(A.yaw,B.yaw,t),tw:lerp(A.tw,B.tw,t),
  s:lerpA(A.s,B.s,t),hf:lerp(A.hf||0,B.hf||0,t),aL:lerpA(A.aL,B.aL,t),aR:lerpA(A.aR,B.aR,t),
  ikL:lerpT(A.ikL,B.ikL,t),ikR:lerpT(A.ikR,B.ikR,t)};
  if(A.ikFL&&B.ikFL) o.ikFL=lerpA(A.ikFL,B.ikFL,t); else o.lL=lerpA(A.lL,B.lL,t);
  if(A.ikFR&&B.ikFR) o.ikFR=lerpA(A.ikFR,B.ikFR,t); else o.lR=lerpA(A.lR,B.lR,t);
  if(!o.lL) o.lL=A.lL||B.lL||[0,0,0,0];
  if(!o.lR) o.lR=A.lR||B.lR||[0,0,0,0];
  return o;}
const easeQ=t=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function poseAt(m,ph){
  normalise(m);
  const tri=ph<0.5?ph*2:(1-ph)*2;
  if(m.M) return tri<0.5 ? blend(m.A,m.M,easeQ(tri*2)) : blend(m.M,m.B,easeQ((tri-0.5)*2));
  return blend(m.A,m.B,easeQ(tri));}
let CAM=40; const PITCH=13;
function project(v){const c=Math.cos(R(CAM)),s=Math.sin(R(CAM));
  const x=v[0]*c+v[2]*s, z=-v[0]*s+v[2]*c;
  return {x,y:v[1]*Math.cos(R(PITCH))+z*Math.sin(R(PITCH)),d:z};}
const LIMBS=[['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],
             ['hpL','knL'],['knL','ftL'],['hpR','knR'],['knR','ftR']];
const INK='#42591f',LIMB_L='#a8bc85',TORSO='#5c7d34',PROP='#b9a98b';
// A prop point may be a world [x,y,z], a joint name ('haL'), a joint plus a
// body-frame offset ({j:'haR',o:[x,y,z]} — o is rotated by the pose yaw), or the
// midpoint of two joints plus an offset ({m:['haL','haR'],o:[x,y,z]}). Joint-referenced
// points are re-resolved every frame, so an implement authored against the hands can
// never drift out of them.
function resPt(P,j,yaw){
  if(Array.isArray(P))return P;
  if(typeof P==='string')return j[P];
  let b;
  if(P.m){const a=j[P.m[0]],c=j[P.m[1]];b=[(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2];}
  else b=j[P.j];
  const o=P.o?rotY(P.o,yaw||0):[0,0,0];
  return [b[0]+o[0],b[1]+o[1],b[2]+o[2]];
}
// resolved prop geometry for one frame; qa/wk.js asserts implement↔hand attachment on this
function propShapes(m,j,pose){
  if(!m.prop)return [];
  const att=P=>!Array.isArray(P);   // any joint-referenced point = a held/attached implement
  return m.prop.map(p=>{
    if(p.l)return {t:'l',a:resPt(p.l[0],j,pose.yaw),b:resPt(p.l[1],j,pose.yaw),w:p.w||1,att:att(p.l[0])||att(p.l[1])};
    if(p.db)return {t:'db',a:resPt(p.db[0],j,pose.yaw),b:resPt(p.db[1],j,pose.yaw),r:p.db[2],att:att(p.db[0])||att(p.db[1])};
    return {t:'c',c:resPt(p.c[0],j,pose.yaw),r:p.c[1],f:p.f,att:att(p.c[0])};
  });
}
function fitOf(m){CAM=m.cam||40;let a=1e9,b=-1e9,c=1e9,d=-1e9;
  for(let i=0;i<=24;i++){const pose=poseAt(m,i/24),jn=solve(pose);
    const pts=[];
    for(const k in jn)pts.push([jn[k],0]);
    propShapes(m,jn,pose).forEach(s=>{
      if(s.t==='c')pts.push([s.c,s.r]);
      else if(s.t==='db'){pts.push([s.a,s.r]);pts.push([s.b,s.r]);}
      else{pts.push([s.a,0]);pts.push([s.b,0]);}
    });
    for(const [v,r] of pts){const q=project(v);
      a=Math.min(a,q.x-r);b=Math.max(b,q.x+r);c=Math.min(c,q.y-r);d=Math.max(d,q.y+r);}}
  a-=8;b+=8;c-=9;d+=8;
  const sc=Math.min(100/(b-a),100/(d-c));
  return {sc,ox:(100-(b-a)*sc)/2-a*sc,oy:(100-(d-c)*sc)/2-c*sc};}
function figMarkup(m,fit,ph){
  CAM=m.cam||40;
  const pose=poseAt(m,ph);
  const j=solve(pose), P={};
  for(const k in j){const q=project(j[k]);P[k]={x:q.x*fit.sc+fit.ox,y:q.y*fit.sc+fit.oy,d:q.d};}
  const S=v=>{const q=project(v);return {x:q.x*fit.sc+fit.ox,y:q.y*fit.sc+fit.oy};};
  const pw=(1.6*fit.sc).toFixed(2);
  // world-fixed props (bench, cable column, floor lines) paint first, behind everything;
  // held (joint-attached) implements join the painter's sort below, floored just in
  // front of the torso quad — an implement in the hand can never vanish behind the body
  const shapes=propShapes(m,j,pose);
  const mkProp=s=>{
    if(s.t==='l'){const a=S(s.a),b=S(s.b);
      return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${PROP}" stroke-width="${(1.6*s.w*fit.sc).toFixed(2)}" stroke-linecap="round"/>`;}
    if(s.t==='db'){const a=S(s.a),b=S(s.b),r=(s.r*fit.sc).toFixed(1);
      return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${PROP}" stroke-width="${pw}" stroke-linecap="round"/>`
        +`<circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="${r}" fill="${PROP}"/>`
        +`<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${r}" fill="${PROP}"/>`;}
    const c=S(s.c);
    return `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${(s.r*fit.sc).toFixed(1)}" fill="${s.f?PROP:'none'}" stroke="${PROP}" stroke-width="${pw}"/>`;
  };
  const propMk=shapes.filter(s=>!s.att).map(mkProp).join('');
  const side=n=>n.endsWith('L')?LIMB_L:INK;
  const parts=LIMBS.map(([x,y])=>({t:'l',a:P[x],b:P[y],d:(P[x].d+P[y].d)/2,col:side(y),w:1}));
  parts.push({t:'l',a:P.ftL,b:P.toeL,d:(P.ftL.d+P.toeL.d)/2,col:LIMB_L,w:0.8});
  parts.push({t:'l',a:P.ftR,b:P.toeR,d:(P.ftR.d+P.toeR.d)/2,col:INK,w:0.8});
  parts.push({t:'q',pts:[P.shL,P.shR,P.hpR,P.hpL],d:(P.shL.d+P.shR.d+P.hpL.d+P.hpR.d)/4});
  {
    const dx=P.head.x-P.neck.x, dy=P.head.y-P.neck.y, dl=Math.hypot(dx,dy)||1;
    const r=L.hr*fit.sc*0.8;
    parts.push({t:'l',a:P.neck,b:{x:P.head.x-dx/dl*r,y:P.head.y-dy/dl*r},d:(P.neck.d+P.head.d)/2,col:INK,w:0.82});
  }
  parts.push({t:'h',c:P.head,d:P.head.d+0.02});
  // held props: keep their own depth when already nearer, else floor to just in
  // front of the torso quad — nearer limbs still paint over them
  const qd=(P.shL.d+P.shR.d+P.hpL.d+P.hpR.d)/4;
  shapes.filter(s=>s.att).forEach(s=>{
    const own=s.t==='c'?project(s.c).d:Math.max(project(s.a).d,project(s.b).d);
    parts.push({t:'p',mk:mkProp(s),d:Math.max(own,qd+0.06)});
  });
  parts.sort((x,y)=>x.d-y.d);
  return propMk+parts.map(p=>{
    if(p.t==='p')return p.mk;
    if(p.t==='l')return `<line x1="${p.a.x.toFixed(2)}" y1="${p.a.y.toFixed(2)}" x2="${p.b.x.toFixed(2)}" y2="${p.b.y.toFixed(2)}" stroke="${p.col}" stroke-width="${(3.0*(p.w||1)*fit.sc).toFixed(2)}" stroke-linecap="round"/>`;
    if(p.t==='q')return `<polygon points="${p.pts.map(q=>q.x.toFixed(2)+','+q.y.toFixed(2)).join(' ')}" fill="${TORSO}" stroke="${TORSO}" stroke-width="${(2.6*fit.sc).toFixed(2)}" stroke-linejoin="round"/>`;
    return `<circle cx="${p.c.x.toFixed(2)}" cy="${p.c.y.toFixed(2)}" r="${(L.hr*fit.sc).toFixed(2)}" fill="${INK}"/>`;}).join('');
}
function groundOf(m,fit){
  CAM=m.cam||40;
  const j=solve(poseAt(m,0));
  const pts=['ftL','ftR','toeL','toeR','haL','haR','knL','knR'].map(k=>j[k]).filter(p=>p[1]>89.5);
  let gx=0,gz=0;
  if(pts.length){pts.forEach(p=>{gx+=p[0];gz+=p[2];});gx/=pts.length;gz/=pts.length;}
  const g=project([gx,93,gz]);
  return {cx:g.x*fit.sc+fit.ox,cy:g.y*fit.sc+fit.oy,ry:40*Math.sin(R(PITCH))};
}
// set-check freshness (pure; qa/wk.js unit-tests it). Checks live for one LOCAL
// calendar day, and a fully-checked workout clears on its next load — done means the
// next visit is a new session. Partial same-day checks persist across phone lock /
// app switches. Unstamped (legacy) or malformed data starts fresh.
function dayKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function freshChecks(st,day,sets){
  const out={A:{},B:{},day};
  if(!st||typeof st!=='object'||st.day!==day)return out;
  ['A','B'].forEach(id=>{
    const w=st[id]; if(!w||typeof w!=='object')return;
    const done=sets[id].length>0&&sets[id].every((n,i)=>{const a=w[i];
      if(!Array.isArray(a))return false;
      for(let s=0;s<n;s++)if(!a[s])return false; return true;});
    if(!done)out[id]=w;
  });
  return out;
}
// ---- DOM ----
const $=id=>document.getElementById(id);
const WORKOUTS=[{id:'A',moves:WK_A},{id:'B',moves:WK_B}];
WORKOUTS.forEach(w=>w.moves.forEach(m=>{m.fit=fitOf(m);}));
const store={
  get(k,d){try{if(typeof localStorage==='undefined')return d;const v=localStorage.getItem(k);
    return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{if(typeof localStorage!=='undefined')localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
};
let tab=store.get('wkTab','A'); if(tab!=='A'&&tab!=='B')tab='A';
const SETS={A:WK_A.map(m=>m.sets),B:WK_B.map(m=>m.sets)};
let checks=freshChecks(store.get('wkChk',null),dayKey(new Date()),SETS);
const saveChecks=()=>{checks.day=dayKey(new Date());store.set('wkChk',checks);};
saveChecks();
const setsTxt=m=>m.sets+' × '+m.reps+(m.each?' <span class="each">each side</span>':'');
WORKOUTS.forEach(w=>{
  $('list'+w.id).innerHTML=w.moves.map((m,i)=>
    `<div class="mcard" id="card-${w.id}-${i}">`
    +`<div class="mhead"><div class="mname"><span class="mnum">${i+1}</span>${m.n}</div>`
    +`<div class="mreps">${setsTxt(m)}</div></div>`
    +`<div class="mrow"><div class="mfig"><svg viewBox="0 0 100 100">`
    +`<ellipse id="sh-${w.id}-${i}" fill="#dde3c8" opacity="0.55"/><g id="ly-${w.id}-${i}"></g>`
    +`</svg></div><div class="mhow">${m.how}</div></div>`
    +`<ul class="mcues">${m.cues.map(c=>`<li>${c}</li>`).join('')}</ul>`
    +`<div class="msets" id="sets-${w.id}-${i}">${Array.from({length:m.sets},(_,s)=>
        `<button class="setbox" id="ck-${w.id}-${i}-${s}">${s+1}</button>`).join('')}`
    +`<span class="setlbl">sets done</span></div></div>`).join('')
  +`<button class="wreset" id="reset-${w.id}">Reset set checks</button>`;
});
function paintChecks(){
  WORKOUTS.forEach(w=>w.moves.forEach((m,i)=>{
    for(let s=0;s<m.sets;s++){
      const on=!!(checks[w.id][i]&&checks[w.id][i][s]);
      $('ck-'+w.id+'-'+i+'-'+s).classList.toggle('on',on);
    }}));
}
WORKOUTS.forEach(w=>{
  w.moves.forEach((m,i)=>{
    const g=groundOf(m,m.fit), sh=$('sh-'+w.id+'-'+i);
    sh.setAttribute('cx',g.cx.toFixed(2));
    sh.setAttribute('cy',g.cy.toFixed(2));
    sh.setAttribute('rx','40');
    sh.setAttribute('ry',g.ry.toFixed(2));
    for(let s=0;s<m.sets;s++){
      $('ck-'+w.id+'-'+i+'-'+s).onclick=()=>{
        const arr=checks[w.id][i]||(checks[w.id][i]=[]);
        arr[s]=!arr[s]; saveChecks(); paintChecks();
      };
    }
  });
  $('reset-'+w.id).onclick=()=>{checks[w.id]={};saveChecks();paintChecks();};
});
paintChecks();
function setTab(t){
  tab=t; store.set('wkTab',t);
  $('listA').style.display=t==='A'?'':'none';
  $('listB').style.display=t==='B'?'':'none';
  $('tabA').classList.toggle('on',t==='A');
  $('tabB').classList.toggle('on',t==='B');
}
$('tabA').onclick=()=>setTab('A');
$('tabB').onclick=()=>setTab('B');
setTab(tab);
// only figures near the viewport animate; without IntersectionObserver (QA fake DOM),
// every card of the active tab animates
let obs=null; const vis={};
if(typeof IntersectionObserver!=='undefined'){
  obs=new IntersectionObserver(es=>es.forEach(e=>{vis[e.target.id]=e.isIntersecting;}),{rootMargin:'90px'});
  WORKOUTS.forEach(w=>w.moves.forEach((m,i)=>{
    const c=$('card-'+w.id+'-'+i); if(c)obs.observe(c);
  }));
}
// paint every card once so nothing is blank before it first scrolls into view
WORKOUTS.forEach(w=>w.moves.forEach((m,i)=>{
  $('ly-'+w.id+'-'+i).innerHTML=figMarkup(m,m.fit,0.33);
}));
let t0=performance.now(),last=0;
(function loop(now){
  if(now-last>30){last=now;
    WORKOUTS.forEach(w=>{
      if(w.id!==tab)return;
      w.moves.forEach((m,i)=>{
        if(obs&&!vis['card-'+w.id+'-'+i])return;
        const ph=((now-t0)/1000%m.cyc)/m.cyc;
        $('ly-'+w.id+'-'+i).innerHTML=figMarkup(m,m.fit,ph);
      });
    });
  }
  requestAnimationFrame(loop);
})(performance.now());
// auto-update: same launch/foreground freshness swap as the timer apps
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
  window.addEventListener('pageshow',freshCheck);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')freshCheck();});
}
