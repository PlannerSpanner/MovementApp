// Loads the REAL engine and pose data from src/ into a Node vm, read-only: eng2.js + the
// pure slice of the page template (everything above its DOM marker) + the d_*.js data,
// exactly as build.py inlines them. Shared by every figure check in qa/fig/.
//   const {load}=require('./engine'); const E=load('morning-flow');
//   E.MOVES, E.poseAt(m,ph), E.solve(pose), E.figMarkup(m,fit,ph), E.project(v), E.setCam(m)
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.join(__dirname,'..','..','src');
const rd=f=>fs.readFileSync(path.join(SRC,f),'utf8');
const CUT='const layer=document.getElementById';
const APPS={
  'morning-flow':{data:['d_flow.js'],tpl:'app_tpl.js',cut:CUT,moves:'MOVES',label:'Morning Flow',trall:true,rubric:'flow'},
  'daily-13':{data:['d_daily.js'],tpl:'app_tpl.js',cut:CUT,moves:'MOVES',label:'Daily 13',trall:true,rubric:'daily'},
  'strength':{data:['d_wka.js','d_wkb.js'],tpl:'wk_tpl.js',cut:'// ---- DOM ----',moves:'WK_A.concat(WK_B)',label:'Strength',rubric:'strength'},
  // archived apps: still built and shipped, so their frames are pinned too (no rubrics)
  'prenatal-stretch':{data:['d_stretch.js'],tpl:'app_tpl.js',cut:CUT,moves:'MOVES',label:'Prenatal Stretch'},
  'prenatal-movement':{data:['d_birth.js'],tpl:'app_tpl.js',cut:CUT,moves:'MOVES',label:'Birth Prep'},
};
const IN_SCOPE=['morning-flow','daily-13','strength'];
// source(app) = the script text; opts.patch(text) lets a prototype page alter it
function source(app,opts){
  const a=APPS[app]; if(!a) throw new Error('unknown app '+app);
  let tpl=rd(a.tpl); const i=tpl.indexOf(a.cut); if(i<0) throw new Error('marker missing in '+a.tpl);
  tpl=tpl.slice(0,i);
  if(a.trall) tpl=tpl.replace('const PROPFIT=false;','const PROPFIT=true;');   // build.py trall=True
  let eng=rd('eng2.js');
  // an approved skin (src/skin.json) is stamped in exactly as build.py does it
  if(fs.existsSync(path.join(SRC,'skin.json'))&&!(opts&&opts.noSkin))eng=eng.replace('let SKIN=null;','let SKIN='+JSON.stringify(JSON.parse(rd('skin.json')))+';');
  let code=eng+'\n'+a.data.map(rd).join('\n')+'\n'+tpl;
  if(opts&&opts.patch) code=opts.patch(code);
  return code;
}
const EXPORTS=a=>`\n;({MOVES:${a.moves},poseAt,solve,figMarkup,fitOf,project,propShapes,torsoEdges,L,`+
  `setCam,getCam:()=>CAM,getPitch:()=>PITCH,`+
  `setSkin:s=>{SKIN=s;},getSkin:()=>SKIN,limbHalf,farK,footPolys,footFrame,handPoly,handFrame,gripPt,INK,LIMB_L,TORSO,PROP})`;
function load(app,opts){
  const a=APPS[app];
  const E=vm.runInNewContext(source(app,opts)+EXPORTS(a),{Math,console,Object,Array,JSON,isFinite},{filename:app});
  E.MOVES.forEach(m=>{m.fit=E.fitOf(m);});
  E.app=app; E.label=a.label;
  return E;
}
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
module.exports={load,source,APPS,IN_SCOPE,slug,EXPORTS};
