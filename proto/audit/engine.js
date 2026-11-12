// Loads the REAL shipped engine and pose data from src/ into a Node vm, read-only.
// Nothing here is a reimplementation: eng2.js + the pure slice of the page template
// (everything above its DOM marker) + the d_*.js data, exactly as build.py inlines them.
//   const {load}=require('./engine'); const E=load('morning-flow');
//   E.MOVES, E.poseAt(m,ph), E.solve(pose), E.figMarkup(m,fit,ph), E.project(v), E.setCam(m)
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.join(__dirname,'..','..','src');
const rd=f=>fs.readFileSync(path.join(SRC,f),'utf8');
const APPS={
  'morning-flow':{data:['d_flow.js'],tpl:'app_tpl.js',cut:'const layer=document.getElementById',moves:'MOVES',label:'Morning Flow'},
  'daily-13':{data:['d_daily.js'],tpl:'app_tpl.js',cut:'const layer=document.getElementById',moves:'MOVES',label:'Daily 13'},
  'strength':{data:['d_wka.js','d_wkb.js'],tpl:'wk_tpl.js',cut:'// ---- DOM ----',moves:'WK_A.concat(WK_B)',label:'Strength'},
};
function load(app){
  const a=APPS[app]; if(!a) throw new Error('unknown app '+app);
  let tpl=rd(a.tpl); const i=tpl.indexOf(a.cut); if(i<0) throw new Error('marker missing in '+a.tpl);
  tpl=tpl.slice(0,i).replace('const PROPFIT=false;','const PROPFIT=true;');   // both timer apps build with trall=True
  const code=rd('eng2.js')+'\n'+a.data.map(rd).join('\n')+'\n'+tpl+
    `\n;({MOVES:${a.moves},poseAt,solve,figMarkup,fitOf,project,propShapes,torsoEdges,L,setCam:m=>{CAM=m.cam||40;},getCam:()=>CAM,PITCH})`;
  const E=vm.runInNewContext(code,{Math,console,Object,Array,JSON,isFinite},{filename:app});
  E.MOVES.forEach(m=>{m.fit=E.fitOf(m);});
  E.app=app; E.label=a.label;
  return E;
}
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
module.exports={load,APPS,slug};
