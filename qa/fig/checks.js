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
//  heel       heel length is outside 10-30% of the foot, or the foot is not 10-13 units long
//  heelBack   in the foot's profile the back of the heel is more than 0.5 behind the shin's back edge
//  arch       the foot outline is not one simple convex shape (no arch notch: Will, 2026-11-13)
//  sole       the foot faces the wrong way for its contact: sole down when the shin stands on it,
//             TOP of the foot down when the shin lies along the floor (kneeling, prone), toes
//             tucked only for the movements in TUCKED
// floor / miss / pop are faults. The other five are judgement flags: each must be either fixed
// or waived with a reason in waivers.json.
const {N,FLOOR,sub,dot,len,nrm,cross,deg,angV:ang,sample}=require('./lib');
const SEG=[['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],['hpL','knL'],['knL','ftL'],['hpR','knR'],['knR','ftR']];
const HARD=['floor','miss','pop','supinated','thumb','palm','handPop','ankle','shinPast','sole','footShape','heel','heelBack','arch','outline','seam','order','pelvis','handWidth','handFloor'];
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
  // hands, every frame (added 2026-11-13 after Will saw thumbs turned inward on hanging arms).
  //  thumb    an arm hanging straight beside an upright body: neutral grip = thumb FORWARD and
  //           palm to the thigh; pronated grip (g >= 60) = thumb toward the midline. A palm
  //           facing forward is supinated and is reported as such.
  //  palm     a hand laid flat on the floor or a bench has its palm DOWN, and with the fingers
  //           pointing the way the body faces the thumb is on the inner side
  //  handPop  the thumb swings more than 45 deg about the forearm between two sampled phases,
  //           and more than 25 deg per unit of wrist travel (so it is a jump, not a fast turn)
  ['L','R'].forEach(s=>{
    const bad={};const note=(k,v,ph,msg)=>{if(!bad[k]||v>bad[k].v)bad[k]={v,ph,msg};};
    let prev=null;
    fr.forEach(f=>{const j=f.j,g=f.pose['g'+s]||0,h=E.handFrame(j,s,g,f.pose['p'+s]);
      const lat=nrm(sub(j.shR,j.shL)),upb=nrm(sub(j.chest,j.pelvis)),fw=cross(upb,lat),med=s==='L'?lat:lat.map(x=>-x);
      const fore=nrm(sub(j['ha'+s],j['el'+s])),elbow=ang(sub(j['sh'+s],j['el'+s]),sub(j['ha'+s],j['el'+s]));
      const flat=h.flat>=1;   // the engine laid it fully on a surface
      if(flat){
        if(h.palm[1]<0.9-Math.abs(h.u[1]))note('palm',1-h.palm[1],f.ph,`${s} hand lies on a surface with its palm not down (palm y ${h.palm[1].toFixed(2)})`);
        const hu=nrm([h.u[0],0,h.u[2]]),hf=nrm([fw[0]+upb[0],0,fw[2]+upb[2]]);
        if(Math.abs(lat[1])<0.5&&dot(hu,nrm([fw[0]+upb[0],0,fw[2]+upb[2]]))>0.5&&dot(h.t,med)<0.3)note('palm',1,f.ph,`${s} hand flat with fingers ahead but the thumb on the outer side`);
      }else if(elbow>165&&fore[1]>0.87&&-upb[1]>0.87){
        if(dot(h.palm,fw)>0.5)note('supinated',dot(h.palm,fw),f.ph,`${s} palm faces forward on a hanging arm (supinated)`);
        else if(g<20&&(dot(h.t,fw)<0.7||dot(h.palm,med)<0.6))note('thumb',1-dot(h.t,fw),f.ph,`${s} arm hangs in a neutral grip but the thumb is not forward (thumb.fwd ${dot(h.t,fw).toFixed(2)}, palm.thigh ${dot(h.palm,med).toFixed(2)})`);
        else if(g>=60&&dot(h.t,med)<0.6)note('thumb',1-dot(h.t,med),f.ph,`${s} arm hangs in a pronated grip but the thumb is not toward the midline (${dot(h.t,med).toFixed(2)})`);
      }
      // thumb swing about the forearm between neighbouring phases (the forearm's own motion removed)
      if(prev&&!flat&&!prev.flat){const d=dot(h.t,prev.u),tp=nrm([prev.t[0],prev.t[1],prev.t[2]]),du=dot(tp,h.u);
        const a1=nrm(sub(h.t,h.u.map(x=>x*0))),a0=nrm(sub(tp,h.u.map(x=>x*du)));const sw=ang(a1,a0);
        // a pop is a swing the hand's own travel does not explain: over 45 deg in one step AND
        // over 25 deg per unit the wrist moved (a hand leaving the floor fast may turn fast)
        const trav=len(sub(j['ha'+s],prev.ha));
        if(sw>45&&sw>25*trav)note('handPop',sw,f.ph,`${s} thumb swings ${sw.toFixed(0)} deg in one step while the wrist moves ${trav.toFixed(1)}`);}
      prev={u:h.u,t:h.t,flat,ha:j['ha'+s]};});
    for(const k in bad)add(k,'hand'+s,`${bad[k].msg} at ph ${bad[k].ph.toFixed(2)}`);
  });
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
    ['L','R'].forEach((sd,si)=>{let out=0,outPh=0,past=0,pastPh=0,bad=0,badPh=0,why='',xs=0,crossPh=0,turn=0,turnPh=0,archBad=0,heelBad='',heelBack=-9;
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
        if(l>0.5){const ux=dx/l,uy=dy/l;[-1,-0.5,0,0.5,1].forEach(t=>{const pt={x:A.x-uy*r*t,y:A.y+ux*r*t};   // the flat end of the shin, corner to corner
          if(!inside(pt,pl,0.12*sc)){const d=near(pt,pl);if(d>past){past=d;pastPh=f.ph;}}});}
        // 3. proportions and the arch, from the landmarks themselves
        const L=E.footLandmarks(f.j,sd,k),F=L.F,al=p=>dot(sub(p,F.ft),F.f),hh=p=>dot(sub(p,F.ft),F.n),ww=p=>dot(sub(p,F.ft),cross(F.f,F.n))*(sd==='L'?1:-1);
        // the heel landmarks follow the shin's line down (engine: sheared by L.lean); measure the
        // foot's own proportions with that shear taken out
        const un=q=>/^heel/.test(q.id)?al(q.p)+hh(q.p)*L.lean:al(q.p);
        const rear=Math.min(...L.pts.map(q=>un(q)-q.r)),front=Math.max(...L.pts.map(q=>al(q.p)+q.r)),ratio=-rear/(front-rear);
        // foot 12.3 long (0.152 of stature); the heel is a small share of it BY DECISION: its back is
        // flush with the shin (Will, 2026-11-12), so all the length is in front of the ankle
        // (measured with the toes straight: on a heel-up foot they bend flat at the ball, and the
        // length along the foot's own line stops meaning anything)
        const tb=L.pts.find(q=>q.id==='toe2'),mb=L.pts.find(q=>q.id==='mtp1'),tv=sub(tb.p,mb.p),tm=dot(tv,L.med),toesStraight=dot(nrm([tv[0]-L.med[0]*tm,tv[1]-L.med[1]*tm,tv[2]-L.med[2]*tm]),F.f)>0.992;   // in the foot's side plane
        if(toesStraight&&(ratio<0.08||ratio>0.30||front-rear<11.8||front-rear>13.0))heelBad=`heel is ${(100*ratio).toFixed(0)}% of a foot ${(front-rear).toFixed(1)} long`;
        // heel flush with the shin: measured in the foot's own profile (along the foot, behind the ankle),
        // the back of the heel may reach at most half a unit behind the shin's back edge
        const hbk=Math.max(...L.pts.filter(q=>/^heel|^ach/.test(q.id)).map(q=>-(un(q)-q.r)))-L.tip;
        if(hbk>heelBack)heelBack=hbk;
        // and against the ACTUAL shin whenever it stands within 15 deg of square on the foot: heel
        // landmarks, in the foot's side plane, measured square to the shin axis, behind it
        {const us=nrm(sub(F.ft,f.j['kn'+sd]));if(Math.abs(dot(F.f,us))<0.26){for(const q of L.pts.filter(q=>/^heel/.test(q.id))){let v=sub(q.p,F.ft);const dm=dot(v,L.med);v=[v[0]-L.med[0]*dm,v[1]-L.med[1]*dm,v[2]-L.med[2]*dm];
          const d=dot(v,us),pp=[v[0]-us[0]*d,v[1]-us[1]*d,v[2]-us[2]*d];if(dot(pp,F.f)<0){const ex=Math.hypot(pp[0],pp[1],pp[2])+q.r-L.tip;if(ex>heelBack)heelBack=ex;}}}}
        // one simple shape (Will, 2026-11-13: drop the arch): the outline is convex everywhere, so it
        // is the same from the inner and the outer side; the big-toe joint is still medial
        {const g=id=>L.pts.find(q=>q.id===id);let cv=true,sg=0;for(let a=0;a<n0;a++){const p0=pl[a],p1=pl[(a+1)%n0],p2=pl[(a+2)%n0],c=(p1.x-p0.x)*(p2.y-p1.y)-(p1.y-p0.y)*(p2.x-p1.x);
            if(Math.abs(c)<1e-4*sc*sc)continue;if(!sg)sg=Math.sign(c);else if(Math.sign(c)!==sg){cv=false;break;}}
          if(!cv||!(ww(g('mtp1').p)>0&&ww(g('mtp5').p)<0))archBad++;}
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
      if(past>0.05*sc)add('shinPast',sd,`the ${nm} shin's flat end pokes ${past.toFixed(2)} screen units out of the foot at ph ${pastPh.toFixed(2)}`);
      if(heelBad)add('heel',sd,`${nm} foot: ${heelBad}`);
      if(heelBack>0.5)add('heelBack',sd,`${nm} foot: the back of the heel is ${heelBack.toFixed(2)} behind the back edge of the shin in profile (limit 0.5)`);
      if(archBad)add('arch',sd,`${nm} foot: the outline is not one simple convex shape (an arch notch), or the big-toe joint is not medial, in ${archBad} of ${N} frames`);
      if(bad)add('sole',sd,`${nm} foot: ${why} (${bad} of ${N} frames, first at ph ${badPh.toFixed(2)})`);});}
  // ---- the ink figure's own rules (eng2.js inkFigure), every frame. Added 2026-11-13 after Will
  // found on his phone: outlines that differed by side, cream caps at knees and elbows, stacking
  // that flickered, a pelvis corner poking past the hips, a hand collapsing to a line, and hands
  // pointing backward in cat-cows.
  //  outline    left and right limbs are drawn by the same layers with the same outline; the left
  //             adds only its paper fill and hatch lines inside
  //  seam       no ink crosses a limb at the elbow, knee, wrist or ankle: the paper shape inside
  //             the outline is continuous through every joint
  //  order      the stacking order of two parts changes only when their depth difference where
  //             they overlap is clear (INKR.HYS), and at most 4 times a cycle
  //  pelvis     the trunk's base corners are the hip joints and each thigh's root is inside the
  //             pelvis corner, so nothing pokes out in a fold
  //  handWidth  the hand beyond the wrist is never thinner than 1.7 units on screen (the wrist is 2.3)
  //  handFloor  a hand flat on the floor: palm down, fingers AHEAD (away from the pelvis along the
  //             body) unless the forearm itself lies on the floor, nothing below the ground line
  if(E.inkGeom){const sc=m.fit.sc,I=E.INKR,bad={};const note=(k,id,v,ph,msg)=>{const q=k+'|'+id;if(!bad[q]||v>bad[q].v)bad[q]={k,id,v,ph,msg};};
    const dPoly=(p,pl)=>Math.min(...pl.map((c,i)=>dSeg2(p,c,pl[(i+1)%pl.length])));
    const sig=g=>g.replace(/ d="[^"]*"/g,'');
    fr.forEach((f,fi)=>{const G=E.inkGeom(m,m.fit,f.ph);
      if(fi%8===0){const mk=E.inkFigure(m,m.fit,f.ph,null,{id:'q',hatch:true}),grp=k=>{const a=mk.indexOf('<g data-p="'+k+'">');return a<0?'':mk.slice(a,mk.indexOf('</g>',a));};
        [['AL','AR'],['LL','LR']].forEach(([l,r])=>{const gl=grp(l).split('<path').slice(1),gr=grp(r).split('<path').slice(1);
          // right: gap + ink. left: the same two, then paper and (when hatched) lines, neither with an outline of its own
          if(gr.length!==2||gl.length<3||gl.length>4||sig(gl[0])!==sig(gr[0])||sig(gl[1])!==sig(gr[1]))note('outline',l,1,f.ph,`${l} and ${r} are not drawn by the same outline layers`);
          if(/stroke=/.test(gl[1]||'')||/stroke=/.test(gr[1]||'')||/stroke=/.test(gl[2]||''))note('outline',l,1,f.ph,`a limb shape in ${l}/${r} carries a stroke of its own`);});}
      for(const k in G.limbs){const Lm=G.limbs[k],F=Lm.full,N=Lm.ins;
        // outline width: every point of the inset hand/foot is OW inside the full one, both sides
        const gap=N.e.map(p=>dPoly(p,F.e)),g0=Math.min(...gap),g1=Math.max(...gap);
        if(g0<I.OW-0.2||g1>I.OW+0.3)note('outline',k,Math.abs(g1-I.OW),f.ph,`${k} hand/foot outline is ${g0.toFixed(2)} to ${g1.toFixed(2)} wide (rule ${I.OW})`);
        if(Math.abs((F.c1.r0-N.c1.r0)-I.OW)>0.02&&N.c1.r0>0.06)note('outline',k,1,f.ph,`${k} limb outline is not ${I.OW}`);
        // seams: walk the centre line through both joints; it must stay inside the paper shapes
        const polys=[N.c1.pts,N.c2.pts,N.e],ins=p=>polys.some(pl=>inPoly(p,pl));
        const walk=(a,b,c,nm,far)=>{for(let t=-1;t<=1.001;t+=0.1){const o=t<0?a:c,u=Math.abs(t),q=Math.min(1,(t<0?2:(far||2))*sc/(Math.hypot(o.x-b.x,o.y-b.y)||1));const p={x:b.x+(o.x-b.x)*u*q,y:b.y+(o.y-b.y)*u*q};
          if(!ins(p)){note('seam',k+':'+nm,1,f.ph,`ink crosses the ${k} limb at the ${nm}`);return;}}};
        walk(Lm.A,Lm.B,Lm.C,Lm.arm?'elbow':'knee');
        if(Lm.ax)walk(Lm.B,Lm.C,{x:Lm.C.x+Lm.ax.x*3*sc,y:Lm.C.y+Lm.ax.y*3*sc},Lm.arm?'wrist':'ankle',0.8);   // 0.8: a hand or foot seen end-on is short on screen
        if(!Lm.arm){const hp=k==='LL'?G.trunk.hpL:G.trunk.hpR;if(F.c1.r0>G.trunk.rp+1e-6||Math.hypot(Lm.A.x-hp.x,Lm.A.y-hp.y)>1e-6)note('pelvis',k,1,f.ph,`the ${k} thigh root (r ${(F.c1.r0/sc).toFixed(2)}) is not inside the pelvis corner (r ${I.RP})`);}
        else{const s=k[1],nm=s==='L'?'left':'right',H=E.handLandmarks(f.j,s,f.pose['g'+s],{fist:m._held&&m._held[s],surf:f.pose['p'+s]},Lm.k2);
          const hl=E.hullLoop(H.pts.filter(q=>q.id!=='wrist'),G.pr,sc,0,40);let w=1e9;
          for(let a=0;a<12;a++){const cx=Math.cos(a*Math.PI/12),cy=Math.sin(a*Math.PI/12),v=hl.map(p=>p.x*cx+p.y*cy);w=Math.min(w,Math.max(...v)-Math.min(...v));}
          if(w<1.7*sc)note('handWidth',s,1.7-w/sc,f.ph,`the ${nm} hand is only ${(w/sc).toFixed(2)} wide on screen (min 1.7)`);
          const S0=f.pose['p'+s]==null?FLOOR:f.pose['p'+s],h=H.F;
          if(h.flat>=0.25){const low=Math.max(...H.pts.map(q=>q.p[1]+q.r))-S0;if(low>1.7)note('handFloor',s+':dip',low,f.ph,`the ${nm} hand dips ${low.toFixed(2)} below the surface it rests on (ground line at 1.7)`);}
          if(h.flat>=1){const j=f.j,lat=nrm(sub(j.shR,j.shL));let v=sub(j['ha'+s],j.pelvis);const dl=dot(v,lat);v=[v[0]-lat[0]*dl,0,v[2]-lat[2]*dl];
            const fore=Math.abs(j['el'+s][1]-S0)<2.6;
            if(h.palm[1]<0.85)note('handFloor',s+':palm',1,f.ph,`the ${nm} hand lies flat with its palm not down`);
            if(!fore&&len(v)>8&&dot(nrm([h.u[0],0,h.u[2]]),nrm(v))<0.8)note('handFloor',s+':fingers',1,f.ph,`the ${nm} hand is flat on the floor ahead of the pelvis but its fingers do not point ahead`);}}
      }
      const T=G.trunk,n=T.torso.length/2;
      if(Math.hypot(T.torso[n-1].x-T.hpL.x,T.torso[n-1].y-T.hpL.y)>1e-6||Math.hypot(T.torso[n].x-T.hpR.x,T.torso[n].y-T.hpR.y)>1e-6)note('pelvis','T',1,f.ph,'the trunk does not end at the hip joints');
      // a held implement is never drawn under the trunk
      if(m.prop){const mk=E.inkFigure(m,m.fit,f.ph,null,{id:'q',hatch:false}),iT=mk.indexOf('data-p="T"'),iP=mk.indexOf('data-p="P"');if(iP>=0&&iP<iT)note('order','prop',1,f.ph,'a held implement is drawn under the trunk');}
    });
    E.setCam(m);const S=E.inkSchedule(m),NS=S.length;
    for(const id in S[0].rel){let fl=0;for(let i=0;i<NS;i++){const a=S[(i+NS-1)%NS],b=S[i];
      if(a.rel[id]!==b.rel[id]){fl++;if(Math.abs(b.score[id])<I.HYS)note('order',id,1,i/NS,`${id} swap places with a depth difference of only ${b.score[id].toFixed(2)} (needs ${I.HYS})`);}}
      if(fl>4)note('order',id+':n',fl,0,`${id} swap places ${fl} times in one cycle`);}
    for(const q in bad)add(bad[q].k,bad[q].id,`${bad[q].msg} at ph ${bad[q].ph.toFixed(2)}`);
  }
  for(const k in fr[0].j){const st=fr.map((f,i)=>len(sub(fr[(i+1)%N].j[k],f.j[k])));
    const nz=st.filter(x=>x>1e-3).sort((x,y)=>x-y); if(!nz.length)continue; const med=nz[nz.length>>1];
    const mx=Math.max(...st), at=st.indexOf(mx);
    // a pop is a discontinuity, not speed: the step must also dwarf both of its neighbours
    const nb=Math.max(st[(at+N-1)%N],st[(at+1)%N]);
    if(mx>2.5&&mx>5*med&&mx>2.5*nb)add('pop',k,`${k} jumps ${mx.toFixed(1)} in one 1/64 step at ph ${fr[at].ph.toFixed(2)} (median step ${med.toFixed(2)})`);}
  return {flags:F,scale:m.fit.sc,C};
}
module.exports={audit,HARD};
