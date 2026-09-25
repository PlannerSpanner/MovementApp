// ---------- projection / drawing ----------
const lerp=(a,b,t)=>a+(b-a)*t;
const lerpA=(a,b,t)=>(a&&b)?a.map((v,i)=>lerp(v,b[i],t)):(a||b||null);
function lerpT(A,B,t){if(!A&&!B)return null; if(A&&A.k)return A;
  if(A&&B&&A.w&&B.w)return {w:lerpA(A.w,B.w,t)}; return A||B;}
// A leg may be described by joint angles (lL/lR) or by a world foot target (ikFL/ikFR).
// If the two keyframes disagree, convert the angle-based one to a foot target so the
// pair can be interpolated in the same space.
function normalise(m){
  if(m._norm) return; m._norm=true;
  const KF=[m.A,m.B,m.M].filter(Boolean);
  // a foot listed in m.pin is nailed to wherever it starts, in every keyframe
  if(m.pin){
    const j=solve(m.A);
    if(m.pin.indexOf('L')>=0){const t=j.ftL.slice(); KF.forEach(k=>k.ikFL=t.slice());}
    if(m.pin.indexOf('R')>=0){const t=j.ftR.slice(); KF.forEach(k=>k.ikFR=t.slice());}
  }
  // if keyframes mix leg representations, convert the odd ones out to foot targets
  [['ikFL','ftL'],['ikFR','ftR']].forEach(([ikf,joint])=>{
    const n=KF.filter(k=>k[ikf]).length;
    if(n>0&&n<KF.length) KF.forEach(k=>{ if(!k[ikf]) k[ikf]=solve(k)[joint].slice(); });
  });
  [['lL','ikFL','ftL'],['lR','ikFR','ftR']].forEach(([ang,ikf,joint])=>{
    const a=m.A[ikf], b=m.B[ikf];
    if(!!a===!!b) return;
    [m.A,m.B].forEach(p=>{ if(!p[ikf]) p[ikf]=solve(p)[joint].slice(); });
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
  if(m.orb) return orbitPose(m.A,m.orb,ph*2*Math.PI);
  const tri=ph<0.5?ph*2:(1-ph)*2;
  if(m.M) return tri<0.5 ? blend(m.A,m.M,easeQ(tri*2)) : blend(m.M,m.B,easeQ((tri-0.5)*2));
  return blend(m.A,m.B,easeQ(tri));}
let CAM=40; const PITCH=13;
function project(v){const c=Math.cos(R(CAM)),s=Math.sin(R(CAM));
  const x=v[0]*c+v[2]*s, z=-v[0]*s+v[2]*c;
  return {x,y:v[1]*Math.cos(R(PITCH))+z*Math.sin(R(PITCH)),d:z};}
const LIMBS=[['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],
             ['hpL','knL'],['knL','ftL'],['hpR','knR'],['knR','ftR']];
const INK='#6d4f1c',LIMB_L='#c2a473',TORSO='#7d5a1e',BELLY='#7d5a1e',PROP='#b9a98b';
// A prop point may be a world [x,y,z], a joint name ('haL'), a joint plus a
// body-frame offset ({j:'haR',o:[x,y,z]} — o is rotated by the pose yaw), or the
// midpoint of two joints plus an offset ({m:['haL','haR'],o:[x,y,z]}). Joint-referenced
// points are re-resolved every frame, so an implement authored against the hands can
// never drift out of them. Shapes: {l:[P,P]} line, {c:[P,r]} circle (+f:1 filled),
// {db:[P,P,r]} dumbbell (handle line + filled end plates).
function resPt(P,j,yaw){
  if(Array.isArray(P))return P;
  if(typeof P==='string')return j[P];
  let b;
  if(P.m){const a=j[P.m[0]],c=j[P.m[1]];b=[(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2];}
  else b=j[P.j];
  const o=P.o?rotY(P.o,yaw||0):[0,0,0];
  return [b[0]+o[0],b[1]+o[1],b[2]+o[2]];
}
function propShapes(m,j,pose){
  if(!m.prop)return [];
  const att=P=>!Array.isArray(P);   // any joint-referenced point = a held/attached implement
  return m.prop.map(p=>{
    if(p.l)return {t:'l',a:resPt(p.l[0],j,pose.yaw),b:resPt(p.l[1],j,pose.yaw),w:p.w||1,att:att(p.l[0])||att(p.l[1])};
    if(p.db)return {t:'db',a:resPt(p.db[0],j,pose.yaw),b:resPt(p.db[1],j,pose.yaw),r:p.db[2],att:att(p.db[0])||att(p.db[1])};
    return {t:'c',c:resPt(p.c[0],j,pose.yaw),r:p.c[1],f:p.f,att:att(p.c[0])};
  });
}
// PROPFIT: include prop extent in the camera fit — needed when implements/furniture
// define the frame (dumbbells, a bench, a wall). Off for the legacy apps so their
// framing never shifts.
const PROPFIT=false;
function fitOf(m){CAM=m.cam||40;let a=1e9,b=-1e9,c=1e9,d=-1e9;
  for(let i=0;i<=24;i++){const pose=poseAt(m,i/24),jn=solve(pose);
    const pts=[];
    for(const k in jn)pts.push([jn[k],0]);
    if(PROPFIT)propShapes(m,jn,pose).forEach(s=>{
      if(s.t==='c')pts.push([s.c,s.r]);
      else if(s.t==='db'){pts.push([s.a,s.r]);pts.push([s.b,s.r]);}
      else{pts.push([s.a,0]);pts.push([s.b,0]);}
    });
    for(const [v,r] of pts){const q=project(v);
      a=Math.min(a,q.x-r);b=Math.max(b,q.x+r);c=Math.min(c,q.y-r);d=Math.max(d,q.y+r);}}
  a-=8;b+=8;c-=9;d+=8;
  const sc=Math.min(100/(b-a),100/(d-c));
  return {sc,ox:(100-(b-a)*sc)/2-a*sc,oy:(100-(d-c)*sc)/2-c*sc};}
// Pure renderer (no DOM) so QA can assert on the real paint order. World-fixed props
// (bench, wall, floor lines) paint first, behind everything — legacy behavior. A held
// (joint-attached) implement instead joins the painter's sort with its own depth,
// floored just in front of the torso quad: it sits in a hand on the near side of the
// body, so it may never vanish behind the torso (qa/daily.js hard invariant).
function figMarkup(m,fit,ph){
  CAM=m.cam||40;
  const pose=poseAt(m,ph);
  const j=solve(pose), P={};
  for(const k in j){const q=project(j[k]);P[k]={x:q.x*fit.sc+fit.ox,y:q.y*fit.sc+fit.oy,d:q.d};}
  // props rebuild every frame: joint-referenced points track the moving figure
  const S=v=>{const q=project(v);return {x:q.x*fit.sc+fit.ox,y:q.y*fit.sc+fit.oy};};
  const pw=(1.6*fit.sc).toFixed(2);
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
  if(m.belly){
    const u=nrm(sub(j.chest,j.pelvis));
    const lat=rotY([1,0,0],pose.yaw);
    const f=nrm(cross(u,lat));                       // trunk's true front, follows pitch
    const mid=[(j.chest[0]*0.45+j.pelvis[0]*0.55),(j.chest[1]*0.45+j.pelvis[1]*0.55),(j.chest[2]*0.45+j.pelvis[2]*0.55)];
    const cq=project(mid), fq=project(add(mid,f,4));
    const cs={x:cq.x*fit.sc+fit.ox,y:cq.y*fit.sc+fit.oy};
    let fx=fq.x*fit.sc+fit.ox-cs.x, fy=fq.y*fit.sc+fit.oy-cs.y;
    const flen=Math.hypot(fx,fy), q=flen/(4*fit.sc);
    const bd=project(add(mid,f,4.8)).d;
    // facing the viewer -> full circle; in profile -> half-disc with its flat edge on the trunk;
    // in between, the back half flattens smoothly so the shape never pops
    const k=Math.max(0,Math.min(1,(0.82-q)/0.32));
    if(flen<0.5){fx=0;fy=1;}else{fx/=flen;fy/=flen;}
    const px=-fy, py=fx, r=7.9*fit.sc;
    const pts=[];
    for(let a=-90;a<=90;a+=15){const ca=Math.cos(a*Math.PI/180),sa=Math.sin(a*Math.PI/180);
      pts.push((cs.x+r*(sa*px+ca*fx)).toFixed(2)+','+(cs.y+r*(sa*py+ca*fy)).toFixed(2));}
    for(let a=105;a<255;a+=15){const ca=Math.cos(a*Math.PI/180)*k,sa=Math.sin(a*Math.PI/180);
      pts.push((cs.x+r*(sa*px+ca*fx)).toFixed(2)+','+(cs.y+r*(sa*py+ca*fy)).toFixed(2));}
    parts.push({t:'bp',pts,d:bd});
  }
  // neck line ends at the head circle's rim, so it can never lie across the face
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
    if(p.t==='bp')return `<polygon points="${p.pts.join(' ')}" fill="${BELLY}"/>`;
    if(p.t==='bc')return `<circle cx="${p.c.x.toFixed(2)}" cy="${p.c.y.toFixed(2)}" r="${p.r.toFixed(2)}" fill="${BELLY}"/>`;
    return `<circle cx="${p.c.x.toFixed(2)}" cy="${p.c.y.toFixed(2)}" r="${(L.hr*fit.sc).toFixed(2)}" fill="${INK}"/>`;}).join('');
}
const layer=document.getElementById('layer'), shadowEl=document.getElementById('shadow');
function drawFig(m,fit,ph){layer.innerHTML=figMarkup(m,fit,ph);}
// the floor is a fixed plane: its ellipse is placed once per movement and never moves
let mirrorOn=false;
function applyMirror(on){
  mirrorOn=on;
  if(on) layer.setAttribute('transform','translate(100 0) scale(-1 1)');
  else layer.removeAttribute('transform');
  shadowEl.setAttribute('cx',(on?100-groundCx:groundCx).toFixed(2));
}
let groundCx=50;
function placeGround(m,fit){
  CAM=m.cam||40;
  const j=solve(poseAt(m,0));
  const pts=['ftL','ftR','toeL','toeR','haL','haR','knL','knR'].map(k=>j[k]).filter(p=>p[1]>89.5);
  let gx=0,gz=0;
  if(pts.length){pts.forEach(p=>{gx+=p[0];gz+=p[2];});gx/=pts.length;gz/=pts.length;}
  const g=project([gx,93,gz]);
  groundCx=g.x*fit.sc+fit.ox;
  shadowEl.setAttribute('cx',groundCx.toFixed(2));
  shadowEl.setAttribute('cy',(g.y*fit.sc+fit.oy).toFixed(2));
  shadowEl.setAttribute('rx','40');
  shadowEl.setAttribute('ry',(40*Math.sin(R(PITCH))).toFixed(2));
}
MOVES.forEach(m=>m.fit=fitOf(m));

// ---------- timer ----------
const $=id=>document.getElementById(id);
let idx=0,timeLeft=0,running=false,started=false,tick=null,voiceOn=true,actx=null,wl=null,swAt=false;
// ---------- segments: movements plus derived setup gaps ----------
// A gap is inserted wherever consecutive movements' pos tags differ. For a gap
// segment, m is the UPCOMING movement (so the figure previews it). Gaps are never
// bilateral, never multiplied by the 2x toggle, and invisible to dots/counts/nav.
const POS_CUE={standing:'Stand up.',prone:'Lie face down.',supine:'Lie on your back.',
  seated:'Sit on the floor.',quadruped:'Come to hands and knees.',downdog:'Push back into down dog.',
  sidelying:'Lie on your side.',kneeling:'Come to kneeling.',chair:'Sit on your chair.',
  ball:'Sit on your ball.',wall:'Stand at the wall.',doorway:'Stand in the doorway.'};
const TRANS_DUR=8;
// TR_ALL (build-time, Daily 10): a gap precedes EVERY movement, sized per movement
// (m.tdur, default 10 — 15 where the setup change is bigger), voiced from the authored
// m.setup script, and the figure holds the upcoming A keyframe instead of looping.
const TR_ALL=false;
const SEGS=[];
MOVES.forEach((m,i)=>{
  if(TR_ALL){if(i>0)SEGS.push({trans:true,m,mi:i,dur:m.tdur||10});}
  else if(i>0&&m.pos&&MOVES[i-1].pos&&m.pos!==MOVES[i-1].pos)SEGS.push({trans:true,m,mi:i,dur:TRANS_DUR});
  SEGS.push({m,mi:i,dur:m.dur});
});
const sdur=s=>s.trans?s.dur:s.dur*dm;
const segOfMove=mi=>SEGS.findIndex(s=>!s.trans&&s.mi===mi);
const posCue=m=>m.setup||m.posCue||POS_CUE[m.pos]||'Get into position.';
// optional session-length toggle (enabled per app at build time): dm multiplies every
// movement duration. Locked once the session has started; Reset unlocks it.
const X2OPT=false;
let dm=1;
if(X2OPT){
  const mvT=MOVES.reduce((a,m)=>a+m.dur,0), trT=SEGS.reduce((a,s)=>a+(s.trans?s.dur:0),0);
  $('mNum').insertAdjacentHTML('beforebegin',
    '<style>.x2row{display:flex;gap:7px;justify-content:center;margin:0 0 11px}'
    +'.x2b{font-family:inherit;cursor:pointer;font-size:0.66rem;letter-spacing:0.5px;'
    +'padding:4px 13px;border-radius:20px;border:1px solid rgba(0,0,0,0.16);'
    +'background:transparent;color:inherit;opacity:0.5;transition:opacity 0.15s}'
    +'.x2b.on{opacity:1;font-weight:600;background:rgba(255,255,255,0.6)}</style>'
    +'<div class="x2row"><button class="x2b on" id="x1b"></button><button class="x2b" id="x2b"></button></div>');
  $('x1b').textContent=Math.round((mvT+trT)/60)+' min'; $('x2b').textContent=Math.round((mvT*2+trT)/60)+' min';
  const setM=k=>{if(started)return; dm=k;
    $('x1b').classList.toggle('on',k===1); $('x2b').classList.toggle('on',k===2);
    timeLeft=MOVES[0].dur*dm; clock();};
  $('x1b').onclick=()=>setM(1); $('x2b').onclick=()=>setM(2);
}
// TR_ALL: restyle gap segments — tan countdown/bar + dimmed static figure — so a
// glance tells setup time from work time. Colors are neutral tans no theme swaps touch.
if(TR_ALL)$('mNum').insertAdjacentHTML('beforebegin',
  '<style>.state-trans .num,.state-trans .tm{color:#8a7f6a}'
  +'.state-trans .fill{background:#b9a98b}'
  +'.state-trans #layer{opacity:0.62}</style>');
const dotsEl=$('dots');
MOVES.forEach((_,i)=>{const d=document.createElement('div');d.className='dot';d.id='d'+i;dotsEl.appendChild(d);});

async function lockScreen(){try{if('wakeLock'in navigator){wl=await navigator.wakeLock.request('screen');
  wl.addEventListener('release',()=>{wl=null;});}}catch(e){}}
function unlockScreen(){if(wl){wl.release();wl=null;}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&running){lockScreen();audioKeepAlive(true);sync();}});

function ac(){if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)();
  try{if(actx.addEventListener)actx.addEventListener('statechange',()=>dbg('AudioContext statechange → '+actx.state+' '+dbgAudio()));}catch(e){}
  dbg('AudioContext created '+dbgAudio());}return actx;}
function chime(f,v,d){try{const c=ac();if(c.state==='suspended')c.resume();
  const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,c.currentTime);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(v,c.currentTime+0.05);
  g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);
  o.connect(g);g.connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+d);}catch(e){}}
// breath-tempo tone: gentle sine glide, quieter than the chimes. Rising = inhale,
// falling = exhale, fired from the animation loop so it stays locked to the figure.
function breathTone(f0,f1,d){try{const c=ac();if(c.state==='suspended')c.resume();
  const o=c.createOscillator(),g=c.createGain();o.type='sine';
  o.frequency.setValueAtTime(f0,c.currentTime);
  o.frequency.linearRampToValueAtTime(f1,c.currentTime+d);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(0.055,c.currentTime+d*0.3);
  g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);
  o.connect(g);g.connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+d);}catch(e){}}
const cTrans=()=>{chime(440,.12,1);setTimeout(()=>chime(554.37,.1,.8),150);setTimeout(()=>chime(659.25,.08,.6),300);};
const cSwitch=()=>{chime(659.25,.1,.5);setTimeout(()=>chime(659.25,.1,.5),280);};
const cDone=()=>{chime(440,.12,1.2);setTimeout(()=>chime(554.37,.1,1),200);
  setTimeout(()=>chime(659.25,.1,1),400);setTimeout(()=>chime(880,.08,1.5),600);};
// pick the most natural installed voice: iOS/macOS "Enhanced"/"Premium" voices and
// Edge "Natural" voices beat the robotic default by a mile when present. The list is
// async on most browsers, so re-pick on voiceschanged.
let voicePick=null,voiceWarned=false,lastVoices=null;
const vlog=m=>{try{console.warn('[voice] '+m);}catch(e){} try{dbg('warn: '+m);}catch(e){}};
function pickVoice(){try{
  const vs=speechSynthesis.getVoices(); lastVoices=vs||[]; if(!vs||!vs.length)return;
  const NICE=['ava','zoe','samantha','allison','serena','karen','moira','tessa','nicky'];
  let best=null,bs=0;
  vs.forEach(v=>{
    if(!/^en/i.test(v.lang))return;
    const n=v.name.toLowerCase(); let s=0.1;
    if(n.includes('premium'))s+=8;
    if(n.includes('enhanced'))s+=6;
    if(n.includes('natural'))s+=6;
    if(n.startsWith('google'))s+=5;
    const i=NICE.findIndex(x=>n.includes(x)); if(i>=0)s+=4-i*0.1;
    if(/^en-us/i.test(v.lang))s+=1;
    if(v.localService)s+=0.5;
    if(s>bs){bs=s;best=v;}});
  if(best)voicePick=best;
}catch(e){}}
if(window.speechSynthesis&&speechSynthesis.getVoices){pickVoice();
  if(speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',pickVoice);}
// iOS Safari only lets speak() through when it is rooted SYNCHRONOUSLY in a user
// gesture; every cue below fires from a setTimeout after a chime, which breaks that
// chain and is dropped without any error. So the Start/Resume tap speaks a silent
// utterance itself — the same unlock the AudioContext resume beside it gets. Never
// throws, never touches the timer.
function primeSpeech(){try{
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
    if(!voiceWarned){voiceWarned=true;vlog('speechSynthesis unavailable — cues will be silent, timer unaffected');}return;}
  const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.rate=2;
  u.onerror=e=>vlog('prime utterance error: '+(e&&e.error));
  dbgWire(u,'prime');
  const r=speechSynthesis.speak(u);pickVoice();
  dbg('prime: speak(" ", vol 0) called, returned '+r+', act='+dbgAct()+', speaking='+speechSynthesis.speaking+' pending='+speechSynthesis.pending+' paused='+speechSynthesis.paused+' '+dbgAudio());
}catch(e){vlog('prime threw: '+e.message);}}
// iOS ring/silent switch: a page whose only audio output is Web Audio nodes gets the
// 'ambient' audio session, which the hardware mute switch silences — Web Audio AND Web
// Speech alike, with no error or state change (chimes and voice both dead on the new
// iPhone, 2026-09-24). An active HTMLMediaElement moves the page's session to
// 'playback', which the switch does not gate; iOS 17+ also lets us ask for it directly
// via navigator.audioSession. Both are requested inside the Start/Resume tap and held
// for the life of the session (paused on Pause/Reset, and a few seconds after the
// finish cues). Silent 0.25 s WAV as a data URI — no network. Never blocks the timer.
const SILENT_WAV='data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
let keepAlive=null,keepAliveOn=false;
function audioKeepAlive(on){
  keepAliveOn=!!on;
  try{if(on&&navigator.audioSession)navigator.audioSession.type='playback';}catch(e){vlog('audioSession: '+e.message);}
  try{
    if(!on){if(keepAlive)keepAlive.pause();return;}
    if(!keepAlive){const a=document.createElement('audio');if(!a||typeof a.play!=='function')return;
      // inline data URI first (no network); some WebKit ports reject data: media, so a
      // tiny real file is the second <source> — only fetched if the inline one fails
      [SILENT_WAV,'silent.wav'].forEach(src=>{const s=document.createElement('source');s.src=src;s.type='audio/wav';a.appendChild(s);});
      a.loop=true;a.setAttribute('playsinline','');
      // some WebKit builds pause at end-of-media instead of looping (verified in
      // Playwright WebKit): restart whenever it stops while the session is on. An
      // element already started by a gesture may be replayed without one.
      const kick=()=>{if(!keepAliveOn)return;const q=a.play();if(q&&q.catch)q.catch(()=>{});};
      a.addEventListener('pause',kick);a.addEventListener('ended',kick);
      a.addEventListener('playing',()=>dbg('keepAlive playing src='+(a.currentSrc||'').slice(0,12)+' '+dbgAudio()));
      a.load();keepAlive=a;}
    const p=keepAlive.play();if(p&&p.then)p.then(()=>dbg('keepAlive play() resolved '+dbgAudio()));if(p&&p.catch)p.catch(e=>{if(keepAliveOn&&keepAlive.paused)vlog('keep-alive media play rejected: '+(e&&e.message));});
  }catch(e){vlog('keep-alive media failed: '+e.message);}
}
let sayRef=null;
function say(t){if(!voiceOn){dbg('say skipped (voice off): '+t);return;}try{
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
    if(!voiceWarned){voiceWarned=true;vlog('speechSynthesis unavailable — cue skipped: '+t);}return;}
  pickVoice();   // iOS Safari: voiceschanged often never fires and getVoices() is
                 // empty/compact-only at load — re-pick at speak time, every time
  const u=new SpeechSynthesisUtterance(t);
  // iOS ignores u.voice unless u.lang matches it; keep a live ref too, or WebKit
  // can GC the utterance mid-speech and fall back to the default voice.
  // No match (empty or non-English list): leave u.voice unset = system default voice,
  // and say so once in the console rather than failing silently.
  if(voicePick){u.voice=voicePick;u.lang=voicePick.lang;}
  else if(!voiceWarned){voiceWarned=true;
    const n=speechSynthesis.getVoices?speechSynthesis.getVoices().length:'?';
    vlog('no matching voice ('+n+' listed) — using the system default voice');}
  u.rate=.8;u.pitch=1;u.volume=.8;
  u.onerror=e=>vlog('utterance error '+(e&&e.error)+' on “'+t+'”');
  sayRef=u;u.onend=()=>{if(sayRef===u)sayRef=null;};
  const tag='cue#'+(++dbgN);dbgWire(u,tag);
  speechSynthesis.speak(u);
  dbg(tag+' speak() "'+t+'" voice='+(voicePick?voicePick.name:'default')+' act='+dbgAct()+' speaking='+speechSynthesis.speaking+' pending='+speechSynthesis.pending+' paused='+speechSynthesis.paused+' '+dbgAudio());
}catch(e){vlog('say threw: '+e.message);}}
// ---- on-device diagnostics panel. STRICTLY PASSIVE: it only reads properties and
// listens to events; it never calls speak()/cancel()/resume()/getVoices(), never
// creates an AudioContext and never touches navigator.audioSession — the probe
// buttons do, and only on a tap. Enable with ?debug=1, or 5 quick taps on the
// title (works inside the home-screen build, which has no query string). The log
// is buffered from load either way, so a late enable still shows history. ----
let DEBUG=(()=>{try{return /[?&]debug=1/.test(location.search);}catch(e){return false;}})();
const dbgLog=[],dbgT0=Date.now();let dbgEl=null,dbgBody=null,dbgN=0,dbgPoll=null;
const dbgAct=()=>{try{return navigator.userActivation?String(navigator.userActivation.isActive):'n/a';}catch(e){return '?';}};
// one-line audio snapshot: AudioContext state + hardware hints, page audio session, keep-alive
function dbgAudio(){try{
  const ac=actx?actx.state+' sr='+actx.sampleRate+(actx.baseLatency!=null?' base='+Math.round(actx.baseLatency*1000)+'ms':'')+(actx.outputLatency!=null?' out='+Math.round(actx.outputLatency*1000)+'ms':'')+(actx.destination?' ch='+actx.destination.maxChannelCount:''):'none';
  const se=navigator.audioSession?navigator.audioSession.type+'/'+(navigator.audioSession.state||'?'):'n/a';
  const ka=keepAlive?(keepAlive.paused?'paused':'playing'):'none';
  return 'AC['+ac+'] session['+se+'] keepAlive['+ka+']';}catch(e){return 'audio? '+e.message;}}
function dbg(m){dbgLog.push(((Date.now()-dbgT0)/1000).toFixed(1)+'s '+m);if(dbgLog.length>120)dbgLog.shift();if(DEBUG)dbgRender();}
function dbgStatus(){const L=[];try{
  L.push("'speechSynthesis' in window: "+('speechSynthesis' in window)+"  'SpeechSynthesisUtterance': "+('SpeechSynthesisUtterance' in window)+"  standalone: "+(navigator.standalone===true)+"  visible: "+document.visibilityState);
  const vs=lastVoices||[];
  L.push('voices (last list the app fetched): '+vs.length+(vs.length?'  first: '+vs.slice(0,4).map(v=>v.name+' ('+v.lang+(v.default?', default':'')+(v.localService?', local':'')+')').join(' | '):'')+'  picked: '+(voicePick?voicePick.name:'none (system default)'));
  if(window.speechSynthesis)L.push('speaking: '+speechSynthesis.speaking+'  pending: '+speechSynthesis.pending+'  paused: '+speechSynthesis.paused);
  L.push(dbgAudio());
  L.push('userActivation.isActive: '+dbgAct()+'  voiceOn: '+voiceOn+'  running: '+running+'  seg: '+idx+'  UA: '+navigator.userAgent.replace(/^.*?(iPhone|iPad|CPU) ?/,'').slice(0,60));
}catch(e){L.push('status error: '+e.message);}return L;}
function dbgEnable(how){if(DEBUG&&dbgEl){return;}DEBUG=true;dbg('debug view on ('+how+'); BUILDV '+(typeof BUILDV!=='undefined'?BUILDV:'(unstamped page)'));
  if(!dbgPoll)dbgPoll=setInterval(dbgRender,1000);dbgRender();}
function dbgRender(){if(!DEBUG)return;try{
  if(!dbgEl){if(!document.body)return;dbgEl=document.createElement('div');
    dbgEl.style.cssText='position:fixed;left:0;right:0;bottom:0;max-height:48vh;overflow:auto;z-index:9999;background:rgba(0,0,0,.88);color:#b6f2b6;font:11px/1.35 ui-monospace,Menlo,monospace;padding:6px 8px 12px;white-space:pre-wrap;word-break:break-word;-webkit-user-select:text;user-select:text';
    const bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px';
    const mk=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.style.cssText='font:11px ui-monospace,monospace;padding:4px 7px;border-radius:6px;border:1px solid #6c6;background:#123;color:#dfd';b.onclick=()=>{try{f();}catch(e){dbg('button error: '+e.message);}};bar.appendChild(b);};
    // PROBES — active calls, tap-only
    mk('Speak test',()=>{dbg('PROBE say() act='+dbgAct()+' '+dbgAudio());say('Testing, one two three.');});
    mk('Speak raw default',()=>{const u=new SpeechSynthesisUtterance('Raw default voice test.');dbgWire(u,'raw');dbg('PROBE raw speak() act='+dbgAct()+' '+dbgAudio());speechSynthesis.speak(u);});
    mk('Chime',()=>{dbg('PROBE chime '+dbgAudio());chime(660,.15,.6);});
    mk('cancel()+resume()',()=>{speechSynthesis.cancel();speechSynthesis.resume();dbg('PROBE cancel()+resume(); speaking='+speechSynthesis.speaking+' paused='+speechSynthesis.paused);});
    mk('resume()',()=>{speechSynthesis.resume();dbg('PROBE resume(); paused='+speechSynthesis.paused);});
    mk('List devices',()=>{if(!navigator.mediaDevices||!navigator.mediaDevices.enumerateDevices){dbg('PROBE enumerateDevices: unavailable');return;}
      navigator.mediaDevices.enumerateDevices().then(ds=>dbg('PROBE devices: '+(ds.length?ds.map(d=>d.kind+(d.label?':'+d.label:'')+(d.deviceId==='default'?'(default)':'')).join(', '):'none listed'))).catch(e=>dbg('PROBE enumerateDevices error: '+e.message));});
    mk('Clear',()=>{dbgLog.length=0;dbgRender();});
    dbgEl.appendChild(bar);dbgBody=document.createElement('div');dbgEl.appendChild(dbgBody);document.body.appendChild(dbgEl);
    document.body.style.paddingBottom='50vh';}
  dbgBody.textContent=dbgStatus().join('\n')+'\n— log —\n'+dbgLog.join('\n');
}catch(e){}}
// utterance lifecycle → log, with the audio snapshot at START and END (tag = 'prime' | 'cue#N' | 'raw')
function dbgWire(u,tag){try{
  const t0=Date.now();const el=()=>'+'+((Date.now()-t0)/1000).toFixed(1)+'s';
  u.addEventListener('start',()=>dbg(tag+' START '+el()+' '+dbgAudio()));
  u.addEventListener('end',()=>dbg(tag+' END '+el()+' (elapsed '+(u.elapsedTime|0)+') '+dbgAudio()));
  u.addEventListener('error',e=>dbg(tag+' ERROR '+el()+' code='+(e&&e.error)+' '+dbgAudio()));
  u.addEventListener('pause',()=>dbg(tag+' pause event'));u.addEventListener('resume',()=>dbg(tag+' resume event'));
}catch(e){dbg(tag+' (no utterance events available: '+e.message+')');}}
// passive listeners: session / context / media / visibility / voice-list changes
try{if(navigator.audioSession&&navigator.audioSession.addEventListener)navigator.audioSession.addEventListener('statechange',()=>dbg('audioSession statechange → '+navigator.audioSession.type+'/'+navigator.audioSession.state));}catch(e){}
try{document.addEventListener('visibilitychange',()=>dbg('visibility → '+document.visibilityState+' '+dbgAudio()));}catch(e){}
try{if(window.speechSynthesis&&speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',()=>dbg('voiceschanged → '+(speechSynthesis.getVoices()||[]).length+' voices'));}catch(e){}
// 5 quick taps on the title toggle the panel (for the home-screen build)
try{const h=document.querySelector('h1');let taps=[];if(h&&h.addEventListener)h.addEventListener('click',()=>{const now=Date.now();taps=taps.filter(t=>now-t<3000);taps.push(now);if(taps.length>=5){taps=[];dbgEnable('5 taps');}});}catch(e){}
if(DEBUG)dbgEnable('?debug=1');


function paint(){
  const g=SEGS[idx], m=g.m;
  $('mNum').textContent=g.trans?'GET SET UP':'MOVEMENT '+(g.mi+1)+' OF '+MOVES.length;
  $('mName').textContent=m.n; $('mTarget').textContent=g.trans?posCue(m):m.cue;
  $('cue').innerHTML=m.long;
  $('count').textContent=(g.mi+1)+'/'+MOVES.length;
  $('badge').classList.toggle('visible',!g.trans&&!!m.bil);
  $('badge').textContent=m.orb?'REVERSES · CHANGE DIRECTION AT HALFWAY':'BOTH SIDES · SWITCH AT HALFWAY';
  $('vid').href='https://www.youtube.com/results?search_query='+m.q;
  $('bPrev').disabled=!g.trans&&g.mi<=0; $('bNext').disabled=!g.trans&&g.mi>=MOVES.length-1;
  if(TR_ALL)document.querySelector('.wrap').classList.toggle('state-trans',!!g.trans);
  MOVES.forEach((_,i)=>{$('d'+i).className='dot'+(i<g.mi?' done':i===g.mi?' active':'');});
  clock();
}
function clock(){
  $('tm').textContent=Math.floor(timeLeft/60)+':'+String(timeLeft%60).padStart(2,'0');
  $('fill').style.width=(100*(1-timeLeft/sdur(SEGS[idx]))).toFixed(1)+'%';
}
let segEnd=0,pausedRem=0;
function go(i){
  idx=i; const g=SEGS[idx]; timeLeft=sdur(g); swAt=false;
  segEnd=Date.now()+timeLeft*1000; pausedRem=timeLeft*1000;
  paint(); announce(g);
}
// gap start: soft double chime + the position instruction; movement start keeps the
// full transition chime + name, so nothing is announced twice
function announce(g){
  // authored setup scripts (TR_ALL) speak the full "Next: <name>. <equipment/position>"
  // line; the display shows just the instruction (mName already carries the name)
  if(g.trans){cSwitch();setTimeout(()=>say(TR_ALL&&g.m.setup?'Next: '+g.m.n+'. '+g.m.setup:posCue(g.m)),300);}
  else{cTrans();setTimeout(()=>say(g.m.n+(g.m.bil&&!g.m.orb?'. Start with your right side.':'')),420);}
}
function sync(){
  if(!running)return;
  let rem=Math.ceil((segEnd-Date.now())/1000);
  let jumped=false;
  while(rem<=0){
    if(idx>=SEGS.length-1){finish();return;}
    idx++; segEnd+=sdur(SEGS[idx])*1000; swAt=false; jumped=true;
    rem=Math.ceil((segEnd-Date.now())/1000);
  }
  if(jumped){paint(); announce(SEGS[idx]);}
  if(rem!==timeLeft){
    timeLeft=rem; clock();
    const g=SEGS[idx], m=g.m;
    if(!g.trans&&m.bil&&!swAt&&timeLeft<=Math.floor(m.dur*dm/2)){swAt=true;applyMirror(true);cSwitch();setTimeout(()=>say(m.orb?'Change direction':'Switch sides'),300);}
    // 3s warning: TR_ALL gaps get a distinct 3-2-1 triple tick so the start of work
    // is unambiguous; work segments (and legacy gaps) keep the single soft tick
    if(TR_ALL&&g.trans){if(timeLeft<=3&&timeLeft>=1)chime(520,.07,.18);}
    else if(timeLeft===3)chime(380,.05,.3);
  }
}
function finish(){
  clearInterval(tick);tick=null;running=false;started=false;unlockScreen();
  MOVES.forEach((_,i)=>$('d'+i).className='dot done');
  $('mNum').textContent='COMPLETE';$('mName').textContent='Movement complete';$('mTarget').textContent='';
  $('badge').classList.remove('visible');
  document.querySelector('.wrap').classList.remove('state-trans');
  document.querySelector('.wrap').classList.add('state-done');
  $('cue').innerHTML='<strong>Done.</strong> Hips and ankles mobile, spine articulated, hip rotation opened, core switched on. Nothing loaded the peroneal tendon.';
  $('bMain').style.display='none';$('tm').textContent='\u2713';$('fill').style.width='100%';
  cDone();setTimeout(()=>say('Movement complete.'),600);
  setTimeout(()=>{if(!running)audioKeepAlive(false);},6000);   // after the finish cues
}
$('bMain').onclick=()=>{
  if(!running){
    running=true;$('bMain').textContent='Pause';lockScreen();dbg('START tap act='+dbgAct()+' '+dbgAudio());
    // audio unlock inside the gesture — but no audio API may ever block the timer
    try{ac();if(actx.state==='suspended')actx.resume();}catch(e){vlog('AudioContext unavailable: '+e.message);}
    audioKeepAlive(true);primeSpeech();
    if(!started){started=true;go(0);}
    else{segEnd=Date.now()+pausedRem;}
    tick=setInterval(sync,300);
  } else {
    running=false;pausedRem=Math.max(0,segEnd-Date.now());
    clearInterval(tick);tick=null;unlockScreen();audioKeepAlive(false);$('bMain').textContent='Resume';
  }
};
$('bVoice').onclick=()=>{voiceOn=!voiceOn;$('bVoice').classList.toggle('on',voiceOn);
  if(voiceOn){pickVoice();say('Voice on. Using '+(voicePick?voicePick.name:'the default voice'));}};
$('bPrev').onclick=()=>{const t=SEGS[idx].mi-1;if(t>=0){started=true;go(segOfMove(t));}};
$('bNext').onclick=()=>{const g=SEGS[idx],t=g.trans?g.mi:g.mi+1;if(t<=MOVES.length-1){started=true;go(segOfMove(t));}};
$('bReset').onclick=()=>{
  clearInterval(tick);tick=null;running=false;started=false;unlockScreen();audioKeepAlive(false);
  idx=0;timeLeft=MOVES[0].dur*dm;swAt=false;
  document.querySelector('.wrap').classList.remove('state-done','state-trans');
  $('bMain').style.display='';$('bMain').textContent='Start';
  $('mNum').textContent='READY';$('mName').textContent='Tap Start to begin';$('mTarget').textContent='';
  $('badge').classList.remove('visible');$('fill').style.width='0%';$('tm').textContent='0:00';
  $('count').textContent='\u2013/12';
  $('cue').innerHTML='<strong>Morning Movement</strong> runs 9 minutes: standing mobility, then floor work, then core. Two-sided movements chime at the halfway point. No impact \u2014 safe for the right peroneal tendon.';
  MOVES.forEach((_,i)=>$('d'+i).className='dot');
};

// auto-update: home-screen standalone pages cache hard. On every launch and return to
// foreground, refetch this page from the network and compare build stamps; if a newer
// build is live, refresh the HTTP cache and swap to it — but never during a session.
async function freshCheck(){try{
  if(typeof BUILDV==='undefined'||started||running)return;
  const r=await fetch(location.href,{cache:'no-store'});
  const m=(await r.text()).match(/BUILDV='([0-9a-f]+)'/);
  if(!m||m[1]===BUILDV)return;
  const n=Date.now(),l=+(sessionStorage.getItem('bvr')||0);
  if(n-l<15000)return;                       // one swap attempt per 15s, no reload loops
  sessionStorage.setItem('bvr',String(n));
  try{await fetch(location.href,{cache:'reload'});}catch(e){}
  location.reload();
}catch(e){}}
if(window.addEventListener){
  window.addEventListener('pageshow',freshCheck);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')freshCheck();});
}

// figure animates continuously, whatever the timer is doing
let t0=performance.now(),last=0,curFit=null,brPh=0;
(function loop(now){
  if(now-last>30){last=now;const m=SEGS[idx].m;
    if(curFit!==m.fit){curFit=m.fit;placeGround(m,m.fit);applyMirror(false);}
    // TR_ALL gaps hold the upcoming movement's A keyframe as a static preview
    const ph=(TR_ALL&&SEGS[idx].trans)?0:((now-t0)/1000%m.cyc)/m.cyc;
    // breath-tempo audio on flagged movements: cycle wrap = inhale start (rising),
    // halfway = exhale start (falling). Only while the timer runs and audio exists.
    if(running&&m.br&&!SEGS[idx].trans&&actx){
      if(ph<brPh)breathTone(196,294,m.cyc*0.42);
      else if(brPh<0.5&&ph>=0.5)breathTone(294,196,m.cyc*0.48);
    }
    brPh=ph;
    drawFig(m,m.fit,ph);}
  requestAnimationFrame(loop);
})(performance.now());
timeLeft=MOVES[0].dur;
