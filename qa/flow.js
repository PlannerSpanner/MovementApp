// Morning Flow form invariants, checked against the BUILT page (research-anchored; see
// docs/movement-reference.md). Engine: spine `bend` never moves a joint and renders a
// curved torso only when non-zero. Poses: cat-cows round/arch, cobra arches, bent
// rotation sweeps meet both hands on the floor between rotations, hip circles alternate
// legs from the floor, chest opener swings travel behind the frontal plane, lateral
// reaches arc sideways. Timing: 15s ground gap, cobra 40s, session exactly 805s.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(ROOT,'morning-flow.html'),'utf8');
const js=h.split('<script>')[1].split('</script>')[0];
const core=js.slice(0,js.indexOf('const layer=document.getElementById'));
const {MOVES,solve,poseAt,figMarkup,fitOf,project,rotY,sub}=
  new Function(core+'\nreturn {MOVES,solve,poseAt,figMarkup,fitOf,project,rotY,sub};')();
// dirOnly lives below the DOM marker; it is a one-liner, so read it from the page source
const dirOnlySrc=(js.match(/const dirOnly=([^;]*);/)||[])[1];
const dirOnly=dirOnlySrc?new Function('return '+dirOnlySrc)():()=>false;
let fail=false;
const check=(name,ok)=>{console.log(`${name.padEnd(62)} ${ok?'ok':'FAIL'}`);if(!ok)fail=true;};
const get=n=>{const m=MOVES.find(m=>m.n===n);if(!m)throw new Error('no movement '+n);return m;};
const PH=[...Array(25)].map((_,i)=>i/24);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const FL=93;

// ---- engine: bend ----
// 1. zero bend: the torso is the legacy 4-point polygon, byte-identical markup
{const m=get('Bouncing in place'),fit=fitOf(m);
 const mk=figMarkup(m,fit,0.3);
 check('bend 0 renders the legacy torso polygon',/<polygon points="[^"]*" fill="/.test(mk)&&!/<path /.test(mk));
 const jA=solve(Object.assign({},m.A,{bend:0})),jB=solve(Object.assign({},m.A));
 check('bend 0 and bend absent solve identically',Object.keys(jB).every(k=>dist(jA[k],jB[k])<1e-9));}
// 2. non-zero bend never moves a joint
{const m=get('Cat-cows');let moved=0,seen=false;
 for(const ph of PH){const p=poseAt(m,ph);if(Math.abs(p.bend||0)>1)seen=true;
   const a=solve(p),b=solve(Object.assign({},p,{bend:0}));
   for(const k of Object.keys(a))moved=Math.max(moved,dist(a[k],b[k]));}
 check(`bend never moves a joint (max ${moved.toFixed(4)})`,seen&&moved<1e-9);}
// 3. flexion bows the torso toward the back (away from the belly), extension toward the front
{const m=get('Cat-cows'),fit=fitOf(m);
 // the left torso edge's mid sample vs the straight hip->shoulder chord, in screen y
 // (quadruped: the back faces the ceiling, so round = up = smaller y)
 const bow=ph=>{const mk=figMarkup(m,fit,ph);const d=(mk.match(/<path d="([^"]*)" fill="/)||[])[1];
   if(!d)return null;const pts=[...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(x=>[+x[1],+x[2]]);
   // path order: left edge shL->hpL (7 samples), then right edge hpR->shR; pts[3] is the
   // left edge's t=0.5 sample, compared with the straight shL->hpL chord's midpoint
   const mid=[(pts[0][0]+pts[6][0])/2,(pts[0][1]+pts[6][1])/2];
   return pts[3][1]-mid[1];};
 const cat=bow(0),cow=bow(0.5);
 check(`cat rounds the back upward (bow ${cat===null?'none':cat.toFixed(1)})`,cat!==null&&cat<-1.5);
 check(`cow arches the back downward (bow ${cow===null?'none':cow.toFixed(1)})`,cow!==null&&cow>1.5);
 check('cat-cows A/B carry opposite bend',m.A.bend>30&&m.B.bend<-30);}

// ---- cobra: 40s, arches on the press ----
{const m=get('Cobra press-ups');
 check('cobra work interval is 40s',m.dur===40);
 check('cobra press carries extension (B bend < A bend)',(m.B.bend||0)<(m.A.bend||0)-20);}

// ---- bent rotation sweeps: A/M/B, both hands floor at the crossover ----
{const m=get('Bent rotation sweeps');
 check('bent rotation sweeps have a mid keyframe',!!m.M);
 const onFloor=p=>p[1]>FL-3.5;
 const j0=solve(poseAt(m,0)),jm=solve(poseAt(m,0.25)),jb=solve(poseAt(m,0.5)),jm2=solve(poseAt(m,0.75));
 check('ph 0: one hand on the floor, the other high',(onFloor(j0.haL)!==onFloor(j0.haR))&&Math.min(j0.haL[1],j0.haR[1])<j0.pelvis[1]-10);
 check('ph 0.5: the OTHER hand is planted',onFloor(j0.haL)===onFloor(jb.haR)&&onFloor(j0.haR)===onFloor(jb.haL));
 check(`ph 0.25: both hands on the floor (${jm.haL[1].toFixed(1)}, ${jm.haR[1].toFixed(1)})`,onFloor(jm.haL)&&onFloor(jm.haR));
 check(`ph 0.75: both hands on the floor (${jm2.haL[1].toFixed(1)}, ${jm2.haR[1].toFixed(1)})`,onFloor(jm2.haL)&&onFloor(jm2.haR));
 const pm=poseAt(m,0.25);
 check('crossover is unrolled (tw 0) and rounded (bend > 0)',Math.abs(pm.tw)<1&&(pm.bend||0)>15);
 // the planted hand stays ON THE FLOOR through its half (ph 0 -> 0.25: left hand down);
 // it slides a little as the hips shift back to centre, which is what the body does
 let lift=99;for(const ph of PH.filter(p=>p<=0.25)){const j=solve(poseAt(m,ph));lift=Math.min(lift,j.haL[1]);}
 check(`planted hand stays on the floor through its half (min y ${lift.toFixed(1)})`,lift>FL-3.5);}

// ---- single-leg hip circles: alternate legs within the cycle ----
{const m=get('Single-leg hip circles');
 check('hip circles alternate legs (orb.alt)',!!(m.orb&&m.orb.leg&&m.orb.alt));
 check('hip circles are cued as a direction change',dirOnly(m)&&m.bil===true);
 const j=ph=>solve(poseAt(m,ph));
 const down=p=>p[1]>FL-2.5;
 check('ph 0: both feet on the floor',down(j(0).ftL)&&down(j(0).ftR));
 check('ph 0.5: both feet on the floor',down(j(0.5).ftL)&&down(j(0.5).ftR));
 check('ph 0.25: right foot lifted, left planted',!down(j(0.25).ftR)&&down(j(0.25).ftL));
 check('ph 0.75: left foot lifted, right planted',!down(j(0.75).ftL)&&down(j(0.75).ftR));
 const knUp=side=>Math.min(...PH.map(ph=>j(ph)['kn'+side][1]-j(ph)['hp'+side][1]));
 check(`right knee reaches hip height (dy ${knUp('R').toFixed(1)})`,knUp('R')<4);
 check(`left knee reaches hip height (dy ${knUp('L').toFixed(1)})`,knUp('L')<4);
 let drL=0,drR=0;const a0=j(0);
 for(const ph of PH){const jj=j(ph);if(ph<0.5)drL=Math.max(drL,dist(jj.ftL,a0.ftL));else drR=Math.max(drR,dist(jj.ftR,a0.ftR));}
 check(`standing foot stays planted (L ${drL.toFixed(1)}, R ${drR.toFixed(1)})`,drL<0.5&&drR<0.5);}

// ---- chest opener swings: open position behind the frontal plane ----
{const m=get('Chest opener swings');
 const p=poseAt(m,0),j=solve(p);
 const front=rotY([0,0,1],p.yaw);   // trunk front in the world (upright pose)
 const behind=hand=>{const v=sub(hand,j.neck);return v[0]*front[0]+v[2]*front[2];};
 const bL=behind(j.haL),bR=behind(j.haR);
 check(`open: both hands behind the shoulder line (L ${bL.toFixed(1)}, R ${bR.toFixed(1)})`,bL<-4&&bR<-4);
 check('open: arms stay at shoulder height',Math.abs(j.haL[1]-j.shL[1])<6&&Math.abs(j.haR[1]-j.shR[1])<6);
 let maxOut=0;for(const ph of PH){const jj=solve(poseAt(m,ph));maxOut=Math.max(maxOut,Math.abs(jj.haR[0]-jj.haL[0]));}
 check(`sweep passes a wide T (hand span ${maxOut.toFixed(1)})`,maxOut>50);
 const cr=solve(poseAt(m,0.5));
 check('closed: hands cross in front',behind(cr.haL)>6&&behind(cr.haR)>6);}

// ---- dynamic lateral reaches: a side-to-side arc, not a fore-aft rock ----
{const m=get('Dynamic lateral reaches');
 check('lateral reaches at half pace (cyc 4.4)',m.cyc===4.4);
 const p0=poseAt(m,0),j0=solve(p0),jb=solve(poseAt(m,0.5));
 const lat=rotY([1,0,0],p0.yaw),fwd=rotY([0,0,1],p0.yaw);
 const hd=sub(jb.head,j0.head);
 check(`head travels sideways (lat ${Math.abs(dot(hd,lat)).toFixed(1)} vs fore-aft ${Math.abs(dot(hd,fwd)).toFixed(1)})`,
   Math.abs(dot(hd,lat))>14&&Math.abs(dot(hd,fwd))<3);
 const lean=Math.sign(dot(sub(j0.head,j0.pelvis),lat));
 const over=[j0.haL,j0.haR].sort((a,b)=>a[1]-b[1])[0];   // the higher hand
 check('overhead hand reaches past the head toward the lean',dot(sub(over,j0.head),lat)*lean>3&&over[1]<j0.head[1]-4);
 check('feet stay planted',dist(j0.ftL,jb.ftL)<0.5&&dist(j0.ftR,jb.ftR)<0.5);
 check('faces the camera so the arc is in the screen plane',Math.abs(p0.yaw+40)<1);}

// ---- timing ----
{const cat=get('Cat-cows');
 check('ground gap before Cat-cows is 15s',cat.tdur===15);
 const work=MOVES.reduce((a,m)=>a+m.dur,0);
 const gaps=MOVES.slice(1).reduce((a,m)=>a+(m.tdur||10),0);
 check(`session is 13:25 exactly (${work}s work + ${gaps}s gaps)`,work+gaps===805);}

console.log(fail?'FLOW FAIL':'FLOW PASS');
process.exit(fail?1:0);
