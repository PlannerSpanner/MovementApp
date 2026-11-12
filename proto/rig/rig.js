// Prototype rig ("rig v3") for the figure-system assessment. NOT shipped, not wired to any app.
// Plain JS, no dependencies, runs in Node and in the browser (window.Rig).
//
// What it has that eng2.js does not (each item answers a system fault in docs/pose-critique.md):
//  - root with full orientation: yaw, pitch AND roll (true side-lying / side plank)
//  - a four-segment spine (2 lumbar + 2 thoracic) + neck whose flex / side-bend / twist MOVE
//    the joints, so a rounded back lowers the shoulders and a thoracic twist is not a rigid roll
//  - scapulae: each shoulder joint can protract / elevate independently of the ribcage
//  - hands and feet are real segments with authored contact (flat foot, heel lift, flat hand,
//    forearm on the floor, knee on the floor)
//  - every limb is solved by IK each frame from ONE representation: a target that is either
//    anchored in the world (stays planted exactly, by construction) or local to a body frame
//    (travels with the body on an arc: direction is slerped, reach is lerped). Mixed pairs blend.
//    There is no FK/IK split, so nothing "cannot blend".
//  - keyframes are a cyclic list with times; body parameters run through a Catmull-Rom spline
//    (no forced stop at mid keys), anchored contacts hold still exactly
//  - camera has yaw AND pitch, per movement
//  - solve() reports its own faults: unreachable targets, bone stretch at planted knees/elbows,
//    joints under the floor, spine and limb angles outside human range
//
// Conventions: centimetres, y UP, floor y=0, figure faces +z at yaw 0, +x is the figure's LEFT.
// Angles in degrees. Spine triples are [flex(+forward), side(+toward the figure's left), twist(+turn left)].
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.Rig=factory();})(this,function(){
const D=Math.PI/180;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=v=>Math.hypot(v[0],v[1],v[2]), nrm=v=>{const n=len(v)||1;return [v[0]/n,v[1]/n,v[2]/n];};
const lerp=(a,b,t)=>a+(b-a)*t, lerpV=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const mm=(A,B)=>A.map(r=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
const mv=(A,v)=>A.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);
const tr=A=>[0,1,2].map(i=>[A[0][i],A[1][i],A[2][i]]);
const Rx=a=>{const c=Math.cos(a*D),s=Math.sin(a*D);return [[1,0,0],[0,c,-s],[0,s,c]];};
const Ry=a=>{const c=Math.cos(a*D),s=Math.sin(a*D);return [[c,0,s],[0,1,0],[-s,0,c]];};
const Rz=a=>{const c=Math.cos(a*D),s=Math.sin(a*D);return [[c,-s,0],[s,c,0],[0,0,1]];};
const rot3=(f,s,t)=>mm(mm(Ry(t),Rx(f)),Rz(-s));
const hdir=yaw=>[Math.sin(yaw*D),0,Math.cos(yaw*D)];        // horizontal unit vector, 0 = +z, + turns left
// body dimensions (cm), about a 175 cm adult
const DIM={thigh:43,shank:42,ankleH:8,heelBack:5,ball:13,toe:5,hipW:9,lum:10,tho:15,neck:9,headUp:9,headR:9.5,
  shW:18,shDrop:4,upper:29,fore:26,hand:9,kneeR:5.5,elbowR:4,wristH:2.5};
const Z3=[0,0,0];
function body(p){
  const F={},J={};
  const R0=mm(mm(Ry(p.yaw||0),Rx(p.pitch||0)),Rz(-(p.roll||0)));
  const h=a=>rot3(a[0]/2,a[1]/2,a[2]/2), l=p.lumbar||Z3, t=p.thoracic||Z3, n=p.neck||Z3;
  F.pelvis=R0; F.L1=mm(R0,h(l)); F.L2=mm(F.L1,h(l)); F.T1=mm(F.L2,h(t)); F.T2=mm(F.T1,h(t));
  F.neck=mm(F.T2,h(n)); F.head=mm(F.neck,h(n)); F.world=[[1,0,0],[0,1,0],[0,0,1]];
  J.root=p.pos.slice(); J.l2=add(J.root,mv(F.L1,[0,DIM.lum,0])); J.t1=add(J.l2,mv(F.L2,[0,DIM.lum,0]));
  J.t2=add(J.t1,mv(F.T1,[0,DIM.tho,0])); J.c7=add(J.t2,mv(F.T2,[0,DIM.tho,0]));
  J.skull=add(J.c7,mv(F.neck,[0,DIM.neck,0])); J.head=add(J.skull,mv(F.head,[0,DIM.headUp,1.5]));
  const sL=p.scapL||[0,0], sR=p.scapR||[0,0];              // [protract cm, elevate cm]
  J.shL=add(J.c7,mv(F.T2,[DIM.shW-Math.abs(sL[0])*0.25,-DIM.shDrop+sL[1],sL[0]]));
  J.shR=add(J.c7,mv(F.T2,[-DIM.shW+Math.abs(sR[0])*0.25,-DIM.shDrop+sR[1],sR[0]]));
  J.hpL=add(J.root,mv(R0,[DIM.hipW,-1,0])); J.hpR=add(J.root,mv(R0,[-DIM.hipW,-1,0]));
  return {F,J};
}
// ---- limb targets -------------------------------------------------------------------
// arm spec: {at:[x,y,z]} | {floor:[x,z],yaw} | {elbow:[x,z],yaw} (forearm on the floor)   -> anchored
//           {dir:[x,y,z],reach:0..1,frame:'T2'|'pelvis'|'world'}                           -> local
//           optional pole:[x,y,z] + poleFrame (default 'T2'): the way the elbow points
// leg spec: {foot:[x,z],yaw,lift} (ball of the foot on the floor, heel lifted `lift` deg)  -> anchored
//           {knee:[x,z],shin:yaw} (knee on the floor, shank trailing along the floor)      -> anchored
//           {dir,reach,frame:'pelvis'|'world',point}                                       -> local
const anchored=s=>!!(s.at||s.floor||s.elbow||s.foot||s.knee);
const REACH={arm:DIM.upper+DIM.fore,leg:DIM.thigh+DIM.shank};
function ankleOf(s){const d=hdir(s.yaw||0),L=(s.lift||0)*D,a=Math.atan2(DIM.ankleH,DIM.ball)+L,r=Math.hypot(DIM.ball,DIM.ankleH);
  return [s.foot[0]-d[0]*r*Math.cos(a),r*Math.sin(a),s.foot[1]-d[2]*r*Math.cos(a)];}
function targetW(kind,side,s,B){   // world position of the wrist / ankle this spec asks for, in body B
  if(s.at)return s.at.slice();
  if(s.floor)return [s.floor[0],DIM.wristH,s.floor[1]];
  if(s.elbow){const d=hdir(s.yaw||0);return [s.elbow[0]+d[0]*DIM.fore,DIM.wristH,s.elbow[1]+d[2]*DIM.fore];}
  if(s.foot)return ankleOf(s);
  if(s.knee){const d=hdir(s.shin==null?180:s.shin);return [s.knee[0]+d[0]*DIM.shank,4,s.knee[1]+d[2]*DIM.shank];}
  const o=kind==='arm'?B.J['sh'+side]:B.J['hp'+side], F=B.F[s.frame||(kind==='arm'?'T2':'pelvis')];
  return add(o,mul(mv(F,nrm(s.dir)),(s.reach==null?1:s.reach)*REACH[kind]));
}
function poleW(kind,side,s,B){
  if(s.pole)return nrm(mv(B.F[s.poleFrame||(kind==='arm'?'T2':'pelvis')],s.pole));
  return kind==='arm'?nrm(mv(B.F.T2,[side==='L'?0.25:-0.25,-0.5,-1])):nrm(mv(B.F.pelvis,[side==='L'?0.12:-0.12,0,1]));
}
function ik2(S,T,l1,l2,pole){
  let d=sub(T,S),Dn=len(d),miss=0;const mx=l1+l2-0.05,mn=Math.abs(l1-l2)+0.05;
  if(Dn>mx){miss=Dn-mx;Dn=mx;} if(Dn<mn)Dn=mn;
  const u=nrm(d),a=(l1*l1+Dn*Dn-l2*l2)/(2*Dn),hh=Math.sqrt(Math.max(0,l1*l1-a*a));
  let pp=sub(pole,mul(u,dot(pole,u))); if(len(pp)<1e-4)pp=cross(u,[1,0,0]); if(len(pp)<1e-4)pp=cross(u,[0,0,1]); pp=nrm(pp);
  return {mid:add(add(S,mul(u,a)),mul(pp,hh)),end:add(S,mul(u,Dn)),miss};
}
const slerp=(a,b,t)=>{const c=Math.max(-1,Math.min(1,dot(a,b))),th=Math.acos(c);if(th<1e-4)return a.slice();
  const s=Math.sin(th);return add(mul(a,Math.sin((1-t)*th)/s),mul(b,Math.sin(t*th)/s));};
const smooth=t=>t*t*t*(t*(6*t-15)+10);
// ---- a motion: cyclic keyframes -------------------------------------------------------
const SCAL=['pos','yaw','pitch','roll','lumbar','thoracic','neck','scapL','scapR'];
const DEF={yaw:0,pitch:0,roll:0,lumbar:Z3,thoracic:Z3,neck:Z3,scapL:[0,0],scapR:[0,0]};
function prep(m){
  if(m._p)return m._p; const K=m.keys.slice().sort((a,b)=>a.t-b.t);
  K.forEach(k=>{for(const f in DEF)if(k[f]==null)k[f]=DEF[f];k._B=body(k);});
  return m._p=K;
}
function cr(a,b,c,d,t){return 0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
function poseAt(m,ph){
  const K=prep(m),n=K.length; ph=((ph%1)+1)%1;
  let i=n-1; for(let q=0;q<n;q++)if(K[q].t<=ph)i=q; if(ph<K[0].t)i=n-1;
  const k1=K[i],k2=K[(i+1)%n],k0=K[(i+n-1)%n],k3=K[(i+2)%n];
  const span=((k2.t-k1.t)+1)%1||1; let t=(((ph-k1.t)+1)%1)/span;
  if(m.ease==='stop')t=smooth(t);                       // hold-style motions may ask for a stop at each key
  const p={};
  SCAL.forEach(f=>{const g=(k)=>k[f]; p[f]=Array.isArray(k1[f])?k1[f].map((_,j)=>cr(g(k0)[j],g(k1)[j],g(k2)[j],g(k3)[j],t)):cr(g(k0),g(k1),g(k2),g(k3),t);});
  const B=body(p),J=B.J,flags=[];
  for(const [kind,side] of [['arm','L'],['arm','R'],['leg','L'],['leg','R']]){
    const nm=kind+side,s1=k1[nm],s2=k2[nm]; let T,sp=t<0.5?s1:s2;
    const a1=anchored(s1),a2=anchored(s2);
    if(!a1&&!a2&&(s1.frame||0)===(s2.frame||0)){          // both ride a body frame: arc (slerp dir, lerp reach)
      const o=kind==='arm'?J['sh'+side]:J['hp'+side],F=B.F[s1.frame||(kind==='arm'?'T2':'pelvis')];
      const d=slerp(nrm(s1.dir),nrm(s2.dir),t),r=lerp(s1.reach==null?1:s1.reach,s2.reach==null?1:s2.reach,t);
      T=add(o,mul(mv(F,d),r*REACH[kind]));
    }else{const w1=targetW(kind,side,s1,a1?k1._B:B),w2=targetW(kind,side,s2,a2?k2._B:B);
      T=len(sub(w1,w2))<1e-6?w1:lerpV(w1,w2,(a1&&a2)?smooth(t):t);
      if(a1&&a2&&len(sub(w1,w2))>1e-6&&kind==='leg'&&s1.foot&&s2.foot){   // a step: lift the foot through the swing
        T=add(T,[0,(m.stepH==null?6:m.stepH)*Math.sin(Math.PI*smooth(t)),0]);}
    }
    // the floor is solid: a wrist or ankle target may not go below it (solved, not just flagged)
    T=T.slice(); T[1]=Math.max(T[1],kind==='arm'?DIM.wristH:4);
    const pole=nrm(lerpV(poleW(kind,side,s1,B),poleW(kind,side,s2,B),t));
    const o=kind==='arm'?J['sh'+side]:J['hp'+side];
    if(kind==='arm'){
      const same=(f)=>s1[f]&&s2[f]&&len(sub([s1[f][0],0,s1[f][1]],[s2[f][0],0,s2[f][1]]))<1e-6;
      let el,wr;
      if(same('elbow')){el=[s1.elbow[0],DIM.elbowR,s1.elbow[1]];wr=T;const st=len(sub(el,o))-DIM.upper;if(Math.abs(st)>1.5)flags.push(`${nm}: upper arm ${st>0?'stretched':'compressed'} ${Math.abs(st).toFixed(1)} cm to keep the elbow planted`);}
      else{const r=ik2(o,T,DIM.upper,DIM.fore,pole);el=r.mid;wr=r.end;if(r.miss>0.5)flags.push(`${nm}: target ${r.miss.toFixed(1)} cm out of reach`);}
      J['el'+side]=el;J['wr'+side]=wr;
      const flat=(s1.floor||s1.elbow)&&(s2.floor||s2.elbow);
      let hd=nrm(sub(wr,el)); if(flat){hd=hdir(lerp(s1.yaw||0,s2.yaw||0,t));}
      let he=add(wr,mul(hd,DIM.hand)); if(flat)he[1]=1.5;
      if(he[1]<1.5){const hz=nrm([hd[0],0,hd[2]+1e-6]);he=[wr[0]+hz[0]*DIM.hand,1.5,wr[2]+hz[2]*DIM.hand];}   // lay the hand along the floor
      J['ha'+side]=he;
    }else{
      let kn,an,heel,ball,toe;
      const sameK=s1.knee&&s2.knee&&Math.hypot(s1.knee[0]-s2.knee[0],s1.knee[1]-s2.knee[1])<1e-6;
      if(sameK){kn=[s1.knee[0],DIM.kneeR,s1.knee[1]];an=T;const st=len(sub(kn,o))-DIM.thigh;
        if(Math.abs(st)>1.5)flags.push(`${nm}: thigh ${st>0?'stretched':'compressed'} ${Math.abs(st).toFixed(1)} cm to keep the knee planted`);
        const d=nrm([an[0]-kn[0],0,an[2]-kn[2]]);heel=an;ball=[an[0]+d[0]*DIM.ball,2.5,an[2]+d[2]*DIM.ball];toe=[ball[0]+d[0]*DIM.toe,2,ball[2]+d[2]*DIM.toe];
      }else{const r=ik2(o,T,DIM.thigh,DIM.shank,pole);kn=r.mid;an=r.end;if(r.miss>0.5)flags.push(`${nm}: target ${r.miss.toFixed(1)} cm out of reach`);
        let f,dn;
        if(s1.foot&&s2.foot){const yw=lerp(s1.yaw||0,s2.yaw||0,t),L=lerp(s1.lift||0,s2.lift||0,t)*D,d=hdir(yw);
          f=[d[0]*Math.cos(L),-Math.sin(L),d[2]*Math.cos(L)];dn=[-d[0]*Math.sin(L),-Math.cos(L),-d[2]*Math.sin(L)];}
        else{const s=nrm(sub(an,kn));let pf=sub(pole,mul(s,dot(pole,s)));pf=len(pf)<1e-4?[0,0,1]:nrm(pf);
          const pt=lerp(s1.point||0,s2.point||0,t)*D;f=add(mul(pf,Math.cos(pt)),mul(s,Math.sin(pt)));dn=sub(mul(s,Math.cos(pt)),mul(pf,Math.sin(pt)));}
        heel=add(add(an,mul(dn,DIM.ankleH)),mul(f,-DIM.heelBack));ball=add(add(an,mul(dn,DIM.ankleH)),mul(f,DIM.ball));toe=add(ball,mul(f,DIM.toe));
        // a free foot may not sink into the floor: lay it along the floor instead
        if(!(s1.foot&&s2.foot)){[heel,ball,toe].forEach(q=>{if(q[1]<0.8)q[1]=0.8;});}
      }
      Object.assign(J,{['kn'+side]:kn,['an'+side]:an,['heel'+side]:heel,['ball'+side]:ball,['toe'+side]:toe});
    }
  }
  // ---- self-check: human range and the floor ----
  const lim=(nm,v,lo,hi)=>{if(v<lo-0.5||v>hi+0.5)flags.push(`${nm} ${v.toFixed(0)} deg outside ${lo}..${hi}`);};
  lim('lumbar flex',p.lumbar[0],-25,60);lim('lumbar side',p.lumbar[1],-25,25);lim('lumbar twist',p.lumbar[2],-10,10);
  lim('thoracic flex',p.thoracic[0],-25,45);lim('thoracic side',p.thoracic[1],-30,30);lim('thoracic twist',p.thoracic[2],-45,45);
  lim('neck flex',p.neck[0],-60,60);lim('neck twist',p.neck[2],-80,80);
  const angAt=(a,b,c)=>Math.acos(Math.max(-1,Math.min(1,dot(nrm(sub(a,b)),nrm(sub(c,b))))))/D;
  ['L','R'].forEach(s=>{
    const up=mv(B.F.pelvis,[0,1,0]),fw=mv(B.F.pelvis,[0,0,1]),th=nrm(sub(J['kn'+s],J['hp'+s]));
    const ext=Math.atan2(-dot(th,fw),-dot(th,up))/D; if(ext>25)flags.push(`hip${s} extended ${ext.toFixed(0)} deg (limit ~20)`);
    const kneeFw=dot(sub(J['kn'+s],add(J['hp'+s],mul(sub(J['an'+s],J['hp'+s]),0.5))),mv(B.F.pelvis,[0,0,1]));
    if(angAt(J['hp'+s],J['kn'+s],J['an'+s])<165&&kneeFw<-3&&Math.abs(p.pitch)<60&&Math.abs(p.roll)<45)flags.push(`knee${s} bends backward`);
  });
  for(const k in J)if(J[k][1]<-0.6)flags.push(`${k} ${(-J[k][1]).toFixed(1)} cm under the floor`);
  return {p,J,F:B.F,flags};
}
// ---- volume: the body as tapered capsules [a,b,ra,rb,part,side] ---------------------------
function capsules(S){
  const J=S.J,F=S.F,C=[],c=(a,b,ra,rb,part,side)=>C.push({a,b,ra,rb,part,side:side||'C'});
  const off=(P,Fm,x,y,z)=>add(P,mv(Fm,[x,y||0,z||0]));
  c(J.hpL,J.hpR,10.5,10.5,'pelvis');
  c(off(J.root,F.L1,4,3),off(J.t1,F.L2,4.5,0),10,10,'waist'); c(off(J.root,F.L1,-4,3),off(J.t1,F.L2,-4.5,0),10,10,'waist');
  c(off(J.t1,F.T1,5,2),off(J.c7,F.T2,6,-9),11,11.5,'chest'); c(off(J.t1,F.T1,-5,2),off(J.c7,F.T2,-6,-9),11,11.5,'chest');
  c(off(J.shL,F.T2,-3,-1),off(J.shR,F.T2,3,-1),6.5,6.5,'chest');
  c(J.c7,J.skull,4.6,4.4,'neck'); c(J.head,off(J.head,F.head,0,3,0.5),DIM.headR,DIM.headR-0.8,'head');
  c(off(J.head,F.head,0,-1,6),off(J.head,F.head,0,-2.5,10.5),3.4,2.2,'head');   // nose: shows where the head is turned
  for(const s of ['L','R']){
    c(J['sh'+s],J['el'+s],5.2,4.3,'upper',s); c(J['el'+s],J['wr'+s],4.2,3.1,'fore',s); c(J['wr'+s],J['ha'+s],3.3,2.6,'hand',s);
    c(J['hp'+s],J['kn'+s],8.6,6.2,'thigh',s); c(J['kn'+s],J['an'+s],6,4.2,'shank',s);
    c(J['heel'+s],J['ball'+s],3.6,3.6,'foot',s); c(J['ball'+s],J['toe'+s],3.4,2.6,'foot',s);
  }
  return C;
}
// ---- camera: orthographic, yaw (azimuth, 0 = looking at the figure's front) and pitch (elevation) ----
function camera(c){const az=(c.yaw||0)*D,el=(c.pitch==null?12:c.pitch)*D;
  const dir=[Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)],right=[Math.cos(az),0,-Math.sin(az)],up=cross(dir,right);
  return {dir,right,up,proj:v=>({x:dot(v,right),y:-dot(v,up),d:dot(v,dir)})};}
// mirror a keyframe left<->right (authoring helper: a bilateral movement is authored once)
function mirror(k){const fx=v=>[-v[0],v[1],v[2]],o={t:k.t,pos:fx(k.pos),yaw:-(k.yaw||0),pitch:k.pitch||0,roll:-(k.roll||0)};
  ['lumbar','thoracic','neck'].forEach(f=>{const v=k[f]||Z3;o[f]=[v[0],-v[1],-v[2]];});
  o.scapL=(k.scapR||[0,0]).slice();o.scapR=(k.scapL||[0,0]).slice();
  const ms=s=>{const r=Object.assign({},s);['at','dir','pole'].forEach(f=>{if(s[f])r[f]=fx(s[f]);});
    ['floor','elbow','foot','knee'].forEach(f=>{if(s[f])r[f]=[-s[f][0],s[f][1]];});['yaw','shin'].forEach(f=>{if(s[f]!=null)r[f]=-s[f];});return r;};
  o.armL=ms(k.armR);o.armR=ms(k.armL);o.legL=ms(k.legR);o.legR=ms(k.legL);return o;}
return {DIM,body,poseAt,capsules,camera,mirror,vec:{add,sub,mul,dot,cross,len,nrm},hdir};
});
