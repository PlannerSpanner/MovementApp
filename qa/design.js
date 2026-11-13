// Direction A (letterpress) design rules, as a gauntlet step. docs/design/design-system.md.
//  pure   ink rendering of every movement (no legacy colour leaks, six parts, left limbs hatched
//         with real lines, tone fallback on the same silhouettes),
//         stage-shaped fit (everything inside the box, never smaller than the old square fit),
//         launcher helpers (week, month, daily line, next-up)
//  pages  setup is not dimmed, the work screen's word budget, tap targets, phase frame colours,
//         the finish logs a seal and stamps it, strength logs when a workout is fully checked,
//         the launcher shows the seal, dark mode swaps paper and ink
const fs=require('fs'),path=require('path'),vm=require('vm');
const {load}=require('./fig/engine');
const ROOT=path.join(__dirname,'..');
let fail=false;
const check=(name,ok,detail)=>{console.log(`${name.padEnd(64)} ${ok?'ok':'FAIL'}${ok||!detail?'':'  '+detail}`);if(!ok)fail=true;};

// ---------- pure: ink rendering + stage fit ----------
{let leaks=[],pat=[],tone=[],geo=[],inside=[],smaller=[],n=0;
 for(const app of ['morning-flow','daily-13','prenatal-stretch','prenatal-movement']){const E=load(app);
  const HEX=[E.INK,E.LIMB_L,E.TORSO,E.PROP];
  for(const m of E.MOVES){n++;
   for(const box of [{w:100,h:100},{w:100,h:132},{w:100,h:62}]){const fit=E.fitOf(m,null,box);
     for(let i=0;i<24;i++){const j=E.solve(E.poseAt(m,i/24));E.setCam(m);
       for(const k in j){const q=E.project(j[k]),x=q.x*fit.sc+fit.ox,y=q.y*fit.sc+fit.oy;
         if(x<-0.01||x>box.w+0.01||y<-0.01||y>box.h+0.01){inside.push(`${app}/${m.n} ${k} at ${x.toFixed(1)},${y.toFixed(1)} in ${box.w}x${box.h}`);break;}}}
     if(box.h>=100&&fit.sc<m.fit.sc*0.98)smaller.push(`${app}/${m.n} ${fit.sc.toFixed(2)} < ${m.fit.sc.toFixed(2)} in ${box.w}x${box.h}`);}
   const fit=E.fitOf(m,null,{w:100,h:120});
   for(const ph of [0,0.25,0.5,0.75]){
     const legacy=E.figMarkup(m,fit,ph),ink=E.figMarkup(m,fit,ph,null,{id:'t',hatch:true}),small=E.figMarkup(m,fit,ph,null,{id:'t',hatch:false});
     if(HEX.some(h=>ink.includes(h)||small.includes(h)))leaks.push(`${app}/${m.n}`);
     // six parts, each drawn once; the two left limbs carry engraved lines (real lines, no
     // pattern) when the figure is big enough, the two right limbs never do
     const grp=(mk,k)=>{const a=mk.indexOf('<g data-p="'+k+'">');return a<0?null:mk.slice(a,mk.indexOf('</g>',a));};
     const P6=['T','H','LL','LR','AL','AR'],once=mk=>P6.every(k=>mk.split('<g data-p="'+k+'">').length===2);
     const lines=g=>{const q=(g||'').split('<path').slice(1).filter(e=>/fill="none" stroke="var\(--fi\)"/.test(e));return q.length===1?(q[0].match(/M/g)||[]).length:(q.length?-1:0);};
     const want=fit.sc>=0.8;
     if(!once(ink)||!once(small)||ink.includes('<pattern')||['AL','LL'].some(k=>want?lines(grp(ink,k))<8:lines(grp(ink,k))!==0)||['AR','LR'].some(k=>lines(grp(ink,k))!==0))
       pat.push(`${app}/${m.n} ph ${ph}: parts ${once(ink)}, hatch lines AL ${lines(grp(ink,'AL'))} LL ${lines(grp(ink,'LL'))} AR ${lines(grp(ink,'AR'))} LR ${lines(grp(ink,'LR'))}, want hatch ${want}`);
     if(small.includes('<pattern')||!small.includes('var(--ft)')||['AL','LL'].some(k=>lines(grp(small,k))!==0))tone.push(`${app}/${m.n}`);
     // the hatched and the toned render are the same silhouettes: the first two layers of every limb
     const sil=mk=>['LL','LR','AL','AR'].map(k=>(grp(mk,k).match(/ d="[^"]+"/g)||[]).slice(0,2).join('|')).join('#');
     if(sil(ink)!==sil(small))geo.push(`${app}/${m.n} ph ${ph}`);}}}
 check(`ink render: no legacy colour in ${n} movements`,!leaks.length,leaks[0]);
 check('ink render: six parts once each; left limbs hatched with real lines, right limbs never',!pat.length,pat[0]);
 check('ink render: small figures fall back to the tone, no lines',!tone.length,tone[0]);
 check('ink render: hatched and toned figures share the same silhouettes',!geo.length,geo[0]);
 check('stage fit: every joint inside a square, a tall and a wide stage',!inside.length,inside[0]);
 check('stage fit: never more than 2% smaller than the old square fit',!smaller.length,smaller[0]);
 // a wide, low movement fills the WIDTH of a tall stage (Will, 2026-11-13: bird dog)
 const E=load('daily-13'),bd=E.MOVES.find(m=>m.n==='Bird dog'),f=E.fitOf(bd,null,{w:100,h:120});let a=1e9,b=-1e9;
 for(let i=0;i<24;i++){const j=E.solve(E.poseAt(bd,i/24));E.setCam(bd);for(const k in j){const x=E.project(j[k]).x*f.sc+f.ox;a=Math.min(a,x);b=Math.max(b,x);}}
 check(`stage fit: bird dog spans ${(b-a).toFixed(0)} of 100 units wide (was ${(()=>{let c=1e9,d=-1e9;for(let i=0;i<24;i++){const j=E.solve(E.poseAt(bd,i/24));E.setCam(bd);for(const k in j){const x=E.project(j[k]).x*bd.fit.sc+bd.fit.ox;c=Math.min(c,x);d=Math.max(d,x);}}return (d-c).toFixed(0);})()})`,b-a>=84);
}
// ---------- pure: launcher helpers ----------
{const js=fs.readFileSync(path.join(ROOT,'src','home.js'),'utf8'),core=js.slice(0,js.indexOf('// ---- DOM ----'));
 const H=vm.runInNewContext(core+'\n;({taoFor,weekOf,monthOf,nextUp,dayKey,doneOn})',{Math,Date,Array,Object,JSON});
 const tao=JSON.parse(fs.readFileSync(path.join(ROOT,'docs','design','tao-legge.json'),'utf8'));
 check('daily line: source is Legge 1891, public domain, 10+ lines',/Legge, 1891/.test(tao.source)&&/[Pp]ublic domain/.test(tao.source)&&tao.lines.length>=10);
 const L=tao.lines.map(l=>[l.text,l.ch]),d=new Date(2026,10,13,6,0),d2=new Date(2026,10,13,23,30),d3=new Date(2026,10,14,0,5);
 check('daily line: same all day, changes at local midnight',H.taoFor(d,L)===H.taoFor(d2,L)&&H.taoFor(d,L)!==H.taoFor(d3,L));
 const G={'2026-11-09':['daily-13'],'2026-11-13':['morning-flow'],'2026-11-15':[]},W=H.weekOf(G,d);
 check('week row: Monday first, 7 days, done and today flags',W.length===7&&W[0].key==='2026-11-09'&&W[0].done&&W[4].today&&W[4].done&&!W[6].done&&!W[1].done);
 const M=H.monthOf(G,2026,10,d);
 check('seal sheet: November 2026 starts on a Sunday (6 blanks), 30 days',M.lead===6&&M.days.length===30&&M.days[12].done&&M.days[12].today&&M.name==='November 2026');
 check('next up: the first daily timer not yet finished today',H.nextUp(G,d)==='daily-13'&&H.nextUp({},d)==='morning-flow'&&H.nextUp({'2026-11-13':['morning-flow','daily-13']},d)===null);
}
// ---------- pages ----------
const {chromium,devices}=require('playwright');
const {serve}=require('./serve');
(async()=>{
  const srv=await serve(),browser=await chromium.launch(),U=f=>`http://127.0.0.1:${srv.port}/${f}`;
  const OUT=path.join(__dirname,'screenshots','design');fs.mkdirSync(OUT,{recursive:true});
  for(const scheme of ['light','dark']){
    const ctx=await browser.newContext({...devices['iPhone 13'],colorScheme:scheme}),page=await ctx.newPage();
    const errs=[];page.on('pageerror',e=>errs.push(e.message));
    const bg=sel=>page.$eval(sel,e=>getComputedStyle(e).backgroundColor);
    const vars=await (async()=>{await page.goto(U('daily-13.html'));return page.evaluate(()=>{const c=getComputedStyle(document.documentElement);return {paper:c.getPropertyValue('--paper').trim(),ink:c.getPropertyValue('--ink').trim()};});})();
    check(`${scheme}: paper and ink are ${vars.paper} / ${vars.ink}`,scheme==='light'?(vars.paper==='#f3ead6'&&vars.ink==='#1b1814'):(vars.paper==='#151310'&&vars.ink==='#efe5cf'));
    await page.waitForTimeout(400);
    const frame0=await bg('#app');
    await page.screenshot({path:path.join(OUT,`daily-${scheme}-1ready.png`)});
    await page.click('#bMain');await page.waitForTimeout(250);
    check(`${scheme}: transition poster shows at the start`,await page.$eval('#poster',e=>getComputedStyle(e).display!=='none'&&/Deep squats/i.test(e.textContent)));
    await page.screenshot({path:path.join(OUT,`daily-${scheme}-2poster.png`)});
    await page.waitForTimeout(1900);
    check(`${scheme}: poster clears by itself`,await page.$eval('#poster',e=>getComputedStyle(e).display==='none'));
    // work screen
    const frameW=await bg('#app');
    check(`${scheme}: work frame is vermilion, the stage stays paper`,frameW!==frame0&&(await bg('#paper'))===frame0&&/^rgb\((210|226), (67|87), (42|60)\)$/.test(frameW),frameW);
    const words=await page.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden';};
      const out=[];const walk=n=>{if(n.nodeType===3){const t=n.textContent.trim();if(t&&vis(n.parentElement))out.push(t);}else if(n.nodeType===1&&n.id!=='sheet'&&n.id!=='poster'&&getComputedStyle(n).display!=='none')n.childNodes.forEach(walk);};
      walk(document.getElementById('paper'));return out;});
    const nonNum=words.filter(w=>!/^\d+:\d\d$/.test(w)),budget=nonNum.filter(w=>!/^(Pause|Skip)$/i.test(w)).join(' ').split(/\s+/).filter(Boolean);
    check(`${scheme}: work screen shows only time, Next, Pause, Skip (${nonNum.join(' | ')})`,budget.length<=5&&/^Next$/i.test(budget[0])&&nonNum.some(w=>/^Pause$/i.test(w))&&nonNum.some(w=>/^Skip$/i.test(w)),budget.join(' '));
    const sizes=await page.evaluate(()=>['bMain','bNext'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,Math.round(r.width),Math.round(r.height),Math.round(innerHeight-r.bottom)];}));
    check(`${scheme}: Pause and Skip are 56+ px tall in the bottom thumb row`,sizes.every(s=>s[2]>=56&&s[1]>=60&&s[3]<60),JSON.stringify(sizes));
    const numH=await page.$eval('#tm',e=>e.getBoundingClientRect().height/innerHeight);
    check(`${scheme}: numerals are ${(numH*100).toFixed(0)}% of the screen height`,numH>=0.09);
    check(`${scheme}: hatching on at phone size (both left limbs, no pattern)`,await page.$eval('#layer',e=>e.querySelectorAll('g[data-p]').length>=6&&e.querySelectorAll('g[data-p="AL"] path').length===4&&e.querySelectorAll('g[data-p="LL"] path').length===4&&e.querySelectorAll('g[data-p="AR"] path').length===2&&!e.querySelector('pattern')));
    await page.screenshot({path:path.join(OUT,`daily-${scheme}-3work.png`)});
    // form text behind a tap
    await page.click('#stage');await page.waitForTimeout(450);
    const sh=await page.evaluate(()=>{const s=document.getElementById('sheet').getBoundingClientRect(),t=document.getElementById('tm').getBoundingClientRect();return {open:s.bottom>40,clear:s.bottom<=t.top+2,txt:document.getElementById('cue').textContent.length};});
    check(`${scheme}: tapping the figure opens the form sheet, clear of the time`,sh.open&&sh.clear&&sh.txt>40,JSON.stringify(sh));
    await page.screenshot({path:path.join(OUT,`daily-${scheme}-4sheet.png`)});
    await page.click('#bClose');await page.waitForTimeout(350);
    // setup
    await page.evaluate(()=>{go(1);posterOff();});await page.waitForTimeout(500);
    const su=await page.evaluate(()=>{const l=document.getElementById('layer');let o=1;for(let e=l;e&&e.nodeType===1;e=e.parentElement){const c=getComputedStyle(e);o*=parseFloat(c.opacity);if(c.filter&&c.filter!=='none')o=0;}
      return {o,name:getComputedStyle(document.getElementById('mName')).display,cue:document.getElementById('mTarget').textContent.length,num:document.getElementById('mNum').textContent};});
    check(`${scheme}: setup preview is at full strength (opacity ${su.o})`,su.o===1);
    check(`${scheme}: setup shows the name bar and the setup cue`,su.name==='block'&&su.cue>10&&su.num==='GET SET UP');
    const frameS=await bg('#app');
    check(`${scheme}: setup frame is ochre`,/^rgb\((217|224), (154|165), (43|58)\)$/.test(frameS),frameS);
    const a0=await page.$eval('#layer',e=>e.innerHTML);await page.waitForTimeout(400);
    check(`${scheme}: setup preview is held still`,a0===await page.$eval('#layer',e=>e.innerHTML));
    await page.screenshot({path:path.join(OUT,`daily-${scheme}-5setup.png`)});
    // finish
    await page.evaluate(()=>finish());await page.waitForTimeout(300);
    const log0=await page.evaluate(()=>JSON.parse(localStorage.getItem('mvLog')||'{}'));
    const today=await page.evaluate(()=>dayKey(new Date()));
    check(`${scheme}: finishing logs today's seal for daily-13`,Array.isArray(log0[today])&&log0[today].includes('daily-13'));
    check(`${scheme}: today is still empty before the stamp`,await page.$$eval('#week .day.done',e=>e.length===0));
    await page.waitForTimeout(1500);
    check(`${scheme}: the seal is stamped on the week row`,await page.$$eval('#week .day.done.stamp',e=>e.length===1));
    check(`${scheme}: finish shows the ending line and a way home`,await page.evaluate(()=>document.getElementById('finLine').textContent.length>20&&getComputedStyle(document.getElementById('doneBox')).display!=='none'&&!!document.querySelector('#doneBox a[href="index.html"]')));
    await page.screenshot({path:path.join(OUT,`daily-${scheme}-6done.png`)});
    await page.evaluate(()=>finish());
    check(`${scheme}: finishing twice logs once`,(await page.evaluate(()=>JSON.parse(localStorage.getItem('mvLog'))))[today].length===1);
    // launcher reads it
    await page.goto(U('index.html'));await page.waitForTimeout(600);
    check(`${scheme}: launcher shows one solid seal this week`,await page.$$eval('#week .day.done',e=>e.length===1&&getComputedStyle(e[0]).borderTopStyle==='none'&&getComputedStyle(e[0]).backgroundColor!=='rgba(0, 0, 0, 0)'));
    check(`${scheme}: launcher offers Morning Flow first, marks Daily 13 done`,await page.evaluate(()=>document.getElementById('go-morning-flow').classList.contains('go')&&document.getElementById('go-daily-13').classList.contains('did')));
    check(`${scheme}: launcher shows the daily line and an idle figure`,await page.evaluate(()=>/Legge, 1891/.test(document.getElementById('taosrc').textContent)&&document.getElementById('tao').textContent.length>20&&document.getElementById('layer').innerHTML.length>500));
    await page.screenshot({path:path.join(OUT,`home-${scheme}.png`)});
    await page.click('#openSheet');await page.waitForTimeout(250);
    check(`${scheme}: seal sheet opens with the month and today's seal`,await page.evaluate(()=>getComputedStyle(document.getElementById('sheet')).display!=='none'&&document.querySelectorAll('#months .day.done').length===1));
    await page.screenshot({path:path.join(OUT,`sheet-${scheme}.png`)});
    // strength: a fully checked workout logs a seal
    await page.goto(U('strength.html'));await page.waitForTimeout(500);
    await page.evaluate(()=>{document.querySelectorAll('#listA .setbox').forEach((b,i,a)=>{if(i<a.length-1)b.click();});});
    const part=await page.evaluate(()=>JSON.parse(localStorage.getItem('mvLog')));
    await page.evaluate(()=>{const a=document.querySelectorAll('#listA .setbox');a[a.length-1].click();});
    const full=await page.evaluate(()=>JSON.parse(localStorage.getItem('mvLog')));
    check(`${scheme}: strength logs only when the workout is fully checked`,!part[today].includes('strength')&&full[today].includes('strength'));
    check(`${scheme}: strength figures are ink, left limbs in the tone`,await page.$eval('#ly-A-0',e=>e.innerHTML.includes('var(--ft)')&&e.innerHTML.includes('var(--fi)')&&!/#[0-9a-f]{6}/.test(e.innerHTML)));
    await page.screenshot({path:path.join(OUT,`strength-${scheme}.png`)});
    check(`${scheme}: no page errors`,!errs.length,errs[0]);
    await ctx.close();
  }
  await browser.close();srv.close();
  console.log(fail?'DESIGN FAIL':'DESIGN PASS');process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
