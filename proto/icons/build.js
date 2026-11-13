// App icon, direction A: three options, each built to read at 60 px on a home screen (no
// hatching, two or three inks, one strong shape). The figure is the app's own figure, drawn by
// the real engine (src/eng2.js inkFigure) as a single-colour silhouette.
//   node proto/icons/build.js      writes icons/<a|b|c>-<size>.png and the SVG masters
//     180            apple-touch-icon
//     192, 512       manifest icons ("any")
//     192m, 512m     manifest icons, maskable (artwork inside the central 80 % safe zone)
//     1024           master for the native build (square, no transparency, no rounded corners:
//                    iOS applies its own mask)
// Nothing here is wired into the shipped pages: Will picks one first.
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const {load}=require('../../qa/fig/engine');
const OUT=path.join(__dirname,'..','..','icons');fs.mkdirSync(OUT,{recursive:true});
const PAPER='#f3ead6',INK='#1b1814',VERM='#d2432a';
const E=load('daily-13');
// one pose as a movement the engine can draw (A = B, so every phase is the pose)
const still=(pose,cam,pitch)=>({n:'icon',cyc:1,cam,pitch,A:pose,B:JSON.parse(JSON.stringify(pose))});
// At 60 px the app's own limb widths are hairlines, so the icon figure wears a heavier skin
// (same skeleton, same renderer): about 1.6 times the limb width.
const HEAVY={joint:4.8,mid:5.0,tip:4.2,upper:{w:5.6,at:0.4},fore:{w:5.0,at:0.3},thigh:{w:6.6,at:0.38},shin:{w:5.4,at:0.3},torso:{chest:1.04,waist:0.9,at:0.47,stroke:6.2},far:1};
// arms up and out, feet wide, facing the viewer: the finish, opened into a star so it fills a square
const UP=still({p:[0,58.5,0],yaw:22,tw:0,s:[3,3],hf:-6,aL:[180,-42,180,-48],aR:[180,42,180,48],ikFL:[-17,93,0],ikFR:[17,93,0],fpL:0,fpR:0,fyL:-28,fyR:28},-22,4);
// a deep side reach over a wide stance: one arm over the head, the other down the leg
const REACH=still({p:[5,59.5,0],yaw:22,tw:0,sl:30,st:18,s:[2,2],hf:6,aL:[180,22,180,46],aR:[0,20,0,14],ikFL:[-15,93,0],ikFR:[17,93,0],fpL:0,fpR:0,fyL:-25,fyR:25},-22,4);
// the figure fitted into the box [x0,y0,x1,y1] of a 100 x 100 icon, in one colour, gaps in `gap`
function figure(m,box,col,gap){
  const was=E.getSkin(),rp=E.INKR.RP;E.setSkin(HEAVY);E.INKR.RP=3.1;   // the pelvis corner grows with the thigh
  E.setCam(m);const j=E.solve(E.poseAt(m,0));let a=1e9,b=-1e9,c=1e9,d=-1e9;
  const R={head:6.2,haL:7,haR:7,toeL:5,toeR:5,ftL:4,ftR:4};
  for(const k in j){const q=E.project(j[k]),r=R[k]||2;a=Math.min(a,q.x-r);b=Math.max(b,q.x+r);c=Math.min(c,q.y-r);d=Math.max(d,q.y+r);}
  const sc=Math.min((box[2]-box[0])/(b-a),(box[3]-box[1])/(d-c));
  const fit={sc,ox:(box[0]+box[2])/2-(a+b)/2*sc,oy:box[3]-d*sc};
  const mk=E.inkFigure(m,fit,0,null,{id:'i',hatch:false});E.setSkin(was);E.INKR.RP=rp;
  return `<g style="--fi:${col};--ft:${col};--fp:${gap};--fo:${col}">${mk}</g>`;
}
// content(inner) -> the artwork; maskable shrinks the artwork (not the ground) to 80 %
const OPT={
  a:{name:'Figure',note:'The figure at the finish, cream on vermilion. One shape, two inks.',bg:VERM,
     art:()=>figure(UP,[9,10,91,90],PAPER,PAPER)},
  b:{name:'Seal',note:'The day seal: a vermilion disc turned 7 degrees, carrying an M, on ink. Three inks.',bg:INK,
     art:()=>`<g transform="rotate(-7 50 50)"><circle cx="50" cy="50" r="36" fill="${VERM}"/>`
       +`<path d="M35 64V37L50 55L65 37V64" fill="none" stroke="${PAPER}" stroke-width="8" stroke-linejoin="miter" stroke-miterlimit="6" stroke-linecap="butt"/></g>`},
  c:{name:'Figure and seal',note:'The ink figure reaching across the seal, on paper. Three inks.',bg:PAPER,
     art:()=>`<circle cx="56" cy="44" r="33" fill="${VERM}"/>`+figure(REACH,[9,9,91,91],INK,INK)},
};
const svg=(o,mask)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${o.bg}"/>`
  +(mask?`<g transform="translate(10 10) scale(0.8)">${o.art()}</g>`:o.art())+'</svg>';
(async()=>{
  const b=await chromium.launch();
  for(const k in OPT){const o=OPT[k];
    fs.writeFileSync(path.join(OUT,k+'.svg'),svg(o,false));fs.writeFileSync(path.join(OUT,k+'-maskable.svg'),svg(o,true));
    for(const [sz,mask] of [[180,0],[192,0],[512,0],[192,1],[512,1],[1024,0]]){
      const p=await b.newPage({viewport:{width:sz,height:sz},deviceScaleFactor:1});
      await p.setContent(`<body style="margin:0">${svg(o,mask).replace('<svg ','<svg width="'+sz+'" height="'+sz+'" style="display:block" ')}</body>`);
      await p.screenshot({path:path.join(OUT,`${k}-${sz}${mask?'m':''}.png`)});await p.close();}
    console.log('icon',k,o.name);}
  await b.close();
  fs.writeFileSync(path.join(OUT,'options.json'),JSON.stringify(Object.keys(OPT).map(k=>({k,name:OPT[k].name,note:OPT[k].note})),null,1)+'\n');
})().catch(e=>{console.error(e);process.exit(1);});
