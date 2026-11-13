// What a thicker figure skin can break, measured on every in-scope movement at 32 phases, for
// a skin profile against today's constant-width skin:
//   occlusion   a limb that is at least 3/4 covered by nearer parts for 1/8 of the cycle or
//               more under the profile, and was not under today's skin
//   overlap     left and right of the same limb drawn on top of each other for 1/4 of the cycle
//               or more under the profile, and not under today's skin
//   thumbnail   at Live Activity size (28 pt), the number of limbs that still read (at least
//               3.5 px long and at least half visible) at the WORST phase of the movement:
//               must not be lower than with today's skin
//   contrast    left-limb tone against every stage at least 3:1, and left against right at
//               least 2:1 (colour rule and stage list: theme.js)
// Geometry, not pixels: limbs are tested as the tapered shapes the engine draws (eng2.js
// limbHalf), the torso as its quad plus edge stroke, the head as its disc, in paint order.
//   node qa/fig/skin.js                    the approved profile (src/skin.json); exit 1 on any failure;
//                                          with no approved profile it reports "nothing to check"
//   node qa/fig/skin.js --preset="2"       dry run of a tuning-page preset (never fails the build)
//   node qa/fig/skin.js --file=path.json   dry run of an exported profile
// Report: qa/screenshots/fig/skin.md
const fs=require('fs'),path=require('path');
const {load,IN_SCOPE}=require('./engine'),{theme,contrast,STAGES}=require('./theme');
const NP=32,PT=28;
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):null;};
const SRC_SKIN=path.join(__dirname,'..','..','src','skin.json');
let skin=null,label='',gate=false;
if(arg('preset')){const {PRESETS}=require('../../proto/skin/presets');const k=Object.keys(PRESETS).find(n=>n.startsWith(arg('preset')));if(!k){console.log('no such preset');process.exit(1);}skin=PRESETS[k];label='preset "'+k+'" (dry run)';}
else if(arg('file')){const j=JSON.parse(fs.readFileSync(arg('file'),'utf8'));skin=j.skin||j;label=arg('file')+' (dry run)';}
else if(fs.existsSync(SRC_SKIN)){skin=JSON.parse(fs.readFileSync(SRC_SKIN,'utf8'));label='src/skin.json (approved profile)';gate=true;}
else{console.log('figure skin: no approved profile (src/skin.json); nothing to check');console.log('SKIN CHECK PASS');process.exit(0);}
const LIMBS=[['shL','elL','upper'],['elL','haL','fore'],['shR','elR','upper'],['elR','haR','fore'],['hpL','knL','thigh'],['knL','ftL','shin'],['hpR','knR','thigh'],['knR','ftR','shin']];
const PAIRS=[[0,2,'upper arms'],[1,3,'forearms'],[4,6,'thighs'],[5,7,'shins']];
const dSeg=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1e-9,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l2));return {d:Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y),t};};
const inPoly=(p,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;};
function measure(E,m,S){
  E.setSkin(S);E.setCam(m);const sc=m.fit.sc,out={hidden:Array(8).fill(0),merged:Array(4).fill(0),thumb:9,thumbPh:0};
  const tsw=((S&&S.torso&&S.torso.stroke)||2.6)*sc/2;
  for(let i=0;i<NP;i++){const ph=i/NP,j=E.solve(E.poseAt(m,ph)),P={};
    for(const k in j){const q=E.project(j[k]);P[k]={x:q.x*sc+m.fit.ox,y:q.y*sc+m.fit.oy,d:q.d};}
    const limbs=LIMBS.map(([a,b,seg])=>({a:P[a],b:P[b],seg,d:(P[a].d+P[b].d)/2}));
    limbs.forEach((L,i)=>{L.k=E.farK(L.d,limbs[i<4?(i+2)%4:4+(i-2)%4].d);});   // far-limb narrowing, as drawn
    const quad=[P.shL,P.shR,P.hpR,P.hpL],qd=(P.shL.d+P.shR.d+P.hpL.d+P.hpR.d)/4,hd=P.head.d+0.02,hr=E.L.hr*sc;
    const vis=limbs.map((L,li)=>{let free=0;
      for(let s=1;s<=9;s++){const t=s/10,p={x:L.a.x+(L.b.x-L.a.x)*t,y:L.a.y+(L.b.y-L.a.y)*t};let cov=false;
        if(qd>L.d&&(inPoly(p,quad)||quad.some((c,ci)=>dSeg(p,c,quad[(ci+1)%4]).d<tsw)))cov=true;
        if(!cov&&hd>L.d&&Math.hypot(p.x-P.head.x,p.y-P.head.y)<hr)cov=true;
        if(!cov)for(let oj=0;oj<8;oj++){if(oj===li)continue;const O=limbs[oj];if(O.d<=L.d)continue;const r=dSeg(p,O.a,O.b);if(r.d<E.limbHalf(O.seg,r.t,O.k)*sc){cov=true;break;}}
        if(!cov)free++;}
      return free/9;});
    vis.forEach((v,li)=>{if(v<0.25)out.hidden[li]++;});
    PAIRS.forEach(([a,b],pi)=>{const A=limbs[a],B=limbs[b];let sep=0,w=0;
      for(let s=1;s<=5;s++){const t=s/6;sep+=Math.hypot(A.a.x+(A.b.x-A.a.x)*t-(B.a.x+(B.b.x-B.a.x)*t),A.a.y+(A.b.y-A.a.y)*t-(B.a.y+(B.b.y-B.a.y)*t));w+=(E.limbHalf(A.seg,t,A.k)+E.limbHalf(B.seg,t,B.k))*sc;}
      if(sep<0.8*w)out.merged[pi]++;});
    const px=PT/100,read=limbs.filter((L,li)=>Math.hypot(L.a.x-L.b.x,L.a.y-L.b.y)*px>=3.5&&vis[li]>=0.5).length;
    if(read<out.thumb){out.thumb=read;out.thumbPh=ph;}}
  E.setSkin(null);return out;
}
const WF=path.join(__dirname,'skin-waivers.json'),waive=gate&&fs.existsSync(WF)?JSON.parse(fs.readFileSync(WF,'utf8')):{},used=new Set(),waived=[];
// a measured cost of the profile may be accepted with a written reason (skin-waivers.json);
// a waiver that no longer fires is itself a failure, so the list stays true
const flag=(id,msg)=>{if(waive[id]){used.add(id);waived.push(msg+' -- accepted: '+waive[id]);}else fails.push(msg+'  ['+id+']');};
const fails=[],md=['# Figure skin checks','','Profile: '+label+'. Generated by `node qa/fig/skin.js`. 32 phases per movement; today\'s skin is the baseline.','',
  '```','profile '+JSON.stringify(skin),'```',''];
// contrast
md.push('## Contrast on every stage','','| stage | left limb : stage | right limb : stage | torso : stage | left : right |','|---|---|---|---|---|');
STAGES.forEach(([n,bg])=>{const T=theme(bg),a=contrast(T.L,bg),b=contrast(T.R,bg),c=contrast(T.body,bg),d=contrast(T.L,T.R);
  md.push(`| ${n} ${bg} | ${a.toFixed(1)} | ${b.toFixed(1)} | ${c.toFixed(1)} | ${d.toFixed(1)} |`);
  if(a<3)flag('contrast:'+n,`contrast: left limb on ${n} is ${a.toFixed(2)}:1 (needs 3:1)`);
  if(d<2)flag('legibility:'+n,`legibility: left against right on ${n} is ${d.toFixed(2)}:1 (needs 2:1)`);});
// the pages as they ship (direction A, 2026-11-13): ink on paper, light and dark. The left side's
// small-size tone is a mix of ink into paper (--tk); it must hold 3:1 against the paper and
// 2:1 against the solid ink of the right side. Read from the page templates themselves.
if(gate){const ROOT=path.join(__dirname,'..','..'),{mix}=require('./theme');
  md.push('','## The shipped pages','','| template | scheme | paper | ink | left tone | tone : paper | tone : ink |','|---|---|---|---|---|---|---|');
  ['app_head.html','wk_head.html','home.html'].forEach(f=>{const fp=path.join(ROOT,'src',f);if(!fs.existsSync(fp)){flag('theme:'+f,'theme: '+f+' is missing');return;}
    const h=fs.readFileSync(fp,'utf8'),blocks=[['light',(h.match(/:root\{([^}]*)\}/)||[])[1]],['dark',(h.match(/prefers-color-scheme:dark\)\{:root\{([^}]*)\}/)||[])[1]]];
    blocks.forEach(([sch,css])=>{const v=k=>((css||'').match(new RegExp('--'+k+':([^;]+)'))||[])[1];
      const paper=v('paper'),ink=v('ink'),tk=parseFloat(v('tk'));
      if(!paper||!ink||!(tk>0)){flag('theme:'+f+':'+sch,`theme: cannot read --paper/--ink/--tk (${sch}) in ${f}`);return;}
      const tone=mix(paper,ink,tk/100),a=contrast(tone,paper),d=contrast(tone,ink);
      md.push(`| ${f} | ${sch} | ${paper} | ${ink} | ${tone} | ${a.toFixed(2)} | ${d.toFixed(2)} |`);
      if(a<3)flag('theme:'+f+':'+sch,`theme: left tone in ${f} (${sch}) is ${a.toFixed(2)}:1 against the paper (needs 3:1)`);
      if(d<2)flag('themeLR:'+f+':'+sch,`theme: left tone against the ink in ${f} (${sch}) is ${d.toFixed(2)}:1 (needs 2:1)`);});});}
md.push('','## Per movement','','| movement | limbs hidden (new) | pairs merged (new) | limbs that read at 28 pt, worst phase: today → profile |','|---|---|---|---|');
let nM=0,worst=9,worstN='';
for(const app of IN_SCOPE){const E=load(app,{noSkin:true});
  E.MOVES.forEach(m=>{nM++;const T=measure(E,m,null),S=measure(E,m,skin),key=`${app}/${m.n}`,hid=[],mer=[];
    LIMBS.forEach(([a,b],li)=>{if(S.hidden[li]>=NP/8&&T.hidden[li]<NP/8){hid.push(`${a}-${b}`);flag(`occlusion:${key}:${a}-${b}`,`occlusion: ${key}: ${a}-${b} is 3/4 covered for ${(100*S.hidden[li]/NP).toFixed(0)}% of the cycle with this profile (${(100*T.hidden[li]/NP).toFixed(0)}% today)`);}});
    PAIRS.forEach(([a,b,n],pi)=>{if(S.merged[pi]>=NP/4&&T.merged[pi]<NP/4){mer.push(n);flag(`overlap:${key}:${n}`,`overlap: ${key}: left and right ${n} merge for ${(100*S.merged[pi]/NP).toFixed(0)}% of the cycle with this profile (${(100*T.merged[pi]/NP).toFixed(0)}% today)`);}});
    if(S.thumb<T.thumb)flag(`thumbnail:${key}`,`thumbnail: ${key}: at ph ${S.thumbPh.toFixed(2)} only ${S.thumb} of 8 limbs read at ${PT} pt with this profile (${T.thumb} today)`);
    if(S.thumb<worst){worst=S.thumb;worstN=`${key} at ph ${S.thumbPh.toFixed(2)}`;}
    md.push(`| ${key} | ${hid.join(', ')||'none'} | ${mer.join(', ')||'none'} | ${T.thumb} → ${S.thumb}${S.thumb<T.thumb?' **worse**':''} (ph ${S.thumbPh.toFixed(2)}) |`);});}
Object.keys(waive).forEach(k=>{if(!used.has(k))fails.push('waiver no longer fires, remove it: '+k);});
md.splice(4,0,fails.length?'**'+fails.length+' failure(s):**':'**No failures.**',...fails.map(f=>'- '+f),'',waived.length?'**Accepted costs of this profile ('+waived.length+'):**':'',...waived.map(f=>'- '+f),'');
const O=path.join(__dirname,'..','screenshots','fig');fs.mkdirSync(O,{recursive:true});
fs.writeFileSync(path.join(O,'skin'+(gate?'':'-dryrun')+'.md'),md.join('\n'));
fails.forEach(f=>console.log('  FAIL  '+f));
console.log(`figure skin (${label}): ${nM} movements, ${STAGES.length} stages; worst thumbnail ${worst} of 8 limbs (${worstN}); ${waived.length} accepted cost(s), ${fails.length} failure(s)`);
console.log(fails.length?(gate?'SKIN CHECK FAIL':'SKIN DRY RUN: FAILURES'):(gate?'SKIN CHECK PASS':'SKIN DRY RUN: CLEAN'));
process.exit(gate&&fails.length?1:0);
