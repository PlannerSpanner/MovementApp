// Side-by-side prototype strips for docs/figure-system-assessment.md.
// Rows:  A  current engine (eng2.js + shipped pose data, re-coloured for the theme so the
//           stick figure is judged at its best on every background)
//        B  prototype rig + 2D volume mannequin (SVG)
//        C  prototype rig + lit 3D mannequin (three.js / WebGL: stands in for RealityKit too,
//           the scene graph and the look are the same class of thing)
// Columns: phases 0, .125 ... .875.  One sheet per movement per theme, plus a thumbnail sheet.
//   node proto/compare.js            -> proto/out/strip-<motion>-<theme>.png, thumbs.png, themes.png
// The phase colours are PLACEHOLDERS (the redesign's palette does not exist yet): a pale,
// a dark and a saturated mid-tone version of work / setup / rest, which brackets the cases.
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const {serve}=require('../qa/serve');
const {load}=require('./audit/engine');
const Rig=require('./rig/rig'),R2=require('./rig/render2d'),M=require('./rig/motions');
const OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
const PH=[0,0.125,0.25,0.375,0.5,0.625,0.75,0.875];
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex=c=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>toHex(hex(a).map((v,i)=>v+(hex(b)[i]-v)*t));
const lum=h=>{const [r,g,b]=hex(h).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*r+0.7152*g+0.0722*b;};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
// one rule turns ANY background into a figure palette: dark figure on light grounds, light on dark
function theme(bg){const light=contrast(bg,'#1f1e1b')>=contrast(bg,'#ffffff');   // polarity by whichever contrasts more
  return light?{bg,body:'#3a3833',R:'#1f1e1b',L:mixc('#3a3833',bg,0.42),edge:bg,floor:mixc(bg,'#000000',0.09),prop:mixc(bg,'#000000',0.3),light}
              :{bg,body:'#ece9e2',R:'#ffffff',L:mixc('#ece9e2',bg,0.5),edge:bg,floor:mixc(bg,'#ffffff',0.1),prop:mixc(bg,'#ffffff',0.35),light};}
const THEMES={'work-light':'#e2f0e5','work-dark':'#11301f','setup-light':'#f7e8c9','setup-dark':'#3a2a0d',
  'rest-light':'#dde8f6','rest-dark':'#0f2238','work-vivid':'#2f9e6b','setup-vivid':'#e0a12e'};
const PAIRS=[['thread','morning-flow','Thread the needle'],['windmill','morning-flow','Bent rotation sweeps'],['sweeps','morning-flow','Arm sweeps with knee dip'],
  ['sideplank','daily-13','Side plank'],['ytw','daily-13','Prone Y-T-W raise']];
const ENG={};
const PT=require('./patched/engine'),PENG={};
// A2: the control. Current engine + three small patches + data-only fixes (proto/patched/engine.js)
function patchedSvg(app,name,ph,T){const file=app==='daily-13'?'d_daily.js':'d_flow.js',E=PENG[file]||(PENG[file]=PT.load(file)),m=E.MOVES.find(x=>x.n===name);
  if(!m._done){m._done=1;if(name==='Side plank')m._sw=16;if(PT.OVERRIDE[name])PT.OVERRIDE[name](m);m.fit=E.fitOf(m);}
  const map={'#6d4f1c':T.R,'#c2a473':T.L,'#7d5a1e':T.body,'#b9a98b':T.prop};
  return `<ellipse cx="50" cy="${name==='Side plank'?78:86}" rx="40" ry="${m.pitch?26:9}" fill="${T.floor}"/>`+E.figMarkup(m,m.fit,ph).replace(/#6d4f1c|#c2a473|#7d5a1e|#b9a98b/g,c=>map[c]);}
const HASPATCH=n=>!!PT.OVERRIDE[n];
function currentSvg(app,name,ph,T){const E=ENG[app]||(ENG[app]=load(app)),m=E.MOVES.find(x=>x.n===name);
  let mk=E.figMarkup(m,m.fit,ph);
  // src/ carries the amber baseline roles; map each role to the theme (identity roles unchanged)
  const map={'#6d4f1c':T.R,'#c2a473':T.L,'#7d5a1e':T.body,'#b9a98b':T.prop};
  mk=mk.replace(/#6d4f1c|#c2a473|#7d5a1e|#b9a98b/g,c=>map[c]);
  return `<ellipse cx="50" cy="86" rx="40" ry="9" fill="${T.floor}"/>`+mk;}
function caps3d(m,ph,T,fit,bold){const C=Rig.camera(m.cam),S=Rig.poseAt(m,ph);
  const P=v=>{const q=C.proj(v);return [q.x*fit.sc+fit.ox,q.y*fit.sc+fit.oy,q.d*fit.sc];};
  return Rig.capsules(S).map(k=>{const b=(bold&&k.side!=='C')?bold:1;return {a:P(k.a),b:P(k.b),ra:k.ra*fit.sc*b,rb:k.rb*fit.sc*b,col:k.side==='R'?T.R:k.side==='L'?T.L:T.body};});}
const floorSvg=(m,T,fit)=>{const C=Rig.camera(m.cam),q=C.proj([0,0,0]);const rx=70*fit.sc;
  return `<ellipse cx="${(q.x*fit.sc+fit.ox).toFixed(2)}" cy="${(q.y*fit.sc+fit.oy).toFixed(2)}" rx="${rx.toFixed(2)}" ry="${Math.max(0.6,rx*Math.abs(C.dir[1])).toFixed(2)}" fill="${T.floor}"/>`;};
(async()=>{
  const srv=await serve(),browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const gl=await (await browser.newContext({viewport:{width:400,height:400}})).newPage();
  gl.on('console',m=>{if(m.type()==='error')console.log('[3d]',m.text());});
  await gl.goto(`http://127.0.0.1:${srv.port}/proto/rig/render3d.html`);await gl.waitForFunction(()=>window.render3d);
  const r3=(caps,T,px)=>gl.evaluate(([c,l,px])=>window.render3d(c,l,px),[caps,T.light,px||340]);
  const page=await (await browser.newContext({viewport:{width:1500,height:900},deviceScaleFactor:1})).newPage();
  const only=process.argv.slice(2).filter(a=>!a.startsWith('--'));
  const themes=process.argv.includes('--all')?Object.keys(THEMES):['work-light','work-dark','setup-light','setup-dark'];
  for(const [key,app,name] of PAIRS){ if(only.length&&!only.includes(key)&&!only.includes('thumbs'))continue; if(only.length&&!only.includes(key))continue;
    const m=M[key],fit=R2.fitOf(m,m.cam);
    for(const tn of themes){const T=theme(THEMES[tn]);
      const row=async(label,fn)=>{let h=`<div class="lab">${label}</div>`;for(const ph of PH)h+=`<div class="cell" style="background:${T.bg}">${await fn(ph)}</div>`;return h;};
      const sv=inner=>`<svg viewBox="0 0 100 100" width="168" height="168">${inner}</svg>`;
      let html=`<div class="lab"></div>`+PH.map(p=>`<div class="ph">ph ${p}</div>`).join('');
      html+=await row('A · current engine',ph=>sv(currentSvg(app,name,ph,T)));
      if(HASPATCH(name))html+=await row('A2 · current engine<br>+ 3 patches + data',ph=>sv(patchedSvg(app,name,ph,T)));
      html+=await row('B · rig, 2D mannequin',ph=>sv(R2.svg(m,ph,T,{fit}).svg));
      html+=await row('C · rig, 3D mannequin',async ph=>`<div style="position:relative;width:168px;height:168px">${sv(floorSvg(m,T,fit))}<img src="${await r3(caps3d(m,ph,T,fit),T)}" width="168" height="168" style="position:absolute;left:0;top:0"></div>`);
      await page.setContent(`<style>body{margin:0;font:12px sans-serif;background:#fff}h1{font-size:14px;margin:6px 8px}
        .g{display:grid;grid-template-columns:118px repeat(8,168px);gap:2px;padding:0 6px 6px}.lab{display:flex;align-items:center;font-size:11px;color:#333;padding-right:4px}
        .ph{font-size:10px;color:#666;text-align:center}.cell{height:168px}svg{display:block}</style>
        <div id="s"><h1>${name} · ${tn} <small>(background ${T.bg})</small></h1><div class="g">${html}</div></div>`);
      const f=path.join(OUT,`strip-${key}-${tn}.png`);await page.locator('#s').screenshot({path:f});console.log('wrote',path.relative(process.cwd(),f));
    }
  }
  if(!only.length||only.includes('thumbs')){
    // ---- thumbnail sheet: Live Activity sized stills (one static image per movement is all iOS allows) ----
    const key={thread:0,windmill:0,sweeps:0.25,sideplank:0,ytw:0},sizes=[[44,'44 pt (lock screen)'],[24,'24 pt (Dynamic Island)']];
    let h='';
    for(const tn of ['work-light','work-dark','setup-vivid','rest-dark']){const T=theme(THEMES[tn]);
      for(const [px,lab] of sizes){
        h+=`<div class="lab">${tn}<br>${lab}</div>`;
        for(const [k,app,name] of PAIRS){const m=M[k],fit=R2.fitOf(m,m.cam,4),ph=key[k];
          const s=inner=>`<svg viewBox="0 0 100 100" width="${px}" height="${px}" style="background:${T.bg};border-radius:${px*0.22}px">${inner}</svg>`;
          const img=await r3(caps3d(m,ph,T,fit,1.35),T,px*3);
          h+=`<div class="tc">${s(currentSvg(app,name,ph,T))}${s(R2.svg(m,ph,T,{fit,bold:1.35,edge:1.6,floor:false}).svg)}<img src="${img}" width="${px}" height="${px}" style="background:${T.bg};border-radius:${px*0.22}px"></div>`;}
      }}
    await page.setContent(`<style>body{margin:0;font:11px sans-serif}.g{display:grid;grid-template-columns:130px repeat(5,190px);gap:10px 6px;padding:8px;align-items:center}
      .tc{display:flex;gap:8px;align-items:center}.hd{font-weight:600}.lab{color:#333}svg,img{display:block}</style>
      <div id="s"><div class="g"><div class="hd">theme · size</div>${PAIRS.map(p=>`<div class="hd">${p[2]}<br><span style="font-weight:400;color:#666">A current · B rig 2D · C rig 3D</span></div>`).join('')}${h}</div></div>`);
    // device pixel ratio 3, like the phone: the PNG is 3x; view at 33% for true size
    const p3=await (await browser.newContext({viewport:{width:1200,height:900},deviceScaleFactor:3})).newPage();
    await p3.setContent(await page.content());const f=path.join(OUT,'thumbs.png');await p3.locator('#s').screenshot({path:f});console.log('wrote',path.relative(process.cwd(),f));
    // ---- legibility sheet: one pose on all eight grounds + contrast numbers ----
    let t='',rows=[];
    for(const tn of Object.keys(THEMES)){const T=theme(THEMES[tn]),m=M.windmill,fit=R2.fitOf(m,m.cam);
      rows.push(`| ${tn} | ${T.bg} | ${contrast(T.body,T.bg).toFixed(1)} | ${contrast(T.R,T.bg).toFixed(1)} | ${contrast(T.L,T.bg).toFixed(1)} | ${contrast(T.R,T.L).toFixed(1)} |`);
      const s=inner=>`<svg viewBox="0 0 100 100" width="150" height="150" style="background:${T.bg}">${inner}</svg>`;
      t+=`<div class="lab">${tn}<br>${T.bg}</div><div class="tc">${s(currentSvg('morning-flow','Bent rotation sweeps',0,T))}${s(R2.svg(m,0,T,{fit}).svg)}<div style="position:relative;width:150px;height:150px;background:${T.bg}"><svg viewBox="0 0 100 100" width="150" height="150" style="position:absolute">${floorSvg(m,T,fit)}</svg><img src="${await r3(caps3d(m,0,T,fit),T)}" width="150" height="150" style="position:absolute;left:0;top:0"></div></div>`;}
    await page.setContent(`<style>body{margin:0;font:11px sans-serif}.g{display:grid;grid-template-columns:90px 470px 90px 470px;gap:6px;padding:8px;align-items:center}.tc{display:flex;gap:6px}svg,img{display:block}</style><div id="s"><div class="g">${t}</div></div>`);
    await page.locator('#s').screenshot({path:path.join(OUT,'themes.png')});console.log('wrote proto/out/themes.png');
    fs.writeFileSync(path.join(OUT,'contrast.md'),['| theme | background | torso:bg | right limbs:bg | left limbs:bg | right:left |','|---|---|---|---|---|---|',...rows].join('\n')+'\n');
    console.log(rows.join('\n'));
  }
  await browser.close();srv.close();
})().catch(e=>{console.error(e);process.exit(1);});
