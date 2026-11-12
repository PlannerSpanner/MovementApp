// Authoring loop for the prototype rig: one sheet per movement, 8 phases at the movement's
// own camera, with true side / front / top insets, plus the rig's self-reported flags.
//   node proto/rig/dev.js <motion> [--cam=yaw,pitch]      -> proto/rig/out/dev-<motion>.png
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const Rig=require('./rig'),R2=require('./render2d');
const args=process.argv.slice(2),names=args.filter(a=>!a.startsWith('--'));
const camArg=(args.find(a=>a.startsWith('--cam='))||'').slice(6);
const T={bg:'#f6f1e6',body:'#4a4640',R:'#2f2c28',L:'#9a9186',edge:'#f6f1e6',floor:'#e4dccb',prop:'#b9a98b'};
const PH=[0,0.125,0.25,0.375,0.5,0.625,0.75,0.875];
(async()=>{
  delete require.cache[require.resolve('./motions')];const M=require('./motions');
  const OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch(),page=await (await b.newContext({viewport:{width:1320,height:900}})).newPage();
  for(const n of (names.length?names:Object.keys(M))){
    const m=M[n];if(!m){console.log('no motion',n);continue;}
    const cam=camArg?{yaw:+camArg.split(',')[0],pitch:+camArg.split(',')[1]}:m.cam;
    const fit=R2.fitOf(m,cam),all=new Set();
    const ins=[['side',{yaw:90,pitch:0}],['front',{yaw:0,pitch:0}],['top',{yaw:0,pitch:89.9}]];
    const ifit=ins.map(([,c])=>R2.fitOf(m,c));
    const cells=PH.map(ph=>{const r=R2.svg(m,ph,T,{cam,fit});r.flags.forEach(f=>all.add(`ph ${ph}: ${f}`));
      return `<div class="c"><div class="t">ph ${ph}${r.flags.length?' <b style="color:#c00">'+r.flags.length+' flag(s)</b>':''}</div><svg viewBox="0 0 100 100" width="320" height="320" style="background:${T.bg}">${r.svg}</svg>
      <div class="ins">${ins.map(([nm,c],i)=>`<svg viewBox="0 0 100 100" width="104" height="104" style="background:#f4f4f4">${R2.svg(m,ph,T,{cam:c,fit:ifit[i],edge:0.8}).svg}<text x="3" y="9" font-size="8" fill="#777">${nm}</text></svg>`).join('')}</div></div>`;}).join('');
    await page.setContent(`<style>body{margin:0;font:13px sans-serif}h1{font-size:15px;margin:6px 8px}.g{display:grid;grid-template-columns:repeat(4,326px);gap:2px}.c{border:1px solid #ddd}.t{font-size:11px;padding:2px 4px}.ins{display:flex;gap:2px;justify-content:center;padding:2px}svg{display:block}</style>
      <div id="s"><h1>RIG · ${m.name} <small>cam yaw ${cam.yaw} pitch ${cam.pitch}</small></h1><div class="g">${cells}</div></div>`);
    const f=path.join(OUT,`dev-${n}${camArg?'-'+camArg.replace(',','_'):''}.png`);await page.locator('#s').screenshot({path:f});
    console.log('wrote',path.relative(process.cwd(),f));[...all].forEach(x=>console.log('  FLAG',x));
  }
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
