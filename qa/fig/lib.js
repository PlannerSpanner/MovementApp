// Shared geometry for the figure checks. World frame: y DOWN, floor at y=93, the figure is
// about 80 units tall (1 unit ~ 2.2 cm). Every movement is sampled at N phases of one cycle.
const N=64, FLOOR=93;
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];
const len=v=>Math.hypot(v[0],v[1],v[2]), nrm=v=>{const n=len(v)||1;return v.map(x=>x/n);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const deg=r=>r*180/Math.PI, rad=d=>d*Math.PI/180;
const angV=(a,b)=>deg(Math.acos(Math.max(-1,Math.min(1,dot(nrm(a),nrm(b))))));
const dist=(a,b)=>len(sub(a,b));
const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const rotY=(v,d)=>{const c=Math.cos(rad(d)),s=Math.sin(rad(d));return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];};
const UP=[0,-1,0];

// One movement, sampled. Every helper takes a frame f (or uses all frames).
function sample(E,m,n=N){
  E.setCam(m);
  const F=[]; for(let i=0;i<n;i++){const ph=i/n,pose=E.poseAt(m,ph),j=E.solve(pose);F.push({ph,pose,j,i});}
  const C={E,m,F,n};
  C.at=ph=>F[Math.round((((ph%1)+1)%1)*n)%n];
  C.J=(f,k)=>Array.isArray(k)?k:(k.includes('+')?mid(f.j[k.split('+')[0]],f.j[k.split('+')[1]]):f.j[k]);
  C.ang=(f,a,b,c)=>angV(sub(C.J(f,a),C.J(f,b)),sub(C.J(f,c),C.J(f,b)));          // joint angle at b
  C.gap=(f,k)=>FLOOR-C.J(f,k)[1];                                                 // height above the floor
  C.tilt=(f,a,b)=>{const t=angV(sub(C.J(f,b),C.J(f,a)),UP);return Math.min(t,180-t);};  // segment vs vertical, 0..90
  C.pitch=(f,a,b)=>angV(sub(C.J(f,b),C.J(f,a)),UP);                               // directed: 0 = b straight above a
  C.fwd=f=>rotY([0,0,1],f.pose.yaw||0);                                           // the body's facing (horizontal)
  C.lat=f=>nrm(sub(f.j.hpR,f.j.hpL));                                             // toward the figure's right hip
  C.axis=f=>nrm(sub(f.j.neck,f.j.pelvis));                                        // pelvis -> neck
  C.along=(f,k,o,ax)=>dot(sub(C.J(f,k),C.J(f,o)),ax);                             // offset of k from o along an axis
  C.horiz=(f,a,b)=>{const d=sub(C.J(f,a),C.J(f,b));return Math.hypot(d[0],d[2]);};// horizontal distance
  C.drift=k=>Math.max(...F.map(f=>dist(C.J(f,k),C.J(F[0],k))));                   // max travel from frame 0
  C.range=fn=>{const v=F.map(fn);return Math.max(...v)-Math.min(...v);};
  C.max=fn=>Math.max(...F.map(fn)); C.min=fn=>Math.min(...F.map(fn));
  C.argmax=fn=>F.reduce((b,f)=>fn(f)>fn(b)?f:b,F[0]); C.argmin=fn=>F.reduce((b,f)=>fn(f)<fn(b)?f:b,F[0]);
  C.scr=(f,k)=>{const q=E.project(C.J(f,k));return {x:q.x*m.fit.sc+m.fit.ox,y:q.y*m.fit.sc+m.fit.oy,d:q.d};};
  C.sdist=(f,a,b)=>{const A=C.scr(f,a),B=C.scr(f,b);return Math.hypot(A.x-B.x,A.y-B.y);};
  C.props=f=>E.propShapes(m,f.j,f.pose);
  return C;
}
// assertion helpers: each returns true, or a string saying what was measured
const ok=(cond,msg)=>cond?true:msg;
const all=(C,fn)=>{for(const f of C.F){const r=fn(f);if(r!==true)return `ph ${f.ph.toFixed(2)}: ${r}`;}return true;};
const some=(C,fn,what)=>C.F.some(f=>fn(f)===true)?true:(what||'no frame satisfies it');
const f1=x=>x.toFixed(1);
module.exports={N,FLOOR,sub,dot,add,len,nrm,cross,deg,rad,angV,dist,mid,rotY,UP,sample,ok,all,some,f1};
