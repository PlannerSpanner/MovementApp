// Phase sheets (gauntlet look step): every in-scope movement at phases 0, .125 ... .875
// (4x2 grid), exactly as the app camera frames it, plus two orthographic truth insets
// per cell (true side and true front) so a fault can be traced to pose vs camera.
//   node qa/fig/sheets.js [app ...] [--only=substr]
// Writes qa/screenshots/sheets/<app>-<nn>-<slug>.png (gitignored). The rubric lines marked LOOK in
// rubric.js are judged on these.
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const {load,IN_SCOPE,slug}=require('./engine');
const args=process.argv.slice(2);
const apps=args.filter(a=>!a.startsWith('--')); const only=(args.find(a=>a.startsWith('--only='))||'').slice(7).toLowerCase();
const OUT=path.join(__dirname,'..','screenshots','sheets'); fs.mkdirSync(OUT,{recursive:true});
const PH=[0,0.125,0.25,0.375,0.5,0.625,0.75,0.875];
// orthographic inset: stick skeleton only, coloured by side, in a body-anchored frame
function inset(E,m,ph,view){
  const pose=E.poseAt(m,ph), j=E.solve(pose);
  const yaw=(pose.yaw||0)*Math.PI/180, c=Math.cos(yaw), s=Math.sin(yaw);
  // un-yaw so "side" and "front" are relative to the body's own facing
  const loc=v=>{const x=v[0]-pose.p[0], z=v[2]-pose.p[2]; return [x*c-z*s, v[1], x*s+z*c];};
  const P={}; for(const k in j){const q=loc(j[k]); P[k]=view==='side'?[q[2],q[1]]:[q[0],q[1]];}
  const B=[['pelvis','chest'],['chest','neck'],['neck','head'],['shL','shR'],['hpL','hpR'],
    ['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],['hpL','knL'],['knL','ftL'],['ftL','toeL'],['hpR','knR'],['knR','ftR'],['ftR','toeR']];
  const sc=0.5, ox=50, oy=4;
  const X=p=>(ox+p[0]*sc).toFixed(1), Y=p=>(oy+p[1]*sc).toFixed(1);
  return `<svg viewBox="0 0 100 56" width="150" height="84" style="background:#f4f4f4"><line x1="0" y1="${(oy+93*sc)}" x2="100" y2="${(oy+93*sc)}" stroke="#bbb" stroke-width="0.6"/>`+
    B.map(([a,b])=>`<line x1="${X(P[a])}" y1="${Y(P[a])}" x2="${X(P[b])}" y2="${Y(P[b])}" stroke="${/L$/.test(b)&&b!=='shR'?'#d9822b':(/R$/.test(b)?'#1f5fbf':'#333')}" stroke-width="1.3" stroke-linecap="round"/>`).join('')+
    `<circle cx="${X(P.head)}" cy="${Y(P.head)}" r="2.6" fill="#333"/><text x="2" y="8" font-size="6" fill="#777">${view}</text></svg>`;
}
(async()=>{
  const browser=await chromium.launch();
  const page=await (await browser.newContext({viewport:{width:1320,height:900},deviceScaleFactor:1})).newPage();
  for(const app of (apps.length?apps:IN_SCOPE)){
    const E=load(app);
    for(let i=0;i<E.MOVES.length;i++){
      const m=E.MOVES[i]; if(only&&!m.n.toLowerCase().includes(only))continue;
      const cells=PH.map(ph=>`<div class="c"><div class="t">ph ${ph}</div>
        <svg viewBox="0 0 100 100" width="320" height="320"><line x1="0" y1="0" x2="0" y2="0"/>${E.figMarkup(m,m.fit,ph)}</svg>
        <div class="ins">${inset(E,m,ph,'side')}${inset(E,m,ph,'front')}</div></div>`).join('');
      await page.setContent(`<style>body{margin:0;font:13px sans-serif;background:#fff}h1{font-size:15px;margin:6px 8px}
        .g{display:grid;grid-template-columns:repeat(4,326px);gap:2px}.c{border:1px solid #ddd;background:#fdf7e9}
        .t{font-size:11px;color:#555;padding:2px 4px;background:#fff}.ins{display:flex;gap:4px;justify-content:center;background:#fff;padding:2px}
        svg{display:block}</style><div id="s"><h1>${E.label} ${i+1}. ${m.n} &nbsp; <small>cam ${m.cam||40} · cyc ${m.cyc}s · app camera above, body-frame side/front truth views below (orange = left, blue = right)</small></h1><div class="g">${cells}</div></div>`);
      const f=path.join(OUT,`${app}-${String(i+1).padStart(2,'0')}-${slug(m.n)}.png`);
      await page.locator('#s').screenshot({path:f});
      console.log('wrote',path.relative(process.cwd(),f));
    }
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
