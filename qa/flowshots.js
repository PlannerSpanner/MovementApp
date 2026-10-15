// Morning Flow visual QA (TR_ALL since 2026-08-26): one screenshot per movement
// mid-animation, plus the explicit 15s "get on the ground" transition before
// Cat-cows (static preview + authored setup text + state-trans styling). Numeric
// invariants live in tools/geo.js + qa/trans.js — these images are the LOOK step.
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const {serve}=require('./serve');
const OUT=path.join(__dirname,'screenshots');
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const srv=await serve();
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
  const page=await ctx.newPage();
  let fail=false;
  const check=(name,ok)=>{console.log(`${name.padEnd(58)} ${ok?'ok':'FAIL'}`);if(!ok)fail=true;};
  await page.goto(`http://127.0.0.1:${srv.port}/morning-flow.html`);
  const n=await page.evaluate(()=>MOVES.length);
  for(let i=0;i<n;i++){
    await page.evaluate(i=>{started=true;go(segOfMove(i));},i);
    await page.waitForTimeout(900);   // mid-animation
    const name=await page.evaluate(i=>MOVES[i].n,i);
    const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    await page.screenshot({path:path.join(OUT,`flow-m${String(i+1).padStart(2,'0')}-${slug}.png`),fullPage:true});
    const svg=await page.innerHTML('#layer');
    check(`m${i+1} ${name}: figure drawn`,svg.includes('<line')&&svg.includes('<circle'));
  }
  // the explicit ground transition: 15s gap before movement 9 (Cat-cows; 5s until 2026-10-15)
  await page.evaluate(()=>{started=true;go(SEGS.findIndex(s=>s.trans&&s.mi===8));});
  await page.waitForTimeout(400);
  check('ground gap header is GET SET UP',await page.textContent('#mNum')==='GET SET UP');
  check('ground gap is 15s',await page.evaluate(()=>SEGS.find(s=>s.trans&&s.mi===8).dur)===15);
  check('ground gap shows the authored setup script',
    await page.textContent('#mTarget')===await page.evaluate(()=>MOVES[8].setup));
  check('ground gap styling applied (state-trans)',
    ((await page.getAttribute('.wrap','class'))||'').includes('state-trans'));
  const f1=await page.innerHTML('#layer');
  await page.waitForTimeout(500);
  const f2=await page.innerHTML('#layer');
  check('ground gap figure holds the A keyframe (static preview)',f1===f2);
  await page.screenshot({path:path.join(OUT,'flow-transition-ground.png'),fullPage:true});
  await browser.close(); srv.close();
  console.log(fail?'FLOWSHOTS FAIL':`FLOWSHOTS PASS — ${n+1} screenshots in qa/screenshots/`);
  process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
