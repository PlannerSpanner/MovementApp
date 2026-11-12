// Daily 13 form invariants, checked against the BUILT page (research-anchored; see
// docs/movement-reference.md): dips never below parallel, dead bug lumbar flat,
// glute bridge extends at the hip not the lumbar spine, row torso never heaves,
// held dumbbells in front of the torso, session lands on exactly 715s including gaps.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(ROOT,'daily-13.html'),'utf8');
const js=h.split('<script>')[1].split('</script>')[0];
const core=js.slice(0,js.indexOf('const layer=document.getElementById'));
const {MOVES,solve,poseAt,figMarkup,fitOf,TORSO,PROP}=
  new Function(core+'\nreturn {MOVES,solve,poseAt,figMarkup,fitOf,TORSO,PROP};')();
let fail=false;
const check=(name,ok)=>{console.log(`${name.padEnd(58)} ${ok?'ok':'FAIL'}`);if(!ok)fail=true;};
const get=n=>MOVES.find(m=>m.n===n);
const PH=[...Array(25)].map((_,i)=>i/24);
const ang=(a,b,c)=>{const u=a.map((v,i)=>v-b[i]),w=c.map((v,i)=>v-b[i]);
  const d=(u[0]*w[0]+u[1]*w[1]+u[2]*w[2])/((Math.hypot(...u)*Math.hypot(...w))||1);
  return Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI;};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

// dips: at EVERY animation phase the shoulder stays at or above the elbow (y-down:
// shoulder y <= elbow y). Parallel is the hard floor of the rep — AC joint rule.
{const m=get('Bench dips');let worst=1e9;
 for(const ph of PH){const j=solve(poseAt(m,ph));
   worst=Math.min(worst,j.elL[1]-j.shL[1],j.elR[1]-j.shR[1]);}
 check(`dips never below parallel (margin ${worst.toFixed(1)})`,worst>=-0.3);}

// dead bug: lumbar stays flat — spine values identical in every keyframe, pelvis still
{const m=get('Dead bug');let ok=true;
 for(const ph of PH){const p=poseAt(m,ph);
   if(Math.abs(p.s[0]-m.A.s[0])>0.01||Math.abs(p.s[1]-m.A.s[1])>0.01
     ||Math.abs(p.p[1]-m.A.p[1])>0.01)ok=false;}
 check('dead bug lumbar flat (spine + pelvis constant)',ok);}

// glute bridge: top is a straight knee-hip-shoulder line per side, torso one slab
{const m=get('Glute bridge');const j=solve(poseAt(m,0.5));
 const L=ang(j.knL,j.hpL,j.shL),R=ang(j.knR,j.hpR,j.shR);
 check(`bridge top line L ${L.toFixed(0)} R ${R.toFixed(0)} (hip ext, no arch)`,L>165&&R>165);
 // the lying A pose has natural curvature (s0!=s1); the top must be a flat slab and
 // the curve must never exceed the starting curve on the way up (no arch to get height)
 const base=Math.abs(m.A.s[0]-m.A.s[1]);let arch=0;
 for(const ph of PH){const p=poseAt(m,ph);arch=Math.max(arch,Math.abs(p.s[0]-p.s[1]));}
 const top=poseAt(m,0.5);
 check('bridge top torso is one slab, arch never grows',Math.abs(top.s[0]-top.s[1])<0.01&&arch<=base+0.01);
 const a=solve(poseAt(m,0));
 check('bridge shoulders stay down',Math.abs(a.neck[1]-j.neck[1])<2.5);}

// clamshell: heels stay welded (both ankles static — the top knee opens by hip
// swivel only) and the pelvis never rolls back or lifts
{const m=get('Side-lying clamshell');let ftMax=0,knMax=0,still=true;
 const j0=solve(poseAt(m,0));
 for(const ph of PH){const p=poseAt(m,ph),j=solve(p);
   if(Math.abs(p.yaw-m.A.yaw)>0.01||Math.abs(p.p[1]-m.A.p[1])>0.01)still=false;
   ftMax=Math.max(ftMax,dist(j.ftR,j0.ftR),dist(j.ftL,j0.ftL));
   knMax=Math.max(knMax,dist(j.knL,j0.knL));}   // top leg = left since 2026-11-12 (lies on the right side)
 check(`clamshell heels welded (foot drift ${ftMax.toFixed(2)})`,ftMax<0.3);
 check(`clamshell top knee opens (travel ${knMax.toFixed(1)})`,knMax>4);
 check('clamshell pelvis never rolls (yaw/height constant)',still);}

// side plank: one straight line head-to-heels, held; the planted forearm (hand) never moves
{const m=get('Side plank');
 const top=solve(poseAt(m,0)),sag=solve(poseAt(m,0.5));
 const fm=[(top.ftL[0]+top.ftR[0])/2,(top.ftL[1]+top.ftR[1])/2,(top.ftL[2]+top.ftR[2])/2];
 const line=ang(top.neck,top.pelvis,fm);
 check(`side plank top line ${line.toFixed(0)}° (head to heels)`,line>168);
 // Will, 2026-11-12: HOLD the line, no animated sag (a breath is fine)
 check(`side plank holds the line (pelvis travel ${Math.abs(sag.pelvis[1]-top.pelvis[1]).toFixed(2)})`,Math.abs(sag.pelvis[1]-top.pelvis[1])<0.6);
 check(`side plank is on its side (hips stacked ${Math.abs(top.hpL[1]-top.hpR[1]).toFixed(1)} apart in height)`,Math.abs(top.hpL[1]-top.hpR[1])>8);
 check('side plank planted forearm never moves',dist(top.haR,sag.haR)<0.3);}

// bird dog: spine one neutral slab at every phase (the rib-pelvis lock IS the
// exercise); at full reach the hand and foot are near-level with shoulder and hip
// (long, not high); the planted hand and kneeling foot never move
{const m=get('Bird dog');let flat=true;
 for(const ph of PH){const p=poseAt(m,ph);
   if(Math.abs(p.s[0]-m.A.s[0])>0.01||Math.abs(p.s[1]-m.A.s[1])>0.01)flat=false;}
 check('bird dog flat back (spine constant)',flat);
 const t=solve(poseAt(m,0.5)),b=solve(poseAt(m,0));
 check(`bird dog reach level (hand dy ${(t.haR[1]-t.shR[1]).toFixed(1)}, foot dy ${(t.ftL[1]-t.hpL[1]).toFixed(1)})`,
   Math.abs(t.haR[1]-t.shR[1])<3&&Math.abs(t.ftL[1]-t.hpL[1])<3);
 check('bird dog planted hand and kneeling foot stay put',
   dist(t.haL,b.haL)<0.3&&dist(t.ftR,b.ftR)<0.3);}

// row: hinge angle held — chest height constant through the pull
{const m=get('Dumbbell bent-over row');let hv=0;const c0=solve(poseAt(m,0)).chest[1];
 for(const ph of PH)hv=Math.max(hv,Math.abs(solve(poseAt(m,ph)).chest[1]-c0));
 check(`row torso never heaves (chest sway ${hv.toFixed(1)})`,hv<1.5);}

// held dumbbells paint IN FRONT of the torso at every phase. Both movements' props
// are all joint-attached, so in the emitted markup (paint order) the first
// PROP-colored element must come after the torso polygon — behind-the-body dumbbells
// were a real bug (fixed 2026-08-12); this is the hard regression guard.
for(const name of ['Dumbbell bent-over row','Dumbbell farmer hold']){
 const m=get(name),fit=fitOf(m);let worst=1;
 for(const ph of PH){const mk=figMarkup(m,fit,ph);
   const t=mk.indexOf(`fill="${TORSO}"`),p=mk.indexOf(PROP);
   if(t<0||p<0||p<t)worst=0;}
 check(`${name.toLowerCase()}: dumbbells never behind the torso`,worst===1);}

// timing: work + authored gaps == 715s exactly (555 + 160); every movement past the
// first has an authored setup script
{const work=MOVES.reduce((a,m)=>a+m.dur,0);
 const gaps=MOVES.slice(1).reduce((a,m)=>a+(m.tdur||10),0);
 check(`session is 11:55 exactly (${work}s work + ${gaps}s gaps)`,work+gaps===715);
 check('every movement has an authored setup script',MOVES.every(m=>typeof m.setup==='string'&&m.setup.length>10));}

console.log(fail?'DAILY FAIL':'DAILY PASS');
process.exit(fail?1:0);
