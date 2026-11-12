// CONTROL for the assessment: the CURRENT engine with the smallest patches that remove its
// system faults, applied as text edits to the shipped sources at load time (src/ untouched).
//   P1 root roll      pose.roll rotates the whole body about its own front axis (side-lying)
//   P2 camera pitch   per-movement m.pitch (default 13, the shipped value)
//   P3 no stop at M   one ease over the half cycle instead of one per A-M / M-B segment
// plus data-only re-authoring of four movements in the existing pose schema (OVERRIDE below).
// Everything else (schema, FK/IK split, swivels, feet, props, renderer) is the shipped engine.
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.join(__dirname,'..','..','src'),rd=f=>fs.readFileSync(path.join(SRC,f),'utf8');
function rep(s,a,b,all){if(!s.includes(a))throw new Error('patch anchor missing: '+a);return all?s.split(a).join(b):s.replace(a,b);}
function source(dataFile){   // patched engine + data + pure template, as one script (also inlined by proto/review/build.js)
  let eng=rd('eng2.js'),tpl=rd('app_tpl.js');tpl=tpl.slice(0,tpl.indexOf('const layer=document.getElementById'));
  // P1: every body-frame vector in solve() goes through rotR (roll, then yaw)
  const i=eng.indexOf('function solve(p){'),j=eng.indexOf('// spine curvature');
  let sv=eng.slice(i,j).split('rotY(').join('rotR(');
  sv=rep(sv,'function solve(p){','function solve(p){\n  const __roll=p.roll||0, rotR=(v,deg)=>rotY(__roll?rotZb(v,__roll):v,deg);');
  eng=eng.slice(0,i)+sv+eng.slice(j);
  tpl=rep(tpl,'yaw:lerp(A.yaw,B.yaw,t),','yaw:lerp(A.yaw,B.yaw,t),roll:lerp(A.roll||0,B.roll||0,t),');
  // P2
  tpl=rep(tpl,'let CAM=40; const PITCH=13;','let CAM=40,PITCH=13;');
  tpl=rep(tpl,'CAM=m.cam||40;','CAM=m.cam||40;PITCH=m.pitch==null?13:m.pitch;',true);
  // P3
  tpl=rep(tpl,'if(m.M) return tri<0.5 ? blend(m.A,m.M,easeQ(tri*2)) : blend(m.M,m.B,easeQ((tri-0.5)*2));',
              'if(m.M){const e=easeQ(tri);return e<0.5?blend(m.A,m.M,e*2):blend(m.M,m.B,(e-0.5)*2);}');
  tpl=tpl.replace('const PROPFIT=false;','const PROPFIT=true;');
  return eng+'\n'+rd(dataFile)+'\n'+tpl;
}
function load(dataFile){
  return vm.runInNewContext(source(dataFile)+'\n;({MOVES,poseAt,solve,figMarkup,fitOf,project})',{Math,console,Object,Array,JSON,isFinite});
}
// ---- data-only re-authoring in the EXISTING schema (y down, floor 93, units ~2.2 cm) ----
const OVERRIDE={
 // Side plank: body rolled onto its right side (P1), camera on the chest side. Geometry solved by
 // hand: shoulder 13 above the floor over the elbow, ankle on the floor, roll 77.9, pelvis y 78.7.
 'Side plank':m=>{const legs={lL:[0,0,0,0],lR:[0,0,0,0]};
   m.cam=0;m.A={p:[0,78.7,0],yaw:0,roll:77.9,tw:0,s:[0,0],hf:0,aL:[4,0,4,0],ikR:{w:[26.9,92.5,12.5]},swAR:m._sw||0,...legs};
   m.B={p:[1.0,82.2,0],yaw:0,roll:77.9,sl:-7.9,tw:0,s:[0,0],hf:0,aL:[4,0,4,0],ikR:{w:[26.9,92.5,12.5]},swAR:m._sw||0,...legs};
   m.pin='LR';},
 // Y-T-W: nothing but the camera (P2)
 'Prone Y-T-W raise':m=>{m.pitch=58;m.cam=40;},
 // Thread the needle: data only. Torso tilted so the support arm is straight in the reach;
 // in the thread the chest pitches down so the shoulder goes to the floor.
 'Thread the needle':m=>{m.A.s=[62,60];m.M.s=[80,84];m.B.s=[104,118];m.B.hf=40;m.B.tw=-66;},
 // Cat-cows: data only. Segment angles chosen so the neck (shoulders) stays over the hands.
 'Cat-cows':m=>{m.A.s=[62,92];m.B.s=[92,62];m.A.p=[0,74,0];m.B.p=[0,74,0];}
};
module.exports={load,source,OVERRIDE};
