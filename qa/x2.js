// 2x duration toggle test (Birth Prep only): doubling before start doubles the clock
// and the wall-clock catch-up math; the toggle is inert once the session has started.
const {chromium}=require('playwright');
const {serve}=require('./serve');
(async()=>{
  const srv=await serve();
  const browser=await chromium.launch();
  const page=await browser.newPage();
  await page.clock.install();
  await page.goto(`http://127.0.0.1:${srv.port}/prenatal-movement.html`);
  let fail=false;
  const check=(name,ok)=>{console.log(`${name.padEnd(44)} ${ok?'ok':'FAIL'}`);if(!ok)fail=true;};
  const segs=await page.evaluate(()=>SEGS.map(s=>({dur:s.dur,trans:!!s.trans,mi:s.mi})));
  const durs=segs.filter(s=>!s.trans).map(s=>s.dur);
  check('toggle rendered', await page.locator('#x2b').count()===1);
  const mv=durs.reduce((a,b)=>a+b,0), tr=segs.filter(s=>s.trans).reduce((a,s)=>a+s.dur,0);
  check('x1 label includes gap time', await page.textContent('#x1b')===Math.round((mv+tr)/60)+' min');
  check('x2 label doubles movements only', await page.textContent('#x2b')===Math.round((mv*2+tr)/60)+' min');
  const t0=await page.textContent('#tm');
  await page.click('#x2b');
  const t1=await page.textContent('#tm');
  const mmss=s=>{const [m,x]=s.split(':').map(Number);return m*60+x;};
  check(`2x doubles first clock (${t0} -> ${t1})`, mmss(t1)===durs[0]*2);
  await page.click('#bMain');
  await page.clock.runFor(2000);
  await page.$eval('#x1b',e=>e.click());                 // must be inert now (and is off screen once started)
  await page.clock.runFor(400);
  const t2=await page.textContent('#tm');
  check(`toggle locked after start (@ ${t2})`, mmss(t2)>durs[0]);
  // background catch-up respects doubled durations AND undoubled gaps: jump to a
  // wall-clock time that lands inside movement 2 only if the gap stayed 8s
  await page.clock.fastForward((durs[0]*2+9)*1000);
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});
    document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(400);
  const elapsed=2.4+durs[0]*2+9+0.4;               // start+2.4s, then the jump
  let acc=0,cur=null;
  for(const s of segs){const d=s.trans?s.dur:s.dur*2;if(elapsed<acc+d){cur={...s,end:acc+d};break;}acc+=d;}
  const num=await page.textContent('#mNum');
  const tmc=await page.textContent('#tm');
  check(`catch-up lands in movement 2 (${num})`, !cur.trans&&cur.mi===1&&/MOVEMENT 2/.test(num));
  check(`gap not doubled (@ ${tmc})`, Math.abs(mmss(tmc)-(cur.end-elapsed))<=2);
  // control: no toggle on apps without the flag
  const p2=await browser.newPage();
  await p2.goto(`http://127.0.0.1:${srv.port}/morning-flow.html`);
  check('no toggle on other apps', await p2.locator('#x2b').count()===0);
  await browser.close(); srv.close();
  console.log(fail?'X2 FAIL':'X2 PASS');
  process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
