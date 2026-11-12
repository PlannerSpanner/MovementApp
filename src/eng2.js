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
  // root roll (2026-11-12): `roll` turns the WHOLE body about its own front-to-back axis
  // before the yaw, so a figure can lie or prop on its side (side plank, clamshell).
  // roll > 0 lowers the figure's right side; 90 = lying on the right side. Every
  // body-frame vector below goes through rotR; zero/absent roll is exactly the old rotY.
  const roll=p.roll||0, rotR=(v,deg)=>rotY(roll?rotZb(v,roll):v,deg);
  const sl=p.sl||0;
  const d1=rotR(rotZb(spineDir(p.s[0]),sl),yawP);
  const chest=add(pelvis,d1,L.s1);
  // tw = torso twist about the LOWER-SPINE AXIS, not the world vertical (changed
  // 2026-10-12). Upright the two coincide, so it is the familiar shoulder yaw; hinged
  // or on all fours it becomes a true thoracic roll -- one shoulder rises, the other
  // drops -- which is what bent rotations and thread-the-needle actually do. The
  // chest->neck segment carries 45% of it, the head, shoulders and FK arms the full angle.
  const twist=(v,k)=>tw?rotAxis(v,d1,-R(tw*k)):v;
  const neck =add(chest, twist(rotR(rotZb(spineDir(p.s[1]),sl),yawP),0.45),L.s2);
  const head =add(neck,  twist(rotR(rotZb(spineDir(p.s[1]+(p.hf||0)),sl),yawP),1),L.nh);
  // st (2026-11-12) = shoulder-line tilt in degrees, in the body's frontal plane: st > 0
  // drops the right shoulder and lifts the left. A side bend (sl) alone slides the rib cage
  // sideways with the shoulders level; a real one drops the near shoulder. Absent/zero =
  // the old level shoulder line exactly.
  const st=p.st||0;
  const axS=twist(rotR(st?rotZb([1,0,0],st):[1,0,0],yawP),1), axH=rotR([1,0,0],yawP);
  const shL=add(neck,axS,-L.shW), shR=add(neck,axS,L.shW);
  const hpL=add(pelvis,axH,-L.hpW), hpR=add(pelvis,axH,L.hpW);
  const J={pelvis,chest,neck,head,shL,shR,hpL,hpR};
  const fk=(o,a,l1,l2,yaw)=>{const j1=add(o,rotR(dir(a[0],a[1]),yaw),l1);
    return [j1,add(j1,rotR(dir(a[2],a[3]),yaw),l2)];};
  // legs: IK to a world foot target if given, else forward kinematics
  const legRef=rotR([0,0,1],yawP);
  let knL,ftL,knR,ftR;
  if(p.ikFL){[knL,ftL]=ik(hpL,p.ikFL,L.th,L.sh,legRef,1,p.swL);} else {[knL,ftL]=fk(hpL,p.lL,L.th,L.sh,yawP);}
  if(p.ikFR){[knR,ftR]=ik(hpR,p.ikFR,L.th,L.sh,legRef,1,p.swR);} else {[knR,ftR]=fk(hpR,p.lR,L.th,L.sh,yawP);}
  // floor clamp (2026-11-12): no knee, ankle, elbow or hand may be drawn under the floor.
  // A joint that would sink is hinged back up about its parent joint -- the bone keeps its
  // length and its compass direction, only its dip changes -- so the correction grows
  // smoothly from zero as the joint reaches the floor and never pops. A pose that keeps
  // everything above the floor is untouched (bit-identical). The clamp plane sits 0.6 below
  // the floor line (about 1 cm, inside the stroke): a straight standing leg that is 0.2
  // too long must not be kinked to fix what nobody can see.
  const FLR=93.6;
  const hinge=(o,j,l,alt)=>{
    if(!(j[1]>FLR)) return j;
    const dy=Math.max(-1,Math.min(1,(FLR-o[1])/l)), h=Math.sqrt(Math.max(0,1-dy*dy));
    let hs=[j[0]-o[0],0,j[2]-o[2]];
    if(len(hs)<1e-3) hs=[alt[0],0,alt[2]];
    if(len(hs)<1e-3) hs=[0,0,1];
    const hz=nrm(hs);
    return [o[0]+hz[0]*h*l, o[1]+dy*l, o[2]+hz[2]*h*l];
  };
  const clampLimb=(o,j1,j2,l1,l2)=>{
    const k=hinge(o,j1,l1,legRef);
    const e0=k===j1?j2:add(k,sub(j2,j1),1);          // a moved mid joint carries its lower bone with it
    return [k,hinge(k,e0,l2,sub(k,o))];
  };
  [knL,ftL]=clampLimb(hpL,knL,ftL,L.th,L.sh); [knR,ftR]=clampLimb(hpR,knR,ftR,L.th,L.sh);
  Object.assign(J,{knL,ftL,knR,ftR});
  const footOf=(kn,ft)=>{
    const u=nrm(sub(ft,kn));
    const perp=(r)=>{const d=r[0]*u[0]+r[1]*u[1]+r[2]*u[2];
      return [r[0]-u[0]*d, r[1]-u[1]*d, r[2]-u[2]*d];};
    const a=perp(rotR([0,0,1],yawP)), b=perp([0,1,0]);
    let d=nrm(len(a)>=len(b)?a:b);
    if(!isFinite(d[0])||len(d)<1e-3) d=rotR([0,0,1],yawP);
    // a foot may not pass through the floor: if it would, lay it along the floor instead
    const FL=93;
    if(ft[1]+d[1]*L.ft > FL){
      const dy=Math.max(-1,Math.min(1,(FL-ft[1])/L.ft));
      const h=Math.sqrt(Math.max(0,1-dy*dy));
      let hsrc=[d[0],0,d[2]];
      if(len(hsrc)<1e-3) hsrc=[u[0],0,u[2]];
      if(len(hsrc)<1e-3) hsrc=rotR([0,0,1],yawP);
      const hz=nrm(hsrc);
      d=[hz[0]*h, dy, hz[2]*h];
    }
    return add(ft,d,L.ft);
  };
  // Authored foot contact (2026-11-12). Without it the toe direction is the heuristic above,
  // which guesses from the shin and can flip in one frame. A pose may instead say how each
  // foot sits: fpL/fpR = foot pitch in degrees (0 = flat, toes level with the ankle; 60 =
  // heel up on the ball of the foot, toes 60 deg below the ankle) and fyL/fyR = toe-out in
  // degrees about the body's own facing (0 = straight ahead, 180 = toes trailing behind).
  // The ankle (ft) stays the authored joint: for a heel-up foot, author the ankle
  // L.ft*sin(fp) above the floor and the toe lands on it. Both numbers blend, so a foot can
  // roll from flat to the ball with no flip. A toe is never drawn under the floor.
  const footAt=(ft,fp,fy)=>{
    const a=R(fp), b=R(fy||0), h=rotR([Math.sin(b),0,Math.cos(b)],yawP);
    let dy=Math.sin(a); if(ft[1]+dy*L.ft>93) dy=Math.max(-1,Math.min(1,(93-ft[1])/L.ft));
    const hl=Math.hypot(h[0],h[2])||1, k=Math.sqrt(Math.max(0,1-dy*dy))/hl;
    return [ft[0]+h[0]*k*L.ft, ft[1]+dy*L.ft, ft[2]+h[2]*k*L.ft];
  };
  J.toeL=p.fpL==null?footOf(knL,ftL):footAt(ftL,p.fpL,p.fyL);
  J.toeR=p.fpR==null?footOf(knR,ftR):footAt(ftR,p.fpR,p.fyR);
  const tgt=s=>!s?null:(s.k?J[s.k]:s.w);
  const tL=tgt(p.ikL), tR=tgt(p.ikR);
  let elL,haL,elR,haR;
  // optional arm swivel (swAL/swAR): spins the elbow's bend plane about the
  // shoulder->hand axis, same as the leg swivels — undefined means unchanged
  const fkA=(o,a)=>{const j1=add(o,twist(rotR(dir(a[0],a[1]),yawP),1),L.up);
    return [j1,add(j1,twist(rotR(dir(a[2],a[3]),yawP),1),L.fo)];};
  if(tL){[elL,haL]=ik(shL,tL,L.up,L.fo,axS,-1,p.swAL);} else {[elL,haL]=fkA(shL,p.aL);}
  if(tR){[elR,haR]=ik(shR,tR,L.up,L.fo,axS, 1,p.swAR);} else {[elR,haR]=fkA(shR,p.aR);}
  [elL,haL]=clampLimb(shL,elL,haL,L.up,L.fo); [elR,haR]=clampLimb(shR,elR,haR,L.up,L.fo);
  return Object.assign(J,{elL,haL,elR,haR});
}

// spine curvature (added 2026-10-15): `bend` = degrees of arc the trunk curves through,
// + = flexion (rounding, cat), - = extension (arching, cow / cobra). Like tw it is a
// pose number that blends. It NEVER moves a joint -- pelvis, chest, neck, head and the
// shoulder/hip corners are wherever solve() put them -- it only bows the torso's two
// side edges between hip and shoulder along the trunk's rear normal (flexion) or front
// normal (extension) by the arc's sagitta, (chord/2)*tan(bend/4). The renderers draw
// those edges as a path when bend is non-zero and the legacy polygon when it is zero,
// so every existing pose renders byte-identically. n = samples per edge (>=2).
function torsoEdges(J,bend,n){
  const c0=add(J.hpL,sub(J.hpR,J.hpL),0.5), c1=add(J.shL,sub(J.shR,J.shL),0.5);
  const u=nrm(sub(c1,c0)), lat=nrm(add(sub(J.hpR,J.hpL),sub(J.shR,J.shL),1));
  let f=cross(u,lat); if(len(f)<1e-6) f=[0,0,1]; f=nrm(f);          // trunk front
  const sag=-(len(sub(c1,c0))/2)*Math.tan(R(bend)/4);                // + bend bows backward
  const L=[],Rr=[];
  for(let i=0;i<=n;i++){const t=i/n, k=sag*Math.sin(Math.PI*t);
    L.push(add(add(J.hpL,sub(J.shL,J.hpL),t),f,k));
    Rr.push(add(add(J.hpR,sub(J.shR,J.hpR),t),f,k));}
  return {L,R:Rr};
}

// ---- figure skin (2026-11-12) ----
// SKIN=null draws the legacy constant-width strokes, byte for byte. A skin object turns
// each limb segment into a filled, variable-width shape (Illustrator's Width Tool): narrow
// at the joints so bend angles stay crisp, swelling to `w` at fraction `at` along the bone.
// The torso gets a waist and a slightly wider chest. It is a SKIN only: it is drawn from
// the solved joints and moves none of them. Widths are in the same units as the legacy
// stroke (3.0 = today's limb).
//   {joint,mid,tip,                      width at shoulder/hip, elbow/knee, wrist/ankle
//    upper:{w,at},fore:{w,at},thigh:{w,at},shin:{w,at},
//    torso:{chest,waist,at,stroke}}      width factors at the shoulder line and the waist,
//                                        where the waist sits (0 hip .. 1 shoulder), edge stroke
let SKIN=null;
const smooth=x=>x*x*(3-2*x);
// half-width of a limb segment at fraction t along the bone, in stroke units (no scale);
// with no skin it is the legacy constant 1.5. qa/fig/skin.js measures overlap with this.
function limbHalf(seg,t,k){
  const S=SKIN; if(!S) return 1.5;
  const pr=S[seg],prox=seg==='upper'||seg==='thigh',r0=(prox?S.joint:S.mid)/2,r1=(prox?S.mid:S.tip)/2,rm=pr.w/2;
  const at=Math.max(0.05,Math.min(0.95,pr.at));
  return (k||1)*(t<at?r0+(rm-r0)*smooth(t/at):rm+(r1-rm)*smooth((t-at)/(1-at)));
}
// screen-space outline of one limb segment from a to b ({x,y} already fitted), as a path d
function limbD(a,b,seg,sc,k){
  const S=SKIN,pr=S[seg],prox=seg==='upper'||seg==='thigh';
  sc*=(k||1);   // k = far-limb narrowing (farK); the centre line is untouched
  const r0=(prox?S.joint:S.mid)*sc/2, r1=(prox?S.mid:S.tip)*sc/2, rm=pr.w*sc/2;
  const at=Math.max(0.05,Math.min(0.95,pr.at));
  const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);
  if(l<0.05){const r=Math.max(r0,r1,rm).toFixed(2);
    return `M${(a.x-r).toFixed(2)},${a.y.toFixed(2)}a${r},${r} 0 1 0 ${(2*r).toFixed(2)},0a${r},${r} 0 1 0 ${(-2*r).toFixed(2)},0Z`;}
  const nx=-dy/l,ny=dx/l,n=8,Lp=[],Rp=[];
  for(let i=0;i<=n;i++){const t=i/n;
    const h=t<at?r0+(rm-r0)*smooth(t/at):rm+(r1-rm)*smooth((t-at)/(1-at));
    const cx=a.x+dx*t,cy=a.y+dy*t;
    Lp.push((cx+nx*h).toFixed(2)+','+(cy+ny*h).toFixed(2));
    Rp.unshift((cx-nx*h).toFixed(2)+','+(cy-ny*h).toFixed(2));}
  return 'M'+Lp.join('L')+`A${r1.toFixed(2)},${r1.toFixed(2)} 0 0 0 ${Rp[0]}L`+Rp.slice(1).join('L')
    +`A${r0.toFixed(2)},${r0.toFixed(2)} 0 0 0 ${Lp[0]}Z`;
}
// Far-limb narrowing (Will, 2026-11-12): of each left/right pair, the limb FARTHER from the
// camera is drawn narrower (SKIN.far, e.g. 0.78), so two thighs seen side-on stay two limbs
// instead of merging into one. The factor eases in over 4 units of depth difference, so
// nothing pops as limbs trade places. dThis/dOther = camera depth of this limb and its twin.
function farK(dThis,dOther){
  const S=SKIN; if(!S||!S.far||S.far>=1) return 1;
  return 1-(1-S.far)*smooth(Math.max(0,Math.min(1,(dOther-dThis)/4)));
}
// ---- feet and hands as small 3D objects (drawn only with a skin) ----
// The foot is built in its own frame -- f heel-to-ball, up toward the shin, side -- as two
// flat outlines: a PROFILE wedge (heel, arch, ball, toe) and a PLAN footprint (narrow
// rounded heel widening to the forefoot). Both are projected by the camera and filled, so
// side-on the wedge shows, from above the footprint shows, and in between you get both:
// the shape comes from the foot's orientation, not from a fixed glyph. The ankle joint
// (ft) is the heel on the floor and the toe joint is the BALL of the foot, exactly as the
// authored contact numbers (fp/fy) place them; the toes beyond the ball lie flat when the
// ball is on the floor, so a heel-up foot pivots about its ball.
function footPolys(J,s){
  const ft=J['ft'+s],ball=J['toe'+s],kn=J['kn'+s];
  let f=sub(ball,ft); if(len(f)<1e-3) f=[0,0,1]; f=nrm(f);
  const perp=(v,a)=>{const d=v[0]*a[0]+v[1]*a[1]+v[2]*a[2];return [v[0]-a[0]*d,v[1]-a[1]*d,v[2]-a[2]*d];};
  let up=perp(sub(kn,ft),f); if(len(up)<2) up=perp([0,-1,0],f); if(len(up)<1e-3) up=perp([0,0,1],f); up=nrm(up);
  const sd=cross(f,up);
  const k=Math.max(0,Math.min(1,(ball[1]-91.4)/1.2));                 // ball on the floor -> toes flat
  let fh=[f[0],0,f[2]]; fh=len(fh)<1e-3?f:nrm(fh);
  const td=nrm([f[0]+(fh[0]-f[0])*k,f[1]+(fh[1]-f[1])*k,f[2]+(fh[2]-f[2])*k]);
  let tu=perp(up,td); tu=len(tu)<1e-3?up:nrm(tu);
  const P=(a,n,w)=>[ft[0]+f[0]*a+up[0]*n+sd[0]*(w||0),ft[1]+f[1]*a+up[1]*n+sd[1]*(w||0),ft[2]+f[2]*a+up[2]*n+sd[2]*(w||0)];
  const T=(a,n,w)=>[ball[0]+td[0]*a+tu[0]*n+sd[0]*(w||0),ball[1]+td[1]*a+tu[1]*n+sd[1]*(w||0),ball[2]+td[2]*a+tu[2]*n+sd[2]*(w||0)];
  const profile=[P(-1.5,0),P(-1.6,1.5),P(-0.5,2.9),P(1.1,2.9),P(3.4,1.9),P(6.4,1.05),T(1.7,0.6),T(2.2,0.25),T(1.8,0),
                 P(6.4,0),P(4.7,0.2),P(2.9,0.65),P(1.0,0.15)];
  const plan=[P(-1.5,0.1,0),P(-1.1,0.1,0.95),P(0.6,0.1,1.25),P(2.6,0.1,1.05),P(4.6,0.1,1.7),P(6.4,0.1,1.75),T(1.5,0.1,1.35),T(2.2,0.1,0.5),
              T(2.2,0.1,-0.5),T(1.5,0.1,-1.35),P(6.4,0.1,-1.75),P(4.6,0.1,-1.7),P(2.6,0.1,-1.05),P(0.6,0.1,-1.25),P(-1.1,0.1,-0.95)];
  return [profile,plan];
}
// The hand is one flat mitten continuing the forearm, with the thumb as a bulge on one edge.
// Grip (pose gL/gR, degrees about the forearm): 0 = NEUTRAL, thumb on the upper-arm side of
// the elbow's bend plane (thumb up in a handshake, thumbs forward with the arms hanging);
// 90 = PRONATED, thumb turned toward the body's midline; negative would be supinated, which
// Will's distal-bicep rule forbids and the audit rejects. Because the mitten is flat, its
// drawn width and the side its thumb sits on both change with the grip.
function handFrame(J,s,g,surf){
  const el=J['el'+s],ha=J['ha'+s],sh=J['sh'+s]; let u=nrm(sub(ha,el));
  const lat=nrm(sub(J.shR,J.shL)),upb=nrm(sub(J.chest,J.pelvis)),fw=cross(upb,lat);
  const med=s==='L'?lat:[-lat[0],-lat[1],-lat[2]];
  // A hand that would poke through the surface it rests on (the floor, or pose pL/pR = the
  // height of a bench top) is laid FLAT on it instead: fingers along the surface in the
  // forearm's compass direction (or the body's facing when the forearm is vertical), palm down.
  const S0=surf==null?93:surf, over=ha[1]+u[1]*6.1-S0;
  if(over>0&&ha[1]<=S0+1.5){
    let h=[u[0],0,u[2]]; if(len(h)<0.35) h=[fw[0],0,fw[2]]; if(len(h)<1e-3) h=[0,0,1]; h=nrm(h);
    const dy=Math.max(0,Math.min(1,(S0-ha[1])/6.1)),k=Math.sqrt(1-dy*dy);
    u=[h[0]*k,dy,h[2]*k];
    let t=[med[0],0,med[2]]; const d=t[0]*u[0]+t[2]*u[2]; t=[t[0]-u[0]*d,0,t[2]-u[2]*d]; if(len(t)<1e-3) t=cross(u,[0,1,0]);
    return {ha,u,t:nrm(t)};
  }
  const perp=(v)=>{const d=v[0]*u[0]+v[1]*u[1]+v[2]*u[2];return [v[0]-u[0]*d,v[1]-u[1]*d,v[2]-u[2]*d];};
  let w=perp(sub(sh,el)); const b=perp(fw); w=[w[0]+b[0]*0.35,w[1]+b[1]*0.35,w[2]+b[2]*0.35];
  if(len(w)<1e-3) w=perp([0,-1,0]); if(len(w)<1e-3) w=perp([1,0,0]); w=nrm(w);
  const c=cross(u,w),sg=(c[0]*med[0]+c[1]*med[1]+c[2]*med[2])>=0?1:-1;
  return {ha,u,t:g?rotAxis(w,u,sg*R(g)):w};
}
// opt.fist: the hand is closed round an implement (a short rounded fist that the handle passes
// through at the grip point) instead of the open mitten; opt.surf: see handFrame.
function handPoly(J,s,g,opt){
  const {ha,u,t}=handFrame(J,s,g||0,opt&&opt.surf);
  const H=(a,b)=>[ha[0]+u[0]*a+t[0]*b,ha[1]+u[1]*a+t[1]*b,ha[2]+u[2]*a+t[2]*b];
  if(opt&&opt.fist) return [H(-0.2,-1.2),H(1.4,-1.9),H(3.5,-1.9),H(4.6,-0.8),H(4.6,0.7),H(3.7,1.8),H(2.4,2.5),H(1.1,1.9),H(-0.2,1.2)];
  return [H(-0.2,-1.0),H(1.3,-1.55),H(3.5,-1.6),H(5.3,-1.1),H(6.1,0),H(5.5,0.95),H(4.1,1.5),H(3.2,1.75),H(2.9,3.0),H(1.9,2.9),H(0.9,1.5),H(-0.2,1.0)];
}
// where an implement sits in the fist: 3.4 beyond the wrist along the forearm. Props may name
// 'gpL'/'gpR' (alone or as {j:'gpL',o:[..]}) to hang from the grip instead of the wrist joint.
function gripPt(J,k){
  const s=k.slice(-1),el=J['el'+s],ha=J['ha'+s],u=nrm(sub(ha,el));
  return [ha[0]+u[0]*3.4,ha[1]+u[1]*3.4,ha[2]+u[2]*3.4];
}

// the torso's two side edges with the skin's waist and chest factors applied about the
// trunk's centre line (3D, before projection). n samples; works with or without bend.
function torsoSkin(J,bend,n){
  const T=SKIN.torso,e=torsoEdges(J,bend||0,n),at=Math.max(0.05,Math.min(0.95,T.at));
  const k=t=>t<at?1+(T.waist-1)*smooth(t/at):T.waist+(T.chest-T.waist)*smooth((t-at)/(1-at));
  const Lp=[],Rp=[];
  for(let i=0;i<=n;i++){const l=e.L[i],r=e.R[i],c=add(l,sub(r,l),0.5),h=sub(r,c),f=k(i/n);
    Lp.push(add(c,h,-f));Rp.push(add(c,h,f));}
  return {L:Lp,R:Rp};
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
    // o.alt (2026-10-15): the legs ALTERNATE within one cycle. The first half is o.leg's
    // orbit, the second half the other leg's mirror image, and each orbit starts and ends
    // with the foot planted on base's own target for that leg (both feet must carry ikF
    // targets). The thigh runs through four stations -- down (planted, fitted so the
    // straight leg's foot lands exactly on the target) -> behind -> out -> front -> down,
    // i.e. back-to-front; the halfway mirror reverses it -- joined by a periodic
    // Catmull-Rom spline so the foot lifts and lands smoothly. o.fr/o.out/o.bk override
    // the station angles [thighFlex, abd, shinFlex, shinAbd] for the right leg.
    if(o.alt){
      const half=((ph/(2*Math.PI))%1+1)%1, leg=half<0.5?o.leg:(o.leg==='L'?'R':'L');
      const th=(half<0.5?half:half-0.5)*4*Math.PI, sg=leg==='L'?-1:1;
      const J=solve(base), hp=J['hp'+leg], tg=base['ikF'+leg];
      const d=rotY(nrm(sub(tg,hp)),-base.yaw);                 // straight-leg direction, body frame
      const fd=Math.atan2(d[2],d[1])*180/Math.PI, ad=Math.asin(Math.max(-1,Math.min(1,d[0])))*180/Math.PI;
      const D=[fd,ad,fd,ad];
      const M=(st)=>[st[0],sg*st[1],st[2],sg*st[3]];
      const S=[D, M(o.bk||[-25,28,-115,10]), M(o.out||[30,56,-60,20]), M(o.fr||[85,6,-5,2])];
      const seg=th/(Math.PI/2), i=Math.floor(seg)%4, t=seg-Math.floor(seg);
      const P0=S[(i+3)%4],P1=S[i],P2=S[(i+1)%4],P3=S[(i+2)%4];
      const cr=(a,b,c,e)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-e)*t*t+(-a+3*b-3*c+e)*t*t*t);
      p['l'+leg]=[0,1,2,3].map(k=>cr(P0[k],P1[k],P2[k],P3[k]));
      delete p['ikF'+leg];
      return p;
    }
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
