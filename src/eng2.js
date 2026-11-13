// ================= 3D skeleton =================
// PROPORTIONS (2026-11-13, against Drillis and Contini 1966 at this figure's height of 80.8
// units, sole to crown; sources and their limits in docs/design/research.md section 5):
//   hip joint 42.1 above the sole (0.521 H; D&C 0.530), thigh and shank 19.75 each (0.244 H;
//   D&C 0.245 and 0.246), ankle joint 3.1 above the sole (0.038 H; D&C 0.039), shoulder 65.6
//   (0.812 H; D&C 0.818), hip joint to shoulder 23.0 (D&C 23.3), foot 12.3 long (0.152 H).
// Until then the hip joint sat at the bottom of the drawn trunk, 3 units low, with legs 1.5
// short and the ankle joint 1.6 above the sole. Pose data did not change: `p` is still the
// BASE of the trunk (the crotch line, where the drawn trunk ends). The HIP JOINTS now sit
// hipUp further up the lower spine, inside the trunk shape, and the legs pivot from there.
// Head, shoulders, arms and every hand position are exactly where they were.
// Arms were left at 13 + 13: shoulder to wrist is 26.0 against D&C's 26.8 (3% short).
const L={s1:13,s2:13,nh:9,hr:6.2,up:13,fo:13,th:19.75,sh:19.75,shW:7.0,hpW:5.0,ft:7.65,hipUp:3.0,ankUp:1.5};
// A planted foot's authored ankle target was written for the old foot (ankle joint on the
// y = 93 plane, 6.4 from the ball). The new ankle joint is ankUp higher over the same sole and
// 7.65 from the ball, so a SOLE-DOWN target at its contact height is lifted to match: by 1.5
// when flat, by the pitched equivalent when the heel is up on the ball (fp). Top-down feet
// (kneeling, prone: fy beyond 90) and feet in the air are returned unchanged. The templates
// apply this ONCE to authored keyframes in normalise(); the solver itself has no special case.
function footRetarget(T,fp,fy){
  if(!T||Math.abs(fy||0)>90) return T;
  const a=R(Math.max(0,fp||0)),s=Math.sin(a),c=Math.cos(a);
  const hOld=6.4*s, hNew=(L.ankUp+1.6)*c-1.6+L.ft*s;
  const w=Math.max(0,Math.min(1,1-((93-hOld)-T[1]-0.5)/1.5));
  return w>0?[T[0],T[1]-(hNew-hOld)*w,T[2]]:T;
}
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
  // hip joints: hipUp up the lower spine from the trunk's base (see L). pvL/pvR are the base
  // corners of the drawn trunk, where the hip joints used to be.
  // p.hs (set by the templates' normalise for floor positions) = the lower-spine angle the hip
  // offset is taken along instead of this frame's own: when the spine flexes over hips that
  // rest or pivot on the floor (cat-cow, cobra, a seated fold), the hip joints must not swing.
  const hc=add(pelvis,p.hs==null?d1:rotR(rotZb(spineDir(p.hs),sl),yawP),L.hipUp);
  const hpL=add(hc,axH,-L.hpW), hpR=add(hc,axH,L.hpW);
  const pvL=add(pelvis,axH,-L.hpW), pvR=add(pelvis,axH,L.hpW);
  const J={pelvis,chest,neck,head,shL,shR,hpL,hpR,pvL,pvR};
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
    // a foot may not pass through the floor: if it would, lay it along the floor instead.
    // The ball joint of a planted foot rides ankUp above the old floor plane, level with the ankle.
    const FL=Math.max(93-L.ankUp,Math.min(93,ft[1]));
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
    const FL=Math.abs(fy||0)>90?93:Math.max(93-L.ankUp,Math.min(93,ft[1]));   // sole-down: the ball joint stays ankUp up
    let dy=Math.sin(a); if(ft[1]+dy*L.ft>FL) dy=Math.max(-1,Math.min(1,(FL-ft[1])/L.ft));
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
  // the trunk is drawn from its BASE corners (pvL/pvR), not from the hip joints, which sit
  // inside it since 2026-11-13; a J without them (old callers, tests) falls back to the hips
  const bL=J.pvL||J.hpL, bR=J.pvR||J.hpR;
  const c0=add(bL,sub(bR,bL),0.5), c1=add(J.shL,sub(J.shR,J.shL),0.5);
  const u=nrm(sub(c1,c0)), lat=nrm(add(sub(bR,bL),sub(J.shR,J.shL),1));
  let f=cross(u,lat); if(len(f)<1e-6) f=[0,0,1]; f=nrm(f);          // trunk front
  const sag=-(len(sub(c1,c0))/2)*Math.tan(R(bend)/4);                // + bend bows backward
  const L=[],Rr=[];
  for(let i=0;i<=n;i++){const t=i/n, k=sag*Math.sin(Math.PI*t);
    L.push(add(add(bL,sub(J.shL,bL),t),f,k));
    Rr.push(add(add(bR,sub(J.shR,bR),t),f,k));}
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
function limbD(a,b,seg,sc,k,flat){
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
  // flat = a square-cut far end (the shin: its end is buried inside the foot, so there is no
  // round cap to escape the foot outline and nothing has to bulge to hide one)
  return 'M'+Lp.join('L')+(flat?`L${Rp[0]}L`:`A${r1.toFixed(2)},${r1.toFixed(2)} 0 0 0 ${Rp[0]}L`)+Rp.slice(1).join('L')
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
// The foot is built in its own frame and then projected by the camera, as two flat outlines
// through one small volume: a PROFILE wedge (heel, arch, ball, toes) and a PLAN footprint
// (narrow rounded heel widening to the forefoot). Side-on the wedge shows, from above the
// footprint shows, in between both: the shape comes from the foot's orientation.
// ORIENTATION IS ANATOMICAL, not "sole toward the floor" (Will, 2026-11-12). The shin has a
// front: the side away from the folded thigh (for a straight leg, the body's own front).
// The top of the foot continues the FRONT of the shin and the sole continues the back. So:
// standing, the sole is down; on all fours or lying prone, with the foot in line with the
// shin, the TOP of the foot is on the floor and the sole faces up; lying on the back the
// toes point at the ceiling. footFrame returns f (ankle to ball), n (out of the top of the
// foot), sd (across it).
// The ankle joint (ft) sits INSIDE the volume, 1.4 above the sole and 2.2 in front of the
// back of the heel, so the foot encloses the end of the shin. The toe joint is the BALL of
// the foot, as the authored contact numbers (fp/fy) place it; with the sole down and the
// ball on the floor the toes lie flat beyond it, so a heel-up foot pivots about its ball.
// (A limb drawn with thickness already reaches about 1.4 below its joints, so a planted
// sole sits level with a planted knee or shin.)
function footFrame(J,s){
  const ft=J['ft'+s],ball=J['toe'+s],kn=J['kn'+s],hp=J['hp'+s];
  const d3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], perp=(v,a)=>{const d=d3(v,a);return [v[0]-a[0]*d,v[1]-a[1]*d,v[2]-a[2]*d];};
  let f=sub(ball,ft); if(len(f)<1e-3) f=[0,0,1]; f=nrm(f);
  let us=sub(ft,kn); us=len(us)<1e-3?[0,1,0]:nrm(us);                       // down the shin
  const lat=nrm(sub(J.hpR,J.hpL)),upb=nrm(sub(J.chest,J.pelvis)),fw=cross(upb,lat);   // the body's own front
  const back=perp(sub(hp,kn),us),bf=perp(fw,us);                            // the folded thigh is behind the shin
  let sa=[bf[0]*0.35-back[0]/19,bf[1]*0.35-back[1]/19,bf[2]*0.35-back[2]/19];
  if(len(sa)<1e-3) sa=perp([0,0,1],us); if(len(sa)<1e-3) sa=perp([1,0,0],us); sa=nrm(sa);   // front of the shin
  const a=d3(f,us),b=d3(f,sa);
  let n=[sa[0]*a-us[0]*b,sa[1]*a-us[1]*b,sa[2]*a-us[2]*b];
  if(len(n)<0.3){n=perp([-us[0],-us[1],-us[2]],f); if(len(n)<1e-3) n=perp([0,-1,0],f);}
  n=nrm(n);
  return {ft,ball,f,n,sd:cross(f,n)};
}
// THE FOOT IS A SET OF 3D LANDMARKS (Will, 2026-11-12), in the foot's own frame: a along the
// foot from the ankle (heel behind, toes ahead), h out of the top of the foot, w toward the
// MEDIAL side (the big-toe side: +cross(f,n) for the left foot, the opposite for the right,
// by handedness, so it is right in every pose). Each landmark is a small ball of soft
// tissue. They are projected every frame and one smooth outline is drawn round them (the
// hull of the projected balls), so the silhouette is right from the side, from above, from
// the front and from any angle between, with no fixed 2D glyph.
// Proportions, scaled to this figure (79 units tall; Drillis and Contini: foot length
// 0.152 H = 12.0, foot breadth 0.055 H = 4.3). The heel reaches only 1.55 behind the ankle,
// flush with the back of the shin (Will's eye on the phone overruled the 0.24-of-length heel,
// which bulged behind the leg), so the drawn foot is 10.7 long; ball of the foot at 6.4, breadth 4.6 across the toe joints, inner arch raised
// 0.8 off the sole (about 6% of foot length) with the OUTER edge low and nearly flat.
// The ankle height is 1.6, half the published 0.039 H: the skeleton's ankle joint sits on
// the floor line, and a taller foot would be drawn under the floor.
// The toe joint of the skeleton is the ball of the foot (big-toe joint line), as the
// authored contact numbers place it; with the sole down and the ball planted the toes lie
// flat beyond it, so a heel-up foot pivots on its ball.
// FOOT DIMENSIONS (2026-11-13), as fractions of a 12.3-unit foot (0.152 of stature):
//   ball of the big toe 0.74 from the heel and of the little toe 0.64 (Xu et al. 2018);
//   forefoot breadth 0.37 and heel breadth 0.26 (Hajaghazadeh et al. 2018); inner arch
//   (navicular) 0.15 high (Williams and McClay 2000); ankle joint 3.1 above the sole (D&C).
//   NOT from data: the back of the heel stays flush with the back of the shin (Will's
//   decision, 2026-11-12), so the ankle is 0.12 of the foot from the heel where the cited
//   malleolus position is 0.26 to 0.31. The added length is all in front of the ankle.
const FOOT={len:12.3,h0:-(L.ankUp+1.6)};
function footLandmarks(J,s,k){
  const F=footFrame(J,s),ft=F.ft,ball=F.ball,f=F.f,n=F.n,mg=s==='L'?1:-1;
  const med=[F.sd[0]*mg,F.sd[1]*mg,F.sd[2]*mg];
  const kf=n[1]<0.4?Math.max(0,Math.min(1,(ball[1]-91.4)/1.2)):0;
  let fh=[f[0],0,f[2]]; fh=len(fh)<1e-3?f:nrm(fh);
  const td=nrm([f[0]+(fh[0]-f[0])*kf,f[1]+(fh[1]-f[1])*kf,f[2]+(fh[2]-f[2])*kf]);
  const dt=n[0]*td[0]+n[1]*td[1]+n[2]*td[2]; let tu=[n[0]-td[0]*dt,n[1]-td[1]*dt,n[2]-td[2]*dt]; tu=len(tu)<1e-3?n:nrm(tu);
  const P=(a,h,w)=>[ft[0]+f[0]*a+n[0]*h+med[0]*w,ft[1]+f[1]*a+n[1]*h+med[1]*w,ft[2]+f[2]*a+n[2]*h+med[2]*w];
  const T=(a,h,w)=>[ball[0]+td[0]*a+tu[0]*h+med[0]*w,ball[1]+td[1]*a+tu[1]*h+med[1]*w,ball[2]+td[2]*a+tu[2]*h+med[2]*w];
  const h0=FOOT.h0,tip=((SKIN&&SKIN.tip)||2.3)*(k||1)/2,hb=tip+0.2;
  // the heel hangs 3.1 below the ankle now, so it follows the SHIN'S line down (the Achilles
  // line) instead of dropping square to the sole: sheared by the shin's lean, up to 15 deg
  const usH=nrm(sub(ft,J['kn'+s])),dn=-(usH[0]*n[0]+usH[1]*n[1]+usH[2]*n[2]),df=usH[0]*f[0]+usH[1]*f[1]+usH[2]*f[2];
  const lean=dn>0.2?Math.max(-0.27,Math.min(0.27,df/dn)):0, HS=h=>-(h)*lean;   // shift along the foot at height h (h < 0 below the ankle)
  const pts=[
    {id:'ankle',p:P(0,0,0),r:0.6},
    {id:'malM',p:P(0.1,0.15,tip-0.25),r:0.55},{id:'malL',p:P(-0.3,-0.15,-(tip-0.25)),r:0.55},   // inner and outer ankle bones
    // The back of the heel is nearly FLUSH with the back of the shin (the Achilles line): it
    // reaches 0.2 behind the shin's back edge when the shin is square on the foot (Will, 2026-11-12: at most half a unit, which then holds up to a 15 deg lean), with a
    // small rounded corner at the bottom. hb = how far behind the ankle that is.
    {id:'heelB',p:P(-(hb-0.55)+HS(h0+0.75),h0+0.75,0),r:0.55},             // back of the heel
    {id:'heelM',p:P(-(hb-0.6)+HS(h0+0.5),h0+0.5,1.05),r:0.5},{id:'heelL',p:P(-(hb-0.6)+HS(h0+0.5),h0+0.5,-1.15),r:0.5},   // heel pad, 3.2 across
    {id:'archT',p:P(3.3,h0+1.85,1.05),r:0.5},                  // top of the inner arch, off the floor
    {id:'edgeL',p:P(3.0,h0+0.45,-1.6),r:0.45},                 // the outside edge, low
    {id:'instep',p:P(3.2,0.3,0.1),r:0.6},
    {id:'mtp1',p:P(L.ft,h0+0.6,1.55),r:0.6},{id:'mtp5',p:P(L.ft-1.25,h0+0.5,-2.0),r:0.5},   // big-toe and little-toe joints
    {id:'toe1',p:T(3.0,h0+0.4,1.2),r:0.4},{id:'toe2',p:T(2.8,h0+0.4,0.2),r:0.4},{id:'toe5',p:T(1.4,h0+0.35,-1.9),r:0.35}];  // toe tips
  // the shin's own cross-section at the ankle, as six small balls round the shin axis: the foot
  // is exactly as thick as the shin where they meet (0.15 more, no bulge), whatever angle the
  // foot makes with the shin, so the shin's square-cut end always lies inside the outline
  {const us=nrm(sub(ft,J['kn'+s])),d0=us[0]*n[0]+us[1]*n[1]+us[2]*n[2];
   let e1=[n[0]-us[0]*d0,n[1]-us[1]*d0,n[2]-us[2]*d0]; if(len(e1)<0.2){const d1=us[0]*f[0]+us[1]*f[1]+us[2]*f[2];e1=[f[0]-us[0]*d1,f[1]-us[1]*d1,f[2]-us[2]*d1];}
   e1=nrm(e1); const e2=cross(us,e1),rr=tip-0.3;
   for(let a=0;a<6;a++){const c=Math.cos(a*Math.PI/3)*rr,q=Math.sin(a*Math.PI/3)*rr;
     pts.push({id:'ring',p:[ft[0]+e1[0]*c+e2[0]*q,ft[1]+e1[1]*c+e2[1]*q,ft[2]+e1[2]*c+e2[2]*q],r:0.6});}}
  return {F,med,pts,tip,lean,archU:P(3.3,h0+1.1,1.0),heelSole:P(-(hb-0.6)+HS(h0),h0,0.65),ballSole:P(L.ft,h0,1.5)};
}
// resample a closed polygon evenly along its length and relax it, so the outline is one soft
// curve with no facet where the hull steps from one landmark to the next
function smoothLoop(pl,n,it){
  const m=pl.length,seg=[];let tot=0;
  for(let i=0;i<m;i++){const a=pl[i],b=pl[(i+1)%m],l=Math.hypot(b.x-a.x,b.y-a.y);seg.push(l);tot+=l;}
  if(tot<1e-6) return pl;
  let out=[],i=0,acc=0;
  for(let k=0;k<n;k++){const d=tot*k/n;while(i<m-1&&acc+seg[i]<d){acc+=seg[i];i++;}
    const a=pl[i],b=pl[(i+1)%m],t=seg[i]?(d-acc)/seg[i]:0;out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}
  for(let r=0;r<it;r++)out=out.map((p,j)=>{const a=out[(j+n-1)%n],b=out[(j+1)%n];return {x:(a.x+2*p.x+b.x)/4,y:(a.y+2*p.y+b.y)/4};});
  return out;
}
// pr(v) -> {x,y} fitted screen point; sc = units to screen. Returns the outline polygon.
function footOutline(J,s,pr,sc,k){
  const L=footLandmarks(J,s,k),S=[];
  L.pts.forEach(m=>{const c=pr(m.p),r=m.r*sc;for(let a=0;a<16;a++)S.push({x:c.x+r*Math.cos(a*Math.PI/8),y:c.y+r*Math.sin(a*Math.PI/8),id:m.id});});
  S.sort((a,b)=>a.x-b.x||a.y-b.y);
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),lo=[],up=[];
  for(const q of S){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
  for(let i=S.length-1;i>=0;i--){const q=S[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}
  const H=lo.slice(0,-1).concat(up.slice(0,-1));
  // The inner arch: when the MEDIAL side faces the camera, the sole edge between the heel pad
  // and the big-toe joint is drawn up to the arch instead of straight across. From the
  // outside, from above or from the front the edge stays straight (the outer edge is flat).
  const o=pr([0,0,0]),ex=pr([1,0,0]),ey=pr([0,1,0]),ez=pr([0,0,1]);
  const rx=[ex.x-o.x,ey.x-o.x,ez.x-o.x],ry=[ex.y-o.y,ey.y-o.y,ez.y-o.y];
  let tc=cross(rx,ry); const tl=len(tc)||1; tc=[tc[0]/tl,tc[1]/tl,tc[2]/tl];
  const face=Math.abs(L.med[0]*tc[0]+L.med[1]*tc[1]+L.med[2]*tc[2]);
  // which side of the foot is toward the viewer: compare the depth order of the two ankle bones
  const dM=pr(L.pts.find(q=>q.id==='malM').p),dL=pr(L.pts.find(q=>q.id==='malL').p),near=(dM.d!==undefined&&dL.d!==undefined)?(dM.d>=dL.d):true;
  const m=near?Math.max(0,Math.min(1,(face-0.3)/0.45)):0;
  if(m>0.02){const hs=pr(L.heelSole),bs=pr(L.ballSole),q=pr(L.archU),tol=0.45*sc,n=H.length;
    const on=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1e-9,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l2));
      return Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y);};
    const edgeOf=p=>{let b=-1,bd=tol;for(let i=0;i<n;i++){const d=on(p,H[i],H[(i+1)%n]);if(d<bd){bd=d;b=i;}}return b;};
    const iA=edgeOf(hs),iB=edgeOf(bs);
    if(iA>=0&&iB>=0){
      // the sole runs along the hull from the heel-pad point to the ball point: replace that
      // stretch (whichever way round is shorter) with a curve lifted to the arch
      const snap=(p,i)=>{const a=H[i],b=H[(i+1)%n],dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1e-9,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l2));return {x:a.x+dx*t,y:a.y+dy*t};};
      const hsS=snap(hs,iA),bsS=snap(bs,iB);   // start and end ON the hull, so the curve joins it without a kink
      const fwd=(iB-iA+n)%n,bwd=(iA-iB+n)%n,go=iA===iB?(Math.hypot(hsS.x-H[iA].x,hsS.y-H[iA].y)<=Math.hypot(bsS.x-H[iA].x,bsS.y-H[iA].y)):fwd<=bwd,from=go?iA:iB,to=go?iB:iA,p0=go?hsS:bsS,p1=go?bsS:hsS;
      if(Math.min(fwd,bwd)<n/2){const out=[];
        for(let i=0;i<n;i++){const idx=(to+1+i)%n;out.push(H[idx]);if(idx===from)break;}
        const mx=(p0.x+p1.x)/2,my=(p0.y+p1.y)/2; let ox=(q.x-mx)*m,oy=(q.y-my)*m;
        // seen nearly end-on the span is short: keep the arch shallow so it never becomes a notch
        const dep=Math.hypot(ox,oy),span=Math.hypot(p1.x-p0.x,p1.y-p0.y); if(dep>0.16*span){const k2=0.16*span/(dep||1);ox*=k2;oy*=k2;}
        [[0,0],[0.12,0.25],[0.28,0.7],[0.5,1],[0.72,0.7],[0.88,0.25],[1,0]].forEach(([t,w])=>out.push({x:p0.x+(p1.x-p0.x)*t+ox*w,y:p0.y+(p1.y-p0.y)*t+oy*w,id:'arch'}));
        return smoothLoop(out,64,4);}}}
  return smoothLoop(H,64,4);
}
// The hand is one flat mitten continuing the forearm, with the thumb as a bulge on one edge.
// handFrame returns the wrist, u (wrist -> fingertips), t (toward the THUMB, in the hand's plane)
// and palm (the way the palm faces). Rebuilt 2026-11-13: the old frame took the thumb from the
// elbow's bend plane even when the arm was straight, where that plane is noise, so hanging
// arms read as turned inward (Will, on his phone).
//  - NEUTRAL (g = 0) comes from where the FOREARM points in the body's own frame: down =
//    thumb forward (arms hanging, palms to the thighs; the bottom of a row), forward = thumb
//    up (a handshake), up = thumb back (overhead, the top of a hammer curl or a neutral
//    press), back = thumb down, out to the side or across the body = forward and a little up.
//  - Grip (pose gL/gR, degrees about the forearm): 0 neutral, 90 PRONATED. The turn is by
//    handedness (a right forearm pronates one way, a left the other), never by a guess.
//    Negative would be supinated, which Will's distal-bicep rule forbids and the audit rejects.
//  - A hand resting on a surface is laid flat on it, PALM DOWN, so the thumb falls on the
//    inner side when the fingers point ahead.
function handFrame(J,s,g,surf){
  const el=J['el'+s],ha=J['ha'+s],sh=J['sh'+s]; let u=nrm(sub(ha,el));
  const lat=nrm(sub(J.shR,J.shL)),upb=nrm(sub(J.chest,J.pelvis)),fw=cross(upb,lat);
  const hs=s==='L'?1:-1;                                   // palm = hs * (u x t)
  const out=(u,t)=>{const c=cross(u,t);return {ha,u,t,palm:[c[0]*hs,c[1]*hs,c[2]*hs]};};
  // A hand that would poke through the surface it rests on (the floor, or pose pL/pR = the
  // height of a bench top) is laid FLAT on it instead: fingers along the surface in the
  // forearm's compass direction (or the body's facing when the forearm is vertical), palm down.
  // A forearm lying along the surface (side plank, forearm plank) rests the same way.
  const S0=surf==null?93:surf, over=ha[1]+u[1]*6.1-S0, c01=x=>Math.max(0,Math.min(1,x));
  const lying=c01((1.6-Math.abs(ha[1]-S0))/0.8)*c01((2.6-Math.abs(el[1]-S0))/0.8);   // 0..1, graded so it cannot snap
  let flat=null, kf=0;
  if((over>0||lying>0)&&ha[1]<S0+1.5){
    // fingers lie along the forearm's compass direction; as the forearm nears vertical that
    // direction stops meaning anything and they turn to the body's facing instead. Graded
    // (0.2 to 0.6 of horizontal reach), never a switch, so the hand cannot jump round.
    const hu=[u[0],0,u[2]],lu=len(hu); let hb=[fw[0],0,fw[2]]; hb=len(hb)<1e-3?[0,0,1]:nrm(hb);
    const wu=smooth(c01((lu-0.2)/0.4)); let h=lu<1e-3?hb:[hu[0]/lu*wu+hb[0]*(1-wu),0,hu[2]/lu*wu+hb[2]*(1-wu)];
    h=len(h)<1e-3?hb:nrm(h);
    const dy=Math.max(0,Math.min(1,(S0-ha[1])/6.1)),k=Math.sqrt(1-dy*dy);
    const c=cross(h,[0,1,0]);                              // palm down: t = -hs * (u x down), kept level
    flat={u:[h[0]*k,dy,h[2]*k],t:nrm([-hs*c[0],0,-hs*c[2]])};
    // the hand settles onto the surface over the first 4.5 units of contact instead of snapping
    // flat in one frame (a hand sweeping past the floor: arm sweeps with knee dip)
    kf=Math.max(lying,c01(over/4.5))*c01((S0+1.5-ha[1])/0.8);   // and fades out as the wrist sinks past the surface
    if(kf>=1) return out(flat.u,flat.t);
  }
  const perp=(v)=>{const d=v[0]*u[0]+v[1]*u[1]+v[2]*u[2];return [v[0]-u[0]*d,v[1]-u[1]*d,v[2]-u[2]*d];};
  // neutral reference from the FOREARM'S DIRECTION IN THE BODY'S FRAME (see above). It does not
  // use the elbow's bend plane: blending the two cancelled where they disagreed and the thumb
  // flipped in one frame (lateral reaches).
  const cu=cross(lat,u),pf=perp(fw),pu=perp(upb);
  let w=[cu[0]+0.3*pf[0]+0.3*pu[0],cu[1]+0.3*pf[1]+0.3*pu[1],cu[2]+0.3*pf[2]+0.3*pu[2]];
  if(len(w)<1e-3) w=perp([0,-1,0]); if(len(w)<1e-3) w=perp([1,0,0]); w=nrm(w);
  const tF=g?rotAxis(w,u,hs*R(g)):w;
  if(!flat) return out(u,tF);
  const e=smooth(kf),ub=nrm([u[0]+(flat.u[0]-u[0])*e,u[1]+(flat.u[1]-u[1])*e,u[2]+(flat.u[2]-u[2])*e]);
  // the thumb TURNS about the forearm from its free direction to its flat one (never a straight
  // blend of the two vectors, which collapses when they are opposite: a seated fold). The turn
  // goes the short way, except that anything past 150 deg the short way goes round by
  // PRONATION instead: a hand never supinates to lie flat.
  const pj=v=>{const d=v[0]*ub[0]+v[1]*ub[1]+v[2]*ub[2];const q=[v[0]-ub[0]*d,v[1]-ub[1]*d,v[2]-ub[2]*d];return len(q)<1e-3?null:nrm(q);};
  const a0=pj(tF),a1=pj(flat.t); if(!a0||!a1) return out(ub,a1||a0||flat.t);
  const cx=cross(a0,a1); let th=Math.atan2(cx[0]*ub[0]+cx[1]*ub[1]+cx[2]*ub[2],a0[0]*a1[0]+a0[1]*a1[1]+a0[2]*a1[2]);
  let tp=((hs*th)%(2*Math.PI)+2*Math.PI)%(2*Math.PI); if(tp>R(210)) tp-=2*Math.PI;
  return out(ub,rotAxis(a0,ub,hs*tp*e));
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
