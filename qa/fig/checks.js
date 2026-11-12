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
// With a figure skin (feet are drawn shapes), three more, added after Will found on his phone what
// the audit and a reviewer had both passed (2026-11-12):
//  ankle      the ankle joint is outside the drawn foot outline in some frame
//  shinPast   the end of the shin stroke pokes out past the foot outline
//  footShape  the foot outline crosses itself, or has a corner sharper than TURN_LIMIT
//  heel       heel length is outside 18-30% of the foot, or the foot is not 11-13 units long
//  arch       the raised arch is not on the medial (big-toe) side of that foot
//  sole       the foot faces the wrong way for its contact: sole down when the shin stands on it,
//             TOP of the foot down when the shin lies along the floor (kneeling, prone), toes
//             tucked only for the movements in TUCKED
// floor / miss / pop are faults. The other five are judgement flags: each must be either fixed
// or waived with a reason in waivers.json.
const {N,FLOOR,sub,dot,len,nrm,cross,deg,angV:ang,sample}=require('./lib');
const SEG=[['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],['hpL','knL'],['knL','ftL'],['hpR','knR'],['knR','ftR']];
const HARD=['floor','miss','pop','supinated','ankle','shinPast','sole','footShape','heel','arch'];
// sharpest corner allowed anywhere on a foot outline, in degrees of turning between two edges
const TURN_LIMIT=50;
// feet whose toes are tucked under (ball on the floor, heel up) while the shin is near the floor
const TUCKED=['Plank hold','Reverse lunges','Split squat','Chest-supported row'];
// floor poses where the shins lie on their sides, so neither sole-down nor top-down applies
const SIDEWAYS=['90/90 with a fold'];
const dSeg2=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1e-9,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l2));return Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y);};
const inPoly=(p,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j]; if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;};
function audit(E,m){
  const C=sample(E,m), fr=C.F, F=[]; const add=(k,id,msg)=>F.push({k,id:k+':'+id,msg});
  const worst=(fn)=>{let b=null;fr.forEach(f=>{const v=fn(f);if(v!=null&&(b==null||v.v>b.v))b=Object.assign({ph:f.ph},v);});return b;};
  const fl={};fr.forEach(f=>{for(const k in f.j){const d=f.j[k][1]-FLOOR;if(d>0.6&&(!fl[k]||d>fl[k].d))fl[k]={d,ph:f.ph};}});
  // grip: a supinated (palm-up, underhand) grip must never be shown (Will's distal bicep rule)
  {let w=0,wp=0;fr.forEach(f=>['gL','gR'].forEach(k=>{const g=f.pose[k]||0;if(g<w){w=g;wp=f.ph;}}));if(w<-10)add('supinated','grip',`a hand is turned ${(-w).toFixed(0)} deg toward supination at ph ${wp.toFixed(2)}`);}
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
  if(E.getSkin&&E.getSkin()){const sc=m.fit.sc;
    const sp=v=>{const q=E.project(v);return {x:q.x*sc+m.fit.ox,y:q.y*sc+m.fit.oy,d:q.d};};
    const near=(p,pl)=>Math.min(...pl.map((c,i)=>dSeg2(p,c,pl[(i+1)%pl.length])));
    const inside=(p,pl,g)=>inPoly(p,pl)||near(p,pl)<g;
    const segX=(a,b,c,d)=>{const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);const d1=o(a,b,c),d2=o(a,b,d),d3=o(c,d,a),d4=o(c,d,b);return d1*d2<-1e-9&&d3*d4<-1e-9;};
    ['L','R'].forEach((sd,si)=>{let out=0,outPh=0,past=0,pastPh=0,bad=0,badPh=0,why='',xs=0,crossPh=0,turn=0,turnPh=0,archBad=0,heelBad='';
      fr.forEach(f=>{const od=si?'L':'R',dS=(E.project(f.j['kn'+sd]).d+E.project(f.j['ft'+sd]).d)/2,dO=(E.project(f.j['kn'+od]).d+E.project(f.j['ft'+od]).d)/2,k=E.farK(dS,dO);
        const pl=E.footOutline(f.j,sd,sp,sc,k),A=sp(f.j['ft'+sd]),K=sp(f.j['kn'+sd]),n0=pl.length;
        // 1. a simple shape: no self-crossing, no corner sharper than the turning limit
        let x=false;for(let a=0;a<n0&&!x;a++)for(let b=a+2;b<n0;b++){if(a===0&&b===n0-1)continue;if(segX(pl[a],pl[(a+1)%n0],pl[b],pl[(b+1)%n0])){x=true;break;}}
        if(x){if(!xs)crossPh=f.ph;xs++;}
        for(let a=0;a<n0;a++){const p0=pl[(a+n0-1)%n0],p1=pl[a],p2=pl[(a+1)%n0],l1=Math.hypot(p1.x-p0.x,p1.y-p0.y),l2=Math.hypot(p2.x-p1.x,p2.y-p1.y);
          if(l1<0.02*sc||l2<0.02*sc)continue;const t=ang([p1.x-p0.x,p1.y-p0.y,0],[p2.x-p1.x,p2.y-p1.y,0]);if(t>turn){turn=t;turnPh=f.ph;}}
        // 2. the ankle and the whole end of the shin stroke, cap included, are inside the foot
        if(!inside(A,pl,0)){if(!out)outPh=f.ph;out++;}
        const dx=A.x-K.x,dy=A.y-K.y,l=Math.hypot(dx,dy),r=E.limbHalf('shin',1,k)*sc;
        if(l>0.5){const ux=dx/l,uy=dy/l;for(let a=-180;a<180;a+=15){const c=Math.cos(a*Math.PI/180),s2=Math.sin(a*Math.PI/180);
          const pt={x:A.x+r*(ux*c-uy*s2),y:A.y+r*(ux*s2+uy*c)};
          if((pt.x-A.x)*ux+(pt.y-A.y)*uy<-0.02*r)continue;              // the half of the cap that is shin body, not end
          if(!inside(pt,pl,0.12*sc)){const d=near(pt,pl);if(d>past){past=d;pastPh=f.ph;}}}}
        // 3. proportions and the arch, from the landmarks themselves
        const L=E.footLandmarks(f.j,sd,k),F=L.F,al=p=>dot(sub(p,F.ft),F.f),hh=p=>dot(sub(p,F.ft),F.n),ww=p=>dot(sub(p,F.ft),cross(F.f,F.n))*(sd==='L'?1:-1);
        const rear=Math.min(...L.pts.map(q=>al(q.p)-q.r)),front=Math.max(...L.pts.map(q=>al(q.p)+q.r)),ratio=-rear/(front-rear);
        if(ratio<0.18||ratio>0.30||front-rear<11||front-rear>13)heelBad=`heel is ${(100*ratio).toFixed(0)}% of a foot ${(front-rear).toFixed(1)} long`;
        const g=id=>L.pts.find(q=>q.id===id),aT=g('archT'),eL=g('edgeL');
        if(!(ww(aT.p)>0.5&&ww(eL.p)<-0.5&&ww(g('mtp1').p)>0&&ww(g('mtp5').p)<0&&(hh(aT.p)-aT.r)-(hh(eL.p)-eL.r)>0.5))archBad++;
        // 4. contact type
        const ft=f.j['ft'+sd],kn=f.j['kn'+sd],gap=FLOOR-ft[1];
        if(gap<3.2&&!(f.pose.roll)&&!SIDEWAYS.includes(m.n)){const n=F.n,sh=sub(kn,ft),tilt=ang(sh,[0,-1,0]);
          let w='';
          if(tilt<55){if(n[1]>-0.4)w='shin stands on the foot but the sole is not down';
            else if(gap<0.8&&F.f[1]<-0.2)w='the heel is planted but the toes are in the air';}
          else if(tilt>=62){if(TUCKED.includes(m.n)){if(n[1]>0.5)w='toes should be tucked but the top of the foot is down';}
            else if(n[1]<0.5)w='shin lies along the floor but the top of the foot is not down (sole should face up)';}
          if(w){if(!bad){badPh=f.ph;why=w;}bad++;}}
      });
      const nm=sd==='L'?'left':'right';
      if(xs)add('footShape',sd+':cross',`the ${nm} foot outline crosses itself in ${xs} of ${N} frames (first at ph ${crossPh.toFixed(2)})`);
      if(turn>TURN_LIMIT)add('footShape',sd+':corner',`the ${nm} foot outline has a ${turn.toFixed(0)} deg corner at ph ${turnPh.toFixed(2)} (limit ${TURN_LIMIT})`);
      if(out)add('ankle',sd,`ft${sd} is outside its foot outline in ${out} of ${N} frames (first at ph ${outPh.toFixed(2)})`);
      if(past>0.05*sc)add('shinPast',sd,`the ${nm} shin end, cap included, pokes ${past.toFixed(2)} screen units out of the foot at ph ${pastPh.toFixed(2)}`);
      if(heelBad)add('heel',sd,`${nm} foot: ${heelBad} (published: heel about a quarter of a 12-unit foot)`);
      if(archBad)add('arch',sd,`${nm} foot: the raised arch is not on the medial (big-toe) side, or the outer edge is not low, in ${archBad} of ${N} frames`);
      if(bad)add('sole',sd,`${nm} foot: ${why} (${bad} of ${N} frames, first at ph ${badPh.toFixed(2)})`);});}
  for(const k in fr[0].j){const st=fr.map((f,i)=>len(sub(fr[(i+1)%N].j[k],f.j[k])));
    const nz=st.filter(x=>x>1e-3).sort((x,y)=>x-y); if(!nz.length)continue; const med=nz[nz.length>>1];
    const mx=Math.max(...st), at=st.indexOf(mx);
    // a pop is a discontinuity, not speed: the step must also dwarf both of its neighbours
    const nb=Math.max(st[(at+N-1)%N],st[(at+1)%N]);
    if(mx>2.5&&mx>5*med&&mx>2.5*nb)add('pop',k,`${k} jumps ${mx.toFixed(1)} in one 1/64 step at ph ${fr[at].ph.toFixed(2)} (median step ${med.toFixed(2)})`);}
  return {flags:F,scale:m.fit.sc,C};
}
module.exports={audit,HARD};
