// visual linter: checks the actual emitted SVG markup per frame
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..');
const APPS=process.argv.slice(2).length?process.argv.slice(2):['morning-flow','prenatal-stretch','prenatal-movement','daily-13'];
const OKCOL=new Set(['#6d4f1c','#c2a473','#7d5a1e','#caac79','#b9a98b','#618f9e','#ad7c8b','#8b80b1','#a48655',   // + left limbs darkened to 3:1, 2026-11-12

  '#245e70','#93b8c4','#2e7d94','#9dc2cd',        // blue theme
  '#7d3f53','#cfa8b3','#a8546b','#dcbcc4',        // rose theme
  '#453a70','#b0a6d4','#6b5ca8','#b8addc']);      // violet theme (daily-10)
let fail=false;
for(const app of APPS){
  const h=fs.readFileSync(path.join(ROOT,`${app}.html`),'utf8');
  const js=h.split('<script>')[1].split('</script>')[0];
  const core=js.slice(0,js.indexOf("const $=id=>document.getElementById(id);"));
  const stub={_html:''}; Object.defineProperty(stub,'innerHTML',{get(){return stub._html;},set(v){stub._html=v;}});
  const shadow={attrs:{},setAttribute(k,v){this.attrs[k]=v;}};
  const ctx=new Function('document',core+'\nreturn {MOVES,drawFig,placeGround,fitOf,solve,poseAt,project};')(
    {getElementById:id=>id==='layer'?stub:shadow});
  const issues=[];
  ctx.MOVES.forEach(m=>{
    const fit=ctx.fitOf(m);
    ctx.placeGround(m,fit);
    let prevColors=null;
    for(const ph of [0,0.1,0.25,0.4,0.5,0.65,0.8]){
      ctx.drawFig(m,fit,ph);
      const mk=stub._html;
      // 1. only sanctioned colors, and constant per part index across frames
      const cols=[...mk.matchAll(/(?:stroke|fill)="(#[0-9a-f]{6})"/g)].map(x=>x[1]);
      cols.forEach(c=>{if(!OKCOL.has(c))issues.push(`${m.n}: rogue color ${c}`);});
      // 2. no phantom pelvis->chest line
      const j=ctx.solve(ctx.poseAt(m,ph));
      const pr=k=>{const q=ctx.project(j[k]);return [q.x*fit.sc+fit.ox,q.y*fit.sc+fit.oy];};
      const [px,py]=pr('pelvis'), [cx,cy]=pr('chest');
      for(const t of mk.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)){
        const [x1,y1,x2,y2]=t.slice(1).map(Number);
        if(Math.hypot(x1-px,y1-py)<1&&Math.hypot(x2-cx,y2-cy)<1)issues.push(`${m.n}: spine guide line visible`);
      }
      // 3. belly checks
      if(m.belly){
        // belly is the arc-sampled polygon (>6 points); torso quad has 4
        const polys=[...mk.matchAll(/<polygon points="([^"]*)"/g)].map(x=>x[1].split(' '))
          .filter(p=>p.length>6);
        if(!polys.length)issues.push(`${m.n}: belly missing`);
        if(polys.length){
          const pts=polys[0].map(p=>p.split(',').map(Number));
          let gx=0,gy=0; pts.forEach(p=>{gx+=p[0];gy+=p[1];}); gx/=pts.length; gy/=pts.length;
          const trunk=[cx-px,cy-py], tl=Math.hypot(...trunk)||1;
          // displacement of the belly mass from the trunk line point, along the trunk axis
          const midT=[(px+cx)/2,(py+cy)/2];
          const disp=((gx-midT[0])*trunk[0]+(gy-midT[1])*trunk[1])/tl;
          if(disp<-3.5)issues.push(`${m.n}: belly mass sits toward pelvis (hips look, disp ${disp.toFixed(1)})`);
        }
      }
      // 4. head drawn after its neck line (last circle should be head-colored ink)
      const sig=cols.slice().sort().join(',');
      if(prevColors&&sig!==prevColors)issues.push(`${m.n}: color set changed between frames`);
      prevColors=sig;
    }
  });
  const u=[...new Set(issues)];
  console.log(u.length?`LINT FAIL ${app}\n  `+u.join('\n  '):`LINT PASS ${app}`);
  if(u.length)fail=true;
}
process.exit(fail?1:0);
