// Prototype movements authored for the rig in rig.js. Three of the hardest in scope, picked
// because each one failed in the current engine for a SYSTEM reason (docs/pose-critique.md):
//   Thread the needle       shoulder cannot drop, support arm cannot stay straight
//   Bent rotation sweeps    rigid roll instead of thoracic rotation, hands through the floor
//   Arm sweeps with knee dip  no real spinal flexion, so the fold bottoms out as a squat
// plus two that the current engine cannot pose at all and only fakes:
//   Side plank              needs root roll (hips stacked)
//   Prone Y-T-W raise       needs camera pitch (the letters lie in the floor plane)
// Units cm, y up, figure faces +z, +x = the figure's left. See rig.js for the spec format.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./rig'));else root.Motions=factory(root.Rig);})(this,function(Rig){
const M={};
const mir=(k,t)=>Object.assign(Rig.mirror(k),{t});

// ---------------- Thread the needle (right arm threads; the app mirrors at halfway) ----------
{
  const knees={legL:{knee:[9,0],shin:180},legR:{knee:[-9,0],shin:180}};
  const support={floor:[18,46],yaw:0,pole:[1,0.2,-0.4],poleFrame:'world'};
  const reach={t:0,pos:[0,49.5,0],pitch:65,lumbar:[0,0,-8],thoracic:[-6,0,-38],neck:[-10,0,-40],scapL:[7,0],scapR:[-3,0],
    armL:support,armR:{dir:[-0.12,1,0.05],reach:1,frame:'world',pole:[0,0,-1],poleFrame:'world'},...knees};
  const pass={t:0.27,pos:[0,49.5,0],pitch:80,lumbar:[2,0,0],thoracic:[2,0,4],neck:[10,0,10],
    armL:support,armR:{dir:[-1,-0.75,0.1],reach:0.92,frame:'world',pole:[0,0,-1],poleFrame:'world'},...knees};
  const thread={t:0.52,pos:[0,49.5,0],pitch:108,lumbar:[6,0,8],thoracic:[14,4,38],neck:[6,0,45],scapL:[0,0],scapR:[5,0],
    armL:support,armR:{at:[44,3.2,38],pole:[0,0.2,-1],poleFrame:'world'},...knees};
  M.thread={name:'Thread the needle',cam:{yaw:-30,pitch:12},
    keys:[reach,pass,thread,Object.assign({},pass,{t:0.78})]};
}
// in-between key: body numbers lerped between two keys, limbs taken from `a` unless overridden
const SC=['pos','yaw','pitch','roll','lumbar','thoracic','neck','scapL','scapR'],DZ={pos:[0,0,0],yaw:0,pitch:0,roll:0,lumbar:[0,0,0],thoracic:[0,0,0],neck:[0,0,0],scapL:[0,0],scapR:[0,0]};
const mix=(a,b,u,t,over)=>{const o=Object.assign({},a,{t});SC.forEach(f=>{const x=a[f]==null?DZ[f]:a[f],y=b[f]==null?DZ[f]:b[f];
  o[f]=Array.isArray(x)?x.map((v,i)=>v+(y[i]-v)*u):x+(y-x)*u;});return Object.assign(o,over||{});};

// ---------------- Bent rotation sweeps (windmill; both hands touch down between sides) -------
{
  const feet={legL:{foot:[35,8],yaw:14},legR:{foot:[-35,8],yaw:-14}};
  const HL={floor:[13,34],yaw:0},HR={floor:[-13,34],yaw:0};
  // A: left hand planted, trunk rotated open to the right, right arm to the sky, right leg
  // straight, hips shifted over the softened left knee
  const A={t:0,pos:[7,85,-13],pitch:92,lumbar:[14,3,-9],thoracic:[10,4,-43],neck:[-4,0,-55],scapL:[3,0],scapR:[-3,0],
    armL:HL,armR:{dir:[-0.05,1,0.02],reach:1,frame:'world',pole:[0,0,-1],poleFrame:'world'},...feet};
  const Mid={t:0.25,pos:[0,83,-13],pitch:99,lumbar:[26,0,0],thoracic:[24,0,0],neck:[14,0,0],armL:HL,armR:HR,...feet};
  const B=mir(A,0.5);
  const outR={dir:[-1,0.1,0.25],reach:1,frame:'world',pole:[0,0,-1],poleFrame:'world'};
  const outL={dir:[1,0.1,0.25],reach:1,frame:'world',pole:[0,0,-1],poleFrame:'world'};
  M.windmill={name:'Bent rotation sweeps',cam:{yaw:38,pitch:12},keys:[
    A,mix(A,Mid,0.5,0.125,{armR:outR}),Mid,mix(Mid,B,0.5,0.375,{armL:outL,armR:HR}),
    B,mix(B,Mid,0.5,0.625,{armL:outL,armR:HR}),Object.assign({},Mid,{t:0.75}),mix(Mid,A,0.5,0.875,{armR:outR,armL:HL})]};
}

// ---------------- Arm sweeps with knee dip (large pendulum: extension arc <-> fold) -----------
{
  const feet={legL:{foot:[10,8],yaw:4},legR:{foot:[-10,8],yaw:-4}};
  const arms=(d,r)=>({armL:{dir:[0.08,d[0],d[1]],reach:r,frame:'world',pole:[0.3,0,-1],poleFrame:'T2'},armR:{dir:[-0.08,d[0],d[1]],reach:r,frame:'world',pole:[-0.3,0,-1],poleFrame:'T2'}});
  const top={t:0,pos:[0,92.3,7],pitch:-7,lumbar:[-13,0,0],thoracic:[-14,0,0],neck:[-18,0,0],...arms([1,-0.32],1),...feet};
  const hinge={t:0.25,pos:[0,88.5,-11],pitch:52,lumbar:[4,0,0],thoracic:[2,0,0],neck:[-12,0,0],...arms([-0.12,1],1),...feet};
  const fold={t:0.5,pos:[0,80,-19],pitch:112,lumbar:[40,0,0],thoracic:[26,0,0],neck:[16,0,0],...arms([-0.5,-1],0.97),...feet};
  M.sweeps={name:'Arm sweeps with knee dip',cam:{yaw:62,pitch:6},keys:[top,hinge,fold,Object.assign({},hinge,{t:0.75})]};
}

// ---------------- Side plank (right forearm down). Needs root ROLL: hips truly stacked -------
{
  const V=Rig.vec,E=[-40,0],SH=[-40,33,0];           // planted elbow; the shoulder sits straight above it
  const at=(roll,side)=>{const k={pos:[0,0,0],roll,lumbar:[0,side*0.6,0],thoracic:[0,side*0.4,0]},B=Rig.body(k);
    k.pos=[SH[0]-B.J.shR[0],SH[1]-B.J.shR[1],0];return {k,B:Rig.body(k)};};
  // straight line: the right ankle lands on the floor with the leg straight along the pelvis axis
  let up=null;for(let roll=-60;roll>=-88;roll-=0.25){const r=at(roll,0),d=[-r.B.F.pelvis[0][1],-r.B.F.pelvis[1][1],-r.B.F.pelvis[2][1]];
    const an=V.add(r.B.J.hpR,V.mul(d,85)),e=Math.abs(an[1]-4);if(!up||e<up.e)up={e,an,...r};}
  // sag: ONLY the pelvis drops (8 cm); shoulder stays over the elbow, feet stay where they are
  let sag=null;for(let roll=-60;roll>=-89;roll-=0.25)for(let side=0;side>=-40;side-=0.5){const r=at(roll,side);
    const e=Math.abs(V.len(V.sub(r.B.J.hpR,up.an))-84.6)+Math.abs(r.k.pos[1]-(up.k.pos[1]-8));if(!sag||e<sag.e)sag={e,...r};}
  const limbs={armR:{elbow:E,yaw:0},armL:{dir:[0.2,-1,0.05],reach:0.97,frame:'T2',pole:[0.4,0,-1]},
    legR:{at:[up.an[0],4,-1.5]},legL:{at:[up.an[0]-1.5,12.5,1.5]}};
  M.sideplank={name:'Side plank',ease:'stop',cam:{yaw:0,pitch:12},
    keys:[Object.assign({t:0},up.k,limbs),Object.assign({t:0.5},sag.k,limbs)]};
}

// ---------------- Prone Y-T-W raise. Needs camera PITCH: the letters lie in the floor plane ---
{
  const base={pos:[0,11.5,0],pitch:90,lumbar:[-3,0,0],thoracic:[-5,0,0],neck:[-4,0,0],
    legL:{dir:[0.1,-1,-0.02],reach:1,frame:'pelvis',point:68},legR:{dir:[-0.1,-1,-0.02],reach:1,frame:'pelvis',point:68}};
  const arms=(x,z,r,px,pz)=>({armL:{dir:[x,0.1,z],reach:r,frame:'world',pole:[px,-0.15,pz],poleFrame:'world'},armR:{dir:[-x,0.1,z],reach:r,frame:'world',pole:[-px,-0.15,pz],poleFrame:'world'}});
  const Y=Object.assign({t:0},base,arms(0.55,1,1,0.5,-1)),T=Object.assign({t:0.25},base,arms(1,0.04,1,0.2,-1),{scapL:[-2,0],scapR:[-2,0]});
  const W=Object.assign({t:0.5},base,arms(1,0.5,0.62,0.6,-1),{scapL:[-3,-2],scapR:[-3,-2]});
  M.ytw={name:'Prone Y-T-W raise',cam:{yaw:35,pitch:62},keys:[Y,T,W,Object.assign({},T,{t:0.75})]};
}
return M;
});
