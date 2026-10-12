// ================= 3D skeleton =================
const L={s1:13,s2:13,nh:9,hr:6.2,up:13,fo:13,th:19,sh:19,shW:7.0,hpW:5.0,ft:6.4};
const R=d=>d*Math.PI/180;
const rotY=(v,deg)=>{const c=Math.cos(R(deg)),s=Math.sin(R(deg));
  return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];};
const add=(a,b,k)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const len=v=>Math.hypot(v[0],v[1],v[2]);
const nrm=v=>{const n=len(v)||1;return [v[0]/n,v[1]/n,v[2]/n];};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function rotAxis(v,k,th){const c=Math.cos(th),s=Math.sin(th),kv=cross(k,v),
  kd=k[0]*v[0]+k[1]*v[1]+k[2]*v[2];
  return [v[0]*c+kv[0]*s+k[0]*kd*(1-c),v[1]*c+kv[1]*s+k[1]*kd*(1-c),v[2]*c+kv[2]*s+k[2]*kd*(1-c)];}
function dir(flex,abd){const cb=Math.cos(R(abd));
  return [Math.sin(R(abd)),Math.cos(R(flex))*cb,Math.sin(R(flex))*cb];}
function spineDir(flex){return [0,-Math.cos(R(flex)),Math.sin(R(flex))];}
const rotZb=(v,deg)=>{const c=Math.cos(R(deg)),s=Math.sin(R(deg));
  return [v[0]*c-v[1]*s, v[0]*s+v[1]*c, v[2]];};

// two-link IK: end effector lands on target, bones keep their length
function ik(S,T,l1,l2,ref,sign,swivel){
  let d=sub(T,S); let D=len(d); if(D<1e-6){d=[0,1,0];D=1;}
  const u=nrm(d), Dc=Math.max(Math.abs(l1-l2)+0.01,Math.min(l1+l2-0.01,D));
  const cf=(l1*l1+Dc*Dc-l2*l2)/(2*l1*Dc), f=Math.acos(Math.max(-1,Math.min(1,cf)));
  let ax=cross(u,ref); if(len(ax)<1e-6) ax=cross(u,[0,0,1]); ax=nrm(ax);
  if(swivel) ax=nrm(rotAxis(ax,u,R(swivel)));   // spin the bend plane about the limb axis
  return [add(S,rotAxis(u,ax,sign*f),l1), add(S,u,Dc)];
}

function solve(p){
  const pelvis=p.p, yawP=p.yaw, tw=p.tw||0;
  const sl=p.sl||0;
  const d1=rotY(rotZb(spineDir(p.s[0]),sl),yawP);
  const chest=add(pelvis,d1,L.s1);
  // tw = torso twist about the LOWER-SPINE AXIS, not the world vertical (changed
  // 2026-10-12). Upright the two coincide, so it is the familiar shoulder yaw; hinged
  // or on all fours it becomes a true thoracic roll -- one shoulder rises, the other
  // drops -- which is what bent rotations and thread-the-needle actually do. The
  // chest->neck segment carries 45% of it, the head, shoulders and FK arms the full angle.
  const twist=(v,k)=>tw?rotAxis(v,d1,-R(tw*k)):v;
  const neck =add(chest, twist(rotY(rotZb(spineDir(p.s[1]),sl),yawP),0.45),L.s2);
  const head =add(neck,  twist(rotY(rotZb(spineDir(p.s[1]+(p.hf||0)),sl),yawP),1),L.nh);
  const axS=twist(rotY([1,0,0],yawP),1), axH=rotY([1,0,0],yawP);
  const shL=add(neck,axS,-L.shW), shR=add(neck,axS,L.shW);
  const hpL=add(pelvis,axH,-L.hpW), hpR=add(pelvis,axH,L.hpW);
  const J={pelvis,chest,neck,head,shL,shR,hpL,hpR};
  const fk=(o,a,l1,l2,yaw)=>{const j1=add(o,rotY(dir(a[0],a[1]),yaw),l1);
    return [j1,add(j1,rotY(dir(a[2],a[3]),yaw),l2)];};
  // legs: IK to a world foot target if given, else forward kinematics
  const legRef=rotY([0,0,1],yawP);
  let knL,ftL,knR,ftR;
  if(p.ikFL){[knL,ftL]=ik(hpL,p.ikFL,L.th,L.sh,legRef,1,p.swL);} else {[knL,ftL]=fk(hpL,p.lL,L.th,L.sh,yawP);}
  if(p.ikFR){[knR,ftR]=ik(hpR,p.ikFR,L.th,L.sh,legRef,1,p.swR);} else {[knR,ftR]=fk(hpR,p.lR,L.th,L.sh,yawP);}
  Object.assign(J,{knL,ftL,knR,ftR});
  const footOf=(kn,ft)=>{
    const u=nrm(sub(ft,kn));
    const perp=(r)=>{const d=r[0]*u[0]+r[1]*u[1]+r[2]*u[2];
      return [r[0]-u[0]*d, r[1]-u[1]*d, r[2]-u[2]*d];};
    const a=perp(rotY([0,0,1],yawP)), b=perp([0,1,0]);
    let d=nrm(len(a)>=len(b)?a:b);
    if(!isFinite(d[0])||len(d)<1e-3) d=rotY([0,0,1],yawP);
    // a foot may not pass through the floor: if it would, lay it along the floor instead
    const FL=93;
    if(ft[1]+d[1]*L.ft > FL){
      const dy=Math.max(-1,Math.min(1,(FL-ft[1])/L.ft));
      const h=Math.sqrt(Math.max(0,1-dy*dy));
      let hsrc=[d[0],0,d[2]];
      if(len(hsrc)<1e-3) hsrc=[u[0],0,u[2]];
      if(len(hsrc)<1e-3) hsrc=rotY([0,0,1],yawP);
      const hz=nrm(hsrc);
      d=[hz[0]*h, dy, hz[2]*h];
    }
    return add(ft,d,L.ft);
  };
  J.toeL=footOf(knL,ftL); J.toeR=footOf(knR,ftR);
  const tgt=s=>!s?null:(s.k?J[s.k]:s.w);
  const tL=tgt(p.ikL), tR=tgt(p.ikR);
  let elL,haL,elR,haR;
  // optional arm swivel (swAL/swAR): spins the elbow's bend plane about the
  // shoulder->hand axis, same as the leg swivels — undefined means unchanged
  const fkA=(o,a)=>{const j1=add(o,twist(rotY(dir(a[0],a[1]),yawP),1),L.up);
    return [j1,add(j1,twist(rotY(dir(a[2],a[3]),yawP),1),L.fo)];};
  if(tL){[elL,haL]=ik(shL,tL,L.up,L.fo,axS,-1,p.swAL);} else {[elL,haL]=fkA(shL,p.aL);}
  if(tR){[elR,haR]=ik(shR,tR,L.up,L.fo,axS, 1,p.swAR);} else {[elR,haR]=fkA(shR,p.aR);}
  return Object.assign(J,{elL,haL,elR,haR});
}

// circular-path helper: knees or hips orbit while feet stay pinned
function orbitPose(base,o,ph){
  const p=Object.assign({},base);
  if(o.swivel){ // knees orbit around a fixed hip-to-ankle axis; feet never move
    p.swL=o.amp*Math.sin(ph); p.swR=o.amp*Math.sin(ph);
    return p;
  }
  if(o.leg){ // standing hip CAR: one leg (o.leg 'L'/'R') circles from the hip with the knee
    // bent ~90 deg (the shin follows the thigh); the other leg keeps base's planted target.
    // o.fB/o.fA: thigh flex centre/amplitude (90 = forward horizontal, <0 = behind);
    // o.aB/o.aA: abduction centre/amplitude. Phase 0 = forward, then out, then behind.
    const f1=o.fB+o.fA*Math.cos(ph), a1=o.aB+o.aA*Math.sin(ph), sg=o.leg==='L'?-1:1;
    p['l'+o.leg]=[f1,sg*a1,f1-(o.knee==null?90:o.knee),sg*a1*0.35];
    delete p['ikF'+o.leg];
    return p;
  }
  if(o.hips){ // pelvis traces a circle, feet stay planted via leg IK
    p.p=[base.p[0]+o.rx*Math.sin(ph), base.p[1]+(o.ry||0)*Math.cos(ph)*0.3, base.p[2]+o.rz*Math.cos(ph)];
    return p;
  }
  const drop=(o.floorY-base.p[1])/L.th;
  const mk=side=>{const f1=o.fB+o.fA*Math.sin(ph), a1=side*6+o.aA*Math.cos(ph);
    let c2=Math.max(-1,Math.min(1,drop-Math.cos(R(f1))));
    return [f1,a1,-Math.acos(c2)*180/Math.PI,-a1];};
  p.lL=mk(-1); p.lR=mk(1);
  return p;
}
