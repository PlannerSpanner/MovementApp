// Per-movement phase sheets: the figure alone (the #fig SVG) at animation phases
// 0 / 0.25 / 0.5 / 0.75 (or --ph=a,b,c), one PNG strip per movement, so a pose can be
// checked BETWEEN its keyframes, not just at A and B (several Morning Flow movements
// failed mid-animation while their endpoints looked fine, 2026-10-12).
//   node tools/phases.js morning-flow [name-substring ...] [--ph=0,0.125,0.25,...] [--out=dir]
// Writes <out>/<app>-<slug>.png (default qa/screenshots/phases/). Not part of the
// gauntlet: it is the LOOK step for pose work.
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const {serve}=require('../qa/serve');
const args=process.argv.slice(2);
const app=args.find(a=>!a.startsWith('--'))||'morning-flow';
const filt=args.filter(a=>!a.startsWith('--')).slice(1).map(s=>s.toLowerCase());
const phArg=args.find(a=>a.startsWith('--ph='));
const PH=phArg?phArg.slice(5).split(',').map(Number):[0,0.25,0.5,0.75];
const outArg=args.find(a=>a.startsWith('--out='));
const OUT=outArg?outArg.slice(6):path.join(__dirname,'..','qa','screenshots','phases');
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const srv=await serve();
  const browser=await chromium.launch();
  const W=260;
  const ctx=await browser.newContext({viewport:{width:W*PH.length,height:W+30},deviceScaleFactor:2});
  const page=await ctx.newPage();
  await page.goto(`http://127.0.0.1:${srv.port}/${app}.html`);
  // stop the page's own loop from repainting, then paint each phase into its own copy
  await page.evaluate(()=>{window.drawFig=()=>{};});
  const names=await page.evaluate(()=>MOVES.map(m=>m.n));
  for(let i=0;i<names.length;i++){
    if(filt.length&&!filt.some(f=>names[i].toLowerCase().includes(f)))continue;
    await page.evaluate(i=>{started=true;go(segOfMove(i));},i);
    await page.waitForTimeout(80);
    await page.evaluate(([i,PH,W])=>{
      const m=MOVES[i]; placeGround(m,m.fit);
      const shadow=document.getElementById('shadow');
      const sh=`<ellipse cx="${shadow.getAttribute('cx')}" cy="${shadow.getAttribute('cy')}" rx="40" ry="${shadow.getAttribute('ry')}" fill="#e8dcc0" opacity="0.5"/>`;
      let sheet=document.getElementById('phsheet');
      if(!sheet){sheet=document.createElement('div');sheet.id='phsheet';
        sheet.style.cssText=`position:fixed;left:0;top:0;z-index:99;background:#fff;display:flex;font:12px sans-serif;color:#333`;
        document.body.appendChild(sheet);}
      sheet.innerHTML=PH.map(ph=>`<div style="width:${W}px"><div style="text-align:center;height:18px">${m.n} · ph ${ph}</div>`
        +`<svg viewBox="0 0 100 100" width="${W}" height="${W}">${sh}<g>${figMarkup(m,m.fit,ph)}</g></svg></div>`).join('');
    },[i,PH,W]);
    const slug=names[i].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const f=path.join(OUT,`${app}-${slug}.png`);
    await page.locator('#phsheet').screenshot({path:f});
    console.log('wrote',path.relative(process.cwd(),f));
  }
  await browser.close(); srv.close();
})().catch(e=>{console.error(e);process.exit(1);});
