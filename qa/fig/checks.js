// Numeric audit of every in-scope movement, on the real engine + data, 64 phases each.
// Flags (engine units; the figure is ~80 tall, 1 unit ~ 2.2 cm):
//  floor      a joint below the floor plane (y > 93.6)
//  miss       an IK hand/foot target the limb cannot reach (effector > 0.5 from its target)
//  pop        a joint that jumps: one 1/64 step > 2.5 units, more than 5x its own median step and
//             more than 2.5x both neighbouring steps (fast but smooth motion is not a pop)
//  kneeBack   knee bending the wrong way relative to the pelvis' own front
//  hyperExt   hip extended more than 35 deg behind the trunk line
//  hidden     a limb segment behind the torso and fully covered by it for 1/8 of the cycle or more
//  merged     left and right of the same limb drawn on top of each other for 1/4 of the cycle or more
//  short      a limb that MOVES during the cycle but is foreshortened below 35% of its length
// floor / miss / pop are faults. The other five are judgement flags: each must be either fixed
// or waived with a reason in waivers.json.
const {N,FLOOR,sub,dot,len,nrm,cross,deg,angV:ang,sample}=require('./lib');
const SEG=[['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],['hpL','knL'],['knL','ftL'],['hpR','knR'],['knR','ftR']];
const HARD=['floor','miss','pop'];
const inPoly=(p,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j]; if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;};
function audit(E,m){
  const C=sample(E,m), fr=C.F, F=[]; const add=(k,id,msg)=>F.push({k,id:k+':'+id,msg});
  const worst=(fn)=>{let b=null;fr.forEach(f=>{const v=fn(f);if(v!=null&&(b==null||v.v>b.v))b=Object.assign({ph:f.ph},v);});return b;};
  const fl={};fr.forEach(f=>{for(const k in f.j){const d=f.j[k][1]-FLOOR;if(d>0.6&&(!fl[k]||d>fl[k].d))fl[k]={d,ph:f.ph};}});
  for(const k in fl)add('floor',k,`${k} ${fl[k].d.toFixed(1)} below the floor at ph ${fl[k].ph.toFixed(2)}`);
  [['ikL','haL'],['ikR','haR'],['ikFL','ftL'],['ikFR','ftR']].forEach(([t,jn])=>{
    const w=worst(f=>{let T=f.pose[t];if(!T)return null;T=Array.isArray(T)?T:(T.w||f.j[T.k]);if(!T)return null;
      return {v:len(sub(f.j[jn],T))};});
    if(w&&w.v>0.5)add('miss',jn,`${jn} misses its ${t} target by ${w.v.toFixed(1)} at ph ${w.ph.toFixed(2)} (limb too short for the pose)`);});
  ['L','R'].forEach(s=>{
    const kb=worst(f=>{const j=f.j,lat=nrm(sub(j.hpR,j.hpL));
      const th=sub(j['kn'+s],j['hp'+s]),shn=sub(j['ft'+s],j['kn'+s]);
      const knee=180-ang(th,shn); if(knee>172)return null;
      const sgn=dot(cross(th,shn),lat); return sgn>0.15*len(th)*len(shn)?{v:180-knee}:null;});
    if(kb)add('kneeBack',s,`kn${s} flexed ${kb.v.toFixed(0)} deg with the bend plane reversed at ph ${kb.ph.toFixed(2)}`);
    const hx=worst(f=>{const j=f.j,up=nrm(sub(j.chest,j.pelvis)),lat=nrm(sub(j.hpR,j.hpL)),fw=nrm(cross(up,lat));
      const th=nrm(sub(j['kn'+s],j['hp'+s]));
      const ext=deg(Math.atan2(-dot(th,fw),-dot(th,up))); return ext>35?{v:ext}:null;});
    if(hx)add('hyperExt',s,`hp${s} extended ${hx.v.toFixed(0)} deg behind the trunk line at ph ${hx.ph.toFixed(2)} (anatomical limit ~20-30)`);
  });
  const scr=(f,k)=>C.scr(f,k);
  SEG.forEach(([a,b])=>{
    const hid=fr.filter(f=>{const T=['shL','shR','hpR','hpL'].map(k=>scr(f,k)),A=scr(f,a),B=scr(f,b),M={x:(A.x+B.x)/2,y:(A.y+B.y)/2};
      const td=T.reduce((s,p)=>s+p.d,0)/4; return inPoly(B,T)&&inPoly(M,T)&&(A.d+B.d)/2<td;});
    if(hid.length>=N/8)add('hidden',a+'-'+b,`${a}-${b} is behind the torso and fully covered for ${(100*hid.length/N).toFixed(0)}% of the cycle (first at ph ${hid[0].ph.toFixed(2)})`);
    const d0=nrm(sub(fr[0].j[b],fr[0].j[a])); let sweep=0; fr.forEach(f=>{sweep=Math.max(sweep,ang(d0,sub(f.j[b],f.j[a])));});
    if(sweep>25){const w=worst(f=>{const A=scr(f,a),B=scr(f,b),tl=len(sub(f.j[b],f.j[a]))*m.fit.sc;return {v:1-Math.hypot(A.x-B.x,A.y-B.y)/tl};});
      if(w.v>0.65)add('short',a+'-'+b,`${a}-${b} sweeps ${sweep.toFixed(0)} deg but is foreshortened to ${(100*(1-w.v)).toFixed(0)}% of its length at ph ${w.ph.toFixed(2)}`);}
  });
  [['elL','haL','elR','haR','arms'],['knL','ftL','knR','ftR','legs']].forEach(([b,c,e,g,nm])=>{
    const mg=fr.filter(f=>[[b,e],[c,g]].every(([p,q])=>{const P=scr(f,p),Q=scr(f,q);return Math.hypot(P.x-Q.x,P.y-Q.y)<1.6*m.fit.sc;}));
    if(mg.length>=N/4)add('merged',nm,`left and right ${nm} are drawn on top of each other for ${(100*mg.length/N).toFixed(0)}% of the cycle`);});
  for(const k in fr[0].j){const st=fr.map((f,i)=>len(sub(fr[(i+1)%N].j[k],f.j[k])));
    const nz=st.filter(x=>x>1e-3).sort((x,y)=>x-y); if(!nz.length)continue; const med=nz[nz.length>>1];
    const mx=Math.max(...st), at=st.indexOf(mx);
    // a pop is a discontinuity, not speed: the step must also dwarf both of its neighbours
    const nb=Math.max(st[(at+N-1)%N],st[(at+1)%N]);
    if(mx>2.5&&mx>5*med&&mx>2.5*nb)add('pop',k,`${k} jumps ${mx.toFixed(1)} in one 1/64 step at ph ${fr[at].ph.toFixed(2)} (median step ${med.toFixed(2)})`);}
  return {flags:F,scale:m.fit.sc,C};
}
module.exports={audit,HARD};
