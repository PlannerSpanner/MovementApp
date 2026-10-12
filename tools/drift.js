const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const APPS={'morning-flow':'d_flow.js','prenatal-stretch':'d_stretch.js','prenatal-movement':'d_birth.js','daily-13':'d_daily.js'};
// movements where a foot is SUPPOSED to travel
const MOVING={
 'Reverse lunges':'steps back','Cross-body knee drives':'knee lifts','Pedaling down dog':'heels alternate',
 'Side-lying clamshells':'top knee lifts','Kneeling hip flexor stretch':'shifts forward',
 'Kneeling lunge with support':'shifts forward','Standing calf stretch':'shifts forward',
 'Doorway chest opener':'steps through','Lateral weight shifts':'weight shifts','Supported deep squat':'hips drop',
 'Deep squats':'hips drop','Parallel squats':'hips drop','Hands-and-knees rocking':'rocks',
 'Hands-and-knees pelvic rocking':'rocks','Bouncing in place':'bounces','Arm sweeps with knee dip':'knees dip',
 'Left side-lying rest':'settles','Supported butterfly with rock':'rocks','Birth ball hip circles':'hips circle',
 'Single-leg hip circles':'hips circle','Standing wall pelvic tilts':'pelvis tilts','Seated figure-4':'ankle crosses',
 'Supported butterfly':'knees open','Wide-knee child\'s pose':'settles back','Seated breathing':'settles',
 'Breath and pelvic floor release':'settles','Pelvic floor coordination':'settles','Knee circles':'knees circle',
 '90/90 with a fold':'folds','Tuck + untuck':'pelvis tilts','Thread the needle':'arm threads',
 'Cobra press-ups':'chest lifts','Plank hold':'micro-adjusts','Punching rotations':'stance shifts',
 'Rotations with shoulder slaps':'torso rotates','Dynamic lateral reaches':'leans','Chest opener swings':'arms swing',
 'Bent rotation sweeps':'torso rotates','Hip hinges':'hips travel back',
 'Seated cat-cow':'spine moves','Seated side reach':'leans',
 'Dead bug':'opposite leg extends','Standing quad + hip flexor stretch':'heel drawn to glute'};
for(const [app,df] of Object.entries(APPS)){
  const h=fs.readFileSync(path.join(ROOT,`${app}.html`),'utf8');
  const js=h.split('<script>')[1].split('</script>')[0];
  const core=js.slice(0,js.indexOf('const layer=document.getElementById'));
  const ctx=new Function(core+'\nreturn {MOVES,solve,poseAt};')();
  const {MOVES,solve,poseAt}=ctx;
  console.log('\n=== '+app+' ===');
  MOVES.forEach(m=>{
    let L=[],R=[];
    for(let i=0;i<=24;i++){const j=solve(poseAt(m,i/24));L.push(j.ftL.slice());R.push(j.ftR.slice());}
    const trav=a=>{let mx=0;for(let i=1;i<a.length;i++){
      mx=Math.max(mx,Math.hypot(a[i][0]-a[0][0],a[i][1]-a[0][1],a[i][2]-a[0][2]));}return mx;};
    const tl=trav(L), tr=trav(R), mx=Math.max(tl,tr);
    const why=MOVING[m.n];
    const flag = mx>2.5 && !why ? '  <-- UNINTENDED' : '';
    console.log(`  ${m.n.padEnd(32)} L ${tl.toFixed(1).padStart(5)}  R ${tr.toFixed(1).padStart(5)}  ${why?'('+why+')':''}${flag}`);
  });
}
