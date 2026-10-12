// geometry invariants: limb lengths ±0.2, toe len 6.4, no joint through floor (y>95.5),
// foot drift ≤1.8 for movements outside the allowed moving set (see CLAUDE.md gauntlet).
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const APPS=['morning-flow','prenatal-stretch','prenatal-movement','daily-13'];
// movements where a foot is SUPPOSED to travel (kept in sync with drift.js)
const MOVING=new Set([
 'Reverse lunges','Cross-body knee drives','Pedaling down dog',
 'Side-lying clamshells','Kneeling hip flexor stretch',
 'Kneeling lunge with support','Standing calf stretch',
 'Doorway chest opener','Lateral weight shifts','Supported deep squat',
 'Deep squats','Parallel squats','Hands-and-knees rocking',
 'Hands-and-knees pelvic rocking','Bouncing in place','Arm sweeps with knee dip',
 'Left side-lying rest','Supported butterfly with rock','Birth ball hip circles',
 'Single-leg hip circles','Standing wall pelvic tilts','Seated figure-4',
 'Supported butterfly',"Wide-knee child's pose",'Seated breathing',
 'Breath and pelvic floor release','Pelvic floor coordination','Knee circles',
 '90/90 with a fold','Tuck + untuck','Thread the needle',
 'Cobra press-ups','Plank hold','Punching rotations',
 'Rotations with shoulder slaps','Dynamic lateral reaches','Chest opener swings',
 'Bent rotation sweeps','Hip hinges',
 'Seated cat-cow','Seated side reach',
 'Dead bug','Bird dog']);  // daily-10: extending leg / contralateral reach
const SEGS=[['pelvis','chest',13],['chest','neck',13],['neck','head',9],
 ['hpL','knL',19],['knL','ftL',19],['hpR','knR',19],['knR','ftR',19],
 ['shL','elL',13],['elL','haL',13],['shR','elR',13],['elR','haR',13],
 ['ftL','toeL',6.4],['ftR','toeR',6.4]];
const TOL=0.2, FLOOR=95.5, DRIFT=1.8;
let fail=false;
for(const app of APPS){
  const h=fs.readFileSync(path.join(ROOT,`${app}.html`),'utf8');
  const js=h.split('<script>')[1].split('</script>')[0];
  const core=js.slice(0,js.indexOf('const layer=document.getElementById'));
  const {MOVES,solve,poseAt}=new Function(core+'\nreturn {MOVES,solve,poseAt};')();
  const issues=[];
  MOVES.forEach(m=>{
    const ftL=[],ftR=[];
    for(let i=0;i<=24;i++){
      const j=solve(poseAt(m,i/24));
      for(const [a,b,l] of SEGS){
        const d=Math.hypot(j[a][0]-j[b][0],j[a][1]-j[b][1],j[a][2]-j[b][2]);
        if(Math.abs(d-l)>TOL)issues.push(`${m.n}: ${a}-${b} length ${d.toFixed(2)} (want ${l})`);
      }
      for(const k of Object.keys(j))
        if(j[k][1]>FLOOR)issues.push(`${m.n}: ${k} through floor (y ${j[k][1].toFixed(1)})`);
      ftL.push(j.ftL.slice()); ftR.push(j.ftR.slice());
    }
    if(!MOVING.has(m.n)){
      const trav=a=>{let mx=0;for(let i=1;i<a.length;i++)
        mx=Math.max(mx,Math.hypot(a[i][0]-a[0][0],a[i][1]-a[0][1],a[i][2]-a[0][2]));return mx;};
      const mx=Math.max(trav(ftL),trav(ftR));
      if(mx>DRIFT)issues.push(`${m.n}: foot drift ${mx.toFixed(1)} > ${DRIFT} (not in allowed moving set)`);
    }
  });
  const u=[...new Set(issues)];
  console.log(u.length?`GEO FAIL ${app}\n  `+u.join('\n  '):`GEO PASS ${app}`);
  if(u.length)fail=true;
}
process.exit(fail?1:0);
