// strength.html invariants: limb lengths, floor, foot drift, sanctioned colors,
// implement-in-hands attachment, plus per-movement form checks from the spec:
// floor press stays on the floor, RDL is a hinge not a squat, split-squat back
// knee hovers (never plants), face pull / band pull-apart taut at both hands.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(ROOT,'strength.html'),'utf8');
const js=h.split('<script>')[1].split('</script>')[0];
const core=js.slice(0,js.indexOf('// ---- DOM ----'));
const ctx=new Function(core+'\nreturn {WK_A,WK_B,solve,poseAt,propShapes,fitOf,figMarkup,TORSO,PROP,freshChecks,dayKey};')();
const {WK_A,WK_B,solve,poseAt,propShapes}=ctx;
const SEGS=[['pelvis','chest',13],['chest','neck',13],['neck','head',9],
 ['hpL','knL',19],['knL','ftL',19],['hpR','knR',19],['knR','ftR',19],
 ['shL','elL',13],['elL','haL',13],['shR','elR',13],['elR','haR',13],
 ['ftL','toeL',6.4],['ftR','toeR',6.4]];
const TOL=0.2, FLOOR=95.5;
// feet allowed to travel (split-squat front foot & all pinned feet must NOT)
const DRIFT_OK={'Neutral-grip lat pulldown':1.8,'Band pull-apart':1.8,'Face pull':1.8,
  'Trap-bar deadlift':1.8,'Romanian deadlift':1.8,'Goblet squat':1.8,
  'Neutral-grip DB floor press':1.8,'Single-arm DB row':1.8,'Chest-supported row':1.8,
  'Split squat':2.2,'Side plank':1.8};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
// distance from point p to segment ab
function dSeg(p,a,b){const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ap=[p[0]-a[0],p[1]-a[1],p[2]-a[2]];
  const t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/(ab[0]**2+ab[1]**2+ab[2]**2||1)));
  return dist(p,[a[0]+ab[0]*t,a[1]+ab[1]*t,a[2]+ab[2]*t]);}
const issues=[];
const PH=[];for(let i=0;i<=24;i++)PH.push(i/24);
// implement props that must stay in the hands, per movement: prop index -> hands
const GRIP={
 'Goblet squat':[{i:0,hands:['haL','haR'],max:4.2}],            // vertical bell between both hands
 'Neutral-grip DB floor press':[{i:0,hands:['haL'],max:2.6},{i:1,hands:['haR'],max:2.6}],
 'Single-arm DB row':[{i:3,hands:['haR'],max:2.6}],
 'Romanian deadlift':[{i:0,hands:['haL','haR'],max:1.2,seg:true}],
 'Trap-bar deadlift':[{i:0,hands:['haL','haR'],max:1.2,seg:true}],
 'Chest-supported row':[{i:3,hands:['haL'],max:2.6},{i:4,hands:['haR'],max:2.6}],
 'Neutral-grip lat pulldown':[{i:4,hands:['haL','haR'],max:1.6,seg:true}],
 'Band pull-apart':[{i:0,hands:['haL','haR'],max:0.5,ends:true}],
 'Face pull':[{i:2,hands:['haL'],max:0.5,ends:true},{i:3,hands:['haR'],max:0.5,ends:true}]};
function checkMove(m){
  const ftL=[],ftR=[],track={};
  for(const ph of PH){
    const pose=poseAt(m,ph), j=solve(pose);
    for(const [a,b,l] of SEGS){
      const d=dist(j[a],j[b]);
      if(Math.abs(d-l)>TOL)issues.push(`${m.n}: ${a}-${b} length ${d.toFixed(2)} (want ${l})`);
    }
    for(const k of Object.keys(j))
      if(j[k][1]>FLOOR)issues.push(`${m.n}: ${k} through floor (y ${j[k][1].toFixed(1)})`);
    ftL.push(j.ftL.slice()); ftR.push(j.ftR.slice());
    // implement attachment
    (GRIP[m.n]||[]).forEach(g=>{
      const s=propShapes(m,j,pose)[g.i];
      g.hands.forEach((hn,hi)=>{
        const hd=j[hn];
        let d;
        if(g.ends)d=dist(hd,hi===0?s.a:(g.hands.length>1?s.b:s.a));
        else if(g.seg)d=dSeg(hd,s.a,s.b);
        else d=Math.min(dist(hd,s.a),dist(hd,s.b),dSeg(hd,s.a,s.b));
        if(g.ends&&g.hands.length===1)d=Math.min(dist(hd,s.a),dist(hd,s.b));
        if(d>g.max)issues.push(`${m.n}: implement drifted ${d.toFixed(1)} from ${hn} at ph ${ph.toFixed(2)}`);
      });
    });
    // per-movement form invariants
    if(m.n==='Neutral-grip DB floor press'){
      if(j.pelvis[1]<87||j.chest[1]<85.5)issues.push(`${m.n}: torso off the floor (pelvis ${j.pelvis[1].toFixed(1)}, chest ${j.chest[1].toFixed(1)})`);
    }
    if(m.n==='Split squat')track['knL_'+ph]=j.knL.slice();
    if(m.n==='Romanian deadlift')track['rdl_'+ph]={kn:ang(j.hpL,j.knL,j.ftL),pv:j.pelvis.slice(),nk:j.neck.slice()};
  }
  const trav=a=>{let mx=0;for(let i=1;i<a.length;i++)
    mx=Math.max(mx,dist(a[i],a[0]));return mx;};
  const lim=DRIFT_OK[m.n]||1.8;
  const mx=Math.max(trav(ftL),trav(ftR));
  if(mx>lim)issues.push(`${m.n}: foot drift ${mx.toFixed(1)} > ${lim}`);
  if(m.n==='Split squat'){
    const kb=track['knL_0.5'];
    if(kb[1]>91.6)issues.push(`${m.n}: back knee plants (y ${kb[1].toFixed(1)})`);
    if(kb[1]<88)issues.push(`${m.n}: back knee hover too high (y ${kb[1].toFixed(1)})`);
  }
  if(m.n==='Romanian deadlift'){
    const b=track['rdl_0.5'];
    if(b.kn<125)issues.push(`${m.n}: knees too bent at bottom (${b.kn.toFixed(0)}° — squatting, not hinging)`);
    const pitch=Math.acos(Math.max(-1,Math.min(1,-(b.nk[1]-b.pv[1])/dist(b.nk,b.pv))))*180/Math.PI;
    if(pitch<45)issues.push(`${m.n}: torso pitch only ${pitch.toFixed(0)}° at bottom — not a hinge`);
    if(Math.abs(b.pv[2])<6)issues.push(`${m.n}: hips did not travel back (z ${b.pv[2].toFixed(1)})`);
  }
}
function ang(a,b,c){const u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],v=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
  const d=(u[0]*v[0]+u[1]*v[1]+u[2]*v[2])/(Math.hypot(...u)*Math.hypot(...v));
  return Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI;}
[...WK_A,...WK_B].forEach(checkMove);
// color lint on emitted markup
const OKCOL=new Set(['#42591f','#a8bc85','#5c7d34','#b9a98b']);
[...WK_A,...WK_B].forEach(m=>{
  const fit=ctx.fitOf(m);
  for(const ph of [0,0.25,0.5,0.75]){
    const mk=ctx.figMarkup(m,fit,ph);
    [...mk.matchAll(/(?:stroke|fill)="(#[0-9a-f]{6})"/g)].forEach(x=>{
      if(!OKCOL.has(x[1]))issues.push(`${m.n}: rogue color ${x[1]}`);});
    if(!mk.includes('<line')||!mk.includes('<circle'))issues.push(`${m.n}: figure not drawn at ph ${ph}`);
  }
});
// held implements paint in front of the torso: every joint-attached shape's markup
// must land AFTER the torso polygon in the paint order (world props keep the
// behind-everything prefix). Counted by expected PROP-colored elements per shape.
[...WK_A,...WK_B].forEach(m=>{
  if(!m.prop)return;
  const fit=ctx.fitOf(m);
  for(const ph of [0,0.25,0.5,0.75]){
    const pose=ctx.poseAt(m,ph),j=ctx.solve(pose);
    const nAtt=ctx.propShapes(m,j,pose).filter(s=>s.att)
      .reduce((a,s)=>a+(s.t==='db'?3:s.t==='c'?(s.f?2:1):1),0);
    if(!nAtt)continue;
    const mk=ctx.figMarkup(m,fit,ph);
    const t=mk.indexOf(`fill="${ctx.TORSO}"`);
    const after=mk.slice(t).split(ctx.PROP).length-1;
    if(t<0||after!==nAtt)issues.push(`${m.n}: held implement behind the torso at ph ${ph} (${after}/${nAtt} PROP elements after torso)`);
  }
});
// set-check freshness: checks auto-clear on a new calendar day, and a fully-checked
// workout clears on the next same-day load (done = next visit is a new session).
// Partial same-day checks persist (phone lock / app switch mid-workout).
(function(){
  const {freshChecks,dayKey}=ctx;
  if(typeof freshChecks!=='function'||typeof dayKey!=='function'){issues.push('freshChecks/dayKey missing from pure section');return;}
  const sets={A:WK_A.map(m=>m.sets),B:WK_B.map(m=>m.sets)};
  const today='2026-09-24';
  const full=id=>{const o={};sets[id].forEach((n,i)=>{o[i]=Array.from({length:n},()=>true);});return o;};
  const partial={0:[true,false,true]};
  let r=freshChecks(null,today,sets);
  if(!r||!r.A||!r.B||r.day!==today||Object.keys(r.A).length)issues.push('freshChecks(null) must give empty checks stamped today');
  r=freshChecks({A:partial,B:{}},today,sets);
  if(Object.keys(r.A).length)issues.push('legacy unstamped checks must be treated as stale and cleared');
  r=freshChecks({A:partial,B:{},day:today},today,sets);
  if(!(r.A[0]&&r.A[0][2]===true))issues.push('same-day partial checks must persist');
  r=freshChecks({A:partial,B:{},day:'2026-09-23'},today,sets);
  if(Object.keys(r.A).length||r.day!==today)issues.push('checks from a different day must clear');
  r=freshChecks({A:full('A'),B:partial,day:today},today,sets);
  if(Object.keys(r.A).length)issues.push('a fully-checked workout must clear on the next same-day load');
  if(!(r.B[0]&&r.B[0][2]===true))issues.push('clearing a done workout must not touch the other workout');
  r=freshChecks({A:full('A'),B:{},day:today},today,sets); r.A.x=1;
  const k=dayKey(new Date(2026,8,24,0,30));   // local midnight-adjacent: must be LOCAL date
  if(k!=='2026-09-24')issues.push('dayKey must be the local calendar date, got '+k);
  if(dayKey(new Date(2026,0,5))!=='2026-01-05')issues.push('dayKey must zero-pad');
})();
const u=[...new Set(issues)];
console.log(u.length?`WK FAIL\n  `+u.join('\n  '):`WK PASS — ${WK_A.length+WK_B.length} movements, ${PH.length} phases each`);
process.exit(u.length?1:0);
