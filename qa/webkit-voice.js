// Safari-engine check (Playwright WebKit, iPhone viewport): load every speaking app,
// tap Start, and confirm (1) speechSynthesis.speak() was invoked synchronously inside
// the tap (transient user activation still active), (2) the deferred cue was spoken,
// (3) no page errors, (4) the timer advanced, (5) what the voice path logged.
// Not a real iPhone — desktop WebKit has no iOS audio-session policy — but it is the
// closest engine we can drive from CI.
const pw=require('playwright');
const ENGINES=(process.argv[2]||'webkit,chromium').split(',');
const {serve}=require('./serve');
const APPS=[['morning-flow','#bMain'],['prenatal-stretch','#bMain'],['prenatal-movement','#bMain'],
  ['daily-13','#bMain'],['hip-activation','#mainBtn']];
(async()=>{
  const srv=await serve();
  let fail=false;
  const check=(name,ok)=>{console.log(`${name.padEnd(64)} ${ok?'ok':'FAIL'}`);if(!ok)fail=true;};
  for(const eng of ENGINES){
  console.log(`
===== ${eng} =====`);
  const browser=await pw[eng].launch();
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'});
  await ctx.addInitScript(()=>{
    window.__spk=[];
    const rec=u=>window.__spk.push({t:u.text,v:u.voice&&u.voice.name,act:!!(navigator.userActivation&&navigator.userActivation.isActive)});
    const ss=window.speechSynthesis;
    if(ss){const orig=ss.speak.bind(ss);
      ss.speak=u=>{rec(u);try{return orig(u);}catch(e){window.__spk.push({err:String(e)});}};}
    else{ // engine has no Web Speech (Windows WebKit): stub it so the app's speak path still runs here
      window.__stub=true;
      window.SpeechSynthesisUtterance=function(t){this.text=t;this.volume=1;this.rate=1;this.pitch=1;};
      window.speechSynthesis={speak:rec,cancel(){},getVoices(){return [];},addEventListener(){},speaking:false,pending:false};}
  });
  for(const [app,btn] of APPS){
    const page=await ctx.newPage();
    const logs=[],errs=[];
    page.on('console',m=>{if(/\[voice\]/.test(m.text()))logs.push(m.text());});
    page.on('pageerror',e=>errs.push(String(e)));
    await page.goto(`http://127.0.0.1:${srv.port}/${app}.html`);
    await page.waitForTimeout(500);
    const hasSS=await page.evaluate(()=>window.__stub?'STUB':true);
    const nVoices=await page.evaluate(()=>window.speechSynthesis?speechSynthesis.getVoices().length:-1);
    await page.tap(btn);
    const primed=await page.evaluate(()=>window.__spk.slice());
    await page.waitForTimeout(1500);
    const all=await page.evaluate(()=>window.__spk.slice());
    const t0=await page.textContent(app==='hip-activation'?'#timeDisp':'#tm');
    await page.waitForTimeout(1300);
    const t1=await page.textContent(app==='hip-activation'?'#timeDisp':'#tm');
    console.log(`\n${app}: speechSynthesis=${hasSS} voices=${nVoices} | spoken=${JSON.stringify(all)} | log=${JSON.stringify(logs)}`);
    check(`${app}: speak() called synchronously in the Start tap`,primed.length>=1&&primed[0].act!==false);
    check(`${app}: cue spoken after Start`,all.some(s=>s.t&&s.t.trim().length>1));
    check(`${app}: no page errors`,errs.length===0);
    check(`${app}: timer running`,t0!==t1);
    if(errs.length)console.log('  errors:',errs);
    await page.close();
  }
  await browser.close();
  }
  srv.close();
  console.log(fail?'\nWEBKIT-VOICE FAIL':'\nWEBKIT-VOICE PASS');
  process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
