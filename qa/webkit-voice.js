// Browser-engine check (Playwright WebKit + Chromium, iPhone viewport): load every speaking
// app, tap Start, and confirm (1) the REAL MP3 cue clips decode, (2) the first cue is
// scheduled on the audio clock just after the chime tail (0.8–1.05 s), (3) no page errors,
// (4) the timer advances, (5) the keep-alive media element plays inside the tap and pauses
// on Pause. Windows WebKit has no AudioContext at all, so the cue checks run in Chromium;
// WebKit still proves the page runs and the keep-alive fallback source plays.
// Not a real iPhone — the device run is Will's.
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
  console.log(`\n===== ${eng} =====`);
  const browser=await pw[eng].launch();
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'});
  await ctx.addInitScript(()=>{
    window.__spk=[];window.__media=[];window.__dec=[];
    const mp=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){const act=!!(navigator.userActivation&&navigator.userActivation.isActive);
      const el=this;window.__media.push({act,el,err:null});
      const p=mp.call(this);if(p&&p.catch)p.catch(e=>{window.__media.find(m=>m.el===el).err=String(e);});return p;};
    // cue clips: record every AudioBufferSourceNode.start(when) with the context clock at the call
    if(window.AudioBufferSourceNode){const st=AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(when){window.__spk.push({at:when,now:this.context.currentTime,dur:this.buffer&&this.buffer.duration});return st.apply(this,arguments);};}
    if(window.AudioContext){const dd=AudioContext.prototype.decodeAudioData;
      AudioContext.prototype.decodeAudioData=function(ab,ok,err){return dd.call(this,ab,b=>{window.__dec.push({ok:true,dur:b.duration});ok&&ok(b);},e=>{window.__dec.push({ok:false,err:String(e)});err&&err(e);});};}
  });
  for(const [app,btn] of APPS){
    const page=await ctx.newPage();
    const logs=[],errs=[];
    page.on('console',m=>{if(/\[voice\]/.test(m.text()))logs.push(m.text());});
    page.on('pageerror',e=>errs.push(String(e)));
    await page.goto(`http://127.0.0.1:${srv.port}/${app}.html`);
    await page.waitForTimeout(1200);          // load-time prefetch
    await page.tap(btn);
    await page.waitForTimeout(1500);
    const all=await page.evaluate(()=>window.__spk.slice());
    const dec=await page.evaluate(()=>window.__dec.slice());
    const t0=await page.textContent(app==='hip-activation'?'#timeDisp':'#tm');
    await page.waitForTimeout(1300);
    const t1=await page.textContent(app==='hip-activation'?'#timeDisp':'#tm');
    const hasAC=await page.evaluate(()=>!!(window.AudioContext||window.webkitAudioContext));
    console.log(`\n${app}: AudioContext=${hasAC} | cues scheduled=${JSON.stringify(all.map(s=>({at:+(s.at-s.now).toFixed(2),dur:+(s.dur||0).toFixed(1)})))} | decodes=${dec.length} ok=${dec.filter(d=>d.ok).length} | log=${JSON.stringify(logs)}`);
    if(hasAC){
      check(`${app}: real MP3 clips decode in this engine`,dec.length>=1&&dec.every(d=>d.ok));
      check(`${app}: first cue scheduled just after the chime tail (0.8–1.05 s)`,all.length>=1&&all[0].at-all[0].now>=0.8&&all[0].at-all[0].now<=1.05);
    } else console.log(`  (no AudioContext in this engine — cue scheduling not checked here)`);
    check(`${app}: no page errors`,errs.length===0);
    check(`${app}: timer running`,t0!==t1);
    const med=await page.evaluate(()=>window.__media.map(m=>({act:m.act,err:m.err,loop:m.el.loop,paused:m.el.paused,src:m.el.currentSrc.slice(0,40)})));
    const sess=await page.evaluate(()=>navigator.audioSession?navigator.audioSession.type:'n/a');
    const last=med[med.length-1]||{};
    // sample several times: ports with a broken loop pause for ~1 ms at end-of-media
    // before the app's restart hook replays, so a single instant can read paused
    let playing=0;for(let i=0;i<5;i++){if(await page.evaluate(()=>window.__media.length&&!window.__media[0].el.paused))playing++;await page.waitForTimeout(60);}
    console.log(`  media: play() calls=${med.length} rejected=${med.filter(m=>m.err).length} playing=${playing}/5 samples loop=${last.loop} src=${last.src} audioSession=${sess}`);
    check(`${app}: silent loop media element play() inside the tap`,med.length>=1&&med[0].act&&med[0].loop);
    check(`${app}: media element playing 1.5 s after Start`,med.length>=1&&playing>=3&&med.some(m=>!m.err));
    await page.tap(btn);   // Pause
    const pausedNow=await page.evaluate(()=>window.__media.length&&window.__media[0].el.paused);
    check(`${app}: media element paused on Pause`,pausedNow===true);
    if(errs.length)console.log('  errors:',errs);
    await page.close();
  }
  await browser.close();
  }
  // "Allow background music" ON (localStorage mvBgMusic=1), in Chromium: the keep-alive media element
  // must never play, the audio session type (where the API exists) must read 'transient', and the
  // cue clips must still decode and schedule. Also: the checkbox is rendered, checked, and persists.
  {const browser=await pw.chromium.launch();
   const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
   await ctx.addInitScript(()=>{try{localStorage.setItem('mvBgMusic','1');}catch(e){}
     window.__media=[];const mp=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__media.push(1);return mp.call(this);};
     window.__spk=[];if(window.AudioBufferSourceNode){const st=AudioBufferSourceNode.prototype.start;
       AudioBufferSourceNode.prototype.start=function(when){window.__spk.push({at:when,now:this.context.currentTime});return st.apply(this,arguments);};}
     Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true});});
   for(const [app,btn] of APPS){
     const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(String(e)));
     await page.goto(`http://127.0.0.1:${srv.port}/${app}.html`);await page.waitForTimeout(900);
     check(`${app}: bg-music checkbox rendered and checked from localStorage`,await page.evaluate(()=>{const c=document.getElementById('bgm');return !!c&&c.checked===true&&c.offsetParent!==null;}));
     await page.tap(btn);await page.waitForTimeout(1500);
     const r=await page.evaluate(()=>({media:window.__media.length,sess:navigator.audioSession.type,spk:window.__spk.length}));
     check(`${app}: bg-music ON → no keep-alive play(), session 'transient', cue scheduled`,r.media===0&&r.sess==='transient'&&r.spk>=1&&errs.length===0);
     await page.evaluate(()=>{const c=document.getElementById('bgm');c.checked=false;c.dispatchEvent(new Event('change'));});
     const r2=await page.evaluate(()=>({media:window.__media.length,sess:navigator.audioSession.type,stored:localStorage.getItem('mvBgMusic')}));
     check(`${app}: unticking mid-session → keep-alive plays, session 'playback', persisted '0'`,r2.media>=1&&r2.sess==='playback'&&r2.stored==='0');
     if(app==='daily-13'){await page.evaluate(()=>{const c=document.getElementById('bgm');c.checked=true;c.dispatchEvent(new Event('change'));});
       await page.screenshot({path:require('path').join(__dirname,'screenshots','bg-music-toggle.png'),fullPage:true});}
     if(errs.length)console.log('  errors:',errs);
     await page.close();
   }
   await browser.close();}
  // ?debug=1 diagnostics panel, rendered for real in Chromium, screenshot for the record
  {const browser=await pw.chromium.launch();
   const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
   const page=await ctx.newPage();
   await page.goto(`http://127.0.0.1:${srv.port}/daily-13.html?debug=1`);await page.waitForTimeout(1200);
   await page.tap('#bMain');await page.waitForTimeout(1800);
   const txt=await page.evaluate(()=>{const d=[...document.querySelectorAll('div')].find(e=>e.style.position==='fixed'&&e.textContent.includes('clips:'));return d?d.textContent:'';});
   require('fs').mkdirSync(require('path').join(__dirname,'screenshots'),{recursive:true});
   await page.screenshot({path:require('path').join(__dirname,'screenshots','debug-panel.png')});
   check('debug panel renders with clip stats + cue scheduling lines',/clips: \d+ texts/.test(txt)&&/cue#1 "[^"]+" at \+\d+\.\d+s/.test(txt));
   const plain=await page.goto(`http://127.0.0.1:${srv.port}/daily-13.html`).then(()=>page.evaluate(()=>[...document.querySelectorAll('div')].some(e=>e.style.position==='fixed'&&e.textContent.includes('clips:'))));
   check('no debug panel without ?debug=1',plain===false);
   await browser.close();}
  srv.close();
  console.log(fail?'\nWEBKIT-VOICE FAIL':'\nWEBKIT-VOICE PASS');
  process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
